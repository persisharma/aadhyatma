import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { RoutineProvider, useRoutines } from '@/contexts/RoutineContext';
import { toDateKey } from '@/contexts/UserActivityContext';

const CELEBRATED_KEY = '@vedansh/routine-celebrated';
const DONE_KEY = '@vedansh/routine-done';
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

describe('RoutineContext — timestamped done marks (PRD-10)', () => {
  it('records the offered time on a manual mark and persists a marks map', async () => {
    const get = mountProbe();
    await act(async () => undefined);

    const before = Date.now();
    act(() => get().markManualDone('r1:a'));
    const after = Date.now();

    expect(get().isManualDone('r1:a')).toBe(true);
    const at = get().manualDoneAt('r1:a');
    expect(at).toBeGreaterThanOrEqual(before);
    expect(at).toBeLessThanOrEqual(after);

    const persisted = JSON.parse(store[DONE_KEY] as string);
    expect(persisted.date).toBe(today);
    expect(typeof persisted.marks['r1:a']).toBe('number');
  });

  it('unmark removes the key and its timestamp', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    act(() => get().markManualDone('r1:a'));
    act(() => get().unmarkManualDone('r1:a'));

    expect(get().isManualDone('r1:a')).toBe(false);
    expect(get().manualDoneAt('r1:a')).toBeUndefined();
    expect(JSON.parse(store[DONE_KEY] as string).marks).toEqual({});
  });

  it('migrates a legacy { date, keys } done-set to timestamp 0 (offered, time unknown)', async () => {
    store[DONE_KEY] = JSON.stringify({ date: today, keys: ['r1:a', 'r1:b'] });
    const get = mountProbe();
    await act(async () => undefined);

    expect(get().isManualDone('r1:a')).toBe(true);
    expect(get().isManualDone('r1:b')).toBe(true);
    expect(get().manualDoneAt('r1:a')).toBe(0);
  });

  it('discards a previous-day done-set (daily reset)', async () => {
    store[DONE_KEY] = JSON.stringify({ date: '2000-01-01', marks: { 'r1:a': 123 } });
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().isManualDone('r1:a')).toBe(false);
  });
});
