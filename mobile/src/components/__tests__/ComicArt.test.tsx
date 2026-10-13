import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { getComicBook, comicPages } from '@/data/comicBooks';
const mockCache = jest.fn();
jest.mock('react-native', () => ({ Text: 'Text', View: 'View', Pressable: 'Pressable', Image: 'Image', ActivityIndicator: 'ActivityIndicator' }));
jest.mock('@/utils/assetCache', () => ({ cachedAssetUri: (...args: unknown[]) => mockCache(...args) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
const { default: Art, comicArtGeometry, comicArtRequest } = require('../ComicArt');
const panels = comicPages(getComicBook('balakanda-v1')!).map(p => p.panel);
const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => { trees.splice(0).forEach(tree => act(() => tree.unmount())); mockCache.mockReset(); });
test('every frame uses the exact aspect-preserving reviewed sheet rectangle', () => {
  for (const panel of panels) for (const width of [272, 342, 720]) {
    const g = comicArtGeometry(panel, width);
    expect(g.sheetWidth * panel.frame.width).toBeCloseTo(width);
    expect(g.sheetHeight * panel.frame.height).toBeCloseTo(g.height);
    expect(g.sheetWidth / g.sheetHeight).toBeCloseTo(panel.dimensions.width / panel.dimensions.height);
    expect(g.left).toBeCloseTo(-g.sheetWidth * panel.frame.x);
    expect(g.top).toBeCloseTo(-g.sheetHeight * panel.frame.y);
    const request = comicArtRequest(panel.art);
    expect(request.remoteUrl).toContain(`/comics/balakanda-bilingual-v2/${panel.sha256.slice(0, 16)}.png`);
  }
});
test('failed first download keeps its geometry and offers a working retry', async () => {
  const panel = panels[0];
  mockCache.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce('file://cached.png');
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<Art panel={panel} label="Scene" />); });
  trees.push(tree);
  const slot = tree.root.findByProps({ testID: `comic-art-${panel.id}` });
  const ratio = slot.props.style.aspectRatio;
  act(() => slot.props.onLayout({ nativeEvent: { layout: { width: 342 } } }));
  await act(async () => tree.root.findByProps({ testID: `comic-art-retry-${panel.id}` }).props.onPress());
  expect(tree.root.findByProps({ testID: `comic-image-${panel.id}` }).props.source.uri).toBe('file://cached.png');
  expect(slot.props.style.aspectRatio).toBe(ratio);
  expect(mockCache).toHaveBeenCalledTimes(2);
});
