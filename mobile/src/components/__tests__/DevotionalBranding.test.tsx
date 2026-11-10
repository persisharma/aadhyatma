import React from 'react';
import { Image, Text, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { DevotionalHero, DevotionalFooter } from '../DevotionalFrame';

jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: (request: { key: string; ext: string }, listener: (uri: string | null) => void) => {
    listener(`file:///cache/${request.key}.${request.ext}`); return () => undefined;
  },
  evictBackgroundAsset: jest.fn(async () => undefined),
}));

let tree: ReactTestRenderer;
afterEach(() => { if (tree) act(() => tree.unmount()); });

it.each(['hi', 'en', 'gu', 'kn'] as const)('shows just one approved %s header mark and the English .app footer', lang => {
  act(() => { tree = create(<><DevotionalHero art="hanuman" lang={lang} width={540} /><DevotionalFooter art="hanuman" width={540} /></>); });
  const header = tree.root.findByProps({ testID: 'devotional-header-brand' });
  const logos = header.findAllByType(Image);
  expect(logos).toHaveLength(1);
  expect(logos[0].props.testID).toBe(`vedansh-wordmark-${lang === 'hi' ? 'hi' : 'en'}`);
  expect(logos[0].props.source).toBe(lang === 'hi'
    ? require('@assets/branding/wordmarks/hindi.png') : require('@assets/branding/wordmarks/english.png'));
  expect(header.findAllByType(Text)).toHaveLength(0);
  const footer = tree.root.findByProps({ testID: 'devotional-footer-brand' });
  expect(footer.findAllByType(Image)).toHaveLength(1);
  expect(footer.findByType(Image).props.source).toBe(require('@assets/branding/wordmarks/english.png'));
  const suffix = footer.findByType(Text);
  expect(suffix.props.children).toBe('.app');
  expect(suffix.props.allowFontScaling).toBe(false);
  expect(StyleSheet.flatten(logos[0].props.style).tintColor).toBeUndefined();
});

it.each(['hero', 'footer'] as const)('waits for both %s master and wordmark decoding, and refuses a broken wordmark', part => {
  const loaded = jest.fn(), error = jest.fn();
  const mount = () => part === 'hero'
    ? <DevotionalHero art="hanuman" lang="hi" width={540} onLoad={loaded} onError={error} />
    : <DevotionalFooter art="hanuman" width={540} onLoad={loaded} onError={error} />;
  act(() => { tree = create(mount()); });
  const master = tree.root.findAllByType(Image).find(n => n.props.testID === `devotional-${part}-image`)!;
  const wordmark = tree.root.findAllByType(Image).find(n => n.props.testID?.startsWith('vedansh-wordmark-'))!;
  act(() => master.props.onLoad());
  expect(loaded).not.toHaveBeenCalled();
  act(() => wordmark.props.onError());
  expect(error).toHaveBeenCalledTimes(1);
  act(() => wordmark.props.onLoad());
  expect(loaded).not.toHaveBeenCalled();
});

it('resets hero branding readiness on a language switch and ignores the removed mark', () => {
  const loaded = jest.fn();
  act(() => { tree = create(<DevotionalHero art="hanuman" lang="hi" width={540} onLoad={loaded} />); });
  const oldImages = tree.root.findAllByType(Image).map(n => n.props);
  act(() => { for (const props of oldImages) props.onLoad(); });
  expect(loaded).toHaveBeenCalledTimes(1); loaded.mockClear();
  act(() => { tree.update(<DevotionalHero art="hanuman" lang="en" width={540} onLoad={loaded} />); });
  act(() => { for (const props of oldImages) props.onLoad(); });
  expect(loaded).not.toHaveBeenCalled();
  act(() => { for (const img of tree.root.findAllByType(Image)) img.props.onLoad(); });
  expect(loaded).toHaveBeenCalledTimes(1);
});

it.each([['hanuman', 180], ['prayer', 180], ['parshuram', 198]] as const)(
  'sizes the %s header badge to the painted plaque and fits the wordmark inside it', (art, badgeWidth) => {
    for (const lang of ['hi', 'en'] as const) {
      act(() => { tree = create(<DevotionalHero art={art} lang={lang} width={1080} />); });
      const header = tree.root.findByProps({ testID: 'devotional-header-brand' });
      // At width 1080 master-space coordinates are 1:1. The painted plaque's outer edge is
      // ≈37–209 × 54–167 (Parshuram to ≈227); the old 244×132 badge spilled past it.
      const box = StyleSheet.flatten(header.props.style);
      expect(box).toMatchObject({ left: 34, top: 48, width: badgeWidth, height: 120 });
      expect(box.left + box.width).toBeGreaterThanOrEqual(art === 'parshuram' ? 231 : 212);
      expect(box.top + box.height).toBeGreaterThanOrEqual(168);
      const mark = StyleSheet.flatten(header.findByType(Image).props.style);
      // Inside the inner frame line (8px inset) with clearance on both sides.
      expect(mark.width).toBeLessThanOrEqual(180 - 2 * 14);
      expect(mark.width).toBeGreaterThanOrEqual(180 - 2 * 16);
      act(() => tree.unmount());
    }
  });
