/**
 * Composes the panchang engine (via usePanchangForDate) into a day's muhurat
 * windows, plus a live "now" read. Keeps muhurat.ts pure — this hook is the only
 * place the clock and the engine meet.
 */
import { useMemo } from 'react';
import { usePanchangForDate } from '@/panchang/usePanchang';
import { useMinuteTick } from '@/utils/useMinuteTick';
import type { CalendarSystem, PanchangData } from '@/panchang/types';
import {
  computeMuhuratDay,
  classifyNow,
  type ChoghadiyaPeriod,
  type KaalWindow,
  type MuhuratDay,
} from './muhurat';

export type UseMuhuratResult = MuhuratDay & {
  /** The day's full panchang (tithi/nakshatra/… for the card header). */
  panchang: PanchangData;
  /** True when `date` is today (so the "now" read applies). */
  isToday: boolean;
  nowChoghadiya: ChoghadiyaPeriod | null;
  nowKaal: KaalWindow | null;
};

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function useMuhurat(date: Date, calendarSystem: CalendarSystem): UseMuhuratResult {
  const dateMs = date.getTime();
  const nextDate = useMemo(() => new Date(dateMs + 86_400_000), [dateMs]);

  // Both are cheap memoised engine solves (~4ms each), location-aware.
  const today = usePanchangForDate(date, calendarSystem);
  const tomorrow = usePanchangForDate(nextDate, calendarSystem);

  const md = useMemo(
    () => computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, date.getDay()),
    [today.sunrise, today.sunset, tomorrow.sunrise, dateMs]
  );

  const tick = useMinuteTick();
  const isToday = isSameLocalDay(date, new Date());

  const now = useMemo(
    () => (isToday ? classifyNow(md, new Date()) : { nowChoghadiya: null, nowKaal: null }),
    // `tick` drives the minute refresh; md/isToday cover the rest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [md, isToday, tick]
  );

  return { ...md, panchang: today, isToday, nowChoghadiya: now.nowChoghadiya, nowKaal: now.nowKaal };
}
