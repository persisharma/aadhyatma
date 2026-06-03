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

export function getUpcomingObservances(
  fromDate: Date,
  count: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const year = fromDate.getFullYear();
  const thisYear = resolveObservancesForYear(year, calendarSystem);
  const nextYear = resolveObservancesForYear(year + 1, calendarSystem);
  const all = [...thisYear, ...nextYear];

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
  return resolveObservancesForYear(date.getFullYear(), calendarSystem).filter((item) => isSameLocalDate(item.date, date));
}

export function getObservancesForMonth(
  year: number,
  month: number,
  calendarSystem: CalendarSystem = 'purnimant'
): ResolvedObservance[] {
  const yearObservances = resolveObservancesForYear(year, calendarSystem);
  return yearObservances.filter((f) => {
    return f.date.getFullYear() === year && f.date.getMonth() === month;
  });
}

export function getFestivalsForMonth(year: number, month: number): ResolvedFestival[] {
  return getObservancesForMonth(year, month, 'purnimant');
}

function findSolarFestivalDate(rule: ObservanceRule, year: number): ResolvedObservance | null {
  if (!rule.solarLongitude) return null;
  const target = rule.solarLongitude;
  for (let d = 0; d < 30; d++) {
    const date = new Date(year, 0, 1 + d);
    const lng = getSiderealSunLng(date, year);
    if (lng >= target && lng < target + 2) {
      return { date, rule };
    }
  }
  return null;
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
  const matchingMonth = monthForRuleInSystem(rule, calendarSystem);
  const computationSystem = computationSystemForRule(rule, calendarSystem);
  const current = new Date(start);
  while (current <= end) {
    try {
      const { tithiIndex, lunarMonth } = computeTithiAndMonth(current, { calendarSystem: computationSystem });
      const tithiMatch = rule.paksha === 'shukla'
        ? tithiIndex === rule.tithi - 1
        : tithiIndex === rule.tithi + 14;

      if (tithiMatch && lunarMonth === matchingMonth) {
        return { date: new Date(current), rule };
      }
    } catch {
      // skip dates that fail computation
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}
