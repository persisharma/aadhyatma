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

// This suite asserts text, source disclosure and progress clamping — not the R2
// background download. Keep the real cache (InteractionManager-deferred fetch +
// its timers) out of these synchronous renders: its async would otherwise outlive
// the tests. The download path itself is covered by BackgroundArtwork/shareBackgroundReady.
jest.mock('@/utils/backgroundAssetCache', () => ({
  subscribeBackgroundAsset: jest.fn(() => jest.fn()),
  evictBackgroundAsset: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => {
  return {
    LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      mockReact.createElement(mockView, props, children),
  };
});

const { getGarudPuranChapter } = jest.requireActual<
  typeof import('@/data/garud-puran')
>('@/data/garud-puran');
const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const GarudPuranReaderScreen = jest.requireActual<typeof import('../GarudPuranReaderScreen')>(
  '../GarudPuranReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof GarudPuranReaderScreen>;

const chapter = getGarudPuranChapter(1);
const firstVerse = chapter.verses[0];

function render(initialIndex = 0, lang: 'hi' | 'en' = 'hi') {
  const navigate = jest.fn();
  const navigation = {} as ReaderProps['navigation'];
  navigation.goBack = () => undefined;
  navigation.navigate = navigate as unknown as ReaderProps['navigation']['navigate'];
  navigation.replace = (() => undefined) as ReaderProps['navigation']['replace'];
  const route = {
    key: 'GarudPuranReader-test',
    name: 'GarudPuranReader',
    params: { chapter: 1, initialIndex },
  } as ReaderProps['route'];

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang={lang}>
        <ShareProvider>
          <GarudPuranReaderScreen navigation={navigation} route={route} />
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


test('Hindi and English show the complete authored paragraphs and editorial label', () => {
  const hi = render();
  expect(hi.renderedText).toContain(firstVerse.bodyHi[0]);
  expect(hi.renderedText).toContain('चयनित प्रसंग');
  const en = render(0, 'en');
  expect(en.renderedText).toContain(firstVerse.bodyEn[0]);
  expect(en.renderedText).toContain('Selected reading');
  expect(en.renderedText).not.toContain(firstVerse.bodyHi[0]);
});

test('source disclosure opens on the rendered page', () => {
  const { tree } = render();
  const button = tree.root.findAll(n => n.props.testID === `garud-sources-${firstVerse.id}` && typeof n.props.onPress === 'function')[0];
  act(() => button.props.onPress());
  expect(tree.root.findAll(n => n.props.testID === 'garud-source-details').length).toBeGreaterThan(0);
  const text = tree.root.findAllByType(Text).map(n => n.props.children).flat(Infinity).join(' ');
  expect(text).toContain(chapter.source.citeHi);
});

test('out-of-range saved progress is clamped to the final page', () => {
  const { tree } = render(999);
  expect(tree.root.findByType(FlatList).props.initialScrollIndex).toBe(chapter.verseCount - 1);
});
