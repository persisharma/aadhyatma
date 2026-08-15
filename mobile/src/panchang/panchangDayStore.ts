/**
 * Shared in-memory cache of per-day panchang inputs, keyed by ABSOLUTE date and
 * scoped to a (city, calendar system). RN-free (no react / react-native /
 * AsyncStorage) so the engine + scans stay importable under `tsx --test`, and so
 * this module and the AsyncStorage-backed `panchangDayCache` never form a cycle —
 * the same split as `observanceStore` ⇄ `observanceCache`.
 *
 * Because a day's panchang is deterministic from (date, location, system), keying
 * by absolute date means a day solved once is reused across occasions, across a
 * midnight rollover, and — once the persistence layer hydrates it — across app
 * launches. Only a location/system change (a different scope) needs fresh solves.
 *
 * Bounded to 5 cities (LRU): a 6th city evicts the least-recently-used one and
 * fires eviction listeners so the persistence layer can drop that city's disk
 * data too. Choosing a new city never evicts the others until the cap forces it.
 */
import { computePanchangForDate, locationKey } from './engine';
import { computeAstaFlags } from './eventMuhurat';
import type { CalendarSystem, GeoLocation } from './types';
import type { DayInputs } from './panchangDaySerde';

export type { DayInputs };
export type ScanLocation = GeoLocation & { cityId?: string };
export type ScanOptions = {
  calendarSystem: CalendarSystem;
  location: ScanLocation;
  /**
   * Deliberately un-representable. `PanchangComputationOptions` accepts a
   * `civilTimeZone` that re-anchors which civil day a solve describes, but the
   * scope key below models only (location, calendar system) — so a
   * civilTimeZone-bearing solve would ALIAS onto the device-local days and hand
   * the wrong day to one of the two readers. The widget writer
   * (`widgets/planPayload.ts`) solves with `civilTimeZone: WIDGET_TIME_ZONE` for
   * exactly this reason and must keep its own solves; `never` makes routing it
   * through here a compile error instead of a silent correctness bug.
   */
  civilTimeZone?: never;
};

/** Max cities (scopes) held in memory at once. A 6th evicts the LRU. */
export const MAX_CITIES = 5;

const store = new Map<string, Map<string, DayInputs>>();
const evictionListeners = new Set<(scope: string) => void>();

/** Notified with the scope key when a city is evicted, so its disk data is dropped too. */
export function subscribePanchangEviction(listener: (scope: string) => void): () => void {
  evictionListeners.add(listener);
  return () => {
    evictionListeners.delete(listener);
  };
}

/**
 * Scope key: one cache per LOCATION + calendar system. Uses the app's canonical
 * `locationKey` (cityId, else lat,lng@2dp) — the SAME key the observance cache and
 * the engine's Observer cache use — so a GPS location with no cityId can never
 * alias another location's days (a plain `cityId ?? 'default'` would collide them).
 */
export function scopeKeyFor(
  location: { cityId?: string; latitude: number; longitude: number },
  calendarSystem: string
): string {
  return `${locationKey(location)}:${calendarSystem}`;
}

/** Stable local-civil-date key (YYYY-MM-DD). */
export function dateKeyFor(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Civil-day arithmetic over the store's keying, shared by every consumer that
 * walks a range of days (the finder's sweeps, the abujh scan, the rolling warm).
 * They live here rather than in `muhuratFinderScan` — where they started — so a
 * module that only needs "which days" doesn't have to pull the festival engine
 * in behind it. `muhuratFinderScan` re-exports them, so its importers are
 * unaffected.
 */
export const startOfToday = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/** The civil day `i` days after `start` (month/year rollover handled by Date). */
export const dayAt = (start: Date, i: number): Date =>
  new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);

/**
 * The civil-date keys a walk of `count` days from `start` will touch — what
 * callers hand to `hydratePanchangDays` so the persisted solves are in memory
 * before they begin.
 */
export const dayKeysFrom = (start: Date, count: number): string[] =>
  Array.from({ length: count }, (_, i) => dateKeyFor(dayAt(start, i)));

/**
 * The three civil days a TODAY surface's muhurat windows need: yesterday (the
 * pre-dawn correction reads its night choghadiya), today, and tomorrow (today's
 * `nextSunrise` closes the night window).
 *
 * Lives here so `useMuhurat` and the launch prefetch cannot drift apart: a
 * prefetch that warms a different three days is a prefetch that does nothing,
 * and the symptom — a cold-looking card on a warm cache — is exactly the one
 * that took three attempts to kill.
 */
export const todayMuhuratDayKeys = (now: Date): string[] => {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return [dayAt(start, -1), start, dayAt(start, 1)].map(dateKeyFor);
};

/** Cede the JS thread for one tick, so a long walk of solves can't block the UI. */
export const yieldToUi = (): Promise<void> => new Promise<void>((r) => setTimeout(r, 0));

/**
 * The day-map for a scope, marking it most-recently-used. Creating a new scope
 * past `MAX_CITIES` evicts the least-recently-used one (oldest Map key) and fires
 * eviction listeners with its scope key.
 */
export function dayStoreFor(scope: string): Map<string, DayInputs> {
  const existing = store.get(scope);
  if (existing) {
    // Re-insert to move to the MRU end of the Map's insertion order.
    store.delete(scope);
    store.set(scope, existing);
    return existing;
  }
  if (store.size >= MAX_CITIES) {
    const lru = store.keys().next().value; // oldest key = least recently used
    if (lru !== undefined) {
      store.delete(lru);
      evictionListeners.forEach((fn) => fn(lru));
    }
  }
  const created = new Map<string, DayInputs>();
  store.set(scope, created);
  return created;
}

export function computeDayInputs(date: Date, opts: ScanOptions): DayInputs {
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  return { p: computePanchangForDate(date, opts), asta: computeAstaFlags(noon) };
}

/** Read a scope's day-map by absolute date; compute + store on a miss. */
export function cachedDayInputs(
  map: Map<string, DayInputs>,
  date: Date,
  opts: ScanOptions
): { inputs: DayInputs; miss: boolean } {
  const key = dateKeyFor(date);
  const hit = map.get(key);
  if (hit) return { inputs: hit, miss: false };
  const inputs = computeDayInputs(date, opts);
  map.set(key, inputs);
  return { inputs, miss: true };
}

/** Inspection + test helpers. */
export function panchangStoreScopes(): string[] {
  return [...store.keys()];
}
export function __resetPanchangDayStore(): void {
  store.clear();
}
