import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { getComicBook, comicPages } from '@/data/comicBooks';
const mockCache = jest.fn();
jest.mock('react-native', () => ({ Text: 'Text', View: 'View', Pressable: 'Pressable', Image: 'Image', ActivityIndicator: 'ActivityIndicator' }));
jest.mock('react-native-svg', () => ({ __esModule: true, default: 'Svg', Defs: 'Defs', ClipPath: 'ClipPath', Polygon: 'Polygon', Image: 'SvgImage' }));
jest.mock('@/utils/assetCache', () => ({ cachedAssetUri: (...args: unknown[]) => mockCache(...args) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'en' }) }));
const { default: Art, comicArtGeometry, comicArtRequest } = require('../ComicArt');
const panels = getComicBook('balakanda-v1')!.episodes.flatMap(e => e.panels);
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
    expect(request.remoteUrl).toContain(`/comics/balakanda-illustrated-v3/${panel.sha256.slice(0, 16)}.png`);
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
test('fill mode covers the listing thumb with the panel frame alone, never a gap or a neighbouring panel', () => {
  const { comicArtCoverGeometry } = require('../ComicArt');
  for (const panel of panels) for (const [w, h] of [[92, 115], [92, 150]]) for (const focusX of [0, 0.4, 1]) {
    const g = comicArtCoverGeometry(panel, w, h, focusX);
    const frameLeft = g.left + g.sheetWidth * panel.frame.x;
    const frameTop = g.top + g.sheetHeight * panel.frame.y;
    expect(frameLeft).toBeLessThanOrEqual(1e-6);
    expect(frameTop).toBeLessThanOrEqual(1e-6);
    expect(frameLeft + g.sheetWidth * panel.frame.width).toBeGreaterThanOrEqual(w - 1e-6);
    expect(frameTop + g.sheetHeight * panel.frame.height).toBeGreaterThanOrEqual(h - 1e-6);
    expect(g.sheetWidth / g.sheetHeight).toBeCloseTo(panel.dimensions.width / panel.dimensions.height);
  }
});
test('fill mode fills its parent and draws only after both box sides are measured', async () => {
  const panel = panels[0];
  mockCache.mockResolvedValueOnce('file://cached.png');
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => { tree = TestRenderer.create(<Art fill panel={panel} label="Scene" />); });
  trees.push(tree);
  const slot = tree.root.findByProps({ testID: `comic-art-${panel.id}` });
  expect(slot.props.style).toMatchObject({ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 });
  expect(tree.root.findAllByProps({ testID: `comic-image-${panel.id}` })).toHaveLength(0);
  act(() => slot.props.onLayout({ nativeEvent: { layout: { width: 92, height: 115 } } }));
  expect(tree.root.findByProps({ testID: `comic-image-${panel.id}` }).props.source.uri).toBe('file://cached.png');
});
