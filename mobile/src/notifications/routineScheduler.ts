/**
 * Local notification scheduler for per-routine reminders (PRD-07 Phase 3).
 *
 * Bundle-only, on-device via `expo-notifications`. The scheduling DECISIONS
 * live in the pure planner (`./routineReminderPure`); this module is the thin
 * expo-notifications glue around it — mirroring `sadhanaScheduler.ts`.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { ensureFamilyChannel, settleAfter } from './notificationChannels';
import { familyCap, familyWindowDays } from './notificationBudget';
import type { Lang } from '@/data/gita/language';
import { armNotificationFamily, cancelNotificationFamily, type FamilySlot } from './familyArm';
import {
  planRoutineReminders,
  formatRoutineReminderContent,
  ROUTINE_NOTIF_PREFIX,
  ROUTINE_WINDOW_DAYS,
  type RoutineReminderInput,
} from './routineReminderPure';

export type RoutineNotificationPayload = {
  type: 'routine-reminder';
  routineId: string;
  dateKey: string;
};

/** Cancel every routine reminder we own, leaving other notifications untouched. */
export async function cancelAllRoutineReminders(): Promise<void> {
  await settleAfter('routine', cancelNotificationFamily(ROUTINE_NOTIF_PREFIX));
}

/**
 * Re-arm routine reminders: cancel ours, then schedule the planned set.
 * Idempotent and safe to call on every app foreground. Returns the count
 * actually scheduled.
 */
export async function scheduleRoutineReminders(
  inputs: RoutineReminderInput[],
  now: Date = new Date(),
  lang: Lang = 'hi'
): Promise<number> {
  const { planned } = planRoutineReminders(
    inputs,
    now,
    familyWindowDays(Platform.OS, 'routine', ROUTINE_WINDOW_DAYS),
    familyCap(Platform.OS, 'routine')
  );

  const channelId = planned.length > 0 ? await ensureFamilyChannel('routine', lang) : undefined;

  const slots: FamilySlot[] = planned.map((p) => {
    const { title, body } = formatRoutineReminderContent(p, lang);
    const payload: RoutineNotificationPayload = {
      type: 'routine-reminder',
      routineId: p.routineId,
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
  return settleAfter('routine', armNotificationFamily(ROUTINE_NOTIF_PREFIX, slots));
}
