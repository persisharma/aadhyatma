/**
 * Pure day/completion resolver for Sadhana Programs (संकल्प). No React, no
 * storage, no I/O — so it is unit-testable without a provider tree (see
 * progress.test.ts) and shared by SadhanaContext + useSadhanaToday.
 *
 * Grace model (PRD-11 §5.3): the vow is "N days DONE", not "N consecutive
 * calendar days". For `consecutive`/`weekday`, `dayIndex` = completed-days + 1,
 * so a missed day pauses the sankalp instead of breaking it. A day is committed
 * at most once per calendar day, so finishing today's day unlocks the next
 * tomorrow.
 *
 * Calendar-anchored cadences (`weekday`, `festival-window`) additionally need
 * "is today an eligible practice day?" — a calendar fact. To stay pure, the
 * caller (useSadhanaToday) computes those facts from the panchang engine and
 * passes them in as `SadhanaSchedule`.
 */
import type { RoutineItem } from '@/data/routine/types';
import type { DayCompletion, SadhanaEnrollment, SadhanaProgram } from './types';

/** Total days in the program. */
export function programDayCount(p: SadhanaProgram): number {
  if (p.days) return p.days.length;
  switch (p.cadence.kind) {
    case 'consecutive':
      return p.cadence.days;
    case 'weekday':
      return p.cadence.count;
    case 'festival-window':
      return p.cadence.days;
  }
}

/** The reciting units for a given 1-based dayIndex, or [] if out of range. */
export function dayItemsFor(p: SadhanaProgram, dayIndex: number): RoutineItem[] {
  if (dayIndex < 1 || dayIndex > programDayCount(p)) return [];
  if (p.days) return p.days[dayIndex - 1]?.items ?? [];
  return p.day?.items ?? [];
}

/** How many days of the vow are done. */
export function completedDayCount(e: SadhanaEnrollment): number {
  return Object.keys(e.completedDays).length;
}

/**
 * Calendar facts for the eligibility-gated cadences, resolved by the caller from
 * the panchang engine. Ignored for `consecutive`.
 */
export type SadhanaSchedule = {
  /** `weekday`: is today an actual eligible day (e.g. a Shravan Monday)? */
  todayEligible?: boolean;
  /** `weekday`: 'YYYY-MM-DD' of the next eligible day (for "resting" copy). */
  nextEligibleKey?: string;
  /** `festival-window`: 1..days if today falls inside the window, else undefined. */
  windowDayIndex?: number;
  /** `festival-window`: 'YYYY-MM-DD' the window (next) starts, for upcoming copy. */
  windowStartKey?: string;
};

export type WaitingReason = 'weekday-off' | 'window-upcoming';

export type SadhanaTodayStatus =
  /** Today's day is open to practice. */
  | { kind: 'active'; dayIndex: number; totalDays: number; items: RoutineItem[] }
  /** Today's day was already completed today — come back tomorrow. */
  | { kind: 'done-today'; dayIndex: number; totalDays: number }
  /** Not practicable today (off-day / window not open) — a gentle resting state with the next selected unit visible. */
  | { kind: 'waiting'; totalDays: number; doneCount: number; reason: WaitingReason; whenKey?: string; items: RoutineItem[] }
  /** The whole sankalp is complete (पूर्णाहुति). */
  | { kind: 'completed'; totalDays: number; completedOn?: string };

/**
 * What to show for an enrolled program *today*. `todayKey` is the caller's
 * 'YYYY-MM-DD' (from UserActivityContext.toDateKey) so the resolver stays pure.
 * `schedule` supplies calendar eligibility for the gated cadences.
 */
export function resolveSadhanaToday(
  e: SadhanaEnrollment,
  p: SadhanaProgram,
  todayKey: string,
  schedule?: SadhanaSchedule
): SadhanaTodayStatus {
  const total = programDayCount(p);
  const done = completedDayCount(e);
  if (e.status === 'completed' || done >= total) {
    return { kind: 'completed', totalDays: total, completedOn: e.completedOn };
  }

  if (p.cadence.kind === 'festival-window') {
    const windowDayIndex = schedule?.windowDayIndex;
    if (windowDayIndex == null) {
      const nextDayIndex = Math.min(done + 1, total);
      return {
        kind: 'waiting',
        totalDays: total,
        doneCount: done,
        reason: 'window-upcoming',
        whenKey: schedule?.windowStartKey,
        items: dayItemsFor(p, nextDayIndex),
      };
    }
    // Festival days are calendar-anchored: the day index comes from the window,
    // not the completed count.
    if (e.completedDays[windowDayIndex]?.at === todayKey) {
      return { kind: 'done-today', dayIndex: windowDayIndex, totalDays: total };
    }
    return { kind: 'active', dayIndex: windowDayIndex, totalDays: total, items: dayItemsFor(p, windowDayIndex) };
  }

  if (p.cadence.kind === 'weekday') {
    // Completion-based day index (grace): the vow is "count eligible days done".
    const lastAt = done > 0 ? e.completedDays[done]?.at : undefined;
    if (lastAt === todayKey) return { kind: 'done-today', dayIndex: done, totalDays: total };
    if (!schedule?.todayEligible) {
      const nextDayIndex = Math.min(done + 1, total);
      return {
        kind: 'waiting',
        totalDays: total,
        doneCount: done,
        reason: 'weekday-off',
        whenKey: schedule?.nextEligibleKey,
        items: dayItemsFor(p, nextDayIndex),
      };
    }
    const dayIndex = done + 1;
    return { kind: 'active', dayIndex, totalDays: total, items: dayItemsFor(p, dayIndex) };
  }

  // consecutive
  const lastAt = done > 0 ? e.completedDays[done]?.at : undefined;
  if (lastAt === todayKey) return { kind: 'done-today', dayIndex: done, totalDays: total };
  const dayIndex = done + 1;
  return { kind: 'active', dayIndex, totalDays: total, items: dayItemsFor(p, dayIndex) };
}

/** The fields `orderSadhanaCards` sorts on — a structural subset of the view-model card. */
export type SadhanaOrderable = { program: SadhanaProgram; status: SadhanaTodayStatus };

/**
 * Ledger order for the Today's Practice screen (design.md §31/§46):
 * 1. the daily practice comes first — practicable-today cards (`active`), with
 *    `consecutive` (daily) cadence ahead of a calendar-gated day that merely
 *    happens to be eligible today;
 * 2. then cards already offered today (`done-today`);
 * 3. then resting / upcoming sankalps **by nearest date first** (a `waiting`
 *    card's `whenKey` — the next eligible / window-start day; missing keys sort
 *    last);
 * 4. completed sankalps last.
 * Ties preserve input (enrollment) order — Array.sort is stable. Pure and does
 * not mutate its input, so it is unit-tested without a provider tree.
 */
export function orderSadhanaCards<T extends SadhanaOrderable>(cards: T[]): T[] {
  const statusRank = (s: SadhanaTodayStatus): number =>
    s.kind === 'active' ? 0 : s.kind === 'done-today' ? 1 : s.kind === 'waiting' ? 2 : 3;
  // Daily (consecutive) is "the daily card" the ledger opens on.
  const cadenceRank = (p: SadhanaProgram): number => (p.cadence.kind === 'consecutive' ? 0 : 1);
  const nearestKey = (s: SadhanaTodayStatus): string => (s.kind === 'waiting' ? s.whenKey ?? '' : '');

  return [...cards].sort((a, b) => {
    const byStatus = statusRank(a.status) - statusRank(b.status);
    if (byStatus !== 0) return byStatus;
    const byCadence = cadenceRank(a.program) - cadenceRank(b.program);
    if (byCadence !== 0) return byCadence;
    // Nearest upcoming date first; undated cards keep enrollment order behind dated ones.
    const ak = nearestKey(a.status);
    const bk = nearestKey(b.status);
    if (ak && bk) return ak < bk ? -1 : ak > bk ? 1 : 0;
    if (ak) return -1;
    if (bk) return 1;
    return 0;
  });
}

/** completedDays with `dayIndex` recorded — pure, for the context to persist. */
export function withDayCommitted(
  e: SadhanaEnrollment,
  dayIndex: number,
  completion: DayCompletion
): Record<number, DayCompletion> {
  return { ...e.completedDays, [dayIndex]: completion };
}
