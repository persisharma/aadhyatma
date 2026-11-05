import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, AppState, Text } from 'react-native';
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
beforeEach(() => {
  mockReduced = false;
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

test('restored progress is still; real chants animate continuously through rollover', async () => {
  await mount(0, 0, false);
  await act(async () => { tree.update(display(107, 2, true)); });
  expect(start).not.toHaveBeenCalled();
  await act(async () => { tree.update(display(0, 3)); });
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 3, useNativeDriver: true }));
  expect(start).toHaveBeenCalledTimes(1);
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
