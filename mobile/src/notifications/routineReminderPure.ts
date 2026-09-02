/**
 * Pure, side-effect-free planner for routine-reminder notifications
 * (PRD-07 Phase 3 — per-routine reminders, the final PRD-07 phase).
 *
 * A routine with a `reminder` time gets a nudge at that time — daily for
 * `daily` routines, only on its scheduled weekdays for `weekday` routines —
 * deep-linking to Today's Practice. Mirrors `sadhanaReminderPure.ts` in shape:
 * deterministic and dependency-free so it can be unit-tested via `tsx` without
 * RN/expo. `now` is always parameterised.
 */

import { ROLLING_WINDOW_DAYS } from './pure';

/** Identifier prefix for all PRD-07 P3 routine reminders. Lets us cancel just ours. */
export const ROUTINE_NOTIF_PREFIX = 'routine-reminder';

/**
 * Dedicated slice of iOS's 64 pending-notification budget. The seven shipped
 * families already over-subscribe the OS cap in the worst case (see the wiki
 * notifications gotcha), so this family stays deliberately small.
 */
export const ROUTINE_REMINDER_CAP = 12;

/**
 * Rolling window for routine reminders — a week is enough because the headless
 * scheduler re-arms on every app foreground; the window only has to outlast an
 * absence, and a longer-absent user still has the daily verse nudging.
 */
export const ROUTINE_WINDOW_DAYS = Math.min(7, ROLLING_WINDOW_DAYS);

export type RoutineReminderTime = { hour: number; minute: number };

export type RoutineReminderInput = {
  routineId: string;
  /** Priority; lower = scheduled first when over the cap (creation order — the
   * user's first routine is presumed primary). */
  order: number;
  nameHi: string;
  nameEn: string;
  time: RoutineReminderTime;
  /**
   * `'daily'` fires every day; a weekday set (0=Sun … 6=Sat — the union of the
   * routine's item weekdays) fires only on those days. An empty set yields no
   * candidates (a weekday routine with no items has no days to remind on).
   */
  days: 'daily' | number[];
  /** When true, today's candidate is skipped — the practice is already
   * complete, and a reminder for a finished practice trains users to ignore
   * the whole family. Tomorrow onward is always planned. */
  completedToday?: boolean;
};

export type PlannedRoutineNotification = {
  identifier: string;
  routineId: string;
  fireDate: Date;
  dateKey: string;
  nameHi: string;
  nameEn: string;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type Candidate = PlannedRoutineNotification & { order: number };

/**
 * Compute the routine reminders to schedule across all reminder-enabled
 * routines. Returns the planned notifications (≤ cap) plus the truncated
 * count. Capping is priority-first (order), then soonest fire — as in
 * `planSadhanaReminders`.
 */
export function planRoutineReminders(
  inputs: RoutineReminderInput[],
  now: Date,
  windowDays: number = ROUTINE_WINDOW_DAYS,
  cap: number = ROUTINE_REMINDER_CAP
): { planned: PlannedRoutineNotification[]; truncated: number } {
  const candidates: Candidate[] = [];
  const base = startOfLocalDay(now);
  const todayKey = toDateKey(now);

  for (const it of inputs) {
    for (let d = 0; d < windowDays; d += 1) {
      const fire = new Date(base);
      fire.setDate(fire.getDate() + d);
      fire.setHours(it.time.hour, it.time.minute, 0, 0);
      if (fire.getTime() <= now.getTime()) continue; // skip past times (e.g. today already elapsed)
      // Weekday filter: a weekday routine only fires on its scheduled days.
      if (it.days !== 'daily' && !it.days.includes(fire.getDay())) continue;
      const dateKey = toDateKey(fire);
      // Completion suppression is a per-day fact, so it only removes today.
      if (it.completedToday && dateKey === todayKey) continue;
      candidates.push({
        identifier: `${ROUTINE_NOTIF_PREFIX}:${it.routineId}:${dateKey}`,
        routineId: it.routineId,
        fireDate: fire,
        dateKey,
        nameHi: it.nameHi,
        nameEn: it.nameEn,
        order: it.order,
      });
    }
  }

  candidates.sort((a, b) =>
    a.order !== b.order ? a.order - b.order : a.fireDate.getTime() - b.fireDate.getTime()
  );

  const kept = candidates.slice(0, cap);
  const truncated = candidates.length - kept.length;
  const planned = kept.map(({ order, ...rest }) => rest);
  return { planned, truncated };
}

/**
 * Hindi-led notification copy for one planned routine reminder. Routine names
 * are user-entered and either field may be blank, so the Devanagari name falls
 * back to the English one. No live counts: content is baked at schedule time,
 * so any count would be stale by the moment it fires.
 */
export function formatRoutineReminderContent(p: PlannedRoutineNotification): {
  title: string;
  body: string;
} {
  const name = p.nameHi || p.nameEn;
  return {
    title: 'नित्य साधना स्मरण',
    body: `${name} · आज की साधना`,
  };
}
