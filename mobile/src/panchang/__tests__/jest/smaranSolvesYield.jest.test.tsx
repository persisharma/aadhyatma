/**
 * The पितृ स्मरण / जन्म तिथि list and detail hooks must solve COOPERATIVELY.
 *
 * A cold list used to run every person's annual scan, the Pitru Paksha window
 * and the detail prewarm as ONE task (5 people: ~1.8 s on desktop V8, several
 * seconds on a phone — ANR territory), so no tap could land while it ran. These
 * cases pin the two properties that fix it, with the engine replaced by a
 * deliberately slow generator:
 *   1. the synchronous solvers are never called from these hooks, and
 *   2. an input callback queued mid-solve runs BEFORE the solve finishes.
 * Dates themselves are unchanged by construction — the sync and async solvers
 * drive the same generator — and the screen suites pin what is rendered.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSmaranDetailSolve, useSmaranListSolve } from '../../usePitruSmaranSolves';
import { useJanmaTithiDetailSolve, useJanmaTithiList } from '../../useJanmaTithi';
import { __resetSmaranSolvesForTests } from '../../pitruSmaranSolves';
import { runInBackground } from '../../backgroundWork';
import type { SmaranEntry, TithiRule } from '../../pitruSmaran';

const mockOrder: string[] = [];
let mockInputQueued = false;
const MOCK_WINDOW = {
  purnima: new Date(2027, 8, 15),
  start: new Date(2027, 8, 16),
  end: new Date(2027, 8, 30),
};

jest.mock('../../pitruSmaran', () => {
  const actual = jest.requireActual('../../pitruSmaran');
  // One "engine unit" costs ~2 ms of real CPU, so a solve spans several 4 ms
  // background slices — exactly what a real annual scan does on a phone.
  function* mockSlowSolve(): Generator<void, Date, void> {
    for (let unit = 0; unit < 10; unit += 1) {
      if (!mockInputQueued) {
        mockInputQueued = true;
        setTimeout(() => mockOrder.push('input'), 0);
      }
      const t = performance.now();
      while (performance.now() - t < 2) {
        // busy: a synchronous astronomy primitive
      }
      yield;
    }
    mockOrder.push('solved');
    return new Date(2027, 0, 10 + mockOrder.length);
  }
  return {
    ...actual,
    nextObservanceForEntry: jest.fn(() => {
      throw new Error('synchronous solve on a screen path');
    }),
    pitruPakshaWindow: jest.fn(() => {
      throw new Error('synchronous window solve on a screen path');
    }),
    pakshaShraddhaDay: jest.fn(() => {
      throw new Error('synchronous shraddha-day solve on a screen path');
    }),
    nextObservanceForEntrySteps: jest.fn(() => mockSlowSolve()),
    pitruPakshaWindowAsync: jest.fn(() => Promise.resolve(MOCK_WINDOW)),
    pakshaShraddhaDayAsync: jest.fn(() => Promise.resolve(new Date(2027, 8, 20))),
  };
});

const mockPeople = [
  { id: 'p1', date: '1990-06-15', time: '06:30', cityId: 'ujjain' },
  { id: 'p2', date: '1985-01-03', time: '06:30', cityId: 'ujjain' },
];
jest.mock('../../useKundali', () => ({
  useBirthProfileRoster: () => ({ hydrated: true, roster: { activeId: 'p1', people: mockPeople }, error: false }),
}));
const mockJanmaRules: Record<string, TithiRule> = {
  '1990-06-15': { lunarMonth: 3, paksha: 'krishna', tithi: 11 },
  '1985-01-03': { lunarMonth: 10, paksha: 'shukla', tithi: 12 },
};
jest.mock('../../janmaTithi', () => ({
  ...jest.requireActual('../../janmaTithi'),
  janmaTithiRuleFromBirthDate: (date: string) => mockJanmaRules[date] ?? null,
}));

const ENTRIES = [
  { id: 'e1', relation: 'pitaji', tithiRule: { lunarMonth: 11, paksha: 'krishna', tithi: 8 }, createdAtMs: 1 },
  { id: 'e2', relation: 'mataji', tithiRule: { lunarMonth: 3, paksha: 'shukla', tithi: 5 }, createdAtMs: 2 },
] as SmaranEntry[];
const RULE: TithiRule = { lunarMonth: 1, paksha: 'krishna', tithi: 6 };
const TODAY = new Date(2026, 10, 7).getTime();

let trees: TestRenderer.ReactTestRenderer[] = [];
beforeEach(async () => {
  // Answers persist to (mock) disk; a previous case's must not warm this one.
  await AsyncStorage.clear();
  __resetSmaranSolvesForTests();
  mockOrder.length = 0;
  mockInputQueued = false;
});
afterEach(() => {
  act(() => trees.forEach((t) => t.unmount()));
  trees = [];
});

async function mountUntil(element: React.ReactElement, ready: () => boolean): Promise<void> {
  await act(async () => {
    trees.push(TestRenderer.create(element));
  });
  for (let turn = 0; turn < 400 && !ready(); turn += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  expect(ready()).toBe(true);
}

function expectInputBeforeFirstSolve(): void {
  expect(mockOrder).toContain('input');
  expect(mockOrder.indexOf('input')).toBeLessThan(mockOrder.indexOf('solved'));
}

test('Pitru list: rows are solved cooperatively, never by the synchronous solvers', async () => {
  let list: ReturnType<typeof useSmaranListSolve> = null;
  function Probe() {
    list = useSmaranListSolve(ENTRIES, TODAY);
    return null;
  }
  await mountUntil(<Probe />, () => list !== null);
  expectInputBeforeFirstSolve();
  const solved = list as unknown as NonNullable<ReturnType<typeof useSmaranListSolve>>;
  expect([...solved.nextByEntryId.keys()]).toEqual(['e1', 'e2']);
  expect(solved.nextByEntryId.get('e1')).toBeInstanceOf(Date);
  expect(solved.window).toEqual(MOCK_WINDOW);
});

test('Pitru detail: both stages publish from cooperative solves', async () => {
  let detail: ReturnType<typeof useSmaranDetailSolve> | null = null;
  function Probe() {
    detail = useSmaranDetailSolve(RULE, TODAY);
    return null;
  }
  await mountUntil(<Probe />, () => detail?.restReady === true);
  expectInputBeforeFirstSolve();
  const solved = detail as unknown as ReturnType<typeof useSmaranDetailSolve>;
  expect(solved.nextReady).toBe(true);
  expect(solved.next).toBeInstanceOf(Date);
  expect(solved.following).toBeInstanceOf(Date);
  expect(solved.pakshaDay).toEqual(new Date(2027, 8, 20));
});

test('Janma list: every person is solved cooperatively', async () => {
  let list: ReturnType<typeof useJanmaTithiList> = null;
  function Probe() {
    list = useJanmaTithiList(TODAY);
    return null;
  }
  await mountUntil(<Probe />, () => Array.isArray(list) && list.every((row) => row.next !== null));
  expectInputBeforeFirstSolve();
  expect((list as unknown as { person: { id: string } }[]).map((row) => row.person.id)).toEqual(['p1', 'p2']);
});

test('Janma detail: both dates publish from cooperative solves', async () => {
  let detail: ReturnType<typeof useJanmaTithiDetailSolve> | null = null;
  function Probe() {
    detail = useJanmaTithiDetailSolve(RULE, TODAY);
    return null;
  }
  await mountUntil(<Probe />, () => detail?.restReady === true);
  expectInputBeforeFirstSolve();
  const solved = detail as unknown as ReturnType<typeof useJanmaTithiDetailSolve>;
  expect(solved.next).toBeInstanceOf(Date);
  expect(solved.following).toBeInstanceOf(Date);
});

test('unmount mid-solve publishes nothing and stops the remaining work', async () => {
  let list: ReturnType<typeof useSmaranListSolve> = null;
  function Probe() {
    list = useSmaranListSolve(ENTRIES, TODAY);
    return null;
  }
  await act(async () => {
    trees.push(TestRenderer.create(<Probe />));
  });
  // Let the solve START (its first engine unit has run), then leave the screen.
  for (let turn = 0; turn < 100 && !mockInputQueued; turn += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  expect(mockInputQueued).toBe(true);
  expect(mockOrder).not.toContain('solved');
  act(() => trees.splice(0).forEach((t) => t.unmount()));
  const solvedAtUnmount = mockOrder.filter((step) => step === 'solved').length;
  for (let turn = 0; turn < 30; turn += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
  expect(list).toBeNull();
  // At most the one in-flight unit completes; no further entry is started.
  expect(mockOrder.filter((step) => step === 'solved').length).toBeLessThanOrEqual(solvedAtUnmount + 1);
});

test('a cold detail opened during launch-time background work is not starved by it', async () => {
  // Six launch-like background jobs (widget plan, muhurat prewarm, reminder
  // passes …), each far longer than the detail's own solves.
  let backgroundUnits = 0;
  let stop = false;
  function* launchWork(): Generator<void, void, void> {
    for (let i = 0; i < 400 && !stop; i += 1) {
      backgroundUnits += 1;
      const t = performance.now();
      while (performance.now() - t < 1) {
        // busy
      }
      yield;
    }
  }
  const launch = Array.from({ length: 6 }, () => runInBackground(launchWork()));
  let detail: ReturnType<typeof useSmaranDetailSolve> | null = null;
  function Probe() {
    detail = useSmaranDetailSolve(RULE, TODAY);
    return null;
  }
  await mountUntil(<Probe />, () => detail?.restReady === true);
  const unitsWhenReady = backgroundUnits;
  stop = true;
  await Promise.all(launch);
  // Round-robin with six jobs ran ~120 background units before the detail's ~20
  // engine units finished; the foreground lane lets at most the slice already in
  // flight run (a handful of 1 ms units) before every detail unit.
  expect(unitsWhenReady).toBeLessThanOrEqual(12);
});
