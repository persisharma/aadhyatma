import { computeTithiAndMonth, getSiderealSunLng } from './engine';
import { getObservanceCatalog, OBSERVANCE_RULES } from './festivals';
import { PRECOMPUTED_OBSERVANCES } from './precomputedObservances';
import type { CalendarSystem, ObservanceRule, ResolvedObservance, ResolvedFestival } from './types';

const cache = new Map<string, ResolvedObservance[]>();
const ruleById = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));
const defaultRules = getObservanceCatalog();

function cacheKey(year: number, calendarSystem: CalendarSystem): string {
  return `${calendarSystem}:${year}`;
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// Observance dates are deterministic, so they are precomputed offline
// (scripts/gen-precomputed-observances.mts) and read instantly here — the live
// per-day sunrise + lunar-month solves froze the Panchang screen on real devices.
// Years not in the precomputed table fall back to the live scan.
export function resolveObservancesForYear(
  year: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const key = cacheKey(year, calendarSystem);
  const cached = cache.get(key);
  if (cached) return cached;

  const precomputed = PRECOMPUTED_OBSERVANCES[key];
  const results = precomputed
    ? reconstructPrecomputed(precomputed)
    : resolveObservancesForYearLive(year, calendarSystem);
  cache.set(key, results);
  return results;
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
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const byId = new Map<string, ResolvedObservance>();
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (const rule of defaultRules) {
    const resolved = resolveRuleDates(rule, year, startDate, endDate, calendarSystem);
    for (const item of resolved) {
      byId.set(`${rule.id}:${dateKey(item.date)}`, item);
    }
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
  withinDays?: number
): ResolvedObservance[] {
  const year = fromDate.getFullYear();
  const all = [
    ...resolveObservancesForYear(year, calendarSystem),
    ...resolveObservancesForYear(year + 1, calendarSystem),
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
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  return resolveObservancesForYear(date.getFullYear(), calendarSystem)
    .filter((item) => isSameLocalDate(item.date, date));
}

export function getObservancesForMonth(
  year: number,
  month: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  return resolveObservancesForYear(year, calendarSystem)
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
  calendarSystem: CalendarSystem
): ResolvedObservance[] {
  if (rule.ruleType === 'catalog-only' || rule.recurrence === 'catalog') return [];
  if (rule.ruleType === 'solar-sankranti' || rule.type === 'solar') {
    const resolved = findSolarFestivalDate(rule, year);
    return resolved ? [resolved] : [];
  }
  if (rule.ruleType === 'relative-to-lunar') {
    return findRelativeRuleDates(rule, startDate, endDate, calendarSystem);
  }
  return findObservanceDates(rule, startDate, endDate, calendarSystem);
}

// Does `rule` fall on this exact day? Shared by the year resolver and the bounded
// per-day / per-month / upcoming lookups so they always agree.
function matchesRuleOnDate(rule: ObservanceRule, date: Date, calendarSystem: CalendarSystem): boolean {
  if (rule.ruleType === 'catalog-only' || rule.recurrence === 'catalog') return false;
  if (rule.ruleType === 'solar-sankranti' || rule.type === 'solar') {
    const resolved = findSolarFestivalDate(rule, date.getFullYear());
    return resolved !== null && isSameLocalDate(resolved.date, date);
  }
  if (rule.ruleType === 'relative-to-lunar') {
    return findRelativeRuleDates(rule, startOfYear(date), endOfYear(date), calendarSystem)
      .some((item) => isSameLocalDate(item.date, date));
  }
  if (rule.ruleType === 'weekday-in-lunar-month') {
    if (rule.weekday === undefined || rule.lunarMonth === undefined) return false;
    if (date.getDay() !== rule.weekday) return false;
    const { lunarMonth } = computeTithiAndMonth(date, { calendarSystem });
    return lunarMonth === monthForRuleInSystem(rule, calendarSystem);
  }
  return matchesLunarTithiRuleOnDate(rule, date, calendarSystem);
}

function matchesLunarTithiRuleOnDate(rule: ObservanceRule, date: Date, calendarSystem: CalendarSystem): boolean {
  if (!rule.paksha || rule.tithi === undefined) return false;
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const { tithiIndex, lunarMonth } = computeTithiAndMonth(date, { calendarSystem: computationSystem });
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
  calendarSystem: CalendarSystem
): ResolvedObservance[] {
  const results: ResolvedObservance[] = [];
  const current = new Date(start);
  while (current <= end) {
    try {
      if (matchesRuleOnDate(rule, current, calendarSystem)) {
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
  calendarSystem: CalendarSystem
): ResolvedObservance[] {
  if (rule.relativeRule !== 'friday-before-purnima') return [];
  if (rule.weekday === undefined || !rule.paksha || rule.tithi === undefined) return [];

  const anchorRule: ObservanceRule = {
    ...rule,
    ruleType: 'lunar-tithi',
    recurrence: 'annual',
    relativeRule: undefined,
  };
  const anchors = findObservanceDates(anchorRule, start, end, calendarSystem);
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
