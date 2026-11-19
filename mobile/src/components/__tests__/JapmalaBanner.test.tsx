import React from 'react';
import { Image, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import JapmalaBanner from '@/components/home/JapmalaBanner';

let mockRecitations: Record<string, { count: number; updatedAt: number }> = {};

afterEach(() => { mockRecitations = {}; });

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

test('a saved Saptashati practice opens its chapter list directly and retains its count', () => {
  mockRecitations = { 'durga-saptashati-core': { count: 3, updatedAt: 1 } };
  const navigate = jest.fn();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(<JapmalaBanner navigation={{ navigate } as never} />);
  });

  const count = tree.root.findAllByProps({ testID: 'home-japa-count' })[0];
  const openControl = tree.root.findAllByProps({ testID: 'home-japa-start' })[0];
  expect(count.props.accessibilityValue.text).toBe('३ पाठ');
  act(() => openControl.props.onPress());
  expect(navigate.mock.calls).toEqual([['SaptashatiCore']]);
  act(() => tree.unmount());
});
