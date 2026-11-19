import React from 'react';
import { Image, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import JapmalaBanner from '@/components/home/JapmalaBanner';
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

  const openControl = frame.findAllByProps({ testID: 'home-japa-start' })[0];
  expect(StyleSheet.flatten(openControl.props.style)).toMatchObject({ marginRight: 12 });
  act(() => tree.unmount());
});

test.each([
  ['durga-saptashati-core', undefined, ['SaptashatiCore']],
  ['aditya-hridayam', undefined, ['StutiReader', { initialIndex: 0, stutiId: 'aditya-hridayam' }]],
  ['aditya-hridayam', 5, ['StutiReader', { initialIndex: 5, stutiId: 'aditya-hridayam' }]],
] as const)('the saved %s banner opens the reading at %s and keeps its count', (sourceId, verseIndex, expected) => {
  mockRecitations = { [sourceId]: { count: 3, updatedAt: 1 } };
  if (verseIndex !== undefined) mockProgress = { sourceId, verseIndex, updatedAt: 1 };
  const navigate = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<JapmalaBanner navigation={{ navigate } as never} />);
  });

  const count = tree.root.findAllByProps({ testID: 'home-japa-count' })[0];
  const openControl = tree.root.findAllByProps({ testID: 'home-japa-start' })[0];
  expect(count.props.accessibilityValue.text).toBe('३ पाठ');
  act(() => openControl.props.onPress());
  expect(navigate.mock.calls).toEqual([expected]);
  act(() => tree.unmount());
});
