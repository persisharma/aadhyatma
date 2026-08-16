/**
 * The two AsyncStorage-backed panchang preferences — the chosen city and the
 * purnimant/amanta calendar system — behind ONE read, issued once per process.
 *
 * WHY THIS EXISTS. Together these two values are the *scope key* every panchang
 * cache is keyed by, so nothing panchang-shaped can be read from disk until both
 * have landed. They used to be read separately and, worse, at different moments:
 * the city from `PanchangLocationProvider`'s effect, and the calendar system
 * lazily from whichever component first subscribed — which is Home's Today strip,
 * mounted only AFTER `AppReadyGate` opens the splash on the font-scale/language
 * reads. So a cold start spent three SERIAL AsyncStorage round trips before the
 * day cache could even be asked for today's solve:
 *
 *     [font scale + language]  →  [calendar system]  →  [panchang days]
 *      (splash gate)               (first subscriber,     (the read that
 *                                   after Home mounts)     paints the card)
 *
 * Every other thing on Home renders from bundled JS on the first frame, so the
 * `आज का पंचांग` card was structurally last — it could not paint until two round
 * trips after the screen it sits on, however warm the cache was. That is the
 * "today's panchang loads slower than the homepage" report (Aug 2026), and it is
 * the third and last shape of it: #265 fixed the persisted window ending too
 * early, #268 got the housekeeping out from in front of the read, and this one
 * gets the read itself off the back of the launch queue.
 *
 * WHAT CHANGES. Both preferences come from one `multiGet` that is kicked off at
 * module scope from `App.tsx` (see `panchangLaunchPrefetch`), concurrently with
 * the splash gate rather than behind it. Both stores are seeded SYNCHRONOUSLY the
 * moment it resolves, so by the time Home mounts, `usePanchangLocation` reports
 * the real city and `usePanchangCalendarHydrated` is already true — `useMuhurat`
 * composes from the in-memory store on its FIRST render and the headline paints
 * with the rest of Home instead of two round trips later.
 *
 * DEPENDENCIES. AsyncStorage, `locations.ts`, and `pincodes.ts` for its `isPincodeCityId`
 * regex ONLY — that module's 566 KB table sits behind a lazy require and must never be
 * touched from here, which is why a stored pincode is validated structurally rather than
 * looked up. It must stay importable by both `PanchangLocationContext` (which pulls in
 * `expo-location`) and the launch prefetch (which must not), so it can never import
 * either — same isolation rule that keeps `panchangDayStore` RN-free and `expo-updates`
 * out of the cache graph.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_LOCATION, getCityById, toPanchangLocation } from './locations';
import { isPincodeCityId } from './pincodes';
import type { CalendarSystem, PanchangLocation } from './types';

export const LOCATION_STORAGE_KEY = '@vedansh:panchang-location';
export const CALENDAR_SYSTEM_STORAGE_KEY = '@vedansh:panchang-calendar-system';

/** India bounding box — the same gate `scripts/build-pincodes.mjs` applies when generating. */
const INDIA_BOUNDS = { latMin: 6.5, latMax: 37.6, lngMin: 68.0, lngMax: 97.5 };

function isFiniteInRange(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max;
}

/**
 * Rebuild a stored PINCODE location from the record itself rather than from a lookup table.
 *
 * A city location is rebuilt from the bundled list so it always matches the running build.
 * A pincode cannot be: the table is 566 KB and lives behind a lazy require in `pincodes.ts`
 * precisely so it never lands on the launch path, and this function IS the launch path. So a
 * `pin-` record is self-describing on disk and validated structurally here — every field is
 * range-checked, and anything malformed falls back to `DEFAULT_LOCATION` like any other
 * corrupt record. Safe because the table is generated, immutable data: a stored record can
 * only drift from the bundle if the dataset is regenerated, and its coordinates were correct
 * when written.
 */
function parseStoredPincodeLocation(parsed: {
  cityId: string;
  labelHi?: unknown;
  labelEn?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  elevation?: unknown;
  source?: unknown;
}): PanchangLocation | null {
  const { labelHi, labelEn, latitude, longitude, elevation } = parsed;
  if (typeof labelHi !== 'string' || labelHi.length === 0) return null;
  if (typeof labelEn !== 'string' || labelEn.length === 0) return null;
  if (!isFiniteInRange(latitude, INDIA_BOUNDS.latMin, INDIA_BOUNDS.latMax)) return null;
  if (!isFiniteInRange(longitude, INDIA_BOUNDS.lngMin, INDIA_BOUNDS.lngMax)) return null;
  if (!isFiniteInRange(elevation, -500, 9000)) return null;
  return {
    cityId: parsed.cityId,
    labelHi,
    labelEn,
    latitude,
    longitude,
    elevation,
    // A pincode reached by GPS keeps 'gps' so the picker can still show "using your location".
    source: parsed.source === 'gps' ? 'gps' : 'pincode',
  };
}

/**
 * Rebuild the stored city from the BUNDLED city list, so coordinates and labels
 * always match the running app version rather than whatever an older one wrote.
 * Returns null for absent/corrupt data and for a `cityId` this build no longer
 * ships — the caller falls back to `DEFAULT_LOCATION`.
 */
export function parseStoredLocation(raw: string | null): PanchangLocation | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.cityId !== 'string') return null;
    if (isPincodeCityId(parsed.cityId)) return parseStoredPincodeLocation(parsed);
    const city = getCityById(parsed.cityId);
    if (!city) return null;
    const source = parsed.source === 'gps' || parsed.source === 'city' ? parsed.source : 'default';
    return toPanchangLocation(city, source);
  } catch {
    return null;
  }
}

export function parseCalendarSystem(raw: string | null): CalendarSystem {
  return raw === 'amanta' ? 'amanta' : 'purnimant';
}

// ── The calendar-system store ───────────────────────────────────────────────
// A small module-level store rather than per-instance state: it is read by hooks
// on several always-mounted surfaces at once (the Panchang tab AND Home's Today
// strip), so a change made on one must reach every mounted instance immediately —
// per-instance `useState` hydrated once from AsyncStorage left the Home strip on a
// stale system for the whole session. Consumed via `useSyncExternalStore`, which
// is tearing-safe by construction.

let calendarSystemValue: CalendarSystem = 'purnimant';
/** True once the user has explicitly chosen a system this session — a late read
 * must never clobber an explicit in-session choice. */
let calendarSystemDirty = false;
let calendarSystemHydrated = false;
const calendarSystemListeners = new Set<() => void>();

function notifyCalendarSystemListeners(): void {
  calendarSystemListeners.forEach((listener) => listener());
}

export function subscribeCalendarSystem(onStoreChange: () => void): () => void {
  calendarSystemListeners.add(onStoreChange);
  // Still self-starting: a headless entry point or a test that never loads
  // `App.tsx` has no launch prefetch, and must not be left on the default
  // forever. Memoized, so when the prefetch DID run this is already settled and
  // costs nothing.
  void loadPanchangPrefsOnce();
  return () => {
    calendarSystemListeners.delete(onStoreChange);
  };
}

export function getCalendarSystemSnapshot(): CalendarSystem {
  return calendarSystemValue;
}

export function getCalendarSystemHydrated(): boolean {
  return calendarSystemHydrated;
}

export function setCalendarSystemGlobal(next: CalendarSystem): void {
  // Mark dirty and persist even for an equal-value "confirmation" tap, so an
  // in-flight read of a stale stored value can never override the choice.
  calendarSystemDirty = true;
  AsyncStorage.setItem(CALENDAR_SYSTEM_STORAGE_KEY, next).catch(() => undefined);
  if (next === calendarSystemValue) return;
  calendarSystemValue = next;
  notifyCalendarSystemListeners();
}

// ── The one launch read ─────────────────────────────────────────────────────

export type PanchangPrefs = {
  location: PanchangLocation;
  calendarSystem: CalendarSystem;
};

/** The settled result, readable synchronously; null until the read lands. */
let snapshot: PanchangPrefs | null = null;
/** The in-flight (or settled) read for this process. */
let load: Promise<PanchangPrefs> | null = null;

/**
 * The preferences, synchronously, IF the launch read has already landed —
 * otherwise null. `PanchangLocationProvider` uses this as its lazy `useState`
 * initializer so a launch that resolved before React rendered starts on the
 * user's real city with `isLoading` already false, rather than spending a render
 * (and a whole cold panchang chain) on the Ujjain placeholder.
 */
export function peekPanchangPrefs(): PanchangPrefs | null {
  return snapshot;
}

/**
 * Read both preferences in ONE `multiGet` and seed both stores. Memoized: every
 * caller after the first gets the same promise, so the provider, the
 * calendar-system subscribers and the launch prefetch share a single round trip
 * instead of issuing one each. Never rejects — a storage failure yields the
 * defaults, which is exactly the pre-read state.
 *
 * SUCCESS is what gets memoized. A transient storage failure clears the memo so
 * the next caller retries, rather than pinning the whole session to Ujjain +
 * purnimant with no way back — the same guarantee the calendar-system read made
 * before it moved here, and easy to lose when consolidating two reads into one.
 */
export function loadPanchangPrefsOnce(): Promise<PanchangPrefs> {
  if (!load) load = runLoad();
  return load;
}

async function runLoad(): Promise<PanchangPrefs> {
  let storedLocation: string | null = null;
  let storedSystem: string | null = null;
  let failed = false;
  try {
    const pairs = await AsyncStorage.multiGet([
      LOCATION_STORAGE_KEY,
      CALENDAR_SYSTEM_STORAGE_KEY,
    ]);
    pairs.forEach(([key, value]) => {
      if (key === LOCATION_STORAGE_KEY) storedLocation = value;
      if (key === CALENDAR_SYSTEM_STORAGE_KEY) storedSystem = value;
    });
  } catch {
    // Best-effort: fall through to the defaults, the status quo before the read,
    // but let the next caller try again (see above). The `await` above means
    // `load` is already assigned by the time we get here, so clearing it here is
    // never racing its own assignment.
    failed = true;
    load = null;
  }

  const result: PanchangPrefs = {
    location: parseStoredLocation(storedLocation) ?? DEFAULT_LOCATION,
    calendarSystem: parseCalendarSystem(storedSystem),
  };
  // Seed synchronously, before anyone can await this promise, so a consumer that
  // peeks in the same tick sees the settled values. A FAILED read seeds nothing:
  // `peekPanchangPrefs()` must keep reporting "not known yet" so the provider
  // still mounts in its loading state rather than presenting the fallback city as
  // a settled answer.
  if (!failed) snapshot = result;
  if (!calendarSystemDirty && result.calendarSystem !== calendarSystemValue) {
    calendarSystemValue = result.calendarSystem;
  }
  // True even on failure, exactly as the old `.finally()` set it: the gate means
  // "this read is no longer pending", and leaving it false would strand
  // `useMuhurat` on a scope it never considers settled — no panchang at all.
  calendarSystemHydrated = true;
  notifyCalendarSystemListeners();
  return result;
}

/** Test-only: forget this process's read and reset the calendar-system store. */
export function __resetPanchangPrefsForTests(value: CalendarSystem = 'purnimant'): void {
  calendarSystemValue = value;
  calendarSystemDirty = false;
  calendarSystemHydrated = false;
  calendarSystemListeners.clear();
  snapshot = null;
  load = null;
}
