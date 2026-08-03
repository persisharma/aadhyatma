/**
 * Rating prompt (design.md §54) — sheet rendering plus the provider wiring
 * behind it: the auto-open delay, what each button persists, and the gate's
 * refusal to stack on another surface.
 */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import { Linking, Modal, Text } from 'react-native';
import type { ReactTestInstance } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import RatingPromptSheet from '@/components/RatingPromptSheet';
import {
  RatingPromptProvider,
  RATING_PROMPT_DELAY_MS,
} from '@/contexts/RatingPromptContext';
import {
  MIN_ACTIVE_DAYS,
  MIN_APP_OPENS,
  MIN_VERSE_READS,
  RATING_PROMPT_STORAGE_KEY,
  parseRatingPromptState,
} from '@/data/ratingPrompt';

// ── In-memory AsyncStorage so we can assert what the provider persisted ──
const mockStore = new Map<string, string>();
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn((k: string) => Promise.resolve(mockStore.get(k) ?? null)),
  setItem: jest.fn((k: string, v: string) => {
    mockStore.set(k, v);
    return Promise.resolve();
  }),
  removeItem: jest.fn((k: string) => {
    mockStore.delete(k);
    return Promise.resolve();
  }),
}));

// ── Controllable stand-ins for the three contexts the gate reads ──
let mockAppOpens = MIN_APP_OPENS;
let mockOptInShowing = false;
let mockActiveDays = MIN_ACTIVE_DAYS;
let mockTotalReads = MIN_VERSE_READS;
let mockTourFlags = {
  isLoading: false,
  shouldShowFirstLaunchTour: false,
  shouldShowOnboardingSetup: false,
  shouldShowWhatsNew: false,
};

jest.mock('@/contexts/NotificationPreferencesContext', () => ({
  useNotificationPreferences: () => ({
    meta: { appOpenCount: mockAppOpens, optInPromptShown: true },
    isLoading: false,
    shouldShowOptIn: mockOptInShowing,
  }),
}));

jest.mock('@/contexts/UserActivityContext', () => ({
  useUserActivity: () => ({
    isLoading: false,
    lifetimeTotals: () => ({
      totalReads: mockTotalReads,
      totalBeads: 0,
      totalRounds: 0,
      perSource: {},
      perMantra: {},
      activeDays: mockActiveDays,
    }),
  }),
}));

jest.mock('@/contexts/TourContext', () => ({
  useTour: () => mockTourFlags,
}));

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(
      <ThemeProvider>
        <GitaLanguageProvider initialLang="en">
          <RatingPromptProvider>
            <RatingPromptSheet />
          </RatingPromptProvider>
        </GitaLanguageProvider>
      </ThemeProvider>
    );
  });
  return tree;
}

/** Render, let hydration settle, then run the auto-open timer to completion. */
async function renderAndSettle(): Promise<TestRenderer.ReactTestRenderer> {
  const tree = render();
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
  });
  return tree;
}

function modalVisible(tree: TestRenderer.ReactTestRenderer): boolean {
  return tree.root.findByType(Modal).props.visible === true;
}

function pressableByLabel(tree: TestRenderer.ReactTestRenderer, label: string): ReactTestInstance {
  return tree.root.find(
    (n) => n.props?.accessibilityLabel === label && typeof n.props?.onPress === 'function'
  );
}

function allText(tree: TestRenderer.ReactTestRenderer): string {
  return tree.root
    .findAllByType(Text)
    .map((n) => n.props.children)
    .flat(Number.POSITIVE_INFINITY)
    .join(' ');
}

function savedState() {
  return parseRatingPromptState(mockStore.get(RATING_PROMPT_STORAGE_KEY) ?? null);
}

let openURL: jest.SpiedFunction<typeof Linking.openURL>;

beforeEach(() => {
  jest.useFakeTimers();
  mockStore.clear();
  mockAppOpens = MIN_APP_OPENS;
  mockOptInShowing = false;
  mockActiveDays = MIN_ACTIVE_DAYS;
  mockTotalReads = MIN_VERSE_READS;
  mockTourFlags = {
    isLoading: false,
    shouldShowFirstLaunchTour: false,
    shouldShowOnboardingSetup: false,
    shouldShowWhatsNew: false,
  };
  openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
});

afterEach(() => {
  openURL.mockRestore();
  jest.useRealTimers();
});

describe('auto-open gate', () => {
  test('opens after the settle delay for an engaged user, and records the ask', async () => {
    const tree = render();
    await act(async () => {
      await Promise.resolve();
    });
    // Nothing on screen while the delay is still running — no launch-frame ambush.
    expect(modalVisible(tree)).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
    });
    expect(modalVisible(tree)).toBe(true);
    expect(allText(tree)).toMatch(/Enjoying Vedansh\?/);

    const saved = savedState();
    expect(saved.askCount).toBe(1);
    expect(saved.outcome).toBe('pending');
    expect(saved.lastAskedAt).not.toBeNull();
  });

  test('stays shut for a user who has not earned the ask yet', async () => {
    mockAppOpens = MIN_APP_OPENS - 1;
    const tree = await renderAndSettle();
    expect(modalVisible(tree)).toBe(false);
    expect(mockStore.has(RATING_PROMPT_STORAGE_KEY)).toBe(false);
  });

  test('stands down while another surface wants the screen', async () => {
    mockTourFlags = { ...mockTourFlags, shouldShowWhatsNew: true };
    expect(modalVisible(await renderAndSettle())).toBe(false);

    mockTourFlags = { ...mockTourFlags, shouldShowWhatsNew: false };
    mockOptInShowing = true;
    expect(modalVisible(await renderAndSettle())).toBe(false);
  });

  test('reading activity during the delay does not defer the ask', async () => {
    // The gate reads engagement counters through a ref precisely so this can't
    // regress: if they were effect dependencies, every logged read would clear
    // the pending timer and re-arm it, and a user paging through a reader would
    // push the prompt out indefinitely.
    const tree = render();
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS - 500);
    });

    // A verse advance lands mid-delay and re-renders the provider.
    mockTotalReads = MIN_VERSE_READS + 5;
    act(() => {
      tree.update(
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <RatingPromptProvider>
              <RatingPromptSheet />
            </RatingPromptProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      );
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(modalVisible(tree)).toBe(true);
  });

  test('never re-opens for a user who already answered', async () => {
    mockStore.set(
      RATING_PROMPT_STORAGE_KEY,
      JSON.stringify({ askCount: 1, lastAskedAt: 1, outcome: 'declined' })
    );
    expect(modalVisible(await renderAndSettle())).toBe(false);
  });
});

describe('buttons', () => {
  test('"Rate Vedansh" hands off to the store and stops asking', async () => {
    const tree = await renderAndSettle();
    await act(async () => {
      pressableByLabel(tree, 'Rate Vedansh on the store').props.onPress();
    });

    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL.mock.calls[0][0]).toMatch(/apps\.apple\.com|play\.google\.com/);
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().outcome).toBe('rated');
  });

  test('"Maybe later" closes without leaving the app or ending the ask', async () => {
    const tree = await renderAndSettle();
    await act(async () => {
      pressableByLabel(tree, 'Maybe later').props.onPress();
    });

    expect(openURL).not.toHaveBeenCalled();
    expect(modalVisible(tree)).toBe(false);
    // Still 'pending' — the cooldown, not the outcome, is what silences it.
    expect(savedState()).toMatchObject({ askCount: 1, outcome: 'pending' });
  });

  test('"Don\'t ask again" is terminal', async () => {
    const tree = await renderAndSettle();
    await act(async () => {
      pressableByLabel(tree, "Don't ask again").props.onPress();
    });

    expect(openURL).not.toHaveBeenCalled();
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().outcome).toBe('declined');
  });

  test('a store hand-off that the OS refuses falls back to the plain listing', async () => {
    openURL.mockRejectedValueOnce(new Error('unsupported URL'));
    const tree = await renderAndSettle();
    await act(async () => {
      pressableByLabel(tree, 'Rate Vedansh on the store').props.onPress();
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(openURL).toHaveBeenCalledTimes(2);
    expect(openURL.mock.calls[1][0]).not.toContain('write-review');
    // Still counted as rated — we did our part; nagging after a hand-off is the
    // behaviour this feature exists to avoid.
    expect(savedState().outcome).toBe('rated');
  });
});

describe('presentation', () => {
  // One case per script class: en is the Latin path, hi the Devanagari one, and
  // gu/kn are runtime-transliterated everywhere else in the app but hand-authored
  // here (`pick`), so each language needs its own copy to exist at all.
  test.each([
    ['en', /Rate Vedansh/, /Don’t ask again/],
    ['hi', /रेटिंग दें/, /फिर न पूछें/],
    ['gu', /રેટિંગ આપો/, /ફરી ન પૂછો/],
    ['kn', /ರೇಟಿಂಗ್ ನೀಡಿ/, /ಮತ್ತೆ ಕೇಳಬೇಡಿ/],
  ] as const)('renders %s copy, not a hardcoded English string', async (lang, primary, never) => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <RatingPromptProvider>
              <RatingPromptSheet />
            </RatingPromptProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
    });

    expect(modalVisible(tree)).toBe(true);
    const text = allText(tree);
    expect(text).toMatch(primary);
    expect(text).toMatch(never);
  });

  test('the decorative star row is hidden from assistive tech', async () => {
    const tree = await renderAndSettle();
    const stars = tree.root.findAll(
      (n) => typeof n.props?.children === 'string' && n.props.children.includes('★')
    );
    expect(stars.length).toBeGreaterThan(0);
    expect(stars[0].props.accessibilityElementsHidden).toBe(true);
    expect(stars[0].props.importantForAccessibility).toBe('no');
  });
});
