/**
 * Pure, side-effect-free helpers for the Japam alarm feature.
 *
 * Mirrors the shape of `./pure.ts` (daily-verse reminders) so both notification
 * flavours share the same testing conventions. Everything here is deterministic
 * and has no React Native or expo dependencies at runtime — so it can be unit
 * tested via `tsx` without bootstrapping the app.
 */

import type { TimeOfDay } from './pure';

/** Identifier prefix for every Japam-alarm notification we schedule. Lets us
 *  cancel just our own slots without touching daily-verse reminders. */
export const JAPAM_ALARM_IDENTIFIER_PREFIX = 'japam-alarm';

/** Hard cap on simultaneously-scheduled Japam alarms. Each daily-repeating
 *  alarm consumes one slot of the iOS 64-pending budget; this cap leaves room
 *  for the daily-verse rolling window to co-exist. */
export const MAX_JAPAM_ALARMS = 8;

export type JapamAlarm = {
  /** Stable id (uuid-ish). Used to address the notification request. */
  id: string;
  /** Which mantra to chant on this alarm; matches `JapamMantra.id`. */
  mantraId: string;
  /** Local time-of-day this alarm fires. */
  time: TimeOfDay;
  /** Per-alarm on/off; lets users keep a configured alarm but pause it. */
  enabled: boolean;
  /** Optional free-form label (e.g. "Brahmamuhurta"). */
  label?: string;
};

export type JapamAlarmPayload = {
  type: 'japam-alarm';
  alarmId: string;
  mantraId: string;
};

export function isJapamAlarmPayload(data: unknown): data is JapamAlarmPayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;
  return (
    d.type === 'japam-alarm' &&
    typeof d.alarmId === 'string' &&
    typeof d.mantraId === 'string'
  );
}

function isTimeOfDay(v: unknown): v is TimeOfDay {
  if (!v || typeof v !== 'object') return false;
  const t = v as { hour: unknown; minute: unknown };
  return (
    typeof t.hour === 'number' &&
    typeof t.minute === 'number' &&
    t.hour >= 0 &&
    t.hour < 24 &&
    t.minute >= 0 &&
    t.minute < 60
  );
}

function isJapamAlarm(v: unknown): v is JapamAlarm {
  if (!v || typeof v !== 'object') return false;
  const a = v as Record<string, unknown>;
  return (
    typeof a.id === 'string' &&
    a.id.length > 0 &&
    typeof a.mantraId === 'string' &&
    a.mantraId.length > 0 &&
    typeof a.enabled === 'boolean' &&
    isTimeOfDay(a.time) &&
    (a.label === undefined || typeof a.label === 'string')
  );
}

export function parseStoredAlarms(raw: string | null): JapamAlarm[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isJapamAlarm).slice(0, MAX_JAPAM_ALARMS);
  } catch {
    return [];
  }
}

/** Stable, lexicographic-friendly id without pulling in `uuid`. */
export function makeAlarmId(now: number = Date.now()): string {
  const rand = Math.floor(Math.random() * 1e9)
    .toString(36)
    .padStart(6, '0');
  return `${now.toString(36)}-${rand}`;
}

/** Sort alarms by time, then by id (deterministic tie-break for tests). */
export function sortAlarms(alarms: JapamAlarm[]): JapamAlarm[] {
  return [...alarms].sort((a, b) => {
    const at = a.time.hour * 60 + a.time.minute;
    const bt = b.time.hour * 60 + b.time.minute;
    if (at !== bt) return at - bt;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
}

export function notificationIdentifierFor(alarmId: string): string {
  return `${JAPAM_ALARM_IDENTIFIER_PREFIX}:${alarmId}`;
}

/** Next epoch-ms occurrence of the given time-of-day, at or after `now`. If
 *  the time has already passed today, returns tomorrow. Deterministic and
 *  testable; used by the Android native scheduler which fires single one-shot
 *  alarms and re-arms itself for the next day. */
export function nextFireTimestamp(
  time: TimeOfDay,
  now: Date = new Date()
): number {
  const candidate = new Date(now);
  candidate.setHours(time.hour, time.minute, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.getTime();
}
