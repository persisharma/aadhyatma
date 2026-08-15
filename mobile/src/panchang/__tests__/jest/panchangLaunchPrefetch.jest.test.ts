/**
 * The third and last shape of "today's panchang loads slower than the homepage"
 * (Aug 2026). The first two reports were about the cache being cold when it
 * shouldn't be (#265: the persisted window ended at tomorrow, so every midnight
 * was a fresh solve) and about work queued in front of the read (#268: an
 * InteractionManager gate and a whole-keyspace purge). Both were fixed, and the
 * card still arrived late — because of WHEN the read was allowed to start.
 *
 * The scope key every panchang cache is keyed by needs BOTH preferences, and the
 * calendar system was read lazily by its first subscriber, which is Home's Today
 * strip — mounted only after `AppReadyGate` opens the splash on the font-scale and
 * language reads. So the `multiGet` that answers "what is today's panchang" was
 * the launch's THIRD serial storage round trip, sitting behind a screen that had
 * already painted everything else from bundled JS.
 *
 * What these tests pin is therefore about ordering and round-trip count, not about
 * output: a suite that only checked the rendered headline passes just as happily
 * while the headline arrives two round trips late.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as engine from '@/panchang/engine';
import { getCityById, toPanchangLocation } from '@/panchang/locations';
import {
  cachedDayInputs,
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  todayMuhuratDayKeys,
  __resetPanchangDayStore,
} from '@/panchang/panchangDayStore';
import { persistPanchangDays, __resetPanchangDayCache } from '@/panchang/panchangDayCache';
import { __resetPanchangDayPrewarm } from '@/panchang/panchangDayPrewarm';
import {
  CALENDAR_SYSTEM_STORAGE_KEY,
  LOCATION_STORAGE_KEY,
  loadPanchangPrefsOnce,
  peekPanchangPrefs,
  __resetPanchangPrefsForTests,
} from '@/panchang/panchangPrefs';
import {
  prefetchTodayPanchang,
  __resetPanchangLaunchPrefetch,
} from '@/panchang/panchangLaunchPrefetch';
import { useMuhurat, type UseMuhuratResult } from '@/panchang/useMuhurat';

const SYSTEM = 'purnimant' as const;
/** A city that is NOT the Ujjain default, so a wrong scope is visible. */
const BENGALURU = toPanchangLocation(getCityById('bengaluru')!, 'city');

/**
 * `useMuhurat` reads the location context. The prefetch's whole job is to make
 * the context's value available on the FIRST render, so the mock mirrors the
 * provider's post-fix behaviour: settled, on the stored city.
 */
const mockLocation = { isLoading: false, location: BENGALURU as typeof BENGALURU };
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: mockLocation.location,
    isLoading: mockLocation.isLoading,
  }),
}));
jest.mock('@/utils/useMinuteTick', () => ({ useMinuteTick: () => 0 }));
jest.mock('react-native', () => ({
  InteractionManager: {
    runAfterInteractions: (fn: () => void) => {
      fn();
      return { cancel: () => undefined };
    },
  },
}));

const flush = async (): Promise<void> => {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
};
const settle = async (): Promise<void> => {
  for (let i = 0; i < 30; i += 1) await flush();
};

/**
 * Render the hook, capturing the value produced by EVERY render — `values[0]` is
 * the first paint, which is the whole subject here.
 */
function renderUseMuhurat(date: Date): {
  values: (UseMuhuratResult | null)[];
  unmount: () => void;
} {
  const values: (UseMuhuratResult | null)[] = [];
  const Probe = () => {
    values.push(useMuhurat(date, SYSTEM, { live: false }));
    return null;
  };
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(React.createElement(Probe));
  });
  return { values, unmount: () => act(() => { tree?.unmount(); }) };
}

const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
const DAY_MS = 86_400_000;

/** Solve + persist the three days a today surface renders, then wipe memory —
 * i.e. leave the device in the state a previous launch leaves it in. */
async function seedDiskFromPreviousLaunch(location = BENGALURU): Promise<void> {
  const map = dayStoreFor(scopeKeyFor(location, SYSTEM));
  const d = today();
  [-1, 0, 1].forEach((off) =>
    cachedDayInputs(map, new Date(d.getTime() + off * DAY_MS), { calendarSystem: SYSTEM, location })
  );
  await persistPanchangDays(location, SYSTEM);
  __resetPanchangDayStore();
  __resetPanchangDayCache();
}

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetPanchangDayStore();
  __resetPanchangDayCache();
  __resetPanchangDayPrewarm();
  __resetPanchangPrefsForTests();
  __resetPanchangLaunchPrefetch();
  mockLocation.isLoading = false;
  mockLocation.location = BENGALURU;
});

test('both preferences cost ONE multiGet, however many consumers ask', async () => {
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));
  await AsyncStorage.setItem(CALENDAR_SYSTEM_STORAGE_KEY, 'amanta');
  const multiGet = jest.spyOn(AsyncStorage, 'multiGet');
  multiGet.mockClear();

  // The provider, the calendar-system subscribers and the launch prefetch all
  // want these two values. Before this they were separate reads issued at
  // separate moments; now they share one.
  const [a, b, c] = await Promise.all([
    loadPanchangPrefsOnce(),
    loadPanchangPrefsOnce(),
    loadPanchangPrefsOnce(),
  ]);

  const prefsReads = multiGet.mock.calls.filter(([keys]) =>
    (keys as string[]).includes(LOCATION_STORAGE_KEY)
  );
  expect(prefsReads).toHaveLength(1);
  expect(a.location.cityId).toBe('bengaluru');
  expect(a.calendarSystem).toBe('amanta');
  expect(b).toBe(a);
  expect(c).toBe(a);
});

test('the prefetch warms the STORED scope, not the Ujjain placeholder', async () => {
  await seedDiskFromPreviousLaunch(BENGALURU);
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));

  await prefetchTodayPanchang();

  // Warming Ujjain's scope would be indistinguishable from warming nothing: the
  // hook reads the user's city.
  const map = dayStoreFor(scopeKeyFor(BENGALURU, SYSTEM));
  expect(todayMuhuratDayKeys(new Date()).every((k) => map.has(k))).toBe(true);
});

test('the prefetch warms exactly the three days a today surface renders', async () => {
  await seedDiskFromPreviousLaunch(BENGALURU);
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));

  await prefetchTodayPanchang();

  // Yesterday is load-bearing, not margin: `useMuhurat`'s pre-dawn correction
  // reads its night choghadiya, and `composeSolved` returns null on ANY miss —
  // so warming two of the three days paints nothing at all.
  const map = dayStoreFor(scopeKeyFor(BENGALURU, SYSTEM));
  const d = today();
  expect(map.has(dateKeyFor(new Date(d.getTime() - DAY_MS)))).toBe(true);
  expect(map.has(dateKeyFor(d))).toBe(true);
  expect(map.has(dateKeyFor(new Date(d.getTime() + DAY_MS)))).toBe(true);
});

test('THE FIX: after the prefetch, the strip composes on its FIRST render', async () => {
  // This is the report. Everything else on Home renders from bundled JS on the
  // first frame; the panchang card could not, because its read had not started.
  // With the read moved to process start, the hook's cache-only `useState`
  // initializer hits and the headline paints in the same frame as the rest.
  await seedDiskFromPreviousLaunch(BENGALURU);
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));

  // The launch prefetch, resolving before React renders — the normal case, since
  // it races the splash gate rather than following it.
  await prefetchTodayPanchang();

  const solveSpy = jest.spyOn(engine, 'computePanchangForDate');
  const { values, unmount } = renderUseMuhurat(today());

  // No flush, no effect, no round trip: the very first render already has it.
  expect(values[0]?.panchang).not.toBeNull();
  expect(values[0]?.muhurat?.dayChoghadiya).toHaveLength(8);
  expect(values[0]?.muhurat?.nightChoghadiya).toHaveLength(8);
  expect(solveSpy).not.toHaveBeenCalled();
  unmount();
});

test('without the prefetch the first render is still blank — the test above is not vacuous', async () => {
  await seedDiskFromPreviousLaunch(BENGALURU);
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));

  // Same disk, same scope, prefetch never kicked off: the hook must fall back to
  // hydrating from its own effect, so the first render is the `—` headline. If
  // this ever passes with a non-null first render, the assertion above has
  // stopped measuring anything.
  const { values, unmount } = renderUseMuhurat(today());
  expect(values[0]?.panchang).toBeNull();

  // …and the fallback still works: the day arrives from disk a round trip later.
  await settle();
  expect(values[values.length - 1]?.panchang).not.toBeNull();
  unmount();
});

test('the prefetch hydrates but never SOLVES — astronomy stays off the launch path', async () => {
  // Disk is empty, so there is nothing to hydrate. The prefetch must not take
  // that as licence to compute: astronomy is CPU that would compete with the
  // launch, which is exactly why `useMuhurat` keeps its solves behind
  // `InteractionManager`. Moving I/O earlier must not move CPU earlier with it.
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));
  const solveSpy = jest.spyOn(engine, 'computePanchangForDate');

  await prefetchTodayPanchang();

  expect(solveSpy).not.toHaveBeenCalled();
  expect(dayStoreFor(scopeKeyFor(BENGALURU, SYSTEM)).size).toBe(0);
});

test('a settled read is readable synchronously, so the provider skips the placeholder render', async () => {
  await AsyncStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify({ cityId: 'bengaluru', source: 'city' }));
  await AsyncStorage.setItem(CALENDAR_SYSTEM_STORAGE_KEY, 'amanta');

  // Before the read lands there is nothing to peek at, and the provider must
  // start on the default with `isLoading` true, exactly as it always has.
  expect(peekPanchangPrefs()).toBeNull();

  await loadPanchangPrefsOnce();

  // After it lands, the value is available WITHOUT awaiting anything — that is
  // what lets `PanchangLocationProvider`'s lazy initializer skip the Ujjain
  // placeholder render entirely.
  expect(peekPanchangPrefs()?.location.cityId).toBe('bengaluru');
  expect(peekPanchangPrefs()?.calendarSystem).toBe('amanta');
});

test('a storage failure degrades to the defaults rather than hanging the launch', async () => {
  jest.spyOn(AsyncStorage, 'multiGet').mockRejectedValueOnce(new Error('disk gone'));

  const prefs = await loadPanchangPrefsOnce();

  expect(prefs.calendarSystem).toBe('purnimant');
  expect(prefs.location.cityId).toBeDefined();
  // And the prefetch on top of it stays fire-and-forget.
  await expect(prefetchTodayPanchang()).resolves.toBeUndefined();
});
