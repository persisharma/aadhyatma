import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, Text } from 'react-native';
import { contentByLang } from '@/utils/localize';
import { toGujarati, toKannada } from '@/utils/transliterate';
jest.mock('expo-linear-gradient', () => {
  const React = require('react');
  const { View } = require('react-native');
  return { LinearGradient: ({ children, ...props }: Record<string, unknown>) => React.createElement(View, props, children) };
});
jest.mock('expo-haptics', () => ({ ImpactFeedbackStyle: { Light: 'Light' }, impactAsync: jest.fn(() => Promise.resolve()) }));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn() }));
jest.mock('expo-sharing', () => ({ isAvailableAsync: jest.fn(() => Promise.resolve(false)), shareAsync: jest.fn() }));
const mockRootNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({ navigate: mockRootNavigate }) }));
jest.mock('@/panchang/usePanchang', () => ({
  usePanchangCalendarSystem: () => ['purnimant', jest.fn()],
  usePanchangForSelection: () => ({ panchang: { lunarMonth: { index: 8, isAdhik: false } } }),
}));

import PrathaScreen from '../PrathaScreen';
import PrathaReaderScreen from '../PrathaReaderScreen';
import { PrathaMonthCard, PrathaObservanceCard } from '@/components/PrathaCards';
import { ThemeProvider } from '@/theme/ThemeContext';
import { FontScaleProvider, useFontScale } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider, type Lang } from '@/data/gita/language';
import { getPratha } from '@/data/pratha';
import * as prathaRegistry from '@/data/pratha';
import { PRATHA_FOOTER, prathaPages, matchesPratha } from '@/data/pratha/presentation';
import { prathaShareable } from '@/utils/shareContent';
import { ShareProvider } from '@/utils/shareVerse';
import type { PanchangData } from '@/panchang/types';

const trees: TestRenderer.ReactTestRenderer[] = [];
const nav = () => ({ navigate: jest.fn(), push: jest.fn(), goBack: jest.fn() });
function ReadingSize({ size }: { size: 'M' | 'L' }) {
  const { setScale } = useFontScale();
  React.useEffect(() => setScale(size), [size, setScale]);
  return null;
}
async function render(element: React.ReactElement, lang: Lang = 'hi', size: 'M' | 'L' = 'M') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<FontScaleProvider><ReadingSize size={size} /><ThemeProvider><GitaLanguageProvider initialLang={lang}><ShareProvider>{element}</ShareProvider></GitaLanguageProvider></ThemeProvider></FontScaleProvider>);
  });
  trees.push(tree);
  return tree;
}
function id(tree: TestRenderer.ReactTestRenderer, name: string) {
  return tree.root.findAll((node) => node.props.testID === name)[0];
}
function text(tree: TestRenderer.ReactTestRenderer) {
  return tree.root.findAllByType(Text).flatMap((n) => [n.props.children]).flat(Infinity).join(' ');
}
afterEach(() => { act(() => trees.splice(0).forEach((tree) => tree.unmount())); jest.restoreAllMocks(); jest.clearAllMocks(); });

test('closed pilot exposes no hub rows, reader prose or contextual cards', async () => {
  jest.spyOn(prathaRegistry, 'hasPratha').mockReturnValue(false);
  const hub = await render(<PrathaScreen {...({ navigation: nav(), route: { params: undefined } } as any)} />);
  expect(id(hub, 'pratha-question-K1')).toBeUndefined();
  const reader = await render(<PrathaReaderScreen {...({ navigation: nav(), route: { params: { prathaId: 'K1' } } } as any)} />);
  expect(id(reader, 'pratha-unavailable')).toBeTruthy();
  const card = await render(<PrathaObservanceCard ruleId="dhanteras" onOpen={jest.fn()} />);
  expect(id(card, 'pratha-observance-card')).toBeUndefined();
});

test('hub opens current verified questions; search reaches other months and excludes drafts', async () => {
  const navigation = nav();
  const tree = await render(<PrathaScreen {...({ navigation, route: { params: undefined } } as any)} />);
  expect(id(tree, 'pratha-question-K1')).toBeTruthy();
  expect(id(tree, 'pratha-question-K3')).toBeUndefined();
  act(() => id(tree, 'pratha-question-K1').props.onPress());
  expect(navigation.navigate).toHaveBeenCalledWith('PrathaReader', { prathaId: 'K1' });
  act(() => id(tree, 'pratha-search').props.onChangeText('Lohri'));
  expect(id(tree, 'pratha-question-P2')).toBeTruthy();
  expect(id(tree, 'pratha-question-K1')).toBeUndefined();
  act(() => id(tree, 'pratha-search').props.onChangeText('unfindable question'));
  expect(id(tree, 'pratha-empty')).toBeTruthy();
});

test('month chips hide sparse months and only populated categories appear', async () => {
  const tree = await render(<PrathaScreen {...({ navigation: nav(), route: { params: { masa: 9, isAdhik: false } } } as any)} />);
  expect(id(tree, 'pratha-question-M1')).toBeTruthy();
  expect(id(tree, 'pratha-filter-masa-10')).toBeUndefined();
  act(() => id(tree, 'pratha-filter-masa-8').props.onPress());
  expect(id(tree, 'pratha-question-K1')).toBeTruthy();
  expect(id(tree, 'pratha-filter-tirth')).toBeUndefined();
  act(() => id(tree, 'pratha-filter-all').props.onPress());
  // Offscreen rows stay virtualized; the all-questions data still includes Lohri.
  expect(tree.root.findByType(FlatList).props.data.map((entry: { id: string }) => entry.id)).toContain('P2');
});

test('reader preserves complete teaching and shares it without internal research locators', async () => {
  const entry = getPratha('K1')!;
  const tree = await render(<PrathaReaderScreen {...({ navigation: nav(), route: { params: { prathaId: 'K1' } } } as any)} />);
  const list = tree.root.findByType(FlatList);
  expect(list.props.data.map((page: { id: string }) => page.id)).toEqual(prathaPages(entry).map((p) => p.id));
  for (let i = 0; i < entry.kathas.length; i++) {
    const page = list.props.data[i + 1];
    const storyTree = await render(list.props.renderItem({ item: page, index: i + 1 }));
    for (const paragraph of entry.kathas[i].bodyHi) expect(text(storyTree)).toContain(paragraph);
    expect(text(storyTree)).not.toContain(entry.kathas[i].canonHi);
    const share = prathaShareable(entry, i + 1);
    expect(share.scopes[0].blocks).toEqual(page.bodyHi.map((hi: string, j: number) => ({ kind: 'para', hi, en: page.bodyEn[j] })));
    expect(JSON.stringify(share)).not.toContain(entry.kathas[i].canonHi);
    expect(JSON.stringify(share)).not.toMatch(/referenceUrls|verificationNote|https?:/);
  }
  const closing = await render(list.props.renderItem({ item: list.props.data.at(-1), index: list.props.data.length - 1 }));
  expect(text(closing)).toContain(PRATHA_FOOTER.hi);
  const width = list.props.getItemLayout(null, 0).length;
  expect(list.props.onScroll).toBeUndefined();
  act(() => list.props.onMomentumScrollEnd({ nativeEvent: { contentOffset: { x: width * 2 } } }));
  expect(id(tree, 'pratha-counter').props.children.join('')).toBe(`3 / ${list.props.data.length}`);
});

test('English reader renders corrected prose and bundled scripture hand-off', async () => {
  const tree = await render(<PrathaReaderScreen {...({ navigation: nav(), route: { params: { prathaId: 'M1' } } } as any)} />, 'en');
  const list = tree.root.findByType(FlatList);
  const first = await render(list.props.renderItem({ item: list.props.data[0], index: 0 }), 'en');
  expect(text(first)).toContain(getPratha('M1')!.practiceEn);
  const closing = await render(list.props.renderItem({ item: list.props.data.at(-1), index: list.props.data.length - 1 }), 'en');
  act(() => id(closing, 'pratha-link-ref-0').props.onPress());
  expect(mockRootNavigate).toHaveBeenCalledWith('HomeTab', { screen: 'GitaReader', params: { chapter: 10, initialIndex: 34 } });
});

test.each(['K3', 'unknown'])('draft or missing reader id %s never exposes prose or sharing', async (prathaId) => {
  const tree = await render(<PrathaReaderScreen {...({ navigation: nav(), route: { params: { prathaId } } } as any)} />);
  expect(id(tree, 'pratha-unavailable')).toBeTruthy();
  expect(tree.root.findAllByType(FlatList)).toHaveLength(0);
});

test('observance card follows verified rule anchors and missing rules render nothing', async () => {
  const open = jest.fn();
  const tree = await render(<PrathaObservanceCard ruleId="dhanteras" onOpen={open} />);
  act(() => id(tree, 'pratha-context-K10').props.onPress());
  expect(open).toHaveBeenCalledWith('K10');
  const empty = await render(<PrathaObservanceCard ruleId="unknown" onOpen={open} />);
  expect(id(empty, 'pratha-observance-card')).toBeUndefined();
});

test('month card shows at most three questions and opens month hub; sparse/adhik months are absent', async () => {
  const month = (index: number, isAdhik = false) => ({ index, isAdhik, nameHi: 'कार्तिक', nameEn: 'Kartik' }) as PanchangData['lunarMonth'];
  const open = jest.fn(), hub = jest.fn();
  const tree = await render(<PrathaMonthCard month={month(8)} onOpen={open} onHub={hub} />);
  const questions = new Set(tree.root.findAll((n) => String(n.props.testID).startsWith('pratha-context-')).map((n) => n.props.testID));
  expect(questions.size).toBe(3);
  act(() => id(tree, 'pratha-context-K1').props.onPress());
  expect(open).toHaveBeenCalledWith('K1');
  act(() => id(tree, 'pratha-month-hub').props.onPress());
  expect(hub).toHaveBeenCalledTimes(1);
  for (const value of [month(10), month(8, true)]) {
    const empty = await render(<PrathaMonthCard month={value} onOpen={open} onHub={hub} />);
    expect(id(empty, 'pratha-month-card')).toBeUndefined();
  }
});

for (const lang of ['hi', 'en', 'gu', 'kn'] as const) {
  for (const size of ['M', 'L'] as const) {
    test(`${lang}/${size}: customs question, complete story and share retain the selected script`, async () => {
      const entry = getPratha('K6')!;
      const navigation = nav();
      const hub = await render(<PrathaScreen {...({ navigation, route: { params: undefined } } as any)} />, lang, size);
      const query = contentByLang(lang, entry.questionHi, entry.questionEn);
      act(() => id(hub, 'pratha-search').props.onChangeText(query));
      expect(matchesPratha(entry, query)).toBe(true);
      expect(id(hub, 'pratha-question-K6')).toBeDefined();
      expect(id(hub, 'pratha-question-K3')).toBeUndefined();
      act(() => id(hub, 'pratha-question-K6').props.onPress());
      expect(navigation.navigate).toHaveBeenCalledWith('PrathaReader', { prathaId: 'K6' });
      const reader = await render(<PrathaReaderScreen {...({ navigation, route: { params: { prathaId: 'K6' } } } as any)} />, lang, size);
      const list = reader.root.findByType(FlatList);
      for (let i = 0; i < list.props.data.length; i++) {
        const page = list.props.data[i];
        const rendered = await render(list.props.renderItem({ item: page, index: i }), lang, size);
        const share = prathaShareable(entry, i);
        page.bodyHi.forEach((hi: string, j: number) => {
          expect(text(rendered)).toContain(contentByLang(lang, hi, page.bodyEn[j]));
          expect(share.scopes[0].blocks[j]).toEqual({ kind: 'para', hi, en: page.bodyEn[j] });
        });
      }
    });
  }
}

test('regional search uses the same script as the displayed question', () => {
  const entry = getPratha('K6')!;
  expect(matchesPratha(entry, toGujarati('तुलसी विवाह'))).toBe(true);
  expect(matchesPratha(entry, toKannada('तुलसी विवाह'))).toBe(true);
});

test('every published story keeps its regional/folk context but no research fields in its public projection', () => {
  for (const entry of prathaRegistry.getAllPratha()) {
    const pages = prathaPages(entry);
    const publicText = JSON.stringify(pages);
    expect(publicText).not.toMatch(/referenceUrls|verificationNote|canonHi|canonEn|https?:/);
    entry.kathas.forEach((story, index) => {
      const page = pages[index + 1];
      expect(page.bodyHi.slice(-story.bodyHi.length)).toEqual(story.bodyHi);
      expect(page.bodyEn.slice(-story.bodyEn.length)).toEqual(story.bodyEn);
      if (story.tier === 'lok') expect(page.bodyHi[0]).toContain('लोक-परम्परा');
      if (story.regionHi) expect(page.bodyHi[0]).toContain(story.regionHi);
    });
  }
});
