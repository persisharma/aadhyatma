/**
 * Rating prompt (design.md §54) — sheet rendering plus the provider wiring
 * behind it: the moment-triggered open and its settle delay, what each star and
 * button persists, and the gate's refusal to stack on another surface.
 */

import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, Linking, Modal, ScrollView, StyleSheet, Text } from 'react-native';
import { lightColors } from '@/theme/colors';
import type { ReactTestInstance } from 'react-test-renderer';
import { ThemeProvider } from '@/theme/ThemeContext';
import { GitaLanguageProvider } from '@/data/gita/language';
import RatingPromptSheet from '@/components/RatingPromptSheet';
import {
  RatingPromptProvider,
  RATING_PROMPT_DELAY_MS,
  useRatingPrompt,
} from '@/contexts/RatingPromptContext';
import { reportRatingAsk, useRatingAsk } from '@/contexts/ratingAsk';
import { ENGAGEMENT_PROMPTS } from '@/data/engagementPrompts';
import { FontScaleProvider } from '@/contexts/FontScaleContext';
import * as ratingPrompt from '@/data/ratingPrompt';
import {
  MIN_ACTIVE_DAYS,
  MIN_APP_OPENS,
  RATING_PROMPT_STORAGE_KEY,
  parseRatingPromptState,
  type RatingAskTrigger,
} from '@/data/ratingPrompt';

jest.mock('@/components/launchAskStore',()=>({useLaunchAsks:()=>({ready:true,selectionComplete:true,taken:mockOptInShowing}),claimRatingAsk:()=>true}));

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
let mockTotalReads = 0;
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

const mounted: TestRenderer.ReactTestRenderer[] = [];

function render(): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer;
  act(() => {
    tree = TestRenderer.create(tree_());
  });
  mounted.push(tree);
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

function pressablesByLabel(tree: TestRenderer.ReactTestRenderer, label: string): ReactTestInstance[] {
  return tree.root.findAll(
    (n) => n.props?.accessibilityLabel === label && typeof n.props?.onPress === 'function'
  );
}

function pressableByLabel(tree: TestRenderer.ReactTestRenderer, label: string): ReactTestInstance {
  return tree.root.find(
    (n) => n.props?.accessibilityLabel === label && typeof n.props?.onPress === 'function'
  );
}

const starLabel = (stars: number) => (stars === 1 ? 'Rate 1 star' : `Rate ${stars} stars`);

async function tapStars(tree: TestRenderer.ReactTestRenderer, stars: number): Promise<void> {
  await act(async () => {
    pressableByLabel(tree, starLabel(stars)).props.onPress();
  });
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

const originalCampaigns = { ...ENGAGEMENT_PROMPTS };
let openURL: jest.SpiedFunction<typeof Linking.openURL>;

beforeEach(() => {
  jest.useFakeTimers();
  requestAsk = null;
  mockStore.clear();
  // Single-page fixture; real configured Facebook hand-off is covered below.
  ENGAGEMENT_PROMPTS.facebookUrl = null;
  mockAppOpens = 1;
  mockOptInShowing = false;
  mockActiveDays = 0;
  mockTotalReads = 0;
  mockTourFlags = {
    isLoading: false,
    shouldShowFirstLaunchTour: false,
    shouldShowOnboardingSetup: false,
    shouldShowWhatsNew: false,
  };
  openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
});

afterEach(() => {
  act(() => { mounted.splice(0).forEach((tree) => tree.unmount()); });
  openURL.mockRestore();
  Object.assign(ENGAGEMENT_PROMPTS, originalCampaigns);
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

  test.each([[2, 0], [1, 2]])('opens automatically with %i launches and %i active days', async (opens, days) => {
    mockAppOpens = opens;
    mockActiveDays = days;
    const tree = await renderHydrated();
    expect(modalVisible(tree)).toBe(false);
    await act(async () => { jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS); });
    expect(modalVisible(tree)).toBe(true);
    expect(savedState().asksByTrigger).toEqual({ 'app-engaged': 1 });
  });

  test('receives wishlist moments from a store above the provider', async () => {
    const tree = await renderHydrated();
    act(() => { reportRatingAsk('bookmark-saved'); });
    await act(async () => { jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS); });
    expect(modalVisible(tree)).toBe(true);
    expect(savedState().asksByTrigger).toEqual({ 'bookmark-saved': 1 });
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

  test('dismissal permits the next completed action in the same session', async () => {
    const tree = await renderAndSettle();
    expect(modalVisible(tree)).toBe(true);
    act(() => {
      pressableByLabel(tree, 'Maybe later').props.onPress();
    });
    expect(modalVisible(tree)).toBe(false);

    await fireMoment();
    expect(modalVisible(tree)).toBe(true);
    expect(savedState().askCount).toBe(2);
  });

  test('two moments in quick succession queue one card, not two', async () => {
    const tree = await renderHydrated();
    act(() => {
      requestAsk?.('routine-complete');
      requestAsk?.('routine-complete');
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS);
    });
    expect(modalVisible(tree)).toBe(true);
    expect(savedState()).toMatchObject({ askCount: 1, asksByTrigger: { 'routine-complete': 1 } });
  });

  test('a completed action earns the ask even on the first visit', async () => {
    mockAppOpens = MIN_APP_OPENS - 1;
    const tree = await renderAndSettle();
    expect(modalVisible(tree)).toBe(true);
    expect(savedState().askCount).toBe(1);
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
      requestAsk?.('routine-complete');
    });
    await act(async () => {
      jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS - 500);
    });

    // A verse advance lands mid-delay and re-renders the provider.
    mockTotalReads = 0 + 5;
    act(() => {
      tree.update(tree_());
    });

    await act(async () => {
      jest.advanceTimersByTime(500);
    });
    expect(modalVisible(tree)).toBe(true);
  });

  test('shows social instead of rating after a legacy store hand-off', async () => {
    mockStore.set(
      RATING_PROMPT_STORAGE_KEY,
      JSON.stringify({ askCount: 1, lastAskedAt: 1, outcome: 'rated', storeHandoffCount: 2 })
    );
    const tree = await renderAndSettle();
    expect(modalVisible(tree)).toBe(true);
    expect(allText(tree)).toContain('Stay connected with Vedansh');
    expect(pressablesByLabel(tree, 'Rate 5 stars')).toHaveLength(0);
  });

  test('stays shut within 30 days of a 1–3★ tap', async () => {
    mockStore.set(
      RATING_PROMPT_STORAGE_KEY,
      JSON.stringify({ askCount: 1, lastAskedAt: 1, outcome: 'pending', lowRatedAt: Date.now() })
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
    expect(() => fn?.('routine-complete')).not.toThrow();
  });
});

describe('stars and buttons', () => {
  test.each([4, 5])('%i★ hands off to the store and stops asking', async (stars) => {
    const tree = await renderAndSettle();
    await tapStars(tree, stars);

    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL.mock.calls[0][0]).toMatch(/apps\.apple\.com|play\.google\.com/);
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().outcome).toBe('rated');
  });

  test.each([1, 2, 3])('%i★ stays on the card, thanks the user and keeps the store link', async (stars) => {
    const tree = await renderAndSettle();
    await tapStars(tree, stars);

    expect(openURL).not.toHaveBeenCalled();
    expect(modalVisible(tree)).toBe(true);
    expect(allText(tree)).toMatch(/Thank you for rating/);
    // Not review gating: the store stays one tap away for every rating.
    expect(pressablesByLabel(tree, 'Rate Vedansh on the store')).toHaveLength(1);
    const saved = savedState();
    expect(saved.outcome).toBe('pending');
    expect(saved.lowRatedAt).not.toBeNull();
  });

  test('the low-star store link hands off and advances to social too', async () => {
    const tree = await renderAndSettle();
    await tapStars(tree, 2);
    await act(async () => {
      pressableByLabel(tree, 'Rate Vedansh on the store').props.onPress();
    });

    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL.mock.calls[0][0]).toMatch(/apps\.apple\.com|play\.google\.com/);
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().outcome).toBe('rated');
  });

  test('without a feedback inbox, the thank-you step has no email button', async () => {
    const inbox = jest.spyOn(ratingPrompt, 'feedbackEmail').mockReturnValue(null);
    try {
      const tree = await renderAndSettle();
      await tapStars(tree, 2);
      expect(pressablesByLabel(tree, 'Write to Vedansh')).toHaveLength(0);
      expect(pressablesByLabel(tree, 'Close')).toHaveLength(1);
    } finally {
      inbox.mockRestore();
    }
  });

  test('ships with "Write to us" on the thank-you step, addressed to the support inbox', async () => {
    const tree = await renderAndSettle();
    await tapStars(tree, 1);
    await act(async () => {
      pressableByLabel(tree, 'Write to Vedansh').props.onPress();
    });
    expect(openURL.mock.calls[0][0]).toMatch(/^mailto:vedansh\.app\.support@gmail\.com\?/);
  });

  test('with a feedback inbox, "Write to us" opens a pre-filled email and closes', async () => {
    const inbox = jest.spyOn(ratingPrompt, 'feedbackEmail').mockReturnValue('help@example.test');
    try {
      const tree = await renderAndSettle();
      await tapStars(tree, 2);
      await act(async () => {
        pressableByLabel(tree, 'Write to Vedansh').props.onPress();
      });

      expect(openURL).toHaveBeenCalledTimes(1);
      const url = openURL.mock.calls[0][0];
      expect(url).toMatch(/^mailto:help@example\.test\?/);
      expect(decodeURIComponent(url)).toContain('Rating: 2/5');
      expect(modalVisible(tree)).toBe(false);
      // Writing to us is not a store rating — the 30-day pause still applies.
      expect(savedState().outcome).toBe('pending');
    } finally {
      inbox.mockRestore();
    }
  });

  test('the next opening starts on the asking step again', async () => {
    let openSheet: (() => void) | null = null;
    function OpenProbe() {
      openSheet = useRatingPrompt().open;
      return null;
    }
    let tree!: TestRenderer.ReactTestRenderer;
    act(() => {
      tree = TestRenderer.create(
        <ThemeProvider>
          <GitaLanguageProvider initialLang="en">
            <RatingPromptProvider>
              <OpenProbe />
              <RatingPromptSheet />
            </RatingPromptProvider>
          </GitaLanguageProvider>
        </ThemeProvider>
      );
    });
    await act(async () => {
      await Promise.resolve();
    });
    act(() => openSheet?.());
    await tapStars(tree, 2);
    await act(async () => {
      pressableByLabel(tree, 'Close').props.onPress();
    });
    act(() => openSheet?.());
    expect(allText(tree)).toMatch(/Enjoying Vedansh\?/);
    expect(allText(tree)).not.toMatch(/Thank you for rating/);
  });

  test('Close on the thank-you step closes without leaving the app', async () => {
    const tree = await renderAndSettle();
    await tapStars(tree, 3);
    await act(async () => {
      pressableByLabel(tree, 'Close').props.onPress();
    });
    expect(openURL).not.toHaveBeenCalled();
    expect(modalVisible(tree)).toBe(false);
  });

  test('"Maybe later" closes without leaving the app or ending the ask', async () => {
    const tree = await renderAndSettle();
    await act(async () => {
      pressableByLabel(tree, 'Maybe later').props.onPress();
    });

    expect(openURL).not.toHaveBeenCalled();
    expect(modalVisible(tree)).toBe(false);
    // Still 'pending' — the cooldown, not the outcome, is what silences it.
    expect(savedState()).toMatchObject({ askCount: 1, outcome: 'pending', lowRatedAt: null });
  });

  test('asks with five stars and "Maybe later" — no permanent opt-out', async () => {
    const tree = await renderAndSettle();

    // Product decision (Aug 2026): "only now and later". Rating is the only
    // outcome reachable from this card that ends the cadence.
    for (const stars of [1, 2, 3, 4, 5]) {
      expect(pressablesByLabel(tree, starLabel(stars))).toHaveLength(1);
    }
    expect(pressablesByLabel(tree, 'Maybe later')).toHaveLength(1);

    const actions = tree.root.findAll(
      (n) => typeof n.props?.onPress === 'function' && typeof n.props?.accessibilityLabel === 'string'
    );
    expect(actions).toHaveLength(6);

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
    await tapStars(tree, 5);
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
    ['en', /Enjoying Vedansh\?/, /Maybe later/, /Thank you for rating/, /Rate on the store/],
    ['hi', /आपको कैसा लगा\?/, /बाद में/, /रेटिंग के लिए धन्यवाद/, /स्टोर पर रेटिंग दें/],
    ['gu', /કેવું લાગ્યું\?/, /પછી/, /રેટિંગ બદલ આભાર/, /સ્ટોર પર રેટિંગ આપો/],
    ['kn', /ಹೇಗಿದೆ\?/, /ನಂತರ/, /ರೇಟಿಂಗ್‌ಗೆ ಧನ್ಯವಾದಗಳು/, /ಸ್ಟೋರ್‌ನಲ್ಲಿ ರೇಟಿಂಗ್ ನೀಡಿ/],
  ] as const)('renders %s copy on both steps, not a hardcoded English string', async (lang, title, later, thanks, store) => {
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
    expect(allText(tree)).toMatch(title);
    expect(allText(tree)).toMatch(later);

    await tapStars(tree, 2);
    expect(allText(tree)).toMatch(thanks);
    expect(allText(tree)).toMatch(store);
  });

  test('the echoed stars on the thank-you step are hidden from assistive tech', async () => {
    const tree = await renderAndSettle();
    await tapStars(tree, 3);
    const echo = tree.root.findAll(
      (n) => typeof n.props?.children === 'string' && n.props.children === '★★★☆☆'
    );
    expect(echo.length).toBeGreaterThan(0);
    expect(echo[0].props.accessibilityElementsHidden).toBe(true);
    expect(echo[0].props.importantForAccessibility).toBe('no');
  });
});


describe('post-review social prompt', () => {
  function reviewed() {
    mockStore.set(RATING_PROMPT_STORAGE_KEY, JSON.stringify(ratingPrompt.afterRated(ratingPrompt.RATING_PROMPT_DEFAULTS, Date.now())));
  }
  test.each(['bookmark-saved', 'content-shared', 'routine-complete', 'verse-shared', 'prose-shared', 'mala-complete'] as const)(
    '%s uses the same action bridge for social following', async (trigger) => {
      reviewed();
      const tree = await renderAndSettle(trigger);
      expect(modalVisible(tree)).toBe(true);
      expect(allText(tree)).toContain('Stay connected with Vedansh');
      expect(pressablesByLabel(tree, 'Rate 5 stars')).toHaveLength(0);
      expect(savedState().social.askCount).toBe(1);
    });
  test('store return and cold launch alone do not open the first follow prompt', async () => {
    reviewed(); mockAppOpens = 10; mockActiveDays = 10;
    const tree = await renderHydrated();
    await fireMoment('app-engaged');
    expect(modalVisible(tree)).toBe(false);
    await fireMoment();
    expect(modalVisible(tree)).toBe(true);
  });
  test('the configured Facebook button opens the exact owner link and keeps follow confirmation independent', async () => {
    ENGAGEMENT_PROMPTS.facebookUrl = originalCampaigns.facebookUrl;
    reviewed();
    const tree = await renderAndSettle();
    expect(pressablesByLabel(tree, 'Follow Vedansh on Instagram')).toHaveLength(1);
    expect(pressablesByLabel(tree, 'Follow Vedansh on Facebook')).toHaveLength(1);
    await act(async () => { pressableByLabel(tree, 'Follow Vedansh on Facebook').props.onPress(); });
    expect(openURL).toHaveBeenLastCalledWith('https://www.facebook.com/share/18wwA4vHG4/?mibextid=wwXIfr');
    expect(savedState().social.confirmed.facebook).not.toBe(true);
    expect(modalVisible(tree)).toBe(true);
    await act(async () => { pressableByLabel(tree, 'I already follow Vedansh on Instagram').props.onPress(); });
    expect(pressablesByLabel(tree, 'Follow Vedansh on Instagram')).toHaveLength(0);
    expect(pressablesByLabel(tree, 'Follow Vedansh on Facebook')).toHaveLength(1);
    await act(async () => { pressableByLabel(tree, 'I already follow Vedansh on Facebook').props.onPress(); });
    expect(savedState().social.confirmed).toEqual({ instagram: true, facebook: true });
    expect(modalVisible(tree)).toBe(false);
  });
  test('opening each page never silently confirms a follow; both confirmations persist', async () => {
    ENGAGEMENT_PROMPTS.facebookUrl = 'https://www.facebook.com/test-vedansh-page';
    reviewed(); const tree = await renderAndSettle();
    await act(async () => { pressableByLabel(tree, 'Follow Vedansh on Instagram').props.onPress(); });
    expect(openURL).toHaveBeenLastCalledWith(ENGAGEMENT_PROMPTS.instagramUrl);
    expect(savedState().social.confirmed.instagram).not.toBe(true);
    expect(modalVisible(tree)).toBe(true);
    await act(async () => { pressableByLabel(tree, 'I already follow Vedansh on Instagram').props.onPress(); });
    expect(pressablesByLabel(tree, 'Follow Vedansh on Instagram')).toHaveLength(0);
    expect(pressablesByLabel(tree, 'Follow Vedansh on Facebook')).toHaveLength(1);
    await act(async () => { pressableByLabel(tree, 'Follow Vedansh on Facebook').props.onPress(); });
    expect(openURL).toHaveBeenLastCalledWith(ENGAGEMENT_PROMPTS.facebookUrl);
    await act(async () => { pressableByLabel(tree, 'I already follow Vedansh on Facebook').props.onPress(); });
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().social.confirmed).toEqual({ instagram: true, facebook: true });
    act(() => tree.unmount()); mounted.splice(mounted.indexOf(tree), 1);
    const reloaded = await renderAndSettle();
    expect(modalVisible(reloaded)).toBe(false);
  });
  test('failed social handoff stays unconfirmed, shows retry copy, and can retry', async () => {
    reviewed(); const tree = await renderAndSettle();
    openURL.mockRejectedValueOnce(new Error('offline'));
    await act(async () => { pressableByLabel(tree, 'Follow Vedansh on Instagram').props.onPress(); });
    expect(allText(tree)).toContain('Could not open the page');
    expect(savedState().social.confirmed.instagram).not.toBe(true);
    await act(async () => { pressableByLabel(tree, 'Follow Vedansh on Instagram').props.onPress(); });
    expect(allText(tree)).not.toContain('Could not open the page');
  });
  test('a social reset re-arms once on reload and leaves existing review data intact', async () => {
    reviewed(); const tree = await renderAndSettle();
    await act(async () => { pressableByLabel(tree, 'I already follow Vedansh on Instagram').props.onPress(); });
    act(() => tree.unmount()); mounted.splice(mounted.indexOf(tree), 1);
    ENGAGEMENT_PROMPTS.socialCampaignId = 'next-campaign';
    const reloaded = await renderHydrated();
    await fireMoment('app-engaged'); expect(modalVisible(reloaded)).toBe(false);
    await fireMoment(); expect(modalVisible(reloaded)).toBe(true);
    expect(savedState().social.campaignId).toBe('next-campaign');
    expect(savedState().storeHandoffCount).toBe(1);
    await act(async () => { pressableByLabel(reloaded, 'I already follow Vedansh on Instagram').props.onPress(); });
    await fireMoment(); expect(modalVisible(reloaded)).toBe(false);
  });
  test('dismissal does not reopen immediately; the next action can ask again', async () => {
    reviewed(); const tree = await renderAndSettle();
    await act(async () => { pressableByLabel(tree, 'Maybe later').props.onPress(); });
    await fireMoment('app-engaged'); expect(modalVisible(tree)).toBe(false);
    await fireMoment(); expect(modalVisible(tree)).toBe(true);
    expect(savedState().social.askCount).toBe(2);
  });
  test('social cannot stack on another surface that opens during the settle delay', async () => {
    reviewed(); const tree = await renderHydrated();
    act(() => requestAsk?.('verse-shared'));
    mockOptInShowing = true;
    act(() => tree.update(tree_()));
    await act(async () => { jest.advanceTimersByTime(RATING_PROMPT_DELAY_MS); });
    expect(modalVisible(tree)).toBe(false);
    expect(savedState().social.askCount).toBe(0);
  });
  test('social does not open in the background', async () => {
    reviewed(); const tree = await renderHydrated();
    const previous = AppState.currentState;
    AppState.currentState = 'background';
    try { await fireMoment(); expect(modalVisible(tree)).toBe(false); }
    finally { AppState.currentState = previous; }
  });
  test('unread stored preferences never get replaced with new prompt defaults', async () => {
    reviewed(); const before = mockStore.get(RATING_PROMPT_STORAGE_KEY);
    const implementation = jest.mocked(AsyncStorage.getItem).getMockImplementation()!;
    jest.mocked(AsyncStorage.getItem).mockImplementation((key) => key === RATING_PROMPT_STORAGE_KEY
      ? Promise.reject(new Error('storage unavailable')) : implementation(key));
    try {
      const tree = await renderAndSettle();
      expect(modalVisible(tree)).toBe(false);
      expect(mockStore.get(RATING_PROMPT_STORAGE_KEY)).toBe(before);
    } finally { jest.mocked(AsyncStorage.getItem).mockImplementation(implementation); }
  });
  test('both failed store URLs keep review eligible and do not unlock social', async () => {
    openURL.mockRejectedValue(new Error('No handler'));
    const tree = await renderAndSettle(); await tapStars(tree, 5);
    expect(savedState().storeHandoffCount).toBe(0);
    expect(savedState().outcome).toBe('pending');
    await fireMoment();
    expect(allText(tree)).toContain('Enjoying Vedansh?');
    expect(allText(tree)).not.toContain('Stay connected with Vedansh');
  });
  test('each follow link reads as the filled primary action; "Already following" stays a plain text link', async () => {
    ENGAGEMENT_PROMPTS.facebookUrl = 'https://www.facebook.com/test-vedansh-page';
    reviewed();
    const tree = await renderAndSettle();
    for (const name of ['Instagram', 'Facebook']) {
      const follow = StyleSheet.flatten(pressableByLabel(tree, `Follow Vedansh on ${name}`).props.style({ pressed: false }));
      expect(follow.backgroundColor).toBe(lightColors.saffron);
      expect(follow.minHeight).toBeGreaterThanOrEqual(48);
      const already = StyleSheet.flatten(pressableByLabel(tree, `I already follow Vedansh on ${name}`).props.style);
      expect(already.backgroundColor).toBeUndefined();
    }
  });
  test.each(['hi', 'en', 'gu', 'kn'] as const)('social controls and scrolling remain available in %s at both reading sizes', async (lang) => {
    ENGAGEMENT_PROMPTS.facebookUrl = 'https://www.facebook.com/test-vedansh-page';
    for (const size of ['M', 'L']) {
      reviewed(); mockStore.set('@vedansh/font-scale', size);
      let tree!: TestRenderer.ReactTestRenderer;
      await act(async () => { tree = TestRenderer.create(<FontScaleProvider><ThemeProvider>
        <GitaLanguageProvider initialLang={lang}><RatingPromptProvider><MomentProbe /><RatingPromptSheet /></RatingPromptProvider></GitaLanguageProvider>
      </ThemeProvider></FontScaleProvider>); });
      mounted.push(tree); await fireMoment();
      expect(modalVisible(tree)).toBe(true);
      expect(pressablesByLabel(tree, 'Follow Vedansh on Instagram')).toHaveLength(1);
      expect(pressablesByLabel(tree, 'Follow Vedansh on Facebook')).toHaveLength(1);
      expect(pressablesByLabel(tree, 'Maybe later')).toHaveLength(1);
      expect(tree.root.findByType(ScrollView)).toBeTruthy();
      expect(tree.root.findAllByType(Text).every((node) => node.props.numberOfLines === undefined)).toBe(true);
      act(() => tree.unmount()); mounted.splice(mounted.indexOf(tree), 1);
    }
  });
});
