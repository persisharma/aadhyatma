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

/**
 * The moments that may open the sheet (design.md §54 "Triggers"). The ask does
 * not fire on a cold start: a moment is a point where the user has just
 * finished something and is likely to feel good about the app, which is when a
 * rating request reads as a fair question rather than an interruption.
 *
 *  - `routine-complete` — the pushpa-varsha for today's routine has finished.
 *  - `verse-shared` — a verse share was dispatched to the OS/Instagram sheet.
 *  - `prose-shared` — a katha / Theerth / story / listing / Ask card (any
 *    non-devotional prose share) was dispatched. Kept apart from `verse-shared`
 *    so `asksByTrigger` can tell which share surface earns the rating.
 *  - `mala-complete` — the japam counter screen was left after ≥1 round this visit.
 *
 * Four moments ship (product decision, Sept 2026: routine completion was the
 * first; share + mala added to widen reach to users who never build a routine,
 * since ratings were coming in too low; Oct 2026: prose share cards added so
 * every share card can ask, not only verses). The type stays a union so a further
 * moment is a one-literal change here plus a `requestAsk` call at the host — see
 * RULEBOOK §6.2. Each moment fires only once its own feedback has finished (a
 * share sheet closed, the japam screen left) — never mid-interaction and never
 * over a celebration; the gate and the once-per-session guard still apply.
 */
export type RatingAskTrigger = 'routine-complete' | 'verse-shared' | 'prose-shared' | 'mala-complete';

export const RATING_ASK_TRIGGERS: readonly RatingAskTrigger[] = [
  'routine-complete',
  'verse-shared',
  'prose-shared',
  'mala-complete',
];

export type RatingPromptState = {
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
};

export const RATING_PROMPT_DEFAULTS: RatingPromptState = {
  askCount: 0,
  lastAskedAt: null,
  outcome: 'pending',
  asksByTrigger: {},
  lowRatedAt: null,
};

/** Cold starts before we're willing to ask — mirrors the opt-in sheet's "earn the ask". */
export const MIN_APP_OPENS = 5;
/** Distinct days with logged reading/japa activity. */
export const MIN_ACTIVE_DAYS = 3;
/** Lifetime verse advances — filters users who opened the app but never read. */
export const MIN_VERSE_READS = 20;
/**
 * Quiet period between asks (product decision, Aug 2026: "ask every 5 days if
 * not given"). With no lifetime ceiling this is now the ONLY thing spacing the
 * asks out, so it is load-bearing in a way it wasn't when `MAX_ASKS` was 2.
 */
export const REASK_COOLDOWN_DAYS = 5;
/**
 * Lifetime ceiling on auto-opens — `null` means no ceiling: keep asking every
 * `REASK_COOLDOWN_DAYS` until the user either rates or opts out.
 *
 * Deliberate product decision, and the reason "Don't ask again" is now the
 * user's ONLY permanent escape rather than a convenience. Do not remove or
 * de-emphasise that button while this is null — it is what keeps an unbounded
 * ask from being unbounded nagging (RULEBOOK §6.2).
 */
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
export const LOW_RATING_COOLDOWN_DAYS = 90;
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
      asksByTrigger: parseAsksByTrigger(parsed.asksByTrigger),
      lowRatedAt:
        typeof parsed.lowRatedAt === 'number' && Number.isFinite(parsed.lowRatedAt) && parsed.lowRatedAt > 0
          ? parsed.lowRatedAt
          : RATING_PROMPT_DEFAULTS.lowRatedAt,
    };
  } catch {
    return RATING_PROMPT_DEFAULTS;
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
  if (MAX_ASKS !== null && state.askCount >= MAX_ASKS) return false;
  if (blockedBySurface) return false;
  if (appOpens < MIN_APP_OPENS) return false;
  if (activeDays < MIN_ACTIVE_DAYS) return false;
  if (totalReads < MIN_VERSE_READS) return false;
  if (state.lastAskedAt !== null && now - state.lastAskedAt < REASK_COOLDOWN_DAYS * DAY_MS) return false;
  if (state.lowRatedAt !== null && now - state.lowRatedAt < LOW_RATING_COOLDOWN_DAYS * DAY_MS) return false;
  return true;
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
    asksByTrigger: {
      ...state.asksByTrigger,
      [trigger]: (state.asksByTrigger[trigger] ?? 0) + 1,
    },
  };
}

/** State after the user taps through to the store — terminal. */
export function afterRated(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, outcome: 'rated', lastAskedAt: now };
}

/** State after a 1–3★ tap: still askable, once `LOW_RATING_COOLDOWN_DAYS` pass. */
export function afterLowRating(state: RatingPromptState, now: number): RatingPromptState {
  return { ...state, lowRatedAt: now };
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
