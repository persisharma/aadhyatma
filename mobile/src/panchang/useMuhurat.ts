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

/**
 * The astronomy solve for a given (city, calendar day, calendar system, is-today)
 * is deterministic — sunrise/sunset for a fixed date and place never change within
 * a session — so we memoise it across mounts and date navigation. Only the live
 * "now" read changes minute-to-minute, and that is recomputed cheaply from the
 * cached solve via `useMinuteTick`. This makes revisiting a date (or re-mounting
 * the card) instant instead of re-paying the deferred solve each time.
 */
const SOLVE_CACHE = new Map<string, Solved>();
const SOLVE_CACHE_MAX = 90; // ~a season of daily navigation; bounds memory.

function solveCacheKey(
  cityId: string,
  calendarSystem: CalendarSystem,
  date: Date,
  isToday: boolean
): string {
  const day = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return `${cityId}|${calendarSystem}|${day}|${isToday ? 1 : 0}`;
}

function writeSolveCache(key: string, value: Solved): void {
  SOLVE_CACHE.set(key, value);
  if (SOLVE_CACHE.size > SOLVE_CACHE_MAX) {
    const oldest = SOLVE_CACHE.keys().next().value;
    if (oldest !== undefined) SOLVE_CACHE.delete(oldest);
  }
}

export function useMuhurat(date: Date, calendarSystem: CalendarSystem): UseMuhuratResult {
  const { location } = usePanchangLocation();
  const dateMs = date.getTime();
  const cityId = location.cityId;
  const isToday = isSameLocalDay(date, new Date());
  const cacheKey = solveCacheKey(cityId, calendarSystem, date, isToday);

  // Seed from the cache so a previously-solved date renders instantly (no null
  // flash / skeleton) on re-mount or re-navigation.
  const [solved, setSolved] = useState<Solved | null>(() => SOLVE_CACHE.get(cacheKey) ?? null);

  useEffect(() => {
    const cached = SOLVE_CACHE.get(cacheKey);
    if (cached) {
      // Synchronous set (no deferral) — the solve is already done for this day.
      setSolved(cached);
      return;
    }

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

        const value: Solved = { md, panchang: today, nowPeriods };
        writeSolveCache(cacheKey, value);
        if (!cancelled) setSolved(value);
      } catch {
        /* invalid input — leave null so consumers show a skeleton */
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

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
