/**
 * Weekday → deity (vaar) suggestion map. Used only to pre-suggest content when
 * building a `weekday` routine; always overridable by the user.
 *
 * `VAAR_DEITY` is the *content-filter* tag and must be a deity the catalog ships
 * (see src/data/deities.ts). `WEEKDAY_DEITY_LABEL` is the *display* name shown to
 * the user, which can name the traditional presiding deity even when we don't yet
 * ship its content — e.g. Saturday is Shani Dev (with Hanuman worshipped for
 * relief from Shani), so we label it "Shani Dev · Hanuman" but surface Hanuman
 * content, the only one available.
 */
import type { Deity } from '@/data/texts';

/** 0 = Sunday … 6 = Saturday. Content-filter tag (must exist in the catalog). */
export const VAAR_DEITY: Readonly<Record<number, Deity>> = {
  0: 'savitr', // Ravivar — Surya
  1: 'shiva', // Somvar — Shiva
  2: 'hanuman', // Mangalvar — Hanuman
  3: 'ganesha', // Budhvar — Ganesha
  4: 'vishnu', // Guruvar — Vishnu
  5: 'durga', // Shukravar — Devi
  6: 'hanuman', // Shanivar — Shani Dev / Hanuman (Hanuman content surfaced)
};

export function deityForWeekday(weekday: number): Deity {
  return VAAR_DEITY[weekday];
}

/** Display label for the weekday's presiding deity (bilingual). */
export const WEEKDAY_DEITY_LABEL: Readonly<Record<number, { hi: string; en: string }>> = {
  0: { hi: 'सूर्य देव', en: 'Surya' },
  1: { hi: 'शिव', en: 'Shiva' },
  2: { hi: 'हनुमान', en: 'Hanuman' },
  3: { hi: 'गणेश', en: 'Ganesha' },
  4: { hi: 'विष्णु', en: 'Vishnu' },
  5: { hi: 'दुर्गा', en: 'Durga' },
  6: { hi: 'शनि देव · हनुमान', en: 'Shani Dev · Hanuman' },
};

export function deityLabelForWeekday(weekday: number, lang: 'hi' | 'en'): string {
  const l = WEEKDAY_DEITY_LABEL[weekday];
  return lang === 'hi' ? l.hi : l.en;
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
