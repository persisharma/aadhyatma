/**
 * Composes the panchang engine into a day's muhurat windows, plus a live "now"
 * read. Keeps muhurat.ts pure — this hook is the only place the clock and the
 * engine meet.
 *
 * The engine solves run OFF the render path (setTimeout, like
 * usePanchangForSelection) — a couple of astronomy solves are enough to stutter
 * the tab on a real device, so they must never run synchronously during render.
 */
import { useEffect, useMemo, useState } from 'react';
import { computePanchangForDate } from '@/panchang/engine';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMinuteTick } from '@/utils/useMinuteTick';
import type { CalendarSystem, PanchangData } from '@/panchang/types';
import {
  computeMuhuratDay,
  type ChoghadiyaPeriod,
  type KaalWindow,
  type MuhuratDay,
} from './muhurat';

export type UseMuhuratResult = {
  /** null while the (deferred) solve is in flight or the day is invalid. */
  muhurat: MuhuratDay | null;
  panchang: PanchangData | null;
  /** True when `date` is today (so the "now" read applies). */
  isToday: boolean;
  nowChoghadiya: ChoghadiyaPeriod | null;
  nowKaal: KaalWindow | null;
};

const DAY_MS = 86_400_000;

function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type Solved = {
  md: MuhuratDay;
  panchang: PanchangData;
  /** Choghadiya periods that could contain "now" — includes last night's window
   * (yesterday sunset → today sunrise) so pre-dawn hours resolve correctly. */
  nowPeriods: ChoghadiyaPeriod[];
};

export function useMuhurat(date: Date, calendarSystem: CalendarSystem): UseMuhuratResult {
  const { location } = usePanchangLocation();
  const dateMs = date.getTime();
  const cityId = location.cityId;
  const isToday = isSameLocalDay(date, new Date());

  const [solved, setSolved] = useState<Solved | null>(null);

  useEffect(() => {
    let cancelled = false;
    setSolved(null);
    const handle = setTimeout(() => {
      try {
        const d = new Date(dateMs);
        const today = computePanchangForDate(d, { calendarSystem, location });
        const tomorrow = computePanchangForDate(new Date(dateMs + DAY_MS), { calendarSystem, location });
        // Guard against degenerate/inverted spans (bad input / polar latitudes).
        if (today.sunset <= today.sunrise || tomorrow.sunrise <= today.sunset) return;

        const md = computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, d.getDay());
        const nowPeriods = [...md.dayChoghadiya, ...md.nightChoghadiya];

        // Pre-dawn correction: before today's sunrise, the active choghadiya
        // belongs to yesterday's night window. Only relevant when `date` is today.
        if (isToday) {
          const yd = new Date(dateMs - DAY_MS);
          const yesterday = computePanchangForDate(yd, { calendarSystem, location });
          if (yesterday.sunset > yesterday.sunrise && today.sunrise > yesterday.sunset) {
            const prev = computeMuhuratDay(yesterday.sunrise, yesterday.sunset, today.sunrise, yd.getDay());
            nowPeriods.unshift(...prev.nightChoghadiya);
          }
        }

        if (!cancelled) setSolved({ md, panchang: today, nowPeriods });
      } catch {
        /* invalid input — leave null so consumers show a skeleton */
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMs, calendarSystem, cityId, isToday]);

  const tick = useMinuteTick();

  const now = useMemo(() => {
    if (!solved || !isToday) return { nowChoghadiya: null as ChoghadiyaPeriod | null, nowKaal: null as KaalWindow | null };
    const at = Date.now();
    const nowChoghadiya =
      solved.nowPeriods.find((p) => at >= p.start.getTime() && at < p.end.getTime()) ?? null;
    const nowKaal =
      [solved.md.rahu, solved.md.gulika, solved.md.yamaganda].find(
        (k) => at >= k.start.getTime() && at < k.end.getTime()
      ) ?? null;
    return { nowChoghadiya, nowKaal };
    // `tick` drives the minute refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, isToday, tick]);

  return {
    muhurat: solved?.md ?? null,
    panchang: solved?.panchang ?? null,
    isToday,
    nowChoghadiya: now.nowChoghadiya,
    nowKaal: now.nowKaal,
  };
}
