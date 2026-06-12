import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { RoutineProvider, useRoutines } from '@/contexts/RoutineContext';
import { toDateKey } from '@/contexts/UserActivityContext';

const CELEBRATED_KEY = '@vedansh/routine-celebrated';
const store: Record<string, string | null> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    store[k] = v;
    return Promise.resolve();
  }),
}));

const today = toDateKey(new Date());

function mountProbe() {
  let value!: ReturnType<typeof useRoutines>;
  function Probe() {
    value = useRoutines();
    return null;
  }
  act(() => {
    TestRenderer.create(
      <RoutineProvider>
        <Probe />
      </RoutineProvider>
    );
  });
  return () => value;
}

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  jest.clearAllMocks();
});

describe('RoutineContext — celebration gate', () => {
  it('is uncelebrated by default, then marks + persists today', async () => {
    const get = mountProbe();
    await act(async () => undefined); // flush async hydration
    expect(get().celebratedToday).toBe(false);

    act(() => get().markCelebratedToday());
    expect(get().celebratedToday).toBe(true);
    expect(store[CELEBRATED_KEY]).toBe(today);
  });

  it('hydrates celebratedToday from a stored key dated today', async () => {
    store[CELEBRATED_KEY] = today;
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().celebratedToday).toBe(true);
  });

  it('treats a stale (previous-day) key as not celebrated today', async () => {
    store[CELEBRATED_KEY] = '2000-01-01';
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().celebratedToday).toBe(false);
  });
});
