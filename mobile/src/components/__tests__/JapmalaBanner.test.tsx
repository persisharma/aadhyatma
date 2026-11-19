import React from 'react';
import { Image, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import JapmalaBanner from '@/components/home/JapmalaBanner';

jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('@/contexts/JapamCounterContext', () => ({
  useJapamCounter: () => ({
    entries: {},
    recitations: {},
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
