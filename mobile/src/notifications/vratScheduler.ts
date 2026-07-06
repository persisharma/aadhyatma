/**
 * Local notification scheduler for vrat reminders (PRD-09 P3).
 *
 * Bundle-only, on-device via `expo-notifications`. The scheduling DECISIONS live
 * in the pure planner (`./vratReminderPure`, fully unit-tested); this module is
 * the thin expo-notifications glue around it — mirroring `scheduler.ts`.
 */

import * as Notifications from 'expo-notifications';
import {
  planVratReminders,
  formatVratReminderContent,
  VRAT_NOTIF_PREFIX,
  type VratReminderInput,
} from './vratReminderPure';

export type VratNotificationPayload = {
  type: 'vrat-reminder';
  ruleId: string;
  occurrenceDateKey: string;
  kind: 'advance' | 'dayOf';
};

/** Cancel every vrat reminder we own, leaving other notifications untouched. */
export async function cancelAllVratReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(VRAT_NOTIF_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Re-arm vrat reminders: cancel ours, then schedule the planned set (followed-
 * first, within the rolling window, under the dedicated iOS cap). Idempotent and
 * safe to call on every app foreground. Returns the count actually scheduled.
 */
export async function scheduleVratReminders(
  inputs: VratReminderInput[],
  now: Date = new Date()
): Promise<number> {
  await cancelAllVratReminders();

  const { planned } = planVratReminders(inputs, now);

  let scheduled = 0;
  for (const p of planned) {
    const { title, body } = formatVratReminderContent(p);
    const payload: VratNotificationPayload = {
      type: 'vrat-reminder',
      ruleId: p.ruleId,
      occurrenceDateKey: p.occurrenceDateKey,
      kind: p.kind,
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
