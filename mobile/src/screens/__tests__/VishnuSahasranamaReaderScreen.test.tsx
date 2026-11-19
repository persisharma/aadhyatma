import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

const trees: TestRenderer.ReactTestRenderer[] = [];
function createReader(element: React.ReactElement) {
  const tree = TestRenderer.create(element); trees.push(tree); return tree;
}
afterEach(() => { act(() => { for (const tree of trees.splice(0)) tree.unmount(); }); });

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

const getActualData = jest.requireActual<typeof import('@/data/vishnu-sahasranama')>('@/data/vishnu-sahasranama');
const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const VishnuSahasranamaReaderScreen = jest.requireActual<typeof import('../VishnuSahasranamaReaderScreen')>(
  '../VishnuSahasranamaReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof VishnuSahasranamaReaderScreen>;

const source = getActualData.getVishnuSahasranamaChapter(1);
const firstVerse = source.verses[0];

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];
navigation.replace = (() => undefined) as ReaderProps['navigation']['replace'];

const route = {
  key: 'VishnuSahasranamaReader-test',
  name: 'VishnuSahasranamaReader',
  params: { chapter: 1, initialIndex: 0 },
} as ReaderProps['route'];

test('renders the first Vishnu Sahasranama verse without throwing', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <VishnuSahasranamaReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(firstVerse.sanskrit[0]));
});

describe.each([31,107,108])('full Vishnu unit %s', position => {
 test.each(['hi','en','gu','kn'] as const)('renders the restored page in %s', lang => {
  const payload=getActualData.getVishnuSahasranamaChapter(3);
  let tree: TestRenderer.ReactTestRenderer;
  act(()=>{tree=createReader(<GitaLanguageProvider initialLang={lang}><ShareProvider>
   <VishnuSahasranamaReaderScreen navigation={navigation} route={{...route,params:{chapter:3,initialIndex:position}}}/>
  </ShareProvider></GitaLanguageProvider>);});
  const text=tree!.root.findAllByType(Text).map(node=>node.props.children).flat(Infinity).join(' ');
  const { contentByLang }=jest.requireActual<typeof import('@/utils/localize')>('@/utils/localize');
  expect(text).toContain(contentByLang(lang,payload.verses[position].meaningHi,payload.verses[position].meaningEn));
 });
});
