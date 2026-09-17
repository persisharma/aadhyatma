/**
 * Local notification scheduler for return reminders (वापसी स्मरण).
 *
 * Bundle-only, on-device via `expo-notifications` — like every other family in
 * §38 there is no server push. All scheduling DECISIONS live in the pure planner
 * (`./returnReminderPure`, unit-tested under tsx); this module is the thin
 * expo-notifications glue around it, mirroring `festiveScheduler.ts`.
 *
 * The contract that makes the family work: `scheduleReturnReminders` is called
 * on EVERY app open (cold start and foreground, by `<ReturnReminderScheduler>`),
 * and it always cancels the family first. So the queue only ever holds a ladder
 * counted from the most recent open, and a slot fires only if the app has not
 * been opened since it was armed.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { Lang } from '@/data/gita/language';
import {
  planReturnReminders,
  formatReturnReminderContent,
  RETURN_NOTIF_PREFIX,
} from './returnReminderPure';

export type ReturnNotificationPayload = {
  type: 'return-reminder';
  dateKey: string;
  weekday: number;
  absentDays: number;
};

/**
 * Own Android channel so these nudges can be muted in system settings without
 * silencing the daily verse or festival pushes — the family has no in-app
 * toggle, so the channel is the user's mute path on Android. A channel's sound
 * and importance are pinned at creation; changing either later needs a NEW id
 * (the `-v2` dance documented for the japam channels).
 */
export const RETURN_CHANNEL_ID = 'return-reminders';

let channelEnsured = false;

async function ensureReturnChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  if (channelEnsured) return RETURN_CHANNEL_ID;
  try {
    await Notifications.setNotificationChannelAsync(RETURN_CHANNEL_ID, {
      name: 'Weekday practice reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: '#B8621B',
    });
    channelEnsured = true;
    return RETURN_CHANNEL_ID;
  } catch {
    // Channel creation failure is non-fatal: fall back to the app's `default`
    // channel rather than dropping the nudge entirely.
    return undefined;
  }
}

/** Cancel every return reminder we own, leaving other notifications untouched. */
export async function cancelAllReturnReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(RETURN_NOTIF_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Re-arm the return ladder from `now`: cancel ours, then schedule the planned
 * slots. Idempotent and MEANT to be called on every app foreground — that is
 * what pushes the ladder out past the current session. Returns the count
 * actually scheduled.
 */
export async function scheduleReturnReminders(
  now: Date = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  await cancelAllReturnReminders();

  const planned = planReturnReminders(now);
  if (planned.length === 0) return 0;

  const channelId = await ensureReturnChannel();

  let scheduled = 0;
  for (const p of planned) {
    const { title, body } = formatReturnReminderContent(p, lang);
    const payload: ReturnNotificationPayload = {
      type: 'return-reminder',
      dateKey: p.dateKey,
      weekday: p.weekday,
      absentDays: p.absentDays,
    };
    try {
      await Notifications.scheduleNotificationAsync({
        identifier: p.identifier,
        content: {
          title,
          body,
          data: payload as unknown as Record<string, unknown>,
          sound: 'default',
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: p.fireDate,
          ...(channelId !== undefined ? { channelId } : {}),
        } as Notifications.NotificationTriggerInput,
      });
      scheduled += 1;
    } catch {
      // Per-slot scheduling failure is non-fatal.
    }
  }

  return scheduled;
}
