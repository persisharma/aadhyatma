import { useEffect, useState } from 'react';
import { InteractionManager } from 'react-native';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarHydrated } from './usePanchang';
import { useLenses } from './useLenses';
import { serializeLenses } from './lenses';
import { dateKeyFor, scopeKeyFor } from './panchangDayStore';
import { prepareOccasionTimings } from './occasionTimingWork';
import type { OccasionTiming } from './occasionTimings';
import type { CalendarSystem } from './types';
export function useOccasionTimings(date: Date | null, calendarSystem: CalendarSystem, ruleId?: string) {
  const { location, isLoading } = usePanchangLocation();
  const hydrated = usePanchangCalendarHydrated();
  const { lenses, hydrated: lensesHydrated } = useLenses();
  const key = `${scopeKeyFor(location, calendarSystem)}|${date ? dateKeyFor(date) : '-'}|${serializeLenses(lenses)}|${ruleId ?? ''}`;
  const [state, setState] = useState<{ key: string; items: OccasionTiming[]; error: boolean }>();
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!date || isLoading || !hydrated || !lensesHydrated) return;
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      void prepareOccasionTimings(date, { calendarSystem, location }, lenses, () => cancelled, ruleId)
        .then(items => { if (!cancelled && items) setState({ key, items, error: false }); })
        .catch(() => { if (!cancelled) setState({ key, items: [], error: true }); });
    });
    return () => { cancelled = true; task.cancel(); };
    // Scope/date/lenses, not changing object identities, own each solve.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isLoading, hydrated, lensesHydrated, attempt]);
  return { items: date && !isLoading && hydrated && lensesHydrated && state?.key === key ? state.items : [],
    loading: !!date && (isLoading || !hydrated || !lensesHydrated || state?.key !== key),
    error: state?.key === key && state.error,
    retry: () => { setState(undefined); setAttempt(n => n + 1); } };
}
