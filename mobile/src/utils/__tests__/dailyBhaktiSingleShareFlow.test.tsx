import React from 'react';
import { PixelRatio, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare } from '../shareVerse';
import { dailyBhaktiShareable } from '../dailyBhaktiShare';
import { getVersePool } from '@/data/versePool';
const mockCapture = jest.fn((..._args: unknown[]) => Promise.resolve('file:///full-card.png'));
jest.mock('react-native-view-shot', () => ({ captureRef: (...args: unknown[]) => mockCapture(...args) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async () => true, shareAsync: async () => {} }));
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => () => {} }));
jest.mock('@/components/ShareTargetSheet', () => 'ShareTargetSheet');
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));
const verse = getVersePool().find(v => v.sourceId === 'hanuman-ashtak' && v.verseIndex === 5)!;
function Trigger() { const { share } = useShare(); return <Pressable testID="trigger" onPress={() => share(dailyBhaktiShareable(verse), 'hi')} />; }
let tree: TestRenderer.ReactTestRenderer;
const pause = async () => { await act(async () => { await new Promise(r => setTimeout(r, 170)); }); };
beforeEach(() => { mockCapture.mockClear(); jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction }); });
afterEach(() => { if (tree) act(() => tree.unmount()); jest.restoreAllMocks(); });
async function open(mode: 'system' | 'igPost' | 'igStory' = 'system') {
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>); });
  await act(async () => { tree.root.findByProps({ testID: 'trigger' }).props.onPress(); });
  const sheet = tree.root.findByType('ShareTargetSheet' as React.ElementType);
  expect(sheet.props.series.pageCount).toBe(1); expect(sheet.props.fullVerseImage).toBe(true);
  act(() => { void (mode === 'igStory' ? sheet.props.onShareInstagramStory() : mode === 'igPost' ? sheet.props.onShareInstagramPost() : sheet.props.onShareSystem()); });
  await pause();
  return tree.root.findAllByType('ProseShareCard' as React.ElementType).find(n => n.props.onIllustrationReady)!;
}
it('system share: waits for native height and paint, then exports the complete verse as one tall image', async () => {
  const card = await open();
  expect(card.props.pageCount).toBe(1); expect(card.props.page.devotional.meaning).toBe(verse.meaningHi);
  act(() => card.props.onHeight(1000)); await pause(); expect(mockCapture).not.toHaveBeenCalled();
  act(() => card.props.onIllustrationReady(true)); await pause(); await pause();
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(mockCapture.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 2000 / PixelRatio.get() });
});
it('Instagram post: scales a tall card into the 4:5 frame so nothing is cropped', async () => {
  const card = await open('igPost');
  act(() => { card.props.onHeight(1000); card.props.onIllustrationReady(true); }); await pause(); await pause();
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(mockCapture.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 1350 / PixelRatio.get() });
});
it('Instagram story: scales a tall card into the 9:16 frame so nothing is cropped', async () => {
  const card = await open('igStory');
  act(() => { card.props.onHeight(1000); card.props.onIllustrationReady(true); }); await pause(); await pause();
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(mockCapture.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 1920 / PixelRatio.get() });
});
