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
 * DEPENDENCIES. AsyncStorage and `locations.ts` only. It must stay importable by
 * both `PanchangLocationContext` (which pulls in `expo-location`) and the launch
 * prefetch (which must not), so it can never import either — same isolation rule
 * that keeps `panchangDayStore` RN-free and `expo-updates` out of the cache graph.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_LOCATION, getCityById, toPanchangLocation } from './locations';
import type { CalendarSystem, PanchangLocation } from './types';

export const LOCATION_STORAGE_KEY = '@vedansh:panchang-location';
export const CALENDAR_SYSTEM_STORAGE_KEY = '@vedansh:panchang-calendar-system';

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
    const city = typeof parsed?.cityId === 'string' ? getCityById(parsed.cityId) : undefined;
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
