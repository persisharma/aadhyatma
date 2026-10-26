/**
 * Daily device heartbeat — the glue.
 *
 * One job: once per local day (or when the reported state changes), POST a
 * tiny, PII-free snapshot of this install so the backend can count daily opens,
 * notification-permission states, and enabled japam alarms. See
 * `deviceHeartbeatPure.ts` for the server contract.
 *
 * ## How it differs from `pushToken.ts`
 *
 * The push registrar only acts on an *already granted* permission, because you
 * cannot push to a device that refused. The heartbeat must run **regardless of
 * permission** — the whole point is to measure the denied/undetermined
 * denominator too. So it is a sibling, not an extension, and it never reads or
 * needs a push token.
 *
 * Like the registrar it is additive by construction: it never prompts, never
 * schedules, never throws, and makes no request at all until both an endpoint
 * and an API key are configured. An unconfigured or offline build still works;
 * the heartbeat is simply skipped or retried on a later foreground.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { readNotificationPermissionState } from './permissionState';
import {
  INSTALL_ID_KEY,
  PUSH_SYNC_TIMEOUT_MS,
  isUsableInstallId,
  makeInstallId,
  runUploadWithRetry,
} from './pushTokenPure';
import {
  HEARTBEAT_FINGERPRINT_KEY,
  JAPAM_ALARMS_KEY,
  countEnabledAlarms,
  dayKeyFromDate,
  heartbeatFingerprint,
  resolveHeartbeatApiKey,
  resolveHeartbeatEndpoint,
  shouldSendHeartbeat,
  toHeartbeatPermission,
  type HeartbeatBody,
} from './deviceHeartbeatPure';

/**
 * Outcome of one heartbeat attempt. Every value is a normal end state — none is
 * an error the user should ever see.
 *
 * - `skipped` — not a mobile platform (web/test shell): nothing to report.
 * - `unchanged` — the fingerprint has not moved since the last accepted send.
 * - `captured` — nothing to send to: no endpoint or no key configured.
 * - `sent` — the endpoint accepted the heartbeat.
 * - `failed` — offline, timed out, or 5xx after the retries. Fingerprint left
 *   unset, so a later foreground tries again.
 * - `rejected` — a definitive 4xx. Not retried, not recorded; a server-side fix
 *   is picked up on a later foreground.
 */
export type DeviceHeartbeatStatus =
  | 'skipped'
  | 'unchanged'
  | 'captured'
  | 'sent'
  | 'failed'
  | 'rejected';

export type DeviceHeartbeatResult = { status: DeviceHeartbeatStatus };

/** Collapse concurrent callers onto one in-flight attempt. */
let inFlight: Promise<DeviceHeartbeatResult> | null = null;

async function read(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Non-fatal: a later foreground re-sends.
  }
}

/**
 * This install's app version. Lazy `require` because `expo-constants` is kept
 * out of static module graphs (Jest cannot parse its ESM — see
 * `pushTokenPure.ts`); mirrors `RatingPromptContext`.
 */
function readAppVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const version = require('expo-constants')?.default?.expoConfig?.version;
    return typeof version === 'string' && version !== '' ? version : 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Our stable install id — shared with the push registrar, minted here if the
 * device never granted notifications (so no push token ever seeded it). */
async function resolveInstallId(now: number): Promise<string> {
  const existing = await read(INSTALL_ID_KEY);
  if (isUsableInstallId(existing)) return existing.trim();
  const minted = makeInstallId(`${now}-${Math.random()}`, now);
  await write(INSTALL_ID_KEY, minted);
  return minted;
}

async function attemptUpload(endpoint: string, body: string, apiKey: string): Promise<number | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PUSH_SYNC_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body,
      signal: controller.signal,
    });
    return typeof response.status === 'number' ? response.status : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runHeartbeat(now: number): Promise<DeviceHeartbeatResult> {
  const platform = Platform.OS;
  if (platform !== 'ios' && platform !== 'android') return { status: 'skipped' };

  const permission = await readNotificationPermissionState();
  const alarmCount = countEnabledAlarms(await read(JAPAM_ALARMS_KEY));
  const installId = await resolveInstallId(now);

  const body: HeartbeatBody = {
    installId,
    platform,
    appVersion: readAppVersion(),
    notifPermission: toHeartbeatPermission(permission.status),
    notifCanAskAgain: permission.canAskAgain,
    alarmEnabled: alarmCount > 0,
    alarmCount,
    dayKey: dayKeyFromDate(new Date(now)),
  };

  const fingerprint = heartbeatFingerprint(body);
  if (!shouldSendHeartbeat(await read(HEARTBEAT_FINGERPRINT_KEY), fingerprint)) {
    return { status: 'unchanged' };
  }

  const endpoint = resolveHeartbeatEndpoint(process.env.EXPO_PUBLIC_HEARTBEAT_URL);
  const apiKey = resolveHeartbeatApiKey(process.env.EXPO_PUBLIC_DEVICE_REGISTRATION_API_KEY);
  if (endpoint === null || apiKey === null) return { status: 'captured' };

  const payload = JSON.stringify(body);
  const { outcome } = await runUploadWithRetry({
    attempt: () => attemptUpload(endpoint, payload, apiKey),
    sleep,
    installId,
  });

  if (outcome === 'rejected') return { status: 'rejected' };
  if (outcome !== 'accepted') return { status: 'failed' };

  await write(HEARTBEAT_FINGERPRINT_KEY, fingerprint);
  return { status: 'sent' };
}

/**
 * Report this install's daily heartbeat if the day rolled over or its state
 * changed. Never throws, never prompts, never schedules. Safe on every
 * foreground: an unchanged day costs a few AsyncStorage reads and no request.
 */
export async function sendDeviceHeartbeat(input: { now?: number } = {}): Promise<DeviceHeartbeatResult> {
  if (inFlight) return inFlight;
  const attempt = runHeartbeat(input.now ?? Date.now())
    .catch((): DeviceHeartbeatResult => ({ status: 'failed' }))
    .finally(() => {
      inFlight = null;
    });
  inFlight = attempt;
  return attempt;
}

/** Test seam: drop the in-flight guard between suites. */
export function __resetDeviceHeartbeatState(): void {
  inFlight = null;
}
