import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';
import BackgroundLayer from '@/components/BackgroundLayer';
import ReadingArtwork from '@/components/ReadingArtwork';
import ReadingBanner from '@/components/ReadingBanner';
import Ornament from '@/components/Ornament';
import { readingParchment } from '@/data/backgroundAsset';
import { getReaderBackground } from '@/data/backgrounds';

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('react-native-view-shot', () => ({
  captureRef: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

// Pin the tab to a known verse (a reminder-tap deep link) so the rendered
// background is deterministic instead of following a random pool pick.
jest.mock('@react-navigation/native', () => ({
  useRoute: () => ({
    key: 'DailyBhaktiTab-test',
    name: 'DailyBhaktiTab',
    params: { sourceId: 'bhagavad-gita', chapter: 1, verseIndex: 0 },
  }),
}));

// The docked banner drags in the routine store + navigation stack — out of
// scope for this suite.
jest.mock('@/components/RoutineBanner', () => () => null);

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const DailyBhaktiScreen = jest.requireActual<typeof import('../DailyBhaktiScreen')>(
  '../DailyBhaktiScreen'
).default;

/**
 * The daily verse keeps its source's themed background without making each
 * random verse a cover card (no banner).
 */
test('verse card keeps the source background and a compact divider without a banner', () => {
  let tree: TestRenderer.ReactTestRenderer | undefined;

  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <DailyBhaktiScreen />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });

  const backgrounds = tree!.root.findAllByType(BackgroundLayer);
  expect(backgrounds).toHaveLength(1);
  expect(backgrounds[0].props.source).toEqual(getReaderBackground('bhagavad-gita', { stanza: 1 }));
  expect(backgrounds[0].props.source).not.toBe(readingParchment);
  expect(tree!.root.findAllByType(ReadingArtwork)).toHaveLength(0);
  expect(tree!.root.findAllByType(ReadingBanner)).toHaveLength(0);
  expect(tree!.root.findByType(Ornament).props.compact).toBe(true);
  act(() => tree!.unmount());
});
