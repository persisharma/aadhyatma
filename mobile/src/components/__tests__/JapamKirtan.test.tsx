import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, AppState } from 'react-native';
import * as ReactNative from 'react-native';
import type { AppStateStatus } from 'react-native';
import JapamKirtan from '../JapamKirtan';
import type { KirtanFigure } from '../japamKirtanFigure';
import { ThemeProvider } from '@/theme/ThemeContext';

let mockReduced = false;
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => mockReduced }));
let tree: TestRenderer.ReactTestRenderer;
let onState: (state: AppStateStatus) => void;
const start = jest.fn();
const stop = jest.fn();
const onCycle = jest.fn();
let completions: { duration: number; done: (result: { finished: boolean }) => void }[];
beforeEach(() => {
  mockReduced = false;
  completions = [];
  jest.spyOn(Animated, 'timing').mockImplementation((_value, config) => ({
    start: (done?: (result: { finished: boolean }) => void) => { start(config.duration); completions.push({ duration: config.duration as number, done: done ?? (() => undefined) }); },
    stop, reset: jest.fn(),
  }));
  jest.spyOn(Animated.Value.prototype, 'stopAnimation').mockImplementation((callback) => callback?.(0));
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => { onState = listener; return { remove: jest.fn() }; });
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
});
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); jest.clearAllMocks(); });
function view(running: boolean, figure: KirtanFigure = 'hanuman', count = 11) {
  return <ThemeProvider><JapamKirtan figure={figure} count={count} size={300} running={running} onCycle={onCycle}
    hint={running ? 'Tap to pause' : 'Tap to start'} labelFontFamily="test-font" /></ThemeProvider>;
}
const beats = () => completions.filter((c) => c.duration === 880);

test('opening is still; each completed beat (one manjira clash) counts once, and pause stops counting', async () => {
  await act(async () => { tree = TestRenderer.create(view(false)); });
  expect(start).not.toHaveBeenCalled();
  await act(async () => { tree.update(view(true)); });
  expect(start).toHaveBeenCalledWith(880);
  expect(start).toHaveBeenCalledWith(1760); // the decorative two-beat sway
  for (let i = 0; i < 3; i++) act(() => beats()[i].done({ finished: true }));
  expect(onCycle).toHaveBeenCalledTimes(3);
  await act(async () => { tree.update(view(false)); });
  expect(stop).toHaveBeenCalled();
  act(() => beats()[3].done({ finished: true }));
  expect(onCycle).toHaveBeenCalledTimes(3);
});

test('sway cycles never count', async () => {
  await act(async () => { tree = TestRenderer.create(view(true)); });
  act(() => completions.find((c) => c.duration === 1760)!.done({ finished: true }));
  expect(onCycle).not.toHaveBeenCalled();
});

test('Reduced Motion keeps the figure still while beats still count', async () => {
  mockReduced = true;
  await act(async () => { tree = TestRenderer.create(view(true)); });
  expect(start).toHaveBeenCalledWith(880);
  expect(start).not.toHaveBeenCalledWith(1760);
  const parts = tree.root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('japam-kirtan-') && n.props.style?.transform);
  for (const p of parts) {
    const t = ReactNative.StyleSheet.flatten(p.props.style).transform;
    for (const step of t) expect(Object.values(step).every((v) => v === '0deg' || v === 0)).toBe(true);
  }
  act(() => beats()[0].done({ finished: true }));
  expect(onCycle).toHaveBeenCalledTimes(1);
});

test('backgrounding suspends the beat without catching up', async () => {
  await act(async () => { tree = TestRenderer.create(view(true)); });
  await act(async () => { onState('background'); });
  act(() => beats()[0].done({ finished: true }));
  expect(onCycle).not.toHaveBeenCalled();
});

test.each(['hanuman', 'child', 'sadhu'] as const)('%s renders on the night panel with the count below', async (figure) => {
  await act(async () => { tree = TestRenderer.create(view(false, figure, 57)); });
  expect(tree.root.findAll((n) => n.props.testID === 'japam-kirtan-figure').length).toBeGreaterThan(0);
  expect(tree.root.findAllByType(ReactNative.Text).some((n) => [n.props.children].flat().join('') === '57 / 108')).toBe(true);
});
