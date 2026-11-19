import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import KidsStoriesHomeCard from '../KidsStoriesHomeCard';
import manifest from '@/data/kidsStoryAssetManifest.json';

let mockUri: string | null = null;
let mockLang = 'en';
const mockCache = jest.fn<string | null, [unknown]>(() => mockUri);
jest.mock('@/utils/useCachedAsset', () => ({ useCachedAsset: (request: unknown) => mockCache(request) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));

test('the Home story door remains usable while CDN art loads, then uses the cached file without resizing', () => {
  const onPress = jest.fn();
  const element = <KidsStoriesHomeCard onPress={onPress} onPressIn={() => undefined} onPressOut={() => undefined} />;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element); });
  const placeholder = tree.root.findAllByType(View).find(n => {
    const style = StyleSheet.flatten(n.props.style);
    return style?.width === '100%' && style.backgroundColor;
  })!;
  expect(StyleSheet.flatten(placeholder.props.style).height).toBe('100%');
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
  // The cover fills the card's square picture slot (HomeBannerCard owns its size).
  expect(StyleSheet.flatten(image.props.style)).toMatchObject({ position: 'absolute', width: '100%', height: '100%' });
  act(() => tree.unmount());
  mockUri = null;
});

test('the Kannada primary title contains no Gujarati or Devanagari glyphs', () => {
  mockLang = 'kn';
  let tree!: TestRenderer.ReactTestRenderer;
  try {
    act(() => { tree = TestRenderer.create(<KidsStoriesHomeCard onPress={() => undefined} onPressIn={() => undefined} onPressOut={() => undefined} />); });
    const primary = tree.root.findAllByType(Text)[0].props.children as string;
    expect(primary).toMatch(/[\u0C80-\u0CFF]/);
    expect(primary).not.toMatch(/[\u0900-\u097F\u0A80-\u0AFF]/);
  } finally {
    act(() => tree.unmount());
    mockLang = 'en';
  }
});

test('the Home banner card shows the reading language only', () => {
  mockLang = 'hi';
  let tree!: TestRenderer.ReactTestRenderer;
  try {
    act(() => { tree = TestRenderer.create(<KidsStoriesHomeCard onPress={() => undefined} onPressIn={() => undefined} onPressOut={() => undefined} />); });
    const lines = tree.root.findAllByType(Text).map(node => node.props.children as string);
    // Title and action: no second-language subtitle (RULEBOOK §3, one language per card).
    expect(lines).toEqual(['बच्चों की चित्र-कथाएँ', 'पात्र चुनें']);
  } finally {
    act(() => tree.unmount());
    mockLang = 'en';
  }
});
