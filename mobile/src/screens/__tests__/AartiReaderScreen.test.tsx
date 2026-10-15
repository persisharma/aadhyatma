import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

// Release mounted readers and their scheduled React work between tests.
const trees: TestRenderer.ReactTestRenderer[] = [];
function createReader(element: React.ReactElement) {
  const tree = TestRenderer.create(element);
  trees.push(tree);
  return tree;
}
afterEach(() => {
  act(() => { for (const tree of trees.splice(0)) tree.unmount(); });
});

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

const getActualData = jest.requireActual<typeof import('@/data/aarti')>('@/data/aarti');
const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const AartiReaderScreen = jest.requireActual<typeof import('../AartiReaderScreen')>(
  '../AartiReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof AartiReaderScreen>;

const source = getActualData.getAarti(0);
const firstVerse = source.verses[0];

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];
navigation.replace = (() => undefined) as ReaderProps['navigation']['replace'];

const route = {
  key: 'AartiReader-test',
  name: 'AartiReader',
  params: { aartiIndex: 0, initialIndex: 0 },
} as ReaderProps['route'];

test('renders the first Aarti verse without throwing', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <AartiReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(firstVerse.lines[0]));
});

test('dispatches aartiIndex to the Khatu Shyam Aarti, not the first aarti', () => {
  const index = getActualData.aartiIndexById['khatu-shyam-aarti'];
  const khatu = getActualData.getAarti(index);
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <AartiReaderScreen
            navigation={navigation}
            route={{ ...route, params: { aartiIndex: index, initialIndex: 0 } } as ReaderProps['route']}
          />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(khatu.verses[0].lines[0]));
  assert.ok(!renderedText.includes(firstVerse.lines[0]));
});

// Multi-instance dispatch (RULEBOOK §4 step 13): the appended aarti index opens
// its own payload.
test('opens Om Jai Lakshmi Mata by its appended aartiIndex', () => {
  const index = getActualData.aartiIndexById['om-jai-lakshmi-mata'];
  assert.equal(index, 9, 'Lakshmi aarti is appended after Khatu Shyam (index 8)');
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <AartiReaderScreen
            navigation={navigation}
            route={{ ...route, params: { aartiIndex: index, initialIndex: 0 } } as ReaderProps['route']}
          />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
  assert.ok(renderedText.includes('ॐ जय लक्ष्मी माता'), 'Lakshmi aarti refrain');
  assert.ok(!renderedText.includes(firstVerse.lines[0]), 'no Om Jai Jagdish verse leaks in');
});

// Jay Adhya Shakti is Gujarati stored in Devanagari: hi shows the Devanagari,
// gu must restore the maintainer-supplied Gujarati line and its own meaningGu.
test.each([
  ['hi', 'जय आद्या शक्ति, मा जय आद्या शक्ति,'],
  ['gu', 'જય આદ્યા શક્તિ, મા જય આદ્યા શક્તિ,'],
] as const)('opens Jay Adhya Shakti by its appended aartiIndex (%s)', (lang, openingLine) => {
  const index = getActualData.aartiIndexById['jay-adhya-shakti'];
  assert.equal(index, 10, 'Jay Adhya Shakti is appended after Om Jai Lakshmi Mata (index 9)');
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang={lang}>
        <ShareProvider>
          <AartiReaderScreen
            navigation={navigation}
            route={{ ...route, params: { aartiIndex: index, initialIndex: 0 } } as ReaderProps['route']}
          />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
  assert.ok(renderedText.includes(openingLine), `${lang} opening line`);
  if (lang === 'gu') {
    const jas = getActualData.getAarti(index);
    assert.ok(renderedText.includes(jas.verses[0].meaningGu!), 'gu shows the authored Gujarati meaning');
  }
  assert.ok(!renderedText.includes(firstVerse.lines[0]), 'no Om Jai Jagdish verse leaks in');
});

test('opens Shani Dev Aarti by its appended aartiIndex', () => {
  const index = getActualData.aartiIndexById['shani-aarti'];
  assert.equal(index, 11, 'Shani Aarti is appended after Jay Adhya Shakti');
  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = createReader(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <AartiReaderScreen
            navigation={navigation}
            route={{ ...route, params: { aartiIndex: index, initialIndex: 0 } } as ReaderProps['route']}
          />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  const renderedText = tree!.root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
  assert.ok(renderedText.includes('जय जय श्री शनिदेव भक्तन हितकारी'));
  assert.ok(!renderedText.includes(firstVerse.lines[0]));
});
