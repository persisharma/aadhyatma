import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { useMuhuratFinder, useAbujhDays, useMuhuratFinderWarmup } from '../../useMuhuratFinder';
import { dateKeyFor } from '../../panchangDayStore';


let mockOvernight = false;
const mockLocation = { cityId: 'jaipur', latitude: 26.9, longitude: 75.8 };
jest.mock('@/contexts/PanchangLocationContext', () => ({ usePanchangLocation: () => ({ location: mockLocation }) }));
jest.mock('../../usePanchang', () => ({ usePanchangCalendarSystem: () => ['purnimant'] }));
const mockTasks: { run: () => Promise<void>; cancel: jest.Mock }[] = [];
jest.mock('@/utils/runWhenIdle', () => ({
  runWhenIdle: (run: () => Promise<void>) => {
    const task = { run, cancel: jest.fn() };
    mockTasks.push(task);
    return task;
  },
}));
const mockHydrate = jest.fn<Promise<void>, any[]>(async () => {});
jest.mock('../../panchangDayCache', () => ({
  hydratePanchangDays: (...args: unknown[]) => mockHydrate(...args),
  persistPanchangDays: jest.fn(async () => {}),
}));
jest.mock('../../panchangDayStore', () => ({
  ...jest.requireActual('../../panchangDayStore'),
  cachedDayInputs: () => ({ inputs: { p: { sunrise: new Date(), sunset: new Date() }, asta: {}, lagnas: [] }, miss: false }),
}));
jest.mock('../../muhurat', () => ({ computeMuhuratDay: () => ({}) }));
jest.mock('../../abujhMuhurat', () => ({ ABUJH_RULE_IDS: [], pushyaYogaFor: () => null }));
jest.mock('../../eventMuhurat', () => ({
  getEventRule: () => ({}),
  evaluateDay: (_rule: unknown, dateMs: number) => ({
    dateMs, tier: 'shreshtha',
    // A valid window continues into the following civil morning.
    windows: [{ start: new Date(jest.requireActual('../../civilTime').civilDayStart(new Date(dateMs)).getTime() + (mockOvernight ? 23 : 10) * 3600000),
      end: new Date(jest.requireActual('../../civilTime').civilDayStart(new Date(dateMs)).getTime() + (mockOvernight ? 26 : 12) * 3600000) }],
  }),
  summarize: (days: unknown[]) => ({ verdicts: [...days], shreshtha: [...days], madhyam: [] }),
}));
const mockAbujhScans: { start: Date; options: any }[] = [];
jest.mock('../../muhuratFinderScan', () => ({
  ...jest.requireActual('../../muhuratFinderScan'),
  abujhFestivalKeys: () => new Set(),
  scanAbujhDays: async (start: Date, _days: number, _opts: unknown, options: any) => {
    mockAbujhScans.push({ start, options });
    const rows = [{ dateMs: start.getTime(), nameEn: 'Fixture' }];
    options.onProgress(rows);
    return rows;
  },
}));

let latest: any;
let renders: any[];
let listeners: ((s: string) => void)[];
let tree: TestRenderer.ReactTestRenderer | undefined;
function Finder() { latest = useMuhuratFinder('vahan', 1); renders.push(latest); return null; }
function Abujh() { latest = useAbujhDays(1); renders.push(latest); return null; }
function Warmup() { useMuhuratFinderWarmup(1); return null; }
const rows = () => latest.summary?.shreshtha ?? latest.days;
const clock = (iso: string) => jest.setSystemTime(new Date(iso));
async function runTask(index = mockTasks.length - 1) { await act(async () => { await mockTasks[index].run(); }); }
function foreground() { act(() => listeners.forEach(fn => fn('active'))); }
beforeEach(() => {
  jest.useFakeTimers();
  mockOvernight = false;
  mockTasks.length = 0; mockAbujhScans.length = 0; renders = []; listeners = [];
  mockHydrate.mockReset().mockResolvedValue(undefined);
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_event: string, cb: (s: string) => void) => {
    listeners.push(cb);
    return { remove: () => { listeners = listeners.filter(x => x !== cb); } };
  }) as any);
});
afterEach(() => {
  if (tree) act(() => tree!.unmount());
  tree = undefined;
  jest.useRealTimers(); jest.restoreAllMocks();
});

describe.each([['Finder', Finder], ['Abujh', Abujh]] as const)('%s India-day lifecycle', (_name, Probe) => {
  function mount() { act(() => { tree = TestRenderer.create(<Probe />); }); }
  test('fresh launch at 00:30 IST starts 19 Dec in every device zone', async () => {
    clock('2026-12-18T19:00:00Z'); mount(); await runTask();
    expect(dateKeyFor(latest.startDate)).toBe('2026-12-19');
    expect(dateKeyFor(new Date(rows()[0].dateMs))).toBe('2026-12-19');
    expect(mockHydrate.mock.calls[0][2]).toContain('2026-12-19');
  });
  test('open at IST midnight hides expired prior-day rows before the new scan', async () => {
    clock('2026-12-18T18:29:59Z'); mount(); await runTask();
    expect(dateKeyFor(new Date(rows()[0].dateMs))).toBe('2026-12-18');
    const before = renders.length;
    act(() => jest.advanceTimersByTime(2001));
    expect(renders.slice(before).every(s => s.loading && !(s.summary?.shreshtha.length ?? s.days?.length))).toBe(true);
    expect(mockTasks[0].cancel).toHaveBeenCalled();
    await runTask();
    expect(dateKeyFor(new Date(rows()[0].dateMs))).toBe('2026-12-19');
  });
  test('foreground after midnight rescans; late hydration cannot apply old results', async () => {
    clock('2026-12-18T18:29:00Z'); mount();
    let finish!: () => void;
    mockHydrate.mockImplementationOnce(() => new Promise<void>(resolve => { finish = resolve; }));
    let old!: Promise<void>;
    act(() => { old = mockTasks[0].run(); });
    clock('2026-12-18T19:00:00Z'); foreground();
    await runTask();
    await act(async () => { finish(); await old; });
    expect(dateKeyFor(new Date(rows()[0].dateMs))).toBe('2026-12-19');
  });
  test('same-day foreground retains results and does not rescan', async () => {
    clock('2026-12-18T19:00:00Z'); mount(); await runTask();
    const previous = rows();
    clock('2026-12-19T00:00:00Z'); foreground();
    expect(mockTasks).toHaveLength(1);
    expect(rows()).toBe(previous);
  });
});
test('current-day valid overnight windows survive unchanged', async () => {
  mockOvernight = true;
  clock('2026-12-18T19:00:00Z');
  act(() => { tree = TestRenderer.create(<Finder />); }); await runTask();
  const window = rows().find((r: any) => dateKeyFor(new Date(r.dateMs)) === '2026-12-19').windows[0];
  expect(window.start.toISOString()).toBe('2026-12-19T17:30:00.000Z');
  expect(window.end.toISOString()).toBe('2026-12-19T20:30:00.000Z');
});
test('obsolete Abujh progressive callbacks cannot replace current results', async () => {
  clock('2026-12-18T18:29:00Z');
  act(() => { tree = TestRenderer.create(<Abujh />); }); await runTask();
  const old = mockAbujhScans[0];
  clock('2026-12-18T19:00:00Z'); foreground(); await runTask();
  act(() => old.options.onProgress([{ dateMs: old.start.getTime() }]));
  expect(old.options.isCancelled()).toBe(true);
  expect(dateKeyFor(new Date(rows()[0].dateMs))).toBe('2026-12-19');
});
test('picker warm-up follows the same India date and cancels on rollover/unmount', async () => {
  clock('2026-12-18T18:29:00Z');
  act(() => { tree = TestRenderer.create(<Warmup />); }); await runTask();
  clock('2026-12-18T19:00:00Z'); foreground(); await runTask();
  expect(mockHydrate.mock.calls.map(call => call[2][0])).toEqual(['2026-12-18', '2026-12-19']);
  expect(mockTasks[0].cancel).toHaveBeenCalled();
  act(() => tree!.unmount()); tree = undefined;
  expect(mockTasks[1].cancel).toHaveBeenCalled();
  expect(listeners).toHaveLength(0);
});

test.each(['open', 'foreground'])('valid prior-sunrise window survives midnight once (%s), then expires without a rescan', async (mode) => {
  mockOvernight = true;
  clock('2026-12-18T18:29:59Z');
  act(() => { tree = TestRenderer.create(<Finder />); }); await runTask();
  const old = rows().find((r: any) => dateKeyFor(new Date(r.dateMs)) === '2026-12-18');
  const endpoints = old.windows.map((w: any) => [w.start.toISOString(), w.end.toISOString()]);
  if (mode === 'open') act(() => jest.advanceTimersByTime(2001));
  else { clock('2026-12-18T18:30:01Z'); foreground(); }
  await runTask();
  const carried = rows().filter((r: any) => dateKeyFor(new Date(r.dateMs)) === '2026-12-18');
  expect(carried).toHaveLength(1);
  expect(carried[0].windows.map((w: any) => [w.start.toISOString(), w.end.toISOString()])).toEqual(endpoints);
  const count = mockTasks.length;
  clock('2026-12-18T20:30:01Z'); foreground();
  expect(rows().some((r: any) => dateKeyFor(new Date(r.dateMs)) === '2026-12-18')).toBe(false);
  expect(mockTasks).toHaveLength(count);
});
test('carry-over expires while open without re-running the scan', async () => {
  mockOvernight = true;
  clock('2026-12-18T20:29:59Z');
  act(() => { tree = TestRenderer.create(<Finder />); }); await runTask();
  expect(rows()).toHaveLength(2);
  act(() => jest.advanceTimersByTime(1001));
  expect(rows()).toHaveLength(1);
  expect(mockTasks).toHaveLength(1);
});
