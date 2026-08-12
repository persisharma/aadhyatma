/**
 * Composes the panchang engine into a day's muhurat windows, plus a live "now"
 * read. Keeps muhurat.ts pure — this hook is the only place the clock and the
 * engine meet.
 *
 * The engine solves run OFF the render path (setTimeout, like
 * usePanchangForSelection) — a couple of astronomy solves are enough to stutter
 * the tab on a real device, so they must never run synchronously during render.
 *
 * The solves themselves come from the shared, persisted `panchangDayStore`, so
 * Home's Today strip and the daily Muhurat card no longer re-solve on every cold
 * start, and they share days with the Muhurat Finder's sweep.
 */
import { useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useMinuteTick } from '@/utils/useMinuteTick';
import {
  cachedDayInputs,
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  type ScanOptions,
} from '@/panchang/panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from '@/panchang/panchangDayCache';
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
 * The astronomy solve for a given (location, civil day, calendar system) is
 * deterministic, so it comes from the SHARED `panchangDayStore` — the same store
 * the Muhurat Finder, the Panchang tab and the abujh calendar fill, and the one
 * `panchangDayCache` persists. Consequences worth knowing:
 *   - a day the finder already solved makes this hook instant, and vice versa;
 *   - a hydrated cold start skips the solve entirely;
 *   - `MuhuratDay` and `nowPeriods` are NOT cached — they are pure arithmetic
 *     over the three cached days (~microseconds), so they are derived per call
 *     rather than stored under an extra `isToday`-dependent key.
 * This hook previously owned a private `SOLVE_CACHE`; it was per-session,
 * cityId-keyed rather than locationKey-keyed, and invisible to every other
 * surface. Do not reintroduce a local cache here.
 */

/** The three civil days a day's muhurat needs: yesterday (pre-dawn), today, tomorrow. */
function neededDateKeys(dateMs: number, isToday: boolean): string[] {
  const keys = [dateKeyFor(new Date(dateMs)), dateKeyFor(new Date(dateMs + DAY_MS))];
  if (isToday) keys.push(dateKeyFor(new Date(dateMs - DAY_MS)));
  return keys;
}

/**
 * Compose the day's windows from the store. `allowSolve: false` reads cache-only
 * and returns null on any miss — that is what lets a re-mount paint instantly
 * without a solve, and what keeps the astronomy off the render path.
 */
function composeSolved(
  dateMs: number,
  isToday: boolean,
  opts: ScanOptions,
  allowSolve: boolean
): Solved | null {
  const map = dayStoreFor(scopeKeyFor(opts.location, opts.calendarSystem));
  const read = (at: number): PanchangData | null => {
    const d = new Date(at);
    if (!allowSolve) return map.get(dateKeyFor(d))?.p ?? null;
    return cachedDayInputs(map, d, opts).inputs.p;
  };

  const d = new Date(dateMs);
  const today = read(dateMs);
  const tomorrow = read(dateMs + DAY_MS);
  if (!today || !tomorrow) return null;
  // Guard against degenerate/inverted spans (bad input / polar latitudes).
  if (today.sunset <= today.sunrise || tomorrow.sunrise <= today.sunset) return null;

  const md = computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, d.getDay());
  const nowPeriods = [...md.dayChoghadiya, ...md.nightChoghadiya];

  // Pre-dawn correction: before today's sunrise, the active choghadiya belongs to
  // yesterday's night window. Only relevant when `date` is today.
  if (isToday) {
    const yd = new Date(dateMs - DAY_MS);
    const yesterday = read(dateMs - DAY_MS);
    if (!yesterday) return null;
    if (yesterday.sunset > yesterday.sunrise && today.sunrise > yesterday.sunset) {
      const prev = computeMuhuratDay(yesterday.sunrise, yesterday.sunset, today.sunrise, yd.getDay());
      nowPeriods.unshift(...prev.nightChoghadiya);
    }
  }

  return { md, panchang: today, nowPeriods };
}

export function useMuhurat(
  date: Date,
  calendarSystem: CalendarSystem,
  opts?: {
    /**
     * When false, skip the per-minute tick (and with it the live
     * nowChoghadiya/nowKaal refresh) — for consumers that render only the
     * static day windows (e.g. the Home Today strip) and shouldn't re-render
     * every minute. Defaults to true.
     */
    live?: boolean;
  }
): UseMuhuratResult {
  const { location } = usePanchangLocation();
  const dateMs = date.getTime();
  const isToday = isSameLocalDay(date, new Date());
  const scope = scopeKeyFor(location, calendarSystem);
  const cacheKey = `${scope}|${dateKeyFor(date)}|${isToday ? 1 : 0}`;

  // Seed from the shared store so an already-solved day renders instantly (no
  // null flash / skeleton) on re-mount, re-navigation, or after another surface
  // solved it. Cache-only — never a solve on the render path.
  const [solved, setSolved] = useState<Solved | null>(() =>
    composeSolved(dateMs, isToday, { calendarSystem, location }, false)
  );

  useEffect(() => {
    const opts: ScanOptions = { calendarSystem, location };
    const warm = composeSolved(dateMs, isToday, opts, false);
    if (warm) {
      // Synchronous set (no deferral) — every day it needs is already solved.
      setSolved(warm);
      return;
    }

    let cancelled = false;
    setSolved(null);
    let handle: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      handle = setTimeout(async () => {
        try {
          // Disk → memory first: a day persisted by an earlier session (or by the
          // finder's sweep) must not be re-solved. Skipped entirely when the range
          // is already warm, so this costs nothing on a hit.
          await hydratePanchangDays(location, calendarSystem, neededDateKeys(dateMs, isToday));
          if (cancelled) return;
          const value = composeSolved(dateMs, isToday, opts, true);
          if (!cancelled && value) setSolved(value);
          // Flush whatever this scope has solved so far — including days the
          // synchronous Panchang hooks computed on the render path.
          void persistPanchangDays(location, calendarSystem);
        } catch {
          /* invalid input — leave null so consumers show a skeleton */
        }
      }, 0);
    });
    return () => {
      cancelled = true;
      interaction.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  const tick = useMinuteTick(opts?.live !== false);

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
