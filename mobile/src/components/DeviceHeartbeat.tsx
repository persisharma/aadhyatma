import { useEffect, useRef, useState } from 'react';
import { AppState, InteractionManager, type AppStateStatus } from 'react-native';
import { sendDeviceHeartbeat } from '@/notifications/deviceHeartbeat';

/**
 * Headless: once per local day (or when the reported state changes), posts a
 * PII-free snapshot of this install — daily open, notification-permission
 * state, and enabled japam alarms. Renders nothing.
 *
 * Unlike `<PushTokenRegistrar>` it does **not** gate on the notification
 * permission: measuring how many devices are denied/undetermined is the whole
 * point, so it runs for every install. `sendDeviceHeartbeat` no-ops (no request)
 * once the day's fingerprint is already recorded, so a spurious re-run is cheap.
 *
 * Fires on mount and on every foreground, behind `InteractionManager` so a cold
 * start's first frames are never charged for it. Removing this one line from
 * `App.tsx` restores the previous behaviour exactly.
 */
export default function DeviceHeartbeat() {
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
    let cancelled = false;
    const task = InteractionManager.runAfterInteractions(() => {
      if (cancelled) return;
      sendDeviceHeartbeat().catch(() => undefined);
    });
    return () => {
      cancelled = true;
      task.cancel();
    };
  }, [foregroundTick]);

  return null;
}
