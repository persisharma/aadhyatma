import { useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useRoutines } from '@/contexts/RoutineContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import { scheduleRoutineReminders, cancelAllRoutineReminders } from '@/notifications/routineScheduler';
import type { RoutineReminderInput } from '@/notifications/routineReminderPure';

/**
 * Headless: keeps per-routine reminders (PRD-07 P3) armed. Re-arms whenever
 * the routines change (create/delete/rename/re-time/reminder change), the OS
 * permission changes, today's completion state changes (finishing the last
 * item drops today's slot — §7 suppression), or the app returns to the
 * foreground (so the rolling window advances with the calendar). Mirrors
 * `SadhanaReminderScheduler`. Renders nothing.
 *
 * Each reminder fires at the routine's own stored time and deep-links to
 * Today's Practice. Permission is shared with the other schedulers — we only
 * schedule when it is already granted, and never prompt from here (the
 * RoutineDetail toggle owns the ask).
 */
export default function RoutineReminderScheduler() {
  const { routines, isLoading } = useRoutines();
  const { permissionStatus } = useNotificationPreferences();
  const today = useRoutineToday();
  const [foregroundTick, setForegroundTick] = useState(0);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appStateRef.current;
      appStateRef.current = next;
      if (prev !== 'active' && next === 'active') setForegroundTick((t) => t + 1);
    });
    return () => sub.remove();
  }, []);

  // Routine ids whose scheduled-today items are ALL complete (§7 suppression),
  // derived from the same composition RoutineToday shows (manual marks +
  // ReadingProgress + UserActivity). Collapsed to a stable signature so the
  // re-arm effect fires exactly when a routine crosses the completion line,
  // not on every recompute of the today view-model. Best-effort by design:
  // it can only run while the app is alive to observe the completion.
  const completedTodaySignature = useMemo(() => {
    const done = new Set<string>();
    const seen = new Set<string>(today.entries.map((e) => e.routine.id));
    for (const id of seen) {
      const entries = today.entries.filter((e) => e.routine.id === id);
      if (entries.length > 0 && entries.every((e) => e.done)) done.add(id);
    }
    return [...done].sort().join('|');
  }, [today.entries]);

  useEffect(() => {
    if (isLoading) return undefined;
    let cancelled = false;
    (async () => {
      if (permissionStatus !== 'granted') {
        // Grant revoked (or never given): drop our slots but leave each
        // routine's stored `reminder` intact, so a re-grant restores them
        // without re-setup (§5.2).
        await cancelAllRoutineReminders().catch(() => undefined);
        return;
      }
      const completed = new Set(completedTodaySignature.split('|').filter(Boolean));
      const inputs: RoutineReminderInput[] = [];
      let order = 0;
      for (const r of routines) {
        if (!r.reminder) continue;
        // Weekday routines fire only on the union of their item-days; the
        // union (not the whole week) is the routine's real schedule, and an
        // empty union — no items yet — schedules nothing (§5.1 caption warns).
        const days: 'daily' | number[] =
          r.mode === 'daily'
            ? 'daily'
            : [...new Set(r.items.flatMap((i) => i.weekdays ?? []))];
        inputs.push({
          routineId: r.id,
          order: order++, // creation order = priority when over the cap
          nameHi: r.nameHi,
          nameEn: r.nameEn,
          time: { hour: r.reminder.hour, minute: r.reminder.minute },
          days,
          completedToday: completed.has(r.id),
        });
      }
      if (cancelled) return;
      await scheduleRoutineReminders(inputs).catch(() => undefined);
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoading, routines, permissionStatus, completedTodaySignature, foregroundTick]);

  return null;
}
