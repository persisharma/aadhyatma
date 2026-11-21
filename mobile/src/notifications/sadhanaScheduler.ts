/**
 * Local notification scheduler for sadhana reminders (PRD-11 P3).
 *
 * Bundle-only, on-device via `expo-notifications`. The scheduling DECISIONS live
 * in the pure planner (`./sadhanaReminderPure`); this module is the thin
 * expo-notifications glue around it — mirroring `vratScheduler.ts`.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ensureFamilyChannel, settleAfter } from './notificationChannels';
import { familyCap, familyWindowDays } from './notificationBudget';
import type { Lang } from '@/data/gita/language';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
import {
  planSadhanaReminders,
  formatSadhanaReminderContent,
  SADHANA_NOTIF_PREFIX,
  SADHANA_WINDOW_DAYS,
  type SadhanaReminderInput,
} from './sadhanaReminderPure';

export type SadhanaNotificationPayload = {
  type: 'sadhana-reminder';
  programId: string;
  dateKey: string;
};

/** Cancel every sadhana reminder we own, leaving other notifications untouched. */
export async function cancelAllSadhanaReminders(): Promise<void> {
  await settleAfter('sadhana', cancelNotificationFamily(SADHANA_NOTIF_PREFIX));
}

/**
 * Re-arm sadhana reminders: replace ours with the planned set.
 * Idempotent and safe to call on every app foreground. Returns the count
 * actually scheduled.
 */
export async function scheduleSadhanaReminders(
  inputs: SadhanaReminderInput[],
  now: Date = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  const { planned } = planSadhanaReminders(
    inputs,
    now,
    familyWindowDays(Platform.OS, 'sadhana', SADHANA_WINDOW_DAYS),
    familyCap(Platform.OS, 'sadhana')
  );

  const channelId = planned.length > 0 ? await ensureFamilyChannel('sadhana', lang) : undefined;

  const slots: FamilySlot[] = planned.map((p) => {
    const { title, body } = formatSadhanaReminderContent(p, lang);
    const payload: SadhanaNotificationPayload = {
      type: 'sadhana-reminder',
      programId: p.programId,
      dateKey: p.dateKey,
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
  return settleAfter('sadhana', armNotificationFamily(SADHANA_NOTIF_PREFIX, slots));
}
