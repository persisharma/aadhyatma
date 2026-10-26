/**
 * Daily device heartbeat — the pure core.
 *
 * Answers three product questions the once-only push registration cannot:
 *  - how many devices open the app on a given day (distinct `installId` per
 *    `dayKey` ⇒ DAU),
 *  - how many have the OS notification permission in each state (the full
 *    denominator, including the devices that never register because they are
 *    `denied`/`undetermined`),
 *  - how many have at least one japam alarm enabled.
 *
 * Every function here is pure; the platform reads and the POST live in the glue
 * (`deviceHeartbeat.ts`). It carries **no PII** by construction: only an opaque
 * install id, platform, app version, permission state, and an alarm count — no
 * name, birth detail, location, scripture, or practice content.
 *
 * ## Server contract
 *
 * `POST <endpoint>`, `content-type: application/json`,
 * `authorization: Bearer <key>` (the same device-registration key), body =
 * `HeartbeatBody`. The status code is the whole protocol, classified exactly
 * like the push registrar (`classifyUploadResponse`): 2xx accepted, 5xx/429/
 * 408/425 retryable, any other 4xx rejected. Response bodies are ignored.
 */

import { resolveApiKey, resolvePushEndpoint } from './pushTokenPure';

export type HeartbeatPermission = 'granted' | 'denied' | 'undetermined';

export type HeartbeatBody = {
  /** Opaque, stable per install. Shared with the push registrar's install id. */
  installId: string;
  platform: 'ios' | 'android';
  appVersion: string;
  notifPermission: HeartbeatPermission;
  /** `false` ⇒ the OS will not prompt again (Settings is the only path). */
  notifCanAskAgain: boolean;
  /** At least one japam alarm row is enabled. */
  alarmEnabled: boolean;
  /** How many japam alarm rows are enabled. */
  alarmCount: number;
  /** Local calendar day the open happened, `YYYY-MM-DD`. DAU keys on this. */
  dayKey: string;
};

/** Default endpoint; the env var (`resolveHeartbeatEndpoint`) still wins. */
export const HEARTBEAT_ENDPOINT: string | null = 'https://api.incardible.in/api/mobile/heartbeat';

/** Build-time env var naming the heartbeat endpoint. */
export const HEARTBEAT_ENDPOINT_ENV_VAR = 'EXPO_PUBLIC_HEARTBEAT_URL';

/** AsyncStorage key for the last successfully sent fingerprint (dedup). */
export const HEARTBEAT_FINGERPRINT_KEY = '@vedansh/heartbeat-fingerprint';

/**
 * AsyncStorage key the japam alarms live under. Mirrors `STORAGE_KEY` in
 * `JapamAlarmsContext.tsx`; `deviceHeartbeatPure.test.ts` pins the pair so they
 * cannot drift silently.
 */
export const JAPAM_ALARMS_KEY = '@vedansh/japam-alarms';

export const HEARTBEAT_TIMEOUT_MS = 8000;

/** Normalise an arbitrary string onto a known permission state. */
export function toHeartbeatPermission(status: string | null | undefined): HeartbeatPermission {
  return status === 'granted' || status === 'denied' ? status : 'undetermined';
}

/** Local `YYYY-MM-DD` for the day DAU keys on. Uses the device's own calendar. */
export function dayKeyFromDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Count the enabled japam alarm rows from the raw persisted JSON, tolerating
 * any shape — storage can hold anything a past build wrote, and a parse failure
 * must read as "no enabled alarms", never throw.
 */
export function countEnabledAlarms(rawJapamAlarms: string | null | undefined): number {
  if (!rawJapamAlarms) return 0;
  try {
    const parsed: unknown = JSON.parse(rawJapamAlarms);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter(
      (row) => typeof row === 'object' && row !== null && (row as { enabled?: unknown }).enabled === true
    ).length;
  } catch {
    return 0;
  }
}

/**
 * The dedup fingerprint. A heartbeat is re-sent when the day rolls over **or**
 * any reported state changes — so a permission grant or a new alarm the same
 * day is captured, without re-sending an identical row on every foreground.
 */
export function heartbeatFingerprint(body: HeartbeatBody): string {
  return [
    body.dayKey,
    body.notifPermission,
    body.notifCanAskAgain ? '1' : '0',
    body.alarmEnabled ? '1' : '0',
    body.alarmCount,
    body.appVersion,
    body.platform,
  ].join('|');
}

/** Send only when the fingerprint moved since the last accepted upload. */
export function shouldSendHeartbeat(lastFingerprint: string | null | undefined, current: string): boolean {
  return lastFingerprint !== current;
}

/** Endpoint resolution: the env var wins over the baked-in default. */
export function resolveHeartbeatEndpoint(fromEnv: string | undefined | null): string | null {
  return resolvePushEndpoint(fromEnv, HEARTBEAT_ENDPOINT);
}

/** Bearer key resolution — reuses the device-registration key's rules. */
export function resolveHeartbeatApiKey(fromEnv: string | undefined | null): string | null {
  return resolveApiKey(fromEnv);
}
