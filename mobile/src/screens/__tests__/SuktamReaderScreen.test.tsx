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

jest.mock('@/contexts/AudioPlayerContext', () => ({
  useAudioPlayerContext: () => ({ playTrack: jest.fn(), openNowPlaying: jest.fn() }),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const { getSuktam } = jest.requireActual<typeof import('@/data/suktam')>('@/data/suktam');
const SuktamReaderScreen = jest.requireActual<typeof import('../SuktamReaderScreen')>(
  '../SuktamReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof SuktamReaderScreen>;

const suktam = getSuktam('devi-suktam');
const firstVerse = suktam.verses[0];

const navigation = {} as ReaderProps['navigation'];
navigation.goBack = () => undefined;
navigation.navigate = (() => undefined) as ReaderProps['navigation']['navigate'];

const route = {
  key: 'SuktamReader-test',
  name: 'SuktamReader',
  params: { suktamId: 'devi-suktam', initialIndex: 0 },
} as ReaderProps['route'];

test('renders the first Devi Suktam verse without throwing', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <SuktamReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const renderedText = tree!
    .root.findAllByType(Text)
    .map((node) => node.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');

  assert.ok(renderedText.includes(suktam.titleHi));
  assert.ok(renderedText.includes(firstVerse.lines[0]));
});
