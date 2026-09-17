import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { AppState, Text, Pressable, type AppStateStatus } from 'react-native';
import { useRashifalDay } from '../useRashifalDay';
import { indiaDateKey } from '../kundali';

function Probe() {
  const { date, setOffset } = useRashifalDay();
  return <><Text>{indiaDateKey(date)}</Text><Pressable testID="tomorrow" onPress={() => setOffset(1)} /></>;
}

afterEach(() => { jest.useRealTimers(); jest.restoreAllMocks(); });

test('uses India midnight regardless of device timezone and preserves the relative day selection', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-12-31T18:29:59Z'));
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe />); });
  expect(tree.root.findByType(Text).props.children).toBe('2026-12-31');
  act(() => tree.root.findByProps({ testID: 'tomorrow' }).props.onPress());
  expect(tree.root.findByType(Text).props.children).toBe('2027-01-01');
  act(() => jest.advanceTimersByTime(2_100));
  expect(tree.root.findByType(Text).props.children).toBe('2027-01-02');
  act(() => tree.unmount());
  expect(jest.getTimerCount()).toBe(0);
});

test('foregrounding after several days refreshes and reschedules without accumulating timers', () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2026-09-07T10:00:00Z'));
  let onChange: (state: AppStateStatus) => void = () => {};
  const remove = jest.fn();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, handler) => {
    onChange = handler; return { remove };
  });
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<Probe />); });
  act(() => { jest.setSystemTime(new Date('2026-09-10T19:00:00Z')); onChange('active'); });
  expect(tree.root.findByType(Text).props.children).toBe('2026-09-11');
  expect(jest.getTimerCount()).toBe(1);
  act(() => tree.unmount());
  expect(remove).toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});
