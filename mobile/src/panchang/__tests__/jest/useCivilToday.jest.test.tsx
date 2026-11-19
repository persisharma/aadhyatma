/**
 * `useCivilToday` — the Panchang's "today" must move on its own.
 *
 * Screens used to read `new Date()` once at mount, so after a night in the
 * background the Panchang kept yesterday selected and My Vrat labelled
 * tomorrow's vrat "Today". The day is India's (IST), so it rolls over at
 * 18:30 UTC whatever zone the phone is set to.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { useCivilToday, useCivilTodayKey } from '../../useCivilToday';

let key = '';
let label: Date = new Date(0);
function Probe() {
  key = useCivilTodayKey();
  label = useCivilToday();
  return null;
}
const ymd = (d: Date) => `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

// The probe mounts two hook instances, so there are two listeners.
let appStateListeners: ((state: string) => void)[] = [];
const onAppState = (state: string) => appStateListeners.forEach((listener) => listener(state));
let tree: TestRenderer.ReactTestRenderer;

beforeEach(() => {
  jest.useFakeTimers();
  appStateListeners = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation(((_: string, cb: (s: string) => void) => {
    appStateListeners.push(cb);
    return { remove: jest.fn() };
  }) as unknown as typeof AppState.addEventListener);
});

afterEach(() => {
  act(() => tree?.unmount());
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('reads India\'s date, not the instant\'s UTC or device date', () => {
  // 23:30 IST on 17 Nov = 18:00 UTC on 17 Nov.
  jest.setSystemTime(new Date('2026-11-17T18:00:00Z'));
  act(() => { tree = TestRenderer.create(<Probe />); });
  expect(key).toBe('2026-11-17');
  expect(ymd(label)).toBe('2026-11-17');
});

test('rolls over just past the civil midnight while the app is open', () => {
  jest.setSystemTime(new Date('2026-11-17T18:00:00Z')); // 23:30 IST
  act(() => { tree = TestRenderer.create(<Probe />); });
  const before = label;

  act(() => { jest.advanceTimersByTime(29 * 60_000); }); // 23:59 IST
  expect(key).toBe('2026-11-17');
  expect(label).toBe(before); // a stable label while the day has not changed

  act(() => { jest.advanceTimersByTime(2 * 60_000); }); // 00:01 IST, 18 Nov
  expect(key).toBe('2026-11-18');
  expect(ymd(label)).toBe('2026-11-18');

  // …and keeps ticking: the next midnight is rescheduled, not a one-shot.
  act(() => { jest.advanceTimersByTime(24 * 60 * 60_000); });
  expect(key).toBe('2026-11-19');
});

test('re-checks the day when the app returns from the background', () => {
  jest.setSystemTime(new Date('2026-11-17T12:00:00Z'));
  act(() => { tree = TestRenderer.create(<Probe />); });
  expect(key).toBe('2026-11-17');

  // A night in the background: JS timers never fired, the clock moved on.
  jest.setSystemTime(new Date('2026-11-18T03:00:00Z'));
  act(() => { onAppState('background'); });
  expect(key).toBe('2026-11-17');
  act(() => { onAppState('active'); });
  expect(key).toBe('2026-11-18');
  expect(ymd(label)).toBe('2026-11-18');
});
