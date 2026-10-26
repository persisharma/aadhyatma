/**
 * The पूर्ण पंचांग share (design.md §33a, §39.10): the hook opens the shared
 * provider's picker on the 540×675 card; the system share captures it at
 * 1080×1350 and hands it to the OS sheet WITH the caption that carries the
 * download link, on both platforms, and nothing stays mounted afterwards.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { PixelRatio, Platform, Pressable, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { ThemeProvider } from '@/theme/ThemeContext';
import { computePanchangForDate } from '@/panchang/engine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { SMART_LINK } from '@/data/shareLinks';
import PanchangShareCard from '@/components/PanchangShareCard';
import { ShareProvider } from '@/utils/shareVerse';
import { usePanchangShare } from '@/utils/panchangShare';

const mockCapture = jest.fn((..._args: unknown[]) => Promise.resolve('file:///tmp/panchang.png'));
const mockFiles = jest.fn((..._args: unknown[]) => Promise.resolve(true));
jest.mock('react-native-view-shot', () => ({ captureRef: (...args: unknown[]) => mockCapture(...args) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(() => Promise.resolve(true)), shareAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('@/utils/multiShare', () => ({ shareFiles: (...args: unknown[]) => mockFiles(...args), isMultiShareAvailable: () => true }));
jest.mock('@/contexts/ratingAsk', () => ({ useRatingAsk: () => () => {} }));
jest.mock('@/components/ShareTargetSheet', () => 'ShareTargetSheet');
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));
jest.mock('expo-linear-gradient', () => {
  const { View } = jest.requireActual('react-native');
  return { LinearGradient: View };
});
const system = jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });

const BENGALURU = { latitude: 12.9716, longitude: 77.5946, elevation: 920 };
const day = new Date(2026, 9, 26);
const p = computePanchangForDate(day, { location: BENGALURU });
const next = computePanchangForDate(new Date(2026, 9, 27), { location: BENGALURU });
const md = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, day.getDay());
const input = { p, md, observances: [], placeHi: 'बेंगलुरु', placeEn: 'Bengaluru', calendarSystem: 'purnimant' as const, lang: 'hi' as const };

const originalOS = Platform.OS;
let tree: TestRenderer.ReactTestRenderer;
const settle = async (ms = 170) => { await act(async () => { await new Promise((resolve) => setTimeout(resolve, ms)); }); };
const sheet = () => tree.root.findByType('ShareTargetSheet' as React.ElementType);

async function shareToSystem(taps = 1) {
  function Trigger() {
    const { share } = usePanchangShare();
    return <Pressable accessibilityLabel="trigger" onPress={() => void share(input)} />;
  }
  await act(async () => {
    tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>, { createNodeMock: () => ({}) });
  });
  const trigger = tree.root.findAll((n) => n.props.accessibilityLabel === 'trigger' && typeof n.props.onPress === 'function')[0];
  await act(async () => { for (let i = 0; i < taps; i++) trigger.props.onPress(); });
  act(() => { sheet().props.onShareSystem(); });
  await settle();
  // The card captures once it has laid out and its brand mark has decoded.
  act(() => tree.root.findByProps({ testID: 'share-card-mount' }).props.onLayout({ nativeEvent: { layout: { height: 675 } } }));
  act(() => tree.root.findByType(PanchangShareCard).props.onIconLoad());
  await settle(); await settle();
}

beforeEach(() => { jest.clearAllMocks(); });
afterEach(() => { act(() => tree.unmount()); Platform.OS = originalOS; });

test('opens the Daily Bhakti picker on the self-branded card, with card-language chips and text', async () => {
  function Trigger() {
    const { share } = usePanchangShare();
    return <Pressable accessibilityLabel="trigger" onPress={() => void share(input)} />;
  }
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>); });
  await act(async () => { tree.root.findAll((n) => n.props.accessibilityLabel === 'trigger' && typeof n.props.onPress === 'function')[0].props.onPress(); });
  expect(sheet().props).toMatchObject({ wholeCard: true, title: 'पंचांग साझा करें', cardLang: 'hi' });
  expect(sheet().props.singleCardPreview.props.content).toMatchObject({ width: 540, branded: true, awaitsArt: true });
  expect(typeof sheet().props.onShareText).toBe('function');
});

test('iOS: one 1080×1350 capture, shared with the caption and its download link', async () => {
  Platform.OS = 'ios';
  await shareToSystem(2);
  expect(mockCapture).toHaveBeenCalledTimes(1); // a double tap opens one picker
  expect(mockCapture.mock.calls[0][1]).toEqual(expect.objectContaining({ width: 1080 / PixelRatio.get(), height: 1350 / PixelRatio.get() }));
  const [content] = system.mock.calls[0];
  expect(content).toEqual(expect.objectContaining({ url: 'file:///tmp/panchang.png' }));
  expect((content as { message: string }).message).toContain('पूर्ण पंचांग · सोमवार, 26 अक्टूबर 2026 · बेंगलुरु');
  expect((content as { message: string }).message).toContain(SMART_LINK);
  expect(tree.root.findAllByType(PanchangShareCard)).toHaveLength(0);
});

test('Android: the native multi-share carries the caption; an older binary falls back to image-only', async () => {
  Platform.OS = 'android';
  await shareToSystem();
  expect(mockFiles).toHaveBeenCalledWith(['file:///tmp/panchang.png'], expect.objectContaining({ message: expect.stringContaining(SMART_LINK) }));
  expect(system).not.toHaveBeenCalled();
  act(() => tree.unmount());

  mockFiles.mockResolvedValueOnce(false);
  await shareToSystem();
  expect(Sharing.shareAsync).toHaveBeenCalledWith('file:///tmp/panchang.png', expect.objectContaining({ mimeType: 'image/png' }));
});
