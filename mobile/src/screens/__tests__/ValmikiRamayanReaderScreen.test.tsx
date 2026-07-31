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
const { getValmikiRamayanChapter, valmikiRamayanChaptersManifest } = jest.requireActual<
  typeof import('@/data/valmiki-ramayan')
>('@/data/valmiki-ramayan');
const ValmikiRamayanReaderScreen = jest.requireActual<
  typeof import('../ValmikiRamayanReaderScreen')
>('../ValmikiRamayanReaderScreen').default;

type ReaderProps = React.ComponentProps<typeof ValmikiRamayanReaderScreen>;

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];
navigation.replace = (() => undefined) as ReaderProps['navigation']['replace'];

function renderChapter(chapter: number) {
  const route = {
    key: 'ValmikiRamayanReader-test',
    name: 'ValmikiRamayanReader',
    params: { chapter, initialIndex: 0 },
  } as ReaderProps['route'];

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <ValmikiRamayanReaderScreen navigation={navigation} route={route} />
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

test('renders the first Valmiki Ramayan verse without throwing', () => {
  const firstVerse = getValmikiRamayanChapter(1).verses[0];
  const renderedText = renderChapter(1);

  assert.match(renderedText, /वाल्मीकि रामायण/);
  assert.ok(renderedText.includes(firstVerse.lines[0]));
  assert.ok(renderedText.includes(firstVerse.meaningHi));
});

test('every kāṇḍa renders its first verse', () => {
  for (const summary of valmikiRamayanChaptersManifest) {
    const chapter = getValmikiRamayanChapter(summary.chapter);
    const renderedText = renderChapter(summary.chapter);
    assert.ok(
      renderedText.includes(chapter.verses[0].lines[0]),
      `kāṇḍa ${summary.chapter} (${summary.titleEn}) did not render its first verse`
    );
  }
});
