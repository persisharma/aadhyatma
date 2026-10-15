import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, InteractionManager, StyleSheet } from 'react-native';
import { NavigationContext } from '@react-navigation/native';
import BackgroundArtwork from '../BackgroundArtwork';
import CachedArtwork from '../CachedArtwork';
import { ArtworkCaptureContext, createArtworkPaintBarrier } from '../ArtworkCaptureContext';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import { backgroundAsset, bundledReadingFallback } from '@/data/backgroundAsset';
import { evictBackgroundAsset, subscribeBackgroundAsset } from '@/utils/backgroundAssetCache';
import { bundledArtworkCorrection } from '@/data/artworkCorrections';

jest.mock('@assets/artwork-corrections/theerth-karni-mata-background.webp', () => 101);
jest.mock('@assets/artwork-corrections/theerth-karni-mata-banner.webp', () => 102);
jest.mock('@assets/artwork-corrections/hanuman-sita-background.webp', () => 103);
jest.mock('@assets/artwork-corrections/ram-hanuman-background.webp', () => 104);
jest.mock('@assets/artwork-corrections/rama-darbar-background.webp', () => 105);

jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: jest.fn(),
  evictBackgroundAsset: jest.fn(async () => undefined),
}));

jest.mock('@/data/readerIllustrationManifest.json', () => ({
  prefix: 'reader-illustrations',
  assets: { 'deity-krishna-bansuri': { hash: 'krishna-fixture', ext: 'webp', width: 960, height: 480 } },
}));

const source = backgroundAsset('backgrounds--source-vishnu-narayana');
const other = backgroundAsset('backgrounds--deity-durga-lion');
const neutral = backgroundAsset('backgrounds--reading-parchment-option2');
let deferred: (() => void)[];
let cancels: jest.Mock[];
let callbacks: ((uri: string | null) => void)[];
let releases: jest.Mock[];
let tree: TestRenderer.ReactTestRenderer;

beforeEach(() => {
  deferred = []; cancels = []; callbacks = []; releases = [];
  jest.clearAllMocks();
  jest.spyOn(InteractionManager, 'runAfterInteractions').mockImplementation(callback => {
    deferred.push(callback as () => void);
    const cancel = jest.fn(); cancels.push(cancel);
    return { cancel, then: jest.fn(), done: jest.fn() } as never;
  });
  jest.mocked(subscribeBackgroundAsset).mockImplementation((_request, callback) => {
    callbacks.push(callback);
    const release = jest.fn(); releases.push(release);
    return release;
  });
});
afterEach(() => { act(() => tree?.unmount()); jest.restoreAllMocks(); });

test('a second capture of the same failed source reuses its painted fallback without a timeout or refetch', async () => {
  const first = createArtworkPaintBarrier();
  act(() => { tree = TestRenderer.create(<ArtworkCaptureContext.Provider value={first}><BackgroundArtwork source={source} /></ArtworkCaptureContext.Provider>); });
  act(() => tree.root.findByType(Image).props.onLoad());
  act(() => deferred[0]());
  act(() => callbacks[0](null));
  await expect(first.wait(1)).resolves.toBe(false);
  const second = createArtworkPaintBarrier();
  act(() => tree.update(<ArtworkCaptureContext.Provider value={second}><BackgroundArtwork source={source} /></ArtworkCaptureContext.Provider>));
  await expect(second.wait(1)).resolves.toBe(false);
  expect(subscribeBackgroundAsset).toHaveBeenCalledTimes(1);
});

test('paints the bundled fallback before starting deferred work and waits for native decode', () => {
  act(() => { tree = TestRenderer.create(<BackgroundArtwork source={source} />); });
  const fallback = tree.root.findByType(Image);
  expect(fallback.props.source).toBe(bundledReadingFallback);
  expect(StyleSheet.flatten(fallback.props.style)).toMatchObject({ width: '100%', height: '100%' });
  expect(subscribeBackgroundAsset).not.toHaveBeenCalled();
  act(() => deferred[0]());
  act(() => callbacks[0]('file:///vishnu.webp'));
  const remote = tree.root.findAllByType(Image)[1];
  expect(StyleSheet.flatten(remote.props.style).opacity).toBe(0);
  act(() => remote.props.onLoad());
  expect(StyleSheet.flatten(remote.props.style).opacity).toBe(1);
});

test('the already-bundled neutral paper needs no disk lookup or network work', () => {
  act(() => { tree = TestRenderer.create(<BackgroundArtwork source={neutral} />); });
  expect(tree.root.findByType(Image).props.source).toBe(bundledReadingFallback);
  expect(deferred).toHaveLength(0);
  expect(subscribeBackgroundAsset).not.toHaveBeenCalled();
});

test('source changes and unmount release work and ignore late image results', () => {
  act(() => { tree = TestRenderer.create(<BackgroundArtwork source={source} />); });
  act(() => deferred[0]());
  act(() => tree.update(<BackgroundArtwork source={other} />));
  expect(releases[0]).toHaveBeenCalledTimes(1);
  act(() => callbacks[0]('file:///old.webp'));
  expect(tree.root.findAllByType(Image)).toHaveLength(1);
  act(() => tree.unmount());
  expect(cancels[1]).toHaveBeenCalledTimes(1);
  act(() => callbacks[0]('file:///late.webp'));
});

test('decode failure keeps the supplied bundled fallback visible and evicts the damaged cached image', () => {
  act(() => { tree = TestRenderer.create(<BackgroundArtwork source={source} fallback={<Image source={99} />} />); });
  act(() => deferred[0]());
  act(() => callbacks[0]('file:///broken.webp'));
  act(() => tree.root.findAllByType(Image)[1].props.onError());
  expect(tree.root.findAllByType(Image)).toHaveLength(1);
  expect(tree.root.findByType(Image).props.source).toBe(99);
  expect(evictBackgroundAsset).toHaveBeenCalledTimes(1);
});

test('late native events from a replaced image cannot hide or evict the current painting', () => {
  act(() => { tree = TestRenderer.create(<BackgroundArtwork source={source} />); });
  act(() => deferred[0]());
  act(() => callbacks[0]('file:///old.webp'));
  const oldEvents = tree.root.findAllByType(Image)[1].props;
  act(() => tree.update(<BackgroundArtwork source={other} />));
  act(() => deferred[1]());
  act(() => callbacks[1]('file:///new.webp'));
  act(() => tree.root.findAllByType(Image)[1].props.onLoad());
  act(() => { oldEvents.onLoad(); oldEvents.onError(); });
  const current = tree.root.findAllByType(Image)[1];
  expect(current.props.source).toEqual({ uri: 'file:///new.webp' });
  expect(StyleSheet.flatten(current.props.style).opacity).toBe(1);
  expect(evictBackgroundAsset).not.toHaveBeenCalled();
});

test('inactive screens defer requests until focus and blur cancels their subscription', () => {
  const listeners: Record<string, () => void> = {};
  const navigation = {
    isFocused: () => false,
    addListener: (event: string, listener: () => void) => { listeners[event] = listener; return jest.fn(); },
  };
  act(() => { tree = TestRenderer.create(
    <NavigationContext.Provider value={navigation as never}><BackgroundArtwork source={source} /></NavigationContext.Provider>,
  ); });
  expect(deferred).toHaveLength(0);
  act(() => listeners.focus());
  act(() => deferred[0]());
  act(() => listeners.blur());
  expect(releases[0]).toHaveBeenCalledTimes(1);
  act(() => callbacks[0]('file:///late.webp'));
  expect(tree.root.findAllByType(Image)).toHaveLength(1);
});

test('reader illustrations share deferred work and keep fallback until native decode', () => {
  act(() => { tree = TestRenderer.create(<CachedArtwork source={readerIllustrationAsset('deity-krishna-bansuri')} fallback={<Image source={99} />} />); });
  expect(tree.root.findByType(Image).props.source).toBe(99);
  expect(subscribeBackgroundAsset).not.toHaveBeenCalled();
  act(() => deferred[0]());
  expect(subscribeBackgroundAsset).toHaveBeenCalledWith(expect.objectContaining({
    subdir: 'reader-illustrations', remoteUrl: expect.stringContaining('/reader-illustrations/krishna-fixture.webp'),
  }), expect.any(Function));
  act(() => callbacks[0]('file:///krishna.webp'));
  const remote = tree.root.findAllByType(Image)[1];
  expect(StyleSheet.flatten(remote.props.style).opacity).toBe(0);
  act(() => remote.props.onLoad());
  expect(StyleSheet.flatten(remote.props.style).opacity).toBe(1);
});

test.each([
  backgroundAsset('backgrounds--theerth-karni-mata'),
  backgroundAsset('chalisa--Hanuman_sita'),
  backgroundAsset('chalisa--Ram_hanuman'),
  backgroundAsset('backgrounds--deity-rama-darbar'),
  readerIllustrationAsset('theerth-karni-mata'),
])('reviewed correction %s paints immediately without requesting stale cached art', corrected => {
  act(() => { tree = TestRenderer.create(<CachedArtwork source={corrected} fallback={<Image source={99} />} />); });
  expect(tree.root.findByType(Image).props.source).toBe(bundledArtworkCorrection(corrected));
  expect(deferred).toHaveLength(0);
  expect(subscribeBackgroundAsset).not.toHaveBeenCalled();
});

test('sharing a bundled correction waits for native paint, including after changing the source', async () => {
  const capture = createArtworkPaintBarrier();
  const corrected = backgroundAsset('backgrounds--theerth-karni-mata');
  act(() => { tree = TestRenderer.create(<ArtworkCaptureContext.Provider value={capture}><CachedArtwork source={corrected} /></ArtworkCaptureContext.Provider>); });
  let painted = false;
  const waiting = capture.wait(1000).then(result => { painted = true; return result; });
  await Promise.resolve();
  expect(painted).toBe(false);
  act(() => tree.root.findByType(Image).props.onLoad());
  await expect(waiting).resolves.toBe(true);
  const oldEvents = tree.root.findByType(Image).props;
  act(() => tree.update(<ArtworkCaptureContext.Provider value={capture}><CachedArtwork source={readerIllustrationAsset('theerth-karni-mata')} /></ArtworkCaptureContext.Provider>));
  painted = false;
  const changed = capture.wait(1000).then(result => { painted = true; return result; });
  await Promise.resolve();
  expect(painted).toBe(false);
  act(() => { oldEvents.onLoad(); oldEvents.onError(); });
  await Promise.resolve();
  expect(painted).toBe(false);
  act(() => tree.root.findByType(Image).props.onLoad());
  await expect(changed).resolves.toBe(true);
});
