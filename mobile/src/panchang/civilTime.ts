/**
 * The civil clock of the Panchang — one policy for "which date" and "what time".
 *
 * Every Panchang location is in India (`locations.ts`, the pincode directory,
 * and GPS fixes snap to one of them), so a civil date and a clock time always
 * mean India's, never the phone's. A phone set to another zone must show the
 * same day, the same festival dates and the same clock times as a phone in
 * India at the same instant.
 *
 * Two kinds of `Date` travel through the Panchang code and must not be mixed:
 *
 * - a LABEL names a civil date. The whole app builds these as
 *   `new Date(y, m, d)` and reads them back with `getFullYear/getMonth/getDate`.
 *   The device zone is only the container; the numbers are the civil date.
 * - an INSTANT is a moment (sunrise, a tithi end, "now"). Reading ITS
 *   `getHours()` or `getDate()` gives the PHONE's clock, which is wrong on any
 *   phone outside India. Use the helpers below instead.
 *
 * Pure and dependency-free: the engine imports it, and the engine is on the
 * launch graph.
 */

export const PANCHANG_CIVIL_TIME_ZONE = 'Asia/Kolkata';

/** IST has been UTC+5:30 with no daylight saving since 1945, so the zone needs
 * no `Intl` — a year scan converts thousands of instants, and constructing a
 * formatter on Hermes costs milliseconds each. */
export const PANCHANG_CIVIL_OFFSET_MS = 330 * 60_000;

export type CivilFields = {
  year: number;
  /** 0-based, like `Date#getMonth`. */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** 0 = Sunday, like `Date#getDay`. */
  weekday: number;
};

/** The wall clock an INSTANT shows at the Panchang location. */
export function civilFieldsOf(instant: Date): CivilFields {
  const shifted = new Date(instant.getTime() + PANCHANG_CIVIL_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
    second: shifted.getUTCSeconds(),
    weekday: shifted.getUTCDay(),
  };
}

/** The LABEL of the civil date an INSTANT falls on. */
export function civilDateOf(instant: Date): Date {
  const { year, month, day } = civilFieldsOf(instant);
  return new Date(year, month, day);
}

/** The INSTANT at which the civil date named by a LABEL begins (IST midnight). */
export function civilDayStart(label: Date): Date {
  return new Date(Date.UTC(label.getFullYear(), label.getMonth(), label.getDate()) - PANCHANG_CIVIL_OFFSET_MS);
}

/** True when an INSTANT falls on the civil date named by a LABEL. */
export function isOnCivilDay(instant: Date, label: Date): boolean {
  const { year, month, day } = civilFieldsOf(instant);
  return year === label.getFullYear() && month === label.getMonth() && day === label.getDate();
}

/** The LABEL of today's civil date at the Panchang location. */
export function civilToday(now: Date = new Date()): Date {
  return civilDateOf(now);
}

/** Stable key for today's civil date — changes exactly at IST midnight. */
export function civilTodayKey(now: Date = new Date()): string {
  const { year, month, day } = civilFieldsOf(now);
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Milliseconds from `now` until the next civil midnight (always > 0). */
export function msUntilNextCivilDay(now: Date = new Date()): number {
  const tomorrow = civilDateOf(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return civilDayStart(tomorrow).getTime() - now.getTime();
}
