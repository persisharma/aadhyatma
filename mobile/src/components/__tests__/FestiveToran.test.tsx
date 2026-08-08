import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import FestiveToran, { TORAN_HEIGHT } from '@/components/FestiveToran';
import { fontFamilies } from '@/theme/typography';

// Mutable so tests can flip the reading language and the reduce-motion state;
// both are read at render time inside the mocked hooks.
let mockLang: 'hi' | 'en' | 'gu' | 'kn' = 'hi';
let mockReduced = false;

jest.mock('@/data/gita/language', () => ({
  useGitaLanguage: () => ({ lang: mockLang }),
}));
jest.mock('@/utils/useReducedMotion', () => ({
  useReducedMotion: () => mockReduced,
}));

const GREETING = { greetingHi: 'शुभ दीपावली', greetingEn: 'Happy Diwali' };

// Fake timers, or the sway's Animated.loop keeps a real timer alive and jest
// never exits — the same reason RoutineCelebration.test.tsx fakes them.
beforeEach(() => {
  jest.useFakeTimers();
  mockLang = 'hi';
  mockReduced = false;
});
afterEach(() => {
  trees.forEach((t) => {
    act(() => {
      t.unmount();
    });
  });
  trees.length = 0;
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

const trees: TestRenderer.ReactTestRenderer[] = [];

function render() {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<FestiveToran {...GREETING} />);
  });
  trees.push(tree);
  return tree;
}

describe('FestiveToran', () => {

  test('hangs five marigolds and four leaves on the string', () => {
    const tree = render();
    // Host elements only — findAll otherwise counts each testID twice
    // (composite + host node).
    const flowers = tree.root.findAll(
      (n) => typeof n.type === 'string' && /^toran-flower-\d+$/.test(n.props.testID ?? '')
    );
    const leaves = tree.root.findAll(
      (n) => typeof n.type === 'string' && /^toran-leaf-\d+$/.test(n.props.testID ?? '')
    );
    expect(flowers).toHaveLength(5);
    expect(leaves).toHaveLength(4);
  });

  test('always occupies its reserved height so the Today strip never moves', () => {
    const tree = render();
    const wrap = tree.root.findByProps({ testID: 'festive-toran' });
    expect(StyleSheet.flatten(wrap.props.style).height).toBe(TORAN_HEIGHT);
  });

  test('renders the Hindi greeting in the Devanagari face', () => {
    const tree = render();
    const chipText = tree.root
      .findAllByType(Text)
      .find((n) => n.props.children === 'शुभ दीपावली');
    expect(chipText).toBeTruthy();
    // titleScriptFont keeps the Devanagari token for hi text — never a Latin
    // face, which would silently fall back for the conjuncts (design.md §3).
    const style = StyleSheet.flatten(chipText!.props.style);
    expect(style.fontFamily).not.toBe(fontFamilies.latin);
    expect(style.fontSize).toBeGreaterThanOrEqual(10);
  });

  test('renders the authored English greeting in en, and a re-scripted one in gu', () => {
    mockLang = 'en';
    const en = render();
    expect(
      en.root.findAllByType(Text).some((n) => n.props.children === 'Happy Diwali')
    ).toBe(true);

    mockLang = 'gu';
    const gu = render();
    const guText = gu.root
      .findAllByType(Text)
      .map((n) => n.props.children)
      .filter((c): c is string => typeof c === 'string')
      .find((c) => c.length > 0);
    expect(guText).toBeTruthy();
    // Re-scripted, not the Devanagari and not the English fallback.
    expect(guText).not.toBe('शुभ दीपावली');
    expect(guText).not.toBe('Happy Diwali');
    // Gujarati text renders in a Gujarati face (titleScriptFont picks the
    // SemiBold title cut for a heading-weight chip).
    const guNode = gu.root.findAllByType(Text).find((n) => n.props.children === guText);
    expect(StyleSheet.flatten(guNode!.props.style).fontFamily).toBe(fontFamilies.gujaratiBold);
  });

  test('the garland is decorative to accessibility; the chip carries the greeting', () => {
    const tree = render();
    const hidden = tree.root.findAll(
      (n) => n.props.accessibilityElementsHidden === true && n.props.importantForAccessibility === 'no-hide-descendants'
    );
    expect(hidden.length).toBeGreaterThan(0);
    const chipText = tree.root
      .findAllByType(Text)
      .find((n) => n.props.accessibilityLabel === 'शुभ दीपावली');
    expect(chipText).toBeTruthy();
  });

  test('renders without starting the sway under reduce-motion', () => {
    mockReduced = true;
    // The observable contract in a test renderer: mounting with reduce-motion on
    // must not throw and must render the same tree (the loop simply never starts).
    const tree = render();
    expect(tree.root.findByProps({ testID: 'festive-toran' })).toBeTruthy();
  });
});
