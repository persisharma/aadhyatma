/**
 * Local notification scheduler for per-routine reminders (PRD-07 Phase 3).
 *
 * Bundle-only, on-device via `expo-notifications`. The scheduling DECISIONS
 * live in the pure planner (`./routineReminderPure`); this module is the thin
 * expo-notifications glue around it — mirroring `sadhanaScheduler.ts`.
 */

import * as Notifications from 'expo-notifications';
import {
  planRoutineReminders,
  formatRoutineReminderContent,
  ROUTINE_NOTIF_PREFIX,
  type RoutineReminderInput,
} from './routineReminderPure';

export type RoutineNotificationPayload = {
  type: 'routine-reminder';
  routineId: string;
  dateKey: string;
};

/** Cancel every routine reminder we own, leaving other notifications untouched. */
export async function cancelAllRoutineReminders(): Promise<void> {
  const pending = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    pending
      .filter((n) => n.identifier.startsWith(ROUTINE_NOTIF_PREFIX))
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier))
  );
}

/**
 * Re-arm routine reminders: cancel ours, then schedule the planned set.
 * Idempotent and safe to call on every app foreground. Returns the count
 * actually scheduled.
 */
export async function scheduleRoutineReminders(
  inputs: RoutineReminderInput[],
  now: Date = new Date()
): Promise<number> {
  await cancelAllRoutineReminders();

  const { planned } = planRoutineReminders(inputs, now);

  let scheduled = 0;
  for (const p of planned) {
    const { title, body } = formatRoutineReminderContent(p);
    const payload: RoutineNotificationPayload = {
      type: 'routine-reminder',
      routineId: p.routineId,
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
