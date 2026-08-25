/**
 * Drop the app's COMPUTED-CALENDAR caches whenever the running build changes — a
 * store update or an OTA — so a bug that got baked into cached panchang/muhurat
 * output cannot outlive the release that fixes it.
 *
 * WHY. Two caches persist the output of on-device engines: the per-day panchang
 * solves (`panchangDayCache`) and the per-city observance year scans
 * (`observanceCache`). Both are versioned by hand (`PANCHANG_DAY_CACHE_VERSION`,
 * `CACHE_VERSION`) precisely because a device that already scanned keeps serving
 * the OLD engine's output forever — so a forgotten bump means the fix ships only
 * to fresh installs. Those bumps are still required (RULEBOOK §17.6); this is the
 * backstop for when one is missed, and for the class of bug a version number
 * cannot describe. Cost of being wrong in each direction is asymmetric: a
 * needless sweep costs a handful of re-solves on one launch, a stale cache costs
 * a user the fix entirely.
 *
 * SCOPE — engine-computed calendar output only. Everything listed below is
 * recomputable from the bundled content plus the engines. Nothing a user typed,
 * chose, counted, starred or was reminded of is touched, and neither is derived
 * state outside the calendar engines: see EXCLUDED below, which is the part of
 * this file worth reading twice.
 *
 * DEPENDENCIES. This module imports AsyncStorage and nothing else — deliberately.
 * The build identity comes from `expo-updates`/`expo-constants`, which are
 * untranspiled ESM that Jest cannot parse; importing them here would drag them
 * into the dependency graph of every panchang cache consumer (~90 suites) via
 * the gate below. `buildFingerprint.ts` owns that read and only `App.tsx` imports
 * it — the same isolation reason `panchangDayStore` stays RN-free.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * The derived caches, by key prefix. Add a prefix here when you add a cache of
 * COMPUTED data; never add one for anything the user authored.
 *
 * - `@vedansh:panchang-days:` — per-day panchang solves (`panchangDayCache`).
 *   Pure function of (civil date, location, calendar system).
 * - `@vedansh:muhurat-days:` — the pre-generalization root of the same cache.
 *   Already purged by that module's own sweep; listed so a device that somehow
 *   still carries one is covered by this path too.
 * - `@vedansh:observances:` — per-city observance year scans (`observanceCache`).
 *   Pure function of (year, calendar system, location) — Ujjain reads the
 *   bundled precomputed table instead and caches nothing. Same family as the day
 *   solves: it is where a wrong festival/vrat DATE would be cached, which is
 *   exactly the bug class `CACHE_VERSION` exists to invalidate.
 * - `@vedansh:pitru-solves:` — solved पितृ स्मरण occurrences and Pitru Paksha
 *   windows (`pitruSmaranSolves`). Pure function of (tithi rule, engine); keyed
 *   by TITHI ONLY, never by entry id, relation or name. Note the separator: this
 *   is a computed cache and belongs here, while the user-authored
 *   `@vedansh/pitru-smaran` below does NOT — they differ by one character.
 *
 * EXCLUDED, and why. This is a computed-days sweep, so the bar is narrow: a key
 * belongs above only if it holds engine-computed calendar output. Everything
 * below lives under the same `@vedansh` namespace and stays:
 * - `@vedansh/widget:last-plan-key-v1` — derived, but not a computed-days cache:
 *   it is the widget writer's write-dedupe key. It also needs no help, because
 *   `WidgetCoordinator` re-plans the payload from scratch on every pass and
 *   compares keys — so a fixed engine that changes the payload changes the key
 *   and rewrites anyway, and an unchanged payload had nothing to fix.
 * - `@vedansh:panchang-location`, `@vedansh:panchang-calendar-system` — the
 *   user's chosen city and purnimant/amanta setting. They look panchang-shaped
 *   and are the easiest mistake here: clearing them silently moves the user back
 *   to Ujjain (a `City.id` is a persisted key, not a display string).
 * - `@vedansh/notif-meta`, `notif-prefs`, `notif-permission-asked` — bookkeeping
 *   that MIRRORS what is actually scheduled with the OS. Dropping it desyncs the
 *   schedulers from reality, which duplicates or orphans real notifications.
 * - `@vedansh/reading-progress`, `bookmarks`, `japam-counter`, `japam-alarms`,
 *   `routines`, `routine-done`, `sadhana*`, `vidhi-checklist`, `user-activity`,
 *   `search-recent`, `new-content-state` — the user's own practice and history.
 * - `@vedansh/vrat-follows`, `muhurat-follows`, `pitru-smaran` — followed days and
 *   family remembrance entries. Private, on-device, and not recomputable at all.
 *   `pitru-smaran` is the entry ledger itself (relation, name, tithi) and must
 *   never be swept; only the derived `@vedansh:pitru-solves:` dates above are.
 * - `@vedansh:kundali-profiles:v1` (the birth-profile roster — every saved
 *   person plus which one is active), the pre-migration
 *   `@vedansh:kundali-birth-profile:v1`, `guna-milan-draft:v1`,
 *   `namkaran-session:v1`, `namkaran-shortlist:v1` — birth details and starred
 *   names, several of them privacy-sensitive by design.
 * - `@vedansh/language`, `regionalLanguage`, `font-scale`, `read-aloud` — display
 *   and reading preferences.
 * - `@vedansh/tour-completed-v`, `whats-new-seen-v`, `onboarding-setup-v`,
 *   `rating-prompt` — already version-suffixed where they should be; clearing
 *   them would replay the tour or the rating ask on every update.
 */
export const DERIVED_CACHE_KEY_PREFIXES = [
  '@vedansh:panchang-days:',
  '@vedansh:muhurat-days:',
  '@vedansh:observances:',
  '@vedansh:pitru-solves:',
] as const;

/**
 * Where the last-seen build fingerprint is stored. Deliberately outside every
 * prefix above — a sweep that erased its own marker would re-sweep every launch.
 */
export const BUILD_FINGERPRINT_KEY = '@vedansh/derived-cache-build';

/** The in-flight (or settled) reset for this process, if one was registered. */
let reset: Promise<void> | null = null;

/**
 * Remove every derived-cache key. Exported for the reset path and its tests;
 * callers outside this module should prefer `resetDerivedCachesIfBuildChanged`.
 *
 * LAUNCH-TIME ONLY. It clears disk, not the in-memory stores those caches
 * hydrate into — which is correct exactly once, before anything has hydrated.
 * Calling it mid-session would leave already-hydrated days in memory and their
 * "already persisted" bookkeeping pointing at keys that no longer exist.
 *
 * Returns the number of keys removed. Throws on storage failure, so the caller
 * can decline to record the fingerprint and retry on the next launch.
 */
export async function clearDerivedCaches(): Promise<number> {
  const keys = await AsyncStorage.getAllKeys();
  const doomed = keys.filter((key) =>
    DERIVED_CACHE_KEY_PREFIXES.some((prefix) => key.startsWith(prefix))
  );
  if (doomed.length > 0) await AsyncStorage.multiRemove(doomed);
  return doomed.length;
}

/**
 * Compare `fingerprint` against the one this device last ran and, if it moved,
 * clear the derived caches before anything reads them.
 *
 * MUST be called at module scope from `App.tsx`, not from an effect: the gate
 * below is what orders the sweep ahead of the caches, and it can only do that if
 * the reset is registered before React renders anything that hydrates. Idempotent
 * — later calls return the first promise rather than sweeping again.
 *
 * Never rejects. A storage failure leaves the fingerprint unwritten so the next
 * launch retries, rather than recording a sweep that did not happen.
 */
export function resetDerivedCachesIfBuildChanged(fingerprint: string): Promise<void> {
  if (!reset) reset = runReset(fingerprint);
  return reset;
}

async function runReset(fingerprint: string): Promise<void> {
  try {
    const stored = await AsyncStorage.getItem(BUILD_FINGERPRINT_KEY);
    if (stored === fingerprint) return;
    // A null `stored` covers two cases and both want the sweep: a fresh install
    // (where it finds nothing and costs one `getAllKeys`), and — the case that
    // matters — an install that predates this mechanism, whose caches were built
    // by exactly the release this one is meant to supersede.
    await clearDerivedCaches();
    // Only after a successful sweep: recording it first would make a failed
    // clear permanent.
    await AsyncStorage.setItem(BUILD_FINGERPRINT_KEY, fingerprint);
  } catch {
    // Best-effort. The caches stay as they are — the status quo before this
    // existed — and the next launch tries again.
  }
}

/**
 * What every derived cache awaits before touching storage, so a hydrate can
 * never read data the sweep is about to delete (nor a persist write data it will
 * wipe, leaving the session believing those days are safely on disk).
 *
 * Resolves immediately when no reset was registered — a headless entry point or
 * a test suite that never loads `App.tsx` has no build change to react to.
 */
export function awaitDerivedCacheReset(): Promise<void> {
  return reset ?? Promise.resolve();
}

/** Test helper: forget the reset registered by this process. */
export function __resetDerivedCacheResetForTests(): void {
  reset = null;
}
