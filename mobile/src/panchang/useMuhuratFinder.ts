import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { computeMuhuratDay } from './muhurat';
import { evaluateDay, getEventRule, summarize, type DayVerdict, type FinderSummary, type OccasionId } from './eventMuhurat';
import { cachedDayInputs, dayStoreFor, scopeKeyFor } from './panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from './panchangDayCache';
import {
  dayAt,
  dayKeysFrom,
  scanAbujhDays,
  startOfToday,
  yieldToUi,
  CHUNK_DAYS,
  FINDER_WINDOW_DAYS,
  FIRST_AFTER_MAX_DAYS,
  type AbujhDay,
} from './muhuratFinderScan';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarSystem } from './usePanchang';

export { FINDER_WINDOW_DAYS };
export type { AbujhDay };

/**
 * The range every surface hydrates: the widest sweep any of them can run (the
 * finder's extended "first dates after" reach) plus the one extra day the
 * finder reads for `nextSunrise`. Hydrating the union means the picker warmup
 * and the abujh screen also prime the days a later occasion scan will want.
 */
const HYDRATE_DAYS = FIRST_AFTER_MAX_DAYS + 1;

export type FinderState = {
  loading: boolean;
  summary: FinderSummary | null;
  /** When the window is empty: the first shreshtha/madhyam days beyond it. */
  firstAfter: DayVerdict[];
};

/**
 * Scan `days` civil days from today for the occasion, one panchang solve per
 * day (each day's "next sunrise" is the next day's solve, reused). Chunked
 * behind InteractionManager + setTimeout yields — the same responsiveness
 * boundary as useMuhurat/useObservancesForDate — so Home/Panchang interactions
 * are never blocked by the sweep. The per-day inputs come from the shared
 * `panchangDayStore` (absolute-date keyed, per location+system) so the first
 * occasion pays the astronomy cost once and every later occasion — plus a
 * re-entry, a midnight rollover, and a hydrated cold start — reuses it.
 */
export function useMuhuratFinder(occasionId: OccasionId, days: number = FINDER_WINDOW_DAYS): FinderState {
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [state, setState] = useState<FinderState>({ loading: true, summary: null, firstAfter: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, summary: null, firstAfter: [] });
    const task = InteractionManager.runAfterInteractions(async () => {
      const opts = { calendarSystem, location };
      const rule = getEventRule(occasionId);
      const start = startOfToday();
      // Disk → memory before the sweep, so days solved in an earlier session (or
      // an earlier launch) are never re-solved. One multiGet, short-circuited
      // entirely when the range is already warm.
      await hydratePanchangDays(location, calendarSystem, dayKeysFrom(start, HYDRATE_DAYS));
      if (cancelled) return;
      const scan = dayStoreFor(scopeKeyFor(location, calendarSystem));
      let heavyThisChunk = false;
      const inputsAt = (i: number) => {
        const { inputs, miss } = cachedDayInputs(scan, dayAt(start, i), opts);
        if (miss) heavyThisChunk = true;
        return inputs;
      };
      const verdicts: DayVerdict[] = [];
      const firstAfter: DayVerdict[] = [];
      for (let i = 0; i < FIRST_AFTER_MAX_DAYS; i += 1) {
        if (cancelled) return;
        const d = dayAt(start, i);
        const { p, asta } = inputsAt(i);
        const { p: next } = inputsAt(i + 1);
        const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
        const v = evaluateDay(rule, d.getTime(), d.getDay(), p, m, asta);
        if (i < days) {
          verdicts.push(v);
        } else if (v.tier !== 'excluded') {
          firstAfter.push(v);
        }
        // Past the window we only keep going while the window came up empty.
        if (i >= days - 1) {
          const anyInWindow = verdicts.some((x) => x.tier !== 'excluded');
          if (anyInWindow || firstAfter.length >= 3) break;
        }
        if (i % CHUNK_DAYS === CHUNK_DAYS - 1) {
          // Progressive paint: the moment the window has any qualifying day,
          // show what's found and keep filling in — the list only needs the
          // earliest matches, while the rest of the window keeps scanning for
          // the calendar overlay. An empty window stays on the spinner until the
          // scan finishes, so the empty-with-reason card never flashes early.
          if (!cancelled && verdicts.some((x) => x.tier !== 'excluded')) {
            setState({ loading: false, summary: summarize(verdicts), firstAfter });
          }
          if (heavyThisChunk) await yieldToUi();
          heavyThisChunk = false;
        }
      }
      if (cancelled) return;
      setState({ loading: false, summary: summarize(verdicts), firstAfter });
      // Fire-and-forget: the results are already on screen, and the next launch
      // gets them for free.
      void persistPanchangDays(location, calendarSystem);
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [occasionId, days, calendarSystem, location]);

  return state;
}

/**
 * Intent-scoped pre-warm. The occasion picker calls this so the shared per-day
 * cache is mostly filled by the time the user taps an occasion — the results
 * scan (and the abujh scan) then reuse it and paint near-instantly. Deliberately
 * non-blocking: runs only inside the finder (never at launch), deferred behind
 * `InteractionManager`, chunked with `yieldToUi` between batches, cache-only (no
 * state → the picker never re-renders), and cancelled on unmount. If the user
 * taps before it finishes, the scan simply continues from whatever is cached.
 */
export function useMuhuratFinderWarmup(days: number = FINDER_WINDOW_DAYS): void {
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();

  useEffect(() => {
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(async () => {
      const opts = { calendarSystem, location };
      const start = startOfToday();
      await hydratePanchangDays(location, calendarSystem, dayKeysFrom(start, HYDRATE_DAYS));
      if (cancelled) return;
      const scan = dayStoreFor(scopeKeyFor(location, calendarSystem));
      let heavy = false;
      // Warm one past the window: the scan reads day i AND i+1 (next sunrise).
      for (let i = 0; i <= days; i += 1) {
        if (cancelled) return;
        const { miss } = cachedDayInputs(scan, dayAt(start, i), opts);
        if (miss) heavy = true;
        if (i % CHUNK_DAYS === CHUNK_DAYS - 1) {
          if (heavy) await yieldToUi();
          heavy = false;
        }
      }
      void persistPanchangDays(location, calendarSystem);
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [location, calendarSystem, days]);
}

export type AbujhState = { loading: boolean; days: AbujhDay[] };

/**
 * Upcoming abujh days for the "Special auspicious days" screen. Delegates to the
 * framework-free `scanAbujhDays` (see muhuratFinderScan): festival days paint
 * first (progressive), pushya days stream in from the SHARED day cache the
 * finder + warmup fill, and a single bad solve can never strand the spinner.
 */
export function useAbujhDays(horizonDays: number = FIRST_AFTER_MAX_DAYS): AbujhState {
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [state, setState] = useState<AbujhState>({ loading: true, days: [] });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, days: [] });
    const task = InteractionManager.runAfterInteractions(async () => {
      const opts = { calendarSystem, location };
      const start = startOfToday();
      try {
        await hydratePanchangDays(location, calendarSystem, dayKeysFrom(start, horizonDays));
        if (cancelled) return;
        const days = await scanAbujhDays(start, horizonDays, opts, {
          isCancelled: () => cancelled,
          // Progressive paint: reveal days (festival first, then pushya) as the
          // scan finds them, so the screen never sits on a bare spinner.
          onProgress: (partial) => {
            if (!cancelled && partial.length) setState({ loading: false, days: partial });
          },
        });
        if (!cancelled) setState({ loading: false, days });
        void persistPanchangDays(location, calendarSystem);
      } catch {
        // Defensive: the scan already guards each day, but never leave the
        // spinner stranded if something above the loop throws.
        if (!cancelled) setState({ loading: false, days: [] });
      }
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [calendarSystem, location, horizonDays]);

  return state;
}
