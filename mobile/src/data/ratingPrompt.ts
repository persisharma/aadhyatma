/**
 * App-rating prompt — persisted state, eligibility gate, and store review URLs.
 *
 * Bundle-only (roadmap "Operating constraint"): this ships with NO native
 * module. `expo-store-review` / SKStoreReviewController / Play In-App Review
 * would each need a store rebuild, so a rating nudge could never go out over
 * OTA. Instead we show our own themed sheet (`components/RatingPromptSheet`)
 * and hand off to the platform store listing via `Linking.openURL` — pure JS,
 * shippable in a bundle.
 *
 * Trade-off worth knowing: the OS in-app review sheet keeps the user inside the
 * app and is rate-limited by the OS; a `Linking` hand-off leaves the app but
 * works everywhere and needs no rebuild. Because WE own the throttling, the
 * gate below is deliberately conservative — see `isEligibleForRatingPrompt`.
 *
 * All logic here is pure so it can be unit-tested without RN
 * (`__tests__/ratingPrompt.jest.test.ts`); the React wiring lives in
 * `contexts/RatingPromptContext`.
 */

import { APP_STORE_URL, PLAY_STORE_URL } from '@/data/shareLinks';

export const RATING_PROMPT_STORAGE_KEY = '@vedansh/rating-prompt';

/**
 * `pending`  — never answered; still askable (subject to the gate).
 * `rated`    — the user tapped through to the store. Never ask again.
 * `declined` — the user tapped "Don't ask again". Never ask again.
 *
 * Note "rated" records that we *handed off* to the store, not that a review was
 * actually written — the app cannot observe that, and asking again after a
 * hand-off would be the nagging we're trying to avoid.
 */
export type RatingPromptOutcome = 'pending' | 'rated' | 'declined';

export type RatingPromptState = {
  /** How many times the sheet has auto-opened (manual opens from More don't count). */
  askCount: number;
  /** Epoch ms of the last auto-open, or null if never shown. */
  lastAskedAt: number | null;
  outcome: RatingPromptOutcome;
};

export const RATING_PROMPT_DEFAULTS: RatingPromptState = {
  askCount: 0,
  lastAskedAt: null,
  outcome: 'pending',
};

/** Cold starts before we're willing to ask — mirrors the opt-in sheet's "earn the ask". */
export const MIN_APP_OPENS = 5;
/** Distinct days with logged reading/japa activity. */
export const MIN_ACTIVE_DAYS = 3;
/** Lifetime verse advances — filters users who opened the app but never read. */
export const MIN_VERSE_READS = 20;
/** Quiet period between asks. */
export const REASK_COOLDOWN_DAYS = 45;
/** Hard ceiling on auto-opens over the app's lifetime. */
export const MAX_ASKS = 2;

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseRatingPromptState(raw: string | null): RatingPromptState {
  if (!raw) return RATING_PROMPT_DEFAULTS;
  try {
    const parsed = JSON.parse(raw) as Partial<RatingPromptState>;
    if (!parsed || typeof parsed !== 'object') return RATING_PROMPT_DEFAULTS;
    return {
      askCount:
        typeof parsed.askCount === 'number' && Number.isFinite(parsed.askCount) && parsed.askCount >= 0
          ? Math.floor(parsed.askCount)
          : RATING_PROMPT_DEFAULTS.askCount,
      lastAskedAt:
        typeof parsed.lastAskedAt === 'number' && Number.isFinite(parsed.lastAskedAt) && parsed.lastAskedAt > 0
          ? parsed.lastAskedAt
          : RATING_PROMPT_DEFAULTS.lastAskedAt,
      outcome:
        parsed.outcome === 'rated' || parsed.outcome === 'declined' || parsed.outcome === 'pending'
          ? parsed.outcome
          : RATING_PROMPT_DEFAULTS.outcome,
    };
  } catch {
    return RATING_PROMPT_DEFAULTS;
  }
}

export type RatingEligibilityInput = {
  state: RatingPromptState;
  /** Cold-start count (reused from notification meta — see the context). */
  appOpens: number;
  /** `UserActivity.lifetimeTotals().activeDays`. */
  activeDays: number;
  /** `UserActivity.lifetimeTotals().totalReads`. */
  totalReads: number;
  /** `Date.now()` at the call site — passed in so tests stay deterministic. */
  now: number;
  /**
   * True while any other first-run/post-update surface wants the screen
   * (feature tour, onboarding setup sheet, What's New, reminder opt-in).
   * Modal pile-up is the fastest way to make a rating ask feel like a nag.
   */
  blockedBySurface: boolean;
};

/**
 * Whether the sheet may auto-open right now. Every clause is a reason NOT to
 * ask; the ask has to earn its way past all of them.
 */
export function isEligibleForRatingPrompt(input: RatingEligibilityInput): boolean {
  const { state, appOpens, activeDays, totalReads, now, blockedBySurface } = input;
  if (state.outcome !== 'pending') return false;
  if (state.askCount >= MAX_ASKS) return false;
  if (blockedBySurface) return false;
  if (appOpens < MIN_APP_OPENS) return false;
  if (activeDays < MIN_ACTIVE_DAYS) return false;
  if (totalReads < MIN_VERSE_READS) return false;
  if (state.lastAskedAt !== null && now - state.lastAskedAt < REASK_COOLDOWN_DAYS * DAY_MS) return false;
  return true;
}

/** State after the sheet auto-opens: consumes one ask slot and starts the cooldown. */
export function afterAsked(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, askCount: state.askCount + 1, lastAskedAt: now };
}

/** State after the user taps through to the store — terminal. */
export function afterRated(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, outcome: 'rated', lastAskedAt: now };
}

/** State after "Don't ask again" — terminal. */
export function afterDeclined(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, outcome: 'declined', lastAskedAt: now };
}

/**
 * Store listing URL for a platform. Anything that isn't 'ios' (web, unknown)
 * gets the Play listing, which renders fine in a browser.
 */
export function storeListingUrl(platform: string): string {
  return platform === 'ios' ? APP_STORE_URL : PLAY_STORE_URL;
}

/**
 * Deep link that opens the review composer where the platform supports one:
 * `?action=write-review` opens the App Store's write-a-review sheet on iOS.
 * Play has no equivalent listing parameter, so Android lands on the listing,
 * whose "Rate this app" stars are the first thing on the page.
 */
export function storeReviewUrl(platform: string): string {
  return platform === 'ios' ? `${APP_STORE_URL}?action=write-review` : PLAY_STORE_URL;
}
