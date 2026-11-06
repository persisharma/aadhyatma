/**
 * The पूर्ण पंचांग share (design.md §33a, §39.10): the hook opens the shared
 * provider's picker on the 540×675 card; the system share captures it at
 * 1080×1350 and hands it to the OS sheet WITH the caption that carries the
 * download link, on both platforms, and nothing stays mounted afterwards.
 */
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, PixelRatio, Platform, Pressable, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { ThemeProvider } from '@/theme/ThemeContext';
import { computePanchangForDate } from '@/panchang/engine';
import { computeMuhuratDay } from '@/panchang/muhurat';
import { SMART_LINK } from '@/data/shareLinks';
import PanchangShareCard from '@/components/PanchangShareCard';
import { ShareProvider } from '@/utils/shareVerse';
import { usePanchangShare } from '@/utils/panchangShare';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SHARE_BRAND_KEY } from '@/data/shareBrand';
import { resetShareBrandForTests } from '@/utils/shareBrandStore';

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
  const capturesBefore = mockCapture.mock.calls.length;
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
  // The approved lettering is a separate image registered with the real
  // capture barrier. Loading the icon alone must not capture an empty name.
  await settle();
  expect(mockCapture).toHaveBeenCalledTimes(capturesBefore);
  const wordmarks = tree.root.findByType(PanchangShareCard).findAllByType(Image)
    .filter(n => n.props.testID === 'vedansh-wordmark-hi');
  expect(wordmarks).toHaveLength(1);
  act(() => wordmarks.forEach(image => image.props.onLoad()));
  await settle(); await settle();
}

beforeEach(async () => { jest.clearAllMocks(); await AsyncStorage.clear(); resetShareBrandForTests(); });
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

test('co-branding (§33a): a saved profile prints on the captured card and in Send as text, never in the caption', async () => {
  Platform.OS = 'ios';
  const profile = { on: true, name: 'पं. रमेश शर्मा', title: 'ज्योतिषाचार्य', contact: '98290 12345' };
  await AsyncStorage.setItem(SHARE_BRAND_KEY, JSON.stringify(profile));
  function Trigger() {
    const { share } = usePanchangShare();
    return <Pressable accessibilityLabel="trigger" onPress={() => void share(input)} />;
  }
  const open = async () => {
    await act(async () => { tree.root.findAll((n) => n.props.accessibilityLabel === 'trigger' && typeof n.props.onPress === 'function')[0].props.onPress(); });
  };
  await act(async () => {
    tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>, { createNodeMock: () => ({}) });
  });
  await open();
  // The sheet carries the मेरी ब्रांडिंग settings under the preview.
  expect(sheet().props.controls).toBeTruthy();

  // Send as text signs off with the profile.
  await settle();
  await act(async () => { sheet().props.onShareText(); });
  await settle(400);
  const text = (system.mock.calls[0][0] as { message: string }).message;
  expect(text).toContain('पं. रमेश शर्मा · ज्योतिषाचार्य · 98290 12345');
  system.mockClear();

  // The image: the capture mount prints the brand; the caption names neither the sender nor the contact.
  await open();
  act(() => { sheet().props.onShareSystem(); });
  await settle();
  const card = tree.root.findByType(PanchangShareCard);
  expect(card.props.brand).toEqual({ name: 'पं. रमेश शर्मा', line: 'ज्योतिषाचार्य · 98290 12345' });
  act(() => tree.root.findByProps({ testID: 'share-card-mount' }).props.onLayout({ nativeEvent: { layout: { height: 675 } } }));
  act(() => card.props.onIconLoad());
  act(() => tree.root.findByType(PanchangShareCard).findAllByType(Image)
    .filter(n => n.props.testID === 'vedansh-wordmark-hi').forEach(image => image.props.onLoad()));
  await settle(); await settle();
  expect(mockCapture).toHaveBeenCalledTimes(1);
  const caption = (system.mock.calls[0][0] as { message: string }).message;
  expect(caption).toContain(SMART_LINK);
  expect(caption).not.toContain('रमेश');
  expect(caption).not.toContain('98290');
});

test('co-branding off: the captured card is the plain one', async () => {
  Platform.OS = 'ios';
  await AsyncStorage.setItem(SHARE_BRAND_KEY, JSON.stringify({ on: false, name: 'पं. रमेश शर्मा', title: '', contact: '' }));
  function Trigger() {
    const { share } = usePanchangShare();
    return <Pressable accessibilityLabel="trigger" onPress={() => void share(input)} />;
  }
  await act(async () => {
    tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>, { createNodeMock: () => ({}) });
  });
  await act(async () => { tree.root.findAll((n) => n.props.accessibilityLabel === 'trigger' && typeof n.props.onPress === 'function')[0].props.onPress(); });
  act(() => { sheet().props.onShareSystem(); });
  await settle();
  const card = tree.root.findByType(PanchangShareCard);
  expect(card.props.brand).toBeNull();
  // Finish the capture, so no share is still waiting when the test environment closes.
  act(() => tree.root.findByProps({ testID: 'share-card-mount' }).props.onLayout({ nativeEvent: { layout: { height: 675 } } }));
  act(() => card.props.onIconLoad());
  act(() => tree.root.findByType(PanchangShareCard).findAllByType(Image)
    .filter(n => n.props.testID === 'vedansh-wordmark-hi').forEach(image => image.props.onLoad()));
  await settle(); await settle();
  expect(mockCapture).toHaveBeenCalledTimes(1);
  expect(tree.root.findAllByType(PanchangShareCard)).toHaveLength(0);
});
