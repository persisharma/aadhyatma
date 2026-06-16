/**
 * Pure, side-effect-free planner for vrat-reminder notifications (PRD-09 P3).
 *
 * Vrat reminders are DATE-SPECIFIC (a vrat falls on a particular day), unlike
 * the daily-verse scheduler's recurring times. For each followed vrat we may
 * schedule two local notifications around its next occurrence:
 *   - an "advance" notice the evening `advanceDays` before (to prepare), and
 *   - a "day-of" notice in the morning.
 *
 * Everything here is deterministic and dependency-free so it can be unit-tested
 * via `tsx` without bootstrapping React Native or expo-notifications. `now` is
 * always parameterised.
 */

import { ROLLING_WINDOW_DAYS } from './pure';

/** Identifier prefix for all PRD-09 vrat notifications. Lets us cancel just ours. */
export const VRAT_NOTIF_PREFIX = 'vrat-reminder';

/**
 * Dedicated slice of iOS's 64 pending-notification budget for vrat reminders.
 * The daily-verse scheduler owns the rest; keeping this modest leaves headroom
 * so the two schedulers don't collectively overflow the OS cap. We only ever
 * schedule the NEXT occurrence per followed vrat, so this is generous for any
 * realistic follow count.
 */
export const VRAT_REMINDER_CAP = 24;

/** Evening-before advance notice fires at this local hour. */
export const ADVANCE_HOUR = 18;

export type VratTimeOfDay = { hour: number; minute: number };

export type ResolvedVratReminder = {
  advanceDays: 0 | 1 | 2 | 3; // evening-before notice; 0 = off
  dayOf: boolean; // morning-of notice
  dayOfTime: VratTimeOfDay; // morning time (already resolved from global default)
};

export type VratReminderInput = {
  ruleId: string;
  order: number; // priority; lower = scheduled first when over the cap
  nameHi: string;
  nameEn: string;
  nextDate: Date | null; // next occurrence (local), or null if unresolved
  pref: ResolvedVratReminder; // already merged with the global default
};

export type PlannedVratNotification = {
  identifier: string;
  ruleId: string;
  kind: 'advance' | 'dayOf';
  fireDate: Date;
  nameHi: string;
  nameEn: string;
  occurrenceDateKey: string;
  advanceDays: number; // 0 for day-of
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

type Candidate = PlannedVratNotification & { order: number };

/**
 * Compute the vrat-reminder notifications to schedule across all followed vrats.
 * Returns the planned notifications (≤ cap) plus the count truncated by the cap.
 *
 * Capping is followed-first: candidates are ordered by (priority, fire time) so
 * the user's highest-priority vrats keep their reminders when the cap is hit.
 */
export function planVratReminders(
  inputs: VratReminderInput[],
  now: Date,
  cap: number = VRAT_REMINDER_CAP,
  windowDays: number = ROLLING_WINDOW_DAYS
): { planned: PlannedVratNotification[]; truncated: number } {
  const windowEnd = startOfLocalDay(now);
  windowEnd.setDate(windowEnd.getDate() + windowDays);
  windowEnd.setHours(23, 59, 59, 999);

  const inWindow = (fire: Date) => fire.getTime() > now.getTime() && fire.getTime() <= windowEnd.getTime();

  const candidates: Candidate[] = [];
  for (const it of inputs) {
    if (!it.nextDate) continue;
    const occ = startOfLocalDay(it.nextDate);
    const occurrenceDateKey = toDateKey(occ);

    if (it.pref.advanceDays > 0) {
      const fire = startOfLocalDay(occ);
      fire.setDate(fire.getDate() - it.pref.advanceDays);
      fire.setHours(ADVANCE_HOUR, 0, 0, 0);
      if (inWindow(fire)) {
        candidates.push({
          identifier: `${VRAT_NOTIF_PREFIX}:${it.ruleId}:advance:${occurrenceDateKey}`,
          ruleId: it.ruleId,
          kind: 'advance',
          fireDate: fire,
          nameHi: it.nameHi,
          nameEn: it.nameEn,
          occurrenceDateKey,
          advanceDays: it.pref.advanceDays,
          order: it.order,
        });
      }
    }

    if (it.pref.dayOf) {
      const fire = startOfLocalDay(occ);
      fire.setHours(it.pref.dayOfTime.hour, it.pref.dayOfTime.minute, 0, 0);
      if (inWindow(fire)) {
        candidates.push({
          identifier: `${VRAT_NOTIF_PREFIX}:${it.ruleId}:dayOf:${occurrenceDateKey}`,
          ruleId: it.ruleId,
          kind: 'dayOf',
          fireDate: fire,
          nameHi: it.nameHi,
          nameEn: it.nameEn,
          occurrenceDateKey,
          advanceDays: 0,
          order: it.order,
        });
      }
    }
  }

  // Followed-first: lowest order (highest priority) wins the cap; tie-break by
  // soonest fire so a single vrat's two notices stay together.
  candidates.sort((a, b) => (a.order !== b.order ? a.order - b.order : a.fireDate.getTime() - b.fireDate.getTime()));

  const kept = candidates.slice(0, cap);
  const truncated = candidates.length - kept.length;

  const planned: PlannedVratNotification[] = kept.map(({ order, ...rest }) => rest);
  return { planned, truncated };
}

/** Hindi-led notification copy for one planned vrat notification. */
export function formatVratReminderContent(p: PlannedVratNotification): { title: string; body: string } {
  const title = 'व्रत स्मरण';
  if (p.kind === 'dayOf') {
    return { title, body: `आज ${p.nameHi} है · ${p.nameEn} today` };
  }
  const when = p.advanceDays === 1 ? 'कल' : `${p.advanceDays} दिन में`;
  return { title, body: `${when} ${p.nameHi} · ${p.nameEn}` };
}
