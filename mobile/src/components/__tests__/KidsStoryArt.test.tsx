import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { ActivityIndicator, Image, Pressable } from 'react-native';

let mockState = { uri: null as string | null, failed: false, retry: jest.fn(), markUndecodable: jest.fn() };
jest.mock('@/utils/useCachedAsset', () => ({ useCachedAssetState: () => mockState }));
jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({ colors: { parchmentSoft: '#eee', ink: '#000', inkSoft: '#333', saffron: '#b60' } }),
}));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));

import KidsStoryArt from '../KidsStoryArt';

function render(props: Partial<React.ComponentProps<typeof KidsStoryArt>> = {}) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<KidsStoryArt art="cover" label="Cover" {...props} />); });
  return tree;
}

beforeEach(() => {
  mockState = { uri: null, failed: false, retry: jest.fn(), markUndecodable: jest.fn() };
});

describe('KidsStoryArt loading and retry (UX-04)', () => {
  it('shows a spinner, not blank alt text, while the download is in flight', () => {
    const tree = render();
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  });

  it('shows a retry control after a failed download and retries on tap', () => {
    mockState.failed = true;
    const tree = render();
    expect(tree.root.findAllByType(ActivityIndicator)).toHaveLength(0);
    const retry = tree.root.findByProps({ testID: "kids-story-art-retry" });
    expect(retry.props.accessibilityLabel).toBe('Retry picture');
    act(() => retry.props.onPress());
    expect(mockState.retry).toHaveBeenCalledTimes(1);
  });

  it('fill mode (listing thumb) shows the compact retry glyph', () => {
    mockState.failed = true;
    const tree = render({ fill: true });
    expect(tree.root.findByProps({ testID: "kids-story-art-retry" })).toBeTruthy();
  });

  it('a decode error evicts the cached file and still notifies the caller', () => {
    mockState.uri = 'file:///art.webp';
    const onError = jest.fn();
    const tree = render({ onError });
    act(() => tree.root.findByType(Image).props.onError());
    expect(mockState.markUndecodable).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('a caller-resolved uri never touches the cache on error', () => {
    const tree = render({ resolvedUri: 'file:///given.webp' });
    act(() => tree.root.findByType(Image).props.onError());
    expect(mockState.markUndecodable).not.toHaveBeenCalled();
  });
});
