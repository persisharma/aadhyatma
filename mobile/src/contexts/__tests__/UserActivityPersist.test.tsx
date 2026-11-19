/**
 * The activity history must not be serialized and written on every bead.
 *
 * `persist` used to `JSON.stringify` the WHOLE activity map — one entry per
 * active day, never pruned — and write it on each mutation, on the japam tap
 * path. The in-memory state still updates at once; the write is coalesced to at
 * most one a second and flushed when the app leaves the foreground, so nothing a
 * person counted is lost when they put the phone down.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { ACTIVITY_WRITE_DELAY_MS, UserActivityProvider, toDateKey, useUserActivity } from '@/contexts/UserActivityContext';

const KEY = '@vedansh/user-activity';
const store: Record<string, string> = {};
const mockSetItem = jest.fn((k: string, v: string) => {
  store[k] = v;
  return Promise.resolve();
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
  setItem: (k: string, v: string) => mockSetItem(k, v),
}));

let appStateListeners: ((state: string) => void)[] = [];
let value!: ReturnType<typeof useUserActivity>;
function Probe() {
  value = useUserActivity();
  return null;
}
let tree: TestRenderer.ReactTestRenderer | undefined;

async function mount() {
  await act(async () => {
    tree = TestRenderer.create(
      <UserActivityProvider>
        <Probe />
      </UserActivityProvider>
    );
  });
  await act(async () => undefined);
}

const beadsToday = () => value.dayTotals(toDateKey(new Date())).perMantra.gayatri?.beads ?? 0;
const storedBeads = () => JSON.parse(store[KEY])[toDateKey(new Date())].japa.gayatri.beads;

beforeEach(() => {
  jest.useFakeTimers();
  for (const k of Object.keys(store)) delete store[k];
  mockSetItem.mockClear();
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, cb: (s: string) => void) => {
    appStateListeners.push(cb);
    return { remove: jest.fn() };
  }) as unknown as typeof AppState.addEventListener);
});

afterEach(() => {
  act(() => tree?.unmount());
  tree = undefined;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('a mala of beads is one storage write, and every bead counts at once', async () => {
  await mount();
  for (let bead = 1; bead <= 108; bead += 1) {
    act(() => value.logJapaBead('gayatri'));
    expect(beadsToday()).toBe(bead); // the count on screen never waits for storage
  }
  expect(mockSetItem).not.toHaveBeenCalled();

  act(() => {
    jest.advanceTimersByTime(ACTIVITY_WRITE_DELAY_MS);
  });
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(storedBeads()).toBe(108);
});

test('leaving the foreground writes at once', async () => {
  await mount();
  act(() => value.logJapaBead('gayatri', 7));
  expect(mockSetItem).not.toHaveBeenCalled();

  act(() => appStateListeners.forEach((listener) => listener('background')));
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(storedBeads()).toBe(7);

  // Nothing is pending afterwards: no second write of the same state.
  act(() => {
    jest.advanceTimersByTime(ACTIVITY_WRITE_DELAY_MS * 2);
  });
  expect(mockSetItem).toHaveBeenCalledTimes(1);
});

test('unmounting writes what is pending', async () => {
  await mount();
  act(() => value.logRead('hanuman-chalisa'));
  expect(mockSetItem).not.toHaveBeenCalled();
  act(() => tree?.unmount());
  tree = undefined;
  expect(mockSetItem).toHaveBeenCalledTimes(1);
  expect(JSON.parse(store[KEY])[toDateKey(new Date())].reads['hanuman-chalisa']).toBe(1);
});

test('later activity after a write starts a new one', async () => {
  await mount();
  act(() => value.logJapaBead('gayatri'));
  act(() => {
    jest.advanceTimersByTime(ACTIVITY_WRITE_DELAY_MS);
  });
  act(() => value.logJapaBead('gayatri'));
  act(() => {
    jest.advanceTimersByTime(ACTIVITY_WRITE_DELAY_MS);
  });
  expect(mockSetItem).toHaveBeenCalledTimes(2);
  expect(storedBeads()).toBe(2);
});
