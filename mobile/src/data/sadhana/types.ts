/**
 * Sadhana Programs (संकल्प) — data shapes. See docs/roadmap/prds/11-sadhana-programs.md.
 *
 * A Sadhana Program is a bundled, authored, multi-day devotional commitment
 * (a sankalp): a 41-day Hanuman Chalisa anushthan, the Gita in 18 days, etc.
 * The catalog is bundled JSON-in-TS; a user's *enrollment* + per-day progress
 * are stored on-device via AsyncStorage (see SadhanaContext), exactly like
 * RoutineContext. No account, no server.
 *
 * A "program day" is an ordered set of RoutineItems — the SAME reciting-unit
 * abstraction the Daily Routine uses (`section | chapter | japam`), so the
 * reader/japam deep-links (entryRoutes.navigateToRoutineItem) and the auto-
 * complete resolver (units.isItemAutoComplete) are shared, not reimplemented.
 */
import type { RoutineItem } from '@/data/routine/types';
import type { Deity } from '@/data/texts';

/**
 * How a program's days are laid out over time. Phase 1 ships `consecutive`
 * only; `weekday` (Shravan Somvar) and `festival-window` (Navratri) are Phase 4
 * and slot into this union without touching the resolver's day-count contract.
 */
export type SadhanaCadence =
  | { kind: 'consecutive'; days: number };

/** One day of a program: an ordered set of reciting units. */
export type SadhanaDay = { items: RoutineItem[] };

export type SadhanaProgram = {
  id: string;
  titleHi: string;
  titleEn: string;
  /** Short framing under the title, e.g. "इकतालीस दिन का संकल्प". */
  subtitleHi: string;
  subtitleEn: string;
  deity?: Deity;
  /** The sankalp framing shown before enrolling. */
  introHi: string;
  introEn: string;
  cadence: SadhanaCadence;
  /**
   * Uniform programs (same unit every day, e.g. Hanuman Chalisa × 41) carry a
   * single `day`. Programs whose unit changes per day (Gita ch. 1…18) carry
   * `days` whose length is the total number of days. Exactly one is present.
   */
  day?: SadhanaDay;
  days?: SadhanaDay[];
};

/** How a program day was completed. Mirrors the routine's auto/manual split. */
export type DayCompletion = { at: string; via: 'read-to-end' | 'japam-target' | 'marked' };

/**
 * A user's enrolled sankalp. `completedDays` is keyed by 1-based dayIndex; keys
 * are always contiguous 1…N because a day is only committed once its predecessor
 * is done (see progress.resolveSadhanaToday). Grace-by-default: a day is "spent"
 * only when completed — a missed calendar day pauses the vow, it does not break
 * it, so `dayIndex` tracks completed days, not elapsed calendar days.
 */
export type SadhanaEnrollment = {
  programId: string;
  startedOn: string; // 'YYYY-MM-DD' (local)
  status: 'active' | 'completed' | 'abandoned';
  completedDays: Record<number, DayCompletion>;
  completedOn?: string; // set on पूर्णाहुति (the final day)
};
