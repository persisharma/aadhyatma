import { computeTithiAndMonth, getSiderealSunLng } from './engine';
import { OBSERVANCE_RULES } from './festivals';
import { PRECOMPUTED_OBSERVANCES } from './precomputedObservances';
import type { CalendarSystem, ObservanceRule, ResolvedObservance, ResolvedFestival } from './types';

const cache = new Map<string, ResolvedObservance[]>();
const ruleById = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));

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

  for (const rule of OBSERVANCE_RULES) {
    const resolved = rule.type === 'solar'
      ? findSolarFestivalDate(rule, year)
      : findObservanceDate(rule, startDate, endDate, calendarSystem);
    if (resolved && !byId.has(rule.id)) {
      byId.set(rule.id, resolved);
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
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const year = fromDate.getFullYear();
  const all = [
    ...resolveObservancesForYear(year, calendarSystem),
    ...resolveObservancesForYear(year + 1, calendarSystem),
  ];
  const todayStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  return all
    .filter((f) => f.date.getTime() >= todayStart.getTime())
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

const solarDateCache = new Map<string, ResolvedObservance | null>();

function findSolarFestivalDate(rule: ObservanceRule, year: number): ResolvedObservance | null {
  if (!rule.solarLongitude) return null;
  const key = `${rule.id}:${year}`;
  const cached = solarDateCache.get(key);
  if (cached !== undefined) return cached;
  const target = rule.solarLongitude;
  let result: ResolvedObservance | null = null;
  for (let d = 0; d < 30; d++) {
    const date = new Date(year, 0, 1 + d);
    const lng = getSiderealSunLng(date, year);
    if (lng >= target && lng < target + 2) {
      result = { date, rule };
      break;
    }
  }
  solarDateCache.set(key, result);
  return result;
}

// Does `rule` fall on this exact day? Shared by the year resolver and the bounded
// per-day / per-month / upcoming lookups so they always agree.
function matchesRuleOnDate(rule: ObservanceRule, date: Date, calendarSystem: CalendarSystem): boolean {
  if (rule.type === 'solar') {
    const resolved = findSolarFestivalDate(rule, date.getFullYear());
    return resolved !== null && isSameLocalDate(resolved.date, date);
  }
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const { tithiIndex, lunarMonth } = computeTithiAndMonth(date, { calendarSystem: computationSystem });
  const tithiMatch = rule.paksha === 'shukla'
    ? tithiIndex === rule.tithi - 1
    : tithiIndex === rule.tithi + 14;
  return tithiMatch && lunarMonth === matchingMonth;
}

function monthForRuleInSystem(rule: ObservanceRule, calendarSystem: CalendarSystem): number {
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
  return rule.tithi === 11 && rule.marker === 'halfmoon' && rule.category === 'vrat';
}

function findObservanceDate(
  rule: ObservanceRule,
  start: Date,
  end: Date,
  calendarSystem: CalendarSystem
): ResolvedObservance | null {
  const current = new Date(start);
  while (current <= end) {
    try {
      if (matchesRuleOnDate(rule, current, calendarSystem)) {
        return { date: new Date(current), rule };
      }
    } catch {
      // skip dates that fail computation
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}
