/**
 * Warm today's panchang from disk at PROCESS START, not after Home mounts.
 *
 * The day solves have been persisted and correctly scoped since #265/#268; what
 * remained was *when* the read was allowed to begin. `hydratePanchangDays` needs
 * a scope key, the scope key needs both preferences, and the calendar-system
 * preference was read lazily by the first subscriber — Home's Today strip, which
 * only mounts once `AppReadyGate` has opened the splash on its own reads. So the
 * one `multiGet` that answers "what is today's panchang" was the third serial
 * round trip of the launch, behind a screen that had already painted everything
 * else from bundled JS. Warm cache, cold-looking card.
 *
 * This module is the whole fix: `App.tsx` calls it at module scope, so the
 * preference read and the day read run CONCURRENTLY with the splash gate instead
 * of after it. By the time `TodayStrip` renders, the three civil days it needs are
 * usually already in `panchangDayStore`, `useMuhurat`'s cache-only `useState`
 * initializer composes them on the first render, and the headline arrives with
 * the rest of Home rather than two round trips later.
 *
 * It only ever moves work EARLIER. Nothing waits on it, it never throws, and if
 * it loses the race the hooks take exactly the path they take today.
 */
import { hydratePanchangDays } from './panchangDayCache';
import { todayMuhuratDayKeys } from './panchangDayStore';
import { loadPanchangPrefsOnce } from './panchangPrefs';

/** The in-flight (or settled) prefetch for this process. */
let prefetch: Promise<void> | null = null;

/**
 * Read the panchang preferences and pull the three civil days a today surface
 * renders into the shared in-memory store. Memoized and fire-and-forget.
 *
 * Deliberately hydrate-only: it never SOLVES. A day disk does not have still
 * belongs on `useMuhurat`'s deferred path behind `InteractionManager`, because
 * astronomy is CPU that would compete with the launch — the entire point of the
 * split this restores. Disk I/O is not, which is why it may run here.
 */
export function prefetchTodayPanchang(): Promise<void> {
  if (!prefetch) prefetch = run();
  return prefetch;
}

async function run(): Promise<void> {
  try {
    const { location, calendarSystem } = await loadPanchangPrefsOnce();
    // `hydratePanchangDays` awaits the derived-cache reset itself, so a build
    // change still sweeps before this reads — the gate is inside the cache, and
    // starting earlier does not step around it.
    await hydratePanchangDays(location, calendarSystem, todayMuhuratDayKeys(new Date()));
  } catch {
    // Best-effort by construction: a miss just means the hook hydrates as before.
  }
}

/** Test-only: forget this process's prefetch. */
export function __resetPanchangLaunchPrefetch(): void {
  prefetch = null;
}
