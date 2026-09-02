/**
 * Hora (planetary hours) — PRD-16/P3 §4.5, the last नित्य layer from parent
 * §4.1. Twelve unequal day-hours (sunrise → sunset) and twelve night-hours
 * (sunset → next sunrise); the first day-hora belongs to the weekday's lord and
 * successive horas follow the classical descending-speed sequence, so the 25th
 * hora (next sunrise) lands on the next weekday's lord by construction.
 *
 * ROLE: evidence and tie-break ONLY (RULEBOOK §17) — a hora never changes a
 * window's tier, so its (small) table cannot flip a §10-reviewed verdict.
 * Pure arithmetic in the `muhurat.ts` mould: caller supplies every date.
 * Not persisted — recomputed from sunrise/sunset like `MuhuratDay`.
 */
import { splitEqual } from './muhurat';

export type HoraRuler = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

export type HoraSpan = { ruler: HoraRuler; start: Date; end: Date; isDay: boolean };

/** Classical hora sequence (descending geocentric speed), cycled hour by hour. */
const HORA_SEQUENCE: readonly HoraRuler[] = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'];

/** Weekday lord, 0 = Sunday — the ruler of the day's first hora. */
const WEEKDAY_LORD: readonly HoraRuler[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * Benefic-hora tie-break preference (Guru/Shukra/Budh first among equal-tier
 * windows — evidence-side ordering only, DRAFT rows in muhurat-lagna-v1.md).
 */
export const BENEFIC_HORA: ReadonlySet<HoraRuler> = new Set(['jupiter', 'venus', 'mercury']);

export const HORA_NAMES_HI: Readonly<Record<HoraRuler, string>> = {
  sun: 'सूर्य',
  moon: 'चन्द्र',
  mars: 'मंगल',
  mercury: 'बुध',
  jupiter: 'गुरु',
  venus: 'शुक्र',
  saturn: 'शनि',
};

export const HORA_NAMES_EN: Readonly<Record<HoraRuler, string>> = {
  sun: 'Surya',
  moon: 'Chandra',
  mars: 'Mangal',
  mercury: 'Budh',
  jupiter: 'Guru',
  venus: 'Shukra',
  saturn: 'Shani',
};

/** The 24 hora spans of a civil day: 12 day + 12 night, tiling sunrise → next sunrise. */
export function horaForDay(sunrise: Date, sunset: Date, nextSunrise: Date, weekday: number): HoraSpan[] {
  const startIndex = HORA_SEQUENCE.indexOf(WEEKDAY_LORD[weekday]);
  const ranges = [
    ...splitEqual(sunrise, sunset, 12).map((r) => ({ r, isDay: true })),
    ...splitEqual(sunset, nextSunrise, 12).map((r) => ({ r, isDay: false })),
  ];
  return ranges.map(({ r: [start, end], isDay }, i) => ({
    ruler: HORA_SEQUENCE[(startIndex + i) % 7],
    start,
    end,
    isDay,
  }));
}

/** The hora prevailing at instant `t`, or null outside the tiled range. */
export function horaAt(horas: readonly HoraSpan[], t: Date): HoraSpan | null {
  const ms = t.getTime();
  return horas.find((h) => ms >= h.start.getTime() && ms < h.end.getTime()) ?? null;
}
