/**
 * Pure helpers for the panchang prefix on daily-verse notification titles.
 *
 * A daily-verse notification's title leads with the fire day's panchang context —
 * the day's vrat/festival when there is one, otherwise the sunrise tithi — and
 * keeps `दैनिक भक्ति` as the suffix. The body is untouched: the verse line stays
 * the first thing the reader sees.
 *
 * Everything here is deterministic and astronomy-free — it takes an already-
 * resolved `DayAnga` and formats it. Resolution (sunrise/tithi solves, observance
 * lookup) lives in `./dayAngaResolver`, so these helpers can be unit-tested via
 * `tsx` without bootstrapping React Native or the panchang engine.
 */

import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
import {
  PAKSHA_NAMES_EN,
  PAKSHA_NAMES_HI,
  TITHI_NAMES_EN,
  TITHI_NAMES_HI,
} from '@/panchang/names';
import type { ObservanceRule, Paksha } from '@/panchang/types';

/** Sunrise tithi (+ the day's headline observance, when there is one) for one day. */
export type DayAnga = {
  /** 0-based tithi index, 0–29 (0 = Shukla Pratipada, 29 = Amavasya). */
  tithiIndex: number;
  paksha: Paksha;
  /** Headline observance name, when the day has one and its dates are trustworthy. */
  observanceHi?: string;
  observanceEn?: string;
};

/** Day angas keyed by local `YYYY-MM-DD` date key — the same keys the scheduler uses. */
export type DayAngaMap = Record<string, DayAnga>;

/**
 * Character budget for the whole title. Past this the ` · दैनिक भक्ति` suffix is
 * dropped rather than letting the OS truncate — the app name already appears in
 * the notification chrome, so losing the suffix costs nothing, while a truncated
 * festival name (or a Devanagari conjunct sliced in half) reads as a bug.
 */
export const TITLE_MAX_CHARS = 38;

/** Purnima and Amavasya name their paksha implicitly — prefixing it is redundant. */
const PURNIMA_INDEX = 14;
const AMAVASYA_INDEX = 29;

function isValidTithiIndex(index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < TITHI_NAMES_HI.length;
}

/**
 * The day's tithi as a display label — `शुक्ल एकादशी` / `Shukla Ekadashi`.
 * Purnima and Amavasya render bare, matching how they're spoken.
 */
export function formatTithiLabel(anga: DayAnga, lang: Lang): string {
  if (!isValidTithiIndex(anga.tithiIndex)) return '';
  const tithi = contentByLang(
    lang,
    TITHI_NAMES_HI[anga.tithiIndex],
    TITHI_NAMES_EN[anga.tithiIndex]
  );
  if (anga.tithiIndex === PURNIMA_INDEX || anga.tithiIndex === AMAVASYA_INDEX) {
    return tithi;
  }
  const paksha = contentByLang(
    lang,
    PAKSHA_NAMES_HI[anga.paksha],
    PAKSHA_NAMES_EN[anga.paksha]
  );
  return `${paksha} ${tithi}`;
}

/**
 * The title prefix for a day: its observance when one is present, else the tithi.
 * On an observance day the tithi is implied by the vrat's own name (Ekadashi vrats
 * fall on Ekadashi), so naming both would spend the title's budget on a repeat.
 */
export function formatAngaPrefix(anga: DayAnga, lang: Lang): string {
  if (anga.observanceHi && anga.observanceEn) {
    return contentByLang(lang, anga.observanceHi, anga.observanceEn);
  }
  return formatTithiLabel(anga, lang);
}

/**
 * Build the notification title. Without an anga this is exactly the pre-panchang
 * title, so a failed or pending resolution degrades to the previous behaviour
 * rather than to a broken string.
 */
export function formatNotificationTitle(lang: Lang, anga?: DayAnga): string {
  const base = contentByLang(lang, 'दैनिक भक्ति', 'Daily Verse');
  if (!anga) return base;
  const prefix = formatAngaPrefix(anga, lang);
  if (!prefix) return base;
  const combined = `${prefix} · ${base}`;
  return combined.length <= TITLE_MAX_CHARS ? combined : prefix;
}

// Rank tables for choosing one observance out of a day that has several.
// `marker` is the calendar's own significance signal (star = the major festivals;
// halfmoon = the default for a non-festival rule; dot = explicitly minor).
const MARKER_RANK: Record<ObservanceRule['marker'], number> = {
  star: 0,
  halfmoon: 1,
  dot: 2,
};

const CATEGORY_RANK: Record<ObservanceRule['category'], number> = {
  vrat: 0,
  upavas: 1,
  festival: 2,
  katha: 3,
  regional: 4,
};

/**
 * Choose the single observance a day's title should name.
 *
 * Only `default`-visibility rules are eligible — advanced and regional entries are
 * opt-in surfaces inside the Panchang tab, and promoting one into every user's
 * lock screen would misrepresent the day. Ordering is by significance, then
 * category, then id, so the pick is stable for a given date no matter what order
 * the resolver returns rules in. Returns null when the day has nothing to name.
 */
export function pickTitleObservance(rules: ObservanceRule[]): ObservanceRule | null {
  const eligible = rules.filter((r) => r.visibility === 'default');
  if (eligible.length === 0) return null;
  const sorted = [...eligible].sort((a, b) => {
    const marker = MARKER_RANK[a.marker] - MARKER_RANK[b.marker];
    if (marker !== 0) return marker;
    const category = CATEGORY_RANK[a.category] - CATEGORY_RANK[b.category];
    if (category !== 0) return category;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return sorted[0] ?? null;
}
