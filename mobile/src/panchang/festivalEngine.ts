import { computePanchangForDate, getSiderealSunLng } from './engine';
import { FESTIVAL_RULES } from './festivals';
import type { FestivalRule, ResolvedFestival } from './types';

const cache = new Map<number, ResolvedFestival[]>();

export function resolveFestivalsForYear(year: number): ResolvedFestival[] {
  const cached = cache.get(year);
  if (cached) return cached;

  const results: ResolvedFestival[] = [];
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31);

  for (const rule of FESTIVAL_RULES) {
    const resolved = rule.type === 'solar'
      ? findSolarFestivalDate(rule, year)
      : findFestivalDate(rule, startDate, endDate);
    if (resolved) {
      results.push(resolved);
    }
  }

  results.sort((a, b) => a.date.getTime() - b.date.getTime());
  cache.set(year, results);
  return results;
}

export function getUpcomingFestivals(fromDate: Date, count: number): ResolvedFestival[] {
  const year = fromDate.getFullYear();
  const thisYear = resolveFestivalsForYear(year);
  const nextYear = resolveFestivalsForYear(year + 1);
  const all = [...thisYear, ...nextYear];

  const todayStart = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
  return all
    .filter((f) => f.date.getTime() >= todayStart.getTime())
    .slice(0, count);
}

export function getFestivalsForMonth(year: number, month: number): ResolvedFestival[] {
  const yearFestivals = resolveFestivalsForYear(year);
  return yearFestivals.filter((f) => {
    return f.date.getFullYear() === year && f.date.getMonth() === month;
  });
}

function findSolarFestivalDate(rule: FestivalRule, year: number): ResolvedFestival | null {
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

function findFestivalDate(rule: FestivalRule, start: Date, end: Date): ResolvedFestival | null {
  const current = new Date(start);
  while (current <= end) {
    try {
      const p = computePanchangForDate(current);
      const tithiMatch = rule.paksha === 'shukla'
        ? p.tithi.index === rule.tithi - 1
        : p.tithi.index === rule.tithi + 14;

      if (tithiMatch && p.lunarMonth.index === rule.lunarMonth) {
        return { date: new Date(current), rule };
      }
    } catch {
      // skip dates that fail computation
    }
    current.setDate(current.getDate() + 1);
  }
  return null;
}
