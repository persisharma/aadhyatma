/**
 * The day's शुभ योग windows for a React surface (PRD-27). A thin composition
 * over `useMuhurat` — the shared, persisted `panchangDayStore` supplies the
 * day + next-day solves (NO private cache here, per RULEBOOK §17.6), and the
 * window derivation is pure arithmetic plus one cheap Sun-longitude read per
 * anga segment, so it is derived per render exactly like `MuhuratDay` is.
 *
 * Returns [] while the day's solve is in flight and on days with no yoga —
 * absent is a real answer, so consumers render zero chrome for it.
 */
import { useMemo } from 'react';
import { useMuhurat } from './useMuhurat';
import { computeShubhYogas, type ShubhYogaWindow } from './shubhYoga';
import type { CalendarSystem } from './types';

export function useShubhYoga(date: Date, calendarSystem: CalendarSystem): ShubhYogaWindow[] {
  const { muhurat, panchang } = useMuhurat(date, calendarSystem, { live: false });
  return useMemo(
    () => (muhurat && panchang ? computeShubhYogas(panchang, muhurat.nextSunrise) : []),
    [muhurat, panchang]
  );
}
