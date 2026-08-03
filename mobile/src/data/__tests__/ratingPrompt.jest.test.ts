/**
 * Rating-prompt gate (design.md §54). Jest, not tsx: `data/ratingPrompt.ts`
 * imports `@/data/shareLinks` for the store URLs, and only Jest's
 * moduleNameMapper resolves the `@/` alias at runtime.
 */

import {
  MAX_ASKS,
  MIN_ACTIVE_DAYS,
  MIN_APP_OPENS,
  MIN_VERSE_READS,
  RATING_PROMPT_DEFAULTS,
  REASK_COOLDOWN_DAYS,
  afterAsked,
  afterDeclined,
  afterRated,
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
    totalReads: MIN_VERSE_READS,
    now: NOW,
    blockedBySurface: false,
    ...overrides,
  };
}

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

  it('stops after MAX_ASKS auto-opens', () => {
    const state: RatingPromptState = { askCount: MAX_ASKS, lastAskedAt: null, outcome: 'pending' };
    expect(isEligibleForRatingPrompt(eligibleInput({ state }))).toBe(false);
  });

  it('stands down while another surface owns the screen', () => {
    expect(isEligibleForRatingPrompt(eligibleInput({ blockedBySurface: true }))).toBe(false);
  });

  it('requires app opens, active days, and real reading', () => {
    expect(isEligibleForRatingPrompt(eligibleInput({ appOpens: MIN_APP_OPENS - 1 }))).toBe(false);
    expect(isEligibleForRatingPrompt(eligibleInput({ activeDays: MIN_ACTIVE_DAYS - 1 }))).toBe(false);
    expect(isEligibleForRatingPrompt(eligibleInput({ totalReads: MIN_VERSE_READS - 1 }))).toBe(false);
  });

  it('honours the cooldown, then re-asks once it lapses', () => {
    const asked: RatingPromptState = { askCount: 1, lastAskedAt: NOW, outcome: 'pending' };

    // Same day, and one day short of the window: still quiet.
    expect(isEligibleForRatingPrompt(eligibleInput({ state: asked }))).toBe(false);
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state: asked, now: NOW + (REASK_COOLDOWN_DAYS - 1) * DAY_MS })
      )
    ).toBe(false);

    // Exactly at the window: askable again (askCount 1 < MAX_ASKS 2).
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state: asked, now: NOW + REASK_COOLDOWN_DAYS * DAY_MS })
      )
    ).toBe(true);
  });
});

describe('state transitions', () => {
  it('afterAsked spends a slot and starts the cooldown', () => {
    expect(afterAsked(RATING_PROMPT_DEFAULTS, NOW)).toEqual({
      askCount: 1,
      lastAskedAt: NOW,
      outcome: 'pending',
    });
  });

  it('afterRated and afterDeclined are both terminal', () => {
    expect(afterRated(RATING_PROMPT_DEFAULTS, NOW).outcome).toBe('rated');
    expect(afterDeclined(RATING_PROMPT_DEFAULTS, NOW).outcome).toBe('declined');
    expect(isEligibleForRatingPrompt(eligibleInput({ state: afterRated(RATING_PROMPT_DEFAULTS, NOW) }))).toBe(
      false
    );
    expect(
      isEligibleForRatingPrompt(eligibleInput({ state: afterDeclined(RATING_PROMPT_DEFAULTS, NOW) }))
    ).toBe(false);
  });

  it('a full ask cycle ends silent', () => {
    let state = RATING_PROMPT_DEFAULTS;
    state = afterAsked(state, NOW); // first ask, dismissed with "Maybe later"
    state = afterAsked(state, NOW + REASK_COOLDOWN_DAYS * DAY_MS); // second ask
    expect(state.askCount).toBe(MAX_ASKS);
    expect(
      isEligibleForRatingPrompt(
        eligibleInput({ state, now: NOW + 10 * REASK_COOLDOWN_DAYS * DAY_MS })
      )
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
    const state: RatingPromptState = { askCount: 1, lastAskedAt: NOW, outcome: 'pending' };
    expect(parseRatingPromptState(JSON.stringify(state))).toEqual(state);
  });

  it('drops junk fields rather than trusting them', () => {
    const parsed = parseRatingPromptState(
      JSON.stringify({ askCount: -3, lastAskedAt: 'yesterday', outcome: 'maybe' })
    );
    expect(parsed).toEqual(RATING_PROMPT_DEFAULTS);
  });

  it('floors a fractional askCount and rejects a non-positive timestamp', () => {
    const parsed = parseRatingPromptState(JSON.stringify({ askCount: 1.8, lastAskedAt: 0, outcome: 'rated' }));
    expect(parsed).toEqual({ askCount: 1, lastAskedAt: null, outcome: 'rated' });
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
