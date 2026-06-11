import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, View as mockView } from 'react-native';

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

const durga = jest.requireActual<typeof import('@/data/durga-stotram')>('@/data/durga-stotram');
const ganesh = jest.requireActual<typeof import('@/data/ganesh-stotram')>('@/data/ganesh-stotram');
const saraswati = jest.requireActual<typeof import('@/data/saraswati-stotram')>(
  '@/data/saraswati-stotram'
);
const vishnu = jest.requireActual<typeof import('@/data/vishnu-sahasranama')>(
  '@/data/vishnu-sahasranama'
);

const DurgaScreen = jest.requireActual<typeof import('../DurgaStotramReaderScreen')>(
  '../DurgaStotramReaderScreen'
).default;
const GaneshScreen = jest.requireActual<typeof import('../GaneshStotramReaderScreen')>(
  '../GaneshStotramReaderScreen'
).default;
const SaraswatiScreen = jest.requireActual<typeof import('../SaraswatiStotramReaderScreen')>(
  '../SaraswatiStotramReaderScreen'
).default;
const VishnuScreen = jest.requireActual<typeof import('../VishnuSahasranamaReaderScreen')>(
  '../VishnuSahasranamaReaderScreen'
).default;

type AnyScreen = (props: { navigation: any; route: any }) => React.ReactElement | null;

type ReaderCase = {
  name: string;
  routeName: string;
  Screen: AnyScreen;
  chapterCount: number;
};

// Every multi-subsection reader. Adding a new chaptered reader? Add it here so
// the auto-advance contract is enforced for it too.
const READERS: ReaderCase[] = [
  {
    name: 'Durga Stotram',
    routeName: 'DurgaStotramReader',
    Screen: DurgaScreen,
    chapterCount: durga.durgaStotramChaptersManifest.length,
  },
  {
    name: 'Ganesh Stotram',
    routeName: 'GaneshStotramReader',
    Screen: GaneshScreen,
    chapterCount: ganesh.ganeshStotramChaptersManifest.length,
  },
  {
    name: 'Saraswati Stotram',
    routeName: 'SaraswatiStotramReader',
    Screen: SaraswatiScreen,
    chapterCount: saraswati.saraswatiStotramChaptersManifest.length,
  },
  {
    name: 'Vishnu Sahasranama',
    routeName: 'VishnuSahasranamaReader',
    Screen: VishnuScreen,
    chapterCount: vishnu.vishnuSahasranamaChaptersManifest.length,
  },
];

function renderAt(Screen: AnyScreen, routeName: string, chapter: number) {
  const navigation: any = {};
  navigation.goBack = () => undefined;
  navigation.navigate = () => undefined;
  navigation.replace = jest.fn();
  const route = {
    key: `${routeName}-test`,
    name: routeName,
    params: { chapter, initialIndex: 0 },
  };

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
  const list = tree!.root.findByType(FlatList);
  return { tree: tree!, navigation, data: list.props.data as any[], list };
}

for (const r of READERS) {
  test(`${r.name}: swiping past the last page of chapter 1 reaches a "next" transition page`, () => {
    const { data } = renderAt(r.Screen, r.routeName, 1);
    const last = data[data.length - 1];
    assert.equal(last.__type, 'transition');
    assert.equal(last.nextChapter, 2);
  });

  test(`${r.name}: chapter 2 starts with a "previous" transition page`, () => {
    const { data } = renderAt(r.Screen, r.routeName, 2);
    const first = data[0];
    assert.equal(first.__type, 'prev-transition');
    assert.equal(first.prevChapter, 1);
  });

  test(`${r.name}: the final chapter has no trailing "next" transition`, () => {
    const { data } = renderAt(r.Screen, r.routeName, r.chapterCount);
    const last = data[data.length - 1];
    assert.notEqual(last.__type, 'transition');
  });
}

test('reaching the next-transition page auto-navigates to the next chapter', () => {
  jest.useFakeTimers();
  try {
    const { navigation, data, list } = renderAt(DurgaScreen, 'DurgaStotramReader', 1);
    const transition = data[data.length - 1];
    act(() => {
      list.props.onViewableItemsChanged({
        viewableItems: [
          { index: data.length - 1, item: transition, key: transition.id, isViewable: true },
        ],
        changed: [],
      });
      jest.advanceTimersByTime(400);
    });
    assert.equal(navigation.replace.mock.calls.length, 1);
    const [routeName, params] = navigation.replace.mock.calls[0];
    assert.equal(routeName, 'DurgaStotramReader');
    assert.equal(params.chapter, 2);
  } finally {
    jest.useRealTimers();
  }
});
