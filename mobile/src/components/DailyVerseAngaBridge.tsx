import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { usePanchangLocation } from '@/contexts/PanchangLocationContext';
import { usePanchangCalendarSystem } from '@/panchang/usePanchang';
import { locationKey } from '@/panchang/engine';
import { resolveDayAngas } from '@/notifications/dayAngaResolver';
import { toDateKey } from '@/notifications/seed';

/**
 * Headless: keeps the daily-verse scheduler supplied with each fire day's panchang
 * context, so notification titles can lead with the day's vrat/festival or tithi.
 *
 * `NotificationPreferencesProvider` sits above `PanchangLocationProvider`, so it
 * can't read the panchang location itself. This component mounts below both,
 * resolves the window off the interaction queue, and pushes the result up —
 * the same pattern `VratReminderScheduler` uses for vrat reminders. Renders nothing.
 *
 * Re-resolves when the location or calendar system changes (the tithi is solved at
 * that city's sunrise) and on foreground (the window slides with the calendar, and
 * a background observance scan may have landed since). Never prompts for
 * permission and never schedules — publishing is all it does.
 */
export default function DailyVerseAngaBridge() {
  const { prefs, permissionStatus, isLoading, publishDayAngas } = useNotificationPreferences();
  const { location } = usePanchangLocation();
  const [calendarSystem] = usePanchangCalendarSystem();
  const [foregroundTick, setForegroundTick] = useState(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') setForegroundTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    // Nothing is scheduled while reminders are off or permission is missing, so
    // there is no title to enrich — skip the astronomy entirely.
    if (isLoading || !prefs.dailyVerseEnabled || permissionStatus !== 'granted') {
      return undefined;
    }

    let cancelled = false;
    const now = new Date();
    // The day key pins the resolve to a calendar day: a foreground tick within the
    // same day republishes the same key and is ignored, while crossing midnight
    // produces a new one and slides the window forward.
    const key = `${locationKey(location)}:${calendarSystem}:${toDateKey(now)}`;

    resolveDayAngas(
      { from: now, location, calendarSystem },
      () => cancelled
    )
      .then((map) => {
        if (cancelled) return;
        publishDayAngas(key, map);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    isLoading,
    prefs.dailyVerseEnabled,
    permissionStatus,
    location,
    calendarSystem,
    foregroundTick,
    publishDayAngas,
  ]);

  return null;
}
