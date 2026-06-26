/**
 * JS-side bridge for the Android native Japam alarm module.
 *
 * The native side (Kotlin) handles:
 *   - AlarmManager.setAlarmClock scheduling (system-alarm-icon tier, Doze-
 *     exempt)
 *   - Native NotificationManager display with the bundled mantra WAV as the
 *     channel sound, and a full-screen content intent
 *   - 24h-later re-schedule on every fire (one-shot alarm rearms itself)
 *   - SharedPreferences persistence + boot receiver re-arm across reboot
 *
 * Tap routing: native notifications open MainActivity via `vedansh://japam-
 * alarm?...` deep link → expo's Linking listener → `handleDeepLinkUrl` →
 * navigates to JapamCounter with autoPlay=true.
 *
 * On iOS or when the native module is unavailable (Expo Go, older builds)
 * `isNativeAlarmSupported()` returns false and the scheduler falls back to
 * expo-notifications.
 */

import { NativeModules, Platform, Linking } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import { findJapamMantra } from '@/data/japam';
import { navigationRef } from './deepLink';
import {
  nextFireTimestamp,
  notificationIdentifierFor,
  type JapamAlarm,
} from './japamAlarms';

type NativeModuleShape = {
  scheduleAlarm: (args: {
    alarmId: string;
    mantraId: string;
    fireAt: number;
    label?: string | null;
  }) => Promise<{ alarmId: string; fireAt: number; exact: boolean }>;
  cancelAlarm: (alarmId: string) => Promise<null>;
  cancelAll: () => Promise<null>;
  getCapability: () => Promise<{ supported: boolean; canScheduleExact: boolean }>;
};

function getNativeModule(): NativeModuleShape | null {
  if (Platform.OS !== 'android') return null;
  const mod = (NativeModules as Record<string, unknown>).JapamAlarmNative;
  if (!mod || typeof mod !== 'object') return null;
  return mod as NativeModuleShape;
}

export function isNativeAlarmSupported(): boolean {
  return getNativeModule() !== null;
}

export type NativeAlarmCapability = {
  supported: boolean;
  canScheduleExact: boolean;
};

export async function getNativeAlarmCapability(): Promise<NativeAlarmCapability> {
  const mod = getNativeModule();
  if (!mod) return { supported: false, canScheduleExact: false };
  try {
    return await mod.getCapability();
  } catch {
    return { supported: false, canScheduleExact: false };
  }
}

/** Schedule every enabled alarm. Cancels all native-managed slots first so
 *  the on-device state matches the input list exactly. */
export async function scheduleNativeAlarmsForDay(
  alarms: JapamAlarm[]
): Promise<number> {
  const mod = getNativeModule();
  if (!mod) return 0;
  try {
    await mod.cancelAll();
  } catch {
    /* ignore */
  }
  let scheduled = 0;
  const now = new Date();
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    try {
      await mod.scheduleAlarm({
        alarmId: notificationIdentifierFor(alarm.id),
        mantraId: alarm.mantraId,
        fireAt: nextFireTimestamp(alarm.time, now),
        label: alarm.label ?? null,
      });
      scheduled += 1;
    } catch {
      /* per-alarm failure non-fatal */
    }
  }
  return scheduled;
}

export async function cancelAllNativeAlarms(): Promise<void> {
  const mod = getNativeModule();
  if (!mod) return;
  try {
    await mod.cancelAll();
  } catch {
    /* ignore */
  }
}

/**
 * Parse a `vedansh://japam-alarm?alarmId=...&mantraId=...` deep link into
 * navigation parameters. Returns null if the URL isn't ours.
 *
 * Defined here (rather than in deepLink.ts) so the native-alarm contract
 * lives in one place — the same file that produces the URL in the Kotlin
 * receiver's content intent.
 */
export function parseJapamAlarmDeepLink(
  url: string | null | undefined
): { mantraId: string } | null {
  if (!url) return null;
  if (!url.startsWith('vedansh://japam-alarm')) return null;
  try {
    // URL parser doesn't like custom-scheme without `//` after the colon;
    // rewrite to a parseable URL.
    const parsed = new URL(url.replace('vedansh://', 'https://'));
    const mantraId = parsed.searchParams.get('mantraId');
    if (!mantraId) return null;
    if (!findJapamMantra(mantraId)) return null;
    return { mantraId };
  } catch {
    return null;
  }
}

/** Subscribe to OS deep links — wakes the JapamCounter with autoPlay when
 *  the user taps a native-posted alarm notification. Call once at app boot.
 *  Returns an unsubscribe function. */
export function registerNativeAlarmForegroundHandler(): () => void {
  if (Platform.OS !== 'android') return () => undefined;

  const handle = (url: string | null | undefined) => {
    const parsed = parseJapamAlarmDeepLink(url);
    if (!parsed) return;
    if (!navigationRef.isReady()) {
      // Retry briefly until the navigation container mounts (cold start).
      let attempts = 0;
      const retry = () => {
        if (navigationRef.isReady()) {
          navigateToCounter(parsed.mantraId);
          return;
        }
        if (attempts >= 50) return;
        attempts += 1;
        setTimeout(retry, 100);
      };
      retry();
      return;
    }
    navigateToCounter(parsed.mantraId);
  };

  // Cold start: app launched FROM the alarm tap.
  Linking.getInitialURL()
    .then((url) => handle(url))
    .catch(() => undefined);

  // Warm: app already running when the user taps the notification.
  const sub = Linking.addEventListener('url', ({ url }) => handle(url));
  return () => sub.remove();
}

function navigateToCounter(mantraId: string): void {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(
    CommonActions.navigate({
      name: 'HomeTab',
      params: {
        screen: 'JapamCounter',
        params: { mantraId, autoPlay: true },
      },
    } as never)
  );
}
