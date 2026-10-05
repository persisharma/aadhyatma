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
//   • EXCEPT where a shraddha falls — the Pitru Paksha fortnight (purnima, the
//     krishna tithis and सर्वपितृ अमावस्या) and every annual (barsi) date: shraddha
//     is an aparahna rite, so the day is the one whose aparahna SPAN the tithi
//     covers longest (`assignAparahnaDaysSteps`, `shraddhaDayForSunriseDay`). The
//     sunrise matcher still finds the lunation and owns the month/adhik guard.
//     `tithiRuleMatchesDate` and the `janma` reckoning stay on sunrise.
//
// This module is RN-free and React-free (tested via `tsx --test`, like the rest of
// src/panchang). AsyncStorage/React live in PitruSmaranContext and the hooks.

import { addDays } from './calendarGrid';
import { runInBackground, runSynchronously } from './backgroundWork';
import { aparahnaCover, computeTithiAndMonthSteps } from './engine';
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
  /** Private notification preference. Old omitted values are off; new saves default on after an OS grant. */
  reminderEnabled?: boolean;
  createdAtMs: number;
};

export type SolveOptions = {
  /** Omitted ⇒ Ujjain, the engine default every bundled observance table assumes. */
  location?: ObservanceLocation;
};

/**
 * Which day an annual tithi lands on. `shraddha` (the dead — Pitru Smaran): the
 * day whose aparahna the tithi covers longest, the rite's own time. `janma` (the
 * living — PRD-29): the sunrise day, as every festival rule and almanac heading
 * names it. They differ for about a third of tithis (126 of 365 days in 2026).
 */
export type Reckoning = 'shraddha' | 'janma';

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
  return runSynchronously(deriveTithiRuleFromDateSteps(gregorianDate, options));
}

/** Same derivation, yielding within the engine for interactive surfaces. */
export function* deriveTithiRuleFromDateSteps(
  gregorianDate: Date, options: SolveOptions = {}
): Generator<void, TithiRule, void> {
  const day = startOfLocalDay(gregorianDate);
  const { tithiIndex, lunarMonth, paksha } = yield* computeTithiAndMonthSteps(day, {
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
function* scanForRuleSteps(
  rule: ObservanceRule,
  fromDate: Date,
  maxDays: number,
  options: SolveOptions
): Generator<void, Date | null, void> {
  const target = rule.paksha === 'shukla' ? (rule.tithi ?? 1) - 1 : (rule.tithi ?? 1) + 14;
  let day = startOfLocalDay(fromDate);
  const limitMs = addDays(day, maxDays).getTime();
  while (day.getTime() <= limitMs) {
    yield;
    let tithiIndex: number;
    try {
      tithiIndex = (yield* computeTithiAndMonthSteps(day, { calendarSystem: 'purnimant', location: options.location })).tithiIndex;
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

function scanForRule(rule: ObservanceRule, fromDate: Date, maxDays: number, options: SolveOptions): Date | null {
  return runSynchronously(scanForRuleSteps(rule, fromDate, maxDays, options));
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

/**
 * Does this civil day carry the rule's annual observance? The bare tithi match —
 * kshaya-aware via the shared matcher, with NO Pitru-Paksha mapping. PRD-29's
 * जन्म तिथि surfaces match through this: `entryMatchesDate` would additionally
 * fire on the person's mapped shraddha day inside the Mahalaya fortnight, which
 * is correct for the dead and wrong for the living.
 */
export function tithiRuleMatchesDate(rule: TithiRule, date: Date, options: SolveOptions = {}): boolean {
  if (!isValidTithiRule(rule)) return false;
  return matchesLunarTithiRuleOnDate(toObservanceRule(rule), startOfLocalDay(date), 'purnimant', options.location);
}

const windowCache = new Map<string, PitruPakshaWindow | null>();
/**
 * Each year's krishna-tithi → day table, memoised against the exact window
 * object it was solved for (see `pakshaTithiDaysSteps`).
 */
const tithiDaysCache = new Map<string, { window: PitruPakshaWindow; days: Map<number, Date> }>();

function windowCacheKey(gregorianYear: number, options: SolveOptions): string {
  return `${options.location?.cityId ?? 'ujjain'}:${gregorianYear}`;
}

/**
 * Seed the per-year window memo from a persisted solve, so a cold launch does not
 * repeat the ~40 ms Bhadrapada-Purnima scan that produced it. Used only by
 * `pitruSmaranSolves.ts` (the AsyncStorage layer); the value MUST be a window this
 * same engine version produced — see `PANCHANG_DAY_CACHE_VERSION`.
 *
 * A year already solved in this session is left alone: the in-memory answer and
 * the disk one agree by construction, and overwriting would swap out `Date`
 * instances other callers may already hold.
 */
export function primePitruPakshaWindow(
  gregorianYear: number,
  window: PitruPakshaWindow,
  options: SolveOptions = {}
): void {
  const key = windowCacheKey(gregorianYear, options);
  if (!windowCache.has(key)) windowCache.set(key, window);
}

/**
 * Each tithi of the fortnight assigned to the civil day whose aparahna span it
 * covers most (`aparahnaSplitForDate`), over the days `from`..`to` inclusive.
 * Keyed by tithi index (14 = purnima, 15–28 = krishna 1–14, 29 = amavasya).
 *
 * Checked against the published Pitru Paksha lists 2024–2027 (all 16 days each):
 *  • a tithi covering two days' spans goes to the larger cover — 2024 Ekadashi
 *    covers 144 min of 27 Sep and 87 of 28 Sep, Dwadashi 57 of 28 Sep and 143 of
 *    29 Sep, so 28 Sep carries no shraddha at all, as Drik lists it;
 *  • a tithi that opens inside a span and closes before the next joins that day
 *    — 2026 Panchami opens 30 Sep 2:55 PM, so 30 Sep is "Chaturthi & Panchami";
 *  • a tithi that covers no span anywhere (it would have to open after one
 *    day's span and close before the next one's) takes its sunrise day, the
 *    same fallback the shared matcher's instant rules use. No year 2020–2035
 *    reaches this branch (Ujjain, Delhi, Jaipur, Chennai).
 * Cover is the FRACTION of each span (`aparahnaCover`); equal cover keeps the
 * LATER day (Dharma Sindhu: a tithi in both aparahnas equally is taken on the
 * next day — it is a lengthening one).
 */
function* assignAparahnaDaysSteps(
  from: Date,
  to: Date,
  options: SolveOptions
): Generator<void, Map<number, Date>, void> {
  const best = new Map<number, { day: Date; cover: number }>();
  const sunriseDay = new Map<number, Date>();
  const opts = { calendarSystem: 'purnimant' as const, location: options.location };
  for (let day = startOfLocalDay(from); day.getTime() <= to.getTime(); day = addDays(day, 1)) {
    const { tithiIndex } = yield* computeTithiAndMonthSteps(day, opts);
    if (!sunriseDay.has(tithiIndex)) sunriseDay.set(tithiIndex, day);
    yield;
    // The span holds only the sunrise tithi or its successor.
    for (const index of [tithiIndex, (tithiIndex + 1) % 30]) {
      if (index < 14 || index > 29) continue;
      const cover = aparahnaCover(day, index, opts);
      if (cover <= 0) continue;
      // `>=`: the days run in order, so equal cover keeps the LATER day.
      const current = best.get(index);
      if (!current || cover >= current.cover) best.set(index, { day, cover });
    }
  }
  const days = new Map<number, Date>();
  for (let index = 14; index <= 29; index++) {
    const day = best.get(index)?.day ?? sunriseDay.get(index);
    if (day) days.set(index, day);
  }
  return days;
}

/**
 * The Pitru Paksha (Mahalaya) fortnight of a Gregorian year, purnimant:
 * Purnima Shraddha, then Pratipada Shraddha (day after) through सर्वपितृ अमावस्या.
 * The lunation is found by its sunrise days — भाद्रपद पूर्णिमा and the first
 * amavasya after it (month-free by construction, so an adhik-Ashwin year cannot
 * orphan the closing amavasya) — and both ends are then moved to their aparahna
 * days, which can be a day earlier (Sarvapitri 2027: amavasya opens 29 Sep and
 * holds that afternoon, so 29 Sep, not the sunrise day 30 Sep).
 */
function* pitruPakshaWindowSteps(gregorianYear: number, options: SolveOptions): Generator<void, PitruPakshaWindow | null, void> {
  const cacheKey = windowCacheKey(gregorianYear, options);
  const cached = windowCache.get(cacheKey);
  if (cached !== undefined) return cached;

  // Bhadrapada Purnima falls in Sep (early Oct at the latest); scanning from
  // 1 Aug bounds the search without risking a miss.
  const sunrisePurnima = yield* scanForRuleSteps(
    toObservanceRule({ lunarMonth: 6, paksha: 'shukla', tithi: 15 }),
    new Date(gregorianYear, 7, 1),
    MAX_SCAN_DAYS,
    options
  );
  if (!sunrisePurnima || sunrisePurnima.getFullYear() !== gregorianYear) {
    windowCache.set(cacheKey, null);
    return null;
  }
  const sunriseEnd = yield* scanForRuleSteps(
    toObservanceRule({ paksha: 'krishna', tithi: 15 }), addDays(sunrisePurnima, 1), 20, options
  );
  if (!sunriseEnd) {
    windowCache.set(cacheKey, null);
    return null;
  }
  const days = yield* assignAparahnaDaysSteps(addDays(sunrisePurnima, -1), sunriseEnd, options);
  const purnima = days.get(14) ?? sunrisePurnima;
  const window = { purnima, start: addDays(purnima, 1), end: days.get(29) ?? sunriseEnd };
  windowCache.set(cacheKey, window);
  // The same pass already placed every krishna tithi, so a fresh solve leaves
  // the day table warm; only a window primed from disk has to solve it again.
  tithiDaysCache.set(cacheKey, { window, days });
  return window;
}

export function pitruPakshaWindow(gregorianYear: number, options: SolveOptions = {}): PitruPakshaWindow | null {
  return runSynchronously(pitruPakshaWindowSteps(gregorianYear, options));
}

/** Same engine and cache, yielding within the date scan so Home remains tappable. */
export function pitruPakshaWindowAsync(
  year: number,
  isCancelled: () => boolean = () => false,
  options: SolveOptions = {}
): Promise<PitruPakshaWindow | null | undefined> {
  return runInBackground(pitruPakshaWindowSteps(year, options), isCancelled);
}

/**
 * A person's shraddha day inside the year's Pitru Paksha: their tithi observed in
 * the Mahalaya krishna paksha (the traditional mapping — independent of the death
 * month and paksha). Unknown tithi ('sarvapitri') → सर्वपितृ अमावस्या. A पूर्णिमा
 * tithi → Purnima Shraddha, on भाद्रपद पूर्णिमा itself (the day before Pratipada).
 * Each krishna tithi lands on its aparahna day (`assignAparahnaDaysSteps`), so
 * two tithis can share a day and a day can carry none; if a tithi still cannot
 * be placed, सर्वपितृ अमावस्या is the traditional catch-all.
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
  const found = pakshaTithiDays(gregorianYear, window, options).get(rule.tithi + 14);
  if (found && found.getTime() <= window.end.getTime()) return found;
  return window.end;
}

/**
 * The fortnight's krishna-tithi → day table, solved from the window it belongs
 * to (memoised against that exact window object, so a window primed from disk
 * gets a table of its own). The day before the purnima is included: its
 * span can carry the purnima's tail, which must compete for Pratipada.
 */
function pakshaTithiDays(gregorianYear: number, window: PitruPakshaWindow, options: SolveOptions): Map<number, Date> {
  return runSynchronously(pakshaTithiDaysSteps(gregorianYear, window, options));
}

function* pakshaTithiDaysSteps(
  gregorianYear: number, window: PitruPakshaWindow, options: SolveOptions
): Generator<void, Map<number, Date>, void> {
  const key = windowCacheKey(gregorianYear, options);
  const cached = tithiDaysCache.get(key);
  if (cached && cached.window === window) return cached.days;
  const days = yield* assignAparahnaDaysSteps(addDays(window.purnima, -1), window.end, options);
  tithiDaysCache.set(key, { window, days });
  return days;
}

/**
 * Whether `pitruPakshaObservanceForDate` can answer for this year with no
 * astronomy — the window AND its day table are both in memory. A render-time
 * read must check this first: a window primed from disk leaves the table to
 * solve (~80 ms cold on V8).
 */
export function isPitruPakshaDayTableWarm(gregorianYear: number, options: SolveOptions = {}): boolean {
  const key = windowCacheKey(gregorianYear, options);
  const window = windowCache.get(key);
  if (window === undefined) return false;
  return window === null || tithiDaysCache.get(key)?.window === window;
}

/**
 * Next observance date for an entry on/after `fromDate` — the annual tithi solve,
 * or the next सर्वपितृ अमावस्या for unknown-tithi entries.
 */
export function nextObservanceForEntry(
  entry: Pick<SmaranEntry, 'tithiRule'>,
  fromDate: Date,
  options: SolveOptions = {},
  reckoning: Reckoning = 'shraddha'
): Date | null {
  return runSynchronously(nextObservanceForEntrySteps(entry, fromDate, options, reckoning));
}

export function* nextObservanceForEntrySteps(
  entry: Pick<SmaranEntry, 'tithiRule'>, fromDate: Date, options: SolveOptions = {}, reckoning: Reckoning = 'shraddha'
): Generator<void, Date | null, void> {
  if (entry.tithiRule !== 'sarvapitri') {
    if (!isValidTithiRule(entry.tithiRule)) return null;
    const rule = toObservanceRule(entry.tithiRule);
    if (reckoning === 'janma') return yield* scanForRuleSteps(rule, fromDate, MAX_SCAN_DAYS, options);
    const from = startOfLocalDay(fromDate);
    // The aparahna day is the sunrise day or the one before, so a sunrise day
    // just after `from` can name a shraddha day just before it: that occurrence
    // has passed, and the scan moves on to the next lunation.
    let cursor = from;
    for (let guard = 0; guard < 3; guard++) {
      const sunriseDay = yield* scanForRuleSteps(rule, cursor, MAX_SCAN_DAYS, options);
      if (!sunriseDay) return null;
      yield;
      const day = shraddhaDayForSunriseDay(entry.tithiRule, sunriseDay, options);
      if (day.getTime() >= from.getTime()) return day;
      cursor = addDays(sunriseDay, 1);
    }
    return null;
  }
  const from = startOfLocalDay(fromDate);
  for (const year of [from.getFullYear(), from.getFullYear() + 1]) {
    const window = yield* pitruPakshaWindowSteps(year, options);
    if (window && window.end.getTime() >= from.getTime()) return window.end;
  }
  return null;
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
 * The shraddha day of one lunation, given its SUNRISE day (the shared matcher's
 * answer, kshaya-aware): that day or the one before, whichever aparahna span the
 * tithi covers the greater fraction of — the Pitru Paksha rule
 * (`assignAparahnaDaysSteps`) for a single tithi. A tithi can only reach back
 * one day: it opened after the previous sunrise. Equal cover, or none, keeps
 * the sunrise (later) day.
 *
 * Magha Krishna Ashtami 2027 opens 29 Jan 4:02 AM — its sunrise day 29 Jan
 * holds the whole aparahna, so nothing moves. Pitru Paksha Saptami 2026 opens
 * 2 Oct 10:15 AM and closes 3 Oct 8:00 AM, so a Saptami barsi that year is
 * 2 Oct, the day before the almanac's sunrise heading.
 */
function shraddhaDayForSunriseDay(rule: Pick<TithiRule, 'paksha' | 'tithi'>, sunriseDay: Date, options: SolveOptions): Date {
  const target = tithiSlotIndex(rule);
  const opts = { calendarSystem: 'purnimant' as const, location: options.location };
  const before = addDays(sunriseDay, -1);
  // Strictly more: equal cover keeps the later (sunrise) day.
  return aparahnaCover(before, target, opts) > aparahnaCover(sunriseDay, target, opts) ? before : sunriseDay;
}

/**
 * Does this civil day carry the entry's observance? (The Panchang day chip.)
 * Annual-tithi entries match their shraddha day — the aparahna day of the
 * lunation the shared sunrise matcher finds on this day or the next;
 * unknown-tithi entries match सर्वपितृ अमावस्या.
 */
export function entryMatchesDate(
  entry: Pick<SmaranEntry, 'tithiRule'>,
  date: Date,
  options: SolveOptions = {}
): boolean {
  const day = startOfLocalDay(date);
  const pakshaDay = pakshaShraddhaDay(entry.tithiRule, day.getFullYear(), options);
  if (pakshaDay && isSameLocalDay(pakshaDay, day)) return true;
  if (entry.tithiRule === 'sarvapitri') {
    const window = pitruPakshaWindow(day.getFullYear(), options);
    return window !== null && isSameLocalDay(window.end, day);
  }
  if (!isValidTithiRule(entry.tithiRule)) return false;
  const rule = toObservanceRule(entry.tithiRule);
  for (const sunriseDay of [day, addDays(day, 1)]) {
    if (
      matchesLunarTithiRuleOnDate(rule, sunriseDay, 'purnimant', options.location)
      && isSameLocalDay(shraddhaDayForSunriseDay(entry.tithiRule, sunriseDay, options), day)
    ) {
      return true;
    }
  }
  return false;
}

export type PitruPakshaDayObservance = {
  tithi: number;
  isPurnima: boolean;
  isSarvapitri: boolean;
  labelHi: string;
  labelEn: string;
};

/**
 * The shraddha name(s) a fortnight day carries, without the "पितृ पक्ष —" prefix:
 * "पूर्णिमा श्राद्ध", "सप्तमी श्राद्ध", "चतुर्थी व पंचमी श्राद्ध" (two tithis share
 * the day's aparahna), "सर्वपितृ अमावस्या", or — on a day whose aparahna both
 * neighbouring tithis cover less than their other day's (28 Sep 2024) — no
 * tithi at all. `tithis` lists the krishna tithis (1–14) placed on the day.
 * A screen that already holds the year's window passes it, so the row names and
 * the rows themselves come from one window.
 */
export type PitruPakshaDayName = {
  tithis: number[];
  isPurnima: boolean;
  isSarvapitri: boolean;
  nameHi: string;
  nameEn: string;
};

export function pitruPakshaDayName(
  date: Date,
  options: SolveOptions = {},
  window: PitruPakshaWindow | null = pitruPakshaWindow(startOfLocalDay(date).getFullYear(), options)
): PitruPakshaDayName | null {
  const day = startOfLocalDay(date);
  if (!window || day.getTime() < window.purnima.getTime() || day.getTime() > window.end.getTime()) {
    return null;
  }
  const isPurnima = isSameLocalDay(day, window.purnima);
  const isSarvapitri = isSameLocalDay(day, window.end);
  const tithis: number[] = [];
  for (const [index, d] of pakshaTithiDays(day.getFullYear(), window, options)) {
    if (index >= 15 && index <= 28 && isSameLocalDay(d, day)) tithis.push(index - 14);
  }
  tithis.sort((a, b) => a - b);
  const hi = tithis.map((t) => TITHI_NAMES_HI[t + 14]);
  const en = tithis.map((t) => TITHI_NAMES_EN[t + 14]);
  if (isPurnima) {
    hi.unshift(TITHI_NAMES_HI[14]);
    en.unshift(TITHI_NAMES_EN[14]);
  }
  let nameHi = hi.length ? `${hi.join(' व ')} श्राद्ध` : 'कोई तिथि-श्राद्ध नहीं';
  let nameEn = en.length ? `${en.join(' & ')} Shraddha` : 'No tithi shraddha';
  if (isSarvapitri) {
    nameHi = hi.length ? `${nameHi} व सर्वपितृ अमावस्या` : 'सर्वपितृ अमावस्या';
    nameEn = en.length ? `${nameEn} & Sarvapitri Amavasya` : 'Sarvapitri Amavasya';
  }
  return { tithis, isPurnima, isSarvapitri, nameHi, nameEn };
}

/** Public Pitru-Paksha observance for a civil date, or null outside the fortnight. */
export function pitruPakshaObservanceForDate(
  date: Date,
  options: SolveOptions = {}
): PitruPakshaDayObservance | null {
  const name = pitruPakshaDayName(date, options);
  if (!name) return null;
  return {
    tithi: name.isPurnima || name.isSarvapitri ? 15 : name.tithis[0] ?? 0,
    isPurnima: name.isPurnima,
    isSarvapitri: name.isSarvapitri,
    labelHi: `पितृ पक्ष — ${name.nameHi}`,
    labelEn: `Pitru Paksha — ${name.nameEn}`,
  };
}

/**
 * Same answer, solving the window and its day table cooperatively — the path
 * for Home and the Panchang day panel. `undefined` means cancelled.
 */
export async function pitruPakshaObservanceForDateAsync(
  date: Date,
  isCancelled: () => boolean = () => false,
  options: SolveOptions = {}
): Promise<PitruPakshaDayObservance | null | undefined> {
  const day = startOfLocalDay(date);
  const year = day.getFullYear();
  const window = await pitruPakshaWindowAsync(year, isCancelled, options);
  if (window === undefined) return undefined;
  if (!window || day.getTime() < window.purnima.getTime() || day.getTime() > window.end.getTime()) return null;
  const days = await runInBackground(pakshaTithiDaysSteps(year, window, options), isCancelled);
  if (days === undefined) return undefined;
  return pitruPakshaObservanceForDate(day, options);
}

/** Test-only: clear the per-year window memo. */
export function __resetPitruPakshaWindowCacheForTests(): void {
  windowCache.clear();
  tithiDaysCache.clear();
}
