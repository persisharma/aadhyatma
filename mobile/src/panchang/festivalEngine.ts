import { addDays } from './calendarGrid';
import { computeTithiAndMonth, getSiderealSunLng, locationKey, tithiAtMadhyahna, tithiAtMoonrise, UJJAIN_CITY_ID } from './engine';
import { getObservanceCatalog, OBSERVANCE_RULES } from './festivals';
import { getStoredObservanceYear } from './observanceStore';
import { PRECOMPUTED_OBSERVANCES } from './precomputedObservances';
import type { CalendarSystem, GeoLocation, ObservanceRule, ResolvedObservance, ResolvedFestival } from './types';

// Coordinates + the stable city id used for cache keys; omitted ⇒ Ujjain.
export type ObservanceLocation = GeoLocation & { cityId?: string };

const cache = new Map<string, ResolvedObservance[]>();
const ruleById = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));
const defaultRules = getObservanceCatalog();

function cacheKey(year: number, calendarSystem: CalendarSystem, location?: ObservanceLocation): string {
  return `${calendarSystem}:${locationKey(location)}:${year}`;
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// Observance dates are deterministic, so for the Ujjain default they are precomputed
// offline (scripts/gen-precomputed-observances.mts) and read instantly here — the live
// per-day sunrise + lunar-month solves froze the Panchang screen on real devices.
// Other locations read the persisted observanceStore (filled by a background scan);
// until that lands, they fall back to the Ujjain dates rather than ever running the
// multi-second live scan on a render path.
export function resolveObservancesForYear(
  year: number,
  calendarSystem: CalendarSystem = 'purnimant',
  location?: ObservanceLocation
): ResolvedObservance[] {
  const cityId = locationKey(location);
  const key = cacheKey(year, calendarSystem, location);
  const cached = cache.get(key);
  if (cached) return cached;

  if (cityId === UJJAIN_CITY_ID) {
    const precomputed = PRECOMPUTED_OBSERVANCES[`${calendarSystem}:${year}`];
    const results = precomputed
      ? reconstructPrecomputed(precomputed)
      : resolveObservancesForYearLive(year, calendarSystem);
    cache.set(key, results);
    return results;
  }

  const stored = getStoredObservanceYear(cityId, calendarSystem, year);
  if (stored) {
    const results = reconstructPrecomputed(stored);
    cache.set(key, results);
    return results;
  }

  // Approximate fallback — deliberately NOT memoised under this location's key, so the
  // accurate results take over as soon as the background scan / hydration lands.
  return resolveObservancesForYear(year, calendarSystem);
}

// True when resolveObservancesForYear would return location-accurate dates (rather
// than the Ujjain fallback) for this year. Lets the UI show an "updating…" hint.
export function isObservanceDataReady(
  year: number,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): boolean {
  const cityId = locationKey(location);
  if (cityId === UJJAIN_CITY_ID) return true;
  return cache.has(cacheKey(year, calendarSystem, location))
    || getStoredObservanceYear(cityId, calendarSystem, year) !== null;
}

function reconstructPrecomputed(entries: { id: string; date: string }[]): ResolvedObservance[] {
  const results: ResolvedObservance[] = [];
  for (const { id, date } of entries) {
    const rule = ruleById.get(id);
    if (!rule) continue;
    const [y, m, d] = date.split('-').map(Number);
    results.push({ date: new Date(y, m - 1, d), rule });
  }
  return results.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// Live full-year scan. Used to generate the precomputed table and as a fallback for
// years not present in it. Heavy (per-day astronomy) — never call on a render path.
export function resolveObservancesForYearLive(
  year: number,
  calendarSystem: CalendarSystem = 'purnimant',
  location?: ObservanceLocation
): ResolvedObservance[] {
  const byId = new Map<string, ResolvedObservance>();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (const rule of defaultRules) {
    const resolved = resolveRuleDates(rule, year, startDate, endDate, calendarSystem, location);
    for (const item of resolved) {
      byId.set(`${rule.id}:${dateKey(item.date)}`, item);
    }
  }

  const results = [...byId.values()];
  results.sort((a, b) => a.date.getTime() - b.date.getTime());
  return results;
}

// One animation frame is ~16 ms; keep each synchronous burst comfortably under that
// so the background warm scan can never drop a frame on Hermes. We budget by elapsed
// time rather than a fixed day-stride because a single day's sunrise + lunar-month
// solve is itself variable-cost — a fixed stride either yields too rarely (jank) or
// too often (slow). Re-checked after every unit of heavy work.
const FRAME_BUDGET_MS = 8;

// Chunked flavor of the live scan for on-device background use: warms the per-day
// tithi/month cache, then resolves every rule against that warm cache — yielding to
// the event loop whenever a slice has run past one frame's budget so the UI stays
// responsive throughout. Krishna-paksha ekadashis always compute under amanta
// (computationSystemForRule), so purnimant also warms the amanta day cache. Produces
// results identical to resolveObservancesForYearLive (asserted in location.test).
export async function resolveObservancesForYearLiveChunked(
  year: number,
  calendarSystem: CalendarSystem,
  location: ObservanceLocation
): Promise<ResolvedObservance[]> {
  const systems: CalendarSystem[] = calendarSystem === 'purnimant' ? ['purnimant', 'amanta'] : ['amanta'];
  let sliceStart = Date.now();
  const breathe = async () => {
    if (Date.now() - sliceStart < FRAME_BUDGET_MS) return;
    await new Promise((resolve) => setTimeout(resolve, 0));
    sliceStart = Date.now();
  };

  // 1) Warm the per-day tithi/month cache — the heavy astronomy lives here.
  // One day past each year edge is included: the kshaya/vriddhi matcher looks
  // one day ahead (Dec 31 → next Jan 1, cold in leap years otherwise) and one
  // day behind (Jan 1 → previous Dec 31).
  for (let d = -1; d <= 366; d++) {
    const date = new Date(year, 0, 1 + d);
    for (const system of systems) {
      try {
        computeTithiAndMonth(date, { calendarSystem: system, location });
      } catch {
        // skip dates that fail computation, same as findObservanceDates
      }
      await breathe();
    }
  }

  // 2) Resolve every rule against the now-warm cache. Cheap per call, but ~18k
  //    iterations across all rules — still chunked so it can't block a frame either.
  const byId = new Map<string, ResolvedObservance>();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);
  for (const rule of defaultRules) {
    const resolved = resolveRuleDates(rule, year, startDate, endDate, calendarSystem, location);
    for (const item of resolved) {
      byId.set(`${rule.id}:${dateKey(item.date)}`, item);
    }
    await breathe();
  }

  const results = [...byId.values()];
  results.sort((a, b) => a.date.getTime() - b.date.getTime());
  return results;
}

export function resolveFestivalsForYear(year: number): ResolvedFestival[] {
  return resolveObservancesForYear(year, 'purnimant');
}

export function getUpcomingObservances(
  fromDate: Date,
  count: number,
  calendarSystem: CalendarSystem = 'purnimant',
  withinDays?: number,
  location?: ObservanceLocation
): ResolvedObservance[] {
  const year = fromDate.getFullYear();
  const all = [
    ...resolveObservancesForYear(year, calendarSystem, location),
    ...resolveObservancesForYear(year + 1, calendarSystem, location),
  ];
  const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  // Optional horizon: only observances within `withinDays` of the selected day.
  const end = withinDays === undefined
    ? null
    : new Date(start.getFullYear(), start.getMonth(), start.getDate() + withinDays);
  return all
    .filter((f) => f.date.getTime() >= start.getTime() && (end === null || f.date.getTime() <= end.getTime()))
    .slice(0, count);
}

export function getUpcomingFestivals(fromDate: Date, count: number): ResolvedFestival[] {
  return getUpcomingObservances(fromDate, count, 'purnimant');
}

export function getObservancesForDate(
  date: Date,
  calendarSystem: CalendarSystem = 'purnimant',
  location?: ObservanceLocation
): ResolvedObservance[] {
  return resolveObservancesForYear(date.getFullYear(), calendarSystem, location)
    .filter((item) => isSameLocalDate(item.date, date));
}

// Date-key variant for persisted/background surfaces. Unlike Date#getFullYear
// matching, this remains stable if the JS process time zone changes after the
// resolved-year cache was populated.
export function getObservancesForDateKey(
  dateKey: string,
  calendarSystem: CalendarSystem = 'purnimant',
  location?: ObservanceLocation
): ResolvedObservance[] {
  const year = Number(dateKey.slice(0, 4));
  const cityId = locationKey(location);
  const exact = cityId === UJJAIN_CITY_ID
    ? PRECOMPUTED_OBSERVANCES[`${calendarSystem}:${year}`]
    : getStoredObservanceYear(cityId, calendarSystem, year);
  const entries = exact ?? PRECOMPUTED_OBSERVANCES[`${calendarSystem}:${year}`];
  if (entries) return reconstructPrecomputed(entries.filter((item) => item.date === dateKey));
  return getObservancesForDate(new Date(`${dateKey}T12:00:00`), calendarSystem, location);
}

export function getObservancesForMonth(
  year: number,
  month: number,
  calendarSystem: CalendarSystem = 'purnimant',
  location?: ObservanceLocation
): ResolvedObservance[] {
  return resolveObservancesForYear(year, calendarSystem, location)
    .filter((f) => f.date.getFullYear() === year && f.date.getMonth() === month);
}

export function getFestivalsForMonth(year: number, month: number): ResolvedFestival[] {
  return getObservancesForMonth(year, month, 'purnimant');
}

export function searchObservances(
  query: string,
  options: { includeHidden?: boolean } = {}
): ObservanceRule[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  return getObservanceCatalog(options)
    .filter((rule) => searchableText(rule).includes(normalized));
}

const solarDateCache = new Map<string, ResolvedObservance | null>();

function findSolarFestivalDate(rule: ObservanceRule, year: number): ResolvedObservance | null {
  if (rule.solarLongitude === undefined) return null;
  const key = `${rule.id}:${year}`;
  const cached = solarDateCache.get(key);
  if (cached !== undefined) return cached;
  const target = rule.solarLongitude;
  let result: ResolvedObservance | null = null;
  const previousYearDate = new Date(year, 0, 0);
  let previousLongitude = getSiderealSunLng(previousYearDate, previousYearDate.getFullYear());
  for (let d = 1; d <= 366; d++) {
    const date = new Date(year, 0, d);
    if (date.getFullYear() !== year) break;
    const longitude = getSiderealSunLng(date, year);
    if (crossedSolarLongitude(previousLongitude, longitude, target)) {
      result = { date, rule };
      break;
    }
    previousLongitude = longitude;
  }
  solarDateCache.set(key, result);
  return result;
}

function crossedSolarLongitude(previous: number, current: number, target: number): boolean {
  if (current < previous) {
    return target >= previous || target <= current;
  }
  return target >= previous && target <= current;
}

function resolveRuleDates(
  rule: ObservanceRule,
  year: number,
  startDate: Date,
  endDate: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): ResolvedObservance[] {
  if (rule.ruleType === 'catalog-only' || rule.recurrence === 'catalog') return [];
  if (rule.ruleType === 'solar-sankranti' || rule.type === 'solar') {
    const resolved = findSolarFestivalDate(rule, year);
    return resolved ? [resolved] : [];
  }
  if (rule.ruleType === 'relative-to-lunar') {
    return findRelativeRuleDates(rule, startDate, endDate, calendarSystem, location);
  }
  return findObservanceDates(rule, startDate, endDate, calendarSystem, location);
}

// Does `rule` fall on this exact day? Shared by the year resolver and the bounded
// per-day / per-month / upcoming lookups so they always agree.
function matchesRuleOnDate(
  rule: ObservanceRule,
  date: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): boolean {
  if (rule.ruleType === 'catalog-only' || rule.recurrence === 'catalog') return false;
  if (rule.ruleType === 'solar-sankranti' || rule.type === 'solar') {
    const resolved = findSolarFestivalDate(rule, date.getFullYear());
    return resolved !== null && isSameLocalDate(resolved.date, date);
  }
  if (rule.ruleType === 'relative-to-lunar') {
    return findRelativeRuleDates(rule, startOfYear(date), endOfYear(date), calendarSystem, location)
      .some((item) => isSameLocalDate(item.date, date));
  }
  if (rule.ruleType === 'weekday-in-lunar-month') {
    if (rule.weekday === undefined || rule.lunarMonth === undefined) return false;
    if (date.getDay() !== rule.weekday) return false;
    const { lunarMonth } = computeTithiAndMonth(date, { calendarSystem, location });
    return lunarMonth === monthForRuleInSystem(rule, calendarSystem);
  }
  return matchesLunarTithiRuleOnDate(rule, date, calendarSystem, location);
}

// Exported for pitruSmaran.ts (PRD-17): personal shraddha tithis must resolve with
// EXACTLY the conventions festival matching uses (sunrise anga, vriddhi dedupe,
// kshaya fallback, adhik-maas nija guard) — sharing the matcher keeps the two
// surfaces incapable of drifting apart. Not part of the observance-catalog API.
export function matchesLunarTithiRuleOnDate(
  rule: ObservanceRule,
  date: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): boolean {
  if (!rule.paksha || rule.tithi === undefined) return false;
  if (rule.dayRule === 'chandrodaya') {
    return matchesInstantVyapiniRuleOnDate(rule, date, calendarSystem, location, tithiAtMoonrise);
  }
  if (rule.dayRule === 'madhyahna') {
    return matchesInstantVyapiniRuleOnDate(rule, date, calendarSystem, location, tithiAtMadhyahna);
  }
  return matchesUdayaTithiRuleOnDate(rule, date, calendarSystem, location);
}

/**
 * Instant-vyapini day selection — the day whose GIVEN instant the tithi covers.
 * Two instants are wired: moonrise (chandrodaya — Sankashti Chaturthi, Karwa
 * Chauth, Bahula Chaturthi, whose fast ends with the night's moon) and midday
 * (madhyahna — Ganesh Chaturthi's sthapana, Ram Navami's janma, the monthly
 * Vinayaka Chaturthi). The moonrise case is described below; madhyahna is the
 * identical selection at the sunrise–sunset midpoint (Ganesh Chaturthi 2026:
 * Chaturthi runs 14 Sep 7:06 AM → 15 Sep 7:44 AM, so udaya said 15 Sep while
 * every published almanac says 14 Sep, whose midday the tithi covers).
 *
 * Krishna Chaturthi usually begins mid-morning and ends before the next
 * mid-morning, so the sunrise (udaya) answer names the day AFTER the night the
 * moon is actually worshipped: for Bhadrapada 2026 the tithi runs 31 Aug 8:51 AM
 * → 1 Sep 7:42 AM, and udaya matching put Sankashti on 1 Sep, a day whose
 * moonrise (9:22 PM) falls in Panchami — there is no moon to break the fast by.
 * Matching at moonrise puts it on 31 Aug, where the moon rises at 8:39 PM inside
 * Chaturthi. Over 2025–2026 this agrees with the published dates in 23 of 25
 * lunations against udaya's 12.
 *
 * Three cases, in order:
 *  1. This day's moonrise falls inside the target tithi → this is the day, unless
 *     yesterday's moonrise did too (a tithi long enough to span two moonrises is
 *     kept on the first — the same "first of two" convention udaya matching uses
 *     for a vriddhi tithi).
 *  2. Yesterday's moonrise fell inside it → yesterday owns this lunation's vrat.
 *  3. No moonrise falls inside it at all (the tithi opened after one moonrise and
 *     closed before the next — Kartik 2025, where Chaturthi ran 9 Oct 10:54 PM →
 *     10 Oct 7:38 PM): no night can host the sighting, so the day falls back to
 *     the udaya rule, which is what published almanacs do there too (10 Oct 2025
 *     for both Karwa Chauth and that month's Sankashti).
 */
function matchesInstantVyapiniRuleOnDate(
  rule: ObservanceRule,
  date: Date,
  calendarSystem: CalendarSystem,
  location: ObservanceLocation | undefined,
  tithiAtInstant: typeof tithiAtMoonrise
): boolean {
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const opts = { calendarSystem: computationSystem, location };
  const target = rule.paksha === 'shukla' ? rule.tithi! - 1 : rule.tithi! + 14;
  const yesterdayCovers = tithiAtInstant(addDays(date, -1), target, opts) === target;
  if (tithiAtInstant(date, target, opts) === target) {
    return !yesterdayCovers && monthMatchesRule(rule, date, calendarSystem, location);
  }
  if (yesterdayCovers) return false;
  return matchesUdayaTithiRuleOnDate(rule, date, calendarSystem, location);
}

/**
 * The lunar-month guard the udaya matcher applies, reused by instant-vyapini
 * (chandrodaya/madhyahna) matching. Named-month rules (Karwa Chauth in Kartik) are observed in the nija
 * month, never the adhik one that repeats it; monthly rules have no month to
 * check. The matched instant and its sunrise share a lunar month for every tithi
 * these rules use — a chaturthi or navami is days from either month boundary — so
 * this day's sunrise month is the authoritative one here.
 */
function monthMatchesRule(
  rule: ObservanceRule,
  date: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): boolean {
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  if (matchingMonth === null) return true;
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const { lunarMonth, isAdhik } = computeTithiAndMonth(date, { calendarSystem: computationSystem, location });
  return lunarMonth === matchingMonth && !isAdhik;
}

function matchesUdayaTithiRuleOnDate(
  rule: ObservanceRule,
  date: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): boolean {
  if (!rule.paksha || rule.tithi === undefined) return false;
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const opts = { calendarSystem: computationSystem, location };
  const { tithiIndex, lunarMonth, isAdhik } = computeTithiAndMonth(date, opts);
  // Festivals tied to a specific named lunar month (e.g. Nirjala Ekadashi in
  // Jyeshtha) are observed in the nija (true) month, never the adhik (leap)
  // month that repeats it. Monthly vrats have no fixed month (matchingMonth ===
  // null) and still recur inside the adhik maas, so only guard the named ones.
  // This day's-month test must NOT pre-empt the kshaya branch below: on a kshaya
  // month-opening pratipada the sunrise tithi is the closing amavasya/purnima of
  // the PREVIOUS lunation (possibly adhik), and only tomorrow's month decides.
  const monthMatch = matchingMonth === null || (lunarMonth === matchingMonth && !isAdhik);
  const target = rule.paksha === 'shukla' ? rule.tithi - 1 : rule.tithi + 14;
  if (tithiIndex === target) {
    if (!monthMatch) return false;
    // Vriddhi dedupe: the same tithi at yesterday's sunrise too means it spans
    // two civil days; the vrat is observed on the first (its evening/night —
    // pradosh, moonrise, nishita — always falls inside the tithi), so the
    // second day must not fire the rule again.
    return computeTithiAndMonth(addDays(date, -1), opts).tithiIndex !== tithiIndex;
  }
  // Kshaya fallback: when the target tithi touches no sunrise (it begins after
  // this sunrise and ends before tomorrow's), the sunrise-tithi index jumps from
  // target-1 today to target+1 tomorrow. DrikPanchang observes such a vrat on the
  // day the tithi actually prevails — this one (e.g. Yogini Ekadashi on 10 Jul
  // 2026, tithi 8:16 AM → 5:22 AM next day). Without this, the observance would
  // silently vanish for that fortnight. The look-ahead/behind reuses the per-day
  // cache (warmed one day past both year edges by the chunked scanner), so a
  // sequential year scan pays no extra astronomy.
  if (tithiIndex === (target + 29) % 30) {
    const next = computeTithiAndMonth(addDays(date, 1), opts);
    if (next.tithiIndex !== (target + 1) % 30) return false;
    if (monthMatch) return true;
    // This day's sunrise month is authoritative for every kshaya tithi except the
    // month-OPENING pratipada (shukla 1 under amanta, krishna 1 under purnimant),
    // whose lunation boundary falls at its start — only there does tomorrow's
    // month apply. A kshaya purnima/amavasya ends the OLD month and must never
    // borrow tomorrow's (that misplaced Holi 2027 onto Magha Purnima).
    const opensMonth = computationSystem === 'amanta' ? target === 0 : target === 15;
    return opensMonth && next.lunarMonth === matchingMonth && !next.isAdhik;
  }
  return false;
}

function monthForRuleInSystem(rule: ObservanceRule, calendarSystem: CalendarSystem): number | null {
  if (rule.lunarMonth === undefined) return null;
  if (isEkadashiNameRule(rule)) return rule.lunarMonth;
  if (calendarSystem === 'amanta' && rule.paksha === 'krishna') {
    return rule.lunarMonth === 1 ? 12 : rule.lunarMonth - 1;
  }
  return rule.lunarMonth;
}

function computationSystemForRule(rule: ObservanceRule, calendarSystem: CalendarSystem): CalendarSystem {
  if (isEkadashiNameRule(rule) && rule.paksha === 'krishna') {
    return 'amanta';
  }
  return calendarSystem;
}

function isEkadashiNameRule(rule: ObservanceRule): boolean {
  return rule.tithi === 11 && rule.marker === 'halfmoon' && rule.category === 'vrat' && rule.lunarMonth !== undefined;
}

function findObservanceDates(
  rule: ObservanceRule,
  start: Date,
  end: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): ResolvedObservance[] {
  const results: ResolvedObservance[] = [];
  const current = new Date(start);
  while (current <= end) {
    try {
      if (matchesRuleOnDate(rule, current, calendarSystem, location)) {
        results.push({ date: new Date(current), rule });
        if (rule.recurrence === 'annual') break;
      }
    } catch {
      // skip dates that fail computation
    }
    current.setDate(current.getDate() + 1);
  }
  return results;
}

function findRelativeRuleDates(
  rule: ObservanceRule,
  start: Date,
  end: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): ResolvedObservance[] {
  if (rule.relativeRule !== 'friday-before-purnima') return [];
  if (rule.weekday === undefined || !rule.paksha || rule.tithi === undefined) return [];

  const anchorRule: ObservanceRule = {
    ...rule,
    ruleType: 'lunar-tithi',
    recurrence: 'annual',
    relativeRule: undefined,
  };
  const anchors = findObservanceDates(anchorRule, start, end, calendarSystem, location);
  return anchors.map((anchor) => {
    const date = new Date(anchor.date);
    while (date.getDay() !== rule.weekday) {
      date.setDate(date.getDate() - 1);
    }
    return { date, rule };
  }).filter((item) => item.date >= start && item.date <= end);
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function startOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 0, 1);
}

function endOfYear(date: Date): Date {
  return new Date(date.getFullYear(), 11, 31);
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function searchableText(rule: ObservanceRule): string {
  return normalizeSearch([
    rule.id,
    rule.nameEn,
    rule.nameHi,
    rule.deityEn,
    rule.deityHi,
    rule.kathaId ?? '',
    ...(rule.searchTerms ?? []),
  ].join(' '));
}
