import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Text, View as mockView } from 'react-native';
import { DevotionalHero, DevotionalFooter, DevotionalVerseBody } from '@/components/DevotionalFrame';
import { devotionalArtForVerse } from '@/data/devotionalShareArt';
import { findVerse } from '@/data/versePool';

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
  useNavigation: () => ({ navigate: jest.fn() }),
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

test('Bhakti uses the same deity artwork, framed meaning and footer as export', () => {
  let tree: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(<GitaLanguageProvider initialLang="hi"><ShareProvider><DailyBhaktiScreen /></ShareProvider></GitaLanguageProvider>); });
  const verse = findVerse('bhagavad-gita', 0, 1)!;
  const art = devotionalArtForVerse(verse);
  expect(tree!.root.findByType(DevotionalHero).props.art).toBe(art);
  expect(tree!.root.findByType(DevotionalFooter).props.art).toBe(art);
  expect(tree!.root.findByType(DevotionalVerseBody).props.meaning).toBe(verse.meaningHi);
  expect(tree!.root.findByType(DevotionalVerseBody).props.verse).toBe(verse.textHi.join(' '));
  expect(tree!.root.findByType(DevotionalVerseBody).props.verseRows).toEqual(verse.textHi.map(l => l.trim()));
  expect(tree!.root.findByType(DevotionalVerseBody).props.verseStyle).toMatchObject({ fontSize: 23, lineHeight: 36 });
  expect(tree!.root.findAllByProps({ testID: 'devotional-meaning-frame' }).length).toBeGreaterThan(0);
  const strings = tree!.root.findAllByType(Text).map(n => n.props.children);
  expect(strings).not.toContain('Daily Verse');
  expect(strings).not.toContain('दैनिक भक्ति');
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
  expect(texts()).toContain('अर्थ');
  expect(texts()).not.toContain('Meaning');

  act(() => toggle('en').props.onPress());

  expect(toggle('en').props.accessibilityState).toEqual({ selected: true });
  expect(texts()).toContain('Meaning');
  expect(texts()).not.toContain('अर्थ');
  act(() => tree!.unmount());
});
