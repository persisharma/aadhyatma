/**
 * Local notification scheduler for sadhana reminders (PRD-11 P3).
 *
 * Bundle-only, on-device via `expo-notifications`. The scheduling DECISIONS live
 * in the pure planner (`./sadhanaReminderPure`); this module is the thin
 * expo-notifications glue around it — mirroring `vratScheduler.ts`.
 */

import * as Notifications from 'expo-notifications';
import {
  planSadhanaReminders,
  formatSadhanaReminderContent,
  SADHANA_NOTIF_PREFIX,
  type SadhanaReminderInput,
} from './sadhanaReminderPure';

export type SadhanaNotificationPayload = {
  type: 'sadhana-reminder';
  programId: string;
  dateKey: string;
};

/** Cancel every sadhana reminder we own, leaving other notifications untouched. */
export async function cancelAllSadhanaReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(SADHANA_NOTIF_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Re-arm sadhana reminders: cancel ours, then schedule the planned set.
 * Idempotent and safe to call on every app foreground. Returns the count
 * actually scheduled.
 */
export async function scheduleSadhanaReminders(
  inputs: SadhanaReminderInput[],
  now: Date = new Date()
): Promise<number> {
  await cancelAllSadhanaReminders();

  const { planned } = planSadhanaReminders(inputs, now);

  let scheduled = 0;
  for (const p of planned) {
    const { title, body } = formatSadhanaReminderContent(p);
    const payload: SadhanaNotificationPayload = {
      type: 'sadhana-reminder',
      programId: p.programId,
      dateKey: p.dateKey,
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
        },
      });
      scheduled += 1;
    } catch {
      // Per-slot scheduling failure is non-fatal.
    }
  }

  return scheduled;
}
