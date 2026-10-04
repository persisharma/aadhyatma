// Instants and spans the special day rules (`specialDayRules.ts`) are decided
// by: the exact interval of one tithi, of one nakshatra, of one karana-half
// (Bhadra), and the day's muhurta windows (pradosh, Hindu midnight, nishita,
// arunodaya). Pure and RN-free; every solve reads the engine's own ephemeris
// and sunrise/sunset memo, so these agree with the anga tiles to the second.

import { addDays } from './calendarGrid';
import { getSiderealMoonLng, getSiderealSunLng, sunriseForDate, sunsetForDate } from './engine';
import type { PanchangComputationOptions } from './types';

export type Span = { start: Date; end: Date };

const HOUR = 3_600_000;

/** Moon − Sun, sidereal, 0–360° (the tithi angle). */
export function elongationAt(instant: Date): number {
  const year = instant.getFullYear();
  return (getSiderealMoonLng(instant, year) - getSiderealSunLng(instant, year) + 360) % 360;
}

/** Sidereal Moon longitude, 0–360° (the nakshatra angle). */
export function moonLongitudeAt(instant: Date): number {
  return getSiderealMoonLng(instant, instant.getFullYear());
}

/** Signed distance from `angle` to `target`, wrapped to (−180, 180]. */
function ahead(angle: number, target: number): number {
  const d = ((target - angle + 540) % 360) - 180;
  return d === -180 ? 180 : d;
}

/**
 * When `angleAt` (a steadily increasing angle — elongation or Moon longitude)
 * next reaches `target` after `from`, searching up to `maxHours`. Hourly steps
 * then a bisection to 1 s. Null when it does not get there in time.
 */
export function crossingAfter(
  angleAt: (instant: Date) => number,
  from: Date,
  target: number,
  maxHours = 72
): Date | null {
  let lo = from.getTime();
  if (ahead(angleAt(from), target) <= 0) return null;
  let hi = lo;
  for (let h = 1; h <= maxHours; h++) {
    hi = from.getTime() + h * HOUR;
    if (ahead(angleAt(new Date(hi)), target) <= 0) break;
    lo = hi;
    if (h === maxHours) return null;
  }
  while (hi - lo > 1000) {
    const mid = (lo + hi) / 2;
    if (ahead(angleAt(new Date(mid)), target) > 0) lo = mid;
    else hi = mid;
  }
  return new Date(hi);
}

/** When `angleAt` last reached `target` before `from` (searching back `maxHours`). */
export function crossingBefore(
  angleAt: (instant: Date) => number,
  from: Date,
  target: number,
  maxHours = 72
): Date | null {
  return crossingAfter(angleAt, new Date(from.getTime() - maxHours * HOUR), target, maxHours);
}

/**
 * The interval of tithi `index` (0–29) nearest `around`: if it is running at
 * `around`, that occurrence; otherwise the next one within three days.
 */
export function tithiSpan(index: number, around: Date): Span | null {
  const startDeg = index * 12;
  const endDeg = ((index + 1) % 30) * 12;
  const now = elongationAt(around);
  const inside = Math.floor(now / 12) === index;
  const start = inside ? crossingBefore(elongationAt, around, startDeg, 30) : crossingAfter(elongationAt, around, startDeg, 72);
  if (!start) return null;
  const end = crossingAfter(elongationAt, new Date(start.getTime() + 60_000), endDeg, 30);
  return end ? { start, end } : null;
}

/** The interval of nakshatra `index` (0–26) nearest `around`, as `tithiSpan`. */
export function nakshatraSpan(index: number, around: Date): Span | null {
  const width = 360 / 27;
  const startDeg = index * width;
  const endDeg = ((index + 1) % 27) * width;
  const now = moonLongitudeAt(around);
  const inside = Math.floor(now / width) === index;
  const start = inside ? crossingBefore(moonLongitudeAt, around, startDeg, 30) : crossingAfter(moonLongitudeAt, around, startDeg, 72);
  if (!start) return null;
  const end = crossingAfter(moonLongitudeAt, new Date(start.getTime() + 60_000), endDeg, 30);
  return end ? { start, end } : null;
}

/** Milliseconds two spans share (0 when they do not meet). */
export function overlapMs(a: Span, b: Span): number {
  return Math.max(0, Math.min(a.end.getTime(), b.end.getTime()) - Math.max(a.start.getTime(), b.start.getTime()));
}

export function contains(span: Span, instant: Date): boolean {
  return instant.getTime() >= span.start.getTime() && instant.getTime() < span.end.getTime();
}

/** Daylight split into five; the fourth part (0.6–0.8) is aparahna. */
export function dayFractionSpan(day: Date, from: number, to: number, options: PanchangComputationOptions = {}): Span {
  const sunrise = sunriseForDate(day, options).getTime();
  const length = sunsetForDate(day, options).getTime() - sunrise;
  return { start: new Date(sunrise + from * length), end: new Date(sunrise + to * length) };
}

/** Sunset to the next sunrise, split at fractions of the night. */
export function nightFractionSpan(day: Date, from: number, to: number, options: PanchangComputationOptions = {}): Span {
  const sunset = sunsetForDate(day, options).getTime();
  const length = sunriseForDate(addDays(day, 1), options).getTime() - sunset;
  return { start: new Date(sunset + from * length), end: new Date(sunset + to * length) };
}

/** Pradosh — the first fifth of the night (sunset → sunset + night/5), as Drik prints it. */
export const pradoshSpan = (day: Date, options: PanchangComputationOptions = {}): Span =>
  nightFractionSpan(day, 0, 0.2, options);

/** Hindu midnight — the middle of the night (sunset → next sunrise). */
export const hinduMidnight = (day: Date, options: PanchangComputationOptions = {}): Date =>
  nightFractionSpan(day, 0.5, 0.5, options).start;

/** Nishita — the eighth of the night's fifteen muhurtas. */
export const nishitaSpan = (day: Date, options: PanchangComputationOptions = {}): Span =>
  nightFractionSpan(day, 7 / 15, 8 / 15, options);

/** Arunodaya — one fifteenth of the previous sunrise-to-sunrise before this sunrise (~96 min, 4 ghatis). */
export function arunodaya(day: Date, options: PanchangComputationOptions = {}): Date {
  const sunrise = sunriseForDate(day, options).getTime();
  const previous = sunriseForDate(addDays(day, -1), options).getTime();
  return new Date(sunrise - (sunrise - previous) / 15);
}
