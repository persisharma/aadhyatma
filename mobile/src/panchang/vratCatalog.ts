// Pure browse-catalog helpers for the "Vrat & Parv" surface.
// All functions are deterministic given the bundled observance rules + the
// (cached/precomputed) year resolver, so they are unit-tested via `tsx --test`.

import { getObservanceCatalog, OBSERVANCE_RULES } from './festivals';
import { resolveObservancesForYear } from './festivalEngine';
import { KATHA_CONTENT } from './kathaContent';
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
