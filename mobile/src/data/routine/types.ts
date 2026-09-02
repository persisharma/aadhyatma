/**
 * Daily Routine (नित्य साधना) — data shapes. See docs/roadmap/prds/07-daily-routine-sadhana.md.
 *
 * A user has many named Routines. Each Routine is either `daily` (every item
 * shows every day) or `weekday` (each item is tagged with the weekdays it runs,
 * with a deity-of-the-day suggestion — see vaar.ts).
 *
 * Granularity: an item is a complete reciting unit — a whole section, a single
 * chapter/stotra of a chaptered source, or a japam mantra with a round target.
 * Never an individual stotram verse (that is what Daily Bhakti is for).
 */

export type RoutineScheduleMode = 'daily' | 'weekday';

/**
 * - `section` : a whole library entry (e.g. Hanuman Chalisa, a whole granth).
 * - `chapter` : one chapter/sarga/stotra of a chaptered source (covers both a
 *               granth chapter and a single stotra of a multi-stotra stotram).
 * - `japam`   : a mantra with a round target.
 * - `vidhi`   : a guided puja procedure (PRD-19 Phase 2B) — e.g. the monthly
 *               Satyanarayan puja. Completion is manual-only: conduct progress
 *               lives in AsyncStorage outside the reading-progress contexts.
 */
export type RoutineItemKind = 'section' | 'chapter' | 'japam' | 'vidhi';

export type RoutineItem = {
  id: string;
  kind: RoutineItemKind;
  /** Library entry id, japam mantra id for `japam`, or vidhi id for `vidhi`. */
  sourceId: string;
  /** Present for `chapter`. */
  chapter?: number;
  /** Present for `japam`; defaults to 1 (= one mala / JAPAM_BEADS_PER_ROUND). */
  targetRounds?: number;
  /** Weekdays (0=Sun … 6=Sat) this item runs. Only meaningful in `weekday` mode. */
  weekdays?: number[];
};

/** Per-routine reminder time (24h local). PRD-07 Phase 3. */
export type RoutineReminder = { hour: number; minute: number };

export type Routine = {
  id: string;
  nameHi: string;
  nameEn: string;
  mode: RoutineScheduleMode;
  items: RoutineItem[];
  createdAt: number;
  /**
   * Per-routine reminder time. Absent/undefined = reminders off (the default).
   * Presence IS the switch — no parallel enabled boolean to drift out of sync.
   * Additive and optional, so legacy records need no migration.
   */
  reminder?: RoutineReminder;
};

/** Stable key for a routine item across a routine, used for completion tracking. */
export function routineItemKey(routineId: string, itemId: string): string {
  return `${routineId}:${itemId}`;
}

/** Whether an item runs on the given weekday for its parent routine. */
export function itemRunsOn(routine: Routine, item: RoutineItem, weekday: number): boolean {
  if (routine.mode === 'daily') return true;
  return (item.weekdays ?? []).includes(weekday);
}
