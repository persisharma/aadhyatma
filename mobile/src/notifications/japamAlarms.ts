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

/** Hard cap on simultaneously-configured Japam alarms. On the expo fallback
 *  tier an alarm can consume several pending-notification slots (one WEEKLY
 *  trigger per repeat day), so the scheduler additionally enforces
 *  `JAPAM_EXPO_SLOT_CAP` to leave room for the daily-verse rolling window
 *  inside iOS's 64-pending budget. */
export const MAX_JAPAM_ALARMS = 8;

/** Ceiling on pending-notification slots the expo fallback tier may occupy.
 *  Mirrors the vrat reminders' dedicated-budget approach (VRAT_REMINDER_CAP)
 *  so japam alarms can never crowd the daily-verse window out of iOS's
 *  64-pending cap. */
export const JAPAM_EXPO_SLOT_CAP = 24;

/** Weekday indices follow JS `Date#getDay()`: 0 = Sunday … 6 = Saturday. */
export const ALL_WEEKDAYS: readonly number[] = [0, 1, 2, 3, 4, 5, 6];

/** Snooze length shared by every tier (mirrors the Kotlin
 *  `JapamAlarmActionReceiver.SNOOZE_MS` so behaviour matches across tiers). */
export const SNOOZE_MINUTES = 5;

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
  /**
   * Which weekdays the alarm repeats on (`Date#getDay()` indices).
   * - `undefined` — every day (also the shape of pre-repeat alarms).
   * - non-empty subset — weekly on those days.
   * - `[]` — one-time: rings at the next occurrence of `time`, then the
   *   context auto-disables it (see `JapamAlarmsContext`).
   */
  repeatDays?: number[];
  /**
   * Local `YYYY-MM-DD` of one occurrence to skip ("skip next"). Cleared by
   * the context once the date has passed. Ignored for one-time alarms.
   */
  skipNextDate?: string;
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

function isRepeatDays(v: unknown): v is number[] {
  if (!Array.isArray(v)) return false;
  if (v.length > 7) return false;
  const seen = new Set<number>();
  for (const d of v) {
    if (typeof d !== 'number' || !Number.isInteger(d) || d < 0 || d > 6) {
      return false;
    }
    if (seen.has(d)) return false;
    seen.add(d);
  }
  return true;
}

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

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
    (a.label === undefined || typeof a.label === 'string') &&
    (a.repeatDays === undefined || isRepeatDays(a.repeatDays)) &&
    (a.skipNextDate === undefined ||
      (typeof a.skipNextDate === 'string' && DATE_KEY_RE.test(a.skipNextDate)))
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

/** Notification category (iOS) / action set carrying the Snooze button on
 *  the expo-notifications fallback tier. */
export const JAPAM_ALARM_CATEGORY = 'japam-alarm';
export const JAPAM_SNOOZE_ACTION_ID = 'japam-alarm-snooze';

export function snoozeIdentifierFor(alarmId: string): string {
  return `${JAPAM_ALARM_IDENTIFIER_PREFIX}:${alarmId}:snooze`;
}

/** Snooze one-shots are excluded from reconcile cancellation — they expire
 *  within `SNOOZE_MINUTES` on their own, and cancelling them would silently
 *  swallow a snooze the user just asked for. */
export function isSnoozeIdentifier(identifier: string): boolean {
  return identifier.endsWith(':snooze');
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

/** Local `YYYY-MM-DD` key for a Date — the shape `skipNextDate` stores. */
export function localDateKey(d: Date): string {
  const mm = `${d.getMonth() + 1}`.padStart(2, '0');
  const dd = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

/** True when the alarm is one-time (`repeatDays: []`). */
export function isOnceAlarm(
  alarm: Pick<JapamAlarm, 'repeatDays'>
): boolean {
  return Array.isArray(alarm.repeatDays) && alarm.repeatDays.length === 0;
}

/** True when the alarm rings every day (`repeatDays` absent or all seven). */
export function repeatsDaily(alarm: Pick<JapamAlarm, 'repeatDays'>): boolean {
  return alarm.repeatDays === undefined || alarm.repeatDays.length === 7;
}

/** Sorted-unique copy of a weekday selection (UI chips can toggle in any
 *  order; storage and comparisons want a canonical shape). */
export function normalizeRepeatDays(days: number[]): number[] {
  return [...new Set(days)]
    .filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)
    .sort((a, b) => a - b);
}

type FireSpec = Pick<JapamAlarm, 'time' | 'repeatDays' | 'skipNextDate'>;

/**
 * Next epoch-ms fire of an alarm at or after `now`, honouring `repeatDays`
 * and `skipNextDate`. One-time alarms (`repeatDays: []`) behave like daily
 * for THIS computation — they ring at the next occurrence of the time; not
 * recurring afterwards is the scheduler's concern.
 *
 * Bounded walk: a single-weekday alarm whose next occurrence is skipped is
 * 14 days out at most, so 15 iterations always suffice.
 */
export function nextAlarmFireTimestamp(
  alarm: FireSpec,
  now: Date = new Date()
): number {
  const days =
    alarm.repeatDays && alarm.repeatDays.length > 0
      ? alarm.repeatDays
      : null; // null = any day (daily and one-time alike)
  const candidate = new Date(now);
  candidate.setHours(alarm.time.hour, alarm.time.minute, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  for (let i = 0; i < 15; i += 1) {
    const dayOk = days === null || days.includes(candidate.getDay());
    const skipped =
      !isOnceAlarm(alarm) &&
      alarm.skipNextDate !== undefined &&
      alarm.skipNextDate === localDateKey(candidate);
    if (dayOk && !skipped) return candidate.getTime();
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate.getTime();
}

/**
 * The next `count` fires of an alarm, strictly increasing. One-time alarms
 * yield a single entry regardless of `count`. Used when a repeating alarm
 * must be armed as discrete one-shots (skip-next on tiers whose recurrence
 * cannot express a gap).
 */
export function nextAlarmFireTimestamps(
  alarm: FireSpec,
  count: number,
  now: Date = new Date()
): number[] {
  const out: number[] = [];
  let cursor = new Date(now);
  while (out.length < count) {
    const ts = nextAlarmFireTimestamp(alarm, cursor);
    out.push(ts);
    if (isOnceAlarm(alarm)) break;
    // `nextAlarmFireTimestamp` rolls forward on ties, so seeding the cursor
    // with the previous fire strictly advances.
    cursor = new Date(ts);
  }
  return out;
}

/**
 * How many discrete one-shots to arm while a skip-next is pending on a tier
 * whose recurrence can't express a one-day gap. Renewal depends on an app
 * foreground, so the window length is the safety margin before a standing
 * alarm goes quiet:
 *  - AlarmKit one-shots are cheap (no pending-notification budget) → a full
 *    week of cover.
 *  - expo one-shots spend the shared iOS 64-pending budget → a smaller
 *    window (still more than the skip itself needs).
 */
export const ALARMKIT_SKIP_ONESHOT_COUNT = 7;
export const EXPO_SKIP_ONESHOT_COUNT = 4;

/** True while an alarm's skip-next refers to today or a future date — the
 *  window during which recurrence-owning tiers must fall back to discrete
 *  one-shots. One-time alarms never skip. */
export function isSkipPending(
  alarm: Pick<JapamAlarm, 'repeatDays' | 'skipNextDate'>,
  now: Date
): boolean {
  return (
    !isOnceAlarm(alarm) &&
    alarm.skipNextDate !== undefined &&
    alarm.skipNextDate >= localDateKey(now)
  );
}

/**
 * The discrete one-shot fires covering a pending skip, with the identifier
 * suffix each slot must use ('' for the first so it keeps the alarm's base
 * identifier). Shared by the AlarmKit and expo tiers so the count, the
 * pendency predicate, and the `:occN` id scheme can never drift apart.
 */
export function skipOneshotPlan(
  alarm: FireSpec,
  count: number,
  now: Date = new Date()
): { suffix: string; fireAt: number }[] {
  return nextAlarmFireTimestamps(alarm, count, now).map((fireAt, i) => ({
    suffix: i === 0 ? '' : `:occ${i}`,
    fireAt,
  }));
}

const DAY_NAMES_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_NAMES_HI = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];

/** Single-letter chip labels for the editor's day row. */
export const DAY_LETTERS_EN = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
export const DAY_LETTERS_HI = ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'];

function sameDays(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((d, i) => d === b[i]);
}

/** Human summary of a repeat selection: Daily / Once / Weekdays / Weekends /
 *  a short day list. Expects `repeatDays` in canonical (sorted) form. */
export function repeatSummary(
  repeatDays: number[] | undefined,
  isHi: boolean
): string {
  if (repeatDays === undefined || repeatDays.length === 7) {
    return isHi ? 'प्रतिदिन' : 'Daily';
  }
  if (repeatDays.length === 0) return isHi ? 'एक बार' : 'Once';
  if (sameDays(repeatDays, [1, 2, 3, 4, 5])) {
    return isHi ? 'सोम–शुक्र' : 'Weekdays';
  }
  if (sameDays(repeatDays, [0, 6])) {
    return isHi ? 'शनि–रवि' : 'Weekends';
  }
  const names = isHi ? DAY_NAMES_HI : DAY_NAMES_EN;
  return repeatDays.map((d) => names[d]).join(', ');
}

/** "in 7 hr 25 min" / "7 घं 25 मि में" — countdown copy from `nowMs` to
 *  `fireAtMs`. Sub-minute gaps read "in <1 min" rather than "in 0 min". */
export function describeUntilFire(
  fireAtMs: number,
  nowMs: number,
  isHi: boolean
): string {
  const totalMin = Math.ceil(Math.max(0, fireAtMs - nowMs) / 60_000);
  const parts: string[] = [];
  const days = Math.floor(totalMin / (24 * 60));
  const hours = Math.floor((totalMin % (24 * 60)) / 60);
  const mins = totalMin % 60;
  if (days > 0) parts.push(isHi ? `${days} दिन` : `${days} d`);
  if (hours > 0) parts.push(isHi ? `${hours} घं` : `${hours} hr`);
  // Minutes are noise once the fire is days out.
  if (days === 0 && mins > 0) parts.push(isHi ? `${mins} मि` : `${mins} min`);
  if (parts.length === 0) parts.push(isHi ? '<1 मि' : '<1 min');
  const span = parts.join(' ');
  return isHi ? `${span} में` : `in ${span}`;
}

/** "06:30" (24 h) or "6:30 AM" (12 h). */
export function formatTimeLabel(time: TimeOfDay, hour12: boolean): string {
  const mm = `${time.minute}`.padStart(2, '0');
  if (!hour12) return `${`${time.hour}`.padStart(2, '0')}:${mm}`;
  const suffix = time.hour < 12 ? 'AM' : 'PM';
  const h = time.hour % 12 === 0 ? 12 : time.hour % 12;
  return `${h}:${mm} ${suffix}`;
}

/**
 * Whether the current locale prefers a 12-hour clock. Resolved via `Intl`
 * (available on Hermes) — reflects the device locale's convention. Defaults
 * to 24 h when `Intl` is unavailable, matching the app's prior display.
 */
export function prefers12HourClock(locale?: string): boolean {
  try {
    const opts = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
    }).resolvedOptions() as { hour12?: boolean; hourCycle?: string };
    if (typeof opts.hour12 === 'boolean') return opts.hour12;
    return opts.hourCycle === 'h11' || opts.hourCycle === 'h12';
  } catch {
    return false;
  }
}
