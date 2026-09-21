import { runInBackground } from '../../backgroundWork';
import { cachedDayInputs, cachedDayInputsAsync, type DayInputs } from '../../panchangDayStore';
import { UJJAIN_GEO } from '../../engine';
import * as engine from '../../engine';

afterEach(() => jest.restoreAllMocks());

test('simultaneous jobs share a budget and allow a queued tap before completion', async () => {
  let elapsed = 0;
  jest.spyOn(performance, 'now').mockImplementation(() => elapsed);
  const events: string[] = [];
  function* solve(name: string) {
    for (let i = 0; i < 4; i++) {
      events.push(name);
      elapsed += 3;
      yield;
    }
    return name;
  }
  const a = runInBackground(solve('a'));
  const b = runInBackground(solve('b'));
  expect(events).toEqual([]); // no CPU work on the caller's stack
  setTimeout(() => events.push('tap'), 0);
  expect(await Promise.all([a, b])).toEqual(['a', 'b']);
  expect(events.slice(0, 3)).toEqual(['a', 'b', 'tap']);
  expect(events.slice(3)).toContain('a');
  expect(events.slice(3)).toContain('b');
});

test('cancellation closes a suspended job without running its remaining work', async () => {
  let elapsed = 0;
  jest.spyOn(performance, 'now').mockImplementation(() => elapsed);
  let cancelled = false;
  const events: string[] = [];
  function* solve() {
    try {
      events.push('started');
      elapsed += 5;
      yield;
      events.push('published');
      return true;
    } finally {
      events.push('closed');
    }
  }
  const result = runInBackground(solve(), () => cancelled);
  setTimeout(() => { cancelled = true; }, 0);
  expect(await result).toBeUndefined();
  expect(events).toEqual(['started', 'closed']);
});

test('one failed job does not strand other work', async () => {
  function* failed(): Generator<void, number, void> { throw new Error('bad day'); }
  function* good() { yield; return 42; }
  const results = await Promise.allSettled([runInBackground(failed()), runInBackground(good())]);
  expect(results[0].status).toBe('rejected');
  expect(results[1]).toEqual({ status: 'fulfilled', value: 42 });
});

test('cold day yields before completion and only publishes a complete, identical cache record', async () => {
  let elapsed = 0;
  jest.spyOn(performance, 'now').mockImplementation(() => elapsed += 5);
  const date = new Date(2026, 8, 20);
  const opts = { calendarSystem: 'purnimant' as const, location: UJJAIN_GEO };
  const map = new Map<string, DayInputs>();
  const result = cachedDayInputsAsync(map, date, opts);
  expect(map.size).toBe(0);
  let cacheSizeAtTap = -1;
  setTimeout(() => { cacheSizeAtTap = map.size; }, 0);
  const solved = await result;
  expect(cacheSizeAtTap).toBe(0);
  expect(map.size).toBe(1);
  expect(solved).toEqual(cachedDayInputs(new Map(), date, opts).inputs);
  expect(await cachedDayInputsAsync(map, date, opts)).toBe(solved);
});

test('cancelling a day between phases never leaves a partial cache record', async () => {
  let elapsed = 0;
  jest.spyOn(performance, 'now').mockImplementation(() => elapsed += 5);
  let cancelled = false;
  const map = new Map<string, DayInputs>();
  const result = cachedDayInputsAsync(map, new Date(2026, 8, 21),
    { calendarSystem: 'purnimant', location: UJJAIN_GEO }, () => cancelled);
  setTimeout(() => { cancelled = true; }, 0);
  expect(await result).toBeUndefined();
  expect(map.size).toBe(0);
});


test('two Home consumers share a cold solve and cancelling one does not cancel the other', async () => {
  let elapsed = 0;
  jest.spyOn(performance, 'now').mockImplementation(() => elapsed += 5);
  const solve = jest.spyOn(engine, 'computePanchangForDateSteps');
  const map = new Map<string, DayInputs>();
  const date = new Date(2026, 8, 22);
  const opts = { calendarSystem: 'purnimant' as const, location: UJJAIN_GEO };
  let cancelled = false;
  const first = cachedDayInputsAsync(map, date, opts, () => cancelled);
  const second = cachedDayInputsAsync(map, date, opts);
  setTimeout(() => { cancelled = true; }, 0);
  const [a, b] = await Promise.all([first, second]);
  expect(a).toBeUndefined();
  expect(b).toBeDefined();
  expect(map.size).toBe(1);
  expect(solve).toHaveBeenCalledTimes(1);
});
