/**
 * Local notification scheduler for daily-verse reminders (PRD-01).
 *
 * Bundle-only: every notification is scheduled on-device via `expo-notifications`.
 * No server push, no network. Rolling 30-day window so we stay well under iOS's
 * 64 pending-notification cap. Pure helpers live in `./pure` so they can be
 * unit-tested without bootstrapping React Native.
 */

import * as Notifications from 'expo-notifications';
import { getVersePool } from '@/data/versePool';
import { pickVerseForDateKey, toDateKey } from './seed';
import {
  computeFireDatesMulti,
  formatNotificationContent,
  IOS_PENDING_CAP,
  NOTIF_IDENTIFIER_PREFIX,
  type DailyReminderConfig,
  type NotificationPayload,
} from './pure';

export {
  computeFireDates,
  computeFireDatesMulti,
  formatNotificationContent,
  IOS_PENDING_CAP,
  MAX_REMINDER_TIMES,
  NOTIF_IDENTIFIER_PREFIX,
  ROLLING_WINDOW_DAYS,
} from './pure';
export type { DailyReminderConfig, NotificationPayload, TimeOfDay } from './pure';

/**
 * Cancel every notification we own. Leaves any third-party scheduled
 * notifications (today: none, but JapamAudioPlayer could grow some) alone.
 */
export async function cancelAllDailyVerseNotifications(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(NOTIF_IDENTIFIER_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Schedule the rolling 30-day window. Cancels any existing daily-verse
 * notifications first so this function is idempotent and safe to call on every
 * app foreground.
 *
 * Returns the count actually scheduled (always ≤ ROLLING_WINDOW_DAYS, always
 * ≤ IOS_PENDING_CAP).
 */
export async function scheduleDailyVerseRollingWindow(
  config: DailyReminderConfig,
  now: Date = new Date()
): Promise<number> {
  await cancelAllDailyVerseNotifications();

  if (!config.enabled) return 0;
  if (config.times.length === 0) return 0;

  const pool = getVersePool();
  if (pool.length === 0) return 0;

  const dates = computeFireDatesMulti(config.times, now);

  // Hard cap: never exceed iOS's pending-notification budget. When the user
  // has multiple reminder times, this caps total notifications across all of
  // them — the nearest fire instants win.
  const limit = Math.min(dates.length, IOS_PENDING_CAP);

  let scheduled = 0;
  for (let i = 0; i < limit; i += 1) {
    const fire = dates[i];
    const dateKey = toDateKey(fire);
    const verse = pickVerseForDateKey(dateKey, pool);
    if (!verse) continue;

    const { title, body } = formatNotificationContent(verse);
    const payload: NotificationPayload = {
      type: 'daily-verse',
      dateKey,
      sourceId: verse.sourceId,
      verseIndex: verse.verseIndex,
      ...(verse.chapter != null ? { chapter: verse.chapter } : {}),
    };

    const hh = `${fire.getHours()}`.padStart(2, '0');
    const mm = `${fire.getMinutes()}`.padStart(2, '0');

    try {
      await Notifications.scheduleNotificationAsync({
        identifier: `${NOTIF_IDENTIFIER_PREFIX}:${dateKey}:${hh}${mm}`,
        content: {
          title,
          body,
          data: payload as unknown as Record<string, unknown>,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fire,
        },
      });
      scheduled += 1;
    } catch {
      // Per-slot scheduling failure is non-fatal — a future PRD-06 diagnostics
      // pass can ingest these via a local crash log.
    }
  }

  return scheduled;
}
