import React from 'react';
import { Image } from 'react-native';
import TestRenderer, { act } from 'react-test-renderer';
import VedanshWordmark from '../VedanshWordmark';
import { ArtworkCaptureContext, createArtworkPaintBarrier } from '../ArtworkCaptureContext';

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
