import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { View as mockView } from 'react-native';
import { DevotionalVerseBody } from '@/components/DevotionalFrame';
import { findVerse } from '@/data/versePool';

// BEH-13: tapping the SAME daily-verse reminder twice must show that verse again
// after the user has browsed to another one. React Navigation hands the tab a
// fresh params object on every navigate(), with identical primitive values.

// DevotionalFrame -> background asset cache pulls in the ESM-only expo-crypto / expo-file-system.
jest.mock('expo-crypto', () => ({}));
jest.mock('expo-file-system', () => ({ File: class {}, Directory: class {}, Paths: {} }));
jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: { Light: 'Light', Medium: 'Medium' },
  impactAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('react-native-view-shot', () => ({ captureRef: jest.fn(() => Promise.resolve(null)) }));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(false)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

let mockParams: { sourceId: string; chapter: number; verseIndex: number } = {
  sourceId: 'bhagavad-gita',
  chapter: 1,
  verseIndex: 0,
};
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ key: 'DailyBhaktiTab-test', name: 'DailyBhaktiTab', params: mockParams }),
}));
jest.mock('@/components/DailyBhaktiNudge', () => () => null);

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>('@/data/gita/language');
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>('@/utils/shareVerse');
const DailyBhaktiScreen = jest.requireActual<typeof import('../DailyBhaktiScreen')>('../DailyBhaktiScreen').default;

// A function, so a re-render really gets new elements (an identical element bails out).
const element = () => (
  <GitaLanguageProvider initialLang="hi">
    <ShareProvider>
      <DailyBhaktiScreen />
    </ShareProvider>
  </GitaLanguageProvider>
);

test('a second tap on the same reminder restores its verse after browsing away', () => {
  const pinned = findVerse('bhagavad-gita', 0, 1)!;
  let tree: TestRenderer.ReactTestRenderer;
  act(() => { tree = TestRenderer.create(element()); });
  const shown = () => tree!.root.findByType(DevotionalVerseBody).props.verse as string;
  expect(shown()).toBe(pinned.textHi.join(' '));

  // Browse away with "next" until a different verse is showing.
  const next = tree!.root.find((n) => n.props.testID === 'daily-bhakti-next' && !!n.props.onPress);
  for (let i = 0; i < 40 && shown() === pinned.textHi.join(' '); i += 1) {
    act(() => next.props.onPress());
  }
  expect(shown()).not.toBe(pinned.textHi.join(' '));

  // The same notification tapped again: identical values, new params object.
  mockParams = { sourceId: 'bhagavad-gita', chapter: 1, verseIndex: 0 };
  act(() => { tree!.update(element()); });
  expect(shown()).toBe(pinned.textHi.join(' '));
  act(() => tree!.unmount());
});
