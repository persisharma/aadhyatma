import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { DevotionalVerseBody, DevotionalFooter, DevotionalHero } from '../DevotionalFrame';
import manifest from '../../../assets/devotional-share/manifest.json';
import { devotionalFrameSpec } from '@/data/devotionalFrameSpec';
import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import { splitDevotionalMeaning } from '@/utils/devotionalShareLayout';
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
  expect(StyleSheet.flatten(image.parent!.props.style).height).toBe(48);
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
