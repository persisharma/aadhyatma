import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, Text } from 'react-native';
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
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import { getPratha } from '@/data/pratha';
import * as prathaRegistry from '@/data/pratha';
import { PRATHA_FOOTER, prathaPages } from '@/data/pratha/presentation';
import { prathaShareable } from '@/utils/shareContent';
import { ShareProvider } from '@/utils/shareVerse';
import type { PanchangData } from '@/panchang/types';

const trees: TestRenderer.ReactTestRenderer[] = [];
const nav = () => ({ navigate: jest.fn(), push: jest.fn(), goBack: jest.fn() });
async function render(element: React.ReactElement, lang: 'hi' | 'en' = 'hi') {
  let tree!: TestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = TestRenderer.create(<FontScaleProvider><ThemeProvider><GitaLanguageProvider initialLang={lang}><ShareProvider>{element}</ShareProvider></GitaLanguageProvider></ThemeProvider></FontScaleProvider>);
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

test('month chips gate sparse months and a route opens the requested month', async () => {
  const tree = await render(<PrathaScreen {...({ navigation: nav(), route: { params: { masa: 9, isAdhik: false } } } as any)} />);
  expect(id(tree, 'pratha-question-M1')).toBeTruthy();
  expect(id(tree, 'pratha-filter-masa-10').props.disabled).toBe(true);
  act(() => id(tree, 'pratha-filter-masa-8').props.onPress());
  expect(id(tree, 'pratha-question-K1')).toBeTruthy();
  act(() => id(tree, 'pratha-filter-tirth').props.onPress());
  expect(id(tree, 'pratha-empty')).toBeTruthy();
});

test('reader preserves page order, each story canon, optional bodh and the family footer', async () => {
  const entry = getPratha('K1')!;
  const tree = await render(<PrathaReaderScreen {...({ navigation: nav(), route: { params: { prathaId: 'K1' } } } as any)} />);
  const list = tree.root.findByType(FlatList);
  expect(list.props.data.map((page: { id: string }) => page.id)).toEqual(prathaPages(entry).map((p) => p.id));
  for (let i = 0; i < entry.kathas.length; i++) {
    const page = list.props.data[i + 1];
    const storyTree = await render(list.props.renderItem({ item: page, index: i + 1 }));
    expect(text(storyTree)).toContain(entry.kathas[i].canonHi);
    const share = prathaShareable(entry, i + 1);
    expect(share.scopes[0].blocks[0].hi).toContain(entry.kathas[i].canonHi);
    expect(share.scopes[0].blocks[0].en).toContain(entry.kathas[i].canonEn);
  }
  const closing = await render(list.props.renderItem({ item: list.props.data.at(-1), index: list.props.data.length - 1 }));
  expect(text(closing)).toContain(PRATHA_FOOTER.hi);
  const width = list.props.getItemLayout(null, 0).length;
  act(() => list.props.onScroll({ nativeEvent: { contentOffset: { x: width * 2 } } }));
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
