/**
 * Remote push-token capture: the glue.
 *
 * One job: when the notification permission is *already* granted, read this
 * install's Expo push token, persist it, and (only if an endpoint is
 * configured) POST it once. That is the whole feature.
 *
 * ## What this module deliberately does NOT do
 *
 * It is additive by construction — nothing else in the app changes behaviour
 * because it exists:
 *
 * - **Never prompts.** It reads `readNotificationPermissionState()` and stands
 *   down unless the answer is already `granted`. The permission moment stays
 *   owned by `NotificationPreferencesContext` / `RoutineDetailScreen`, and one
 *   grant still covers every family (§38).
 * - **Never schedules or cancels anything.** It does not touch the pending
 *   queue, so the nine local families and the shared iOS 64-pending budget are
 *   untouched.
 * - **Never throws and never blocks.** Every path is wrapped; the only return
 *   value is a status. Offline is the *normal* case for this app, so a failed
 *   upload is silent and simply retried on a later foreground.
 * - **Makes no network call at all** until `PUSH_REGISTRY_ENDPOINT` is set. The
 *   token is still captured locally, so the plumbing is verifiable before any
 *   data leaves the device.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { readNotificationPermissionState } from './permissionState';
import {
  EAS_PROJECT_ID,
  INSTALL_ID_KEY,
  PUSH_REGISTRY_ENDPOINT,
  PUSH_SYNC_TIMEOUT_MS,
  PUSH_TOKEN_KEY,
  PUSH_TOKEN_SYNC_KEY,
  buildDeviceRegistration,
  isPushRegistryConfigured,
  isUsableInstallId,
  makeInstallId,
  registrationFingerprint,
  shouldSyncRegistration,
} from './pushTokenPure';

/**
 * Outcome of one sync attempt. Every value is a normal, expected end state —
 * none of them is an error the user should ever see.
 *
 * - `not-granted` — permission is undetermined or refused. We stood down.
 * - `no-token` — no token available: a simulator, Expo Go, or a build whose
 *   APNs key / FCM service account is not configured on the EAS project.
 * - `captured` — token read and stored locally; no endpoint configured.
 * - `unchanged` — nothing a server cares about moved since the last upload.
 * - `synced` — the endpoint accepted the registration.
 * - `failed` — offline, timed out, or the endpoint rejected it. Retried later.
 */
export type PushTokenSyncStatus =
  | 'not-granted'
  | 'no-token'
  | 'captured'
  | 'unchanged'
  | 'synced'
  | 'failed';

export type PushTokenSyncResult = {
  status: PushTokenSyncStatus;
  /** The captured token, when there was one. */
  token: string | null;
};

/**
 * Collapses concurrent callers onto one attempt. The registrar fires on mount,
 * on every foreground, and on a token-rotation event — two of those can land in
 * the same tick, and two in-flight POSTs of the same row is pure waste.
 */
let inFlight: Promise<PushTokenSyncResult> | null = null;

/** Read one AsyncStorage key, tolerating a storage failure. */
async function read(key: string): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Write one AsyncStorage key; a failure only costs a redundant retry later. */
async function write(key: string, value: string): Promise<void> {
  try {
    await AsyncStorage.setItem(key, value);
  } catch {
    // Non-fatal by design: next launch re-captures and re-uploads.
  }
}

/**
 * The running bundle's version string.
 *
 * `expo-constants` is required **lazily** on purpose: it ships untranspiled ESM
 * that Jest cannot parse, so it must never enter a static module graph (same
 * rule as `utils/buildFingerprint.ts` and `KulParamparaExportScreen`).
 */
export function readAppVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Constants = require('expo-constants').default;
    const version = Constants?.expoConfig?.version;
    return typeof version === 'string' && version !== '' ? version : 'unknown';
  } catch {
    return 'unknown';
  }
}

/** Best-effort IANA time zone; `'unknown'` where the runtime has no Intl data. */
function readTimezone(): string {
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof zone === 'string' && zone !== '' ? zone : 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Our stable install id, minting it on first use from the supplied seed.
 *
 * Seeded by the first captured token, so this is only ever called once we have
 * one — which is also why the id cannot be minted before a device is
 * push-capable. Nothing else in the app depends on it existing.
 */
export async function getInstallId(seed: string, now: number = Date.now()): Promise<string> {
  const existing = await read(INSTALL_ID_KEY);
  if (isUsableInstallId(existing)) return existing.trim();
  const minted = makeInstallId(seed, now);
  await write(INSTALL_ID_KEY, minted);
  return minted;
}

/** The last token we captured, without doing any work to refresh it. */
export async function getCapturedPushToken(): Promise<string | null> {
  const token = await read(PUSH_TOKEN_KEY);
  return token && token.trim() !== '' ? token : null;
}

/** Ask expo for this install's Expo push token. `null` on any failure. */
async function readExpoPushToken(): Promise<string | null> {
  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId: EAS_PROJECT_ID });
    return typeof data === 'string' && data !== '' ? data : null;
  } catch {
    // Simulator, Expo Go, or missing APNs/FCM credentials on the EAS project.
    return null;
  }
}

/**
 * POST the registration, bounded by `PUSH_SYNC_TIMEOUT_MS`.
 *
 * Returns whether the endpoint accepted it — only an accepted upload is allowed
 * to advance the stored fingerprint, so a 500 is retried rather than forgotten.
 */
async function upload(endpoint: string, body: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PUSH_SYNC_TIMEOUT_MS);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function runSync(lang: string, now: number): Promise<PushTokenSyncResult> {
  // Cheapest gate first, and the one that makes this safe: we only ever act on
  // a grant somebody else already obtained.
  const { status } = await readNotificationPermissionState();
  if (status !== 'granted') return { status: 'not-granted', token: null };

  const token = await readExpoPushToken();
  if (!token) return { status: 'no-token', token: null };

  // Persist first. The token is worth having locally even with no endpoint —
  // it is what makes the capture verifiable on a real device before any upload
  // is switched on.
  await write(PUSH_TOKEN_KEY, token);

  if (!isPushRegistryConfigured(PUSH_REGISTRY_ENDPOINT)) {
    return { status: 'captured', token };
  }

  const registration = buildDeviceRegistration({
    installId: await getInstallId(token, now),
    token,
    platform: Platform.OS,
    appVersion: readAppVersion(),
    lang,
    timezone: readTimezone(),
  });

  const last = await read(PUSH_TOKEN_SYNC_KEY);
  if (!shouldSyncRegistration(last, registration)) return { status: 'unchanged', token };

  const accepted = await upload(PUSH_REGISTRY_ENDPOINT, JSON.stringify(registration));
  if (!accepted) return { status: 'failed', token };

  await write(PUSH_TOKEN_SYNC_KEY, registrationFingerprint(registration));
  return { status: 'synced', token };
}

/**
 * Capture this install's push token and sync it if anything changed.
 *
 * Never throws, never prompts, never schedules. Safe to call on every
 * foreground: an unchanged registration costs two AsyncStorage reads and one
 * token read, and no request.
 */
export async function syncPushToken(
  input: { lang: string; now?: number } = { lang: 'hi' }
): Promise<PushTokenSyncResult> {
  if (inFlight) return inFlight;
  const attempt = runSync(input.lang, input.now ?? Date.now())
    .catch((): PushTokenSyncResult => ({ status: 'failed', token: null }))
    .finally(() => {
      inFlight = null;
    });
  inFlight = attempt;
  return attempt;
}

/** Test seam: drop the in-flight guard between suites. */
export function __resetPushTokenSyncState(): void {
  inFlight = null;
}
