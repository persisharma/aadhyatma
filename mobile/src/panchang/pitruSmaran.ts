// पितृ स्मरण (PRD-17 Phase 1) — pure solvers for tithi-based family remembrance.
//
// A departed family member is remembered by TITHI (e.g. माघ कृष्ण अष्टमी), not by
// Gregorian date. This module answers the three questions the feature promises:
//   • "इस वर्ष कब?"        — solveNextOccurrence / nextObservanceForEntry
//   • "पितृ पक्ष में किस दिन?" — pitruPakshaWindow / pakshaShraddhaDay
//   • Gregorian → tithi     — deriveTithiRuleFromDate (for families who only know
//                             the civil death date)
//
// Conventions (identical to the festival engine — never fork them):
//   • Sunrise anga (udaya-vyapini): a civil day's tithi is the one current at local
//     sunrise (engine.ts `computeTithiAndMonth`).
//   • Rules are stored and solved in the PURNIMANT month convention, like every
//     named rule in festivals.ts. The physical day is the same under amanta.
//   • Kshaya / vriddhi and the adhik-maas nija-month guard come from the shared
//     `matchesLunarTithiRuleOnDate` (festivalEngine.ts) — an adhik-year barsi is
//     observed in the nija (true) month, and a kshaya tithi is observed on the day
//     it prevails, exactly as DrikPanchang lists festivals.
//
// This module is RN-free and React-free (tested via `tsx --test`, like the rest of
// src/panchang). AsyncStorage/React live in PitruSmaranContext and the hooks.

import { addDays } from './calendarGrid';
import { computeTithiAndMonth } from './engine';
import { matchesLunarTithiRuleOnDate, type ObservanceLocation } from './festivalEngine';
import {
  LUNAR_MONTH_NAMES_EN,
  LUNAR_MONTH_NAMES_HI,
  PAKSHA_NAMES_EN,
  PAKSHA_NAMES_HI,
  TITHI_NAMES_EN,
  TITHI_NAMES_HI,
} from './names';
import type { ObservanceRule, Paksha } from './types';

/** A person's shraddha tithi, in the purnimant convention festivals.ts uses. */
export type TithiRule = {
  /** Purnimant lunar month 1–12 (1 = चैत्र … 6 = भाद्रपद … 11 = माघ). */
  lunarMonth: number;
  paksha: Paksha;
  /** In-paksha tithi 1–15 (15 = पूर्णिमा in shukla, अमावस्या in krishna). */
  tithi: number;
};

export type SmaranRelation =
  | 'pitaji'
  | 'mataji'
  | 'dadaji'
  | 'dadiji'
  | 'nanaji'
  | 'naniji'
  | 'anya';

export type SmaranEntry = {
  id: string;
  relation: SmaranRelation;
  /** Optional personal name — never leaves the device, never rendered on any share surface. */
  name?: string;
  /** 'sarvapitri' = tithi unknown; observed on सर्वपितृ अमावस्या (the traditional fallback). */
  tithiRule: TithiRule | 'sarvapitri';
  /** Set when the tithi was derived from a Gregorian date the user confirmed. */
  derivedFromDateMs?: number;
  createdAtMs: number;
};

export type SolveOptions = {
  /** Omitted ⇒ Ujjain, the engine default every bundled observance table assumes. */
  location?: ObservanceLocation;
};

/** The Mahalaya fortnight: `purnima` = भाद्रपद पूर्णिमा (Purnima Shraddha day);
 *  `start` = Pratipada Shraddha (day after purnima); `end` = सर्वपितृ अमावस्या. */
export type PitruPakshaWindow = { purnima: Date; start: Date; end: Date };

export const SMARAN_RELATIONS: readonly { id: SmaranRelation; labelHi: string; labelEn: string }[] = [
  { id: 'pitaji', labelHi: 'पिताजी', labelEn: 'Father' },
  { id: 'mataji', labelHi: 'माताजी', labelEn: 'Mother' },
  { id: 'dadaji', labelHi: 'दादाजी', labelEn: 'Grandfather (paternal)' },
  { id: 'dadiji', labelHi: 'दादीजी', labelEn: 'Grandmother (paternal)' },
  { id: 'nanaji', labelHi: 'नानाजी', labelEn: 'Grandfather (maternal)' },
  { id: 'naniji', labelHi: 'नानीजी', labelEn: 'Grandmother (maternal)' },
  { id: 'anya', labelHi: 'अन्य', labelEn: 'Other' },
];

export function relationLabels(relation: SmaranRelation): { labelHi: string; labelEn: string } {
  return SMARAN_RELATIONS.find((r) => r.id === relation) ?? SMARAN_RELATIONS[SMARAN_RELATIONS.length - 1];
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** 0-based index into the 30-slot tithi name/matching tables. */
function tithiSlotIndex(rule: Pick<TithiRule, 'paksha' | 'tithi'>): number {
  return rule.paksha === 'shukla' ? rule.tithi - 1 : rule.tithi + 14;
}

/** Tithi name in words for a rule (e.g. `अष्टमी`, `अमावस्या`). */
export function tithiName(rule: Pick<TithiRule, 'paksha' | 'tithi'>, lang: 'hi' | 'en'): string {
  const names = lang === 'hi' ? TITHI_NAMES_HI : TITHI_NAMES_EN;
  return names[tithiSlotIndex(rule)];
}

/** Full rule label in words: `माघ कृष्ण अष्टमी` / `Magha Krishna Ashtami`. */
export function tithiRuleLabel(rule: TithiRule | 'sarvapitri', lang: 'hi' | 'en'): string {
  if (rule === 'sarvapitri') {
    return lang === 'hi' ? 'सर्वपितृ अमावस्या' : 'Sarvapitri Amavasya';
  }
  const months = lang === 'hi' ? LUNAR_MONTH_NAMES_HI : LUNAR_MONTH_NAMES_EN;
  const paksha = lang === 'hi' ? PAKSHA_NAMES_HI[rule.paksha] : PAKSHA_NAMES_EN[rule.paksha];
  return `${months[rule.lunarMonth - 1]} ${paksha} ${tithiName(rule, lang)}`;
}

export function isValidTithiRule(rule: TithiRule): boolean {
  return (
    Number.isInteger(rule.lunarMonth) && rule.lunarMonth >= 1 && rule.lunarMonth <= 12 &&
    Number.isInteger(rule.tithi) && rule.tithi >= 1 && rule.tithi <= 15 &&
    (rule.paksha === 'shukla' || rule.paksha === 'krishna')
  );
}

// A synthetic ObservanceRule so the shared festival matcher can be reused verbatim.
// `marker: 'dot'` keeps `isEkadashiNameRule` false even for tithi 11, so a personal
// krishna-ekadashi rule stays in the purnimant convention it was authored in.
function toObservanceRule(rule: Partial<TithiRule> & Pick<TithiRule, 'paksha' | 'tithi'>): ObservanceRule {
  return {
    id: 'pitru-smaran-personal-rule',
    nameHi: 'पितृ स्मरण',
    nameEn: 'Pitru Smaran',
    category: 'vrat',
    visibility: 'default',
    ruleType: 'lunar-tithi',
    recurrence: rule.lunarMonth === undefined ? 'monthly' : 'annual',
    lunarMonth: rule.lunarMonth,
    paksha: rule.paksha,
    tithi: rule.tithi,
    marker: 'dot',
    deityHi: '',
    deityEn: '',
    shortDescriptionHi: '',
    shortDescriptionEn: '',
    sourceUrl: '',
  };
}

/**
 * The sunrise tithi rule of a Gregorian date — for the "केवल तारीख़ ज्ञात है" entry
 * flow. The result is shown back to the user IN WORDS for explicit confirmation
 * before anything persists (a silent conversion is never saved).
 */
export function deriveTithiRuleFromDate(gregorianDate: Date, options: SolveOptions = {}): TithiRule {
  const day = startOfLocalDay(gregorianDate);
  const { tithiIndex, lunarMonth, paksha } = computeTithiAndMonth(day, {
    calendarSystem: 'purnimant',
    location: options.location,
  });
  return { lunarMonth, paksha, tithi: (tithiIndex % 15) + 1 };
}

// Longest possible gap between two annual occurrences is ~13 lunar months
// (~384 days) when an adhik maas intervenes; 430 gives margin.
const MAX_SCAN_DAYS = 430;

// Scan for the first civil day on/after `fromDate` matching `rule`, striding over
// far-away days: the sunrise tithi advances ~1/day (never more than 2), so when the
// target is `delta` tithis ahead we can jump `~delta/1.3` days without overshooting,
// then fine-test the last few days through the shared matcher (which owns the
// kshaya/vriddhi/adhik decisions). ~15 computeTithiAndMonth calls per lunation
// instead of ~30, and every call is memoised engine-wide.
function scanForRule(
  rule: ObservanceRule,
  fromDate: Date,
  maxDays: number,
  options: SolveOptions
): Date | null {
  const target = rule.paksha === 'shukla' ? (rule.tithi ?? 1) - 1 : (rule.tithi ?? 1) + 14;
  let day = startOfLocalDay(fromDate);
  const limitMs = addDays(day, maxDays).getTime();
  while (day.getTime() <= limitMs) {
    let tithiIndex: number;
    try {
      tithiIndex = computeTithiAndMonth(day, { calendarSystem: 'purnimant', location: options.location }).tithiIndex;
    } catch {
      day = addDays(day, 1);
      continue;
    }
    const delta = (target - tithiIndex + 30) % 30;
    if (delta >= 3 && delta <= 27) {
      day = addDays(day, Math.max(1, Math.floor((delta - 1) / 1.3)));
      continue;
    }
    // Within reach (delta 0–2 or just past, 28–29): the matcher decides — it fires
    // on delta 0 (with vriddhi dedupe + month guard) and on delta 1 when the target
    // tithi is kshaya (prevails today, touches no sunrise).
    if ((delta <= 1) && matchesLunarTithiRuleOnDate(rule, day, 'purnimant', options.location)) {
      return day;
    }
    day = addDays(day, 1);
  }
  return null;
}

/**
 * Next Gregorian date on/after `fromDate` for a lunarMonth+paksha+tithi rule —
 * the same solve the festival engine runs for Janmashtami-class rules, including
 * kshaya fallback, vriddhi dedupe, and the adhik-maas nija-month guard.
 */
export function solveNextOccurrence(rule: TithiRule, fromDate: Date, options: SolveOptions = {}): Date | null {
  if (!isValidTithiRule(rule)) return null;
  return scanForRule(toObservanceRule(rule), fromDate, MAX_SCAN_DAYS, options);
}

const windowCache = new Map<string, PitruPakshaWindow | null>();

/**
 * The Pitru Paksha (Mahalaya) fortnight of a Gregorian year, purnimant:
 * भाद्रपद पूर्णिमा, then Pratipada Shraddha (day after) through सर्वपितृ अमावस्या —
 * the first amavasya after that purnima (month-free by construction, so an
 * adhik-Ashwin year cannot orphan the closing amavasya).
 */
export function pitruPakshaWindow(gregorianYear: number, options: SolveOptions = {}): PitruPakshaWindow | null {
  const cacheKey = `${options.location?.cityId ?? 'ujjain'}:${gregorianYear}`;
  const cached = windowCache.get(cacheKey);
  if (cached !== undefined) return cached;

  // Bhadrapada Purnima falls in Sep (early Oct at the latest); scanning from
  // 1 Aug bounds the search without risking a miss.
  const purnima = solveNextOccurrence(
    { lunarMonth: 6, paksha: 'shukla', tithi: 15 },
    new Date(gregorianYear, 7, 1),
    options
  );
  if (!purnima || purnima.getFullYear() !== gregorianYear) {
    windowCache.set(cacheKey, null);
    return null;
  }
  const start = addDays(purnima, 1);
  const end = scanForRule(toObservanceRule({ paksha: 'krishna', tithi: 15 }), start, 20, options);
  if (!end) {
    windowCache.set(cacheKey, null);
    return null;
  }
  const window = { purnima, start, end };
  windowCache.set(cacheKey, window);
  return window;
}

/**
 * A person's shraddha day inside the year's Pitru Paksha: their tithi observed in
 * the Mahalaya krishna paksha (the traditional mapping — independent of the death
 * month and paksha). Unknown tithi ('sarvapitri') → सर्वपितृ अमावस्या. A पूर्णिमा
 * tithi → Purnima Shraddha, on भाद्रपद पूर्णिमा itself (the day before Pratipada).
 * A tithi that is kshaya inside the window resolves to the day it prevails (the
 * shared matcher's fallback); if it still cannot be placed, सर्वपितृ अमावस्या is
 * the traditional catch-all.
 */
export function pakshaShraddhaDay(
  rule: TithiRule | 'sarvapitri',
  gregorianYear: number,
  options: SolveOptions = {}
): Date | null {
  const window = pitruPakshaWindow(gregorianYear, options);
  if (!window) return null;
  if (rule === 'sarvapitri') return window.end;
  if (!isValidTithiRule(rule)) return null;
  if (rule.paksha === 'shukla' && rule.tithi === 15) return window.purnima;
  if (rule.tithi === 15) return window.end; // krishna 15 = amavasya = Sarvapitri
  // Scan from the purnima itself, not window.start: a kshaya Pratipada prevails on
  // the purnima day (a combined "Purnima + Pratipada Shraddha" day, as DrikPanchang
  // lists such years), which a start-of-window scan would miss.
  const found = scanForRule(
    toObservanceRule({ paksha: 'krishna', tithi: rule.tithi }),
    window.purnima,
    17,
    options
  );
  if (found && found.getTime() <= window.end.getTime()) return found;
  return window.end;
}

/**
 * Next observance date for an entry on/after `fromDate` — the annual tithi solve,
 * or the next सर्वपितृ अमावस्या for unknown-tithi entries.
 */
export function nextObservanceForEntry(
  entry: Pick<SmaranEntry, 'tithiRule'>,
  fromDate: Date,
  options: SolveOptions = {}
): Date | null {
  if (entry.tithiRule === 'sarvapitri') return nextSarvapitriAmavasya(fromDate, options);
  return solveNextOccurrence(entry.tithiRule, fromDate, options);
}

/** The next सर्वपितृ अमावस्या on/after `fromDate`. */
export function nextSarvapitriAmavasya(fromDate: Date, options: SolveOptions = {}): Date | null {
  const from = startOfLocalDay(fromDate);
  for (const year of [from.getFullYear(), from.getFullYear() + 1]) {
    const window = pitruPakshaWindow(year, options);
    if (window && window.end.getTime() >= from.getTime()) return window.end;
  }
  return null;
}

/**
 * Does this civil day carry the entry's observance? (The Panchang day chip.)
 * Annual-tithi entries match their tithi's day (kshaya-aware via the shared
 * matcher); unknown-tithi entries match सर्वपितृ अमावस्या.
 */
export function entryMatchesDate(
  entry: Pick<SmaranEntry, 'tithiRule'>,
  date: Date,
  options: SolveOptions = {}
): boolean {
  const day = startOfLocalDay(date);
  if (entry.tithiRule === 'sarvapitri') {
    const window = pitruPakshaWindow(day.getFullYear(), options);
    return window !== null && isSameLocalDay(window.end, day);
  }
  if (!isValidTithiRule(entry.tithiRule)) return false;
  return matchesLunarTithiRuleOnDate(toObservanceRule(entry.tithiRule), day, 'purnimant', options.location);
}

/** Test-only: clear the per-year window memo. */
export function __resetPitruPakshaWindowCacheForTests(): void {
  windowCache.clear();
}
