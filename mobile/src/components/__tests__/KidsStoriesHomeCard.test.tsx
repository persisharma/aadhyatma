import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import KidsStoriesHomeCard from '../KidsStoriesHomeCard';
import manifest from '@/data/kidsStoryAssetManifest.json';

let mockUri: string | null = null;
const mockCache = jest.fn<string | null, [unknown]>(() => mockUri);
jest.mock('@/utils/useCachedAsset', () => ({ useCachedAsset: (request: unknown) => mockCache(request) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));

test('the Home story door remains usable while CDN art loads, then uses the cached file without resizing', () => {
  const onPress = jest.fn();
  const element = <KidsStoriesHomeCard onPress={onPress} onPressIn={() => undefined} onPressOut={() => undefined} />;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element); });
  const placeholder = tree.root.findAllByType(View).find(n => StyleSheet.flatten(n.props.style)?.width === 100)!;
  expect(StyleSheet.flatten(placeholder.props.style).height).toBe(100);
  expect(tree.root.findAllByType(Image)).toHaveLength(0);
  const request = mockCache.mock.calls[0][0];
  expect(request).toEqual({ key: manifest.assets['story-library'].hash, ext: 'webp', subdir: 'kids-stories',
    remoteUrl: expect.stringMatching(new RegExp(`/kids-stories/${manifest.assets['story-library'].hash}\\.webp$`)) });
  act(() => tree.root.findAll(n => n.props.testID === 'home-kids-stories-card' && typeof n.props.onPress === 'function')[0].props.onPress());
  expect(onPress).toHaveBeenCalledTimes(1);
  mockUri = `file:///documents/kids-stories/${manifest.assets['story-library'].hash}.webp`;
  act(() => tree.update(React.cloneElement(element)));
  const image = tree.root.findByType(Image);
  expect(image.props.source).toEqual({ uri: mockUri });
  expect(StyleSheet.flatten(image.props.style)).toMatchObject({ width: 100, height: 100 });
  act(() => tree.unmount());
  mockUri = null;
});
