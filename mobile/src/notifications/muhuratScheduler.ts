/**
 * Local notification scheduler for muhurat reminders (PRD-16 §6.7).
 *
 * Bundle-only, on-device via `expo-notifications`. The scheduling DECISIONS
 * live in the pure planner (`./muhuratReminderPure`, fully unit-tested); this
 * module is the thin glue around it — mirroring `vratScheduler.ts` exactly,
 * including the prefix-scoped cancel that keeps the seven notification families
 * from ever touching each other's slots.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ensureFamilyChannel, settleAfter } from './notificationChannels';
import { familyCap } from './notificationBudget';
import type { Lang } from '@/data/gita/language';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
import {
  planMuhuratReminders,
  formatMuhuratReminderContent,
  MUHURAT_NOTIF_PREFIX,
  type MuhuratReminderInput,
} from './muhuratReminderPure';

export type MuhuratNotificationPayload = {
  type: 'muhurat-reminder';
  occasionId: string;
  dateKey: string;
  /** Epoch ms of the followed civil day — what the deep link navigates with. */
  dateMs: number;
  kind: 'advance' | 'dayOf';
};

/** Cancel every muhurat reminder we own, leaving other notifications untouched. */
export async function cancelAllMuhuratReminders(): Promise<void> {
  await settleAfter('muhurat', cancelNotificationFamily(MUHURAT_NOTIF_PREFIX));
}

/**
 * Re-arm muhurat reminders: replace ours with the planned set
 * (soonest-first, within the rolling window, under the dedicated cap).
 * Idempotent and safe to call on every foreground, follow change, location
 * change, or calendar-system change. Returns the count actually scheduled.
 */
export async function scheduleMuhuratReminders(
  inputs: MuhuratReminderInput[],
  now: Date = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  const { planned } = planMuhuratReminders(inputs, now, familyCap(Platform.OS, 'muhurat'));

  const channelId = planned.length > 0 ? await ensureFamilyChannel('muhurat', lang) : undefined;

  const slots: FamilySlot[] = planned.map((p) => {
    const { title, body } = formatMuhuratReminderContent(p, lang);
    const payload: MuhuratNotificationPayload = {
      type: 'muhurat-reminder',
      occasionId: p.occasionId,
      dateKey: p.dateKey,
      dateMs: new Date(
        Number(p.dateKey.slice(0, 4)),
        Number(p.dateKey.slice(5, 7)) - 1,
        Number(p.dateKey.slice(8, 10))
      ).getTime(),
      kind: p.kind,
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
  return settleAfter('muhurat', armNotificationFamily(MUHURAT_NOTIF_PREFIX, slots));
}
