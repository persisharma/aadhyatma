import { useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { computePanchangForDate } from './engine';
import {
  getObservancesForDate,
  getObservancesForMonth,
  getUpcomingObservances,
} from './festivalEngine';
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

export function usePanchangCalendarSystem(): [CalendarSystem, (next: CalendarSystem) => void] {
  const [calendarSystem, setCalendarSystemState] = useState<CalendarSystem>('purnimant');

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(CALENDAR_SYSTEM_STORAGE_KEY)
      .then((stored) => {
        if (!cancelled && isCalendarSystem(stored)) {
          setCalendarSystemState(stored);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const setCalendarSystem = (next: CalendarSystem) => {
    setCalendarSystemState(next);
    AsyncStorage.setItem(CALENDAR_SYSTEM_STORAGE_KEY, next).catch(() => undefined);
  };

  return [calendarSystem, setCalendarSystem];
}

export function useTodayPanchang(calendarSystem: CalendarSystem = 'purnimant'): UsePanchangResult {
  const todayKey = new Date().toDateString();

  // Today's panchang is cheap (~4ms — a handful of astronomy solves), so it is
  // safe to compute on the render path. Memoised per calendar day.
  const today = useMemo(() => computePanchangForDate(new Date(todayKey), { calendarSystem }), [todayKey, calendarSystem]);

  // Festival resolution scans two years of the lunar calendar (~1.7s on V8,
  // several times that on Hermes). Doing it synchronously during render blocks
  // the JS thread long enough that the screen never paints and the app reloads
  // back to Home. Resolve it AFTER first paint so today's panchang renders
  // immediately and the Upcoming list fills in a moment later.
  const [upcoming, setUpcoming] = useState<ResolvedFestival[]>([]);
  useEffect(() => {
    let cancelled = false;
    const handle = setTimeout(() => {
      const result = getUpcomingObservances(new Date(), UPCOMING_MAX, calendarSystem, UPCOMING_WINDOW_DAYS);
      if (!cancelled) setUpcoming(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [todayKey, calendarSystem]);

  return { today, upcoming };
}

export function usePanchangForSelection(
  date: Date,
  calendarSystem: CalendarSystem
): UsePanchangSelectionResult {
  const dateMs = date.getTime();
  const dateKey = date.toDateString();

  // Compute the day's panchang OFF the render path. The astronomy solves are quick on a
  // laptop but enough to stutter the tab on a real device, so we never run them
  // synchronously during render: the screen paints immediately (calendar + skeleton) and
  // the panchang fills in a frame later.
  const [panchang, setPanchang] = useState<PanchangData | null>(null);
  useEffect(() => {
    let cancelled = false;
    setPanchang(null);
    const handle = setTimeout(() => {
      const result = computePanchangForDate(new Date(dateMs), { calendarSystem });
      if (!cancelled) setPanchang(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [dateMs, calendarSystem]);

  // Observances for the selected day, resolved off the render path as well.
  const [observances, setObservances] = useState<ResolvedObservance[]>([]);
  useEffect(() => {
    let cancelled = false;
    const selected = new Date(dateMs);
    setObservances([]);
    const handle = setTimeout(() => {
      const result = getObservancesForDate(selected, calendarSystem);
      if (!cancelled) setObservances(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [dateMs, calendarSystem]);

  const [upcoming, setUpcoming] = useState<ResolvedObservance[]>([]);
  useEffect(() => {
    let cancelled = false;
    const selected = new Date(dateMs);
    setUpcoming([]);
    const handle = setTimeout(() => {
      const result = getUpcomingObservances(selected, UPCOMING_MAX, calendarSystem, UPCOMING_WINDOW_DAYS);
      if (!cancelled) setUpcoming(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [dateMs, dateKey, calendarSystem]);

  return { panchang, observances, upcoming };
}

export function usePanchangMonthObservances(
  visibleMonth: Date,
  calendarSystem: CalendarSystem
): ResolvedObservance[] {
  const monthKey = `${visibleMonth.getFullYear()}-${visibleMonth.getMonth()}-${calendarSystem}`;
  const [observances, setObservances] = useState<ResolvedObservance[]>([]);

  useEffect(() => {
    let cancelled = false;
    setObservances([]);
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const handle = setTimeout(() => {
      const result = getObservancesForMonth(year, month, calendarSystem);
      if (!cancelled) setObservances(result);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [monthKey, visibleMonth, calendarSystem]);

  return observances;
}

export function usePanchangForDate(date: Date, calendarSystem: CalendarSystem = 'purnimant'): PanchangData {
  const dateMs = date.getTime();
  return useMemo(() => computePanchangForDate(new Date(dateMs), { calendarSystem }), [dateMs, calendarSystem]);
}
