/**
 * Phase 2's user-visible claim: the daily surfaces (Home's Today strip, the
 * Panchang tab, the daily Muhurat card) no longer solve their own astronomy —
 * they read the SHARED, persisted `panchangDayStore`. So:
 *   - a day the Muhurat Finder already solved makes `useMuhurat` paint with ZERO
 *     engine calls, and
 *   - a day only on DISK (persisted by an earlier launch) is hydrated instead of
 *     re-solved.
 *
 * Both are asserted by counting real `computePanchangForDate` calls, because
 * "does it re-solve?" is the whole question — a test that only checked the
 * rendered output would pass just as happily while re-solving every launch.
 *
 * The counting is scoped to the days the hook RENDERS (`renderedSolves`), not to
 * every call: a today surface also rolls the persisted window a week forward
 * (`panchangDayPrewarm`), and those background solves are the fix for the daily
 * re-solve rather than a regression. The rollover test at the bottom is the one
 * that pins the whole loop end to end.
 *
 * `useMuhurat` is exercised through a probe component (react-test-renderer +
 * act, the pattern the component suites use); there is no renderHook here.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as engine from '@/panchang/engine';
import { useMuhurat, type UseMuhuratResult } from '@/panchang/useMuhurat';
import {
  cachedDayInputs,
  dateKeyFor,
  dayStoreFor,
  scopeKeyFor,
  __resetPanchangDayStore,
} from '@/panchang/panchangDayStore';
import { persistPanchangDays, __resetPanchangDayCache } from '@/panchang/panchangDayCache';
import { PREWARM_DAYS, __resetPanchangDayPrewarm } from '@/panchang/panchangDayPrewarm';

const UJJAIN = { ...engine.UJJAIN_GEO, cityId: 'ujjain' };
const SYSTEM = 'purnimant' as const;
const OPTS = { calendarSystem: SYSTEM, location: UJJAIN };

/**
 * Both of the hook's gates are mutable here, because both are the subject of a
 * test below: `mockLocation.isLoading` stands in for the launch window during
 * which `usePanchangLocation` still reports the DEFAULT city rather than the
 * user's, and `mockInteractions.defer` stands in for a busy UI that never
 * reports itself idle.
 */
const mockLocation = { isLoading: false };
const mockInteractions: { defer: boolean; queue: (() => void)[] } = { defer: false, queue: [] };

jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: { cityId: 'ujjain', latitude: 23.1793, longitude: 75.7849, elevation: 494 },
    isLoading: mockLocation.isLoading,
  }),
}));
jest.mock('@/utils/useMinuteTick', () => ({ useMinuteTick: () => 0 }));
jest.mock('react-native', () => ({
  // Run deferred work immediately so the test does not depend on RN's scheduler
  // — unless a test deliberately holds the queue.
  InteractionManager: {
    runAfterInteractions: (fn: () => void) => {
      if (!mockInteractions.defer) {
        fn();
        return { cancel: () => undefined };
      }
      mockInteractions.queue.push(fn);
      return {
        cancel: () => {
          const at = mockInteractions.queue.indexOf(fn);
          if (at >= 0) mockInteractions.queue.splice(at, 1);
        },
      };
    },
  },
}));

const solveSpy = jest.spyOn(engine, 'computePanchangForDate');

/** Render the hook and return the latest value. */
function renderUseMuhurat(date: Date): { latest: () => UseMuhuratResult | null; unmount: () => void } {
  let latest: UseMuhuratResult | null = null;
  const Probe = () => {
    latest = useMuhurat(date, SYSTEM, { live: false });
    return null;
  };
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(React.createElement(Probe));
  });
  // Unmount inside `act` too — a teardown that flushes an effect's cleanup
  // outside it trips react-test-renderer's not-wrapped-in-act warning.
  return { latest: () => latest, unmount: () => act(() => { tree?.unmount(); }) };
}

const flush = async (): Promise<void> => {
  // Let the deferred setTimeout(0) + the awaited hydrate settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
};

/**
 * Drain the whole deferred chain, roll-forward included: hydrate, compose, then
 * the prewarm's own hydrate + chunked solves (which yield through `setTimeout(0)`
 * between batches). Generous tick budget — a fully warm run finishes in two.
 */
const settle = async (): Promise<void> => {
  for (let i = 0; i < 30; i += 1) await flush();
};

/** The three civil days a day's muhurat windows need. */
const DAY_MS = 86_400_000;
const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

/** The days `useMuhurat(d)` reads to render: yesterday (pre-dawn), today, tomorrow. */
const renderedDayKeys = (d: Date): string[] =>
  [-1, 0, 1].map((off) => dateKeyFor(new Date(d.getTime() + off * DAY_MS)));

/**
 * Solves that landed on a day the hook RENDERS. The roll-forward deliberately
 * solves days beyond the window (that is what stops the next rollover costing
 * anything), so a bare `not.toHaveBeenCalled()` would conflate the two.
 */
const renderedSolves = (spy: jest.SpyInstance, d: Date): string[] => {
  const rendered = renderedDayKeys(d);
  return spy.mock.calls
    .map(([date]) => dateKeyFor(date as Date))
    .filter((key) => rendered.includes(key));
};

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetPanchangDayStore();
  __resetPanchangDayCache();
  __resetPanchangDayPrewarm();
  mockLocation.isLoading = false;
  mockInteractions.defer = false;
  mockInteractions.queue.length = 0;
});

afterEach(() => {
  jest.useRealTimers();
});

test('a day already in the shared store costs ZERO engine solves', async () => {
  const d = today();
  const scope = scopeKeyFor(UJJAIN, SYSTEM);
  const map = dayStoreFor(scope);
  // Stand in for the Muhurat Finder's sweep having already solved this range.
  [-1, 0, 1].forEach((off) => cachedDayInputs(map, new Date(d.getTime() + off * DAY_MS), OPTS));

  const spy = jest.spyOn(engine, 'computePanchangForDate');
  const { latest, unmount } = renderUseMuhurat(d);
  await settle();

  expect(renderedSolves(spy, d)).toEqual([]);
  const result = latest();
  expect(result?.panchang).not.toBeNull();
  expect(result?.muhurat?.dayChoghadiya).toHaveLength(8);
  // Seeded synchronously from the store — no skeleton frame at all.
  expect(result?.isToday).toBe(true);
  unmount();
});

test('the same PanchangData instance is shared, not re-derived per surface', async () => {
  const d = today();
  const map = dayStoreFor(scopeKeyFor(UJJAIN, SYSTEM));
  [-1, 0, 1].forEach((off) => cachedDayInputs(map, new Date(d.getTime() + off * DAY_MS), OPTS));
  const stored = map.get(dateKeyFor(d))!.p;

  const { latest, unmount } = renderUseMuhurat(d);
  await flush();

  expect(latest()?.panchang).toBe(stored);
  unmount();
});

test('a day only on disk is hydrated, not re-solved', async () => {
  const d = today();
  // Solve + persist, as a previous launch would have, then wipe memory only.
  const map = dayStoreFor(scopeKeyFor(UJJAIN, SYSTEM));
  [-1, 0, 1].forEach((off) => cachedDayInputs(map, new Date(d.getTime() + off * DAY_MS), OPTS));
  await persistPanchangDays(UJJAIN, SYSTEM);
  __resetPanchangDayStore();
  __resetPanchangDayCache();

  const spy = jest.spyOn(engine, 'computePanchangForDate');
  const { latest, unmount } = renderUseMuhurat(d);
  await settle();

  expect(renderedSolves(spy, d)).toEqual([]);
  expect(latest()?.muhurat?.dayChoghadiya).toHaveLength(8);
  unmount();
});

test('a day on disk paints WITHOUT the interaction queue ever draining', async () => {
  // The Aug 2026 report behind this: persistence worked, but the whole chain sat
  // behind one `runAfterInteractions`, so a day already on disk could not reach
  // the screen until the UI went idle — and Home's own chip auto-scroll was an
  // endless non-native animation holding an interaction handle. Home's
  // `आज का पंचांग` kept its `—` headline throughout, which reads exactly like a
  // cache that isn't there. Hydration is I/O: it must not be gated on an idle UI.
  const d = today();
  const map = dayStoreFor(scopeKeyFor(UJJAIN, SYSTEM));
  [-1, 0, 1].forEach((off) => cachedDayInputs(map, new Date(d.getTime() + off * DAY_MS), OPTS));
  await persistPanchangDays(UJJAIN, SYSTEM);
  __resetPanchangDayStore();
  __resetPanchangDayCache();

  // Nothing queued behind interactions will run for the rest of this test.
  mockInteractions.defer = true;
  const spy = jest.spyOn(engine, 'computePanchangForDate');
  const { latest, unmount } = renderUseMuhurat(d);
  await settle();

  expect(latest()?.muhurat?.dayChoghadiya).toHaveLength(8);
  expect(latest()?.panchang).not.toBeNull();
  expect(renderedSolves(spy, d)).toEqual([]);
  // The roll-forward, which IS astronomy, correctly stayed parked in the queue.
  expect(mockInteractions.queue.length).toBeGreaterThan(0);
  unmount();
});

test('nothing runs while the location is still a placeholder', async () => {
  // `usePanchangLocation` reports the DEFAULT city until its AsyncStorage read
  // lands, so the scope key is a placeholder for that window. Working through it
  // spends a hydrate, three solves and a seven-day roll-forward on a city the
  // user is about to be moved off — on the launch path, ahead of the real scope.
  const d = today();
  mockLocation.isLoading = true;
  const multiGet = jest.spyOn(AsyncStorage, 'multiGet');
  multiGet.mockClear();
  const spy = jest.spyOn(engine, 'computePanchangForDate');

  const { latest, unmount } = renderUseMuhurat(d);
  await settle();

  expect(spy).not.toHaveBeenCalled();
  expect(multiGet).not.toHaveBeenCalled();
  expect(latest()?.panchang).toBeNull();
  unmount();
});

test('a cold cache still solves — the fallback is intact', async () => {
  const d = today();
  const spy = jest.spyOn(engine, 'computePanchangForDate');
  const { latest, unmount } = renderUseMuhurat(d);
  await flush();

  expect(spy).toHaveBeenCalled();
  expect(latest()?.muhurat?.dayChoghadiya).toHaveLength(8);
  // …and the solved days land on disk for the next launch.
  const keys = await AsyncStorage.getAllKeys();
  expect(keys.some((k) => k.includes(dateKeyFor(d)))).toBe(true);
  unmount();
});

/**
 * Move the wall clock. Only `Date` is faked — the hooks' deferred chain runs on
 * real `setTimeout`/microtasks, so faking those would deadlock `settle()`.
 */
function setClock(at: Date): void {
  jest.useFakeTimers({
    doNotFake: [
      'setTimeout',
      'clearTimeout',
      'setInterval',
      'clearInterval',
      'setImmediate',
      'clearImmediate',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'requestIdleCallback',
      'cancelIdleCallback',
      'queueMicrotask',
      'nextTick',
      'performance',
      'hrtime',
    ],
  });
  jest.setSystemTime(at);
}

test('a midnight rollover costs Home no solve for the days it renders', async () => {
  const dayOneAt = new Date(2026, 7, 14, 9, 0); // 14 Aug 2026, 09:00 local
  setClock(dayOneAt);
  const d1 = today();

  // Session 1 — a cold start. It solves its own three days AND rolls the
  // persisted window a week past tomorrow.
  const first = renderUseMuhurat(d1);
  await settle();
  first.unmount();

  // Next morning's cold start: disk survives a launch, memory does not.
  __resetPanchangDayStore();
  __resetPanchangDayCache();
  __resetPanchangDayPrewarm();
  setClock(new Date(dayOneAt.getTime() + DAY_MS));
  const d2 = today();

  const spy = jest.spyOn(engine, 'computePanchangForDate');
  const second = renderUseMuhurat(d2);
  await settle();

  // The three days the strip actually renders — yesterday (the pre-dawn
  // choghadiya), today, tomorrow (today's night window) — all came off disk.
  // Before the roll-forward existed the persisted window ENDED at tomorrow, so
  // `tomorrow` was a fresh solve right here, in front of the first paint, on
  // every single calendar day: the "today's panchang is computed every day" bug.
  expect(renderedSolves(spy, d2)).toEqual([]);
  expect(second.latest()?.panchang).not.toBeNull();
  expect(second.latest()?.muhurat?.dayChoghadiya).toHaveLength(8);

  // The only astronomy left on a new day is the far edge of the window sliding
  // one day out — background work for a day nothing on screen reads.
  expect(spy.mock.calls.map(([date]) => dateKeyFor(date as Date))).toEqual([
    dateKeyFor(new Date(d2.getTime() + PREWARM_DAYS * DAY_MS)),
  ]);
  second.unmount();
});

// Keep the module-level spy from leaking into the assertions above.
afterAll(() => solveSpy.mockRestore());
