/**
 * Rating prompt (design.md §54) — sheet rendering plus the provider wiring
 * behind it: the moment-triggered open and its settle delay, what each button
 * persists, and the gate's refusal to stack on another surface.
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
import { useRatingAsk } from '@/contexts/ratingAsk';
import {
  MIN_ACTIVE_DAYS,
  MIN_APP_OPENS,
  MIN_VERSE_READS,
  RATING_PROMPT_STORAGE_KEY,
  parseRatingPromptState,
  type RatingAskTrigger,
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

/**
 * Stand-in for a surface that reports a good moment (celebration overlay, japam
 * counter, share flow): captures the provider's `requestAsk` so tests can fire it.
 */
let requestAsk: ((trigger: RatingAskTrigger) => void) | null = null;
function MomentProbe() {
  requestAsk = useRatingAsk();
  return null;
}

function tree_(): React.ReactElement {
  return (
    <ThemeProvider>
      <GitaLanguageProvider initialLang="en">
        <RatingPromptProvider>
          <MomentProbe />
          <RatingPromptSheet />
        </RatingPromptProvider>
      </GitaLanguageProvider>
    </ThemeProvider>
  );
}

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(tree_());
  });
  return tree;
}

/** Render and let hydration settle — nothing has asked yet. */
async function renderHydrated(): Promise<TestRenderer.ReactTestRenderer> {
  const tree = render();
  await act(async () => {
    await Promise.resolve();
  });
  return tree;
}

/** Report a moment and run the settle delay to completion. */
async function fireMoment(trigger: RatingAskTrigger = 'routine-complete'): Promise<void> {
  act(() => {
    requestAsk?.(trigger);
  });
  await act(async () => {
    jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
  });
}

/** Render, hydrate, report a moment, and let the delay run. */
async function renderAndSettle(
  trigger: RatingAskTrigger = 'routine-complete'
): Promise<TestRenderer.ReactTestRenderer> {
  const tree = await renderHydrated();
  await fireMoment(trigger);
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
  requestAsk = null;
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

describe('moment-triggered ask', () => {
  test('never opens on its own — a cold start with no moment stays silent', async () => {
    const tree = await renderHydrated();
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS * 10);
    });
    expect(modalVisible(tree)).toBe(false);
    expect(mockStore.has(RATING_PROMPT_STORAGE_KEY)).toBe(false);
  });

  test('opens after the settle delay once a moment is reported, and records which one', async () => {
    const tree = await renderHydrated();
    act(() => {
      requestAsk?.('routine-complete');
    });
    // Nothing on screen while the delay is still running — the moment's own
    // feedback (petals, haptic) gets to finish first.
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
    expect(saved.asksByTrigger).toEqual({ 'routine-complete': 1 });
  });

  test('every moment is a valid trigger', async () => {
    for (const trigger of ['japa-round', 'share'] as const) {
      mockStore.clear();
      const tree = await renderAndSettle(trigger);
      expect(modalVisible(tree)).toBe(true);
      expect(savedState().asksByTrigger).toEqual({ [trigger]: 1 });
      act(() => tree.unmount());
    }
  });

  test('asks at most once per session, however many moments follow', async () => {
    const tree = await renderAndSettle('share');
    expect(modalVisible(tree)).toBe(true);
    act(() => {
      pressableByLabel(tree, 'Maybe later').props.onPress();
    });
    expect(modalVisible(tree)).toBe(false);

    await fireMoment('japa-round');
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().askCount).toBe(1);
  });

  test('two moments in quick succession queue one card, not two', async () => {
    const tree = await renderHydrated();
    act(() => {
      requestAsk?.('routine-complete');
      requestAsk?.('share');
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
    });
    expect(modalVisible(tree)).toBe(true);
    expect(savedState()).toMatchObject({ askCount: 1, asksByTrigger: { 'routine-complete': 1 } });
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

  test('a surface that claims the screen during the delay cancels the open', async () => {
    const tree = await renderHydrated();
    act(() => {
      requestAsk?.('routine-complete');
    });
    mockOptInShowing = true;
    act(() => {
      tree.update(tree_());
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
    });
    expect(modalVisible(tree)).toBe(false);
    expect(mockStore.has(RATING_PROMPT_STORAGE_KEY)).toBe(false);
  });

  test('reading activity during the delay does not defer the ask', async () => {
    // The gate reads engagement counters through refs precisely so this can't
    // regress: if the pending timer lived in an effect keyed on them, every
    // logged read would clear and re-arm it, and a user paging through a reader
    // would push the prompt out indefinitely.
    const tree = await renderHydrated();
    act(() => {
      requestAsk?.('share');
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS - 500);
    });

    // A verse advance lands mid-delay and re-renders the provider.
    mockTotalReads = MIN_VERSE_READS + 5;
    act(() => {
      tree.update(tree_());
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(modalVisible(tree)).toBe(true);
  });

  test('never re-opens for a user who already rated', async () => {
    mockStore.set(
      RATING_PROMPT_STORAGE_KEY,
      JSON.stringify({ askCount: 1, lastAskedAt: 1, outcome: 'rated' })
    );
    expect(modalVisible(await renderAndSettle())).toBe(false);
  });

  test('useRatingAsk is a silent no-op outside the provider', () => {
    let fn: ((t: RatingAskTrigger) => void) | null = null;
    function Bare() {
      fn = useRatingAsk();
      return null;
    }
    act(() => {
      TestRenderer.create(<Bare />);
    });
    expect(() => fn?.('share')).not.toThrow();
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

  test('offers exactly two actions — no permanent opt-out', async () => {
    const tree = await renderAndSettle();

    // Product decision (Aug 2026): "only now and later". Rating is the only
    // outcome reachable from this card that ends the 5-day cadence.
    expect(pressableByLabel(tree, 'Rate Vedansh on the store')).toBeDefined();
    expect(pressableByLabel(tree, 'Maybe later')).toBeDefined();

    const actions = tree.root.findAll(
      (n) => typeof n.props?.onPress === 'function' && typeof n.props?.accessibilityLabel === 'string'
    );
    expect(actions).toHaveLength(2);

    const text = allText(tree);
    expect(text).not.toMatch(/ask again/i);
    expect(text).not.toMatch(/फिर न पूछें/);
  });

  test('a state declined by an earlier build is still honoured', async () => {
    // The button is gone, but the gate must not resurrect an opted-out user.
    mockStore.set(
      RATING_PROMPT_STORAGE_KEY,
      JSON.stringify({ askCount: 3, lastAskedAt: 1, outcome: 'declined' })
    );
    expect(modalVisible(await renderAndSettle())).toBe(false);
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
    ['en', /Rate Vedansh/, /Maybe later/],
    ['hi', /रेटिंग दें/, /बाद में/],
    ['gu', /રેટિંગ આપો/, /પછી/],
    ['kn', /ರೇಟಿಂಗ್ ನೀಡಿ/, /ನಂತರ/],
  ] as const)('renders %s copy, not a hardcoded English string', async (lang, primary, later) => {
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <GitaLanguageProvider initialLang={lang}>
            <RatingPromptProvider>
              <MomentProbe />
              <RatingPromptSheet />
            </RatingPromptProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });
    await fireMoment();

    expect(modalVisible(tree)).toBe(true);
    const text = allText(tree);
    expect(text).toMatch(primary);
    expect(text).toMatch(later);
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
