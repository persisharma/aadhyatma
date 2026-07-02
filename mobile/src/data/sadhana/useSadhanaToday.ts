/**
 * Composes SadhanaContext + ReadingProgress + UserActivity into "today's
 * sankalp": for each active enrollment, the current day's status and — when the
 * day is open — its items each with a live auto-complete flag (genuine reading /
 * japa today). Mirrors useRoutineToday; reuses the same completion resolver
 * (units.isItemAutoComplete) so a program day and a routine item complete by the
 * exact same rules.
 */
import { useMemo } from 'react';
import { useSadhana } from '@/contexts/SadhanaContext';
import { useReadingProgress } from '@/contexts/ReadingProgressContext';
import { useUserActivity, toDateKey } from '@/contexts/UserActivityContext';
import { isItemAutoComplete, resolveRoutineItem, type RoutineItemDisplay } from '@/data/routine/units';
import type { RoutineItem } from '@/data/routine/types';
import { getProgram } from './programs';
import { resolveSadhanaToday, type SadhanaTodayStatus } from './progress';
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

export function useSadhanaToday(): SadhanaTodayCard[] {
  const { activeEnrollments } = useSadhana();
  const { getProgress } = useReadingProgress();
  const { dayTotals } = useUserActivity();

  return useMemo(() => {
    const todayKey = toDateKey(new Date());
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
      const status = resolveSadhanaToday(enrollment, program, todayKey);

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
  }, [activeEnrollments, getProgress, dayTotals]);
}
