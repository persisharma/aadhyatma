/**
 * Source ladder (PRD-24 Phase 2 §A1/§A2, RULEBOOK §22 rule 11): fused →
 * magnetometer → unavailable. Pins the contract's sharp edges — the permission
 * is only ever QUERIED (a prompt here would be a bug, US-01), trueHeading −1
 * falls back to magHeading + declination, a silent fused subscription falls
 * down the ladder after the watchdog, Hold's `enabled=false` removes the
 * subscription, and tilt (magnetometer rung only) outranks unreliable.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text } from 'react-native';

import { useCompassHeading, type CompassHeading } from '../useCompassHeading';

type HeadingSample = { trueHeading: number; magHeading: number; accuracy: number };

const mockEnv: {
  granted: boolean;
  watchBehavior: 'works' | 'throws' | 'silent';
  headingCallback: ((h: HeadingSample) => void) | null;
  magnetometerCallback: ((s: { x: number; y: number; z: number }) => void) | null;
  accelerometerCallback: ((s: { x: number; y: number; z: number }) => void) | null;
} = {
  granted: true,
  watchBehavior: 'works',
  headingCallback: null,
  magnetometerCallback: null,
  accelerometerCallback: null,
};

const mockHeadingRemove = jest.fn();
const mockMagnetometerRemove = jest.fn();
const mockRequestPermissions = jest.fn(() => Promise.resolve({ status: 'granted', granted: true }));

jest.mock('expo-modules-core', () => ({
  requireOptionalNativeModule: jest.fn(() => ({})),
}));

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: mockEnv.granted ? 'granted' : 'denied', granted: mockEnv.granted })
  ),
  requestForegroundPermissionsAsync: mockRequestPermissions,
  watchHeadingAsync: jest.fn((callback: (h: HeadingSample) => void) => {
    if (mockEnv.watchBehavior === 'throws') return Promise.reject(new Error('heading unavailable'));
    if (mockEnv.watchBehavior === 'works') mockEnv.headingCallback = callback;
    // 'silent': resolve a subscription but never register the callback — the
    // iOS-simulator shape (subscribes fine, emits nothing).
    return Promise.resolve({ remove: mockHeadingRemove });
  }),
}));

jest.mock('expo-sensors', () => ({
  Magnetometer: {
    isAvailableAsync: jest.fn(async () => true),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((callback: (s: { x: number; y: number; z: number }) => void) => {
      mockEnv.magnetometerCallback = callback;
      return { remove: mockMagnetometerRemove };
    }),
  },
  Accelerometer: {
    isAvailableAsync: jest.fn(async () => true),
    setUpdateInterval: jest.fn(),
    addListener: jest.fn((callback: (s: { x: number; y: number; z: number }) => void) => {
      mockEnv.accelerometerCallback = callback;
      return { remove: jest.fn() };
    }),
  },
}));

// Somewhere outside the declination grid with an unknown city → declination is
// null, so magnetic headings pass through unchanged and pins stay arithmetic.
jest.mock('@/contexts/PanchangLocationContext', () => ({
  usePanchangLocation: () => ({
    location: { cityId: 'nowhere', labelHi: '—', labelEn: '—', latitude: 51.5, longitude: -0.1, elevation: 0, source: 'default' },
  }),
}));

let latest: CompassHeading;
function Probe({ enabled }: { enabled: boolean }) {
  latest = useCompassHeading(enabled);
  return <Text>{latest.status}</Text>;
}

async function renderProbe(enabled = true) {
  let renderer!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    renderer = TestRenderer.create(<Probe enabled={enabled} />);
  });
  return renderer;
}

// A flat-phone magnetometer sample pointing magnetic north, plausible field.
const FLAT_NORTH = { x: 0, y: 40, z: -20 };
const FLAT_ACCEL = { x: 0, y: 0, z: -1 };
const TILTED_ACCEL = { x: 0.7, y: 0, z: -0.7 }; // ~45°

beforeEach(() => {
  jest.clearAllMocks();
  mockEnv.granted = true;
  mockEnv.watchBehavior = 'works';
  mockEnv.headingCallback = null;
  mockEnv.magnetometerCallback = null;
  mockEnv.accelerometerCallback = null;
});

test('fused rung wins when the OS heading is available — and never prompts', async () => {
  const r = await renderProbe();
  await act(async () => {
    mockEnv.headingCallback!({ trueHeading: 100, magHeading: 97, accuracy: 3 });
  });
  expect(latest).toEqual({ status: 'ok', heading: 100, source: 'fused' });
  expect(mockRequestPermissions).not.toHaveBeenCalled();
  expect(mockEnv.magnetometerCallback).toBeNull(); // lower rung never started
  act(() => r.unmount());
  expect(mockHeadingRemove).toHaveBeenCalled();
});

test('trueHeading −1 (no location permission on iOS) falls back to magHeading + declination', async () => {
  const r = await renderProbe();
  await act(async () => {
    mockEnv.headingCallback!({ trueHeading: -1, magHeading: 250, accuracy: 2 });
  });
  // Declination is null here (outside the grid, unknown city) → stays magnetic.
  expect(latest).toEqual({ status: 'ok', heading: 250, source: 'fused' });
  act(() => r.unmount());
});

test('fused calibration accuracy ≤ 1 reports unreliable, dial keeps the heading', async () => {
  const r = await renderProbe();
  await act(async () => {
    mockEnv.headingCallback!({ trueHeading: 10, magHeading: 9, accuracy: 1 });
  });
  expect(latest.status).toBe('unreliable');
  expect(latest.heading).toBe(10);
  act(() => r.unmount());
});

test('Android without the location permission skips the fused rung — no prompt, magnetometer serves', async () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { Platform } = require('react-native');
  const original = Platform.OS;
  Platform.OS = 'android';
  mockEnv.granted = false;
  try {
    const r = await renderProbe();
    await act(async () => {
      mockEnv.magnetometerCallback!(FLAT_NORTH);
    });
    expect(latest.source).toBe('magnetometer');
    expect(latest.status).toBe('ok');
    expect(mockRequestPermissions).not.toHaveBeenCalled();
    act(() => r.unmount());
  } finally {
    Platform.OS = original;
  }
});

test('a throwing fused subscription falls down to the magnetometer', async () => {
  mockEnv.watchBehavior = 'throws';
  const r = await renderProbe();
  await act(async () => {
    mockEnv.magnetometerCallback!(FLAT_NORTH);
  });
  expect(latest.source).toBe('magnetometer');
  act(() => r.unmount());
});

test('a silent fused subscription (iOS simulator) falls down after the watchdog', async () => {
  jest.useFakeTimers();
  try {
    mockEnv.watchBehavior = 'silent';
    const r = await renderProbe();
    expect(latest.status).toBe('starting');
    await act(async () => {
      jest.advanceTimersByTime(2100);
    });
    // The stuck subscription was removed and the magnetometer rung started.
    expect(mockHeadingRemove).toHaveBeenCalled();
    await act(async () => {
      mockEnv.magnetometerCallback!(FLAT_NORTH);
    });
    expect(latest.source).toBe('magnetometer');
    expect(latest.status).toBe('ok');
    act(() => r.unmount());
  } finally {
    jest.useRealTimers();
  }
});

test('enabled=false removes the live subscription — the Hold contract', async () => {
  const r = await renderProbe();
  await act(async () => {
    mockEnv.headingCallback!({ trueHeading: 42, magHeading: 40, accuracy: 3 });
  });
  await act(async () => {
    r.update(<Probe enabled={false} />);
  });
  expect(mockHeadingRemove).toHaveBeenCalled();
  // The frozen state survives — the dial shows what was held.
  expect(latest.heading).toBe(42);
  act(() => r.unmount());
});

describe('tilt honesty — magnetometer rung only (§A2)', () => {
  beforeEach(() => {
    mockEnv.watchBehavior = 'throws'; // force the magnetometer rung
  });

  test('sustained >20° tilt (5 samples) flips to tilted; the dial keeps moving', async () => {
    const r = await renderProbe();
    await act(async () => {
      for (let i = 0; i < 4; i += 1) mockEnv.accelerometerCallback!(TILTED_ACCEL);
      mockEnv.magnetometerCallback!(FLAT_NORTH);
    });
    expect(latest.status).toBe('ok'); // 4 samples — not yet
    await act(async () => {
      mockEnv.accelerometerCallback!(TILTED_ACCEL);
      mockEnv.magnetometerCallback!(FLAT_NORTH);
    });
    expect(latest.status).toBe('tilted');
    expect(latest.heading).not.toBeNull();
    act(() => r.unmount());
  });

  test('tilted outranks unreliable; a flat sample resets the run', async () => {
    const r = await renderProbe();
    await act(async () => {
      // Implausible field AND sustained tilt.
      for (let i = 0; i < 5; i += 1) {
        mockEnv.accelerometerCallback!(TILTED_ACCEL);
        mockEnv.magnetometerCallback!({ x: 0, y: 300, z: 0 });
      }
    });
    expect(latest.status).toBe('tilted');
    await act(async () => {
      mockEnv.accelerometerCallback!(FLAT_ACCEL); // back to flat
      mockEnv.magnetometerCallback!({ x: 0, y: 300, z: 0 });
    });
    expect(latest.status).toBe('unreliable'); // field warning still stands
    act(() => r.unmount());
  });

  test('the fused rung never reports tilted — no accelerometer subscription there', async () => {
    mockEnv.watchBehavior = 'works';
    const r = await renderProbe();
    await act(async () => {
      mockEnv.headingCallback!({ trueHeading: 5, magHeading: 4, accuracy: 3 });
    });
    expect(mockEnv.accelerometerCallback).toBeNull();
    expect(latest.status).toBe('ok');
    act(() => r.unmount());
  });
});
