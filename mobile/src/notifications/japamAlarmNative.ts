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
import { requireOptionalNativeModule } from 'expo-modules-core';
import { CommonActions } from '@react-navigation/native';
import { findJapamMantra } from '@/data/japam';
import { getJapamAlarmSoundName } from '@assets/japam-alarm-sounds';
import { navigationRef } from './deepLink';
import {
  ALARMKIT_SKIP_ONESHOT_COUNT,
  isOnceAlarm,
  isSkipPending,
  nextAlarmFireTimestamp,
  notificationIdentifierFor,
  skipOneshotPlan,
  type JapamAlarm,
} from './japamAlarms';

/** Shared args for both platforms' scheduleAlarm. */
type NativeScheduleArgs = {
  alarmId: string;
  mantraId: string;
  fireAt: number;
  label?: string | null;
  /** Bundled alarm-clip filename (e.g. 'om-namah-shivaya.wav'), or null when
   *  the mantra has no clip. Android derives sound from mantraId and ignores
   *  this; iOS (AlarmKit) rings it via `.named(sound)`. */
  sound?: string | null;
  /** Weekday recurrence (JS getDay indices 0=Sun…6=Sat). null/absent = daily.
   *  Empty = one-shot (Android skips the post-fire re-arm). iOS maps it into
   *  AlarmKit's weekly recurrence. */
  repeatDays?: number[] | null;
  /** True forces a single non-recurring fire at `fireAt` (one-time alarms;
   *  also each discrete occurrence while an AlarmKit skip is pending). */
  fixed?: boolean;
};

type AndroidNativeModuleShape = {
  scheduleAlarm: (
    args: NativeScheduleArgs
  ) => Promise<{ alarmId: string; fireAt: number; exact: boolean }>;
  cancelAlarm: (alarmId: string) => Promise<null>;
  cancelAll: () => Promise<null>;
  getCapability: () => Promise<{ supported: boolean; canScheduleExact: boolean }>;
};

/** Mirror of the Android-side shape; the iOS Expo module exposes the same
 *  surface so the scheduler can call either through one bridge function. */
type IosNativeModuleShape = {
  scheduleAlarm: (
    args: NativeScheduleArgs
  ) => Promise<{ alarmId: string; fireAt: number; exact: boolean }>;
  cancelAlarm: (alarmId: string) => Promise<void>;
  cancelAll: () => Promise<void>;
  getCapability: () => Promise<{ supported: boolean; canScheduleExact: boolean }>;
  requestPermission: () => Promise<boolean>;
  /** Current AlarmKit authorisation without prompting:
   *  'granted' | 'denied' | 'undetermined'. */
  getAuthorizationStatus: () => Promise<string>;
};

function getAndroidModule(): AndroidNativeModuleShape | null {
  if (Platform.OS !== 'android') return null;
  const mod = (NativeModules as Record<string, unknown>).JapamAlarmNative;
  if (!mod || typeof mod !== 'object') return null;
  return mod as AndroidNativeModuleShape;
}

/** iOS major version, or null when not on iOS. */
function iosMajorVersion(): number | null {
  if (Platform.OS !== 'ios') return null;
  // Platform.Version on iOS is a string like "26.0".
  const raw = Platform.Version;
  const num = typeof raw === 'string' ? parseInt(raw, 10) : Number(raw);
  return Number.isFinite(num) ? num : null;
}

function getIosModule(): IosNativeModuleShape | null {
  if (Platform.OS !== 'ios') return null;
  const major = iosMajorVersion();
  if (major == null || major < 26) return null;
  // Local Expo modules are exposed via requireOptionalNativeModule — returns
  // null on devices without the native binding (Expo Go, old prebuild).
  const mod = requireOptionalNativeModule<IosNativeModuleShape>('JapamAlarmIos');
  return mod ?? null;
}

export function isNativeAlarmSupported(): boolean {
  return getAndroidModule() !== null || getIosModule() !== null;
}

export type NativeAlarmCapability = {
  supported: boolean;
  canScheduleExact: boolean;
};

export async function getNativeAlarmCapability(): Promise<NativeAlarmCapability> {
  const mod = getAndroidModule() ?? getIosModule();
  if (!mod) return { supported: false, canScheduleExact: false };
  try {
    return await mod.getCapability();
  } catch {
    return { supported: false, canScheduleExact: false };
  }
}

/** iOS-only: true when the AlarmKit native module is bound (an iOS 26+ build
 *  that includes it). Lets the context tell the iOS native-alarm path apart
 *  from Android's — Android posts via NotificationManager and needs
 *  notification permission, whereas iOS needs AlarmKit authorisation. */
export function isIosNativeAlarmSupported(): boolean {
  return getIosModule() !== null;
}

/** iOS-only: open the system prompt for AlarmKit alarm authorisation.
 *  Returns true if the user granted, false otherwise (or non-iOS-26). */
export async function requestIosAlarmPermission(): Promise<boolean> {
  const mod = getIosModule();
  if (!mod) return false;
  try {
    return await mod.requestPermission();
  } catch {
    return false;
  }
}

/** iOS-only: current AlarmKit authorisation without prompting. Maps to the
 *  context's permission tri-state; 'undetermined' when no module / on error. */
export async function getIosAlarmAuthorizationStatus(): Promise<
  'granted' | 'denied' | 'undetermined'
> {
  const mod = getIosModule();
  if (!mod) return 'undetermined';
  try {
    const status = await mod.getAuthorizationStatus();
    if (status === 'granted') return 'granted';
    if (status === 'denied') return 'denied';
    return 'undetermined';
  } catch {
    return 'undetermined';
  }
}

/** Schedule every enabled alarm. Cancels all native-managed slots first so
 *  the on-device state matches the input list exactly. */
export async function scheduleNativeAlarmsForDay(
  alarms: JapamAlarm[]
): Promise<number> {
  const androidMod = getAndroidModule();
  const mod = androidMod ?? getIosModule();
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
    const base = {
      mantraId: alarm.mantraId,
      label: alarm.label ?? null,
      sound: getJapamAlarmSoundName(alarm.mantraId),
    };
    try {
      // AlarmKit owns its recurrence, so a pending skip-next has to be armed
      // as discrete fixed fires (a week of cover — renewal needs an app
      // foreground). Android's re-arm happens per-fire in Kotlin from a
      // JS-computed fireAt that already lands after the skip, so it takes
      // the plain path below.
      if (androidMod === null && isSkipPending(alarm, now)) {
        const id = notificationIdentifierFor(alarm.id);
        for (const { suffix, fireAt } of skipOneshotPlan(
          alarm,
          ALARMKIT_SKIP_ONESHOT_COUNT,
          now
        )) {
          await mod.scheduleAlarm({
            ...base,
            alarmId: `${id}${suffix}`,
            fireAt,
            fixed: true,
          });
        }
      } else {
        await mod.scheduleAlarm({
          ...base,
          alarmId: notificationIdentifierFor(alarm.id),
          fireAt: nextAlarmFireTimestamp(alarm, now),
          repeatDays: alarm.repeatDays ?? null,
          fixed: isOnceAlarm(alarm),
        });
      }
      scheduled += 1;
    } catch {
      /* per-alarm failure non-fatal */
    }
  }
  return scheduled;
}

export async function cancelAllNativeAlarms(): Promise<void> {
  const mod = getAndroidModule() ?? getIosModule();
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
