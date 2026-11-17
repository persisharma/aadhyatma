import { useEffect, useMemo, useState } from 'react';
import { AppState } from 'react-native';
import { civilToday, civilTodayKey, msUntilNextCivilDay } from './civilTime';

/**
 * Today's civil-date key at the Panchang location, kept current.
 *
 * The Panchang's "today" is India's date (`civilTime.ts`), and it must move on
 * its own: a screen that read `new Date()` once when it mounted kept yesterday
 * selected, and labelled tomorrow's vrat "Today", after a night in the
 * background. Same two triggers as `utils/useTodayKey` — a timer just past the
 * civil midnight while the app is open, and a re-check when it returns to the
 * foreground (JS timers do not fire in the background).
 */
export function useCivilTodayKey(): string {
  const [key, setKey] = useState(() => civilTodayKey());

  useEffect(() => {
    const refresh = () => {
      const next = civilTodayKey();
      setKey((prev) => (prev === next ? prev : next));
    };

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    let timeout: ReturnType<typeof setTimeout>;
    const scheduleMidnightTick = () => {
      // A second past midnight, so the tick can never land on the old day.
      timeout = setTimeout(() => {
        refresh();
        scheduleMidnightTick();
      }, msUntilNextCivilDay() + 1000);
      // Never the thing that keeps a JS runtime alive (see `utils/useTodayKey`):
      // a no-op on a phone, and under Node it lets a test process exit.
      (timeout as { unref?: () => void }).unref?.();
    };
    scheduleMidnightTick();

    return () => {
      appStateSub.remove();
      clearTimeout(timeout);
    };
  }, []);

  return key;
}

/** Today's civil date as a LABEL (`new Date(y, m, d)`), stable until the day changes. */
export function useCivilToday(): Date {
  const key = useCivilTodayKey();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => civilToday(), [key]);
}
