import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { DevotionalVerseBody, DevotionalFooter, DevotionalHero } from '../DevotionalFrame';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalFrameSpec } from '@/data/devotionalFrameSpec';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import { splitDevotionalMeaning } from '@/utils/devotionalShareLayout';

// The masters come from R2 through the download-once cache; tests resolve them to a local file.
jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: (request: { key: string; ext: string }, listener: (uri: string | null) => void) => { listener(`file:///cache/${request.key}.${request.ext}`); return () => undefined; },
  evictBackgroundAsset: jest.fn(async () => undefined),
}));
it('retains the complete long meaning and all commentary paragraphs', () => {
  const meaning = 'A complete meaning. '.repeat(100) + '\n\nFirst commentary.\n\nSecond commentary.';
  let tree: ReactTestRenderer;
  act(() => { tree = create(<DevotionalVerseBody header="Test" verse="Om" meaning={meaning} lang="en" art="shiva" verseStyle={{}} meaningStyle={{}} exportMode />); });
  const text = tree!.root.findByProps({ testID: 'devotional-share-meaning' });
  const commentary = tree!.root.findByProps({ testID: 'devotional-share-commentary' });
  expect(text.props.children + '\n\n' + commentary.props.children).toBe(meaning);
  expect(text.props.numberOfLines).toBeUndefined(); expect(text.props.adjustsFontSizeToFit).toBeUndefined();
  const frame = tree!.root.findByProps({ testID: 'devotional-meaning-frame' });
  const style = StyleSheet.flatten(frame.findAllByType(View).find(n => n.props.onLayout)?.props.style) ?? {};
  expect(StyleSheet.flatten(text.parent!.props.style).paddingHorizontal).toBeGreaterThan(20);
  expect(style.height).toBeUndefined(); expect(style.maxHeight).toBeUndefined(); act(() => tree!.unmount());
});
it('does not invent commentary', () => {
  expect(splitDevotionalMeaning('One complete paragraph.')).toEqual({ meaning: 'One complete paragraph.', commentary: '' });
  expect(splitDevotionalMeaning('')).toEqual({ meaning: '', commentary: '' });
});
it('keeps the scenic footer after content', () => {
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalFooter art="durga" width={324} />); });
  const footer = tree!.root.findByProps({ testID: 'devotional-footer' }), image = footer.findAllByType(Image)[0];
  let clip = image.parent!; while (clip.type !== View) clip = clip.parent!; // the slice's clipping box, above the R2 image wrapper
  expect(StyleSheet.flatten(clip.props.style).height).toBe(48);
  expect((StyleSheet.flatten(footer.props.style) ?? {}).position).toBeUndefined(); act(() => tree!.unmount());
});
it.each([288, 358, 540])('uses explicit full-master dimensions at width %s', width => {
  for (const art of Object.keys(manifest.assets) as DevotionalArt[]) {
    let tree: ReactTestRenderer; act(() => { tree = create(<><DevotionalHero art={art} lang="hi" width={width} /><DevotionalFooter art={art} width={width} /></>); });
    const images = tree!.root.findAllByType(Image);
    const footer = StyleSheet.flatten(images.find(n => n.props.testID === 'devotional-footer-image')!.props.style);
    expect(footer.width).toBe(width); expect(footer.height).toBe(width * 1456 / 1080); expect(footer.top).toBe(-width * 1296 / 1080);
    const hero = StyleSheet.flatten(images.find(n => n.props.testID === 'devotional-hero-image')!.props.style);
    expect(hero.width).toBe(width); expect(hero.height).toBe(art === 'prayer' ? devotionalFrameSpec(art).hero * width / 1080 : width * 1456 / 1080); act(() => tree!.unmount());
  }
});
it('grows the meaning box without distorting decorative caps or hiding scripture', () => {
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalVerseBody header="Test" verse="A complete verse" meaning={'Complete meaning. '.repeat(200)} lang="en" art="vishnu" verseStyle={{}} meaningStyle={{}} exportMode />); });
  const frame = tree!.root.findByProps({ testID: 'devotional-meaning-frame' });
  const caps = () => frame.findAllByType(Image).filter(n => !n.props.testID).map(n => StyleSheet.flatten(n.props.style));
  const before = caps(); act(() => frame.findAllByType(View).find(n => n.props.onLayout)!.props.onLayout({ nativeEvent: { layout: { height: 1200 } } }));
  expect(caps()).toEqual(before); expect(tree!.root.findByProps({ testID: 'devotional-share-verse' }).props.numberOfLines).toBeUndefined(); act(() => tree!.unmount());
});
it('puts a long explanation on plain paper with no baked scenery to stretch', () => {
  const meaning = 'The meaning.\n\n' + 'A long explanation that keeps going. '.repeat(60);
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalVerseBody header="Test" verse="Om" meaning={meaning} lang="en" art="hanuman" verseStyle={{}} meaningStyle={{}} exportMode />); });
  const panel = tree!.root.findByProps({ testID: 'devotional-commentary-panel' });
  // Flat paper box (card bg), never a master image — so nothing stretches as it grows.
  expect(panel.type).toBe(View);
  expect(StyleSheet.flatten(panel.props.style).backgroundColor).toBe('#FAE7BE');
  expect(panel.findAllByType(Image)).toHaveLength(0);
  expect(tree!.root.findByProps({ testID: 'devotional-share-commentary' }).props.children).toContain('A long explanation');
  act(() => tree!.unmount());
});
it('collapses the explanation box to nothing when the verse has meaning only', () => {
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalVerseBody header="Test" verse="Om" meaning="Just a meaning, no explanation." lang="en" art="krishna" verseStyle={{}} meaningStyle={{}} exportMode />); });
  // No empty band before the footer scenery — the box is simply not rendered.
  expect(tree!.root.findAllByProps({ testID: 'devotional-commentary-panel' })).toHaveLength(0);
  act(() => tree!.unmount());
});
it('keeps the source header one calibrated size and script-correct face, long or short', () => {
  const render = (header: string) => {
    let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalVerseBody header={header} verse="Om" meaning="A meaning." lang="hi" art="krishna" verseStyle={{}} meaningStyle={{}} exportMode />); });
    const source = tree!.root.findByProps({ testID: 'devotional-share-source' }); const style = StyleSheet.flatten(source.props.style);
    const out = { size: style.fontSize, face: style.fontFamily, fit: source.props.adjustsFontSizeToFit, lines: source.props.numberOfLines };
    act(() => tree!.unmount()); return out;
  };
  const short = render('श्रीकृष्ण'), long = render('श्रीमद्भगवद्गीता · अध्याय २, श्लोक ४७');
  expect(short.size).toBe(long.size); expect(short.face).toBe(long.face);
  expect(long.fit).toBe(true); expect(long.lines).toBe(2);
});
it.each(['hi', 'en', 'gu', 'kn'] as const)('gives every %s first line room for the marks above it', lang => {
  const meaning = 'हे लक्ष्मण! धनुष-बाण लाओ, मैं अग्निबाण से समुद्र को सोख डालूँ। '.repeat(3) + '\n\nमूर्ख से विनय।';
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalVerseBody header="सुंदरकाण्ड · चौपाई ६०·१" verse="लछिमन बान सरासन आनू।" meaning={meaning} lang={lang} art="hanuman" verseStyle={{}} meaningStyle={{}} exportMode />); });
  for (const id of ['source', 'verse', 'meaning', 'commentary'].map(k => `devotional-share-${k}`).concat('devotional-meaning-label')) {
    const s = StyleSheet.flatten(tree!.root.findByProps({ testID: id }).props.style);
    expect(s.paddingTop ?? 0).toBeGreaterThanOrEqual(1.53 * s.fontSize - s.lineHeight);
    expect((s.paddingTop ?? 0) + (s.marginTop ?? 0)).toBe(0);
  }
  act(() => tree!.unmount());
});

describe('R2 master states', () => {
  const cache = jest.requireMock('@/utils/backgroundAssetCache') as { subscribeBackgroundAsset: unknown };
  const original = cache.subscribeBackgroundAsset;
  afterEach(() => { cache.subscribeBackgroundAsset = original; });
  it('shows paper and reports nothing while the master downloads', () => {
    cache.subscribeBackgroundAsset = () => () => undefined;
    const onLoad = jest.fn(), onError = jest.fn();
    let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalFooter art="durga" width={324} onLoad={onLoad} onError={onError} />); });
    expect(tree!.root.findAllByType(Image)).toHaveLength(0);
    expect(StyleSheet.flatten(tree!.root.findAllByType(View).find(n => n.props.testID === 'devotional-footer-image')!.props.style).backgroundColor).toBe('#FAE7BE');
    expect(onLoad).not.toHaveBeenCalled(); expect(onError).not.toHaveBeenCalled(); act(() => tree!.unmount());
  });
  it('reports an error when the master cannot be downloaded, so capture refuses', () => {
    cache.subscribeBackgroundAsset = (_: unknown, listener: (uri: string | null) => void) => { listener(null); return () => undefined; };
    const onError = jest.fn();
    let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalFooter art="durga" width={324} onError={onError} />); });
    expect(onError).toHaveBeenCalledTimes(1); act(() => tree!.unmount());
  });
  it('paints the cached local file once downloaded', () => {
    let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalFooter art="durga" width={324} />); });
    expect(tree!.root.findByType(Image).props.source).toEqual({ uri: expect.stringMatching(/^file:\/\/\/cache\/[0-9a-f]{16}\.webp$/) });
    act(() => tree!.unmount());
  });
});
