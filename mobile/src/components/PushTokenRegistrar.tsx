import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { syncPushToken } from '@/notifications/pushToken';

/**
 * Headless: registers this install's device id on open, and attaches the Expo
 * push token to it once the shared notification permission is granted. Renders
 * nothing.
 *
 * The device id is our own permission-free install id, minted on the first open
 * and captured even when notifications are never granted — so every install is
 * registered, not only the ones that accept push. When the permission somebody
 * else obtained is granted, the push token is attached to the same install id so
 * the server can push to a device it captured earlier.
 *
 * Deliberately additive: it never prompts for permission (the daily-verse
 * provider and `RoutineDetailScreen` own that moment), never touches the pending
 * notification queue, and swallows every failure. Removing this one line from
 * `App.tsx` restores the previous behaviour exactly.
 *
 * Re-runs on:
 * - first mount — capture the device id as early as possible,
 * - the permission becoming `granted` (the grant may arrive after first mount —
 *   that is when the push token gets attached),
 * - every foreground — a token can be replaced while the app is backgrounded,
 * - an OS token-rotation event, via `addPushTokenListener`.
 *
 * `syncPushToken` no-ops once the current (install id + token) state is already
 * registered, so a spurious re-run costs no request.
 *
 * The work runs behind `InteractionManager` so a cold start's first frames are
 * never charged for it — the same courtesy `<FestiveReminderScheduler>` pays.
 */
export default function PushTokenRegistrar() {
  const { permissionStatus } = useNotificationPreferences();
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
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      syncPushToken().catch(() => undefined);
    });

    return () => {
      cancelled = true;
      task.cancel();
    };
    // Runs on mount (capture the device id on open) and whenever the push token
    // might change — the permission flipping to granted, a foreground, or an OS
    // rotation. `permissionStatus` is a re-run trigger, not a gate.
  }, [permissionStatus, foregroundTick, rotationTick]);

  return null;
}
