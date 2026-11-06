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
const onCycle = jest.fn();
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
  return <ThemeProvider><JapamInfinity count={count} size={230} running={running} onCycle={onCycle}
    hint={running ? 'Tap to pause' : 'Tap to start'} labelFontFamily="test-font" /></ThemeProvider>;
}
async function mount(running = false, count = 0) {
  await act(async () => { tree = TestRenderer.create(display(running, count)); });
}

test('opening is still; start repeats full loops until pause', async () => {
  await mount(false, 107);
  expect(start).not.toHaveBeenCalled();
  await act(async () => { tree.update(display(true, 107)); });
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 1, duration: 880, useNativeDriver: true }));
  for (let i = 0; i < 5; i++) act(() => completions[i]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(6);
  expect(onCycle).toHaveBeenCalledTimes(5);
  await act(async () => { tree.update(display(false, 107)); });
  expect(stop).toHaveBeenCalled();
  act(() => completions[5]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(6);
  expect(onCycle).toHaveBeenCalledTimes(5);
});

test('audio count updates and rollover do not restart or stop continuous motion', async () => {
  await mount(true, 107);
  await act(async () => { tree.update(display(true, 0)); });
  expect(start).toHaveBeenCalledTimes(1);
  expect(stop).not.toHaveBeenCalled();
});

test('Reduced Motion keeps count cycles active while the marker remains still', async () => {
  mockReduced = true;
  await mount(true);
  expect(start).toHaveBeenCalledTimes(1);
  const marker = tree.root.findAll(n => n.props.testID === 'japam-infinity-marker')[0];
  expect(ReactNative.StyleSheet.flatten(marker.props.style).transform).toEqual([{ translateX: 95 }, { translateY: 54.75 }]);
  act(() => completions[0]({ finished: true }));
  expect(onCycle).toHaveBeenCalledTimes(1);
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

test('the loop sits on a dark night panel so the path, jyoti and numbers stand apart from the parchment', async () => {
  // Standard system text: the numbers sit inside the loops, on the panel.
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  await mount(false, 11);
  const panel = tree.root.findAll(n => n.props.testID === 'japam-infinity-panel')[0];
  const { lightColors } = jest.requireActual('@/theme/colors');
  expect(ReactNative.StyleSheet.flatten(panel.props.style).backgroundColor).toBe(lightColors.skyNightTop);
  const numbers = tree.root.findAllByType(Text).filter(n => n.props.children === 11 || n.props.children === 108);
  expect(numbers.map(n => ReactNative.StyleSheet.flatten(n.props.style).color)).toEqual([lightColors.nightInk, lightColors.nightGold]);
});
