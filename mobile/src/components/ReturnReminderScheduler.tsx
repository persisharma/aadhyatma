import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import {
  scheduleReturnReminders,
  cancelAllReturnReminders,
} from '@/notifications/returnScheduler';

/**
 * Headless: keeps the return-reminder ladder (वापसी स्मरण, design.md §38) armed
 * from the most recent app open. Re-arms on mount (cold start), on every return
 * to the foreground, when the OS permission changes, and when the reading
 * language changes (copy is baked at schedule time). Renders nothing.
 *
 * The foreground re-arm is not an optimisation here — it IS the feature. Each
 * re-arm cancels the family and re-plans from today, so a slot survives to fire
 * only if the app has not been opened since it was armed. A user who opens the
 * app every day never receives one.
 *
 * Default on, no setting (product decision, Sep 2026). Permission is shared with
 * the other schedulers — we only schedule when it is already granted, and never
 * prompt from here. On Android the family has its own channel, which is the
 * user's mute path; on iOS it is the app-wide notification switch.
 */
export default function ReturnReminderScheduler() {
  const { permissionStatus, isLoading } = useNotificationPreferences();
  const { lang } = useGitaLanguage();
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
    if (isLoading) return undefined;

    let cancelled = false;

    if (permissionStatus !== 'granted') {
      cancelAllReturnReminders().catch(() => undefined);
      return () => {
        cancelled = true;
      };
    }

    // Behind InteractionManager so a cold start's first frames are never
    // charged for the cancel + five schedules.
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      scheduleReturnReminders(new Date(), lang).catch(() => undefined);
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [isLoading, permissionStatus, lang, foregroundTick]);

  return null;
}
