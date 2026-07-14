import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * Today's local calendar-day key (`Date#toDateString()`), kept current across
 * midnight and app foregrounds. Always-mounted "today" surfaces (the Home
 * Today strip, §48) key their date off this so they roll over to the new day
 * without needing a per-minute tick:
 * - a timer scheduled just past local midnight flips the key while the app is
 *   in the foreground;
 * - JS timers don't fire in the background, so an AppState listener re-checks
 *   the day when the app becomes active again (the overnight-background case).
 */
export function useTodayKey(): string {
  const [todayKey, setTodayKey] = useState(() => new Date().toDateString());

  useEffect(() => {
    const refresh = () => {
      const next = new Date().toDateString();
      setTodayKey((prev) => (prev === next ? prev : next));
    };

    const appStateSub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    let timeout: ReturnType<typeof setTimeout>;
    const scheduleMidnightTick = () => {
      const now = new Date();
      // A second past midnight, so the tick can never land on the old day.
      const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timeout = setTimeout(() => {
        refresh();
        scheduleMidnightTick();
      }, nextMidnight.getTime() - now.getTime());
    };
    scheduleMidnightTick();

    return () => {
      appStateSub.remove();
      clearTimeout(timeout);
    };
  }, []);

  return todayKey;
}
