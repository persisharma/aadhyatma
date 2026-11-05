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
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    onState = listener;
    return { remove };
  });
});
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); jest.clearAllMocks(); });
function display(count: number, rounds = 0, hydrated = true) {
  return <ThemeProvider><JapamInfinity count={count} rounds={rounds} size={230} hydrated={hydrated}
    hint="Tap to chant" labelFontFamily="test-font" /></ThemeProvider>;
}
async function mount(count = 0, rounds = 0, hydrated = true) {
  await act(async () => { tree = TestRenderer.create(display(count, rounds, hydrated)); });
}

test('restored progress is still; one chant runs a full infinity swing even at rollover', async () => {
  await mount(0, 0, false);
  await act(async () => { tree.update(display(107, 2, true)); });
  expect(start).not.toHaveBeenCalled();
  await act(async () => { tree.update(display(0, 3)); });
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 1, duration: 800, useNativeDriver: true }));
  expect(start).toHaveBeenCalledTimes(1);
});

test('rapid taps queue a full swing each instead of cutting the current one short', async () => {
  await mount();
  await act(async () => { tree.update(display(1)); });
  await act(async () => { tree.update(display(3)); });
  expect(start).toHaveBeenCalledTimes(1);
  expect(stop).not.toHaveBeenCalled();
  act(() => completions[0]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(2);
  act(() => completions[1]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(3);
  act(() => completions[2]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(3);
});

test('reset cancels queued swings and ignores a late native completion', async () => {
  await mount();
  await act(async () => { tree.update(display(3)); });
  expect(start).toHaveBeenCalledTimes(1);
  await act(async () => { tree.update(display(0)); });
  expect(stop).toHaveBeenCalled();
  act(() => completions[0]({ finished: true }));
  expect(start).toHaveBeenCalledTimes(1);
  await act(async () => { tree.update(display(1)); });
  expect(start).toHaveBeenCalledTimes(2);
});

test('reduced motion never starts a movement; resets do not animate backwards', async () => {
  mockReduced = true;
  await mount(5);
  await act(async () => { tree.update(display(6)); });
  expect(start).not.toHaveBeenCalled();
  mockReduced = false;
  await act(async () => { tree.update(display(0)); });
  expect(start).not.toHaveBeenCalled();
});

test('backgrounding cancels movement and unmount removes its listener', async () => {
  await mount();
  await act(async () => { tree.update(display(1)); });
  expect(start).toHaveBeenCalledTimes(1);
  await act(async () => { onState('background'); });
  expect(stop).toHaveBeenCalled();
  await act(async () => { tree.update(display(2)); });
  expect(start).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
  expect(remove).toHaveBeenCalled();
});

test('the complete hint can grow instead of truncating', async () => {
  await mount();
  const hint = tree.root.findAllByType(Text).find((n) => n.props.children === 'Tap to chant');
  expect(hint?.props.numberOfLines).toBeUndefined();
});

test('compact screens with enlarged system text move numbers below the loops', async () => {
  jest.spyOn(ReactNative, 'useWindowDimensions').mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 2 });
  await mount(107);
  const row = tree.root.findAllByType(Text).find((n) => [n.props.children].flat().join('') === '107 / 108');
  expect(row).toBeDefined();
  expect(row?.props.adjustsFontSizeToFit).toBeUndefined();
  expect(row?.props.numberOfLines).toBeUndefined();
});
