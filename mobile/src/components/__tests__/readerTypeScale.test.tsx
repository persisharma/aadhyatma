import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { typography } from '@/theme/typography';

/**
 * Reader type-scale guard (verse ↔ meaning, both languages).
 *
 * The intended scale:
 *   - English meaning (meaningEnglish) and Hindi meaning (meaning) are the SAME size,
 *     so the two languages read at one consistent meaning scale.
 *   - The verse/transliteration sits ABOVE the meaning in both languages, mirroring
 *     the Hindi verse↔meaning hierarchy.
 *
 * Several verse-page components used to hardcode these sizes (18/20) and drift away
 * from the tokens, which flattened the English hierarchy and left the Hindi meaning
 * much smaller than the English one. These tests pin the token relationships AND
 * assert each base component actually renders at the token sizes, so a future edit
 * can't silently reintroduce the drift.
 */

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  const mockReact = require('react');
  const { View } = require('react-native');
  return {
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      mockReact.createElement(View, props, children),
  };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const VersePage = jest.requireActual<typeof import('../VersePage')>('../VersePage').default;
const GitaVersePage = jest.requireActual<typeof import('../GitaVersePage')>('../GitaVersePage')
  .default;
const ShivaStrotamVersePage = jest.requireActual<typeof import('../ShivaStrotamVersePage')>(
  '../ShivaStrotamVersePage'
).default;
const SundarkandVersePage = jest.requireActual<typeof import('../SundarkandVersePage')>(
  '../SundarkandVersePage'
).default;
const BajrangBaanVersePage = jest.requireActual<typeof import('../BajrangBaanVersePage')>(
  '../BajrangBaanVersePage'
).default;
const SanskarVersePage = jest.requireActual<typeof import('../SanskarVersePage')>(
  '../SanskarVersePage'
).default;

const { getGitaChapter } = jest.requireActual<typeof import('@/data/gita')>('@/data/gita');
const { getShivaStrotamChapter } = jest.requireActual<typeof import('@/data/shiva-strotam')>(
  '@/data/shiva-strotam'
);
const { getSundarkandChapter } = jest.requireActual<typeof import('@/data/sundarkand')>(
  '@/data/sundarkand'
);
const { getBajrangBaanChapter } = jest.requireActual<typeof import('@/data/bajrang-baan')>(
  '@/data/bajrang-baan'
);
const { getSanskar } = jest.requireActual<typeof import('@/data/sanskar')>('@/data/sanskar');
const ValmikiRamayanVersePage = jest.requireActual<typeof import('../ValmikiRamayanVersePage')>(
  '../ValmikiRamayanVersePage'
).default;
const { getValmikiRamayanChapter } = jest.requireActual<typeof import('@/data/valmiki-ramayan')>(
  '@/data/valmiki-ramayan'
);

const MEANING_EN = typography.meaningEnglish.fontSize;
const MEANING_HI = typography.meaning.fontSize;
const VERSE_LATIN = typography.verseLatin.fontSize;

function fontSizeOf(
  element: React.ReactElement,
  lang: 'hi' | 'en',
  text: string
): number | undefined {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>{element}</GitaLanguageProvider>
    );
  });
  const node = tree!.root.findAllByType(Text).find((n) => n.props.children === text);
  if (!node) throw new Error(`Text node not found for: ${text}`);
  return StyleSheet.flatten(node.props.style).fontSize;
}

describe('reader type scale — tokens', () => {
  test('Hindi and English meaning are the same size', () => {
    expect(MEANING_EN).toBe(20);
    expect(MEANING_HI).toBe(MEANING_EN);
  });

  test('the transliteration sits above the meaning', () => {
    expect(VERSE_LATIN).toBe(24);
    expect(VERSE_LATIN).toBeGreaterThan(MEANING_EN);
  });
});

describe('reader type scale — rendered per component', () => {
  test('VersePage (Aarti / Chalisa): verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = {
      id: 'test-1',
      labelHi: 'परीक्षा',
      labelEn: 'Test',
      lines: ['परीक्षण पंक्ति'],
      linesEn: ['Test verse line'],
      meaningHi: 'हिन्दी अर्थ परीक्षण',
      meaningEn: 'English meaning under test.',
    };
    const el = <VersePage verse={verse} sourceId="hanuman-chalisa" width={375} />;
    expect(fontSizeOf(el, 'en', 'Test verse line')).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', 'English meaning under test.')).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', 'हिन्दी अर्थ परीक्षण')).toBe(MEANING_HI);
  });

  test('GitaVersePage: verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = getGitaChapter(1).verses.find(
      (v) => v.meaningEn?.trim() && v.meaningHi?.trim() && v.transliteration?.[0]?.trim()
    );
    if (!verse) throw new Error('no suitable Gita verse fixture');
    const el = <GitaVersePage verse={verse} sourceId="bhagavad-gita" width={375} />;
    expect(fontSizeOf(el, 'en', verse.transliteration[0])).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', verse.meaningEn)).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', verse.meaningHi)).toBe(MEANING_HI);
  });

  test('ShivaStrotamVersePage (+ re-export Krishna): verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = getShivaStrotamChapter(1).verses.find(
      (v) => v.meaningEn?.trim() && v.meaningHi?.trim() && v.linesEn?.[0]?.trim()
    );
    if (!verse) throw new Error('no suitable Shiva verse fixture');
    const el = <ShivaStrotamVersePage verse={verse} sourceId="shiva-strotam" width={375} />;
    expect(fontSizeOf(el, 'en', verse.linesEn[0])).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', verse.meaningEn)).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', verse.meaningHi)).toBe(MEANING_HI);
  });

  test('SundarkandVersePage (+ re-export Ramcharitmanas): verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = getSundarkandChapter(1).verses.find(
      (v) => v.meaningEn?.trim() && v.meaningHi?.trim() && v.linesEn?.[0]?.trim()
    );
    if (!verse) throw new Error('no suitable Sundarkand verse fixture');
    const el = <SundarkandVersePage verse={verse} sourceId="sundarkand" width={375} />;
    expect(fontSizeOf(el, 'en', verse.linesEn[0])).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', verse.meaningEn)).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', verse.meaningHi)).toBe(MEANING_HI);
  });

  test('BajrangBaanVersePage: verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = getBajrangBaanChapter(1).verses.find(
      (v) => v.meaningEn?.trim() && v.meaningHi?.trim() && v.linesEn?.[0]?.trim()
    );
    if (!verse) throw new Error('no suitable Bajrang Baan verse fixture');
    const el = <BajrangBaanVersePage verse={verse} sourceId="bajrang-baan" width={375} />;
    expect(fontSizeOf(el, 'en', verse.linesEn[0])).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', verse.meaningEn)).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', verse.meaningHi)).toBe(MEANING_HI);
  });

  test('ValmikiRamayanVersePage (Sundarkand re-export): verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = getValmikiRamayanChapter(1).verses[0];
    const el = (
      <ValmikiRamayanVersePage verse={verse} sourceId="valmiki-ramayan" width={375} />
    );
    expect(fontSizeOf(el, 'en', verse.linesEn[0])).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', verse.meaningEn)).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', verse.meaningHi)).toBe(MEANING_HI);
  });

  test('SanskarVersePage: verse 24 > meaning 20; Hindi meaning 20', () => {
    const verse = getSanskar('prabhati-shloka').verses.find(
      (v) => v.meaningEn?.trim() && v.meaningHi?.trim() && v.linesEn?.[0]?.trim()
    );
    if (!verse) throw new Error('no suitable Sanskar verse fixture');
    const el = <SanskarVersePage verse={verse} sourceId="prabhati-shloka" width={375} />;
    expect(fontSizeOf(el, 'en', verse.linesEn[0])).toBe(VERSE_LATIN);
    expect(fontSizeOf(el, 'en', verse.meaningEn)).toBe(MEANING_EN);
    expect(fontSizeOf(el, 'hi', verse.meaningHi)).toBe(MEANING_HI);
  });
});
