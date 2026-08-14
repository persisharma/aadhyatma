/**
 * The rolling look-ahead warm (`panchangDayPrewarm`). Its job is one sentence:
 * keep the persisted day window AHEAD of what any surface renders, so a midnight
 * rollover finds every day it needs already on disk instead of solving one on
 * Home's critical path.
 *
 * The end-to-end proof of that lives in `panchangDayRouting.jest.test.ts` (a real
 * clock rollover through `useMuhurat`). This suite pins the module's own
 * contract: the window it covers, that it writes those days to disk, that it
 * costs nothing when the window is already warm, that overlapping runs don't
 * double-solve, and that an unmount stops it mid-window.
 *
 * Uses the real engine — a warm/cold distinction asserted against a fake solver
 * would prove nothing about the store the app actually reads. Lives in
 * `__tests__/jest/` for the same reason as its siblings: `npm run test:engine`
 * globs `__tests__/*.test.ts` into `tsx --test`, which cannot run Jest suites.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as engine from '@/panchang/engine';
import {
  dateKeyFor,
  dayAt,
  dayStoreFor,
  scopeKeyFor,
  __resetPanchangDayStore,
} from '@/panchang/panchangDayStore';
import {
  panchangDayStorageKey,
  __resetPanchangDayCache,
} from '@/panchang/panchangDayCache';
import {
  PREWARM_DAYS,
  prewarmPanchangDays,
  __resetPanchangDayPrewarm,
} from '@/panchang/panchangDayPrewarm';

const UJJAIN = { ...engine.UJJAIN_GEO, cityId: 'ujjain' };
const SYSTEM = 'purnimant' as const;
const SCOPE = scopeKeyFor(UJJAIN, SYSTEM);

/** A fixed start day keeps the assertions independent of when the suite runs. */
const START = new Date(2026, 7, 14); // 14 Aug 2026
/** Small window: the contract is the same at 3 days and the suite stays quick. */
const DAYS = 3;

const windowKeys = (start: Date, days: number): string[] =>
  Array.from({ length: days + 1 }, (_, i) => dateKeyFor(dayAt(start, i)));

beforeEach(async () => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  await AsyncStorage.clear();
  __resetPanchangDayStore();
  __resetPanchangDayCache();
  __resetPanchangDayPrewarm();
});

test('warms start … start+days INCLUSIVE, into memory and onto disk', async () => {
  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS });

  const map = dayStoreFor(SCOPE);
  const keys = await AsyncStorage.getAllKeys();
  for (const dateKey of windowKeys(START, DAYS)) {
    expect(map.has(dateKey)).toBe(true);
    // On disk is the half that matters: it is what the NEXT launch hydrates.
    expect(keys).toContain(panchangDayStorageKey(SCOPE, dateKey));
  }
  // The far edge is inclusive; one past it is not warmed.
  expect(map.has(dateKey(DAYS + 1))).toBe(false);
});

test('covers the days tomorrow will need, which is the whole point', async () => {
  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS });

  // Tomorrow's Today strip reads {today, tomorrow, day-after} relative to ITSELF.
  // All three must already be on disk, or the rollover costs a solve again.
  const keys = await AsyncStorage.getAllKeys();
  for (const off of [0, 1, 2]) {
    expect(keys).toContain(panchangDayStorageKey(SCOPE, dateKey(off)));
  }
});

test('defaults to today, so a caller need not know the window', async () => {
  await prewarmPanchangDays(UJJAIN, SYSTEM, { days: 1 });

  const n = new Date();
  const map = dayStoreFor(SCOPE);
  expect(map.has(dateKeyFor(new Date(n.getFullYear(), n.getMonth(), n.getDate())))).toBe(true);
  expect(map.has(dateKeyFor(new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)))).toBe(true);
});

test('a second run over a warm window solves nothing and writes nothing', async () => {
  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS });
  __resetPanchangDayPrewarm();

  const solve = jest.spyOn(engine, 'computePanchangForDate');
  const multiSet = jest.spyOn(AsyncStorage, 'multiSet');
  multiSet.mockClear(); // the official mock's methods are shared jest.fn()s
  const multiGet = jest.spyOn(AsyncStorage, 'multiGet');
  multiGet.mockClear();

  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS });

  expect(solve).not.toHaveBeenCalled();
  expect(multiSet).not.toHaveBeenCalled();
  // A fully warm range never even reaches storage — re-mounting a today surface
  // (a tab switch) must not wait on a disk round-trip it can learn nothing from.
  expect(multiGet).not.toHaveBeenCalled();
});

test('hydrates from disk rather than re-solving after a cold start', async () => {
  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS });
  // Cold start: memory (and the "already persisted" bookkeeping) goes, disk stays.
  __resetPanchangDayStore();
  __resetPanchangDayCache();
  __resetPanchangDayPrewarm();

  const solve = jest.spyOn(engine, 'computePanchangForDate');
  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS });

  expect(solve).not.toHaveBeenCalled();
  expect(dayStoreFor(SCOPE).size).toBe(DAYS + 1);
});

test('overlapping runs do not double-solve the same scope', async () => {
  // Both today surfaces (the strip and the daily Muhurat card) call this on
  // mount; without the in-flight guard they race through the same cold days.
  const solve = jest.spyOn(engine, 'computePanchangForDate');

  await Promise.all([
    prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS }),
    prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS }),
  ]);

  const solved = solve.mock.calls.map(([date]) => dateKeyFor(date as Date));
  expect(solved).toEqual(windowKeys(START, DAYS));
});

test('cancellation stops the walk mid-window', async () => {
  // `isCancelled` is checked once after the hydrate and then before every day,
  // so flipping on the third call lets exactly the first day through — proving
  // the walk STARTED and was cut short, not that it never began.
  let checks = 0;
  const isCancelled = () => {
    checks += 1;
    return checks > 2;
  };

  await prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: PREWARM_DAYS, isCancelled });

  const map = dayStoreFor(SCOPE);
  expect(map.size).toBe(1);
  expect(map.has(dateKey(0))).toBe(true);
  // A cancelled run must not persist a partial window as if it were complete —
  // the day it did solve is still valid, it simply waits for the next run.
  expect(await AsyncStorage.getAllKeys()).toEqual([]);
});

test('an unsolvable day is skipped, not fatal', async () => {
  const real = engine.computePanchangForDate;
  let seen = 0;
  jest.spyOn(engine, 'computePanchangForDate').mockImplementation(((date: Date, opts: never) => {
    seen += 1;
    if (seen === 2) throw new Error('bad day');
    return real(date, opts);
  }) as typeof engine.computePanchangForDate);

  await expect(
    prewarmPanchangDays(UJJAIN, SYSTEM, { start: START, days: DAYS })
  ).resolves.toBeUndefined();

  const map = dayStoreFor(SCOPE);
  expect(map.has(dateKeyFor(dayAt(START, 0)))).toBe(true);
  expect(map.has(dateKeyFor(dayAt(START, 1)))).toBe(false);
  expect(map.has(dateKeyFor(dayAt(START, DAYS)))).toBe(true);
});

/** `offset` days from `START`, as a civil-date key. */
function dateKey(offset: number): string {
  return dateKeyFor(dayAt(START, offset));
}
