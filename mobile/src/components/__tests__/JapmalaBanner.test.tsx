import React from 'react';
import { Image, StyleSheet, Text } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import JapmalaBanner, { JAPMALA_ART_RATIO } from '@/components/home/JapmalaBanner';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

let mockRecitations: Record<string, { count: number; updatedAt: number }> = {};

let mockProgress: ReadingProgress | undefined;
afterEach(() => {
  mockRecitations = {};
  mockProgress = undefined;
});

jest.mock('@/contexts/ReadingProgressContext', () => ({
  useReadingProgress: () => ({
    getProgress: (sourceId: string) => sourceId === mockProgress?.sourceId ? mockProgress : undefined,
  }),
}));

jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/contexts/JapamCounterContext', () => ({
  useJapamCounter: () => ({
    entries: {},
    recitations: mockRecitations,
    getEntry: () => ({ count: 0, rounds: 0, updatedAt: 0 }),
    isLoading: false,
  }),
}));

test('Japmala artwork fills the rounded frame independently of control spacing', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<JapmalaBanner navigation={{ navigate: jest.fn() } as never} />);
  });

  const frame = tree.root.findAllByProps({ testID: 'home-japa-banner' })[0];
  const image = frame.findByType(Image);
  const frameStyle = StyleSheet.flatten(frame.props.style);
  expect(Object.keys(frameStyle).filter((key) => key.startsWith('padding'))).toEqual([]);
  expect(frameStyle).toMatchObject({ overflow: 'hidden', borderRadius: 18 });
  expect(StyleSheet.flatten(image.props.style)).toMatchObject({
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  });
  expect(image.props.accessible).toBe(false);
  // Never stretched: the painting is drawn at its own proportions, pinned left.
  expect(image.props.resizeMode).toBe('cover');
  const art = tree.root.findAll(node => node.props.testID === 'home-japa-art')[0];
  expect(StyleSheet.flatten(art.props.style)).toMatchObject({ position: 'absolute', left: 0, top: 0, bottom: 0, aspectRatio: JAPMALA_ART_RATIO, minWidth: '100%' });

  act(() => tree.unmount());
});

test('the banner is one door to the Japmala section and counts nothing on Home', () => {
  const navigate = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<JapmalaBanner navigation={{ navigate } as never} />);
  });
  // One target for the whole banner: no separate count or start control remains.
  const buttons = tree.root.findAll(node => typeof node.type === 'string' && node.props.accessibilityRole === 'button');
  expect(buttons).toHaveLength(1);
  for (const gone of ['home-japa-count', 'home-japa-start']) {
    expect(tree.root.findAll(node => node.props.testID === gone)).toHaveLength(0);
  }
  const door = tree.root.findAll(node => node.props.testID === 'home-japa-choose' && typeof node.props.onPress === 'function')[0];
  expect(door.props.accessibilityLabel).toBe('जपमाला खोलें · सीता राम');
  expect(StyleSheet.flatten(door.props.style({ pressed: false }))).toMatchObject({ flex: 1, minHeight: 98 });
  act(() => door.props.onPress());
  expect(navigate).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenCalledWith('CategoryList', { categoryId: 'japam', practice: true });
  act(() => tree.unmount());
});

// Main (#710) had the banner's play button open a saved hymn's reading. The owner
// then asked (19 Nov 2026) for the banner to do one thing only: lead to the
// Japmala section. A saved hymn still shows its count, and the door opens the
// section on its Hymns tab, where the reading is one tap away.
test.each(['durga-saptashati-core', 'aditya-hridayam'] as const)(
  'the saved %s banner keeps its count and opens the Japmala section on Hymns', (sourceId) => {
    mockRecitations = { [sourceId]: { count: 3, updatedAt: 1 } };
    mockProgress = { sourceId, verseIndex: 5, updatedAt: 1 };
    const navigate = jest.fn();
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(<JapmalaBanner navigation={{ navigate } as never} />);
    });
    const door = tree.root.findAll(node => node.props.testID === 'home-japa-choose' && typeof node.props.onPress === 'function')[0];
    expect(door.props.accessibilityValue.text).toBe('३ पाठ');
    act(() => door.props.onPress());
    expect(navigate.mock.calls).toEqual([['CategoryList', { categoryId: 'stotram', practice: true }]]);
    act(() => tree.unmount());
  });

test('the banner is titled Japmala and its Indic lines keep 1.65x leading, so no matra is cut off', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<JapmalaBanner navigation={{ navigate: jest.fn() } as never} />);
  });
  const lines = tree.root.findAllByType(Text).map(node => StyleSheet.flatten(node.props.style));
  expect(tree.root.findAllByType(Text)[0].props.children).toBe('जपमाला');
  // RULEBOOK §3 "Listing cards" rule 7: tighter boxes clip ि, ी and the anusvara.
  for (const style of lines.filter(item => typeof item?.lineHeight === 'number')) {
    expect(style.lineHeight).toBeGreaterThanOrEqual(Math.ceil(style.fontSize * 1.65));
  }
  act(() => tree.unmount());
});

