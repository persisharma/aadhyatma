/**
 * Resolve the sunrise tithi (and headline observance) for each day the daily-verse
 * scheduler is about to cover.
 *
 * Daily-verse notifications are built ahead of time — the scheduler bakes title and
 * body when it schedules, not when the notification fires — so the whole rolling
 * window's panchang has to be solved up front. That is per-day astronomy, which the
 * Panchang tab learned the hard way must never touch a render path, so this runs
 * off the interaction queue and yields to the event loop every frame budget.
 *
 * Formatting is in `./dayAnga` (pure); this module owns the engine calls.
 */

import { InteractionManager } from 'react-native';
import { computeTithiAndMonth } from '@/panchang/engine';
import { getObservancesForDate, isObservanceDataReady } from '@/panchang/festivalEngine';
import type { ObservanceLocation } from '@/panchang/festivalEngine';
import type { CalendarSystem } from '@/panchang/types';
import { pickTitleObservance, type DayAnga, type DayAngaMap } from './dayAnga';
import { toDateKey } from './seed';
import { ROLLING_WINDOW_DAYS } from './pure';

/**
 * One animation frame is ~16 ms; keep each synchronous burst under half of it so a
 * resolve running behind an active screen can't drop a frame. Same budget the
 * observance scanner uses (`festivalEngine.ts`).
 */
const FRAME_BUDGET_MS = 8;

/**
 * The window covers every day the scheduler might place a notification on, plus a
 * day of slack: `computeFireDates` starts at tomorrow when today's time has already
 * passed, so the last fire can land one day past `ROLLING_WINDOW_DAYS` from now.
 */
export const ANGA_WINDOW_DAYS = ROLLING_WINDOW_DAYS + 1;

export type ResolveDayAngasOptions = {
  /** First day of the window (local). Defaults to now. */
  from?: Date;
  days?: number;
  location?: ObservanceLocation;
  calendarSystem?: CalendarSystem;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function yieldToEventLoop(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function afterInteractions(): Promise<void> {
  return new Promise((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });
}

/**
 * Resolve day angas for the scheduling window, keyed by local `YYYY-MM-DD`.
 *
 * Failure is always partial and always silent: a day whose solve throws is simply
 * absent from the map, and the scheduler falls back to the plain title for it. The
 * caller can pass `shouldCancel` to abandon a resolve whose inputs have gone stale
 * (a location switch, an unmount) instead of finishing work nobody will read.
 */
export async function resolveDayAngas(
  options: ResolveDayAngasOptions = {},
  shouldCancel: () => boolean = () => false
): Promise<DayAngaMap> {
  const {
    from = new Date(),
    days = ANGA_WINDOW_DAYS,
    location,
    calendarSystem = 'purnimant',
  } = options;

  await afterInteractions();
  if (shouldCancel()) return {};

  const start = startOfLocalDay(from);
  const map: DayAngaMap = {};

  // Observance dates are only location-accurate once the background scan for that
  // city/year has landed; until then `getObservancesForDate` serves the Ujjain
  // fallback. A tithi we solved for the user's own city is honest; a festival name
  // borrowed from another city's calendar is not, so observances are skipped for
  // any year that isn't ready and the title falls back to the tithi.
  const observanceReadyByYear = new Map<number, boolean>();
  const observancesReadyFor = (year: number): boolean => {
    let ready = observanceReadyByYear.get(year);
    if (ready === undefined) {
      try {
        ready = isObservanceDataReady(year, calendarSystem, location);
      } catch {
        ready = false;
      }
      observanceReadyByYear.set(year, ready);
    }
    return ready;
  };

  let sliceStart = Date.now();
  for (let i = 0; i < days; i += 1) {
    if (shouldCancel()) return map;

    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);

    let anga: DayAnga | null = null;
    try {
      const { tithiIndex, paksha } = computeTithiAndMonth(date, { calendarSystem, location });
      anga = { tithiIndex, paksha };
    } catch {
      // A day whose tithi won't solve is left out entirely; its notification keeps
      // the plain title. Never let one bad day abort the rest of the window.
    }

    if (anga) {
      // Caught separately from the tithi: an observance lookup that fails must not
      // cost the day its tithi, which is the fallback the title would use anyway.
      if (observancesReadyFor(date.getFullYear())) {
        try {
          const observance = pickTitleObservance(
            getObservancesForDate(date, calendarSystem, location).map((o) => o.rule)
          );
          if (observance) {
            anga.observanceHi = observance.nameHi;
            anga.observanceEn = observance.nameEn;
          }
        } catch {
          // Tithi-only title for this day.
        }
      }
      map[toDateKey(date)] = anga;
    }

    if (Date.now() - sliceStart >= FRAME_BUDGET_MS) {
      await yieldToEventLoop();
      sliceStart = Date.now();
    }
  }

  return map;
}
