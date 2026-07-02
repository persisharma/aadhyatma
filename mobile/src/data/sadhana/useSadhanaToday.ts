/**
 * Composes SadhanaContext + ReadingProgress + UserActivity (+ the panchang
 * engine, for calendar-anchored cadences) into "today's sankalp": for each
 * active enrollment, the current day's status and — when the day is open — its
 * items each with a live auto-complete flag. Mirrors useRoutineToday; reuses the
 * same completion resolver (units.isItemAutoComplete) so a program day and a
 * routine item complete by the exact same rules.
 */
import { useMemo } from 'react';
import { useSadhana } from '@/contexts/SadhanaContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useUserActivity, toDateKey } from '@/contexts/UserActivityContext';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { getNextOccurrences } from '@/panchang/vratCatalog';
import type { CalendarSystem } from '@/panchang/types';
import { isItemAutoComplete, resolveRoutineItem, type RoutineItemDisplay } from '@/data/routine/units';
import type { RoutineItem } from '@/data/routine/types';
import { getProgram } from './programs';
import { resolveSadhanaToday, type SadhanaSchedule, type SadhanaTodayStatus } from './progress';
import type { SadhanaEnrollment, SadhanaProgram } from './types';

export type SadhanaTodayItem = {
  item: RoutineItem;
  key: string;
  display: RoutineItemDisplay;
  done: boolean;
  doneAt?: number;
};

export type SadhanaTodayCard = {
  enrollment: SadhanaEnrollment;
  program: SadhanaProgram;
  status: SadhanaTodayStatus;
  /** Populated only when `status.kind === 'active'`. */
  items: SadhanaTodayItem[];
  /** True when the active day has items and every one is complete today. */
  allItemsDoneToday: boolean;
  /** How the day auto-completed, for commitDay's `via`. */
  autoVia: 'read-to-end' | 'japam-target';
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

/** Resolve the calendar eligibility facts a gated cadence needs. */
function scheduleFor(
  program: SadhanaProgram,
  todayStart: Date,
  todayKey: string,
  calendarSystem: CalendarSystem
): SadhanaSchedule | undefined {
  const c = program.cadence;
  if (c.kind === 'weekday') {
    const occ = getNextOccurrences(c.anchorRuleId, todayStart, 1, calendarSystem)[0];
    const nextKey = occ ? toDateKey(occ.date) : undefined;
    return { todayEligible: nextKey === todayKey, nextEligibleKey: nextKey };
  }
  if (c.kind === 'festival-window') {
    const from = addDays(todayStart, -(c.days - 1));
    const occs = getNextOccurrences(c.anchorRuleId, from, 3, calendarSystem);
    for (const o of occs) {
      const start = startOfLocalDay(o.date);
      const offset = daysBetween(start, todayStart);
      if (offset >= 0 && offset < c.days) {
        return { windowDayIndex: offset + 1, windowStartKey: toDateKey(start) };
      }
    }
    const future = occs.find((o) => startOfLocalDay(o.date).getTime() > todayStart.getTime());
    return { windowStartKey: future ? toDateKey(future.date) : undefined };
  }
  return undefined;
}

export function useSadhanaToday(): SadhanaTodayCard[] {
  const { activeEnrollments } = useSadhana();
  const { getProgress } = useReadingProgress();
  const { dayTotals } = useUserActivity();
  const [calendarSystem] = usePanchangCalendarSystem();

  return useMemo(() => {
    const now = new Date();
    const todayStart = startOfLocalDay(now);
    const todayKey = toDateKey(now);
    const totals = dayTotals(todayKey);
    const ctx = {
      getProgress,
      todayKey,
      toDateKey,
      japaRoundsToday: (mantraId: string) => totals.perMantra[mantraId]?.rounds ?? 0,
    };

    const cards: SadhanaTodayCard[] = [];
    for (const enrollment of activeEnrollments) {
      const program = getProgram(enrollment.programId);
      if (!program) continue;
      const schedule = scheduleFor(program, todayStart, todayKey, calendarSystem);
      const status = resolveSadhanaToday(enrollment, program, todayKey, schedule);

      let items: SadhanaTodayItem[] = [];
      if (status.kind === 'active') {
        items = status.items.map((item) => {
          const done = isItemAutoComplete(item, ctx);
          return {
            item,
            key: `${program.id}:${status.dayIndex}:${item.id}`,
            display: resolveRoutineItem(item),
            done,
            doneAt: done && item.kind !== 'japam' ? getProgress(item.sourceId)?.updatedAt : undefined,
          };
        });
      }

      const hasJapam = status.kind === 'active' && status.items.some((i) => i.kind === 'japam');
      cards.push({
        enrollment,
        program,
        status,
        items,
        allItemsDoneToday: items.length > 0 && items.every((i) => i.done),
        autoVia: hasJapam ? 'japam-target' : 'read-to-end',
      });
    }
    return cards;
  }, [activeEnrollments, getProgress, dayTotals, calendarSystem]);
}
