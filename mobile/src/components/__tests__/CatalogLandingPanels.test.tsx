import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, StyleSheet, Text } from 'react-native';
import ObservanceArtwork from '../ObservanceArtwork';
import ObservanceTodaySummary from '../ObservanceTodaySummary';
import CatalogCategoryTile from '../CatalogCategoryTile';
import CachedArtwork from '../CachedArtwork';
import type { ObservanceRule } from '@/panchang/types';
import { observancePortraits } from '@/panchang/observancePortraits';

const rule = {
  id: 'valmiki-jayanti', category: 'festival', deityEn: 'Maharishi Valmiki', deityHi: 'महर्षि वाल्मीकि',
  nameHi: 'वाल्मीकि जयंती', nameEn: 'Valmiki Jayanti',
  shortDescriptionHi: 'पूरा विवरण सुरक्षित रहता है।', shortDescriptionEn: 'The complete authored description remains available.',
} as ObservanceRule;
const trees: TestRenderer.ReactTestRenderer[] = [];
function render(node: React.ReactElement) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(node); });
  trees.push(tree);
  return tree;
}
afterEach(() => act(() => trees.splice(0).forEach(tree => tree.unmount())));

test('the large hero keeps reading and description expansion independent', () => {
  const read = jest.fn();
  const tree = render(<ObservanceTodaySummary rule={rule} titleHi={rule.nameHi} titleEn={rule.nameEn} lang="en">
    <Pressable accessibilityLabel="Read Ramayana" onPress={read}><Text>Read Ramayana</Text></Pressable>
  </ObservanceTodaySummary>);
  const description = () => tree.root.findAllByType(Text).find(node => node.props.testID === 'observance-summary-valmiki-jayanti')!;
  const button = (label: string) => tree.root.find(node => node.props.accessibilityLabel === label && typeof node.props.onPress === 'function');
  act(() => button('Read Ramayana').props.onPress());
  expect(read).toHaveBeenCalledTimes(1);
  expect(description().props.numberOfLines).toBe(2);
  act(() => button(`Expand description Valmiki Jayanti. ${rule.shortDescriptionEn}`).props.onPress());
  expect(description().props.numberOfLines).toBeUndefined();
  expect(description().props.children).toBe(rule.shortDescriptionEn);
  expect(read).toHaveBeenCalledTimes(1);
});

test('wide panels use the already published single-deity scene', () => {
  const tree = render(<ObservanceArtwork rule={{ category: 'vrat', deityEn: 'Shri Ganesh' }} width={144} height={96} variant="upcoming" />);
  const art = tree.root.findByType(CachedArtwork);
  expect(art.props.source).toEqual(observancePortraits({ deityEn: 'Shri Ganesh' })[0].source);
  expect(art.props.resizeMode).toBe('contain');
  expect(art.props.imageStyle).toMatchObject({ width: 192, height: 96, top: 0 });
  expect(art.props.style).toMatchObject({ width: 144, height: 96 });
});

test('tall panels keep off-centre Vishnu inside the painted frame', () => {
  const tree = render(<ObservanceArtwork rule={{ category: 'vrat', deityEn: 'Lord Vishnu' }} width={124} height={190} variant="upcoming" />);
  const style = tree.root.findByType(CachedArtwork).props.imageStyle;
  const frame = observancePortraits({ deityEn: 'Lord Vishnu' })[0].frame;
  expect(style.left + style.width * frame.x).toBeCloseTo(62);
  expect(style.left).toBeLessThanOrEqual(0);
  expect(style.left + style.width).toBeGreaterThanOrEqual(124);
  expect(style.top).toBeLessThanOrEqual(0);
  expect(style.top + style.height).toBeGreaterThanOrEqual(190);
});

test('branded Ahoi masters retain their reviewed portrait frame in wider panels', () => {
  const tree = render(<ObservanceArtwork rule={{ category: 'vrat', deityEn: 'Ahoi Mata' }} width={144} height={96} variant="upcoming" />);
  const art = tree.root.findByType(CachedArtwork);
  const portrait = observancePortraits({ deityEn: 'Ahoi Mata' })[0];
  expect(art.props.source).toEqual(portrait.source);
  expect(art.props.resizeMode).toBe('contain');
  expect(art.props.imageStyle.height).toBe(96 * portrait.frame.zoom);
  expect(art.props.imageStyle.left).toBe(72 - 96 * portrait.frame.zoom * portrait.frame.aspect * portrait.frame.x);
});

test('composite panels retain all named portraits and the full-figure list geometry', () => {
  const subject = { category: 'vrat' as const, deityEn: 'Lord Murugan and Shiva–Parvati' };
  const portraits = observancePortraits(subject);
  const wide = render(<ObservanceArtwork rule={subject} width={150} height={100} variant="upcoming" />);
  const panes = wide.root.findAllByType(CachedArtwork);
  expect(panes.map(node => node.props.source)).toEqual(portraits.map(p => p.source));
  expect(panes).toHaveLength(3);
  panes.forEach(node => expect(node.props.style.width).toBe(50));
  const row = render(<ObservanceArtwork rule={{ category: 'vrat', deityEn: 'Shri Ganesh' }} />);
  const p = observancePortraits({ deityEn: 'Shri Ganesh' })[0];
  expect(row.root.findByType(CachedArtwork).props.imageStyle).toEqual({
    width: 78 * p.frame.aspect, height: 78,
    left: 39 - 78 * p.frame.aspect * p.frame.x, top: 0, right: 'auto', bottom: 'auto',
  });
});

test.each(['hi', 'en', 'gu', 'kn'] as const)('category destinations remain accessible in %s with wrapping text', lang => {
  const open = jest.fn();
  const tree = render(<CatalogCategoryTile artwork="sanskar" lang={lang} title="कथा" subtitle="90 कथाएँ" accessibilityLabel="Katha library, 90" onPress={open} />);
  const button = tree.root.find(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Katha library, 90' && typeof node.props.onPress === 'function');
  act(() => button.props.onPress());
  expect(open).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(typeof button.props.style === 'function' ? button.props.style({ pressed: false }) : button.props.style).minHeight).toBeGreaterThanOrEqual(44);
  tree.root.findAllByType(Text).forEach(node => expect(node.props.numberOfLines).toBeUndefined());
});
