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

describe('RoutineContext — celebration gate (signature-based)', () => {
  it('has no celebrated signature by default, then marks + persists today', async () => {
    const get = mountProbe();
    await act(async () => undefined); // flush async hydration
    expect(get().celebratedSignatureToday).toBeNull();

    act(() => get().markCelebrated('r1:a|r1:b'));
    expect(get().celebratedSignatureToday).toBe('r1:a|r1:b');
    expect(store[CELEBRATED_KEY]).toBe(JSON.stringify({ date: today, sig: 'r1:a|r1:b' }));
  });

  it('hydrates the signature from a record dated today', async () => {
    store[CELEBRATED_KEY] = JSON.stringify({ date: today, sig: 'r1:a' });
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().celebratedSignatureToday).toBe('r1:a');
  });

  it('treats a stale (previous-day) record as nothing celebrated today', async () => {
    store[CELEBRATED_KEY] = JSON.stringify({ date: '2000-01-01', sig: 'r1:a' });
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().celebratedSignatureToday).toBeNull();
  });

  it('treats a legacy bare-date value (old format) as nothing celebrated today', async () => {
    store[CELEBRATED_KEY] = today; // pre-signature builds stored a bare date string
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().celebratedSignatureToday).toBeNull();
  });
});
