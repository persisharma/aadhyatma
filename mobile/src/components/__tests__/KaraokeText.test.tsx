import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Animated, StyleSheet, Text, View } from 'react-native';
import KaraokeText from '../KaraokeText';

let mockReduced = false;
jest.mock('@/utils/useReducedMotion', () => ({ useReducedMotion: () => mockReduced }));
let tree: TestRenderer.ReactTestRenderer | undefined;
const color = '#1A0E03';
const highlightColor = '#8A3E0B';
beforeEach(() => { mockReduced = false; });
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); tree = undefined; });
const common = { color, highlightColor, fontFamily: 'test-font', fontSize: 24, lineHeight: 40 };
/** How far a word's highlight copy has faded in (0 = base colour, 1 = highlight). */
function value(word: TestRenderer.ReactTestInstance) {
  const reveal = StyleSheet.flatten(word.props.style).opacity;
  return typeof reveal === 'number' ? reveal : reveal.__getValue();
}

test('one host phase colours whole words in order and resets/pauses without its own clock', async () => {
  const progress = new Animated.Value(0);
  await act(async () => { tree = TestRenderer.create(<KaraokeText lines={['aa bb cc']} progress={progress} {...common} />); });
  const words = tree!.root.findAllByType(Animated.Text);
  const initial = value(words[0]);
  act(() => progress.setValue(1));
  const completed = value(words[0]);
  expect(completed).not.toBe(initial);
  expect(value(words[2])).toBe(completed);
  act(() => progress.setValue(0.5));
  expect(value(words[0])).toBe(completed);
  expect(value(words[2])).toBe(initial);
  const paused = words.map(value);
  expect(words.map(value)).toEqual(paused); // No independent timer advances it.
  act(() => progress.setValue(0));
  expect(words.every(word => value(word) === initial)).toBe(true);
});

test('counter/host renders reuse word interpolation nodes and complete accessible text', async () => {
  const progress = new Animated.Value(0);
  const interpolate = jest.spyOn(progress, 'interpolate');
  const lines = ['हरे कृष्ण हरे कृष्ण', 'राम राम हरे हरे'];
  const display = (tick: number) => <View accessibilityLabel={`${tick}`}>
    <KaraokeText lines={lines} progress={progress} {...common} />
  </View>;
  await act(async () => { tree = TestRenderer.create(display(0)); });
  const builds = interpolate.mock.calls.length;
  expect(builds).toBe(8);
  for (let i = 1; i <= 108; i++) await act(async () => { tree!.update(display(i)); });
  expect(interpolate).toHaveBeenCalledTimes(builds);
  const root = tree!.root.findByProps({ testID: 'karaoke-text' });
  expect(root.props.accessibilityLabel).toBe(lines.join('\n'));
  for (const word of tree!.root.findAllByType(Animated.Text)) {
    expect(word.props.numberOfLines).toBeUndefined();
    expect(word.props.adjustsFontSizeToFit).toBeUndefined();
    expect(word.props.accessible).toBe(false);
  }
});

test('Reduced Motion leaves static readable text while the host keeps control of counting', async () => {
  mockReduced = true;
  const progress = new Animated.Value(0.5);
  const interpolate = jest.spyOn(progress, 'interpolate');
  await act(async () => { tree = TestRenderer.create(<KaraokeText lines={['राधा']} progress={progress} {...common} />); });
  expect(interpolate).not.toHaveBeenCalled();
  expect(tree!.root.findAllByType(Animated.Text)).toHaveLength(0);
  expect(StyleSheet.flatten(tree!.root.findByType(Text).props.style).color).toBe(color);
});

test('word colour is never a native-animated Text colour: the native driver cannot repaint text layout', async () => {
  // Regression: an interpolated `color` only changed when JS synced a finished
  // loop (whole passage at once) and never reset on the next native loop.
  const progress = new Animated.Value(0);
  await act(async () => { tree = TestRenderer.create(<KaraokeText lines={['ॐ नमः शिवाय']} progress={progress} {...common} />); });
  for (const text of tree!.root.findAllByType(Text)) {
    expect(typeof StyleSheet.flatten(text.props.style).color).toBe('string');
  }
  const highlights = tree!.root.findAllByType(Animated.Text);
  expect(highlights).toHaveLength(3);
  expect(highlights.every(h => StyleSheet.flatten(h.props.style).color === highlightColor)).toBe(true);
  expect(highlights.every(h => StyleSheet.flatten(h.props.style).position === 'absolute')).toBe(true);
  // Each highlight copy sits over a base run with the same complete word.
  const words = tree!.root.findAll(n => typeof n.props.testID === 'string' && /^karaoke-word-/.test(n.props.testID) && n.type === View);
  for (const word of words) {
    const [base, highlight] = word.findAllByType(Text);
    expect(highlight.props.children).toBe(base.props.children);
    expect(StyleSheet.flatten(base.props.style).color).toBe(color);
  }
});

test('styled passage blocks can use derived phases from one page clock', async () => {
  const page = new Animated.Value(0);
  const meaningPhase = page.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1], extrapolate: 'clamp' });
  await act(async () => { tree = TestRenderer.create(<KaraokeText lines={['meaning words']} progress={meaningPhase} {...common} />); });
  const words = tree!.root.findAllByType(Animated.Text);
  const initial = value(words[0]);
  act(() => page.setValue(0.4));
  expect(value(words[0])).toBe(initial);
  act(() => page.setValue(1));
  expect(words.every(word => value(word) !== initial)).toBe(true);
});
