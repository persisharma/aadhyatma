import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { InteractionManager } from 'react-native';
import {
  getObservancesForDate,
  getObservancesForMonth,
  getUpcomingObservances,
} from './festivalEngine';
import { subscribeObservanceStore } from './observanceStore';
import { cachedDayInputs, dateKeyFor, dayStoreFor, scopeKeyFor } from './panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from './panchangDayCache';
import {
  getCalendarSystemHydrated,
  getCalendarSystemSnapshot,
  setCalendarSystemGlobal,
  subscribeCalendarSystem,
  __resetPanchangPrefsForTests,
} from './panchangPrefs';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import type {
  CalendarSystem,
  PanchangComputationOptions,
  PanchangData,
  ResolvedFestival,
  ResolvedObservance,
} from './types';

export type UsePanchangResult = {
  today: PanchangData;
  upcoming: ResolvedFestival[];
};

export type UsePanchangSelectionResult = {
  // null until the day's panchang has been computed off the render path (lazy).
  panchang: PanchangData | null;
  observances: ResolvedObservance[];
  upcoming: ResolvedObservance[];
};

/**
 * Every panchang solve in this module goes through the shared, persisted
 * `panchangDayStore` rather than a local `useMemo`/`useState` — so a day solved
 * by the Today strip, the Muhurat Finder's sweep, or a previous app launch is
 * free here, and a day solved here is free for them.
 *
 * `solvePanchangDay` computes on a miss (the synchronous hooks below must return
 * a value, exactly as their `useMemo`s did); `warmPanchangDay` is the cache-only
 * read, for the deferred paths that must not touch astronomy on the render path.
 */
function solvePanchangDay(
  date: Date,
  calendarSystem: CalendarSystem,
  location: PanchangComputationOptions['location'] & object
): PanchangData {
  const opts = { calendarSystem, location };
  const map = dayStoreFor(scopeKeyFor(location, calendarSystem));
  return cachedDayInputs(map, date, opts).inputs.p;
}

function warmPanchangDay(
  date: Date,
  calendarSystem: CalendarSystem,
  location: PanchangComputationOptions['location'] & object
): PanchangData | null {
  const map = dayStoreFor(scopeKeyFor(location, calendarSystem));
  return map.get(dateKeyFor(date))?.p ?? null;
}

// Upcoming observances are limited to the next month, resolved asynchronously.
const UPCOMING_WINDOW_DAYS = 30;
const UPCOMING_MAX = 10;

// Bumps whenever a location's observance year lands in the in-memory store, so
// hooks re-resolve and Ujjain-fallback results upgrade to location-accurate ones.
function useObservanceStoreVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeObservanceStore(() => setVersion((v) => v + 1)), []);
  return version;
}

/**
 * The calendar-system store itself now lives in `panchangPrefs`, where it shares
 * ONE launch-time `multiGet` with the chosen city — the two values are read
 * together because together they are the scope key every panchang cache is keyed
 * by, and reading them separately (and lazily, on first subscriber) is what left
 * Home's `आज का पंचांग` two serial round trips behind the screen it sits on. The
 * hooks stay here so no call site moves.
 */
export function usePanchangCalendarSystem(): [CalendarSystem, (next: CalendarSystem) => void] {
  const calendarSystem = useSyncExternalStore(subscribeCalendarSystem, getCalendarSystemSnapshot);
  return [calendarSystem, setCalendarSystemGlobal];
}

/** True only after the persisted calendar-system preference has settled. */
export function usePanchangCalendarHydrated(): boolean {
  return useSyncExternalStore(subscribeCalendarSystem, getCalendarSystemHydrated);
}

/** Test-only: reset the module store between jest tests. Re-exported from
 * `panchangPrefs` so existing suites keep importing it from here. */
export function __resetCalendarSystemStoreForTests(value: CalendarSystem = 'purnimant'): void {
  __resetPanchangPrefsForTests(value);
}

export function useTodayPanchang(calendarSystem: CalendarSystem = 'purnimant'): UsePanchangResult {
  const todayKey = new Date().toDateString();
  const { location } = usePanchangLocation();
  const storeVersion = useObservanceStoreVersion();

  // Today's panchang is cheap (~4ms — a handful of astronomy solves), so it is
  // safe to compute on the render path. Read through the shared store, so it is
  // usually already solved (by the Today strip, a previous launch, or the finder)
  // and costs nothing.
  const today = useMemo(
    () => solvePanchangDay(new Date(todayKey), calendarSystem, location),
    [todayKey, calendarSystem, location]
  );

  // Festival resolution scans two years of the lunar calendar (~1.7s on V8,
  // several times that on Hermes). Doing it synchronously during render blocks
  // the JS thread long enough that the screen never paints and the app reloads
  // back to Home. Resolve it AFTER first paint so today's panchang renders
  // immediately and the Upcoming list fills in a moment later.
  const [upcoming, setUpcoming] = useState<ResolvedFestival[]>([]);
  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      const result = getUpcomingObservances(new Date(), UPCOMING_MAX, calendarSystem, UPCOMING_WINDOW_DAYS, location);
      if (!cancelled) setUpcoming(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [todayKey, calendarSystem, location, storeVersion]);

  return { today, upcoming };
}

/**
 * Just the day's observances, resolved off the render path. Split out of
 * `usePanchangForSelection` so lightweight consumers (the Home Today strip)
 * don't also pay for the upcoming-window resolution they never render.
 */
export function useObservancesForDate(
  date: Date,
  calendarSystem: CalendarSystem
): ResolvedObservance[] {
  const dateMs = date.getTime();
  const { location } = usePanchangLocation();
  const cityId = location.cityId;
  const storeVersion = useObservanceStoreVersion();

  const [observances, setObservances] = useState<ResolvedObservance[]>([]);
  // The reset-to-empty applies only when the *selection* changes (stale data
  // would be wrong for another day/city/system). A pure storeVersion bump —
  // a background city scan landing mid-session — keeps the previous list on
  // screen until the re-resolve lands, so the always-mounted Home strip's
  // chips don't blink out for a frame on every upgrade.
  const selectionKey = `${dateMs}|${calendarSystem}|${cityId}`;
  const lastSelectionKey = useRef<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const selected = new Date(dateMs);
    if (lastSelectionKey.current !== selectionKey) {
      lastSelectionKey.current = selectionKey;
      setObservances([]);
    }
    let handle: ReturnType<typeof setTimeout> | undefined;
    const interaction = InteractionManager.runAfterInteractions(() => {
      handle = setTimeout(() => {
        const result = getObservancesForDate(selected, calendarSystem, location);
        if (!cancelled) setObservances(result);
      }, 0);
    });
    return () => {
      cancelled = true;
      interaction.cancel();
      if (handle !== undefined) clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionKey, storeVersion]);

  return observances;
}

export function usePanchangForSelection(
  date: Date,
  calendarSystem: CalendarSystem
): UsePanchangSelectionResult {
  const dateMs = date.getTime();
  const dateKey = date.toDateString();
  const { location } = usePanchangLocation();
  const cityId = location.cityId;
  const storeVersion = useObservanceStoreVersion();

  // Compute the day's panchang OFF the render path. The astronomy solves are quick on a
  // laptop but enough to stutter the tab on a real device, so we never run them
  // synchronously during render: the screen paints immediately (calendar + skeleton) and
  // the panchang fills in a frame later.
  // Seeded cache-only, so re-selecting a day already in the store paints without
  // a skeleton flash; the deferred branch below only runs on a genuine miss.
  const [panchang, setPanchang] = useState<PanchangData | null>(() =>
    warmPanchangDay(new Date(dateMs), calendarSystem, location)
  );
  useEffect(() => {
    let cancelled = false;
    const warm = warmPanchangDay(new Date(dateMs), calendarSystem, location);
    if (warm) {
      setPanchang(warm);
      return;
    }
    setPanchang(null);
    const handle = setTimeout(async () => {
      // Disk → memory before solving; free when the day is already warm.
      await hydratePanchangDays(location, calendarSystem, [dateKeyFor(new Date(dateMs))]);
      if (cancelled) return;
      const result = solvePanchangDay(new Date(dateMs), calendarSystem, location);
      if (!cancelled) setPanchang(result);
      void persistPanchangDays(location, calendarSystem);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMs, calendarSystem, cityId]);

  // Observances for the selected day, resolved off the render path as well.
  const observances = useObservancesForDate(date, calendarSystem);

  const [upcoming, setUpcoming] = useState<ResolvedObservance[]>([]);
  useEffect(() => {
    let cancelled = false;
    const selected = new Date(dateMs);
    setUpcoming([]);
    const handle = setTimeout(() => {
      const result = getUpcomingObservances(selected, UPCOMING_MAX, calendarSystem, UPCOMING_WINDOW_DAYS, location);
      if (!cancelled) setUpcoming(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMs, dateKey, calendarSystem, cityId, storeVersion]);

  // While a non-Ujjain location's background scan is still running, observances stand
  // in on the India-wide (Ujjain/IST) dates, which are correct for the bundled cities
  // in all but rare tithi-boundary edge cases. When the per-city scan lands and a date
  // genuinely differs, storeVersion bumps and the list silently upgrades — so we no
  // longer show a speculative "updating…" spinner that, across Indian cities, almost
  // always resolved to no visible change.
  return { panchang, observances, upcoming };
}

export function usePanchangMonthObservances(
  visibleMonth: Date,
  calendarSystem: CalendarSystem
): ResolvedObservance[] {
  const { location } = usePanchangLocation();
  const cityId = location.cityId;
  const storeVersion = useObservanceStoreVersion();
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}-${calendarSystem}-${cityId}`;
  const [observances, setObservances] = useState<ResolvedObservance[]>([]);

  useEffect(() => {
    let cancelled = false;
    setObservances([]);
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const handle = setTimeout(() => {
      const result = getObservancesForMonth(year, month, calendarSystem, location);
      if (!cancelled) setObservances(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthKey, visibleMonth, calendarSystem, storeVersion]);

  return observances;
}

export function usePanchangForDate(date: Date, calendarSystem: CalendarSystem = 'purnimant'): PanchangData {
  const dateMs = date.getTime();
  const { location } = usePanchangLocation();
  return useMemo(
    () => solvePanchangDay(new Date(dateMs), calendarSystem, location),
    [dateMs, calendarSystem, location]
  );
}
