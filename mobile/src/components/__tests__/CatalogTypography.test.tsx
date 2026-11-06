import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider } from '@/theme/ThemeContext';
import { typography } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';
import type { ObservanceRule } from '@/panchang/types';
import ObservanceTodaySummary from '../ObservanceTodaySummary';
import ObservancePreviewCard from '../ObservancePreviewCard';
import ListingCard, { ListingScope, ListingSectionHeader } from '../ListingCard';

let mockReadingFactor = 1;
let mockWindow = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('@/contexts/FontScaleContext', () => ({ useFontScale: () => ({ factor: mockReadingFactor }) }));
jest.mock('@/data/gita/language', () => ({ useGitaLanguage: () => ({ lang: 'hi' }) }));
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockWindow }));

const rule = {
  id: 'clipping-regression', category: 'vrat', nameHi: 'कृष्ण प्रदोष व्रत', nameEn: 'Krishna Pradosh Vrat',
  deityHi: 'भगवान शिव', deityEn: 'Lord Shiva',
  shortDescriptionHi: 'कृष्ण प्रदोष व्रत के दिन विशेष पूजा, पाठ और स्मरण का महत्व माना जाता है।',
  shortDescriptionEn: 'The complete description stays available when expanded.',
} as ObservanceRule;

let tree: TestRenderer.ReactTestRenderer | undefined;
afterEach(() => { if (tree) act(() => tree!.unmount()); tree = undefined; });
function render(children: React.ReactNode) {
  act(() => { tree = TestRenderer.create(<ThemeProvider>{children}</ThemeProvider>); });
  return tree!.root;
}

// Exact faces used by these surfaces need up to 1.53em for marks + descent.
// Reserve 1.55em inside the line, rather than painting above a previous badge.
// This validates rendered styles, including local overrides of safe tokens;
// React Test Renderer does NOT shape glyphs or prove native pixel acceptance.
function expectSafeLines(root: TestRenderer.ReactTestInstance) {
  const fixedIndicLines = root.findAllByType(Text).filter(node => {
    const style = StyleSheet.flatten(node.props.style);
    return style?.fontFamily?.startsWith('NotoSerif') && style.lineHeight !== undefined;
  });
  expect(fixedIndicLines.length).toBeGreaterThan(0);
  for (const node of fixedIndicLines) {
    const style = StyleSheet.flatten(node.props.style);
    expect(style.lineHeight * mockWindow.fontScale).toBeGreaterThanOrEqual(style.fontSize * mockWindow.fontScale * 1.55);
    expect(node.props.allowFontScaling).not.toBe(false);
    expect(node.props.adjustsFontSizeToFit).not.toBe(true);
    expect(style.height).toBeUndefined();
  }
}

const cases = (['hi', 'en', 'gu', 'kn'] as Lang[]).flatMap(lang =>
  [1, 1.15].flatMap(reading => [320, 390].flatMap(width => [1, 1.3, 2].map(fontScale =>
    ({ lang, reading, width, fontScale })))));

test.each(cases)('safe rendered catalog lines: $lang reading=$reading width=$width system=$fontScale', ({ lang, reading, width, fontScale }) => {
  mockReadingFactor = reading;
  mockWindow = { ...mockWindow, width, fontScale };
  const root = render(<>
    <ObservanceTodaySummary rule={rule} titleHi={rule.nameHi} titleEn={rule.nameEn} lang={lang} />
    <ObservancePreviewCard rule={rule} lang={lang} layout="row" dateLabel="6 नवंबर 2026" countdown="3 दिन शेष" following={false} onPress={() => {}} onToggleReminder={() => {}} />
    <ObservancePreviewCard rule={rule} lang={lang} layout="tile" dateLabel="6 नवंबर 2026" countdown="3 दिन शेष" following={false} onPress={() => {}} onToggleReminder={() => {}} />
    <ListingCard title="शैलपुत्री: पर्वत की पुत्री" eyebrow="दिन 1" description="पार्वती का जन्म और बचपन" meta="4 पृष्ठ" language={lang} thumbnail={null} onPress={() => {}} />
    <ListingSectionHeader>जीवन की सीख</ListingSectionHeader>
    <ListingScope>19 कथाएँ</ListingScope>
  </>);
  expectSafeLines(root);
  // These are chrome tokens: M/L must not accidentally alter the card title.
  const summary = root.findByType(ObservanceTodaySummary);
  const title = summary.findAllByType(Text)[0];
  expect(StyleSheet.flatten(title.props.style)).toMatchObject(typography.catalogTitle);
  expect(title.props.numberOfLines).toBeUndefined();
  const expand = summary.find(node => node.props.accessibilityRole === 'button' && typeof node.props.onPress === 'function');
  act(() => expand.props.onPress());
  expect(summary.findByProps({ testID: `observance-summary-${rule.id}` }).props.numberOfLines).toBeUndefined();
});

test.each(['धनतेरस', 'कृष्ण प्रदोष व्रत', 'कृष्ण द्वादशी व्रत'])('the reported Today title %s uses the shared catalog title without a tight override', name => {
  const root = render(<ObservanceTodaySummary rule={rule} titleHi={name} titleEn={rule.nameEn} lang="hi" />);
  const title = root.findAllByType(Text)[0];
  expect(title.props.children).toBe(name);
  expect(StyleSheet.flatten(title.props.style)).toMatchObject(typography.catalogTitle);
  expectSafeLines(root);
});
