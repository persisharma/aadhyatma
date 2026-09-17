import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';

import { indiaDateKey, indiaDayAnchor } from './kundali';

const DAY_MS = 86_400_000;

/** Rashifal uses India civil dates even when the device is in another timezone. */
export function useRashifalDay() {
  const [todayKey, setTodayKey] = useState(() => indiaDateKey(new Date()));
  const [offset, setOffset] = useState<-1 | 0 | 1>(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const refreshAndSchedule = () => {
      clearTimeout(timer);
      const now = new Date();
      setTodayKey(indiaDateKey(now));
      // The shared anchor is 06:00 IST; +18h reaches the next India midnight.
      const nextMidnight = indiaDayAnchor(now).getTime() + 18 * 3_600_000;
      timer = setTimeout(refreshAndSchedule, nextMidnight - now.getTime() + 1_000);
    };
    refreshAndSchedule();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshAndSchedule();
    });
    return () => { clearTimeout(timer); subscription.remove(); };
  }, []);
  const date = useMemo(() => new Date(
    new Date(`${todayKey}T06:00:00+05:30`).getTime() + offset * DAY_MS
  ), [todayKey, offset]);
  return { date, offset, setOffset };
}
