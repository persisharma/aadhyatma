import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computePanchangForDate } from './engine';
import {
  getObservancesForDate,
  getObservancesForMonth,
  getUpcomingObservances,
} from './festivalEngine';
import { subscribeObservanceStore } from './observanceStore';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import type { CalendarSystem, PanchangData, ResolvedFestival, ResolvedObservance } from './types';

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

const CALENDAR_SYSTEM_STORAGE_KEY = '@vedansh:panchang-calendar-system';

// Upcoming observances are limited to the next month, resolved asynchronously.
const UPCOMING_WINDOW_DAYS = 30;
const UPCOMING_MAX = 10;

function isCalendarSystem(value: unknown): value is CalendarSystem {
  return value === 'purnimant' || value === 'amanta';
}

// Bumps whenever a location's observance year lands in the in-memory store, so
// hooks re-resolve and Ujjain-fallback results upgrade to location-accurate ones.
function useObservanceStoreVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeObservanceStore(() => setVersion((v) => v + 1)), []);
  return version;
}

// The calendar system is a small module-level store, not per-instance state:
// it is read by hooks on several always-mounted screens at once (the Panchang
// tab AND the Home Today strip), so a change made on one screen must propagate
// to every mounted instance immediately — per-instance useState hydrated once
// from AsyncStorage left the Home strip on a stale system for the whole session.
// Consumed via useSyncExternalStore, which is tearing-safe by construction (no
// hand-rolled "re-sync between render and subscribe" patch needed).
let calendarSystemValue: CalendarSystem = 'purnimant';
// True once the user has explicitly chosen a system this session — a late
// AsyncStorage hydration must never clobber an explicit in-session choice.
let calendarSystemDirty = false;
let calendarSystemHydration: Promise<void> | null = null;
const calendarSystemListeners = new Set<() => void>();

function notifyCalendarSystemListeners(): void {
  calendarSystemListeners.forEach((listener) => listener());
}

function hydrateCalendarSystemOnce(): Promise<void> {
  if (!calendarSystemHydration) {
    calendarSystemHydration = AsyncStorage.getItem(CALENDAR_SYSTEM_STORAGE_KEY)
      .then((stored) => {
        if (!calendarSystemDirty && isCalendarSystem(stored) && stored !== calendarSystemValue) {
          calendarSystemValue = stored;
          notifyCalendarSystemListeners();
        }
      })
      .catch(() => {
        // A transient storage failure must not poison the session — clear the
        // settled promise so the next subscriber retries the read.
        calendarSystemHydration = null;
      });
  }
  return calendarSystemHydration;
}

function setCalendarSystemGlobal(next: CalendarSystem): void {
  // Mark dirty and persist even for an equal-value "confirmation" tap, so an
  // in-flight hydration of a stale stored value can never override the choice.
  calendarSystemDirty = true;
  AsyncStorage.setItem(CALENDAR_SYSTEM_STORAGE_KEY, next).catch(() => undefined);
  if (next === calendarSystemValue) return;
  calendarSystemValue = next;
  notifyCalendarSystemListeners();
}

function subscribeCalendarSystem(onStoreChange: () => void): () => void {
  calendarSystemListeners.add(onStoreChange);
  hydrateCalendarSystemOnce();
  return () => {
    calendarSystemListeners.delete(onStoreChange);
  };
}

function getCalendarSystemSnapshot(): CalendarSystem {
  return calendarSystemValue;
}

/** Test-only: reset the module store between jest tests. */
export function __resetCalendarSystemStoreForTests(value: CalendarSystem = 'purnimant'): void {
  calendarSystemValue = value;
  calendarSystemDirty = false;
  calendarSystemHydration = null;
  calendarSystemListeners.clear();
}

export function usePanchangCalendarSystem(): [CalendarSystem, (next: CalendarSystem) => void] {
  const calendarSystem = useSyncExternalStore(subscribeCalendarSystem, getCalendarSystemSnapshot);
  return [calendarSystem, setCalendarSystemGlobal];
}

export function useTodayPanchang(calendarSystem: CalendarSystem = 'purnimant'): UsePanchangResult {
  const todayKey = new Date().toDateString();
  const { location } = usePanchangLocation();
  const storeVersion = useObservanceStoreVersion();

  // Today's panchang is cheap (~4ms — a handful of astronomy solves), so it is
  // safe to compute on the render path. Memoised per calendar day.
  const today = useMemo(
    () => computePanchangForDate(new Date(todayKey), { calendarSystem, location }),
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
    const handle = setTimeout(() => {
      const result = getObservancesForDate(selected, calendarSystem, location);
      if (!cancelled) setObservances(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
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
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  useEffect(() => {
    let cancelled = false;
    setPanchang(null);
    const handle = setTimeout(() => {
      const result = computePanchangForDate(new Date(dateMs), { calendarSystem, location });
      if (!cancelled) setPanchang(result);
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
    () => computePanchangForDate(new Date(dateMs), { calendarSystem, location }),
    [dateMs, calendarSystem, location]
  );
}
