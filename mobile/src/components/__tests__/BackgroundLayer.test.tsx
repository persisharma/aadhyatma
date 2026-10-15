import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, View as mockView } from 'react-native';
import BackgroundLayer from '../BackgroundLayer';
import BackgroundArtwork from '../BackgroundArtwork';
import { backgroundAsset, readingParchment } from '@/data/backgroundAsset';

jest.mock('../BackgroundArtwork', () => jest.fn(() => null));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: (props: Record<string, unknown>) => mockReact.createElement(mockView, props),
}));

test.each([
  ['backgrounds--deity-rama-darbar', 1],
  ['backgrounds--daan-annapurna-bhiksha', 2 / 3],
  ['backgrounds--source-vishnu-narayana-option2', 1.5],
] as const)('%s keeps every figure inside a contained source canvas', (stem, aspectRatio) => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<BackgroundLayer source={backgroundAsset(stem)} />); });
  const art = tree.root.findByType(BackgroundArtwork);
  expect(art.props.resizeMode).toBe('contain');
  const frame = tree.root.findAllByType(mockView).find(node => StyleSheet.flatten(node.props.style)?.aspectRatio === aspectRatio);
  expect(frame).toBeDefined();
  expect(StyleSheet.flatten(frame!.props.style)).toMatchObject({ top: 0, width: '100%', maxHeight: '100%', aspectRatio });
  act(() => tree.unmount());
});

test('neutral reading parchment retains its complete surface without the artwork wash', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<BackgroundLayer source={readingParchment} />); });
  const art = tree.root.findByType(BackgroundArtwork);
  expect(art.props.source).toBe(readingParchment);
  expect(StyleSheet.flatten(art.props.style)).toEqual(StyleSheet.absoluteFillObject);
  act(() => tree.unmount());
});
