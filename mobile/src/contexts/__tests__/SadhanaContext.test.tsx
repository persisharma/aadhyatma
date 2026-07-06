import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { SadhanaProvider, useSadhana } from '@/contexts/SadhanaContext';
import { toDateKey } from '@/contexts/UserActivityContext';
import { resolveSadhanaToday } from '@/data/sadhana/progress';
import { getProgram } from '@/data/sadhana/programs';

const ENROLLMENTS_KEY = '@vedansh/sadhana';
const store: Record<string, string | null> = {};

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    store[k] = v;
    return Promise.resolve();
  }),
}));

const today = toDateKey(new Date());
const GITA = getProgram('gita-18')!;

function mountProbe() {
  let value!: ReturnType<typeof useSadhana>;
  function Probe() {
    value = useSadhana();
    return null;
  }
  act(() => {
    TestRenderer.create(
      <SadhanaProvider>
        <Probe />
      </SadhanaProvider>
    );
  });
  return () => value;
}

beforeEach(() => {
  for (const k of Object.keys(store)) delete store[k];
  jest.clearAllMocks();
});

describe('SadhanaContext — enrollment lifecycle', () => {
  it('enrolls, starting today with no completed days', async () => {
    const get = mountProbe();
    await act(async () => undefined);

    act(() => get().enroll('gita-18'));
    const e = get().enrollmentFor('gita-18');
    expect(e?.status).toBe('active');
    expect(e?.startedOn).toBe(today);
    expect(Object.keys(e!.completedDays)).toHaveLength(0);
    // Persisted.
    expect(store[ENROLLMENTS_KEY]).toContain('gita-18');
  });

  it('ignores an unknown program id', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    act(() => get().enroll('does-not-exist'));
    expect(get().enrollmentFor('does-not-exist')).toBeUndefined();
  });

  it('commitDay advances the vow and is idempotent per day', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    act(() => get().enroll('gita-18'));

    act(() => get().commitDay('gita-18', 1, 'read-to-end'));
    expect(Object.keys(get().enrollmentFor('gita-18')!.completedDays)).toHaveLength(1);
    // Re-committing the same day is a no-op.
    act(() => get().commitDay('gita-18', 1, 'marked'));
    expect(Object.keys(get().enrollmentFor('gita-18')!.completedDays)).toHaveLength(1);
    expect(get().enrollmentFor('gita-18')!.completedDays[1].via).toBe('read-to-end');
  });

  it('completing the final day flips status to completed with completedOn', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    act(() => get().enroll('gita-18'));

    for (let d = 1; d <= 18; d++) {
      act(() => get().commitDay('gita-18', d, 'read-to-end'));
    }
    const e = get().enrollmentFor('gita-18')!;
    expect(e.status).toBe('completed');
    expect(e.completedOn).toBe(today);
    // Resolver agrees it is done.
    expect(resolveSadhanaToday(e, GITA, today).kind).toBe('completed');
  });

  it('abandon removes it from active enrollments; re-enroll resets a clean vow', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    act(() => get().enroll('gita-18'));
    act(() => get().commitDay('gita-18', 1, 'read-to-end'));

    act(() => get().abandon('gita-18'));
    expect(get().enrollmentFor('gita-18')!.status).toBe('abandoned');
    expect(get().activeEnrollments.find((e) => e.programId === 'gita-18')).toBeUndefined();

    act(() => get().enroll('gita-18'));
    const e = get().enrollmentFor('gita-18')!;
    expect(e.status).toBe('active');
    expect(Object.keys(e.completedDays)).toHaveLength(0);
  });

  it('hydrates persisted enrollments on mount', async () => {
    store[ENROLLMENTS_KEY] = JSON.stringify([
      { programId: 'hanuman-41', startedOn: today, status: 'active', completedDays: { 1: { at: today, via: 'marked' } } },
    ]);
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().enrollmentFor('hanuman-41')?.status).toBe('active');
    expect(Object.keys(get().enrollmentFor('hanuman-41')!.completedDays)).toHaveLength(1);
  });

  it('celebration gate marks a completed program once', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().wasCelebrated('gita-18')).toBe(false);
    act(() => get().markCelebrated('gita-18'));
    expect(get().wasCelebrated('gita-18')).toBe(true);
  });

  it('day celebration gate marks one sankalp day only for today', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().wasDayCelebrated('gita-18', 2)).toBe(false);
    act(() => get().markDayCelebrated('gita-18', 2));
    expect(get().wasDayCelebrated('gita-18', 2)).toBe(true);
    expect(get().wasDayCelebrated('gita-18', 3)).toBe(false);
  });

  it('reminder toggle persists per program', async () => {
    const get = mountProbe();
    await act(async () => undefined);
    expect(get().isReminderEnabled('hanuman-41')).toBe(false);
    act(() => get().setReminderEnabled('hanuman-41', true));
    expect(get().isReminderEnabled('hanuman-41')).toBe(true);
    expect(get().reminderProgramIds).toEqual(['hanuman-41']);
    act(() => get().setReminderEnabled('hanuman-41', false));
    expect(get().isReminderEnabled('hanuman-41')).toBe(false);
  });
});
