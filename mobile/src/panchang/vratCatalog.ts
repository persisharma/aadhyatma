// Pure browse-catalog helpers for the "Vrat & Parv" surface.
// All functions are deterministic given the bundled observance rules + the
// (cached/precomputed) year resolver, so they are unit-tested via `tsx --test`.

import { getObservanceCatalog, OBSERVANCE_RULES } from './festivals';
import { resolveObservancesForYear } from './festivalEngine';
import { KATHA_CONTENT } from './kathaContent';
import { LENS_IDS, type ObservanceLens } from './lenses';
import type {
  CalendarSystem,
  KathaContentEntry,
  ObservanceRule,
  ResolvedObservance,
} from './types';

/** Observance categories the catalog lets the user browse by tile. */
export type BrowseCategory = 'vrat' | 'festival' | 'upavas';

export const BROWSE_CATEGORIES: readonly BrowseCategory[] = ['vrat', 'festival', 'upavas'];

export type CategoryCount = { category: BrowseCategory; count: number };

const RULE_BY_ID = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));

/** Look up any observance rule (including hidden/advanced) by id. */
export function getRuleById(id: string): ObservanceRule | null {
  return RULE_BY_ID.get(id) ?? null;
}

/** Default-visible rules of a single browsable category. */
export function getRulesForCategory(category: BrowseCategory): ObservanceRule[] {
  // Dedupe by id: the catalog can surface the same rule id twice, which both
  // shows a duplicate row and (with key={rule.id}) triggers React's "two children
  // with the same key" warning. Deduping here keeps the list and the category
  // counts consistent. (The underlying duplicate ids are a data issue worth
  // cleaning up at source in festivals.ts.)
  const seen = new Set<string>();
  return getObservanceCatalog().filter((rule) => {
    if (rule.category !== category || seen.has(rule.id)) return false;
    seen.add(rule.id);
    return true;
  });
}

/** Live counts per browsable category, for the landing tiles. */
export function getCategoryCounts(): CategoryCount[] {
  return BROWSE_CATEGORIES.map((category) => ({
    category,
    count: getRulesForCategory(category).length,
  }));
}

/**
 * The default-visible rules ONE क्षेत्रीय पंचांग adds (PRD-42 §4.1).
 *
 * This is the answer to "what did turning जैन on actually give me?" — a question
 * the additive contract makes hard to answer from the calendar itself, because a
 * lensed day sits among the universal ones with nothing marking it. A rule that
 * carries several lenses is listed under each of them (Rath Yatra is Odisha's
 * AND Bengal's), and the hidden/advanced tier is excluded for the same reason it
 * is excluded from every other browse surface. Deduped by id like the category
 * lists. Registry order, so the sheet and the catalog agree.
 */
export function getRulesForLens(lens: ObservanceLens): ObservanceRule[] {
  const seen = new Set<string>();
  return OBSERVANCE_RULES.filter((rule) => {
    if (rule.visibility !== 'default' || !rule.lens || !rule.lens.includes(lens)) return false;
    if (seen.has(rule.id)) return false;
    seen.add(rule.id);
    return true;
  });
}

export type LensAddition = { lens: ObservanceLens; rules: ObservanceRule[] };

/**
 * What the ACTIVE set adds, grouped by lens in registry order — the व्रत-पर्व
 * landing's "आपके पंचांग से" section. A lens that adds nothing in this build is
 * still returned with an empty list: the honest thing to show a user who turned
 * on सिंधी is "nothing yet", not silence that reads as "you did nothing".
 */
export function getLensAdditions(lenses: ReadonlySet<ObservanceLens>): LensAddition[] {
  return LENS_IDS.filter((lens) => lenses.has(lens)).map((lens) => ({ lens, rules: getRulesForLens(lens) }));
}

/** The bundled bilingual katha library (the "Katha" tile target). */
export function getKathaLibrary(): readonly KathaContentEntry[] {
  return KATHA_CONTENT;
}

export function getKathaCount(): number {
  return KATHA_CONTENT.length;
}

/** The next `count` occurrences of a single rule on/after `fromDate`, ascending. */
export function getNextOccurrences(
  ruleId: string,
  fromDate: Date,
  count: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const year = fromDate.getFullYear();
  const start = new Date(year, fromDate.getMonth(), fromDate.getDate());
  const all = [
    ...resolveObservancesForYear(year, calendarSystem),
    ...resolveObservancesForYear(year + 1, calendarSystem),
  ];
  return all
    .filter((item) => item.rule.id === ruleId && item.date.getTime() >= start.getTime())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

/** The single soonest occurrence of a rule on/after `fromDate`, or null. */
export function getNextOccurrence(
  ruleId: string,
  fromDate: Date,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance | null {
  return getNextOccurrences(ruleId, fromDate, 1, calendarSystem)[0] ?? null;
}
