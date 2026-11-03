/**
 * Rating-prompt gate (design.md §54). Jest, not tsx: `data/ratingPrompt.ts`
 * imports `@/data/shareLinks` for the store URLs, and only Jest's
 * moduleNameMapper resolves the `@/` alias at runtime.
 */

import {
  FEEDBACK_EMAIL,
  LOW_RATING_COOLDOWN_DAYS,
  MAX_ASKS,
  MIN_ACTIVE_DAYS,
  MIN_APP_OPENS,
  RATING_PROMPT_DEFAULTS,
  REASK_COOLDOWN_DAYS,
  STORE_MIN_STARS,
  afterAsked,
  afterDismissed,
  afterDeclined,
  afterLowRating,
  afterRated,
  afterStoreFollowupAction,
  timeBasedRatingAskAt,
  feedbackEmail,
  feedbackMailto,
  isEligibleForRatingPrompt,
  parseRatingPromptState,
  storeListingUrl,
  storeReviewUrl,
  type RatingEligibilityInput,
  type RatingPromptState,
} from '@/data/ratingPrompt';

const NOW = Date.UTC(2026, 7, 3, 9, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

/** An input that passes every clause — each test spoils exactly one thing. */
function eligibleInput(overrides: Partial<RatingEligibilityInput> = {}): RatingEligibilityInput {
  return {
    state: RATING_PROMPT_DEFAULTS,
    appOpens: MIN_APP_OPENS,
    activeDays: MIN_ACTIVE_DAYS,
    now: NOW,
    blockedBySurface: false,
    ...overrides,
  };
}

describe('thresholds', () => {
  /**
   * Pinned deliberately. RULEBOOK §6.2 makes these the user protection (the OS
   * does not throttle a `Linking` hand-off), so a silent loosening should fail
   * a test rather than slip through — updating this expectation is the explicit
   * product decision the rule asks for.
   */
  it('are the values design.md §54 documents', () => {
    expect(MIN_APP_OPENS).toBe(2);
    expect(MIN_ACTIVE_DAYS).toBe(2);
    expect(REASK_COOLDOWN_DAYS).toBe(2);
    // null = no lifetime ceiling: keep asking until the user rates or opts out.
    expect(MAX_ASKS).toBeNull();
  });
});

describe('isEligibleForRatingPrompt', () => {
  it('allows the ask once every threshold is met', () => {
    expect(isEligibleForRatingPrompt(eligibleInput())).toBe(true);
  });

  it('never asks a user who already rated or opted out', () => {
    for (const outcome of ['rated', 'declined'] as const) {
      const state: RatingPromptState = { ...RATING_PROMPT_DEFAULTS, outcome };
      expect(isEligibleForRatingPrompt(eligibleInput({ state }))).toBe(false);
    }
  });

  it('keeps asking indefinitely while MAX_ASKS is null', () => {
    // The 50th ask is as eligible as the first — only rating stops it from the sheet.
    const state: RatingPromptState = { ...RATING_PROMPT_DEFAULTS, askCount: 50 };
    expect(isEligibleForRatingPrompt(eligibleInput({ state }))).toBe(true);
  });

  it('stands down while another surface owns the screen', () => {
    expect(isEligibleForRatingPrompt(eligibleInput({ blockedBySurface: true }))).toBe(false);
  });

  it('accepts either two launches or two active days independently', () => {
    expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 2, activeDays: 0 }))).toBe(true);
    expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 0, activeDays: 2 }))).toBe(true);
    expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 1, activeDays: 1 }))).toBe(false);
  });

  it.each(['verse-shared', 'prose-shared', 'content-shared', 'bookmark-saved', 'routine-complete', 'mala-complete'] as const)(
    '%s independently earns the ask on a first visit without reading', (trigger) => {
      expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 1, activeDays: 0, trigger }))).toBe(true);
      expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 1, activeDays: 0, trigger,
        state: afterRated(afterRated(RATING_PROMPT_DEFAULTS, NOW), NOW) }))).toBe(false);
      expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 1, activeDays: 0, trigger,
        state: afterDismissed(afterAsked(RATING_PROMPT_DEFAULTS, NOW, trigger), NOW) }))).toBe(true);
      expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 1, activeDays: 0, trigger,
        state: afterLowRating(RATING_PROMPT_DEFAULTS, NOW) }))).toBe(false);
      expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: 1, activeDays: 0, trigger,
        blockedBySurface: true }))).toBe(false);
  });

  it('honours the cooldown, then re-asks once it lapses', () => {
    const asked: RatingPromptState = { ...RATING_PROMPT_DEFAULTS, askCount: 1, lastAskedAt: NOW };

    // Same day, and one day short of the window: still quiet.
    expect(isEligibleForRatingPrompt(eligibleInput({ state: asked }))).toBe(false);
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state: asked, now: NOW + (REASK_COOLDOWN_DAYS - 1) * DAY_MS })
      )
    ).toBe(false);

    // Exactly at the window: askable again.
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state: asked, now: NOW + REASK_COOLDOWN_DAYS * DAY_MS })
      )
    ).toBe(true);
  });

  it('stays away for 90 days after a 1–3★ tap, then may ask again', () => {
    const low = afterLowRating(RATING_PROMPT_DEFAULTS, NOW);
    expect(low.outcome).toBe('pending');
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state: low, now: NOW + (LOW_RATING_COOLDOWN_DAYS - 1) * DAY_MS })
      )
    ).toBe(false);
    expect(
      isEligibleForRatingPrompt(eligibleInput({ state: low, now: NOW + LOW_RATING_COOLDOWN_DAYS * DAY_MS }))
    ).toBe(true);
  });
});

describe('state transitions', () => {
  it('afterAsked spends a slot, starts the cooldown, and credits the moment', () => {
    const once = afterAsked(RATING_PROMPT_DEFAULTS, NOW, 'routine-complete');
    expect(once).toEqual({
      ...RATING_PROMPT_DEFAULTS,
      askCount: 1,
      lastAskedAt: NOW,
      outcome: 'pending',
      asksByTrigger: { 'routine-complete': 1 },
      lowRatedAt: null,
    });
    expect(afterAsked(once, NOW, 'routine-complete').asksByTrigger).toEqual({
      'routine-complete': 2,
    });
  });

  it('credits each moment independently (share and mala count on their own)', () => {
    let state = afterAsked(RATING_PROMPT_DEFAULTS, NOW, 'verse-shared');
    state = afterAsked(state, NOW, 'mala-complete');
    state = afterAsked(state, NOW, 'verse-shared');
    expect(state.askCount).toBe(3);
    expect(state.asksByTrigger).toEqual({ 'verse-shared': 2, 'mala-complete': 1 });
  });

  it('afterRated and afterDeclined are both terminal', () => {
    expect(afterRated(afterRated(RATING_PROMPT_DEFAULTS, NOW), NOW).outcome).toBe('rated');
    expect(afterDeclined(RATING_PROMPT_DEFAULTS, NOW).outcome).toBe('declined');
    expect(isEligibleForRatingPrompt(eligibleInput({ state: afterRated(afterRated(RATING_PROMPT_DEFAULTS, NOW), NOW) }))).toBe(
      false
    );
    expect(
      isEligibleForRatingPrompt(eligibleInput({ state: afterDeclined(RATING_PROMPT_DEFAULTS, NOW) }))
    ).toBe(false);
  });

  it('runs indefinitely — rating is the only exit the sheet offers', () => {
    let state = RATING_PROMPT_DEFAULTS;
    // Ten "Maybe later" dismissals, one every cooldown window. The sheet ships
    // with two actions only, so this is the whole vocabulary a user has short of
    // rating: the cadence never runs out on its own.
    for (let i = 0; i < 10; i += 1) {
      state = afterAsked(state, NOW + i * REASK_COOLDOWN_DAYS * DAY_MS, 'routine-complete');
    }
    expect(state.askCount).toBe(10);
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state, now: NOW + 100 * REASK_COOLDOWN_DAYS * DAY_MS })
      )
    ).toBe(true);

    // Rating ends it.
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state: afterRated(state, NOW), now: NOW + 1000 * DAY_MS })
      )
    ).toBe(false);
  });

  it('still honours a declined state, though nothing in the UI writes one', () => {
    // afterDeclined is unreachable from the sheet now, but the gate must respect
    // a state written by an earlier build (or a future Settings-side opt-out).
    const state = afterDeclined(RATING_PROMPT_DEFAULTS, NOW);
    expect(
      isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 1000 * DAY_MS }))
    ).toBe(false);
  });
});

describe('parseRatingPromptState', () => {
  it('defaults on empty, malformed, and non-object payloads', () => {
    expect(parseRatingPromptState(null)).toEqual(RATING_PROMPT_DEFAULTS);
    expect(parseRatingPromptState('')).toEqual(RATING_PROMPT_DEFAULTS);
    expect(parseRatingPromptState('{ not json')).toEqual(RATING_PROMPT_DEFAULTS);
    expect(parseRatingPromptState('null')).toEqual(RATING_PROMPT_DEFAULTS);
    expect(parseRatingPromptState('42')).toEqual(RATING_PROMPT_DEFAULTS);
  });

  it('round-trips a valid state', () => {
    const state: RatingPromptState = {
      ...RATING_PROMPT_DEFAULTS,
      askCount: 1,
      lastAskedAt: NOW,
      outcome: 'pending',
      asksByTrigger: { 'routine-complete': 1 },
      lowRatedAt: NOW,
      response: 'low',
      respondedAt: NOW,
    };
    expect(parseRatingPromptState(JSON.stringify(state))).toEqual(state);
  });

  it('reads a blob from before per-moment counts existed', () => {
    // The cold-start build persisted only three fields; they must still parse.
    const parsed = parseRatingPromptState(
      JSON.stringify({ askCount: 2, lastAskedAt: NOW, outcome: 'pending' })
    );
    expect(parsed).toEqual({ ...RATING_PROMPT_DEFAULTS, askCount: 2, lastAskedAt: NOW, outcome: 'pending', asksByTrigger: {}, lowRatedAt: null });
  });

  it('keeps only known moments with sane counts', () => {
    const parsed = parseRatingPromptState(
      JSON.stringify({
        askCount: 1,
        lastAskedAt: NOW,
        outcome: 'pending',
        asksByTrigger: { 'routine-complete': 2.7, 'cold-start': 4, share: 3, 'japa-round': -1 },
      })
    );
    // Unknown moments (incl. ones from a build that no longer ships them) are dropped.
    expect(parsed.asksByTrigger).toEqual({ 'routine-complete': 2 });
  });

  it('keeps every shipping moment, including the share and mala moments', () => {
    const parsed = parseRatingPromptState(
      JSON.stringify({
        askCount: 3,
        lastAskedAt: NOW,
        outcome: 'pending',
        asksByTrigger: { 'routine-complete': 1, 'verse-shared': 1, 'prose-shared': 1, 'mala-complete': 1, 'app-engaged': 1, 'bookmark-saved': 1, 'content-shared': 1 },
      })
    );
    expect(parsed.asksByTrigger).toEqual({
      'routine-complete': 1,
      'verse-shared': 1,
      'prose-shared': 1,
      'mala-complete': 1,
      'app-engaged': 1,
      'bookmark-saved': 1,
      'content-shared': 1,
    });
  });

  it('drops junk fields rather than trusting them', () => {
    const parsed = parseRatingPromptState(
      JSON.stringify({ askCount: -3, lastAskedAt: 'yesterday', outcome: 'maybe' })
    );
    expect(parsed).toEqual(RATING_PROMPT_DEFAULTS);
  });

  it('floors a fractional askCount and rejects a non-positive timestamp', () => {
    const parsed = parseRatingPromptState(JSON.stringify({ askCount: 1.8, lastAskedAt: 0, outcome: 'rated' }));
    expect(parsed).toMatchObject({ askCount: 1, lastAskedAt: null, outcome: 'pending', response: 'store', storeHandoffCount: 1 });
  });

  it('rejects a junk lowRatedAt', () => {
    expect(parseRatingPromptState(JSON.stringify({ lowRatedAt: 'last week' })).lowRatedAt).toBeNull();
    expect(parseRatingPromptState(JSON.stringify({ lowRatedAt: -5 })).lowRatedAt).toBeNull();
  });
});

describe('in-app stars', () => {
  it('sends 4★ and 5★ to the store, and keeps 1–3★ on the card', () => {
    expect(STORE_MIN_STARS).toBe(4);
    expect(LOW_RATING_COOLDOWN_DAYS).toBe(30);
  });

  it('ships with the Vedansh support inbox', () => {
    expect(feedbackEmail()).toBe(FEEDBACK_EMAIL);
    expect(FEEDBACK_EMAIL).toBe('vedansh.app.support@gmail.com');
  });

  it('pre-fills the feedback email with the stars, version and platform', () => {
    const url = feedbackMailto('help@example.test', 2, 'android', '1.5.2');
    expect(url.startsWith('mailto:help@example.test?subject=')).toBe(true);
    const params = new URLSearchParams(url.slice(url.indexOf('?') + 1));
    expect(params.get('subject')).toBe('Vedansh feedback (2/5)');
    expect(params.get('body')).toContain('Rating: 2/5');
    expect(params.get('body')).toContain('App: 1.5.2 (android)');
  });
});

describe('store URLs', () => {
  it('sends iOS to the write-review composer and Android to the listing', () => {
    expect(storeReviewUrl('ios')).toBe(`${storeListingUrl('ios')}?action=write-review`);
    expect(storeReviewUrl('ios')).toContain('apps.apple.com');
    expect(storeReviewUrl('android')).toBe(storeListingUrl('android'));
    expect(storeReviewUrl('android')).toContain('play.google.com');
  });

  it('falls back to the Play listing for any non-iOS platform', () => {
    expect(storeReviewUrl('web')).toBe(storeListingUrl('android'));
  });
});


describe('response-specific repeat policy', () => {
  const asked = afterAsked(RATING_PROMPT_DEFAULTS, NOW, 'verse-shared');
  it('dismissal: next action can repeat immediately, usage waits exactly two days', () => {
    const state = afterDismissed(asked, NOW);
    expect(isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 1, trigger: 'bookmark-saved' }))).toBe(true);
    expect(isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 2 * DAY_MS - 1 }))).toBe(false);
    expect(isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 2 * DAY_MS }))).toBe(true);
  });
  it('1–3 stars: every action waits a full 30 days', () => {
    const state = afterLowRating(asked, NOW);
    expect(isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 30 * DAY_MS - 1, trigger: 'verse-shared' }))).toBe(false);
    expect(isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 30 * DAY_MS, trigger: 'verse-shared' }))).toBe(true);
  });
  it('first positive hand-off: two days AND an action; second hand-off stops', () => {
    const first = afterRated(asked, NOW, 4);
    expect(first.outcome).toBe('pending');
    expect(isEligibleForRatingPrompt(eligibleInput({ state: first, now: NOW + 1, trigger: 'verse-shared' }))).toBe(false);
    expect(isEligibleForRatingPrompt(eligibleInput({ state: first, now: NOW + 2 * DAY_MS }))).toBe(false);
    expect(isEligibleForRatingPrompt(eligibleInput({ state: first, now: NOW + 2 * DAY_MS, trigger: 'verse-shared' }))).toBe(true);
    const second = afterRated(afterAsked(first, NOW + 2 * DAY_MS, 'verse-shared'), NOW + 2 * DAY_MS, 5);
    expect(second.storeHandoffCount).toBe(2);
    expect(second.outcome).toBe('rated');
    expect(isEligibleForRatingPrompt(eligibleInput({ state: second, now: NOW + 100 * DAY_MS, trigger: 'verse-shared' }))).toBe(false);
  });
  it('migrates legacy store hand-offs into one required follow-up without resurrecting opt-outs', () => {
    const state = parseRatingPromptState(JSON.stringify({ outcome: 'rated', lastAskedAt: NOW }));
    expect(state).toMatchObject({ outcome: 'pending', response: 'store', storeHandoffCount: 1 });
    expect(isEligibleForRatingPrompt(eligibleInput({ state, now: NOW + 2 * DAY_MS, trigger: 'verse-shared' }))).toBe(true);
    expect(parseRatingPromptState(JSON.stringify({ outcome: 'declined' })).outcome).toBe('declined');
  });
  it('the low-star store link retains the month-long pause and does not count as a positive hand-off', () => {
    const state = afterRated(afterLowRating(asked, NOW), NOW, 2);
    expect(state).toMatchObject({ response: 'low', storeHandoffCount: 0 });
  });
});


it('positive follow-up uses the later of day two and the first subsequent action', () => {
  const first = afterRated(RATING_PROMPT_DEFAULTS, NOW, 5);
  const early = afterStoreFollowupAction(first, NOW + DAY_MS);
  expect(timeBasedRatingAskAt(first)).toBeNull();
  expect(timeBasedRatingAskAt(early)).toBe(NOW + 2 * DAY_MS);
  expect(isEligibleForRatingPrompt(eligibleInput({ state: early, now: NOW + 2 * DAY_MS - 1 }))).toBe(false);
  expect(isEligibleForRatingPrompt(eligibleInput({ state: early, now: NOW + 2 * DAY_MS }))).toBe(true);
  const late = afterStoreFollowupAction(first, NOW + 4 * DAY_MS);
  expect(timeBasedRatingAskAt(late)).toBe(NOW + 4 * DAY_MS);
  expect(parseRatingPromptState(JSON.stringify(early)).followupActionAt).toBe(NOW + DAY_MS);
});
