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
import { ENGAGEMENT_PROMPTS, newSocialPromptState, parseSocialPromptState, type SocialPromptState } from '@/data/engagementPrompts';

export const RATING_PROMPT_STORAGE_KEY = '@vedansh/rating-prompt';

/**
 * `pending`  — never answered; still askable (subject to the gate).
 * `rated`    — a successful store hand-off. Automatic asking has ended.
 * `declined` — the user tapped "Don't ask again". Never ask again.
 *
 * Note "rated" records that we *handed off* to the store, not that a review was
 * actually written — the app cannot observe that, and asking again after a
 * hand-off would be the nagging we're trying to avoid.
 */
export type RatingPromptOutcome = 'pending' | 'rated' | 'declined';

/**
 * Usage (two cold starts OR two active days), or a completed share/save/practice
 * action, can independently earn the ask. Actions do not require a usage floor.
 * All routes retain outcome, cooldown, foreground and shared-surface guards.
 * Existing trigger IDs stay stable so stored per-moment counts survive upgrades.
 */
export type RatingAskTrigger = 'app-engaged' | 'bookmark-saved' | 'content-shared' | 'routine-complete' | 'verse-shared' | 'prose-shared' | 'mala-complete';

export const RATING_ASK_TRIGGERS: readonly RatingAskTrigger[] = [
  'app-engaged',
  'bookmark-saved',
  'content-shared',
  'routine-complete',
  'verse-shared',
  'prose-shared',
  'mala-complete',
];

export type RatingPromptState = {
  campaignId: string;
  social: SocialPromptState;
  /** How many times the sheet has auto-opened (manual opens from More don't count). */
  askCount: number;
  /** Epoch ms of the last auto-open, or null if never shown. */
  lastAskedAt: number | null;
  outcome: RatingPromptOutcome;
  /**
   * Auto-opens broken down by the moment that caused them. Purely for learning
   * which moment earns the rating (the app has no analytics backend), so it is
   * additive and optional: an older blob without it parses as `{}`.
   */
  asksByTrigger: Partial<Record<RatingAskTrigger, number>>;
  /**
   * Epoch ms of the last 1–3★ tap on the card, or null. Those users get the
   * thank-you step instead of the store, and the card stays away for
   * `LOW_RATING_COOLDOWN_DAYS` so what they disliked can be fixed first.
   */
  lowRatedAt: number | null;
  /** Last explicit response; none also covers killing the app while the ask is open. */
  response: 'none' | 'dismissed' | 'low' | 'store';
  respondedAt: number | null;
  /** Successful store hand-offs stop automatic rating asks. */
  storeHandoffCount: number;
  /** Legacy follow-up timestamp retained for storage compatibility; no longer used. */
  followupActionAt: number | null;
};

export const RATING_PROMPT_DEFAULTS: RatingPromptState = {
  campaignId: ENGAGEMENT_PROMPTS.reviewCampaignId,
  social: newSocialPromptState(),
  askCount: 0,
  lastAskedAt: null,
  outcome: 'pending',
  asksByTrigger: {},
  lowRatedAt: null,
  response: 'none',
  respondedAt: null,
  storeHandoffCount: 0,
  followupActionAt: null,
};

/** Either usage threshold earns an automatic ask after launch selection settles. */
export const MIN_APP_OPENS = 2;
/** Distinct days with logged reading/japa activity. */
export const MIN_ACTIVE_DAYS = 2;
/** Close: time-only repeat after two days; an action can qualify earlier. */
export const REASK_COOLDOWN_DAYS = 2;
/** No dismissal-count ceiling; a successful store hand-off ends automatic rating asks. */
export const MAX_ASKS: number | null = null;
/**
 * In-app stars at or above this hand off to the store's review page; below it the
 * card thanks the user and offers "Write to us" first. The store link stays on
 * that low-star step too (product decision, Oct 2026): hiding the store from
 * unhappy users is review gating, which Play's ratings policy and the US FTC
 * treat as deceptive.
 */
export const STORE_MIN_STARS = 4;
/** Quiet period after a 1–3★ tap (product decision, Oct 2026). */
export const LOW_RATING_COOLDOWN_DAYS = 30;
/**
 * Inbox the low-star step's "Write to us" opens a pre-filled email to. `null`
 * hides that button, leaving the store link and Close. Use a support inbox, not
 * a personal address: it ships inside the app.
 */
export const FEEDBACK_EMAIL: string | null = 'vedansh.app.support@gmail.com';

/** Read through a function so tests can stand in an address. */
export function feedbackEmail(): string | null {
  return FEEDBACK_EMAIL;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function newRatingPromptState(): RatingPromptState {
  return { ...RATING_PROMPT_DEFAULTS, campaignId: ENGAGEMENT_PROMPTS.reviewCampaignId, social: newSocialPromptState() };
}

export function parseRatingPromptState(raw: string | null): RatingPromptState {
  if (!raw) return newRatingPromptState();
  try {
    const parsed = JSON.parse(raw) as Partial<RatingPromptState>;
    if (!parsed || typeof parsed !== 'object') return newRatingPromptState();
    // Missing ID is the pre-campaign record: preserve it on initial rollout.
    if ((parsed.campaignId ?? 'initial') !== ENGAGEMENT_PROMPTS.reviewCampaignId) {
      return { ...newRatingPromptState(), social: parseSocialPromptState(parsed.social) };
    }
    const positiveTime = (value: unknown): number | null =>
      typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : null;
    const lastAskedAt = positiveTime(parsed.lastAskedAt);
    const lowRatedAt = positiveTime(parsed.lowRatedAt);
    const count = typeof parsed.storeHandoffCount === 'number' && Number.isSafeInteger(parsed.storeHandoffCount) && parsed.storeHandoffCount >= 0
      ? parsed.storeHandoffCount : parsed.outcome === 'rated' ? 1 : 0;
    // Any prior store hand-off now advances to the social stage.
    const handedOff = count > 0 || parsed.outcome === 'rated';
    return {
      campaignId: ENGAGEMENT_PROMPTS.reviewCampaignId,
      social: parseSocialPromptState(parsed.social),
      askCount:
        typeof parsed.askCount === 'number' && Number.isFinite(parsed.askCount) && parsed.askCount >= 0
          ? Math.floor(parsed.askCount)
          : RATING_PROMPT_DEFAULTS.askCount,
      lastAskedAt:
        typeof parsed.lastAskedAt === 'number' && Number.isFinite(parsed.lastAskedAt) && parsed.lastAskedAt > 0
          ? parsed.lastAskedAt
          : RATING_PROMPT_DEFAULTS.lastAskedAt,
      outcome: parsed.outcome === 'declined' ? 'declined'
        : handedOff ? 'rated' : 'pending',
      response: handedOff ? 'store'
        : ['none', 'dismissed', 'low', 'store'].includes(parsed.response ?? '') ? parsed.response!
        : lowRatedAt !== null ? 'low' : 'none',
      respondedAt: positiveTime(parsed.respondedAt) ?? (handedOff ? (lastAskedAt ?? 1) : lowRatedAt),
      storeHandoffCount: count,
      followupActionAt: positiveTime(parsed.followupActionAt),
      asksByTrigger: parseAsksByTrigger(parsed.asksByTrigger),
      lowRatedAt:
        typeof parsed.lowRatedAt === 'number' && Number.isFinite(parsed.lowRatedAt) && parsed.lowRatedAt > 0
          ? parsed.lowRatedAt
          : RATING_PROMPT_DEFAULTS.lowRatedAt,
    };
  } catch {
    return newRatingPromptState();
  }
}

function parseAsksByTrigger(raw: unknown): Partial<Record<RatingAskTrigger, number>> {
  if (!raw || typeof raw !== 'object') return {};
  const out: Partial<Record<RatingAskTrigger, number>> = {};
  for (const trigger of RATING_ASK_TRIGGERS) {
    const value = (raw as Record<string, unknown>)[trigger];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
      out[trigger] = Math.floor(value);
    }
  }
  return out;
}

export type RatingEligibilityInput = {
  state: RatingPromptState;
  /** Cold-start count (reused from notification meta — see the context). */
  appOpens: number;
  /** `UserActivity.lifetimeTotals().activeDays`. */
  activeDays: number;
  /** Shares and completed actions can earn the ask before the usage thresholds. */
  trigger?: RatingAskTrigger;
  /** `Date.now()` at the call site — passed in so tests stay deterministic. */
  now: number;
  /**
   * True while any other first-run/post-update surface wants the screen
   * (feature tour, onboarding setup sheet, What's New, reminder opt-in).
   * Modal pile-up is the fastest way to make a rating ask feel like a nag.
   */
  blockedBySurface: boolean;
};

/** Dismissal and low-star pauses have time-based deadlines; store hand-offs do not. */
export function timeBasedRatingAskAt(state: RatingPromptState): number | null {
  if (state.outcome !== 'pending') return null;
  const at = state.response === 'low' ? state.lowRatedAt ?? state.respondedAt
    : state.respondedAt ?? state.lastAskedAt;
  if (at === null) return null;
  return at + (state.response === 'low' ? LOW_RATING_COOLDOWN_DAYS : REASK_COOLDOWN_DAYS) * DAY_MS;
}

/**
 * Whether the sheet may auto-open right now. Every clause is a reason NOT to
 * ask; the ask has to earn its way past all of them.
 */
export function isEligibleForRatingPrompt(input: RatingEligibilityInput): boolean {
  const { state, appOpens, activeDays, trigger, now, blockedBySurface } = input;
  if (state.outcome !== 'pending' || state.storeHandoffCount > 0) return false;
  if (MAX_ASKS !== null && state.askCount >= MAX_ASKS) return false;
  if (blockedBySurface) return false;
  const completedAction = trigger !== undefined && trigger !== 'app-engaged';
  const responseAt = state.respondedAt ?? state.lastAskedAt;
  if (state.response === 'low' || state.lowRatedAt !== null) {
    return now - (state.lowRatedAt ?? responseAt ?? now) >= LOW_RATING_COOLDOWN_DAYS * DAY_MS;
  }
  if (responseAt !== null) {
    // Dismissed or killed while open: two days OR the next completed action.
    return completedAction || now - responseAt >= REASK_COOLDOWN_DAYS * DAY_MS;
  }
  return appOpens >= MIN_APP_OPENS || activeDays >= MIN_ACTIVE_DAYS || completedAction;
}

/**
 * State after the sheet auto-opens: consumes one ask slot, starts the cooldown,
 * and credits the moment that opened it.
 */
export function afterAsked(
  state: RatingPromptState,
  now: number,
  trigger: RatingAskTrigger
): RatingPromptState {
  return {
    ...state,
    askCount: state.askCount + 1,
    lastAskedAt: now,
    response: 'none',
    respondedAt: null,
    followupActionAt: null,
    lowRatedAt: null,
    asksByTrigger: {
      ...state.asksByTrigger,
      [trigger]: (state.asksByTrigger[trigger] ?? 0) + 1,
    },
  };
}

/** Close/Maybe later: two days or a new completed action, whichever comes first. */
export function afterDismissed(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, response: 'dismissed', respondedAt: now, lowRatedAt: null, followupActionAt: null };
}

/** A successful store hand-off, at any star count, advances to the social stage. */
export function afterRated(state: RatingPromptState, now: number, _stars = 5): RatingPromptState {
  const storeHandoffCount = state.storeHandoffCount + 1;
  return { ...state, outcome: 'rated',
    response: 'store', respondedAt: now, lowRatedAt: null, followupActionAt: null, storeHandoffCount };
}

/** 1–3★ always gets a 30-day pause, including the thank-you step's store link. */
export function afterLowRating(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, outcome: 'pending', lowRatedAt: now, response: 'low', respondedAt: now, followupActionAt: null };
}

/**
 * State after a permanent opt-out — terminal.
 *
 * NOT reachable from the sheet: the card has no opt-out (product decision Aug
 * 2026, kept when the stars arrived), so nothing in the current UI calls this.
 * It is kept because the gate must still honour an `outcome: 'declined'` written
 * by an earlier build, and because a Settings-side opt-out (the mitigation
 * RULEBOOK §6.2 describes) would use exactly this transition.
 */
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

/**
 * The pre-filled email behind "Write to us". It opens in the user's mail app and
 * they choose whether to send it, so nothing leaves the phone without them.
 */
export function feedbackMailto(email: string, stars: number, platform: string, appVersion: string): string {
  const subject = `Vedansh feedback (${stars}/5)`;
  const body = `Rating: ${stars}/5\nApp: ${appVersion} (${platform})\n\nWhat should we fix?\n\n`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
