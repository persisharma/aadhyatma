import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Alert, PixelRatio, Pressable, Share } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare } from '@/utils/shareVerse';
import { kidsStoryShareable } from '@/utils/shareContent';
import { getKidsStory } from '@/data/kidsStories';

const mockCapture = jest.fn(() => Promise.resolve('file:///tmp/card.png'));
const mockFiles = jest.fn(() => Promise.resolve(true));
const mockAsset = jest.fn(() => Promise.resolve('file:///cache/art.webp'));
jest.mock('react-native-view-shot', () => ({ captureRef: (...args: unknown[]) => mockCapture(...args as []) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('@/utils/multiShare', () => ({ isMultiShareAvailable: () => true, shareFiles: (...args: unknown[]) => mockFiles(...args as []) }));
jest.mock('@/utils/assetCache', () => ({ cachedAssetUri: (...args: unknown[]) => mockAsset(...args as []) }));
jest.mock('@/components/KidsStoryArt', () => ({ kidsStoryArtRequest: (art: string) => ({ key: art }) }));
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/ShareCard', () => 'ShareCard');
jest.mock('@/components/ShareStoryCanvas', () => 'ShareStoryCanvas');
jest.mock('@/components/ShareStoryFrame', () => 'ShareStoryFrame');
jest.mock('@/components/ShareTargetSheet', () => 'ShareTargetSheet');
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));
const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
const system = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
const content = kidsStoryShareable(getKidsStory('durga-raktabeej')!);
let tree: TestRenderer.ReactTestRenderer;
const settle = async (ms = 100) => { await act(async () => { await new Promise(resolve => setTimeout(resolve, ms)); }); };
async function open() {
  function Trigger() { const { share } = useShare(); return <Pressable accessibilityLabel="trigger" onPress={() => void share(content, 'gu')} />; }
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>, { createNodeMock: () => ({}) }); });
  await act(async () => { tree.root.findAll(n => n.props.accessibilityLabel === 'trigger' && typeof n.props.onPress === 'function')[0].props.onPress(); });
}
const sheet = () => tree.root.findByType('ShareTargetSheet' as any);
let sheetLayoutSeen: string | undefined;
const pendingArt = () => tree.root.findAllByType('ProseShareCard' as any).find(n => n.props.illustrationUri);
beforeEach(() => { jest.clearAllMocks(); mockAsset.mockResolvedValue('file:///cache/art.webp'); });
afterEach(() => { act(() => tree.unmount()); });

test('capture waits for native image decode, then hands the complete selected part off in card order', async () => {
  await open();
  const expected = content.scopes[0].prepared!.gu.pages;
  sheetLayoutSeen = sheet().props.cardLayout;
  act(() => sheet().props.series.onShareAll());
  await settle();
  expect(pendingArt()).toBeDefined();
  expect(mockCapture).not.toHaveBeenCalled();
  // Every card of a picture story carries art, and the closing card's cover repeats a scene's
  // art — so decodes are counted per mounted page, not per art key.
  const decodedPages: unknown[] = [];
  const decoded: string[] = [];
  for (let i = 0; i < 80 && !mockFiles.mock.calls.length; i++) {
    const card = pendingArt();
    if (card && !decodedPages.includes(card.props.page)) {
      decodedPages.push(card.props.page);
      decoded.push(card.props.page.illustration.art);
      act(() => card.props.onIllustrationReady(true));
    }
    await settle();
  }
  expect(decoded).toEqual(expected.flatMap(p => p.illustration ? [p.illustration.art] : []));
  expect(mockCapture).toHaveBeenCalledTimes(expected.length);
  // The picture card is 9:16: every capture is the 1080×1920 story size (iOS options are in points), unframed.
  const scale = PixelRatio.get();
  for (const call of mockCapture.mock.calls as unknown as [unknown, { width: number; height: number }][]) {
    expect(call[1]).toMatchObject({ width: 1080 / scale, height: 1920 / scale });
  }
  expect(tree.root.findAllByType('ShareStoryFrame' as any)).toHaveLength(0);
  expect(sheetLayoutSeen).toBe('picture');
  expect(mockFiles).toHaveBeenCalledTimes(1);
  expect((mockFiles.mock.calls[0] as unknown[])[0]).toHaveLength(expected.length);
});

test('missing R2 art aborts the album without sharing a partial series', async () => {
  await open(); mockAsset.mockRejectedValueOnce(new Error('R2 not uploaded'));
  act(() => sheet().props.series.onShareAll()); await settle();
  expect(mockCapture).not.toHaveBeenCalled(); expect(mockFiles).not.toHaveBeenCalled(); expect(system).not.toHaveBeenCalled(); expect(alert).toHaveBeenCalledTimes(1);
});

test('a failed native decode refuses a single illustrated card instead of sharing a placeholder or text fallback', async () => {
  await open(); act(() => sheet().props.onShareSystem()); await settle();
  act(() => pendingArt()!.props.onIllustrationReady(false)); await settle();
  expect(mockCapture).not.toHaveBeenCalled(); expect(system).not.toHaveBeenCalled(); expect(alert).toHaveBeenCalledTimes(1);
});
