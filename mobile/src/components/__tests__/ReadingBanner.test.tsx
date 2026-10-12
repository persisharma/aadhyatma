import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, View } from 'react-native';
import ReadingBanner from '../ReadingBanner';
import CachedArtwork from '../CachedArtwork';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import { backgroundAsset } from '@/data/backgroundAsset';
import manifest from '@/data/backgroundAssetManifest.json';
import frames from '../readingBannerFrames.json';
import aliases from '@/data/readerIllustrationAliases.json';

jest.mock('../CachedArtwork', () => jest.fn(() => null));

test('every focal crop covers the banner without stretching the painting', () => {
  for (const [stem, asset] of Object.entries(manifest.assets)) {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<ReadingBanner source={backgroundAsset(stem as keyof typeof manifest.assets)} />); });
    const props = tree.root.findByType(CachedArtwork).props;
    if (stem in aliases) {
      expect(props.source.kind).toBe('reader-illustration');
      expect(props.resizeMode).toBe('contain');
      expect(props.imageStyle).toBeUndefined();
    }
    if (props.resizeMode === 'cover') {
      for (const width of [280, 320, 360]) {
        const height = width / 2;
        const style = StyleSheet.flatten(props.imageStyle);
        const imageWidth = parseFloat(style.width) * width / 100;
        const imageHeight = parseFloat(style.height) * height / 100;
        const left = parseFloat(style.left) * width / 100;
        const top = parseFloat(style.top) * height / 100;
        expect(imageWidth / imageHeight).toBeCloseTo(asset.width / asset.height, 5);
        expect(left).toBeLessThanOrEqual(0);
        expect(top).toBeLessThanOrEqual(0);
        expect(left + imageWidth).toBeGreaterThanOrEqual(width - 0.0001);
        expect(top + imageHeight).toBeGreaterThanOrEqual(height - 0.0001);
      }
    }
    act(() => tree.unmount());
  }
});

test('published complete compositions retain the supplied immediate manuscript fallback', () => {
  for (const stem of ['gita--krishna_arjuna_vishvarupa', 'backgrounds--deity-navagraha-icons', 'chalisa--Ram_hanuman'] as const) {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => { tree = TestRenderer.create(<ReadingBanner source={backgroundAsset(stem)} fallback={<View testID="manuscript" />} />); });
    const props = tree.root.findByType(CachedArtwork).props;
    expect(props.resizeMode).toBe('contain');
    expect(props.imageStyle).toBeUndefined();
    expect(props.fallback.props.testID).toBe('manuscript');
    act(() => tree.unmount());
  }
});

test('changing portrait to landscape keeps a compact reserved frame, including wider screens', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ReadingBanner source={backgroundAsset('backgrounds--daan-annapurna-bhiksha')} testID="banner" />); });
  const before = StyleSheet.flatten(tree.root.findByProps({ testID: 'banner' }).findByType(View).props.style);
  act(() => tree.update(<ReadingBanner source={backgroundAsset('backgrounds--source-vishnu-narayana-option2')} testID="banner" />));
  const after = StyleSheet.flatten(tree.root.findByProps({ testID: 'banner' }).findByType(View).props.style);
  expect(after).toEqual(before);
  for (const availableWidth of [280, 320, 402, 768, 1024]) {
    const width = Math.min(availableWidth, after.maxWidth);
    expect(width / after.aspectRatio).toBeLessThanOrEqual(180);
    expect(width / (width / after.aspectRatio)).toBe(2);
  }
  act(() => tree.unmount());
});

test('curated frames reference existing paintings and cannot crop beyond the image', () => {
  for (const [stem, frame] of Object.entries(frames)) {
    expect(manifest.assets).toHaveProperty(stem);
    if ('y' in frame) {
      expect(frame.y).toBeGreaterThanOrEqual(0);
      expect(frame.y).toBeLessThanOrEqual(1);
    }
  }
});

test('dedicated reader illustrations show the whole canvas with the supplied immediate fallback', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  const fallback = <View testID="neutral-manuscript" />;
  act(() => { tree = TestRenderer.create(<ReadingBanner source={readerIllustrationAsset('deity-krishna-bansuri')} fallback={fallback} />); });
  const props = tree.root.findByType(CachedArtwork).props;
  expect(props.resizeMode).toBe('contain');
  expect(props.imageStyle).toBeUndefined();
  expect(props.fallback).toBe(fallback);
  act(() => tree.unmount());
});
