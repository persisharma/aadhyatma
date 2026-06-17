import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  return {
    LinearGradient: ({
      children,
      ...props
    }: React.PropsWithChildren<Record<string, unknown>>) =>
      mockReact.createElement(mockView, props, children),
  };
});

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);

type AnyScreen = (props: { navigation: any; route: any }) => React.ReactElement | null;

function screen(modulePath: string): AnyScreen {
  return jest.requireActual<{ default: AnyScreen }>(modulePath).default;
}

type ReaderCase = { name: string; routeName: string; Screen: AnyScreen; params: Record<string, unknown> };

// Every reader screen. The progress bar is a cross-reader contract (like
// auto-advance): each reader is a copy-pasted shell, so a new reader can
// silently miss the bar. This table is the guard — add new readers here.
const chapterParams = { chapter: 1, initialIndex: 0 };
const READERS: ReaderCase[] = [
  { name: 'Gita', routeName: 'GitaReader', Screen: screen('../GitaReaderScreen'), params: chapterParams },
  { name: 'Sundarkand', routeName: 'SundarkandReader', Screen: screen('../SundarkandReaderScreen'), params: chapterParams },
  { name: 'Shiva Strotam', routeName: 'ShivaStrotamReader', Screen: screen('../ShivaStrotamReaderScreen'), params: chapterParams },
  { name: 'Durga Stotram', routeName: 'DurgaStotramReader', Screen: screen('../DurgaStotramReaderScreen'), params: chapterParams },
  { name: 'Ganesh Stotram', routeName: 'GaneshStotramReader', Screen: screen('../GaneshStotramReaderScreen'), params: chapterParams },
  { name: 'Saraswati Stotram', routeName: 'SaraswatiStotramReader', Screen: screen('../SaraswatiStotramReaderScreen'), params: chapterParams },
  { name: 'Vishnu Sahasranama', routeName: 'VishnuSahasranamaReader', Screen: screen('../VishnuSahasranamaReaderScreen'), params: chapterParams },
  { name: 'Bajrang Baan', routeName: 'BajrangBaanReader', Screen: screen('../BajrangBaanReaderScreen'), params: chapterParams },
  { name: 'Hanuman Ashtak', routeName: 'HanumanAshtakReader', Screen: screen('../HanumanAshtakReaderScreen'), params: chapterParams },
  { name: 'Krishna Stotram', routeName: 'KrishnaStotramReader', Screen: screen('../KrishnaStotramReaderScreen'), params: chapterParams },
  { name: 'Ram Stuti', routeName: 'RamStutiReader', Screen: screen('../RamStutiReaderScreen'), params: chapterParams },
  { name: 'Ramcharitmanas', routeName: 'RamcharitmanasReader', Screen: screen('../RamcharitmanasReaderScreen'), params: chapterParams },
  { name: 'Aarti', routeName: 'AartiReader', Screen: screen('../AartiReaderScreen'), params: { aartiIndex: 0, initialIndex: 0 } },
  { name: 'Chalisa', routeName: 'ChalisaReader', Screen: screen('../ChalisaReaderScreen'), params: { chalisaId: 'hanuman-chalisa', initialIndex: 0 } },
  { name: 'Sanskar', routeName: 'SanskarReader', Screen: screen('../SanskarReaderScreen'), params: { sanskarId: 'prabhati-shloka', initialIndex: 0 } },
  { name: 'Vrat Katha', routeName: 'VratKathaReader', Screen: screen('../VratKathaReaderScreen'), params: { kathaId: 'nirjala-ekadashi-katha' } },
];

function render(Screen: AnyScreen, routeName: string, params: Record<string, unknown>) {
  const navigation: any = { goBack: () => undefined, navigate: () => undefined, replace: jest.fn() };
  const route = { key: `${routeName}-test`, name: routeName, params };
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <Screen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  return tree!;
}

// The visible "n / total" page counter in the top bar — the bar's denominator
// must agree with it. Top-bar text renders before verse content (depth-first),
// so the first match is the counter, not anything inside a verse page.
function pageCounter(tree: TestRenderer.ReactTestRenderer): { current: number; total: number } | null {
  for (const node of tree.root.findAllByType(Text)) {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    const text = children.flat(Number.POSITIVE_INFINITY).join('');
    const m = text.match(/^\s*(\d+)\s*\/\s*(\d+)\s*$/);
    if (m) return { current: Number(m[1]), total: Number(m[2]) };
  }
  return null;
}

function fillWidth(tree: TestRenderer.ReactTestRenderer): string | number | undefined {
  // RN's <View> matches twice (composite + host instance) for one testID, so
  // dedupe by width: tolerate that pair, but catch a genuine second bar.
  const fills = tree.root.findAllByProps({ testID: 'reading-progress-fill' });
  assert.ok(fills.length >= 1, 'a reading-progress fill is rendered');
  const widths = new Set(
    fills.map((f) => {
      const style = f.props.style;
      const flat = (Array.isArray(style) ? style : [style]).flat(Number.POSITIVE_INFINITY);
      return Object.assign({}, ...flat).width;
    })
  );
  assert.equal(widths.size, 1, 'all progress-fill matches share a single width');
  return [...widths][0];
}

for (const r of READERS) {
  test(`${r.name}: renders a reading-progress bar matching the "n / total" counter`, () => {
    const tree = render(r.Screen, r.routeName, r.params);
    const counter = pageCounter(tree);
    assert.ok(counter, `${r.name} shows an "n / total" page counter`);
    // First page on open → fill spans current/total of the width.
    assert.equal(fillWidth(tree), `${(counter!.current / counter!.total) * 100}%`);
  });
}
