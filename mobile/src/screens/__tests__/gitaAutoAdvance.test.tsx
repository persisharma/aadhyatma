// Auto-advance-to-next-chapter (PR #29) — unit coverage.
//
// In GitaReaderScreen the chapter transition is driven by the horizontal
// FlatList's `onViewableItemsChanged`: when the trailing NextChapterCard
// ("transition" item) scrolls into view, the screen fires a Medium haptic and,
// 400ms later, `navigation.replace('GitaReader', { chapter: nextChapter })`.
//
// This can't be driven reliably from Maestro — it would require ~47
// deterministic page-swipes to reach the end of Chapter 1, and the trigger is
// scroll-velocity dependent (see gita-smoke.yaml header). So we exercise the
// viewability → replace logic directly: render the reader, invoke the
// FlatList's onViewableItemsChanged with the transition item, and assert the
// deferred navigation. A normal verse must NOT advance.

import React, * as mockReact from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { FlatList, View as mockView } from 'react-native';

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

jest.mock('expo-linear-gradient', () => ({
  LinearGradient: ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) =>
    mockReact.createElement(mockView, props, children),
}));

const { GitaLanguageProvider } = jest.requireActual<typeof import('@/data/gita/language')>(
  '@/data/gita/language'
);
const { ShareProvider } = jest.requireActual<typeof import('@/utils/shareVerse')>(
  '@/utils/shareVerse'
);
const GitaReaderScreen = jest.requireActual<typeof import('../GitaReaderScreen')>(
  '../GitaReaderScreen'
).default;

type ReaderProps = React.ComponentProps<typeof GitaReaderScreen>;

function makeNavigation(): ReaderProps['navigation'] {
  const navigation = {} as ReaderProps['navigation'];
  navigation.goBack = jest.fn() as ReaderProps['navigation']['goBack'];
  navigation.navigate = jest.fn() as ReaderProps['navigation']['navigate'];
  navigation.replace = jest.fn() as ReaderProps['navigation']['replace'];
  return navigation;
}

function renderReader(navigation: ReaderProps['navigation'], chapter = 1) {
  const route = {
    key: 'GitaReader-test',
    name: 'GitaReader',
    params: { chapter, initialIndex: 0 },
  } as ReaderProps['route'];

  let tree: TestRenderer.ReactTestRenderer | undefined;
  act(() => {
    tree = TestRenderer.create(
      <GitaLanguageProvider initialLang="hi">
        <ShareProvider>
          <GitaReaderScreen navigation={navigation} route={route} />
        </ShareProvider>
      </GitaLanguageProvider>
    );
  });
  return tree!;
}

describe('Gita reader auto-advance (PR #29)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  test('scrolling onto the next-chapter transition card replaces to the next chapter after 400ms', () => {
    const navigation = makeNavigation();
    const tree = renderReader(navigation, 1);

    const list = tree.root.findByType(FlatList);
    const data = list.props.data as ReadonlyArray<{ id: string; __type?: string; nextChapter?: number }>;
    const transition = data[data.length - 1];

    // Sanity: Chapter 1's last list item is the forward transition to Chapter 2.
    expect(transition.__type).toBe('transition');
    expect(transition.nextChapter).toBe(2);

    act(() => {
      list.props.onViewableItemsChanged?.({
        viewableItems: [
          { index: data.length - 1, item: transition, key: transition.id, isViewable: true },
        ],
        changed: [],
      });
    });

    // Navigation is deferred behind a 400ms timer (gives the haptic a beat).
    expect(navigation.replace).not.toHaveBeenCalled();
    act(() => {
      jest.advanceTimersByTime(400);
    });
    expect(navigation.replace).toHaveBeenCalledTimes(1);
    expect(navigation.replace).toHaveBeenCalledWith('GitaReader', { chapter: 2 });
  });

  test('scrolling onto a normal verse does NOT auto-advance', () => {
    const navigation = makeNavigation();
    const tree = renderReader(navigation, 1);

    const list = tree.root.findByType(FlatList);
    const data = list.props.data as ReadonlyArray<{ id: string; __type?: string }>;
    const firstVerse = data[0];
    expect(firstVerse.__type).toBeUndefined();

    act(() => {
      list.props.onViewableItemsChanged?.({
        viewableItems: [{ index: 0, item: firstVerse, key: firstVerse.id, isViewable: true }],
        changed: [],
      });
      jest.advanceTimersByTime(400);
    });

    expect(navigation.replace).not.toHaveBeenCalled();
  });
});
