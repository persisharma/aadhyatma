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
const { getUpanishadChapter, upanishadChaptersManifest } = jest.requireActual<
  typeof import('@/data/upanishad')
>('@/data/upanishad');
const UpanishadReaderScreen = jest.requireActual<
  typeof import('../UpanishadReaderScreen')
>('../UpanishadReaderScreen').default;

type ReaderProps = React.ComponentProps<typeof UpanishadReaderScreen>;

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];
navigation.replace = (() => undefined) as ReaderProps['navigation']['replace'];

function renderChapter(chapter: number) {
  const route = {
    key: 'UpanishadReader-test',
    name: 'UpanishadReader',
    params: { chapter, initialIndex: 0 },
  } as ReaderProps['route'];

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <UpanishadReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  return tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

test('renders the first Upanishad page (Īśa śānti-pāṭha) without throwing', () => {
  const firstVerse = getUpanishadChapter(1).verses[0];
  const renderedText = renderChapter(1);

  assert.match(renderedText, /उपनिषद्/);
  assert.ok(renderedText.includes(firstVerse.lines[0]));
  assert.ok(renderedText.includes(firstVerse.meaningHi));
});

test('every Upanishad renders its first page', () => {
  for (const summary of upanishadChaptersManifest) {
    const chapter = getUpanishadChapter(summary.chapter);
    const renderedText = renderChapter(summary.chapter);
    assert.ok(
      renderedText.includes(chapter.verses[0].lines[0]),
      `Upanishad ${summary.chapter} (${summary.titleEn}) did not render its first page`
    );
  }
});

test('a mantra page renders its Devanagari numeral pill and both meanings', () => {
  const chapter = getUpanishadChapter(1);
  const mantraOne = chapter.verses[1];
  assert.equal(mantraOne.labelHi, 'मन्त्र · १');
  assert.equal(mantraOne.labelEn, 'Mantra · 1');
  assert.ok(mantraOne.meaningHi.length > 0 && mantraOne.meaningEn.length > 0);
});

test('the reader steps between READABLE Upanishads, skipping unshipped Muktikā numbers', () => {
  const { nextUpanishadChapter, prevUpanishadChapter, isUpanishadAvailable } = jest.requireActual<
    typeof import('@/data/upanishad')
  >('@/data/upanishad');
  assert.equal(nextUpanishadChapter(3)?.chapter, 5, 'Kaṭha (3) advances to Muṇḍaka (5): Praśna (4) is not shipped');
  assert.equal(prevUpanishadChapter(5)?.chapter, 3);
  assert.equal(nextUpanishadChapter(6), null);
  assert.equal(prevUpanishadChapter(1), null);
  assert.equal(isUpanishadAvailable(4), false);
});
