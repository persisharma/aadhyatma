/**
 * Pure, side-effect-free planner for muhurat-reminder notifications (PRD-16 §6.7).
 *
 * The seventh notification family. Same shape as every other one — a pure
 * planner with `now` parameterised, plus thin expo glue in `muhuratScheduler.ts`
 * — and it deliberately shares `ADVANCE_HOUR` with the vrat planner so the two
 * evening notices can never drift apart.
 *
 * What is NOT shared is the ranking and the day-of time:
 *
 *   - Vrat follows are recurring rules ranked by the user's follow order. A
 *     muhurat follow is a dated one-shot, so the cap ranks by SOONEST FIRST.
 *   - A vrat's day-of notice is a morning greeting. A muhurat's day-of notice
 *     has to land BEFORE the window opens, or the feature has failed at the one
 *     job it has — hence `clampDayOf` below.
 *
 * Dependency-free so it runs under `tsx --test` with no React Native.
 */

import { ROLLING_WINDOW_DAYS } from './pure';
import { ADVANCE_HOUR } from './vratReminderPure';
import { formatRangeCompact } from '@/panchang/muhuratFormat';

/** Identifier prefix for all PRD-16 muhurat notifications. Lets us cancel just ours. */
export const MUHURAT_NOTIF_PREFIX = 'muhurat-reminder';

/**
 * Slice of iOS's 64 pending-notification budget for muhurat reminders. Modest
 * on purpose: this is the SEVENTH family sharing that budget, and a user
 * realistically follows a handful of dated muhurats, not dozens.
 */
export const MUHURAT_REMINDER_CAP = 8;

/** How far before the window's start the day-of notice lands. */
export const WINDOW_LEAD_MINUTES = 30;

export { ADVANCE_HOUR };

export type MuhuratTimeOfDay = { hour: number; minute: number };

export type ResolvedMuhuratReminder = {
  advanceDays: 0 | 1 | 2 | 3; // evening-before notice; 0 = off
  dayOf: boolean; // the day's own notice
  dayOfTime: MuhuratTimeOfDay; // already merged with the default
  dayOfAtWindow: boolean; // anchor day-of to the window instead of dayOfTime
};

export type MuhuratReminderInput = {
  occasionId: string;
  dateKey: string; // YYYY-MM-DD, the followed civil day
  date: Date; // local midnight of that day
  nameHi: string;
  nameEn: string;
  /**
   * The day's best window, re-derived at plan time. NEVER persisted with the
   * follow: every window is sunrise-derived, so a city change moves all of
   * them, and a stored time would silently lie the moment the user travels.
   */
  windowStart: Date | null;
  windowEnd: Date | null;
  windowNameHi: string | null;
  windowNameEn: string | null;
  /**
   * The day's tier AS OF NOW. An `excluded` day schedules nothing — a location
   * change can re-grade a followed day, and firing a reminder for a day the
   * engine now rejects is worse than firing nothing.
   */
  tier: 'shreshtha' | 'madhyam' | 'excluded';
  pref: ResolvedMuhuratReminder;
};

export type PlannedMuhuratNotification = {
  identifier: string;
  occasionId: string;
  dateKey: string;
  kind: 'advance' | 'dayOf';
  fireDate: Date;
  nameHi: string;
  nameEn: string;
  advanceDays: number; // 0 for day-of
  windowLabelHi: string | null; // "अमृत 6:07 – 7:41 AM" for the day-of body
  windowLabelEn: string | null;
};

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Resolve the day-of fire time, then clamp it behind the window.
 *
 * The clamp is the whole point. On 17 Aug 2026 in Bengaluru the best Vahan
 * window is Amrit 6:07–7:41 AM; the shipped vrat default day-of time is 07:00,
 * which would arrive 53 minutes AFTER the muhurat opened. So whatever the user
 * picked, the notice is pulled back to `windowStart - WINDOW_LEAD_MINUTES`
 * when it would otherwise land too late.
 *
 * Never earlier than local midnight of the day itself — a pre-dawn window must
 * not push the notice onto the previous evening, where it would collide with
 * the advance notice.
 */
export function clampDayOf(
  day: Date,
  dayOfTime: MuhuratTimeOfDay,
  windowStart: Date | null,
  atWindow: boolean
): Date {
  const midnight = startOfLocalDay(day);
  const atTime = startOfLocalDay(day);
  atTime.setHours(dayOfTime.hour, dayOfTime.minute, 0, 0);

  if (!windowStart) return atTime;

  const lead = new Date(windowStart.getTime() - WINDOW_LEAD_MINUTES * 60_000);
  const chosen = atWindow ? lead : atTime;
  const fire = chosen.getTime() > lead.getTime() ? lead : chosen;
  return fire.getTime() < midnight.getTime() ? midnight : fire;
}

type Candidate = PlannedMuhuratNotification & { sortKey: number };

/**
 * Compute the muhurat-reminder notifications to schedule across all follows.
 * Returns the planned notifications (≤ cap) plus the count truncated by the cap.
 *
 * Capping is soonest-first: a dated one-shot has no user-assigned priority, so
 * the nearest muhurat is the one that must survive the cap.
 */
export function planMuhuratReminders(
  inputs: MuhuratReminderInput[],
  now: Date,
  cap: number = MUHURAT_REMINDER_CAP,
  windowDays: number = ROLLING_WINDOW_DAYS
): { planned: PlannedMuhuratNotification[]; truncated: number } {
  const windowEnd = startOfLocalDay(now);
  windowEnd.setDate(windowEnd.getDate() + windowDays);
  windowEnd.setHours(23, 59, 59, 999);

  const inWindow = (fire: Date) =>
    fire.getTime() > now.getTime() && fire.getTime() <= windowEnd.getTime();

  const candidates: Candidate[] = [];
  for (const it of inputs) {
    // Verdict drift: the followed day no longer qualifies (usually a location
    // change). Keep the follow — the UI says so in words — but fire nothing.
    if (it.tier === 'excluded') continue;

    const day = startOfLocalDay(it.date);
    const windowLabelHi =
      it.windowStart && it.windowEnd && it.windowNameHi
        ? `${it.windowNameHi} ${formatRangeCompact(it.windowStart, it.windowEnd)}`
        : null;
    const windowLabelEn =
      it.windowStart && it.windowEnd && it.windowNameEn
        ? `${it.windowNameEn} ${formatRangeCompact(it.windowStart, it.windowEnd)}`
        : null;

    if (it.pref.advanceDays > 0) {
      const fire = startOfLocalDay(day);
      fire.setDate(fire.getDate() - it.pref.advanceDays);
      fire.setHours(ADVANCE_HOUR, 0, 0, 0);
      if (inWindow(fire)) {
        candidates.push({
          identifier: `${MUHURAT_NOTIF_PREFIX}:${it.occasionId}:advance:${it.dateKey}`,
          occasionId: it.occasionId,
          dateKey: it.dateKey,
          kind: 'advance',
          fireDate: fire,
          nameHi: it.nameHi,
          nameEn: it.nameEn,
          advanceDays: it.pref.advanceDays,
          windowLabelHi,
          windowLabelEn,
          sortKey: fire.getTime(),
        });
      }
    }

    if (it.pref.dayOf) {
      const fire = clampDayOf(day, it.pref.dayOfTime, it.windowStart, it.pref.dayOfAtWindow);
      if (inWindow(fire)) {
        candidates.push({
          identifier: `${MUHURAT_NOTIF_PREFIX}:${it.occasionId}:dayOf:${it.dateKey}`,
          occasionId: it.occasionId,
          dateKey: it.dateKey,
          kind: 'dayOf',
          fireDate: fire,
          nameHi: it.nameHi,
          nameEn: it.nameEn,
          advanceDays: 0,
          windowLabelHi,
          windowLabelEn,
          sortKey: fire.getTime(),
        });
      }
    }
  }

  // Soonest first; tie-break by identifier so the plan is deterministic (two
  // follows can share a fire minute — 18:00 advance notices routinely do).
  candidates.sort((a, b) =>
    a.sortKey !== b.sortKey ? a.sortKey - b.sortKey : a.identifier < b.identifier ? -1 : 1
  );

  const kept = candidates.slice(0, cap);
  const truncated = candidates.length - kept.length;
  const planned: PlannedMuhuratNotification[] = kept.map(({ sortKey, ...rest }) => rest);
  return { planned, truncated };
}

/**
 * Hindi-led notification copy. The day-of body carries the WINDOW, because the
 * window is the whole point of a muhurat — the vrat family's day-of copy names
 * only the day.
 */
export function formatMuhuratReminderContent(p: PlannedMuhuratNotification): {
  title: string;
  body: string;
} {
  const title = 'मुहूर्त स्मरण';
  if (p.kind === 'dayOf') {
    const hi = p.windowLabelHi ? `आज ${p.nameHi} — ${p.windowLabelHi}` : `आज ${p.nameHi} का मुहूर्त`;
    const en = p.windowLabelEn ? `${p.nameEn} today — ${p.windowLabelEn}` : `${p.nameEn} today`;
    return { title, body: `${hi} · ${en}` };
  }
  const when = p.advanceDays === 1 ? 'कल' : `${p.advanceDays} दिन में`;
  return { title, body: `${when} ${p.nameHi} का मुहूर्त · ${p.nameEn}` };
}
