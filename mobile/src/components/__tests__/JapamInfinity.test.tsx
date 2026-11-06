import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, AppState, Text } from 'react-native';
import * as ReactNative from 'react-native';
import type { AppStateStatus } from 'react-native';
import JapamInfinity from '../JapamInfinity';
import { ThemeProvider } from '@/theme/ThemeContext';

let mockReduced = false;
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => mockReduced }));
let tree: TestRenderer.ReactTestRenderer;
let onState: (state: AppStateStatus) => void;
const start = jest.fn();
const stop = jest.fn();
const remove = jest.fn();
let completions: ((result: { finished: boolean }) => void)[];
beforeEach(() => {
  mockReduced = false;
  completions = [];
  start.mockImplementation((callback) => { completions.push(callback); });
  jest.spyOn(Animated, 'timing').mockImplementation(() => ({ start, stop, reset: jest.fn() }));
  jest.spyOn(Animated.Value.prototype, 'stopAnimation').mockImplementation((callback) => callback?.(0));
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    onState = listener;
    return { remove };
  });
});
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); jest.clearAllMocks(); });
function display(running = false, count = 0) {
  return <ThemeProvider><JapamInfinity count={count} size={230} running={running}
    hint={running ? 'Tap to pause' : 'Tap to start'} labelFontFamily="test-font" /></ThemeProvider>;
}
async function mount(running = false, count = 0) {
  await act(async () => { tree = TestRenderer.create(display(running, count)); });
}

test('opening is still; start repeats full loops until pause', async () => {
  await mount(false, 107);
  expect(start).not.toHaveBeenCalled();
  await act(async () => { tree.update(display(true, 107)); });
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 1, duration: 800, useNativeDriver: true }));
  for (let i = 0; i < 5; i++) act(() => completions[i]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(6);
  await act(async () => { tree.update(display(false, 107)); });
  expect(stop).toHaveBeenCalled();
  act(() => completions[5]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(6);
});

test('audio count updates and rollover do not restart or stop continuous motion', async () => {
  await mount(true, 107);
  await act(async () => { tree.update(display(true, 0)); });
  expect(start).toHaveBeenCalledTimes(1);
  expect(stop).not.toHaveBeenCalled();
});

test('Reduced Motion suppresses motion without changing the control state', async () => {
  mockReduced = true;
  await mount(true);
  expect(start).not.toHaveBeenCalled();
  expect(tree.root.findAllByType(Text).some(n => n.props.children === 'Tap to pause')).toBe(true);
});

test('backgrounding suspends motion; foreground resumes only when still started', async () => {
  await mount(true);
  expect(start).toHaveBeenCalledTimes(1);
  await act(async () => { onState('background'); });
  expect(stop).toHaveBeenCalled();
  act(() => completions[0]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(1);
  await act(async () => { onState('active'); });
  expect(start).toHaveBeenCalledTimes(2);
  await act(async () => { tree.update(display(false)); });
  await act(async () => { onState('background'); onState('active'); });
  expect(start).toHaveBeenCalledTimes(2);
  act(() => tree.unmount());
  expect(remove).toHaveBeenCalled();
});

test('compact screens with enlarged text move untruncated numbers below the loops', async () => {
  jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 2 });
  await mount(false, 107);
  const row = tree.root.findAllByType(Text).find((n) => [n.props.children].flat().join('') === '107 / 108');
  expect(row).toBeDefined();
  expect(row?.props.adjustsFontSizeToFit).toBeUndefined();
  expect(row?.props.numberOfLines).toBeUndefined();
});
