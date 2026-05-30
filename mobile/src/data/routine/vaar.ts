/**
 * Weekday → deity (vaar) suggestion map. Used only to pre-suggest content when
 * building a `weekday` routine; always overridable by the user. Constrained to
 * deities the catalog actually ships (see src/data/deities.ts).
 */
import type { Deity } from '@/data/texts';

/** 0 = Sunday … 6 = Saturday. */
export const VAAR_DEITY: Readonly<Record<number, Deity>> = {
  0: 'savitr', // Ravivar — Surya
  1: 'shiva', // Somvar — Shiva
  2: 'hanuman', // Mangalvar — Hanuman
  3: 'ganesha', // Budhvar — Ganesha
  4: 'vishnu', // Guruvar — Vishnu
  5: 'durga', // Shukravar — Devi
  6: 'hanuman', // Shanivar — Hanuman / Shani
};

export function deityForWeekday(weekday: number): Deity {
  return VAAR_DEITY[weekday];
}

export type WeekdayLabel = { hi: string; en: string; short: string };

/** Index 0 = Sunday … 6 = Saturday. */
export const WEEKDAY_LABELS: readonly WeekdayLabel[] = [
  { hi: 'रविवार', en: 'Sunday', short: 'Sun' },
  { hi: 'सोमवार', en: 'Monday', short: 'Mon' },
  { hi: 'मंगलवार', en: 'Tuesday', short: 'Tue' },
  { hi: 'बुधवार', en: 'Wednesday', short: 'Wed' },
  { hi: 'गुरुवार', en: 'Thursday', short: 'Thu' },
  { hi: 'शुक्रवार', en: 'Friday', short: 'Fri' },
  { hi: 'शनिवार', en: 'Saturday', short: 'Sat' },
];
