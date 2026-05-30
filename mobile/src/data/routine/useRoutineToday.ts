/**
 * Composes RoutineContext + ReadingProgress + UserActivity into "today's
 * practice": the items scheduled for today across all routines, each with a
 * live completion flag (manual mark OR genuine reading/japa today).
 */
import { useMemo } from 'react';
import { useRoutines } from '@/contexts/RoutineContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useUserActivity, toDateKey } from '@/contexts/UserActivityContext';
import { itemRunsOn, routineItemKey, type Routine, type RoutineItem } from './types';
import { isItemAutoComplete, resolveRoutineItem, type RoutineItemDisplay } from './units';

export type TodayEntry = {
  routine: Routine;
  item: RoutineItem;
  key: string;
  display: RoutineItemDisplay;
  done: boolean;
  doneMode: 'auto' | 'manual' | null;
};

export type RoutineTodaySummary = {
  entries: TodayEntry[];
  doneCount: number;
  total: number;
  hasRoutine: boolean;
};

export function useRoutineToday(): RoutineTodaySummary {
  const { routines, isManualDone } = useRoutines();
  const { getProgress } = useReadingProgress();
  const { dayTotals } = useUserActivity();

  return useMemo(() => {
    const now = new Date();
    const weekday = now.getDay();
    const todayKey = toDateKey(now);
    const totals = dayTotals(todayKey);

    const ctx = {
      getProgress,
      todayKey,
      toDateKey,
      japaRoundsToday: (mantraId: string) => totals.perMantra[mantraId]?.rounds ?? 0,
    };

    const entries: TodayEntry[] = [];
    for (const routine of routines) {
      for (const item of routine.items) {
        if (!itemRunsOn(routine, item, weekday)) continue;
        const key = routineItemKey(routine.id, item.id);
        const manual = isManualDone(key);
        const auto = !manual && isItemAutoComplete(item, ctx);
        entries.push({
          routine,
          item,
          key,
          display: resolveRoutineItem(item),
          done: manual || auto,
          doneMode: manual ? 'manual' : auto ? 'auto' : null,
        });
      }
    }

    return {
      entries,
      doneCount: entries.filter((e) => e.done).length,
      total: entries.length,
      hasRoutine: routines.length > 0,
    };
  }, [routines, isManualDone, getProgress, dayTotals]);
}
