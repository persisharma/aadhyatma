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

const UJJAIN = { ...engine.UJJAIN_GEO, cityId: 'ujjain' };
const SYSTEM = 'purnimant' as const;
const OPTS = { calendarSystem: SYSTEM, location: UJJAIN };

jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({ location: { cityId: 'ujjain', latitude: 23.1793, longitude: 75.7849, elevation: 494 } }),
}));
jest.mock('@/utils/useMinuteTick', () => ({ useMinuteTick: () => 0 }));
jest.mock('react-native', () => ({
  // Run deferred work immediately so the test does not depend on RN's scheduler.
  InteractionManager: { runAfterInteractions: (fn: () => void) => { fn(); return { cancel: () => {} }; } },
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
  return { latest: () => latest, unmount: () => tree?.unmount() };
}

const flush = async (): Promise<void> => {
  // Let the deferred setTimeout(0) + the awaited hydrate settle.
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
  });
};

/** The three civil days a day's muhurat windows need. */
const DAY_MS = 86_400_000;
const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetPanchangDayStore();
  __resetPanchangDayCache();
});

test('a day already in the shared store costs ZERO engine solves', async () => {
  const d = today();
  const scope = scopeKeyFor(UJJAIN, SYSTEM);
  const map = dayStoreFor(scope);
  // Stand in for the Muhurat Finder's sweep having already solved this range.
  [-1, 0, 1].forEach((off) => cachedDayInputs(map, new Date(d.getTime() + off * DAY_MS), OPTS));

  const spy = jest.spyOn(engine, 'computePanchangForDate');
  const { latest, unmount } = renderUseMuhurat(d);
  await flush();

  expect(spy).not.toHaveBeenCalled();
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
  await flush();

  expect(spy).not.toHaveBeenCalled();
  expect(latest()?.muhurat?.dayChoghadiya).toHaveLength(8);
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

// Keep the module-level spy from leaking into the assertions above.
afterAll(() => solveSpy.mockRestore());
