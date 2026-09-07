import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useGitaLanguage } from '@/data/gita/language';
import { syncPushToken } from '@/notifications/pushToken';

/**
 * Headless: captures this install's Expo push token once the shared
 * notification permission is granted, and re-syncs it when something a server
 * would care about moves. Renders nothing.
 *
 * Structurally the smallest member of the scheduler family — it has no planner,
 * no pending slots, and no cap, because it schedules nothing. It only reads.
 *
 * Deliberately additive: it never prompts for permission (the daily-verse
 * provider and `RoutineDetailScreen` own that moment), never touches the pending
 * notification queue, and swallows every failure. Removing this one line from
 * `App.tsx` restores the previous behaviour exactly.
 *
 * Re-runs on:
 * - the permission becoming `granted` (the grant may arrive after first mount),
 * - every foreground — a token can be replaced while the app is backgrounded,
 * - a reading-language change, which changes the language a server should push
 *   in (`syncPushToken` no-ops when the registration is unchanged, so a spurious
 *   re-run costs no request),
 * - an OS token-rotation event, via `addPushTokenListener`.
 *
 * The work runs behind `InteractionManager` so a cold start's first frames are
 * never charged for it — the same courtesy `<FestiveReminderScheduler>` pays.
 */
export default function PushTokenRegistrar() {
  const { permissionStatus, isLoading } = useNotificationPreferences();
  const { lang } = useGitaLanguage();
  const [foregroundTick, setForegroundTick] = useState(0);
  const [rotationTick, setRotationTick] = useState(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') setForegroundTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);

  // A rotated token is the one case a foreground may never catch: the OS can
  // hand us a new one mid-session. Guarded because the listener is unavailable
  // on a build with no push credentials.
  useEffect(() => {
    try {
      const sub = Notifications.addPushTokenListener(() => setRotationTick((t) => t + 1));
      return () => sub.remove();
    } catch {
      return undefined;
    }
  }, []);

  useEffect(() => {
    if (isLoading) return undefined;
    if (permissionStatus !== 'granted') return undefined;

    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      syncPushToken({ lang }).catch(() => undefined);
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [isLoading, permissionStatus, lang, foregroundTick, rotationTick]);

  return null;
}
