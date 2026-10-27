import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Pressable, StyleSheet, Text } from 'react-native';
import ObservanceArtwork from '../ObservanceArtwork';
import ObservanceTodaySummary from '../ObservanceTodaySummary';
import CatalogCategoryTile from '../CatalogCategoryTile';
import CachedArtwork from '../CachedArtwork';
import type { ObservanceRule } from '@/panchang/types';
import { observanceThumbnail } from '@/panchang/observanceThumbnails';
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
  expect(art.props.source).toEqual(observanceThumbnail(observancePortraits({ deityEn: 'Shri Ganesh' })[0].source));
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

test('Ahoi uses a complete square painting without a poster zoom', () => {
  const tree = render(<ObservanceArtwork rule={{ category: 'vrat', deityEn: 'Ahoi Mata' }} width={144} height={96} variant="upcoming" />);
  const art = tree.root.findByType(CachedArtwork);
  const portrait = observancePortraits({ deityEn: 'Ahoi Mata' })[0];
  expect(art.props.source).toEqual(portrait.source);
  expect(art.props.resizeMode).toBe('contain');
  expect(art.props.imageStyle.height).toBe(144);
  expect(art.props.imageStyle.left).toBe(0);
  expect(art.props.imageStyle.top).toBe(0);
});

test('joint subjects use a coherent shared painting instead of a split portrait strip', () => {
  const tree = render(<ObservanceArtwork rule={{ category: 'vrat', deityEn: 'Lord Murugan and Shiva–Parvati' }} />);
  expect(tree.root.findAllByType(CachedArtwork)).toHaveLength(1);
});

test.each(['hi', 'en', 'gu', 'kn'] as const)('category destinations remain accessible in %s with wrapping text', lang => {
  const open = jest.fn();
  const tree = render(<CatalogCategoryTile artwork="granth" lang={lang} title="कथा" subtitle="90 कथाएँ" accessibilityLabel="Katha library, 90" onPress={open} />);
  const button = tree.root.find(node => node.props.accessibilityRole === 'button' && node.props.accessibilityLabel === 'Katha library, 90' && typeof node.props.onPress === 'function');
  act(() => button.props.onPress());
  expect(open).toHaveBeenCalledTimes(1);
  expect(StyleSheet.flatten(typeof button.props.style === 'function' ? button.props.style({ pressed: false }) : button.props.style).minHeight).toBeGreaterThanOrEqual(44);
  tree.root.findAllByType(Text).forEach(node => expect(node.props.numberOfLines).toBeUndefined());
});


test('Katha category resolves a painted scene rather than an unmapped legacy symbol', () => {
  const tree = render(<CatalogCategoryTile artwork="granth" lang="en" title="Katha" subtitle="90 stories" accessibilityLabel="Katha library, 90" onPress={() => {}} />);
  const art = tree.root.findByType(CachedArtwork);
  expect(art.props.source).toBeDefined();
  expect(art.props.fallback).toBeUndefined();
});
