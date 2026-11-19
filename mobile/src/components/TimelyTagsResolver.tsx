import { useEffect, useMemo } from 'react';
import { deityForWeekday } from '@/data/routine/vaar';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { useLenses } from '@/panchang/useLenses';
import { ruleVisibleForLenses } from '@/panchang/lenses';
import { getCachedObservancesForDate } from '@/panchang/festivalEngine';
import { subscribeObservanceStore } from '@/panchang/observanceStore';
import { useTodayKey } from '@/utils/useTodayKey';
import type { TimelyContext } from '@/data/shareHashtags';

/**
 * Share-only, lazy resolver. Hashtags must never trigger a full-year astronomy
 * solve, including after an incorrect device date or outside the bundled years.
 * A miss retains scripture/deity/weekday tags. Existing scan/hydration results
 * may enrich the open sheet; sharing itself never schedules or waits for them.
 */
export default function TimelyTagsResolver({ onResolve }: { onResolve: (t: TimelyContext) => void }) {
  const [calendarSystem] = usePanchangCalendarSystem();
  const { location } = usePanchangLocation();
  const { lenses } = useLenses();
  const todayKey = useTodayKey();
  const today = useMemo(() => new Date(todayKey), [todayKey]);
  useEffect(() => {
    let active = true;
    const publish = () => {
      if (!active) return;
      const cached = getCachedObservancesForDate(today, calendarSystem, location) ?? [];
      onResolve({
        occasions: cached.filter(o => ruleVisibleForLenses(o.rule.lens, lenses)).map(o => ({
          nameHi: o.rule.nameHi, nameEn: o.rule.nameEn, deityEn: o.rule.deityEn,
        })),
        weekday: today.getDay(), weekdayDeity: deityForWeekday(today.getDay()),
      });
    };
    const unsubscribe = subscribeObservanceStore(publish);
    publish();
    return () => { active = false; unsubscribe(); };
  }, [calendarSystem, lenses, location, today, onResolve]);
  return null;
}
