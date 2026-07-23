import assert from 'node:assert/strict';
import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light' },
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

// The reader pulls the app-wide media player via context; stub it so the screen
// renders in isolation without the provider (mirrors ChalisaReaderScreen.test).
jest.mock('@/contexts/AudioPlayerContext', () => ({
  useAudioPlayerContext: () => ({ playTrack: jest.fn(), openNowPlaying: jest.fn() }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const { getAshtakam } = jest.requireActual<typeof import('@/data/ashtakam')>('@/data/ashtakam');
const AshtakamReaderScreen = jest.requireActual<typeof import('../AshtakamReaderScreen')>(
  '../AshtakamReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof AshtakamReaderScreen>;

const ashtakam = getAshtakam('lingashtakam');
const firstVerse = ashtakam.verses[0];

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];

const route = {
  key: 'AshtakamReader-test',
  name: 'AshtakamReader',
  params: { ashtakamId: 'lingashtakam', initialIndex: 0 },
} as ReaderProps['route'];

test('renders the first Lingashtakam verse without throwing', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <AshtakamReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(ashtakam.titleHi));
  assert.ok(renderedText.includes(firstVerse.lines[0]));
});
