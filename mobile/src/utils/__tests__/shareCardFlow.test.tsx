import React from 'react';
import { Alert, PixelRatio, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { SMART_LINK } from '@/data/shareLinks';
import { ShareProvider, useShare, type ShareableCard } from '../shareVerse';
const mockCapture = jest.fn((..._args: unknown[]) => Promise.resolve('file:///card.png'));
jest.mock('react-native-view-shot', () => ({ captureRef: (...args: unknown[]) => mockCapture(...args) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: async () => true, shareAsync: async () => {} }));
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => () => {} }));
jest.mock('@/components/ShareTargetSheet', () => 'ShareTargetSheet');
jest.mock('@/components/ShareCardMount', () => ({ __esModule: true, default: 'ShareCardMount', ShareCardPreview: 'ShareCardPreview' }));
jest.mock('@/components/ShareFitFrame', () => ({ __esModule: true, default: 'ShareFitFrame' }));
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));

/** A Panchang-shaped card (design.md §39.10): 340 dp natural width, no artwork of its own. */
const onClose = jest.fn();
const card = (over: Partial<ShareableCard> = {}): ShareableCard => ({
  kind: 'card',
  sourceId: 'panchang.today',
  width: 340,
  languages: true,
  title: { hi: 'पंचांग साझा करें', en: 'Share panchang', gu: 'પંચાંગ શેર કરો', kn: 'ಪಂಚಾಂಗ ಹಂಚಿ' },
  tagNameHi: 'पंचांग',
  tagNameEn: 'Panchang',
  render: () => null,
  caption: () => ({ sectionName: 'आज का पंचांग', label: 'सोमवार, 26 अक्तूबर 2026', firstLine: 'पूर्णिमा · अश्विनी' }),
  text: () => 'तिथि: पूर्णिमा',
  onClose,
  ...over,
});
let content = card();
function Trigger() { const { share } = useShare(); return <Pressable testID="trigger" onPress={() => share(content, 'hi')} />; }
let tree: TestRenderer.ReactTestRenderer;
const pause = async () => { await act(async () => { await new Promise(r => setTimeout(r, 170)); }); };
const sheet = () => tree.root.findByType('ShareTargetSheet' as React.ElementType);
const mounts = () => tree.root.findAllByType('ShareCardMount' as React.ElementType);
let shareSpy: jest.SpyInstance;
beforeEach(() => { mockCapture.mockClear(); onClose.mockClear(); content = card(); shareSpy = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction }); });
afterEach(() => { if (tree) act(() => tree.unmount()); jest.restoreAllMocks(); });
async function open() {
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>); });
  await act(async () => { tree.root.findByProps({ testID: 'trigger' }).props.onPress(); });
}

it('opens the Daily Bhakti picker: whole-card rows, preview, card-language chips and text', async () => {
  await open();
  const props = sheet().props;
  expect(props).toMatchObject({ wholeCard: true, title: 'पंचांग साझा करें', cardLang: 'hi' });
  expect(typeof props.onCardLang).toBe('function');
  expect(typeof props.onShareText).toBe('function');
  expect(props.singleCardPreview.type).toBe('ShareCardPreview');
});

it('system share exports the whole card 1080 px wide and captions it with the download link', async () => {
  await open();
  act(() => { sheet().props.onShareSystem(); });
  await pause();
  expect(mockCapture).not.toHaveBeenCalled();
  act(() => mounts()[0].props.onHeight(1000));
  await pause(); await pause();
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(mockCapture.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: Math.round(1000 * 1080 / 340) / PixelRatio.get() });
  const [payload] = shareSpy.mock.calls[0];
  expect(payload.url).toBe('file:///card.png');
  expect(payload.message).toContain('आज का पंचांग · सोमवार, 26 अक्तूबर 2026');
  expect(payload.message).toContain(SMART_LINK);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('Instagram story scales the whole card into 9:16 around its own width', async () => {
  await open();
  act(() => { sheet().props.onShareInstagramStory(); });
  await pause();
  act(() => mounts()[0].props.onHeight(1000));
  await pause();
  const frame = tree.root.findByType('ShareFitFrame' as React.ElementType).props;
  expect(frame).toMatchObject({ format: 'story', cardWidth: 340, cardHeight: 1000, canvasWidth: 340 });
  act(() => mounts()[0].props.onReady(true));
  await pause(); await pause();
  expect(mockCapture.mock.calls[0][1]).toMatchObject({ width: 1080 / PixelRatio.get(), height: 1920 / PixelRatio.get() });
});

it('a failed capture alerts and hands nothing off', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
  mockCapture.mockRejectedValueOnce(new Error('capture failed'));
  await open();
  act(() => { sheet().props.onShareSystem(); });
  await pause();
  act(() => mounts()[0].props.onHeight(900));
  await pause(); await pause();
  expect(alert).toHaveBeenCalled();
  expect(shareSpy).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('a caller caption (Suvichar) replaces the system caption', async () => {
  content = card({ message: () => `invite ${SMART_LINK}` });
  await open();
  act(() => { sheet().props.onShareSystem(); });
  await pause();
  act(() => mounts()[0].props.onHeight(900));
  await pause(); await pause();
  expect(shareSpy.mock.calls[0][0].message).toBe(`invite ${SMART_LINK}`);
});

it('send as text appends the download lines after the sheet closes', async () => {
  await open();
  act(() => { sheet().props.onShareText(); });
  await act(async () => { await new Promise(r => setTimeout(r, 400)); });
  const message = shareSpy.mock.calls[0][0].message as string;
  expect(message.startsWith('तिथि: पूर्णिमा')).toBe(true);
  expect(message).toContain(SMART_LINK);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it('cancel closes the picker and reports the end of the flow', async () => {
  await open();
  act(() => sheet().props.onClose());
  expect(tree.root.findAllByType('ShareTargetSheet' as React.ElementType)).toHaveLength(0);
  expect(onClose).toHaveBeenCalledTimes(1);
});
