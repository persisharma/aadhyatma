import { computeTithiAndMonth, getSiderealSunLng, locationKey, UJJAIN_CITY_ID } from './engine';
import { OBSERVANCE_RULES } from './festivals';
import { getStoredObservanceYear } from './observanceStore';
import { PRECOMPUTED_OBSERVANCES } from './precomputedObservances';
import type { CalendarSystem, GeoLocation, ObservanceRule, ResolvedObservance, ResolvedFestival } from './types';

// Coordinates + the stable city id used for cache keys; omitted ⇒ Ujjain.
export type ObservanceLocation = GeoLocation & { cityId?: string };

const cache = new Map<string, ResolvedObservance[]>();
const ruleById = new Map(OBSERVANCE_RULES.map((rule) => [rule.id, rule] as const));

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

  for (const rule of OBSERVANCE_RULES) {
    const resolved = rule.type === 'solar'
      ? findSolarFestivalDate(rule, year)
      : findObservanceDate(rule, startDate, endDate, calendarSystem, location);
    if (resolved && !byId.has(rule.id)) {
      byId.set(rule.id, resolved);
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
        // skip dates that fail computation, same as findObservanceDate
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
function matchesRuleOnDate(rule: ObservanceRule, date: Date, calendarSystem: CalendarSystem, location?: ObservanceLocation): boolean {
  if (rule.type === 'solar') {
    const resolved = findSolarFestivalDate(rule, date.getFullYear());
    return resolved !== null && isSameLocalDate(resolved.date, date);
  }
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const { tithiIndex, lunarMonth } = computeTithiAndMonth(date, { calendarSystem: computationSystem, location });
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
  calendarSystem: CalendarSystem,
  location?: ObservanceLocation
): ResolvedObservance | null {
  const current = new Date(start);
  while (current <= end) {
    try {
      if (matchesRuleOnDate(rule, current, calendarSystem, location)) {
        return { date: new Date(current), rule };
      }
    } catch {
      // skip dates that fail computation
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}
