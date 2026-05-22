import { useMemo } from 'react';
import { computePanchangForDate } from './engine';
import { getUpcomingFestivals } from './festivalEngine';
import type { PanchangData, ResolvedFestival } from './types';

export type UsePanchangResult = {
  today: PanchangData;
  upcoming: ResolvedFestival[];
};

export function useTodayPanchang(): UsePanchangResult {
  return useMemo(() => {
    const now = new Date();
    const today = computePanchangForDate(now);
    const upcoming = getUpcomingFestivals(now, 6);
    return { today, upcoming };
  }, []);
}

export function usePanchangForDate(date: Date): PanchangData {
  const dateMs = date.getTime();
  return useMemo(() => computePanchangForDate(new Date(dateMs)), [dateMs]);
}
