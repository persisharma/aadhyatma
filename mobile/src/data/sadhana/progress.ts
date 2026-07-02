/**
 * Pure day/completion resolver for Sadhana Programs (संकल्प). No React, no
 * storage, no I/O — so it is unit-testable without a provider tree (see
 * progress.test.ts) and shared by SadhanaContext + useSadhanaToday.
 *
 * Grace model (PRD-11 §5.3): the vow is "N days DONE", not "N consecutive
 * calendar days". `dayIndex` = completed-days + 1, so a missed calendar day
 * pauses the sankalp instead of breaking it. A day is committed at most once
 * per calendar day, so finishing today's day unlocks the next day tomorrow.
 */
import type { RoutineItem } from '@/data/routine/types';
import type { DayCompletion, SadhanaEnrollment, SadhanaProgram } from './types';

/** Total days in the program. */
export function programDayCount(p: SadhanaProgram): number {
  if (p.days) return p.days.length;
  return p.cadence.kind === 'consecutive' ? p.cadence.days : 0;
}

/** The reciting units for a given 1-based dayIndex, or [] if out of range. */
export function dayItemsFor(p: SadhanaProgram, dayIndex: number): RoutineItem[] {
  if (dayIndex < 1 || dayIndex > programDayCount(p)) return [];
  if (p.days) return p.days[dayIndex - 1]?.items ?? [];
  return p.day?.items ?? [];
}

/** How many days of the vow are done. Keys are contiguous 1…count by construction. */
export function completedDayCount(e: SadhanaEnrollment): number {
  return Object.keys(e.completedDays).length;
}

export type SadhanaTodayStatus =
  /** Today's day is open to practice. */
  | { kind: 'active'; dayIndex: number; totalDays: number; items: RoutineItem[] }
  /** Today's day was already completed today — come back tomorrow. */
  | { kind: 'done-today'; dayIndex: number; totalDays: number }
  /** The whole sankalp is complete (पूर्णाहुति). */
  | { kind: 'completed'; totalDays: number; completedOn?: string };

/**
 * What to show for an enrolled program *today*. `todayKey` is the caller's
 * 'YYYY-MM-DD' (from UserActivityContext.toDateKey) so the resolver stays pure.
 */
export function resolveSadhanaToday(
  e: SadhanaEnrollment,
  p: SadhanaProgram,
  todayKey: string
): SadhanaTodayStatus {
  const total = programDayCount(p);
  const done = completedDayCount(e);
  if (e.status === 'completed' || done >= total) {
    return { kind: 'completed', totalDays: total, completedOn: e.completedOn };
  }
  // If the most-recently completed day was completed *today*, the vow is done
  // for today; the next day unlocks tomorrow.
  const lastAt = done > 0 ? e.completedDays[done]?.at : undefined;
  if (lastAt === todayKey) {
    return { kind: 'done-today', dayIndex: done, totalDays: total };
  }
  const dayIndex = done + 1;
  return { kind: 'active', dayIndex, totalDays: total, items: dayItemsFor(p, dayIndex) };
}

/** completedDays with `dayIndex` recorded — pure, for the context to persist. */
export function withDayCommitted(
  e: SadhanaEnrollment,
  dayIndex: number,
  completion: DayCompletion
): Record<number, DayCompletion> {
  return { ...e.completedDays, [dayIndex]: completion };
}
