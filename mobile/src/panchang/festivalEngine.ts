import { computeTithiAndMonth, getSiderealSunLng } from './engine';
import { OBSERVANCE_RULES } from './festivals';
import type { CalendarSystem, ObservanceRule, ResolvedObservance, ResolvedFestival } from './types';

const cache = new Map<string, ResolvedObservance[]>();

function cacheKey(year: number, calendarSystem: CalendarSystem): string {
  return `${calendarSystem}:${year}`;
}

function isSameLocalDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function resolveObservancesForYear(
  year: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const key = cacheKey(year, calendarSystem);
  const cached = cache.get(key);
  if (cached) return cached;

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
  cache.set(key, results);
  return results;
}

export function resolveFestivalsForYear(year: number): ResolvedFestival[] {
  return resolveObservancesForYear(year, 'purnimant');
}

const MAX_UPCOMING_SCAN_DAYS = 420;

export function getUpcomingObservances(
  fromDate: Date,
  count: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  // Scan forward from the selected day, gathering distinct observances until we have
  // `count` of them — typically the next couple of months, never the whole year.
  const byId = new Map<string, ResolvedObservance>();
  const cursor = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  for (let day = 0; day < MAX_UPCOMING_SCAN_DAYS && byId.size < count; day += 1) {
    for (const observance of observancesOnDate(cursor, calendarSystem)) {
      if (!byId.has(observance.rule.id)) byId.set(observance.rule.id, observance);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return [...byId.values()]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, count);
}

export function getUpcomingFestivals(fromDate: Date, count: number): ResolvedFestival[] {
  return getUpcomingObservances(fromDate, count, 'purnimant');
}

export function getObservancesForDate(
  date: Date,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  // Match the rules against this single day — no full-year scan needed.
  return observancesOnDate(date, calendarSystem);
}

export function getObservancesForMonth(
  year: number,
  month: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  // Scan only the requested month, not the whole year.
  const byId = new Map<string, ResolvedObservance>();
  const cursor = new Date(year, month, 1);
  while (cursor.getFullYear() === year && cursor.getMonth() === month) {
    for (const observance of observancesOnDate(cursor, calendarSystem)) {
      if (!byId.has(observance.rule.id)) byId.set(observance.rule.id, observance);
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return [...byId.values()].sort((a, b) => a.date.getTime() - b.date.getTime());
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

// All observances that fall on a single day (deduped by rule id).
function observancesOnDate(date: Date, calendarSystem: CalendarSystem): ResolvedObservance[] {
  const byId = new Map<string, ResolvedObservance>();
  for (const rule of OBSERVANCE_RULES) {
    try {
      if (matchesRuleOnDate(rule, date, calendarSystem) && !byId.has(rule.id)) {
        byId.set(rule.id, { date: new Date(date), rule });
      }
    } catch {
      // skip dates that fail computation
    }
  }
  return [...byId.values()];
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
