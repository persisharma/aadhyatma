import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { DevotionalVerseBody, DevotionalFooter, DevotionalHero } from '../DevotionalFrame';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalArtRequest, devotionalSubjectArt, devotionalPlateArt } from '@/data/devotionalShareArt';
import { devotionalFrameSpec } from '@/data/devotionalFrameSpec';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import { splitDevotionalMeaning } from '@/utils/devotionalShareLayout';

// The masters come from R2 through the download-once cache; tests resolve them to a local file.
jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: (request: { key: string; ext: string }, listener: (uri: string | null) => void) => { listener(`file:///cache/${request.key}.${request.ext}`); return () => undefined; },
  evictBackgroundAsset: jest.fn(async () => undefined),
}));
it.each([288, 358, 540])('keeps readable verse type and lets the full paper width wrap at %s', width => {
  const verse = 'आशापाशशतैर्बद्धाः कामक्रोधपरायणाः। ईहन्ते कामभोगार्थमन्यायेनार्थसञ्चयान्।।16.12।।';
  let tree: ReactTestRenderer;
  act(() => { tree = create(<DevotionalVerseBody header="गीता · 16.12" verse={verse} meaning="अर्थ" lang="hi" art="krishna" width={width} verseStyle={{ fontSize: 22, lineHeight: 36 }} meaningStyle={{}} />); });
  const text = tree!.root.findByProps({ testID: 'devotional-share-verse' });
  expect(text.props.children).toBe(verse);
  expect(StyleSheet.flatten(text.props.style).fontSize).toBe(22);
  expect(StyleSheet.flatten(text.parent!.props.style).paddingHorizontal).toBe(55 * width / 1080);
  expect(text.props.adjustsFontSizeToFit).toBeUndefined();
  expect(text.props.numberOfLines).toBeUndefined();
  expect(text.props.allowFontScaling).toBe(true);
  act(() => tree!.unmount());
});
describe('one charan per row', () => {
  const rows = ['सुनत सभय मन मुख मुसुकाई।', 'कहत दसानन सबहि सुनाई॥'], flow = rows.join(' ');
  const mount = (exportMode = false) => create(<DevotionalVerseBody header="सुंदरकाण्ड" verse={flow} verseRows={rows} meaning="अर्थ" lang="hi" art="hanuman"
    width={358} verseStyle={{ fontSize: 23, lineHeight: 36 }} meaningStyle={{}} exportMode={exportMode} />);
  const verse = (tree: ReactTestRenderer) => tree.root.findByProps({ testID: 'devotional-share-verse' });
  it.each([[2, rows.join('\n')], [3, flow]])('shows %i native lines as %j once layout reports', (lines, shown) => {
    let tree: ReactTestRenderer; act(() => { tree = mount(); });
    expect(verse(tree!).props.children).toBe(rows.join('\n'));
    expect(StyleSheet.flatten(verse(tree!).props.style).opacity).toBe(0);
    act(() => verse(tree!).props.onTextLayout({ nativeEvent: { lines: Array.from({ length: lines }, () => ({})) } }));
    expect(verse(tree!).props.children).toBe(shown);
    expect(StyleSheet.flatten(verse(tree!).props.style).opacity).toBeUndefined();
    act(() => tree!.unmount());
  });
  it('falls back to the flowing verse when native layout never reports', () => {
    jest.useFakeTimers();
    let tree: ReactTestRenderer; act(() => { tree = mount(); });
    act(() => { jest.advanceTimersByTime(500); });
    expect(verse(tree!).props.children).toBe(flow);
    expect(StyleSheet.flatten(verse(tree!).props.style).opacity).toBeUndefined();
    act(() => tree!.unmount()); jest.useRealTimers();
  });
  it('shows the rows on the export card without probing', () => {
    let tree: ReactTestRenderer; act(() => { tree = mount(true); });
    expect(verse(tree!).props.children).toBe(rows.join('\n'));
    expect(verse(tree!).props.onTextLayout).toBeUndefined();
    expect(StyleSheet.flatten(verse(tree!).props.style).opacity).toBeUndefined();
    act(() => tree!.unmount());
  });
});
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
it('keeps a lone heading paragraph with the paragraph it heads', () => {
  expect(splitDevotionalMeaning('महत्त्व:\n\nपूरा अर्थ।')).toEqual({ meaning: 'महत्त्व:\nपूरा अर्थ।', commentary: '' });
  expect(splitDevotionalMeaning('Significance:\n\nThe meaning.\n\nMore.')).toEqual({ meaning: 'Significance:\nThe meaning.', commentary: 'More.' });
  expect(splitDevotionalMeaning('He said: be steadfast.\n\nMore.')).toEqual({ meaning: 'He said: be steadfast.', commentary: 'More.' });
});
it('keeps the scenic footer after content', () => {
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalFooter art="durga" width={324} />); });
  const footer = tree!.root.findByProps({ testID: 'devotional-footer' }), image = footer.findAllByType(Image)[0];
  let clip = image.parent!; while (clip.type !== View) clip = clip.parent!; // the slice's clipping box, above the R2 image wrapper
  expect(StyleSheet.flatten(clip.props.style).height).toBe(48);
  expect((StyleSheet.flatten(footer.props.style) ?? {}).position).toBeUndefined(); act(() => tree!.unmount());
});
it.each([288, 358, 540])('uses explicit full-master dimensions at width %s', width => {
  for (const art of [...Object.keys(manifest.assets), ...Object.keys(manifest.subjects)] as DevotionalArt[]) {
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
it('frames a long explanation with mirror-tiled side rules, never stretched scenery', () => {
  const meaning = 'The meaning.\n\n' + 'A long explanation that keeps going. '.repeat(60);
  const width = 540, spec = devotionalFrameSpec('hanuman'), band = (spec.verseEnd - spec.sourceEnd - 32) * width / 1080;
  let tree: ReactTestRenderer; act(() => { tree = create(<DevotionalVerseBody header="Test" verse="Om" meaning={meaning} lang="en" art="hanuman" verseStyle={{}} meaningStyle={{}} width={width} exportMode />); });
  const panel = tree!.root.findAllByProps({ testID: 'devotional-commentary-panel' }).find(n => n.props.onLayout)!;
  act(() => panel.props.onLayout({ nativeEvent: { layout: { height: band * 3.5 } } }));
  const tiles = panel.findAllByType(Image).filter(n => n.props.testID === 'devotional-commentary-panel-tile');
  expect(tiles).toHaveLength(4);
  // Each tile clips the verse band at the master's own scale; alternate tiles flip.
  for (const tile of tiles) expect(StyleSheet.flatten(tile.props.style).height).toBe(1456 * width / 1080);
  const flips = panel.findAllByType(View).filter(n => StyleSheet.flatten(n.props.style)?.transform);
  expect(flips).toHaveLength(2);
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

it.each(Object.keys(devotionalSubjectArt) as (keyof typeof devotionalSubjectArt)[])('uses the same complete %s master for scene, reading areas and footer', art => {
  let tree: ReactTestRenderer;
  act(() => { tree = create(<><DevotionalHero art={art} lang="hi" width={324} /><DevotionalVerseBody header="Source" verse="Om" meaning="Complete meaning." lang="hi" art={art} width={324} verseStyle={{}} meaningStyle={{}} /><DevotionalFooter art={art} width={324} /></>); });
  const hero = tree!.root.findAllByType(Image).find(n => n.props.testID === 'devotional-hero-image')!;
  expect(hero.props.source).toEqual({ uri: `file:///cache/${devotionalArtRequest(art)!.key}.webp` });
  expect(hero.props.resizeMode).toBe('stretch');
  expect(StyleSheet.flatten(hero.props.style).height).toBe(1456 * 324 / 1080);
  let clip = hero.parent!; while (clip.type !== View) clip = clip.parent!;
  expect(StyleSheet.flatten(clip.props.style).height).toBe(devotionalFrameSpec(art).hero * 324 / 1080);
  expect(devotionalPlateArt(art)).toBe(art);
  for (const image of tree!.root.findAllByType(Image).filter(n => n !== hero)) {
    expect(image.props.source).toEqual({ uri: `file:///cache/${devotionalArtRequest(art)!.key}.webp` });
  }
  act(() => tree!.unmount());
});

it('does not report a subject ready until its native image decodes, including source switches', () => {
  let tree: ReactTestRenderer;
  const ready = jest.fn(), error = jest.fn();
  act(() => { tree = create(<DevotionalHero art="lakshmi" lang="hi" width={324} onLoad={ready} onError={error} />); });
  expect(tree!.root.findAllByProps({ testID: 'devotional-subject-lakshmi' })).toHaveLength(0);
  act(() => tree!.root.findByType(Image).props.onLoad());
  expect(tree!.root.findAllByProps({ testID: 'devotional-subject-lakshmi' }).length).toBeGreaterThan(0);
  expect(ready).toHaveBeenCalledTimes(1);
  act(() => { tree!.update(<DevotionalHero art="kali" lang="hi" width={324} onLoad={ready} onError={error} />); });
  expect(tree!.root.findAllByProps({ testID: 'devotional-subject-kali' })).toHaveLength(0);
  act(() => tree!.root.findByType(Image).props.onError());
  expect(error).toHaveBeenCalledTimes(1);
  expect(tree!.root.findAllByProps({ testID: 'devotional-subject-kali' })).toHaveLength(0);
  act(() => tree!.root.findByType(Image).props.onLoad());
  expect(tree!.root.findAllByProps({ testID: 'devotional-subject-kali' }).length).toBeGreaterThan(0);
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
