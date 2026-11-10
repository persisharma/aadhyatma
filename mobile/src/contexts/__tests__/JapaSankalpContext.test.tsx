// Japa sankalp in the real JapamCounterProvider (design.md §35.2): every counted
// bead advances the vow through the same `increment`, the vow persists under its
// own key, survives Reset/Clear of the mala counter, and hydration is awaited
// before progress is credited or a vow is written.

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const mockStore = new Map<string, string>();
// When set, the sankalp read stays pending until `mockReleaseSankalpLoad` runs.
let mockHoldSankalp = false;
let mockReleaseSankalpLoad: ((v: string | null) => void) | null = null;
const mockSetItem = jest.fn((key: string, value: string) => {
  mockStore.set(key, value);
  return Promise.resolve();
});
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((key: string) => {
    if (key === '@vedansh/japam-sankalp' && mockHoldSankalp) {
      return new Promise((resolve) => {
        mockReleaseSankalpLoad = resolve;
      });
    }
    return Promise.resolve(mockStore.get(key) ?? null);
  }),
  setItem: (key: string, value: string) => mockSetItem(key, value),
}));

const mockLogJapaBead = jest.fn();
jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({ logJapaBead: mockLogJapaBead, logJapaRound: jest.fn() }),
}));

const { JapamCounterProvider, useJapamCounter, SANKALP_STORAGE_KEY } = jest.requireActual<
  typeof import('@/contexts/JapamCounterContext')
>('@/contexts/JapamCounterContext');

const MANTRA = 'om-namah-shivaya';
const OTHER = 'gayatri-mantra';

let api: ReturnType<typeof useJapamCounter>;
function Capture() {
  api = useJapamCounter();
  return null;
}

let tree: TestRenderer.ReactTestRenderer | null = null;
async function mount() {
  await act(async () => {
    tree = TestRenderer.create(
      <JapamCounterProvider>
        <Capture />
      </JapamCounterProvider>
    );
  });
}

const stored = () => JSON.parse(mockStore.get(SANKALP_STORAGE_KEY) ?? '{}');

beforeEach(() => {
  mockStore.clear();
  mockSetItem.mockClear();
  mockLogJapaBead.mockClear();
  mockHoldSankalp = false;
  mockReleaseSankalpLoad = null;
});
afterEach(() => {
  act(() => tree?.unmount());
  tree = null;
});

describe('japa sankalp in JapamCounterProvider', () => {
  test('taking a sankalp persists it and counted beads advance it', async () => {
    await mount();
    expect(api.isLoading).toBe(false);
    expect(api.getSankalp(MANTRA)).toBeNull();
    act(() => {
      api.takeSankalp(MANTRA, 'mala', 2);
    });
    act(() => {
      api.increment(MANTRA);
      api.increment(MANTRA, 9);
    });
    expect(api.getSankalp(MANTRA)).toMatchObject({ unit: 'mala', amount: 2, done: 10 });
    expect(stored()[MANTRA]).toMatchObject({ unit: 'mala', amount: 2, done: 10 });
    // Another mantra's japa never counts toward this vow.
    act(() => {
      api.increment(OTHER, 50);
    });
    expect(api.getSankalp(MANTRA)!.done).toBe(10);
    expect(api.getSankalp(OTHER)).toBeNull();
    // The counter map keeps its existing shape (widget + upgrader signal read it).
    expect(JSON.parse(mockStore.get('@vedansh/japam-counter')!)[MANTRA]).toEqual(
      expect.not.objectContaining({ sankalp: expect.anything() })
    );
  });

  test('Reset Beads and Clear All never take back sankalp progress', async () => {
    await mount();
    act(() => {
      api.takeSankalp(MANTRA, 'japa', 500);
    });
    act(() => {
      api.increment(MANTRA, 120);
    });
    act(() => api.resetBeads(MANTRA));
    act(() => api.clear(MANTRA));
    expect(api.getEntry(MANTRA).rounds).toBe(0);
    expect(api.getSankalp(MANTRA)!.done).toBe(120);
  });

  test('reaching the target completes, caps and stops the vow', async () => {
    await mount();
    act(() => {
      api.takeSankalp(MANTRA, 'mala', 1);
    });
    act(() => {
      api.increment(MANTRA, 100);
      api.increment(MANTRA, 30);
    });
    const done = api.getSankalp(MANTRA)!;
    expect(done.done).toBe(108);
    expect(done.completedAt).toEqual(expect.any(Number));
    act(() => {
      api.increment(MANTRA, 5);
    });
    expect(api.getSankalp(MANTRA)).toEqual(done);
    // The mala counter keeps counting regardless.
    expect(api.getEntry(MANTRA)).toMatchObject({ rounds: 1, count: 27 });
  });

  test('retargeting keeps progress; release removes only the vow', async () => {
    await mount();
    act(() => {
      api.takeSankalp(MANTRA, 'mala', 11);
    });
    act(() => {
      api.increment(MANTRA, 40);
    });
    act(() => {
      api.takeSankalp(MANTRA, 'mala', 21);
    });
    expect(api.getSankalp(MANTRA)).toMatchObject({ amount: 21, done: 40 });
    expect(api.takeSankalp(MANTRA, 'mala', 0)).toBeNull();
    expect(api.getSankalp(MANTRA)!.amount).toBe(21);
    act(() => api.releaseSankalp(MANTRA));
    expect(api.getSankalp(MANTRA)).toBeNull();
    expect(stored()).toEqual({});
    expect(api.getEntry(MANTRA).count).toBe(40);
  });

  test('a stored vow hydrates and keeps accruing after a cold start', async () => {
    mockStore.set(
      SANKALP_STORAGE_KEY,
      JSON.stringify({ [MANTRA]: { unit: 'japa', amount: 1000, done: 990, startedAt: 1, updatedAt: 2 } })
    );
    await mount();
    expect(api.getSankalp(MANTRA)).toMatchObject({ done: 990 });
    act(() => {
      api.increment(MANTRA, 15);
    });
    expect(api.getSankalp(MANTRA)).toMatchObject({ done: 1000, completedAt: expect.any(Number) });
  });

  test('corrupt storage yields no vows and does not block the counter', async () => {
    mockStore.set(SANKALP_STORAGE_KEY, '{not json');
    await mount();
    expect(api.isLoading).toBe(false);
    expect(api.sankalps).toEqual({});
    act(() => {
      api.increment(MANTRA);
    });
    expect(api.getEntry(MANTRA).count).toBe(1);
  });

  test('nothing is credited or written before the stored vows are known', async () => {
    mockStore.set(
      SANKALP_STORAGE_KEY,
      JSON.stringify({ [MANTRA]: { unit: 'mala', amount: 3, done: 200, startedAt: 1, updatedAt: 2 } })
    );
    mockHoldSankalp = true;
    await mount();
    expect(api.isLoading).toBe(true);
    act(() => {
      api.increment(MANTRA, 4);
    });
    expect(api.takeSankalp(MANTRA, 'mala', 1)).toBeNull();
    expect(mockSetItem.mock.calls.some(([key]) => key === SANKALP_STORAGE_KEY)).toBe(false);
    await act(async () => {
      mockReleaseSankalpLoad!(mockStore.get(SANKALP_STORAGE_KEY) ?? null);
    });
    expect(api.isLoading).toBe(false);
    expect(api.getSankalp(MANTRA)).toMatchObject({ amount: 3, done: 200 });
  });
});
