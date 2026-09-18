/**
 * Japa-only streak, derived from the activity log.
 *
 * `UserActivityContext.currentStreak()` counts a day active if ANY activity
 * happened — a verse read alone keeps it alive. The Home साधना row and the
 * Japam widget both need the narrower question: how many consecutive days did
 * the user actually chant. That derivation lived in `widgets/planner.ts`, which
 * also pulls the widget schema, `panchang/types` and the transliterator; the
 * Home row must not drag any of that into its import graph (TRD-42 §7).
 *
 * So the pure helpers live here and `widgets/planner.ts` re-exports them. Both
 * consumers share one definition of "a japa day".
 */
import type { DailyEntry } from '@/contexts/UserActivityContext';

/** A day counts as japa-active when any mantra logged beads or rounds on it. */
export function japaDayIsActive(day?: DailyEntry): boolean {
  return !!day && Object.values(day.japa).some(({ beads, rounds }) => beads > 0 || rounds > 0);
}

/**
 * Shift a `YYYY-MM-DD` key by whole days.
 *
 * Arithmetic runs in UTC deliberately: the key is a civil date with no zone,
 * and doing this in local time would drop or duplicate a day across a DST
 * boundary. India has no DST, but the widget planner runs this against IST
 * keys on devices set to any zone.
 */
export function shiftDateKey(key: string, days: number): string {
  const [year, month, day] = key.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day + days));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}-${String(shifted.getUTCDate()).padStart(2, '0')}`;
}

/**
 * Consecutive japa days ending at `dateKey`.
 *
 * Today not yet chanted does NOT break the streak — the walk starts from
 * yesterday in that case, so a user who has not opened their mala yet this
 * morning still sees the run they are on rather than a zero that reads as
 * punishment. The streak only ends once a whole day passes with no japa.
 */
export function computeJapaStreak(activity: Record<string, DailyEntry>, dateKey: string): number {
  let cursor = dateKey;
  if (!japaDayIsActive(activity[cursor])) cursor = shiftDateKey(cursor, -1);
  let streak = 0;
  while (japaDayIsActive(activity[cursor])) {
    streak += 1;
    cursor = shiftDateKey(cursor, -1);
  }
  return streak;
}
