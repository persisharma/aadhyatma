/**
 * Local notification scheduler for festive reminders.
 *
 * Bundle-only, on-device via `expo-notifications` — like every other family in
 * §38 there is no server push. All scheduling DECISIONS live in the pure planner
 * (`./festiveReminderPure`, fully unit-tested); this module is the thin
 * expo-notifications glue around it, mirroring `vratScheduler.ts`.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
import type { Lang } from '@/data/gita/language';
import {
  planFestiveReminders,
  formatFestiveReminderContent,
  FESTIVE_NOTIF_PREFIX,
  type FestiveReminderInput,
} from './festiveReminderPure';

export type FestiveNotificationPayload = {
  type: 'festive-reminder';
  ruleId: string;
  /** `LibraryEntry.id` the tap opens — baked in, so an OTA catalog edit can't reroute a queued notification. */
  sourceId: string;
  occurrenceDateKey: string;
};

/**
 * Own Android channel so festival pushes can be muted in system settings without
 * silencing the daily verse. A fresh id, never mutated: a channel's sound and
 * importance are pinned at creation, so changing either later needs a NEW id (the
 * `-v2` dance documented for the japam channels).
 */
export const FESTIVE_CHANNEL_ID = 'festive-reminders';

let channelEnsured = false;

async function ensureFestiveChannel(): Promise<string | undefined> {
  if (Platform.OS !== 'android') return undefined;
  if (channelEnsured) return FESTIVE_CHANNEL_ID;
  try {
    await Notifications.setNotificationChannelAsync(FESTIVE_CHANNEL_ID, {
      name: 'Festival reminders',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      lightColor: '#B8621B',
    });
    channelEnsured = true;
    return FESTIVE_CHANNEL_ID;
  } catch {
    // Channel creation failure is non-fatal: fall back to the app's `default`
    // channel rather than dropping the festival entirely.
    return undefined;
  }
}

/** Cancel every festive reminder we own, leaving other notifications untouched. */
export async function cancelAllFestiveReminders(): Promise<void> {
  await cancelNotificationFamily(FESTIVE_NOTIF_PREFIX);
}

/**
 * Re-arm festive reminders: replace ours with the planned set (soonest
 * first, within the rolling window, under the dedicated cap). Idempotent and safe
 * to call on every app foreground. Returns the count actually scheduled.
 */
export async function scheduleFestiveReminders(
  inputs: FestiveReminderInput[],
  now: Date = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  const { planned } = planFestiveReminders(inputs, now);
  // An empty plan still means "hold nothing": it cancels ours.
  if (planned.length === 0) return armNotificationFamily(FESTIVE_NOTIF_PREFIX, []);

  const channelId = await ensureFestiveChannel();

  const slots: FamilySlot[] = planned.map((p) => {
    const { title, body } = formatFestiveReminderContent(p, lang);
    const payload: FestiveNotificationPayload = {
      type: 'festive-reminder',
      ruleId: p.ruleId,
      sourceId: p.sourceId,
      occurrenceDateKey: p.occurrenceDateKey,
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
  return armNotificationFamily(FESTIVE_NOTIF_PREFIX, slots);
}
