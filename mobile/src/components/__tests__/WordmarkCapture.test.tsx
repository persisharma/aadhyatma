import React from 'react';
import { Image, StyleSheet } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import VedanshWordmark, { WordmarkArtwork } from '../VedanshWordmark';
import manifest from '@assets/branding/wordmarks/manifest.json';
import { ArtworkCaptureContext, createArtworkPaintBarrier } from '../ArtworkCaptureContext';

// RN prepends {width, height} from the bundled bitmap. Every consumer must
// override BOTH dimensions, including the compact Panchang header/brand strip.
it.each([
  ['hi', 58], ['hi', 78], ['hi', 110],
  ['en', 86], ['en', 132], ['en', 180],
] as const)('%s wordmark at %sdp overrides the native source height', (kind, width) => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<WordmarkArtwork kind={kind} width={width} />); });
  const style = StyleSheet.flatten(tree.root.findByType(Image).props.style);
  const metrics = manifest.names[kind];
  expect(style.width).toBe(width);
  expect(style.height).toBeCloseTo(width * metrics.height / metrics.width);
  expect(style.height).toBeLessThan(64);
  expect(style.aspectRatio).toBe(metrics.width / metrics.height);
  expect(tree.root.findByType(Image).props.resizeMode).toBe('contain');
  act(() => tree.unmount());
});

it('a real share-capture barrier waits for both mounted wordmark bitmaps', async () => {
  const capture = createArtworkPaintBarrier();
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ArtworkCaptureContext.Provider value={capture}><VedanshWordmark lang="en" bilingual fixedExport /></ArtworkCaptureContext.Provider>); });
  let done = false;
  const waiting = capture.wait().then(() => { done = true; });
  await act(async () => { await Promise.resolve(); }); expect(done).toBe(false);
  const images = tree.root.findAllByType(Image);
  act(() => images[0].props.onLoad());
  await act(async () => { await Promise.resolve(); }); expect(done).toBe(false);
  await act(async () => { images[1].props.onLoad(); await waiting; }); expect(done).toBe(true);
  act(() => tree.unmount());
});
it('cancelling a share unmount releases its pending wordmark without a dangling timer', async () => {
  const capture = createArtworkPaintBarrier(); let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ArtworkCaptureContext.Provider value={capture}><VedanshWordmark lang="hi" fixedExport /></ArtworkCaptureContext.Provider>); });
  const waiting = capture.wait();
  act(() => tree.unmount());
  await act(async () => { await waiting; });
  await expect(capture.wait()).resolves.toBe(false);
});

