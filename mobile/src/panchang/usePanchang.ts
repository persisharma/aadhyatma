import { useRef } from 'react';
import { computePanchangForDate } from './engine';
import { getUpcomingFestivals } from './festivalEngine';
import type { PanchangData, ResolvedFestival } from './types';

export type UsePanchangResult = {
  today: PanchangData;
  upcoming: ResolvedFestival[];
};

export function useTodayPanchang(): UsePanchangResult {
  const cacheRef = useRef<{ key: string; value: UsePanchangResult } | null>(null);
  const todayKey = new Date().toDateString();
  if (!cacheRef.current || cacheRef.current.key !== todayKey) {
    const now = new Date();
    const today = computePanchangForDate(now);
    const upcoming = getUpcomingFestivals(now, 6);
    cacheRef.current = { key: todayKey, value: { today, upcoming } };
  }
  return cacheRef.current.value;
}

export function usePanchangForDate(date: Date): PanchangData {
  const dateMs = date.getTime();
  return useMemo(() => computePanchangForDate(new Date(dateMs)), [dateMs]);
}
