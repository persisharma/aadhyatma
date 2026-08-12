/**
 * Persistence for the shared muhurat day store. The per-day panchang solve is
 * the expensive part of the Muhurat Finder (~90 days on the first occasion,
 * ~260 when the window comes up empty), and it is deterministic from
 * (date, location, calendar system) — so it is worth keeping across app
 * launches, not just across screens.
 *
 * Same split as `observanceStore` ⇄ `observanceCache`: the RN-free
 * `muhuratDayStore` owns the in-memory map (and is importable under
 * `tsx --test`), while this module is the only place that touches AsyncStorage.
 *
 * Shape of the data on disk: one key per (scope, civil day), so hydrating a
 * range is a single `multiGet` and a location change never has to rewrite
 * another city's days. Bounded by construction — the store holds at most
 * `MAX_CITIES` scopes (an eviction drops that scope's keys here too) and only
 * today-or-later days are ever written, with past days purged on hydrate.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  MUHURAT_DAY_CACHE_VERSION,
  reviveDayInputs,
  serializeDayInputs,
} from './muhuratDaySerde';
import {
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  subscribeMuhuratEviction,
  type ScanLocation,
} from './muhuratDayStore';
import type { CalendarSystem } from './types';

const KEY_ROOT = '@vedansh:muhurat-days:';
const KEY_PREFIX = `${KEY_ROOT}v${MUHURAT_DAY_CACHE_VERSION}:`;

/**
 * `<root>v<version>:<scope>:<YYYY-MM-DD>`. The scope itself contains a `:`
 * (locationKey + calendar system), which is fine: the date key is colon-free, so
 * the civil day is always the segment after the LAST colon, and a scope's keys
 * are still an exact prefix match.
 */
export function muhuratDayStorageKey(scope: string, dateKey: string): string {
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

const todayKey = (): string => dateKeyFor(new Date());

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

subscribeMuhuratEviction((scope) => {
  void dropScopeFromDisk(scope);
});

/**
 * Remove keys that can never serve a correct result again: days already in the
 * past, and anything written by an older cache version (the engine moved, so
 * those days would differ from a fresh solve — see MUHURAT_DAY_CACHE_VERSION).
 */
async function purgeUnusable(): Promise<void> {
  try {
    const today = todayKey();
    const doomed = (await AsyncStorage.getAllKeys()).filter((key) => {
      if (!key.startsWith(KEY_ROOT)) return false;
      if (!key.startsWith(KEY_PREFIX)) return true; // stale cache version
      return dateKeyOf(key) < today; // lexical compare is chronological for YYYY-MM-DD
    });
    if (doomed.length > 0) await AsyncStorage.multiRemove(doomed);
  } catch {
    // best-effort
  }
}

/**
 * Load persisted days for `dateKeys` into the in-memory store, so the scans that
 * follow find them already solved. Days already warm in memory are never read
 * from disk. Safe to call repeatedly; never throws.
 */
export async function hydrateMuhuratDays(
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

  await purgeUnusable();

  try {
    const pairs = await AsyncStorage.multiGet(wanted.map((k) => muhuratDayStorageKey(scope, k)));
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
}

/**
 * Flush this scope's not-yet-persisted days to disk. Past days are skipped (they
 * can never be a finder result again) and each day is written once per scope.
 * Fire-and-forget from the hooks: never throws, and the scan does not wait on it.
 */
export async function persistMuhuratDays(
  location: ScanLocation,
  calendarSystem: CalendarSystem
): Promise<void> {
  const scope = scopeKeyFor(location, calendarSystem);
  const map = dayStoreFor(scope);
  const known = persistedFor(scope);
  const today = todayKey();

  const pending: [string, string][] = [];
  for (const [dateKey, inputs] of map) {
    if (known.has(dateKey) || dateKey < today) continue;
    try {
      pending.push([muhuratDayStorageKey(scope, dateKey), serializeDayInputs(inputs)]);
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

/** Test helper: forget what this process believes is already on disk. */
export function __resetMuhuratDayCache(): void {
  persisted.clear();
}
