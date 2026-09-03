/**
 * Persistence for the shared panchang day store. The per-day panchang solve is
 * the expensive unit of work behind EVERY panchang surface — the Muhurat Finder's
 * ~90–260 day sweep, the Panchang tab's selected day, Home's Today strip, the
 * daily Muhurat card — and it is deterministic from (date, location, calendar
 * system), so it is worth keeping across app launches, not just across screens.
 *
 * Same split as `observanceStore` ⇄ `observanceCache`: the RN-free
 * `panchangDayStore` owns the in-memory map (and is importable under
 * `tsx --test`), while this module is the only place that touches AsyncStorage.
 *
 * Shape of the data on disk: one key per (scope, civil day), so hydrating a
 * range is a single `multiGet` and a location change never has to rewrite
 * another city's days. Bounded by construction — the store holds at most
 * `MAX_CITIES` scopes (an eviction drops that scope's keys here too) and only
 * days from yesterday onward are ever written, with older ones purged on hydrate.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { awaitDerivedCacheReset } from '@/utils/derivedCacheReset';
import {
  PANCHANG_DAY_CACHE_VERSION,
  reviveDayInputs,
  serializeDayInputs,
} from './panchangDaySerde';
import {
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  subscribePanchangEviction,
  type ScanLocation,
} from './panchangDayStore';
import type { CalendarSystem } from './types';

const KEY_ROOT = '@vedansh:panchang-days:';
const KEY_PREFIX = `${KEY_ROOT}v${PANCHANG_DAY_CACHE_VERSION}:`;
/**
 * The pre-generalization root, from when this cache served only the Muhurat
 * Finder. Purged alongside stale versions so an internal build's keys don't sit
 * on disk forever — no store build ever shipped it, but a dev/TestFlight one may.
 */
const LEGACY_KEY_ROOTS = ['@vedansh:muhurat-days:'];

/**
 * `<root>v<version>:<scope>:<YYYY-MM-DD>`. The scope itself contains a `:`
 * (locationKey + calendar system), which is fine: the date key is colon-free, so
 * the civil day is always the segment after the LAST colon, and a scope's keys
 * are still an exact prefix match.
 */
export function panchangDayStorageKey(scope: string, dateKey: string): string {
  return `${KEY_PREFIX}${scope}:${dateKey}`;
}

const scopePrefix = (scope: string): string => `${KEY_PREFIX}${scope}:`;
const dateKeyOf = (storageKey: string): string => storageKey.slice(storageKey.lastIndexOf(':') + 1);

/**
 * Per-scope record of what is already on disk, so a re-scan of an unchanged
 * range does not rewrite hundreds of identical keys on every screen entry.
 * Cleared for a scope when that scope is evicted (its disk keys go with it).
 */
const persisted = new Map<string, Set<string>>();

const persistedFor = (scope: string): Set<string> => {
  let set = persisted.get(scope);
  if (!set) {
    set = new Set<string>();
    persisted.set(scope, set);
  }
  return set;
};

/**
 * How far into the past a persisted day stays useful.
 *
 * One day back is the hard requirement: `useMuhurat`'s pre-dawn correction reads
 * YESTERDAY's night choghadiya (before today's sunrise the active window belongs
 * to yesterday), so a today-onward cutoff left Home solving one day on every cold
 * start. The second day is margin — the Panchang tab's date picker can step back
 * a couple of days, and a future reader that needs one more day of history then
 * degrades to a cache miss rather than silently re-solving every launch.
 *
 * Cheap at this size: two extra keys against a ~262-day scan horizon (~0.7% more
 * storage). Anything older is dead weight and is purged on hydrate.
 */
const RETAINED_PAST_DAYS = 2;

/** The oldest civil day still worth keeping — the cutoff for BOTH persist and purge. */
function oldestUsefulDateKey(): string {
  const n = new Date();
  return dateKeyFor(new Date(n.getFullYear(), n.getMonth(), n.getDate() - RETAINED_PAST_DAYS));
}

/**
 * Drop every persisted day for a scope. Wired to the store's eviction listener:
 * when a 6th city pushes the LRU one out of memory, its disk data goes too —
 * otherwise storage would grow without bound as the user tours cities.
 */
async function dropScopeFromDisk(scope: string): Promise<void> {
  persisted.delete(scope);
  try {
    const prefix = scopePrefix(scope);
    const mine = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(prefix));
    if (mine.length > 0) await AsyncStorage.multiRemove(mine);
  } catch {
    // best-effort — a leftover key is purged by the next hydrate's date/version sweep
  }
}

subscribePanchangEviction((scope) => {
  void dropScopeFromDisk(scope);
});

/**
 * Whether this process has already swept. The sweep below reads the ENTIRE
 * AsyncStorage keyspace, and what it collects can only appear between launches
 * (keys from an older cache version) or at midnight (days that fell out of the
 * retention window) — so re-running it per cold range just put a whole-keyspace
 * scan in front of the first hydrate of every calendar day. Once per session is
 * enough: a session that crosses midnight leaves a day or two of stale keys
 * behind, which are dead weight rather than wrong, and the next launch takes them.
 */
let swept = false;
/** The in-flight (or settled) sweep, so tests can await housekeeping. */
let sweep: Promise<void> | null = null;

/**
 * Remove keys that can never serve a correct result again: days already in the
 * past, and anything written by an older cache version (the engine moved, so
 * those days would differ from a fresh solve — see PANCHANG_DAY_CACHE_VERSION).
 *
 * NEVER awaited by a read. `getAllKeys` + `multiRemove` over the whole keyspace
 * used to run BEFORE the `multiGet` that serves the caller, so the first cold
 * surface of every launch waited on a sweep to learn nothing it needed — Home's
 * `आज का पंचांग` sat on its `—` headline for the duration. Nothing about a read
 * depends on it: a stale-version key lives under a different `KEY_PREFIX` and can
 * never be returned by a current-prefix `multiGet`, and a still-readable day
 * older than the retention window is a *correct* solve for that day (the version
 * prefix is what guards correctness, not the date). So it is pure housekeeping,
 * and it runs after the days are in memory.
 */
function purgeUnusable(): Promise<void> {
  if (swept) return sweep ?? Promise.resolve();
  // Set before the await, not after: a failed sweep must not retry on every
  // hydrate for the rest of the session (the keys survive to the next launch).
  swept = true;
  sweep = (async () => {
    try {
      const oldest = oldestUsefulDateKey();
      const doomed = (await AsyncStorage.getAllKeys()).filter((key) => {
        if (LEGACY_KEY_ROOTS.some((root) => key.startsWith(root))) return true;
        if (!key.startsWith(KEY_ROOT)) return false;
        if (!key.startsWith(KEY_PREFIX)) return true; // stale cache version
        return dateKeyOf(key) < oldest; // lexical compare is chronological for YYYY-MM-DD
      });
      if (doomed.length > 0) await AsyncStorage.multiRemove(doomed);
    } catch {
      // best-effort
    }
  })();
  return sweep;
}

/**
 * Resolve once this session's housekeeping sweep has finished (immediately when
 * none is in flight). Only the cache's own tests need this — production code
 * must never wait on the sweep, which is the entire point of detaching it.
 */
export function panchangDayCacheSwept(): Promise<void> {
  return sweep ?? Promise.resolve();
}

/**
 * Load persisted days for `dateKeys` into the in-memory store, so the scans that
 * follow find them already solved. Days already warm in memory are never read
 * from disk. Safe to call repeatedly; never throws.
 */
export async function hydratePanchangDays(
  location: ScanLocation,
  calendarSystem: CalendarSystem,
  dateKeys: string[]
): Promise<void> {
  const scope = scopeKeyFor(location, calendarSystem);
  const map = dayStoreFor(scope);
  const wanted = dateKeys.filter((k) => !map.has(k));
  // Already fully warm — touch storage at all and a re-entry would wait on a
  // disk round-trip it cannot learn anything from. The purge below can wait for
  // the next cold range.
  if (wanted.length === 0) return;

  // A build change (store update or OTA) drops these days wholesale; hydrating
  // first would pull the very data that sweep is about to delete back into
  // memory, where it would serve this whole session. This one IS a correctness
  // gate, unlike the housekeeping purge below, so it stays ahead of the read.
  await awaitDerivedCacheReset();

  try {
    const pairs = await AsyncStorage.multiGet(wanted.map((k) => panchangDayStorageKey(scope, k)));
    const known = persistedFor(scope);
    pairs.forEach(([key, raw]) => {
      if (!raw) return;
      const dateKey = dateKeyOf(key);
      const revived = reviveDayInputs(raw);
      if (!revived) return;
      // A hydrated day is already on disk — persist must not write it back.
      known.add(dateKey);
      if (!map.has(dateKey)) map.set(dateKey, revived);
    });
  } catch {
    // hydration is best-effort — a miss just means the scan solves that day
  }

  // Housekeeping, deliberately last and deliberately unawaited: the caller now
  // has its days and can paint. See `purgeUnusable`.
  void purgeUnusable();
}

/**
 * Flush this scope's not-yet-persisted days to disk. Days older than
 * `RETAINED_PAST_DAYS` are skipped (nothing reads them again) and each day is
 * written once per scope.
 * Fire-and-forget from the hooks: never throws, and the scan does not wait on it.
 */
export async function persistPanchangDays(
  location: ScanLocation,
  calendarSystem: CalendarSystem
): Promise<void> {
  // Same gate as hydrate, for the opposite hazard: writing ahead of the sweep
  // would leave `known` claiming days are on disk that the sweep then removed,
  // so nothing would rewrite them and every later launch would re-solve.
  await awaitDerivedCacheReset();
  const scope = scopeKeyFor(location, calendarSystem);
  const map = dayStoreFor(scope);
  const known = persistedFor(scope);
  const oldest = oldestUsefulDateKey();

  const pending: [string, string][] = [];
  for (const [dateKey, inputs] of map) {
    if (known.has(dateKey) || dateKey < oldest) continue;
    try {
      pending.push([panchangDayStorageKey(scope, dateKey), serializeDayInputs(inputs)]);
    } catch {
      // a day that cannot be serialized is simply not persisted
    }
  }
  if (pending.length === 0) return;

  try {
    await AsyncStorage.multiSet(pending);
    pending.forEach(([key]) => known.add(dateKeyOf(key)));
  } catch {
    // persistence is best-effort — the in-memory store still serves this session
  }
}

/** Test helper: forget what this process believes is already on disk (and swept). */
export function __resetPanchangDayCache(): void {
  persisted.clear();
  swept = false;
  sweep = null;
}
