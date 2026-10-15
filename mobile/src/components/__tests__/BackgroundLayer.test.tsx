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
  'backgrounds--deity-rama-darbar',
  'backgrounds--daan-annapurna-bhiksha',
  'backgrounds--source-vishnu-narayana-option2',
] as const)('%s fills the whole reading surface as the primary background', stem => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<BackgroundLayer source={backgroundAsset(stem)} />); });
  const art = tree.root.findByType(BackgroundArtwork);
  // The themed artwork is primary: it fills the screen (default cover), not a
  // letterboxed/contained canvas that would reveal the plain parchment behind it.
  expect(art.props.resizeMode).toBeUndefined();
  expect(StyleSheet.flatten(art.props.style)).toEqual(StyleSheet.absoluteFillObject);
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
