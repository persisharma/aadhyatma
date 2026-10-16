import React from 'react';
import fs from 'fs';
import path from 'path';
import TestRenderer, { act } from 'react-test-renderer';

let mockLang = 'hi';
jest.mock('react-native', () => ({
  Image: Object.assign((props: object) => require('react').createElement('Image', props), { resolveAssetSource: () => ({ width: 960, height: 480 }) }),
  Pressable: 'Pressable', Text: 'Text', View: 'View',
  StyleSheet: { create: (x: unknown) => x, absoluteFillObject: { position: 'absolute' } },
  Platform: { OS: 'ios', select: (options: Record<string, unknown>) => options.ios ?? options.default },
}));
jest.mock('expo-linear-gradient', () => ({ LinearGradient: 'LinearGradient' }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/theme/ThemeContext', () => ({ useTheme: () => ({
  colors: {}, radii: { lg: 18, sm: 10 }, typography: require('@/theme/typography').typography,
}) }));
jest.mock('@/utils/assetCache', () => ({}));
jest.mock('@/utils/useCachedAsset', () => ({ useCachedAsset: () => null }));

const { default: ListingCard, ListingThumbImage, LISTING_THUMB_WIDTH, LISTING_THUMB_MIN_HEIGHT } = require('../ListingCard');
const { kidsStoryArtCoverGeometry } = require('../KidsStoryArt');
const { kidsStories } = require('@/data/kidsStories');
const { kidsStoryArtRetainedHeight } = require('@/utils/kidsStoryArtFrame');

const trees: TestRenderer.ReactTestRenderer[] = [];
afterEach(() => { trees.splice(0).forEach(tree => act(() => tree.unmount())); mockLang = 'hi'; });
function render(props: Record<string, unknown>) {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ListingCard onPress={jest.fn()} thumbnail={null} {...props} />); });
  trees.push(tree);
  const host = tree.root.find(node => node.type === ('Pressable' as any));
  const texts = tree.root.findAllByType('Text' as any);
  return { tree, host, texts, strings: texts.map(node => [].concat(node.props.children).join('')) };
}

test('renders eyebrow, a two-line title, a one-line description and the count — nothing else', () => {
  const { texts, strings } = render({ eyebrow: 'दिन 1', title: 'शैलपुत्री: पर्वत की पुत्री', description: 'पार्वती का जन्म और बचपन', meta: '4 पृष्ठ' });
  expect(strings).toEqual(['दिन 1', 'शैलपुत्री: पर्वत की पुत्री', 'पार्वती का जन्म और बचपन', '4 पृष्ठ', '›']);
  expect(texts[1].props.numberOfLines).toBe(2);
  expect(texts[2].props.numberOfLines).toBe(1);
});

test('the description sizes from the listing token, never the 34pt reading line height', () => {
  const { typography } = require('@/theme/typography');
  const { texts } = render({ title: 'T', description: 'D', meta: '2 पृष्ठ' });
  expect(texts[1].props.style).toMatchObject({ fontSize: typography.listingBody.fontSize, lineHeight: typography.listingBody.lineHeight });
  expect(texts[1].props.style.lineHeight).toBeLessThan(typography.meaning.lineHeight);
});

test('English uses the Latin sizes', () => {
  mockLang = 'en';
  const { typography } = require('@/theme/typography');
  const { texts } = render({ title: 'Karma', description: 'D', meta: '2 pages' });
  expect(texts[0].props.style).toMatchObject({ fontStyle: 'italic', fontSize: typography.listingTitleLatin.fontSize });
  expect(texts[1].props.style).toMatchObject({ fontSize: typography.listingBodyLatin.fontSize });
});

test('accessibility label keeps the Maestro shape and progress is exposed as a value', () => {
  const { host, tree } = render({ testID: 'card', eyebrow: 'Reading 1', title: 'Karma and its consequences', meta: '2 pages', progress: 0.5 });
  expect(host.props.accessibilityLabel).toBe('Reading 1. Karma and its consequences. 2 pages. Tap to open.');
  expect(host.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 50 });
  const fill = tree.root.findByProps({ testID: 'card-progress' }).children[0] as TestRenderer.ReactTestInstance;
  expect(fill.props.style[1].width).toBe('50%');
});

test('no progress bar where the section does not track progress', () => {
  const { host, tree } = render({ testID: 'card', title: 'T', meta: '2 pages' });
  expect(host.props.accessibilityValue).toBeUndefined();
  expect(tree.root.findAllByProps({ testID: 'card-progress' })).toHaveLength(0);
});

test('the thumb is 92 wide and stretches to the card height from a 4:5 minimum', () => {
  const { tree } = render({ testID: 'card', title: 'T', meta: '2 pages', thumbnail: <ListingThumbImage source={1} /> });
  const thumb = tree.root.findByProps({ testID: 'card-thumb' });
  expect(Object.assign({}, ...thumb.props.style)).toMatchObject({ width: 92, minHeight: 115, alignSelf: 'stretch' });
  expect(LISTING_THUMB_MIN_HEIGHT / LISTING_THUMB_WIDTH).toBeCloseTo(5 / 4);
});

test('a wide painting is cover-cropped around its focal point once the thumb is measured', () => {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<ListingThumbImage source={1} focusX={0.68} />); });
  trees.push(tree);
  expect(tree.root.findAllByType('Image' as any)).toHaveLength(0);
  act(() => tree.root.findByType('View' as any).props.onLayout({ nativeEvent: { layout: { width: 92, height: 115 } } }));
  const image = tree.root.findByType('Image' as any);
  expect(image.props.style).toMatchObject({ width: 230, height: 115 });
  expect(image.props.style.left).toBeCloseTo(46 - 0.68 * 230);
});

test('every story cover fills a listing thumb without showing its reviewed blank band', () => {
  for (const story of kidsStories) for (const height of [115, 140]) {
    const g = kidsStoryArtCoverGeometry(story.coverArt, 92, height);
    expect(g.top).toBe(0);
    expect(g.left).toBeLessThanOrEqual(0);
    expect(g.left + g.width).toBeGreaterThanOrEqual(92 - 1e-6);
    expect(g.height * kidsStoryArtRetainedHeight(story.coverArt)).toBeGreaterThanOrEqual(height - 1e-6);
    expect(g.width / g.height).toBeCloseTo(4 / 5);
  }
});

// RULEBOOK §3 "Listing cards": the section listings may not grow their own card
// again. A new illustrated listing joins this list and renders ListingCard.
test('every content listing screen renders the shared ListingCard and no private card', () => {
  const screens = ['ComicChaptersScreen.tsx', 'GarudPuranChaptersScreen.tsx', 'KidsStoryDeityScreen.tsx'];
  for (const file of screens) {
    const source = fs.readFileSync(path.join(__dirname, '../../screens', file), 'utf8');
    expect(source).toContain("from '@/components/ListingCard'");
    expect(source).not.toMatch(/LinearGradient|orderTitlesByLanguage|GitaChapterCard/);
  }
});
