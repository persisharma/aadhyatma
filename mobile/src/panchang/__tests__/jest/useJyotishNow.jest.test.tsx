import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, type AppStateStatus } from 'react-native';
import { computeKundali, getCurrentDasha } from '../../kundali';
import { useJyotishNow } from '../../useJyotishNow';

jest.mock('@react-navigation/native', () => ({ useFocusEffect: (callback: () => void) => mockReact.useEffect(callback, [callback]) }));
const chart = computeKundali({ date: new Date('1992-08-14T00:12:00Z'), latitude: 23.1833, longitude: 75.7833, timezone: 'Asia/Kolkata' });
let shown: Date;
function Probe() { shown = useJyotishNow(chart); return null; }

afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('an open reading advances across India midnight and clears its clock on unmount', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-21T18:29:59Z'));
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe />); });
  const before = shown!.getTime();
  act(() => { jest.advanceTimersByTime(1002); });
  expect(shown!.getTime()).toBeGreaterThan(before);
  expect(shown!.toISOString().slice(11, 19)).toBe('18:30:00');
  act(() => tree.unmount());
  expect(jest.getTimerCount()).toBe(0);
});

test('exact dasha edge refreshes before midnight; foreground refreshes stale state', () => {
  jest.useFakeTimers();
  const edge = getCurrentDasha(chart, new Date('2026-09-21T06:30:00Z'))!.maha.end;
  jest.setSystemTime(new Date(edge.getTime() - 1000));
  let foreground!: (state: AppStateStatus) => void;
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, cb) => { foreground = cb; return { remove }; });
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe />); });
  expect(getCurrentDasha(chart, shown!)!.maha.lord).toBe('jupiter');
  act(() => { jest.advanceTimersByTime(1002); });
  expect(getCurrentDasha(chart, shown!)!.maha.lord).toBe('saturn');
  jest.setSystemTime(new Date('2029-01-01T06:30:00Z'));
  act(() => foreground('active'));
  expect(shown!.toISOString()).toBe('2029-01-01T06:30:00.000Z');
  act(() => tree.unmount());
  expect(remove).toHaveBeenCalled();
});
