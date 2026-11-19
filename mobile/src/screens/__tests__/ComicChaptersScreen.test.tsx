import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

let mockLang = 'en';
jest.mock('react-native', () => ({
  FlatList: ({ data, renderItem }: { data: unknown[]; renderItem: (a: { item: unknown; index: number }) => React.ReactNode }) => {
    const R = require('react');
    return R.createElement('FlatList', null, data.map((item, index) => R.createElement('Row', { key: index }, renderItem({ item, index }))));
  },
  Text: 'Text', View: 'View',
  StyleSheet: { create: (x: unknown) => x, absoluteFillObject: {} },
}));
jest.mock('react-native-safe-area-context', () => ({ SafeAreaView: 'SafeAreaView' }));
jest.mock('@/components/ReaderHeader', () => ({ __esModule: true, default: 'ReaderHeader' }));
jest.mock('@/components/ShareButton', () => ({ __esModule: true, default: 'ShareButton' }));
jest.mock('@/components/LanguageToggle', () => ({ __esModule: true, default: 'LanguageToggle' }));
jest.mock('@/components/ComicArt', () => ({ __esModule: true, default: 'ComicArt' }));
jest.mock('@/components/ListingCard', () => ({
  __esModule: true,
  ListingScope: 'ListingScope',
  default: 'ListingCard',
}));
jest.mock('@/utils/shareVerse', () => ({ useShare: () => ({ share: jest.fn(), busy: false }) }));
jest.mock('@/utils/listingShare', () => ({ buildListingShare: () => null }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: mockLang }) }));
jest.mock('@/theme/ThemeContext', () => ({
  useTheme: () => ({ colors: {}, spacing: { md: 12, readingGutter: 16 } }),
}));

const Screen = require('../ComicChaptersScreen').default;

function eyebrowAndMeta(lang: string) {
  mockLang = lang;
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <Screen navigation={{ navigate: jest.fn(), goBack: jest.fn() }} route={{ params: { comicId: 'balakanda-v1' } }} />,
    );
  });
  const card = tree.root.findAllByType('ListingCard' as never)[0];
  const result = { eyebrow: card.props.eyebrow as string, meta: card.props.meta as string };
  act(() => tree.unmount());
  return result;
}

test.each([
  ['gu', /[઀-૿]/],
  ['kn', /[ಀ-೿]/],
])('episode eyebrow and page count are in the %s script, not English (BEH-07)', (lang, script) => {
  const { eyebrow, meta } = eyebrowAndMeta(lang);
  expect(eyebrow).toMatch(script);
  expect(meta).toMatch(script);
  expect(`${eyebrow} ${meta}`).not.toMatch(/Episode|pages/);
});

test('English and Hindi keep their labels', () => {
  expect(eyebrowAndMeta('en').eyebrow).toMatch(/^Episode 1$/);
  expect(eyebrowAndMeta('hi').meta).toMatch(/पृष्ठ/);
});
