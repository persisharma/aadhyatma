import React from 'react';
import { InteractionManager } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { PanchangLocationProvider, usePanchangLocation } from '../PanchangLocationContext';
import { __resetPanchangPrefsForTests } from '@/panchang/panchangPrefs';

// Stateful in-memory AsyncStorage mock (jest requires the `mock` prefix to
// reference the closure variable from the hoisted factory).
let mockStore: Record<string, string> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore[k] = v;
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(mockStore))),
  multiGet: jest.fn((keys: string[]) => Promise.resolve(keys.map((k) => [k, mockStore[k] ?? null]))),
  multiRemove: jest.fn((keys: string[]) => {
    keys.forEach((k) => delete mockStore[k]);
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete mockStore[k];
    return Promise.resolve();
  }),
}));

// Controllable expo-location mock — the GPS paths (grant/deny/timeout) are unit
// tested here because Maestro can't script the native permission dialog.
const mockRequestPermissions = jest.fn();
const mockLastKnown = jest.fn();
const mockCurrent = jest.fn();
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestPermissions(...args),
  getLastKnownPositionAsync: (...args: unknown[]) => mockLastKnown(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockCurrent(...args),
  Accuracy: { Low: 3 },
}));

// The real warm-up runs a multi-second astronomy scan — stub it and assert on calls.
const mockWarm: jest.Mock = jest.fn(() => Promise.resolve());
const mockHydrate: jest.Mock = jest.fn(() => Promise.resolve());
jest.mock('@/panchang/observanceCache', () => ({
  warmObservanceCache: (...args: unknown[]) => mockWarm(...args),
  hydrateObservanceCache: (...args: unknown[]) => mockHydrate(...args),
}));

const LOCATION_KEY = '@vedansh:panchang-location';

type Ctx = ReturnType<typeof usePanchangLocation>;
let captured!: Ctx;
function Probe() {
  captured = usePanchangLocation();
  return null;
}

async function flush() {
  await act(async () => {
    for (let i = 0; i < 5; i++) await Promise.resolve();
  });
}

let mounted: TestRenderer.ReactTestRenderer[] = [];

async function mountAndHydrate(): Promise<TestRenderer.ReactTestRenderer> {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(
      <PanchangLocationProvider>
        <Probe />
      </PanchangLocationProvider>
    );
  });
  await flush();
  mounted.push(tree);
  return tree;
}

beforeEach(() => {
  mockStore = {};
  jest.clearAllMocks();
  // The provider no longer reads storage itself — it awaits the process-wide
  // panchang-preferences read, which is memoized so the launch prefetch and every
  // consumer share one round trip. That memo has to be cleared between tests, or
  // each case would be served the first case's (empty) storage.
  __resetPanchangPrefsForTests();
  // Run deferred work immediately — InteractionManager's real scheduler keeps
  // timers alive past the test run and stalls the deferred warm-up path.
  jest
    .spyOn(InteractionManager, 'runAfterInteractions')
    .mockImplementation((task) => {
      if (typeof task === 'function') task();
      return { then: jest.fn(), done: jest.fn(), cancel: jest.fn() };
    });
});

// Unmount so the provider's effect cleanup clears its deferred warm-up timer —
// otherwise the pending timeout keeps the jest process alive after the run.
afterEach(async () => {
  await act(async () => {
    mounted.forEach((tree) => tree.unmount());
  });
  mounted = [];
});

describe('PanchangLocationContext', () => {
  test('fresh install defaults to Ujjain', async () => {
    await mountAndHydrate();
    expect(captured.location.cityId).toBe('ujjain');
    expect(captured.location.source).toBe('default');
    expect(captured.gpsStatus).toBe('idle');
  });

  test('selectCity updates, persists, and warms the observance cache', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.selectCity('delhi');
    });
    await flush();
    expect(captured.location.cityId).toBe('delhi');
    expect(captured.location.source).toBe('city');
    expect(captured.location.labelEn).toBe('Delhi');
    expect(JSON.parse(mockStore[LOCATION_KEY]).cityId).toBe('delhi');
    expect(mockWarm).toHaveBeenCalled();
  });

  test('selecting Ujjain back records the default source and skips warming', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.selectCity('delhi');
    });
    await flush();
    mockWarm.mockClear();
    await act(async () => {
      captured.selectCity('ujjain');
    });
    await flush();
    expect(captured.location.cityId).toBe('ujjain');
    expect(captured.location.source).toBe('default');
    expect(mockWarm).not.toHaveBeenCalled();
  });

  test('unknown cityId is ignored', async () => {
    await mountAndHydrate();
    await act(async () => {
      captured.selectCity('atlantis');
    });
    await flush();
    expect(captured.location.cityId).toBe('ujjain');
  });

  test('requestDeviceLocation snaps a granted GPS fix to the nearest bundled city', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    // Near Varanasi (25.32, 82.97) but not exactly on it.
    mockLastKnown.mockResolvedValue({ coords: { latitude: 25.36, longitude: 83.01 } });
    await mountAndHydrate();
    let result: string | undefined;
    await act(async () => {
      result = await captured.requestDeviceLocation();
    });
    await flush();
    expect(result).toBe('granted');
    expect(captured.location.cityId).toBe('varanasi');
    expect(captured.location.source).toBe('gps');
    expect(JSON.parse(mockStore[LOCATION_KEY]).cityId).toBe('varanasi');
    expect(mockWarm).toHaveBeenCalled();
  });

  test('falls back to getCurrentPositionAsync when no last-known fix exists', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockLastKnown.mockResolvedValue(null);
    mockCurrent.mockResolvedValue({ coords: { latitude: 19.05, longitude: 72.9 } });
    await mountAndHydrate();
    await act(async () => {
      await captured.requestDeviceLocation();
    });
    await flush();
    expect(mockCurrent).toHaveBeenCalled();
    expect(captured.location.cityId).toBe('mumbai');
  });

  test('permission denied keeps the current location and surfaces status', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });
    await mountAndHydrate();
    let result: string | undefined;
    await act(async () => {
      result = await captured.requestDeviceLocation();
    });
    await flush();
    expect(result).toBe('denied');
    expect(captured.gpsStatus).toBe('denied');
    expect(captured.location.cityId).toBe('ujjain');
    expect(mockStore[LOCATION_KEY]).toBeUndefined();
  });

  test('position lookup failure reports error and keeps the current location', async () => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockLastKnown.mockRejectedValue(new Error('no fix'));
    mockCurrent.mockRejectedValue(new Error('no fix'));
    await mountAndHydrate();
    let result: string | undefined;
    await act(async () => {
      result = await captured.requestDeviceLocation();
    });
    await flush();
    expect(result).toBe('error');
    expect(captured.gpsStatus).toBe('error');
    expect(captured.location.cityId).toBe('ujjain');
  });

  test('persisted city is restored on mount, rebuilt from the bundled list', async () => {
    mockStore[LOCATION_KEY] = JSON.stringify({
      cityId: 'kochi',
      source: 'city',
      // Stale coords/labels from an older app version — must be rebuilt.
      latitude: 0,
      longitude: 0,
      elevation: 0,
      labelHi: 'x',
      labelEn: 'x',
    });
    await mountAndHydrate();
    expect(captured.location.cityId).toBe('kochi');
    expect(captured.location.labelEn).toBe('Kochi');
    expect(captured.location.latitude).toBeCloseTo(9.9312);
  });

  test('corrupt or unknown persisted location falls back to the default', async () => {
    mockStore[LOCATION_KEY] = JSON.stringify({ cityId: 'gone-city', source: 'city' });
    await mountAndHydrate();
    expect(captured.location.cityId).toBe('ujjain');
    mockStore[LOCATION_KEY] = 'not-json{';
    await mountAndHydrate();
    expect(captured.location.cityId).toBe('ujjain');
  });
});
