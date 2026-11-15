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
 * and the queue is always made to hold exactly the ladder counted from that
 * open — slots from an older ladder are cancelled. So a slot fires only if the
 * app has not been opened since it was armed.
 *
 * "Exactly the ladder" is why a second open on the same day does no native
 * work: the ladder is dated in whole days, so the plan is identical and the
 * queue already holds it (`familyArm` compares the plans; it is not a
 * "recently armed" shortcut). The first open after midnight is a new plan and
 * re-arms as before.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
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
  await cancelNotificationFamily(RETURN_NOTIF_PREFIX);
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
  const planned = planReturnReminders(now);
  // An empty plan still means "hold nothing": it cancels ours.
  if (planned.length === 0) return armNotificationFamily(RETURN_NOTIF_PREFIX, []);

  const channelId = await ensureReturnChannel();

  const slots: FamilySlot[] = planned.map((p) => {
    const { title, body } = formatReturnReminderContent(p, lang);
    const payload: ReturnNotificationPayload = {
      type: 'return-reminder',
      dateKey: p.dateKey,
      weekday: p.weekday,
      absentDays: p.absentDays,
    };
    return {
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
    };
  });

  // Per-slot scheduling failure is non-fatal (see `armNotificationFamily`).
  return armNotificationFamily(RETURN_NOTIF_PREFIX, slots);
}
