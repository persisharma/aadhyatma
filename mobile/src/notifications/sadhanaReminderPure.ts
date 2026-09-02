/**
 * Pure, side-effect-free planner for sadhana-reminder notifications (PRD-11 P3).
 *
 * An enrolled sankalp with reminders on gets a daily nudge at the user's shared
 * reminder time (the Daily-Bhakti time — no separate per-program picker), across
 * a modest rolling window, deep-linking to Today's Practice. Deterministic and
 * dependency-free so it can be unit-tested via `tsx` without RN/expo. `now` is
 * always parameterised.
 */

import { ROLLING_WINDOW_DAYS } from './pure';

/** Identifier prefix for all PRD-11 sadhana reminders. Lets us cancel just ours. */
export const SADHANA_NOTIF_PREFIX = 'sadhana-reminder';

/**
 * Dedicated slice of iOS's 64 pending-notification budget. The daily-verse and
 * vrat schedulers own the rest; keeping this modest avoids collectively
 * overflowing the OS cap.
 */
export const SADHANA_REMINDER_CAP = 18;

/** Rolling window for sadhana reminders — shorter than the daily-verse window. */
export const SADHANA_WINDOW_DAYS = Math.min(9, ROLLING_WINDOW_DAYS);

export type SadhanaTimeOfDay = { hour: number; minute: number };

export type SadhanaReminderInput = {
  programId: string;
  order: number; // priority; lower = scheduled first when over the cap
  titleHi: string;
  titleEn: string;
  time: SadhanaTimeOfDay;
};

export type PlannedSadhanaNotification = {
  identifier: string;
  programId: string;
  fireDate: Date;
  dateKey: string;
  titleHi: string;
  titleEn: string;
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

type Candidate = PlannedSadhanaNotification & { order: number };

/**
 * Compute the sadhana reminders to schedule across all reminder-enabled
 * enrollments. Returns the planned notifications (≤ cap) plus the truncated
 * count. Capping is priority-first (order), then soonest fire.
 */
export function planSadhanaReminders(
  inputs: SadhanaReminderInput[],
  now: Date,
  windowDays: number = SADHANA_WINDOW_DAYS,
  cap: number = SADHANA_REMINDER_CAP
): { planned: PlannedSadhanaNotification[]; truncated: number } {
  const candidates: Candidate[] = [];
  const base = startOfLocalDay(now);

  for (const it of inputs) {
    for (let d = 0; d < windowDays; d += 1) {
      const fire = new Date(base);
      fire.setDate(fire.getDate() + d);
      fire.setHours(it.time.hour, it.time.minute, 0, 0);
      if (fire.getTime() <= now.getTime()) continue; // skip past times (e.g. today already elapsed)
      const dateKey = toDateKey(fire);
      candidates.push({
        identifier: `${SADHANA_NOTIF_PREFIX}:${it.programId}:${dateKey}`,
        programId: it.programId,
        fireDate: fire,
        dateKey,
        titleHi: it.titleHi,
        titleEn: it.titleEn,
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

/** Hindi-led notification copy for one planned sadhana reminder. */
export function formatSadhanaReminderContent(p: PlannedSadhanaNotification): {
  title: string;
  body: string;
} {
  return {
    title: 'संकल्प स्मरण',
    body: `${p.titleHi} · आज की साधना`,
  };
}
