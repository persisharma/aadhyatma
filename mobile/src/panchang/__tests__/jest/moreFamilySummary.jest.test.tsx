import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { useMoreFamilySummary } from '../../useMoreFamilySummary';
import type { SmaranEntry, TithiRule } from '../../pitruSmaran';
import type { PersonProfile } from '../../birthProfiles';

let mockFocused = true;
jest.mock('@react-navigation/native', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    require('react').useEffect(() => mockFocused ? effect() : undefined, [effect, mockFocused]);
  },
}));
const mockHydrate = jest.fn<Promise<void>, unknown[]>(() => Promise.resolve());
const mockEnsure = jest.fn();
const mockPersist = jest.fn(() => Promise.resolve());
jest.mock('../../pitruSmaranSolves', () => ({
  hydrateSmaranSolves: (...args: unknown[]) => mockHydrate(...args),
  ensureOccurrencesAsync: (...args: unknown[]) => mockEnsure(...args),
  persistSmaranSolves: () => mockPersist(),
  smaranRuleKey: (rule: unknown) => JSON.stringify(rule),
}));
const rule: TithiRule = { lunarMonth: 8, paksha: 'krishna', tithi: 11 };
const mockDerive = jest.fn();
jest.mock('../../janmaTithi', () => ({
  janmaTithiRuleFromBirthDateSteps: (date: string) => mockDerive(date),
}));
const entries = [{ id: 'one', tithiRule: rule }, { id: 'two', tithiRule: rule }] as SmaranEntry[];
const people = [{ id: 'one', date: '1988-11-12' }, { id: 'two', date: '1988-11-12' }] as PersonProfile[];
const noEntries: SmaranEntry[] = [];
const noPeople: PersonProfile[] = [];
let latest: ReturnType<typeof useMoreFamilySummary>;
let tree: TestRenderer.ReactTestRenderer;
function Probe({ e = entries, p = noPeople }: { e?: SmaranEntry[]; p?: PersonProfile[] }) {
  latest = useMoreFamilySummary(e, p);
  return null;
}
async function mount(e = entries, p = noPeople) {
  await act(async () => { tree = TestRenderer.create(<Probe e={e} p={p} />); });
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => { resolve = done; });
  return { promise, resolve };
}
beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  mockFocused = true;
  mockHydrate.mockResolvedValue(undefined);
  mockEnsure.mockResolvedValue([new Date(2026, 10, 1)]);
  mockDerive.mockImplementation(function* () { yield; return rule; });
});
afterEach(async () => {
  if (tree) act(() => tree.unmount());
  await act(async () => { await jest.runAllTimersAsync(); });
  jest.useRealTimers();
});

test('an empty or unfocused hub does no calendar work', async () => {
  await mount(noEntries, noPeople);
  expect(mockHydrate).not.toHaveBeenCalled();
  mockFocused = false;
  await act(async () => tree.update(<Probe e={entries} p={people} />));
  expect(mockDerive).not.toHaveBeenCalled();
  expect(mockEnsure).not.toHaveBeenCalled();
});

test('hydrates before a deduplicated solve and publishes the earliest date', async () => {
  const disk = deferred<void>();
  mockHydrate.mockReturnValue(disk.promise);
  const earlierRule = { ...rule, tithi: 12 };
  mockEnsure.mockImplementation(async (r) => [new Date(2026, r.tithi === 12 ? 9 : 10, 1)]);
  await mount([...entries, { ...entries[0], id: 'third', tithiRule: earlierRule }]);
  expect(mockEnsure).not.toHaveBeenCalled();
  expect(latest.smaranSoonest).toBeNull();
  await act(async () => disk.resolve());
  expect(mockHydrate).toHaveBeenCalledWith([rule, earlierRule], expect.any(Date));
  expect(mockEnsure).toHaveBeenCalledTimes(2);
  expect(mockEnsure).toHaveBeenCalledWith(rule, expect.any(Date), 1, expect.any(Function));
  expect(latest.smaranSoonest).toEqual(new Date(2026, 9, 1));
  expect(mockPersist).toHaveBeenCalled();
});

test('birthday derivation starts on a later turn and deduplicates birth dates', async () => {
  await mount(noEntries, people);
  expect(mockEnsure).not.toHaveBeenCalled();
  expect(latest.janmaSoonest).toBeNull();
  await act(async () => { await jest.runAllTimersAsync(); });
  expect(mockDerive).toHaveBeenCalledTimes(1);
  expect(mockEnsure).toHaveBeenCalledTimes(1);
  expect(latest.janmaSoonest).toEqual(new Date(2026, 10, 1));
});

test('blur cancels an in-flight scan and refocus starts a fresh generation', async () => {
  const pending = deferred<Date[]>();
  mockEnsure.mockReturnValueOnce(pending.promise);
  await mount();
  const isCancelled = mockEnsure.mock.calls[0][3];
  expect(isCancelled()).toBe(false);
  mockFocused = false;
  await act(async () => tree.update(<Probe />));
  expect(isCancelled()).toBe(true);
  await act(async () => pending.resolve([new Date(2026, 8, 1)]));
  expect(latest.smaranSoonest).toBeNull();
  expect(mockPersist).not.toHaveBeenCalled();
  mockFocused = true;
  await act(async () => tree.update(<Probe />));
  expect(latest.smaranSoonest).toEqual(new Date(2026, 10, 1));
});

test('removing a record prevents its old solve from replacing the current summary', async () => {
  const pending = deferred<Date[]>();
  mockEnsure.mockReturnValueOnce(pending.promise);
  await mount();
  await act(async () => tree.update(<Probe e={noEntries} />));
  await act(async () => pending.resolve([new Date(2026, 8, 1)]));
  expect(latest.smaranSoonest).toBeNull();
  expect(mockEnsure.mock.calls[0][3]()).toBe(true);
});

test('leaving during hydration prevents all subsequent solves', async () => {
  const disk = deferred<void>();
  mockHydrate.mockReturnValue(disk.promise);
  await mount();
  act(() => tree.unmount());
  await act(async () => disk.resolve());
  expect(mockEnsure).not.toHaveBeenCalled();
  expect(mockPersist).not.toHaveBeenCalled();
});

test('invalid birth dates and failed optional summaries do not crash the hub', async () => {
  mockDerive.mockImplementation(function* () { return null; });
  await mount(noEntries, people);
  await act(async () => { await jest.runAllTimersAsync(); });
  expect(mockEnsure).not.toHaveBeenCalled();
  expect(latest.janmaSoonest).toBeNull();
  mockHydrate.mockRejectedValueOnce(new Error('storage unavailable'));
  await act(async () => tree.update(<Probe />));
  expect(latest.smaranSoonest).toBeNull();
});
