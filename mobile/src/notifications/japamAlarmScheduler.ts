/**
 * Cross-platform scheduler for Japam alarms.
 *
 * Android (real-alarm tier): delegates to the native module — Kotlin
 * `AlarmManager.setAlarmClock` + Notifee for the lock-screen UI and looping
 * mantra sound. Survives Doze; survives reboot (boot receiver re-arms).
 *
 * iOS 26+ (real-alarm tier): delegates to the AlarmKit native module — a
 * recurring system alarm that overrides silent mode and Focus, like the
 * Clock app. iOS < 26 (or Expo Go, where the module isn't bound) falls back to
 * an `expo-notifications` trigger with the bundled mantra clip as the
 * notification sound.
 *
 * Repeat semantics per alarm (`repeatDays`):
 *   - daily (undefined / all 7) → DAILY trigger, or native recurrence.
 *   - weekly subset → one WEEKLY trigger per selected day (expo tier), or
 *     native recurrence with the weekday mask.
 *   - once (`[]`) → a single one-shot; the context auto-disables the alarm
 *     after its recorded fire time passes (`firedOnceAlarmIds`).
 *   - skip-next → the JS-computed first fire already lands after the skipped
 *     date. Tiers whose recurrence can't express a one-day gap (expo
 *     repeating triggers, AlarmKit weekly) are armed as SKIP_ONESHOT_COUNT
 *     discrete one-shots while the skip is pending; the every-foreground
 *     reconcile restores the plain recurrence once the date passes.
 *
 * `scheduleJapamAlarms(alarms)` is idempotent: it cancels every Japam-alarm
 * slot it owns first (except in-flight snoozes), then schedules enabled
 * alarms. Safe to call on any state change.
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { findJapamMantra } from '@/data/japam';
import { getJapamAlarmSoundName } from '@assets/japam-alarm-sounds';
import {
  JAPAM_ALARM_CATEGORY,
  JAPAM_ALARM_IDENTIFIER_PREFIX,
  JAPAM_SNOOZE_ACTION_ID,
  SNOOZE_MINUTES,
  isJapamAlarmPayload,
  isOnceAlarm,
  isSnoozeIdentifier,
  localDateKey,
  nextAlarmFireTimestamp,
  nextAlarmFireTimestamps,
  notificationIdentifierFor,
  repeatsDaily,
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

/** How many discrete one-shots to arm while a skip-next is pending on a
 *  tier without gap-capable recurrence. Kept small to respect iOS's 64
 *  pending-notification budget; the every-foreground reconcile re-arms, so
 *  coverage only thins if the app stays closed this many fires in a row. */
const SKIP_ONESHOT_COUNT = 3;

/** AsyncStorage key for the one-time-alarm bookkeeping: `{ [alarmId]: fireAtMs }`
 *  recording what each enabled one-time alarm was armed for. The context
 *  reads it on load/foreground to auto-disable alarms that have fired. */
const ONCE_ARMED_KEY = '@vedansh/japam-alarms/once-armed';

const ensuredChannels = new Set<string>();
let categoryEnsured = false;

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

/** Attach the Snooze action to the fallback tier's notifications. The native
 *  tiers carry their own buttons (Kotlin actions / AlarmKit countdown). */
async function ensureSnoozeCategory(): Promise<void> {
  if (categoryEnsured) return;
  try {
    await Notifications.setNotificationCategoryAsync(JAPAM_ALARM_CATEGORY, [
      {
        identifier: JAPAM_SNOOZE_ACTION_ID,
        buttonTitle: 'Snooze 5 min',
        options: { opensAppToForeground: false },
      },
    ]);
    categoryEnsured = true;
  } catch {
    /* Category failure is non-fatal — the alarm still rings, minus Snooze. */
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
      .filter(
        (n) =>
          n.identifier.startsWith(JAPAM_ALARM_IDENTIFIER_PREFIX) &&
          !isSnoozeIdentifier(n.identifier)
      )
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
    categoryIdentifier: JAPAM_ALARM_CATEGORY,
  };
}

/** Expo weekday numbering: 1 = Sunday … 7 = Saturday (JS getDay() + 1). */
function expoWeekday(jsDay: number): number {
  return jsDay + 1;
}

type ExpoTrigger = Notifications.NotificationTriggerInput;

/**
 * The (identifier, trigger) pairs an alarm needs on the expo tier:
 *   - one-time / pending skip → discrete DATE one-shots;
 *   - daily → one DAILY trigger;
 *   - weekly subset → one WEEKLY trigger per selected day.
 */
function expoTriggerPlan(
  alarm: JapamAlarm,
  channelId: string | undefined,
  now: Date
): { identifier: string; trigger: ExpoTrigger }[] {
  const base = notificationIdentifierFor(alarm.id);
  const channel = channelId !== undefined ? { channelId } : {};

  const skipPending =
    alarm.skipNextDate !== undefined && alarm.skipNextDate >= localDateKey(now);
  if (isOnceAlarm(alarm) || skipPending) {
    const count = isOnceAlarm(alarm) ? 1 : SKIP_ONESHOT_COUNT;
    return nextAlarmFireTimestamps(alarm, count, now).map((ts, i) => ({
      identifier: i === 0 ? base : `${base}:occ${i}`,
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: ts,
        ...channel,
      } as ExpoTrigger,
    }));
  }

  if (repeatsDaily(alarm)) {
    return [
      {
        identifier: base,
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: alarm.time.hour,
          minute: alarm.time.minute,
          ...channel,
        } as ExpoTrigger,
      },
    ];
  }

  return (alarm.repeatDays ?? []).map((day) => ({
    identifier: `${base}:d${day}`,
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: expoWeekday(day),
      hour: alarm.time.hour,
      minute: alarm.time.minute,
      ...channel,
    } as ExpoTrigger,
  }));
}

async function scheduleViaExpo(
  alarms: JapamAlarm[],
  now: Date
): Promise<number> {
  await ensureSnoozeCategory();
  let scheduled = 0;
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    const customSound = getJapamAlarmSoundName(alarm.mantraId);
    let channelId: string | undefined;
    if (Platform.OS === 'android') {
      channelId = channelIdFor(alarm.mantraId, customSound);
      await ensureAndroidChannel(channelId, customSound);
    }
    const content = buildContent(alarm, customSound);
    let ok = false;
    for (const plan of expoTriggerPlan(alarm, channelId, now)) {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier: plan.identifier,
          content,
          trigger: plan.trigger,
        });
        ok = true;
      } catch {
        /* Per-slot failure non-fatal */
      }
    }
    if (ok) scheduled += 1;
  }
  return scheduled;
}

/** Persist which one-time alarms are armed and for when. Replaced wholesale
 *  on every reconcile so it always mirrors the current schedule. */
async function recordOnceArmed(
  alarms: JapamAlarm[],
  now: Date
): Promise<void> {
  const map: Record<string, number> = {};
  for (const alarm of alarms) {
    if (!alarm.enabled || !isOnceAlarm(alarm)) continue;
    map[alarm.id] = nextAlarmFireTimestamp(alarm, now);
  }
  await AsyncStorage.setItem(ONCE_ARMED_KEY, JSON.stringify(map)).catch(
    () => undefined
  );
}

/** Ids of one-time alarms whose armed fire time has passed — i.e. they rang
 *  (or their moment went by) and should now be auto-disabled. */
export async function firedOnceAlarmIds(
  now: Date = new Date()
): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(ONCE_ARMED_KEY);
    if (!raw) return [];
    const map = JSON.parse(raw) as Record<string, unknown>;
    return Object.entries(map)
      .filter(([, ts]) => typeof ts === 'number' && ts <= now.getTime())
      .map(([id]) => id);
  } catch {
    return [];
  }
}

/**
 * Snooze the given alarm: one-shot re-ring `SNOOZE_MINUTES` from now via a
 * `:snooze`-suffixed identifier that reconciliation deliberately ignores.
 * Used by the expo fallback tier's Snooze action (the native tiers snooze
 * natively).
 */
export async function snoozeJapamAlarm(
  alarm: Pick<JapamAlarm, 'id' | 'mantraId' | 'label'>,
  fireAtMs: number
): Promise<void> {
  const customSound = getJapamAlarmSoundName(alarm.mantraId);
  let channelId: string | undefined;
  if (Platform.OS === 'android') {
    channelId = channelIdFor(alarm.mantraId, customSound);
    await ensureAndroidChannel(channelId, customSound);
  }
  await Notifications.scheduleNotificationAsync({
    identifier: `${notificationIdentifierFor(alarm.id)}:snooze`,
    content: buildContent(
      { ...alarm, time: { hour: 0, minute: 0 }, enabled: true },
      customSound
    ),
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAtMs,
      ...(channelId !== undefined ? { channelId } : {}),
    } as ExpoTrigger,
  });
}

/**
 * Intercept a tap on the fallback tier's Snooze action: re-ring in
 * `SNOOZE_MINUTES`, dismiss the presented notification, and report handled
 * so the caller skips deep-link navigation. Best-effort — with the app
 * killed, background delivery of the action is OS-dependent; the native
 * tiers snooze natively and never reach this path.
 */
export function maybeHandleJapamSnoozeResponse(
  response: Notifications.NotificationResponse
): boolean {
  if (response.actionIdentifier !== JAPAM_SNOOZE_ACTION_ID) return false;
  const data = response.notification.request.content.data;
  if (!isJapamAlarmPayload(data)) return false;
  const label = response.notification.request.content.title;
  void snoozeJapamAlarm(
    {
      id: data.alarmId,
      mantraId: data.mantraId,
      ...(label ? { label } : {}),
    },
    Date.now() + SNOOZE_MINUTES * 60_000
  ).catch(() => undefined);
  void Promise.resolve(
    Notifications.dismissNotificationAsync(
      response.notification.request.identifier
    )
  ).catch(() => undefined);
  return true;
}

/**
 * Reconcile the OS-scheduled Japam alarms with the given list. Cancels every
 * existing Japam-alarm slot first, then schedules enabled ones. Idempotent.
 *
 * Returns the count of alarms actually scheduled.
 */
export async function scheduleJapamAlarms(
  alarms: JapamAlarm[]
): Promise<number> {
  await cancelAllJapamAlarmNotifications();
  const now = new Date();
  await recordOnceArmed(alarms, now);

  // Both platforms try the real-alarm-tier native module first
  // (AlarmManager.setAlarmClock on Android, AlarmKit on iOS 26+). The
  // module is only available where the build includes it AND the OS
  // supports it; otherwise we fall through to the expo-notifications
  // path. `scheduleNativeAlarmsForDay` no-ops when no module is bound.
  if (isNativeAlarmSupported()) {
    return scheduleNativeAlarmsForDay(alarms.filter((a) => a.enabled));
  }
  return scheduleViaExpo(alarms, now);
}
