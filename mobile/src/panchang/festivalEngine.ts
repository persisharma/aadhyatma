import { computeTithiAndMonth, getSiderealSunLng, locationKey, UJJAIN_CITY_ID } from './engine';
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

// Chunked flavor of the live scan for on-device background use: warms the per-day
// tithi/month cache in small slices, yielding to the event loop between slices so
// Hermes never blocks long enough to drop frames, then runs the sync resolver
// entirely on cache hits. Krishna-paksha ekadashis always compute under amanta
// (computationSystemForRule), so purnimant also warms the amanta day cache.
export async function resolveObservancesForYearLiveChunked(
  year: number,
  calendarSystem: CalendarSystem,
  location: ObservanceLocation,
  yieldEveryDays = 7
): Promise<ResolvedObservance[]> {
  const systems: CalendarSystem[] = calendarSystem === 'purnimant' ? ['purnimant', 'amanta'] : ['amanta'];
  for (let d = 0; d < 366; d++) {
    const date = new Date(year, 0, 1 + d);
    for (const system of systems) {
      try {
        computeTithiAndMonth(date, { calendarSystem: system, location });
      } catch {
        // skip dates that fail computation, same as findObservanceDates
      }
    }
    if (d % yieldEveryDays === yieldEveryDays - 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  return resolveObservancesForYearLive(year, calendarSystem, location);
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

function matchesLunarTithiRuleOnDate(
  rule: ObservanceRule,
  date: Date,
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): boolean {
  if (!rule.paksha || rule.tithi === undefined) return false;
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const { tithiIndex, lunarMonth } = computeTithiAndMonth(date, { calendarSystem: computationSystem, location });
  const tithiMatch = rule.paksha === 'shukla'
    ? tithiIndex === rule.tithi - 1
    : tithiIndex === rule.tithi + 14;
  const monthMatch = matchingMonth === null || lunarMonth === matchingMonth;
  return tithiMatch && monthMatch;
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
