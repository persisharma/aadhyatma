import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { StyleSheet, Text } from 'react-native';
import { ThemeProvider, useTheme, type Theme } from '@/theme/ThemeContext';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { typography } from '@/theme/typography';

/**
 * Slice-2 wiring guard: ThemeProvider must apply the active font scale from
 * FontScaleContext to the *reading* typography, and leave chrome untouched.
 * This is the single integration point — every reader reads sizes via
 * useTheme().typography, so proving it here proves the whole app scales.
 */

const mockGetItem = jest.fn((_key: string) => Promise.resolve<string | null>(null));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: (key: string) => mockGetItem(key),
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
const VersePage = jest.requireActual<typeof import('../../components/VersePage')>(
  '../../components/VersePage'
).default;
const GitaVersePage = jest.requireActual<typeof import('../../components/GitaVersePage')>(
  '../../components/GitaVersePage'
).default;
const ShivaStrotamVersePage = jest.requireActual<
  typeof import('../../components/ShivaStrotamVersePage')
>('../../components/ShivaStrotamVersePage').default;
const SundarkandVersePage = jest.requireActual<
  typeof import('../../components/SundarkandVersePage')
>('../../components/SundarkandVersePage').default;
const BajrangBaanVersePage = jest.requireActual<
  typeof import('../../components/BajrangBaanVersePage')
>('../../components/BajrangBaanVersePage').default;
const SanskarVersePage = jest.requireActual<typeof import('../../components/SanskarVersePage')>(
  '../../components/SanskarVersePage'
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

const VERSE = typography.verse.fontSize; // 23 (Devanagari verse line)
const MEANING = typography.meaning.fontSize; // 20
const SCREEN_TITLE = typography.screenTitle.fontSize; // chrome
const PAGE_COUNTER = typography.pageCounter.fontSize; // chrome
const L = 1.15;

/** Render under a real FontScaleProvider (driven by mocked AsyncStorage) so the
 *  async persisted-scale load is applied before we read the theme. */
async function captureTheme(persisted: string | null): Promise<Theme> {
  mockGetItem.mockResolvedValueOnce(persisted);
  let captured: Theme | undefined;
  function Probe() {
    captured = useTheme();
    return null;
  }
  await act(async () => {
    TestRenderer.create(
      <FontScaleProvider>
        <ThemeProvider>
          <Probe />
        </ThemeProvider>
      </FontScaleProvider>
    );
  });
  return captured!;
}

describe('ThemeProvider × FontScale', () => {
  beforeEach(() => mockGetItem.mockReset());

  test('default (M) leaves reading typography at base size', async () => {
    const theme = await captureTheme(null);
    expect(theme.typography.verse.fontSize).toBe(VERSE);
    expect(theme.typography.meaning.fontSize).toBe(MEANING);
  });

  test('L scales reading text (fontSize + lineHeight) by 1.15', async () => {
    const theme = await captureTheme('L');
    expect(theme.typography.verse.fontSize).toBe(Math.round(VERSE * L)); // 26
    expect(theme.typography.meaning.fontSize).toBe(Math.round(MEANING * L)); // 23
    expect(theme.typography.verse.lineHeight).toBe(
      Math.round(typography.verse.lineHeight! * L)
    );
  });

  test('L leaves chrome (screenTitle, pageCounter) fixed', async () => {
    const theme = await captureTheme('L');
    expect(theme.typography.screenTitle.fontSize).toBe(SCREEN_TITLE); // 34
    expect(theme.typography.pageCounter.fontSize).toBe(PAGE_COUNTER); // 13
  });

  test('the scale reaches a reader: VersePage verse line grows at L', async () => {
    mockGetItem.mockResolvedValue('L');
    let tree: TestRenderer.ReactTestRenderer | undefined;
    const verse = {
      id: 't1',
      labelHi: 'परीक्षा',
      labelEn: 'Test',
      lines: ['परीक्षण पंक्ति'],
      linesEn: ['Test verse line'],
      meaningHi: 'हिन्दी अर्थ',
      meaningEn: 'English meaning.',
    };
    await act(async () => {
      tree = TestRenderer.create(
        <FontScaleProvider>
          <ThemeProvider>
            <GitaLanguageProvider initialLang="hi">
              <VersePage verse={verse} sourceId="hanuman-chalisa" width={375} />
            </GitaLanguageProvider>
          </ThemeProvider>
        </FontScaleProvider>
      );
    });
    const node = tree!.root
      .findAllByType(Text)
      .find((n) => n.props.children === 'परीक्षण पंक्ति');
    expect(node).toBeDefined();
    expect(StyleSheet.flatten(node!.props.style).fontSize).toBe(Math.round(VERSE * L)); // 26
  });
});

/**
 * Render matrix — every reader family must scale its meaning text at L (and
 * render without throwing). Guards against a future reader bypassing
 * useTheme().typography and silently not scaling. M is the identity case,
 * already pinned by readerTypeScale.test.tsx (base sizes) + the default test above.
 */
describe('reader render matrix × L (no missed surface)', () => {
  beforeEach(() => mockGetItem.mockReset());

  async function meaningSizeAtL(
    element: React.ReactElement,
    meaningText: string
  ): Promise<number | undefined> {
    mockGetItem.mockResolvedValue('L');
    let tree: TestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      tree = TestRenderer.create(
        <FontScaleProvider>
          <ThemeProvider>
            <GitaLanguageProvider initialLang="en">{element}</GitaLanguageProvider>
          </ThemeProvider>
        </FontScaleProvider>
      );
    });
    const node = tree!.root.findAllByType(Text).find((n) => n.props.children === meaningText);
    return node ? StyleSheet.flatten(node.props.style).fontSize : undefined;
  }

  const gita = getGitaChapter(1).verses.find(
    (v) => v.meaningEn?.trim() && v.transliteration?.[0]?.trim()
  )!;
  const shiva = getShivaStrotamChapter(1).verses.find((v) => v.meaningEn?.trim() && v.linesEn?.[0])!;
  const sund = getSundarkandChapter(1).verses.find((v) => v.meaningEn?.trim() && v.linesEn?.[0])!;
  const bajrang = getBajrangBaanChapter(1).verses.find((v) => v.meaningEn?.trim() && v.linesEn?.[0])!;
  const sanskar = getSanskar('prabhati-shloka').verses.find(
    (v) => v.meaningEn?.trim() && v.linesEn?.[0]
  )!;

  const cases: Array<[string, React.ReactElement, string]> = [
    [
      'VersePage',
      <VersePage
        verse={{
          id: 't',
          labelHi: 'x',
          labelEn: 'x',
          lines: ['क'],
          linesEn: ['k'],
          meaningHi: 'म',
          meaningEn: 'Matrix meaning under test.',
        }}
        sourceId="hanuman-chalisa"
        width={375}
      />,
      'Matrix meaning under test.',
    ],
    ['GitaVersePage', <GitaVersePage verse={gita} sourceId="bhagavad-gita" width={375} />, gita.meaningEn],
    [
      'ShivaStrotamVersePage (+Krishna re-export)',
      <ShivaStrotamVersePage verse={shiva} sourceId="shiva-strotam" width={375} />,
      shiva.meaningEn,
    ],
    [
      'SundarkandVersePage (+Ramcharitmanas re-export)',
      <SundarkandVersePage verse={sund} sourceId="sundarkand" width={375} />,
      sund.meaningEn,
    ],
    ['BajrangBaanVersePage', <BajrangBaanVersePage verse={bajrang} sourceId="bajrang-baan" width={375} />, bajrang.meaningEn],
    ['SanskarVersePage', <SanskarVersePage verse={sanskar} sourceId="prabhati-shloka" width={375} />, sanskar.meaningEn],
  ];

  test.each(cases)('%s scales meaning text at L', async (_name, element, meaningText) => {
    expect(await meaningSizeAtL(element, meaningText)).toBe(Math.round(MEANING * L)); // 23
  });
});
