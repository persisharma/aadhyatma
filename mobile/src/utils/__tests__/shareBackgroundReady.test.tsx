import React from 'react';
import { Image, InteractionManager, Pressable, Share } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { ShareProvider, useShare } from '@/utils/shareVerse';
import { subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';
import { createArtworkPaintBarrier } from '@/components/ArtworkCaptureContext';

// Any published plate works: every background resolves through R2 and the cache.
const mockRemoteStem = 'backgrounds--deity-krishna-bansuri';
const mockCapture = jest.fn(() => Promise.resolve('file:///tmp/card.png'));
jest.mock('react-native-view-shot', () => ({ captureRef: (...args: unknown[]) => mockCapture(...args as []) }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(), shareAsync: jest.fn() }));
jest.mock('@/components/TimelyTagsResolver', () => ({ __esModule: true, default: () => null }));
jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: jest.fn(), evictBackgroundAsset: jest.fn(),
}));
// Exercise the real background/native-decode boundary in both captured layers.
// Hoisted Jest factories must resolve these dependencies inside the factory.
jest.mock('@/components/ShareStoryCanvas', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const BackgroundArtwork = require('@/components/BackgroundArtwork').default;
  return { __esModule: true, default: function MockShareStoryCanvas({ onHeight }: { onHeight?: (height: number) => void }) {
    const source = { kind: 'remote-background', stem: mockRemoteStem };
    React.useEffect(() => { onHeight?.(960); }, [onHeight]);
    return React.createElement(React.Fragment, null,
    React.createElement(BackgroundArtwork, { source }),
    React.createElement(BackgroundArtwork, { source })); } };
});
jest.mock('@/components/ShareCard', () => 'ShareCard');
jest.mock('@/components/ProseShareCard', () => 'ProseShareCard');
jest.mock('@/components/ShareStoryFrame', () => 'ShareStoryFrame');

let tree: TestRenderer.ReactTestRenderer;
let deferred: (() => void)[];
let downloaded: ((uri: string | null) => void)[];
const settle = async () => { await act(async () => { await new Promise(resolve => setTimeout(resolve, 160)); }); };

beforeEach(() => {
  jest.clearAllMocks(); deferred = []; downloaded = [];
  jest.spyOn(Share, 'share').mockResolvedValue({ action: Share.sharedAction });
  jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(callback => {
    deferred.push(callback as () => void);
    return { cancel: jest.fn(), then: jest.fn(), done: jest.fn() } as never;
  });
  jest.mocked(subscribeBackgroundAsset).mockImplementation((_request, callback) => {
    downloaded.push(callback); return jest.fn();
  });
});
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); });

async function begin() {
  function Trigger() {
    const { share } = useShare();
    return <Pressable accessibilityLabel="trigger" onPress={() => void share({
      sourceId: 'ram-stuti', sectionNameHi: 'राम', sectionNameEn: 'Rama',
      verseLabelHi: '१', verseLabelEn: '1', linesHi: ['राम'], linesEn: ['Rama'],
    }, 'en', { target: 'system', format: 'story' })} />;
  }
  await act(async () => { tree = TestRenderer.create(<ThemeProvider><ShareProvider><Trigger /></ShareProvider></ThemeProvider>, { createNodeMock: () => ({}) }); });
  act(() => tree.root.findAll(n => n.props.accessibilityLabel === 'trigger' && typeof n.props.onPress === 'function')[0].props.onPress());
  await settle();
}

test('capture waits for both remote background layers to paint, not only the layout or download', async () => {
  await begin();
  expect(mockCapture).not.toHaveBeenCalled();
  act(() => deferred.forEach(start => start()));
  act(() => downloaded.forEach(done => done('file:///cache/rama.webp')));
  await settle();
  expect(mockCapture).not.toHaveBeenCalled();
  const remote = tree.root.findAllByType(Image).filter(n => n.props.source.uri);
  expect(remote).toHaveLength(2);
  act(() => remote[0].props.onLoad());
  await settle();
  expect(mockCapture).not.toHaveBeenCalled();
  act(() => remote[1].props.onLoad());
  await settle();
  expect(mockCapture).toHaveBeenCalledTimes(1);
});

test('a failed remote request captures the painted local fallback instead of blocking sharing', async () => {
  await begin();
  expect(mockCapture).not.toHaveBeenCalled();
  act(() => tree.root.findAllByType(Image).forEach(n => n.props.onLoad?.()));
  act(() => deferred.forEach(start => start()));
  act(() => downloaded.forEach(done => done(null)));
  await settle();
  expect(mockCapture).toHaveBeenCalledTimes(1);
});

test('network failure still waits for both fallback images to paint', async () => {
  await begin();
  act(() => deferred.forEach(start => start()));
  act(() => downloaded.forEach(done => done(null)));
  await settle();
  expect(mockCapture).not.toHaveBeenCalled();
  const fallback = tree.root.findAllByType(Image);
  act(() => fallback[0].props.onLoad());
  await settle();
  expect(mockCapture).not.toHaveBeenCalled();
  act(() => fallback[1].props.onLoad());
  await settle();
  expect(mockCapture).toHaveBeenCalledTimes(1);
});

test('a missing native callback cannot leave the capture barrier waiting forever', async () => {
  jest.useFakeTimers();
  try {
    const barrier = createArtworkPaintBarrier();
    const release = barrier.register();
    const waiting = barrier.wait();
    jest.advanceTimersByTime(10000);
    await expect(waiting).resolves.toBe(true);
    release();
    await expect(barrier.wait()).resolves.toBe(false);
  } finally { jest.useRealTimers(); }
});
