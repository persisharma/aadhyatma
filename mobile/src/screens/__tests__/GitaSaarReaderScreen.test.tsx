import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, Text, View as mockView } from 'react-native';

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
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      mockReact.createElement(mockView, props, children),
  };
});

const { getGitaSaarChapter, gitaSaarChaptersManifest } = jest.requireActual<
  typeof import('@/data/gita-saar')
>('@/data/gita-saar');
const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const GitaSaarReaderScreen = jest.requireActual<typeof import('../GitaSaarReaderScreen')>(
  '../GitaSaarReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof GitaSaarReaderScreen>;

const chapter = getGitaSaarChapter(1);
const firstVerse = chapter.verses[0];

function render(initialIndex = 0, lang: 'hi' | 'en' = 'hi') {
  const navigate = jest.fn();
  const navigation = {} as ReaderProps['navigation'];
  navigation.goBack = () => undefined;
  navigation.navigate = navigate as unknown as ReaderProps['navigation']['navigate'];
  navigation.replace = (() => undefined) as ReaderProps['navigation']['replace'];
  const route = {
    key: 'GitaSaarReader-test',
    name: 'GitaSaarReader',
    params: { chapter: 1, initialIndex },
  } as ReaderProps['route'];

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <ShareProvider>
          <GitaSaarReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
  return { tree: tree!, navigate, renderedText };
}

test('renders the first Gita Saar page without throwing: corpus shloka + saar + group', () => {
  const { renderedText } = render();
  assert.ok(renderedText.includes(firstVerse.sanskrit[0]));
  assert.ok(renderedText.includes(firstVerse.meaningHi));
  assert.ok(renderedText.includes(firstVerse.groupTitleHi));
  assert.ok(renderedText.includes(`श्लोक · ${firstVerse.gitaChapter}.${firstVerse.gitaVerse}`));
});

test('English mode shows the saar in English and the pill in English (no Devanagari leak)', () => {
  const { renderedText } = render(0, 'en');
  assert.ok(renderedText.includes(firstVerse.meaningEn));
  assert.ok(renderedText.includes(`Shloka · ${firstVerse.gitaChapter}.${firstVerse.gitaVerse}`));
  assert.ok(!renderedText.includes('श्लोक ·'));
});

test('the page hands off into the Gita reader on its own shloka', () => {
  const { tree, navigate } = render();
  const handoff = tree.root.findAll(
    (n) => n.props.testID === 'gita-saar-open-in-gita' && typeof n.props.onPress === 'function'
  )[0];
  assert.ok(handoff, 'hand-off pill must render');
  act(() => {
    handoff.props.onPress();
  });
  assert.equal(navigate.mock.calls.length, 1);
  // JSON round-trip: jest's mock-call arrays come from another realm, which
  // node:assert's strict prototype check rejects.
  assert.equal(
    JSON.stringify(navigate.mock.calls[0]),
    JSON.stringify(['GitaReader', { chapter: firstVerse.gitaChapter, initialIndex: firstVerse.gitaVerse - 1 }])
  );
});

test('the list holds exactly the theme pages (no transition cards while one theme ships)', () => {
  const { tree } = render();
  const list = tree.root.findByType(FlatList);
  const data = list.props.data as { __type?: string }[];
  const transitions = data.filter((d) => d.__type);
  const expectedTransitions =
    (gitaSaarChaptersManifest.length > 1 ? 1 : 0) /* next card on chapter 1 */;
  assert.equal(transitions.length, expectedTransitions);
  assert.equal(data.length - transitions.length, chapter.verseCount);
});

test('the last page carries the closing line', () => {
  const { renderedText } = render(chapter.verseCount - 1);
  assert.ok(renderedText.includes(chapter.closingHi));
});
