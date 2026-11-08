import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, AppState, Text } from 'react-native';
import * as ReactNative from 'react-native';
import type { AppStateStatus } from 'react-native';
import { Circle, Path, Rect } from 'react-native-svg';
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
function display(running = false, count = 0, cycleMs?: number) {
  return <ThemeProvider><JapamInfinity count={count} size={230} running={running} cycleMs={cycleMs} onCycle={onCycle}
    hint={running ? 'Tap to pause' : 'Tap to start'} labelFontFamily="test-font" /></ThemeProvider>;
}
async function mount(running = false, count = 0) {
  await act(async () => { tree = TestRenderer.create(display(running, count)); });
}

test('opening is still; start repeats full loops until pause', async () => {
  await mount(false, 107);
  expect(start).not.toHaveBeenCalled();
  await act(async () => { tree.update(display(true, 107)); });
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ toValue: 1, duration: 1380, useNativeDriver: true, isInteraction: false }));
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

test('the loop is borderless on the page parchment with legible sepia numbers', async () => {
  // Standard system text: the numbers sit inside the loops, on the panel.
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  await mount(false, 11);
  const panel = tree.root.findAll(n => n.props.testID === 'japam-infinity-panel')[0];
  const { lightColors } = jest.requireActual('@/theme/colors');
  const style = ReactNative.StyleSheet.flatten(panel.props.style);
  expect(style.backgroundColor).toBeUndefined();
  expect(style.borderWidth ?? 0).toBe(0);
  expect(style.borderRadius ?? 0).toBe(0);
  expect(style.shadowOpacity ?? 0).toBe(0);
  expect(style.elevation ?? 0).toBe(0);
  expect(tree.root.findAllByType(Rect)).toHaveLength(0);
  expect(tree.root.findAllByType(Path).find(n => n.props.strokeWidth === 12)?.props.stroke).toBe(lightColors.saffronDeep);
  expect(tree.root.findAllByType(Circle).find(n => n.props.r === 6)?.props.stroke).toBe(lightColors.saffronDeep);
  const numbers = tree.root.findAllByType(Text).filter(n => n.props.children === 11 || n.props.children === 108);
  expect(numbers.map(n => ReactNative.StyleSheet.flatten(n.props.style).color)).toEqual([lightColors.inkSoft, lightColors.inkSoft]);
});

function ringDisplay(ringsActive = true, text = 'सीता राम', count = 11, running = true) {
  return <ThemeProvider><JapamInfinity count={count} size={300} running={running} onCycle={onCycle}
    hint="Tap to start" labelFontFamily="test-font" ringText={text} ringsActive={ringsActive} /></ThemeProvider>;
}
function measureRingWords() {
  // Fire each hidden measurer's layout, as the native text engine would.
  for (const t of tree.root.findAllByType(Text).filter((n) => typeof n.props.onLayout === 'function')) {
    act(() => t.props.onLayout({ nativeEvent: { layout: { width: 20 * String(t.props.children).length, height: 24, x: 0, y: 0 } } }));
  }
}

test('the ornamental mandala turns on the native driver and rests on pause or blur', async () => {
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  await act(async () => { tree = TestRenderer.create(ringDisplay()); });
  measureRingWords();
  const words = tree.root.findAllByType(Text).filter((n) => ['सी', 'ता', 'रा', 'म', '॥'].includes(n.props.children) && !n.props.onLayout);
  expect(words.length).toBeGreaterThan(12);
  expect(tree.root.findAll(n => n.props.testID === 'japam-mandala-frame').length).toBeGreaterThan(0);
  expect(words.every((n) => n.props.allowFontScaling === false && n.props.numberOfLines === 1)).toBe(true);
  const ringTimings = (Animated.timing as jest.Mock).mock.calls.filter(([, c]) => c.duration === 56000 || c.duration === 72000);
  expect(ringTimings.length).toBe(2); // two concentric native rotations
  expect(ringTimings.every(([, c]) => c.useNativeDriver === true)).toBe(true);
  expect(onCycle).not.toHaveBeenCalled();
  await act(async () => { tree.update(ringDisplay(false)); });
  expect(stop).toHaveBeenCalled();
});

test('Reduced Motion keeps the mantra rings still', async () => {
  mockReduced = true;
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  await act(async () => { tree = TestRenderer.create(ringDisplay()); });
  measureRingWords();
  expect(tree.root.findAll((n) => n.props.testID === 'japam-mandala-band').length).toBeGreaterThan(0);
  expect((Animated.timing as jest.Mock).mock.calls.some(([, c]) => c.duration === 56000)).toBe(false);
});

test('the compact count is inside the infinity and the full reading occupies its former row', async () => {
  await act(async () => { tree = TestRenderer.create(<ThemeProvider>
    <JapamInfinity count={107} size={340} hint="Tap to start" labelFontFamily="test-font"
      running={false} onCycle={onCycle} ringText="सीता राम" reading={<Text>Complete reading</Text>} />
  </ThemeProvider>); });
  measureRingWords();
  expect(tree.root.findAll(node => node.props.testID === 'japam-infinity-count')).toHaveLength(0);
  const current = tree.root.findAll(node => node.props.testID === 'japam-infinity-current')[0];
  const total = tree.root.findAll(node => node.props.testID === 'japam-infinity-total')[0];
  expect(current.props.children).toBe(107);
  expect(total.props.children).toBe(108);
  expect(current.props.fontSize).toBeLessThanOrEqual(150);
  expect(total.props.fontSize).toBeLessThanOrEqual(125);
  const order = tree.root.findAll(node => ['japam-infinity-panel', 'japam-infinity-reading'].includes(node.props.testID));
  expect(order[0].props.testID).toBe('japam-infinity-panel');
  expect(order[order.length - 1].props.testID).toBe('japam-infinity-reading');
});

test('repeated background and foreground transitions leave no stale ring work after cleanup', async () => {
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  await act(async () => { tree = TestRenderer.create(ringDisplay()); });
  measureRingWords();
  expect(start).toHaveBeenCalledTimes(3);
  for (let i = 0; i < 25; i++) {
    const stale = completions.slice(-3);
    const started = start.mock.calls.length;
    const stopped = stop.mock.calls.length;
    await act(async () => { onState('background'); });
    expect(stop.mock.calls.length - stopped).toBe(3);
    act(() => stale.forEach(complete => complete({ finished: true })));
    expect(start).toHaveBeenCalledTimes(started);
    await act(async () => { onState('active'); });
    expect(start).toHaveBeenCalledTimes(started + 3);
  }
  const late = completions.slice(-3);
  const started = start.mock.calls.length;
  act(() => tree.unmount());
  act(() => late.forEach(complete => complete({ finished: true })));
  expect(start).toHaveBeenCalledTimes(started);
  expect(onCycle).not.toHaveBeenCalled();
  expect(remove).toHaveBeenCalled();
});


test('count updates reuse the native interpolation graph instead of allocating it again', async () => {
  const interpolate = jest.spyOn(Animated.Value.prototype, 'interpolate');
  await mount(true);
  const initial = interpolate.mock.calls.length;
  expect(initial).toBeGreaterThan(0);
  for (let count = 1; count <= 108; count++) {
    await act(async () => { tree.update(display(true, count % 108)); });
  }
  expect(interpolate).toHaveBeenCalledTimes(initial);
  expect(start).toHaveBeenCalledTimes(1);
});

test('count changes do not re-render decorative mantra words or recreate their animations', async () => {
  jest.spyOn(ReactNative.Dimensions, 'get').mockReturnValue({ width: 390, height: 844, scale: 3, fontScale: 1 });
  await act(async () => { tree = TestRenderer.create(ringDisplay()); });
  measureRingWords();
  const before = tree.root.findAll(n => n.props.testID === 'japam-mandala-band').map(n => n.props.style);
  expect(before.length).toBeGreaterThan(0);
  const starts = start.mock.calls.length;
  await act(async () => { tree.update(ringDisplay(true, 'सीता राम', 12)); });
  const after = tree.root.findAll(n => n.props.testID === 'japam-mandala-band').map(n => n.props.style);
  after.forEach((style, i) => expect(style).toBe(before[i]));
  expect(start).toHaveBeenCalledTimes(starts);
  expect((Animated.timing as jest.Mock).mock.calls.every(([, config]) => config.isInteraction === false)).toBe(true);
});


test('a longer mantra uses its own duration and a tempo change resumes the remaining fraction', async () => {
  await act(async () => { tree = TestRenderer.create(display(true, 0, 10200)); });
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ duration: 10200 }));
  jest.spyOn(Animated.Value.prototype, 'stopAnimation').mockImplementation(callback => callback?.(0.25));
  await act(async () => { tree.update(display(true, 0, 6800)); });
  expect(stop).toHaveBeenCalled();
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ duration: 5100 }));
  act(() => completions[0]({ finished: true }));
  expect(onCycle).not.toHaveBeenCalled();
  act(() => completions[1]({ finished: true }));
  expect(onCycle).toHaveBeenCalledTimes(1);
  expect(Animated.timing).toHaveBeenLastCalledWith(expect.anything(), expect.objectContaining({ duration: 6800 }));
});
