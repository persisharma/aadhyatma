/**
 * Today's Practice must follow the calendar while the app stays open.
 *
 * `useRoutineToday` reads `new Date()` inside a memo whose dependencies carried
 * no day key, so a process that survived midnight kept listing YESTERDAY's
 * weekday items (and their done state) until something else re-rendered it.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { RoutineProvider } from '@/contexts/RoutineContext';
import { ReadingProgressProvider } from '@/contexts/ReadingProgressContext';
import { UserActivityProvider } from '@/contexts/UserActivityContext';
import { useRoutineToday } from '@/data/routine/useRoutineToday';
import type { Routine } from '@/data/routine/types';

const store: Record<string, string | null> = {};
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(store[k] ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    store[k] = v;
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    delete store[k];
    return Promise.resolve();
  }),
  multiGet: jest.fn((keys: string[]) => Promise.resolve(keys.map((k) => [k, store[k] ?? null]))),
}));

// 17 Nov 2026 is a Tuesday (2); the item below runs on Tuesdays only.
const routine: Routine = {
  id: 'r1',
  nameHi: 'प्रातः',
  nameEn: 'Morning',
  mode: 'weekday',
  createdAt: 1,
  items: [{ id: 'tue', kind: 'section', sourceId: 'hanuman-chalisa', weekdays: [2] }],
};

let summary!: ReturnType<typeof useRoutineToday>;
function Probe() {
  summary = useRoutineToday();
  return null;
}

test('the weekday schedule moves to the new day at midnight while the app stays open', async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 10, 17, 22, 0, 0));
  store['@vedansh/routines'] = JSON.stringify([routine]);
  let tree!: TestRenderer.ReactTestRenderer;
  try {
    await act(async () => {
      tree = TestRenderer.create(
        <UserActivityProvider>
          <ReadingProgressProvider>
            <RoutineProvider>
              <Probe />
            </RoutineProvider>
          </ReadingProgressProvider>
        </UserActivityProvider>
      );
    });
    await act(async () => undefined);
    expect(summary.entries.map((e) => e.item.id)).toEqual(['tue']);

    // Wednesday 02:00 — same process.
    act(() => {
      jest.advanceTimersByTime(4 * 60 * 60 * 1000);
    });
    expect(summary.entries).toEqual([]);
    expect(summary.hasRoutine).toBe(true);
  } finally {
    act(() => tree?.unmount());
    jest.useRealTimers();
  }
});
