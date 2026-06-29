/**
 * Cross-platform scheduler for Japam alarms.
 *
 * Android (real-alarm tier): delegates to the native module — Kotlin
 * `AlarmManager.setAlarmClock` + Notifee for the lock-screen UI and looping
 * mantra sound. Survives Doze; survives reboot (boot receiver re-arms).
 *
 * iOS (notification tier): uses `expo-notifications` DAILY trigger with the
 * bundled mantra clip as the notification sound. AlarmKit (iOS 26+) is a
 * future module — until then the iOS path is a normal scheduled notification.
 *
 * `scheduleJapamAlarms(alarms)` is idempotent: it cancels every Japam-alarm
 * slot it owns first, then schedules enabled alarms. Safe to call on any
 * state change.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { findJapamMantra } from '@/data/japam';
import { getJapamAlarmSoundName } from '@assets/japam-alarm-sounds';
import {
  JAPAM_ALARM_IDENTIFIER_PREFIX,
  notificationIdentifierFor,
  type JapamAlarm,
  type JapamAlarmPayload,
} from './japamAlarms';
import {
  cancelAllNativeAlarms,
  scheduleNativeAlarmsForDay,
  isNativeAlarmSupported,
} from './japamAlarmNative';

/** Fallback channel for mantras without a custom alarm clip. */
const FALLBACK_CHANNEL_ID = 'japam-alarms';

const ensuredChannels = new Set<string>();

function channelIdFor(mantraId: string, customSound: string | null): string {
  // Android 8+ pins sound at channel-creation time; channel per custom sound
  // so each mantra rings with its own clip.
  return customSound ? `japam-alarm:${mantraId}` : FALLBACK_CHANNEL_ID;
}

async function ensureAndroidChannel(
  channelId: string,
  customSound: string | null
): Promise<void> {
  if (Platform.OS !== 'android') return;
  if (ensuredChannels.has(channelId)) return;
  try {
    await Notifications.setNotificationChannelAsync(channelId, {
      name: customSound ? 'Japam Alarms (Mantra)' : 'Japam Alarms',
      importance: Notifications.AndroidImportance.HIGH,
      sound: customSound ?? 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#B8621B',
      showBadge: false,
    });
    ensuredChannels.add(channelId);
  } catch {
    /* Channel creation failure is non-fatal — falls back to default channel. */
  }
}

export async function cancelAllJapamAlarmNotifications(): Promise<void> {
  if (Platform.OS === 'android' && isNativeAlarmSupported()) {
    await cancelAllNativeAlarms().catch(() => undefined);
    // Also clear any expo-notifications-scheduled slots in case the user has
    // upgraded from a previous app version that used the iOS-style path on
    // Android. Idempotent.
  }
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(JAPAM_ALARM_IDENTIFIER_PREFIX))
      .map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier).catch(
          () => undefined
        )
      )
  );
}

function buildContent(
  alarm: JapamAlarm,
  customSound: string | null
): Notifications.NotificationContentInput {
  const mantra = findJapamMantra(alarm.mantraId);
  const title = alarm.label?.trim()
    ? alarm.label.trim()
    : 'जप का समय · Japam time';
  const body = mantra
    ? `${mantra.nameHi} · ${mantra.nameEn}`
    : 'Tap to begin chanting';
  const payload: JapamAlarmPayload = {
    type: 'japam-alarm',
    alarmId: alarm.id,
    mantraId: alarm.mantraId,
  };
  return {
    title,
    body,
    data: payload as unknown as Record<string, unknown>,
    sound: customSound ?? 'default',
  };
}

async function scheduleIosAlarms(alarms: JapamAlarm[]): Promise<number> {
  let scheduled = 0;
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    const customSound = getJapamAlarmSoundName(alarm.mantraId);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notificationIdentifierFor(alarm.id),
        content: buildContent(alarm, customSound),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: alarm.time.hour,
          minute: alarm.time.minute,
        },
      });
      scheduled += 1;
    } catch {
      /* Per-alarm failure non-fatal */
    }
  }
  return scheduled;
}

async function scheduleAndroidViaExpoFallback(
  alarms: JapamAlarm[]
): Promise<number> {
  let scheduled = 0;
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    const customSound = getJapamAlarmSoundName(alarm.mantraId);
    const channelId = channelIdFor(alarm.mantraId, customSound);
    await ensureAndroidChannel(channelId, customSound);
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: notificationIdentifierFor(alarm.id),
        content: buildContent(alarm, customSound),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: alarm.time.hour,
          minute: alarm.time.minute,
          channelId,
        },
      });
      scheduled += 1;
    } catch {
      /* per-alarm failure non-fatal */
    }
  }
  return scheduled;
}

/**
 * Reconcile the OS-scheduled Japam alarms with the given list. Cancels every
 * existing Japam-alarm slot first, then schedules enabled ones. Idempotent.
 *
 * Returns the count actually scheduled.
 */
export async function scheduleJapamAlarms(
  alarms: JapamAlarm[]
): Promise<number> {
  await cancelAllJapamAlarmNotifications();

  // Both platforms try the real-alarm-tier native module first
  // (AlarmManager.setAlarmClock on Android, AlarmKit on iOS 26+). The
  // module is only available where the build includes it AND the OS
  // supports it; otherwise we fall through to the expo-notifications
  // path. `scheduleNativeAlarmsForDay` no-ops when no module is bound.
  if (isNativeAlarmSupported()) {
    return scheduleNativeAlarmsForDay(alarms.filter((a) => a.enabled));
  }
  if (Platform.OS === 'android') {
    return scheduleAndroidViaExpoFallback(alarms);
  }
  return scheduleIosAlarms(alarms);
}
