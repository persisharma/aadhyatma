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

// ──────────────────────────────────────────────────────────────────────────────
// क्षेत्रीय पंचांग — which calendars a rule belongs to, and what a calendar brings
// ──────────────────────────────────────────────────────────────────────────────

/**
 * The region-tag table lives in its own module because `festivals.ts` is on the
 * static launch graph and the tags are needed only when a lens surface renders.
 * Same `require()` thunk as `lenses.ts` uses for `lensRegistry.ts`.
 */
function tags(): typeof import('./regionTags') {
  return require('./regionTags') as typeof import('./regionTags');
}

/** The calendars that KEEP a universal rule — the `regionTags.ts` tag, or none. */
export function regionsOf(rule: ObservanceRule): readonly ObservanceLens[] {
  return tags().regionTagsFor(rule.id);
}

/**
 * Every calendar a rule belongs to, in registry order: its `lens` (the calendars
 * that SHOW it) united with its region tags (the calendars that KEEP it — a
 * highlight on a universal rule, `regionTags.ts`). Empty for a plain universal rule.
 */
export function ruleCalendars(rule: ObservanceRule): ObservanceLens[] {
  const regions = regionsOf(rule);
  if (!rule.lens?.length && regions.length === 0) return [];
  const set = new Set<ObservanceLens>([...(rule.lens ?? []), ...regions]);
  return LENS_IDS.filter((lens) => set.has(lens));
}

/** The rule's calendars that are in `active` — what the day-view chip names. */
export function activeCalendarsOf(rule: ObservanceRule, active: ReadonlySet<ObservanceLens>): ObservanceLens[] {
  if (active.size === 0) return [];
  return ruleCalendars(rule).filter((lens) => active.has(lens));
}

/**
 * The default-visible rules ONE क्षेत्रीय पंचांग brings — the lensed rules it adds
 * plus the universal rules tagged as its own (`regionTags.ts`).
 *
 * This is the answer to "what did turning राजस्थान on actually give me?" — a
 * question the additive contract makes hard to answer from the calendar itself,
 * because a regional day sits among the universal ones with nothing marking it.
 * A rule that belongs to several calendars is listed under each of them (Rath
 * Yatra is Odisha's AND Bengal's), and the hidden/advanced tier is excluded for
 * the same reason it is excluded from every other browse surface. Deduped by id
 * like the category lists. Catalog order, so the sheet and the card agree.
 */
export function getRulesForLens(lens: ObservanceLens): ObservanceRule[] {
  const seen = new Set<string>();
  return OBSERVANCE_RULES.filter((rule) => {
    if (rule.visibility !== 'default') return false;
    if (!rule.lens?.includes(lens) && !regionsOf(rule).includes(lens)) return false;
    if (seen.has(rule.id)) return false;
    seen.add(rule.id);
    return true;
  });
}

export type LensAddition = { lens: ObservanceLens; rules: ObservanceRule[] };

let lensesWithContent: ObservanceLens[] | null = null;

/**
 * The lenses that bring at least one observance in THIS build, in registry order.
 *
 * This — not `LENS_IDS` — is what every user-facing surface offers (the sheet's
 * rows, "n available", सभी चुनें, the seed). A switch that changes nothing was the
 * Sept 2026 report in a nutshell ("I selected Jain and it still shows
 * everything"), so a calendar with neither a lensed rule nor a tagged one is not
 * shown. With the region tags every registered calendar currently qualifies
 * (`lens.test.ts` pins that); if that ever stops being true the filter surfaces
 * hide themselves rather than offer a dead switch.
 */
export function getLensesWithContent(): readonly ObservanceLens[] {
  if (!lensesWithContent) lensesWithContent = LENS_IDS.filter((lens) => getRulesForLens(lens).length > 0);
  return lensesWithContent;
}

/** `lenses` narrowed to the calendars this build actually offers — the DISPLAY set. */
export function withContentOnly(lenses: ReadonlySet<ObservanceLens>): Set<ObservanceLens> {
  return new Set(getLensesWithContent().filter((lens) => lenses.has(lens)));
}

/**
 * What the ACTIVE set brings, grouped by lens in registry order — the व्रत-पर्व
 * landing's "आपके पंचांग से" card. Only offered calendars appear, because only
 * those can be turned on from the sheet.
 */
export function getLensAdditions(lenses: ReadonlySet<ObservanceLens>): LensAddition[] {
  return getLensesWithContent()
    .filter((lens) => lenses.has(lens))
    .map((lens) => ({ lens, rules: getRulesForLens(lens) }));
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
