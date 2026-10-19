import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Image, ScrollView, Text, View as mockView } from 'react-native';
import BackgroundLayer from '@/components/BackgroundLayer';
import ReadingArtwork from '@/components/ReadingArtwork';
import ReadingBanner from '@/components/ReadingBanner';
import Ornament from '@/components/Ornament';
import { devotionalArtAsset } from '@/data/devotionalShareArt';

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
// The setup strip needs the notification provider; it has its own suite.
jest.mock('@/components/DailyBhaktiNudge', () => () => null);

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
 * Reading and sharing use the same deity art. The reading text remains uncapped.
 */
test('reading card shows the approved deity art instead of a plain background', () => {
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

  expect(tree!.root.findAllByType(BackgroundLayer)).toHaveLength(0);
  const image = tree!.root.findByType(Image);
  expect(image.props.testID).toBe('daily-bhakti-deity-image');
  expect(image.props.source).toBe(devotionalArtAsset('krishna'));
  expect(image.props.resizeMode).toBe('contain');
  expect(image.props.accessible).toBe(false);
  expect(tree!.root.findAllByType(ScrollView)).toHaveLength(1);
  // Only the artwork has a fixed height; scripture and meaning remain complete.
  for (const text of tree!.root.findAllByType(Text)) {
    expect(text.props.numberOfLines).toBeUndefined();
    expect(text.props.adjustsFontSizeToFit).not.toBe(true);
  }
  expect(tree!.root.findAllByType(ReadingArtwork)).toHaveLength(0);
  expect(tree!.root.findAllByType(ReadingBanner)).toHaveLength(0);
  expect(tree!.root.findByType(Ornament).props.compact).toBe(true);
  act(() => tree!.unmount());
});

test('the language toggle re-languages the verse card in place', () => {
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

  const texts = () =>
    tree!.root.findAllByType(Text).map((node) => [node.props.children].flat().join(''));
  const toggle = (value: string) =>
    tree!.root.find((node) => node.props.testID === `lang-toggle-${value}` && !!node.props.onPress);

  expect(toggle('hi').props.accessibilityState).toEqual({ selected: true });
  expect(texts()).toContain('· Meaning');

  act(() => toggle('en').props.onPress());

  expect(toggle('en').props.accessibilityState).toEqual({ selected: true });
  expect(texts()).toContain('· अर्थ');
  act(() => tree!.unmount());
});
