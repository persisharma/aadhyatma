/**
 * Rolling look-ahead warm for the shared panchang day store.
 *
 * WHY THIS EXISTS. Home's Today strip needs THREE civil days: yesterday (the
 * pre-dawn choghadiya belongs to last night's window), today, and tomorrow (for
 * today's night window). `useMuhurat` solved and persisted exactly those three —
 * so the persisted window always ENDED at tomorrow, and the first launch after
 * every midnight found its own "tomorrow" missing. One cold day is enough to
 * fail `composeSolved`, which returns null on ANY miss, so the strip fell back
 * to its `—` headline and waited on the deferred path: a whole-keyspace purge
 * sweep, a `multiGet`, then a fresh `computePanchangForDate` + asta solve. Every
 * calendar day, forever — the "today's panchang is computed every day and takes
 * time" report. The persistence layer was working; its window was just one day
 * too short to survive a rollover.
 *
 * THE FIX. Keep the persisted window a few days AHEAD of anything a surface
 * renders, so a midnight rollover — or a return after a couple of quiet days —
 * finds all three days already on disk and paints from the store synchronously,
 * with zero engine calls. The warm runs strictly AFTER the day's own solve has
 * landed, deferred off the render path, chunked so a cold window can't block the
 * UI, cancelled on unmount, and guarded against overlapping runs. It never
 * feeds React state: nothing re-renders because of it.
 *
 * RN-free on purpose (like `panchangDayStore` / `muhuratFinderScan`) — the
 * `InteractionManager` boundary belongs to the calling hook, and keeping this
 * module framework-free is what lets the engine suite import it.
 */
import {
  cachedDayInputs,
  dayAt,
  dayKeysFrom,
  dayStoreFor,
  scopeKeyFor,
  startOfToday,
  yieldToUi,
  type ScanLocation,
  type ScanOptions,
} from './panchangDayStore';
import { hydratePanchangDays, persistPanchangDays } from './panchangDayCache';
import type { CalendarSystem } from './types';

/**
 * How many days past today the warm keeps solved and persisted.
 *
 * Two would already cover a single midnight rollover (tomorrow's "tomorrow"),
 * but seven costs six extra keys and buys the whole week: a user who opens the
 * app on any of the next seven days still pays nothing. It also matches
 * `FOLLOW_CHIP_HORIZON_DAYS` (7) — the reach of the Today strip's followed-
 * muhurat chip (`useNextFollowedMuhurat`), whose per-day verdicts read this same
 * store — so that lookup lands warm too. Not imported from `useMuhuratFinder`
 * because that module is RN-bound and this one must stay framework-free.
 */
export const PREWARM_DAYS = 7;

/**
 * Cede the thread after this many days that actually needed solving. Cache hits
 * are free, so a warm window walks in a single tick; only real astronomy pays.
 */
const YIELD_AFTER_SOLVES = 2;

/**
 * Scopes with a warm in flight. Two "today" surfaces can be mounted at once
 * (the Today strip and the daily Muhurat card), and both call this on mount —
 * without the guard they would race through the same cold days, each solving
 * what the other was about to.
 */
const inFlight = new Set<string>();

export type PrewarmOptions = {
  /** First day of the window. Defaults to today (device-local). */
  start?: Date;
  /** Days past `start` to warm. Defaults to `PREWARM_DAYS`. */
  days?: number;
  /** Checked before every solve so an unmount stops the walk mid-window. */
  isCancelled?: () => boolean;
};

/**
 * Warm `start … start + days` (inclusive) for one (location, calendar system),
 * then flush the scope to disk. Resolves when the window is warm, the caller
 * cancelled, or another run already owns this scope. Never throws — a day that
 * cannot be solved is skipped, exactly as the scans do.
 *
 * Cheap when there is nothing to do: `hydratePanchangDays` touches storage not
 * at all if the range is already in memory, every `cachedDayInputs` is then a
 * hit, and `persistPanchangDays` returns without a write when no day is new. So
 * re-mounting a today surface repeatedly (tab switches) costs a loop over a Map.
 */
export async function prewarmPanchangDays(
  location: ScanLocation,
  calendarSystem: CalendarSystem,
  options: PrewarmOptions = {}
): Promise<void> {
  const { start = startOfToday(), days = PREWARM_DAYS, isCancelled = () => false } = options;
  const scope = scopeKeyFor(location, calendarSystem);
  if (inFlight.has(scope)) return;
  inFlight.add(scope);
  try {
    const opts: ScanOptions = { calendarSystem, location };
    // Disk → memory for the whole window first, so days an earlier session (or
    // the finder's sweep) already solved are never solved again.
    await hydratePanchangDays(location, calendarSystem, dayKeysFrom(start, days + 1));
    if (isCancelled()) return;

    const map = dayStoreFor(scope);
    let sinceYield = 0;
    for (let i = 0; i <= days; i += 1) {
      if (isCancelled()) return;
      try {
        // Cache hits cost nothing and never trigger a yield.
        if (!cachedDayInputs(map, dayAt(start, i), opts).miss) continue;
      } catch {
        continue; // an unsolvable day simply stays out of the window
      }
      sinceYield += 1;
      if (sinceYield >= YIELD_AFTER_SOLVES) {
        sinceYield = 0;
        await yieldToUi();
      }
    }
    if (isCancelled()) return;
    // Unconditional: also flushes days the synchronous Panchang hooks solved on
    // the render path. A no-op write-wise when every day is already on disk.
    await persistPanchangDays(location, calendarSystem);
  } finally {
    inFlight.delete(scope);
  }
}

/** Test helper: forget which scopes have a warm in flight. */
export function __resetPanchangDayPrewarm(): void {
  inFlight.clear();
}
