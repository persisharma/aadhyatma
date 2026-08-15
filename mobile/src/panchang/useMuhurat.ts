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
 * start, and they share days with the Muhurat Finder's sweep. For a TODAY
 * surface the same deferred task then rolls that persisted window a week forward
 * (`panchangDayPrewarm`) — without it the window ended at tomorrow and the first
 * launch after every midnight re-solved a day before the strip could paint.
 *
 * DISK AND CPU ARE DEFERRED DIFFERENTLY (Aug 2026). The whole chain used to sit
 * behind one `runAfterInteractions` + `setTimeout(0)`, so a cold start could not
 * read the cache until the UI went idle — a launch's worth of interaction
 * handles stood between a day already on disk and the strip's headline, and it
 * read to the user as "today's panchang is computed every time". Hydration is
 * I/O, so it now starts at once and paints the moment disk answers; only the
 * astronomy for days disk did NOT have, and the roll-forward, wait for an idle
 * UI. Nothing runs at all until the location and calendar-system preferences
 * have settled, because before that the scope key is a placeholder.
 */
import { useEffect, useMemo, useState } from 'react';
import { InteractionManager } from 'react-native';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarHydrated } from '@/panchang/usePanchang';
import { useMinuteTick } from '@/utils/useMinuteTick';
import {
  cachedDayInputs,
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  type ScanOptions,
} from '@/panchang/panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from '@/panchang/panchangDayCache';
import { prewarmPanchangDays } from '@/panchang/panchangDayPrewarm';
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
  const { location, isLoading: locationLoading } = usePanchangLocation();
  const calendarHydrated = usePanchangCalendarHydrated();
  const dateMs = date.getTime();
  const isToday = isSameLocalDay(date, new Date());
  const scope = scopeKeyFor(location, calendarSystem);
  const cacheKey = `${scope}|${dateKeyFor(date)}|${isToday ? 1 : 0}`;
  /**
   * Both inputs to `scope` are AsyncStorage-backed and start on a DEFAULT while
   * they hydrate: `usePanchangLocation` on Ujjain, `usePanchangCalendarSystem`
   * on purnimant. Running the cold chain before they settle spends a hydrate,
   * three astronomy solves and a seven-day roll-forward on a scope that is then
   * thrown away — on the launch path, ahead of the real one. `WidgetCoordinator`
   * already gates on exactly this pair; the daily surfaces did not.
   */
  const scopeSettled = !locationLoading && calendarHydrated;

  // Seed from the shared store so an already-solved day renders instantly (no
  // null flash / skeleton) on re-mount, re-navigation, or after another surface
  // solved it. Cache-only — never a solve on the render path.
  const [solved, setSolved] = useState<Solved | null>(() =>
    composeSolved(dateMs, isToday, { calendarSystem, location }, false)
  );

  useEffect(() => {
    const opts: ScanOptions = { calendarSystem, location };
    const warm = composeSolved(dateMs, isToday, opts, false);
    // Synchronous set (no deferral) when every day it needs is already solved.
    setSolved(warm);
    // Warm AND not a today surface: nothing to solve and no window to roll —
    // don't schedule a deferred task that would have no work to do.
    if (warm && !isToday) return;
    // The scope is still a placeholder — wait rather than work for a city or
    // calendar system the user is about to be moved off. One AsyncStorage read
    // that is already in flight, against a discarded hydrate + 10 solves.
    if (!scopeSettled) return;

    let cancelled = false;
    let interaction: ReturnType<typeof InteractionManager.runAfterInteractions> | undefined;
    let handle: ReturnType<typeof setTimeout> | undefined;
    let release: (() => void) | undefined;

    /**
     * Hand the UI a frame before doing astronomy: interactions first, then one
     * more macrotask. Resolves immediately once cancelled — every caller
     * re-checks `cancelled` after awaiting it.
     */
    const yieldToInteractions = (): Promise<void> =>
      new Promise<void>((resolve) => {
        if (cancelled) {
          resolve();
          return;
        }
        release = resolve;
        interaction = InteractionManager.runAfterInteractions(() => {
          handle = setTimeout(() => {
            release = undefined;
            resolve();
          }, 0);
        });
      });

    void (async () => {
      try {
        let value = warm;

        if (!value) {
          // ── Disk, and NOT behind InteractionManager. Hydration is I/O the JS
          // thread does not perform; gating it on an idle UI only delayed the
          // paint of a day that was already solved on disk — the last thing
          // still making a cache HIT feel like a computation. Only astronomy
          // waits for the UI below. Skipped when the range is already warm, so
          // this costs nothing on an in-memory hit.
          await hydratePanchangDays(location, calendarSystem, neededDateKeys(dateMs, isToday));
          if (cancelled) return;
          // Cache-only: if disk had all three days we are done, with zero
          // engine calls and no wait for interactions.
          value = composeSolved(dateMs, isToday, opts, false);
          if (value) setSolved(value);
        }

        if (!value) {
          // ── Anything disk did not have has to be solved, and that is CPU.
          await yieldToInteractions();
          if (cancelled) return;
          value = composeSolved(dateMs, isToday, opts, true);
          if (value) setSolved(value);
        }

        if (!warm) {
          // Flush whatever this scope has solved so far — including days the
          // synchronous Panchang hooks computed on the render path. Eager and
          // fire-and-forget on purpose: the days now on screen reach disk
          // immediately, rather than waiting behind the roll-forward's solves.
          void persistPanchangDays(location, calendarSystem);
        }

        if (isToday) {
          // Roll the persisted window PAST tomorrow, so the next midnight
          // rollover is a pure cache hit instead of a fresh solve on Home's
          // critical path — the whole point of panchangDayPrewarm. It persists
          // its own days; whichever flush lands second skips what the first
          // already wrote. Always deferred: the days on screen are painted, and
          // nothing waits on this.
          await yieldToInteractions();
          if (cancelled) return;
          await prewarmPanchangDays(location, calendarSystem, {
            isCancelled: () => cancelled,
          });
        }
      } catch {
        /* invalid input — leave null so consumers show a skeleton */
      }
    })();

    return () => {
      cancelled = true;
      interaction?.cancel();
      if (handle !== undefined) clearTimeout(handle);
      // Unblock a chain parked on a yield we just cancelled, so its closures
      // are released instead of held by a promise that can never settle.
      release?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, scopeSettled]);

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
