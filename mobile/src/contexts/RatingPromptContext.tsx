import { isRatingInteractionActive } from '@/contexts/ratingInteraction';
import { isBrandLaunchVisible, useBrandLaunchVisible } from '@/navigation/brandLaunchIntent';
import { useLaunchAsks, claimRatingAsk } from '@/components/launchAskStore';
import { isExploreSurfaceOpen } from '@/data/discovery/store';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RATING_PROMPT_DEFAULTS,
  RATING_PROMPT_STORAGE_KEY,
  afterAsked,
  afterDismissed,
  afterLowRating,
  afterRated,
  feedbackEmail,
  feedbackMailto,
  isEligibleForRatingPrompt,
  parseRatingPromptState,
  storeListingUrl,
  storeReviewUrl,
  timeBasedRatingAskAt,
  type RatingAskTrigger,
  type RatingPromptState,
} from '@/data/ratingPrompt';
import { ENGAGEMENT_PROMPTS, isEligibleForSocialPrompt, socialPageUrl, type SocialPlatform } from '@/data/engagementPrompts';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useTour } from '@/contexts/TourContext';
import { RatingAskContext, subscribeRatingAsks } from '@/contexts/ratingAsk';

/**
 * Owns the app-rating ask: when it may open, what the buttons do, and the
 * persisted outcome. Rendering lives in `components/RatingPromptSheet`; the
 * gate itself is pure (`data/ratingPrompt.ts`).
 *
 * Entry points:
 *  - Usage — two cold starts OR two active days, after launch selection settles.
 *  - Moment-triggered — a surface where the user has just finished something
 *    (routine celebration done, a mala completed, a verse shared) calls
 *    `requestAsk(trigger)`. The request is honoured on its persisted response-specific time/action cadence,
 *    including first-visit shares/saves, and never on top of another
 *    first-run/post-update surface. Opening records the ask; the next response selects its repeat rule. A successful store hand-off advances automatic asks to social following.
 *  - Manual — the "Rate the App" row in More (§37) calls `open()`, which
 *    bypasses the gate and does NOT spend an ask slot. A user who goes looking
 *    for it has already opted in.
 *
 * App-open counting is deliberately NOT re-implemented here: the notification
 * meta already keeps a once-per-cold-start counter for the same "earn the ask"
 * purpose, so we read `meta.appOpenCount` rather than adding a second counter
 * that would disagree with it.
 */

type RatingPromptContextValue = {
  /** Is the sheet on screen right now? */
  visible: boolean;
  state: RatingPromptState;
  promptKind: 'rating' | 'social';
  socialLinkError: boolean;
  follow: (platform: SocialPlatform) => Promise<void>;
  confirmFollowing: (platform: SocialPlatform) => void;
  /** Open the sheet from a user action (More row) — ignores the gate. */
  open: () => void;
  /**
   * "Maybe later": close. The two-day-or-next-action rule brings the card back — there is no
   * permanent opt-out on the sheet (design.md §54, RULEBOOK §6.2).
   */
  dismiss: () => void;
  /** A store link: on successful dispatch, advance automatic asking to social following. */
  rate: (stars?: number) => Promise<void>;
  /** A 1–3★ tap: the card stays up on its thank-you step and stays away for 30 days after. */
  recordLowRating: () => void;
  /** "Write to us": close and open a pre-filled email. Offered only when `feedbackEmail()` is set. */
  writeToUs: (stars: number) => void;
  /**
   * A good moment just happened — ask if the gate allows. Safe to call freely:
   * every refusal (not eligible, already asked this session, another surface on
   * screen, state still loading) is silent, and the moment simply passes.
   */
  requestAsk: (trigger: RatingAskTrigger) => void;
};

const RatingPromptContext = createContext<RatingPromptContextValue | null>(
  null,
);

/**
 * Delay between a moment being requested and the sheet appearing. Long enough
 * that the moment's own feedback (a success haptic, the last petals, the share
 * sheet closing) has finished and the screen has settled — a card that lands on
 * the same frame as the thing it is thanking the user for reads as an ad.
 */
export const RATING_PROMPT_DELAY_MS = 1200;

/** Lazy, as in KulParamparaExportScreen: expo-constants must stay out of Jest's static graph. */
function appVersion(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-constants').default?.expoConfig?.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

export function RatingPromptProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const launch = useLaunchAsks();
  const brandVisible = useBrandLaunchVisible();
  const { meta, isLoading: notifLoading } = useNotificationPreferences();
  const { lifetimeTotals, isLoading: activityLoading } = useUserActivity();
  const {
    isLoading: tourLoading,
    shouldShowFirstLaunchTour,
    shouldShowOnboardingSetup,
    shouldShowWhatsNew,
  } = useTour();

  const [state, setState] = useState<RatingPromptState>(RATING_PROMPT_DEFAULTS);
  const [hydrated, setHydrated] = useState(false);
  const [visible, setVisible] = useState(false);
  const [promptKind, setPromptKind] = useState<'rating' | 'social'>('rating');
  const kindRef = useRef<'rating' | 'social'>('rating');
  const [socialLinkError, setSocialLinkError] = useState(false);
  const handoffRef = useRef(false);
  const writesRef = useRef(Promise.resolve());
  const [clockTick, setClockTick] = useState(0);
  /** Mirror of the latest state so button handlers never write from a stale closure. */
  const stateRef = useRef<RatingPromptState>(RATING_PROMPT_DEFAULTS);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(RATING_PROMPT_STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        const loaded = parseRatingPromptState(raw);
        stateRef.current = loaded;
        setState(loaded);
        setHydrated(true);
      })
      // An unread record may contain a decline or completed campaign. Stay quiet
      // for this session rather than overwrite it with fresh defaults.
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: RatingPromptState) => {
    stateRef.current = next;
    setState(next);
    const raw = JSON.stringify(next);
    // Serialize the tiny record's writes so a slow earlier write cannot undo a confirmation.
    writesRef.current = writesRef.current.then(() =>
      AsyncStorage.setItem(RATING_PROMPT_STORAGE_KEY, raw)).catch(() => undefined);
  }, []);

  const { activeDays } = lifetimeTotals();

  /**
   * Everything the gate reads goes through refs, not the dependency array of an
   * effect: `requestAsk` is called from other surfaces' callbacks (an animation's
   * onDone, a screen unmount, a resolved share), so it must see the latest
   * counters and flags without being re-created on every render — a re-created
   * callback would churn every consumer's effects while the user reads.
   */
  const engagementRef = useRef({ appOpens: 0, activeDays: 0 });
  engagementRef.current = {
    appOpens: meta.appOpenCount,
    activeDays,
  };

  const blockedBySurface =
    brandVisible ||
    (launch.taken && !launch.ratingOwned) ||
    !launch.ready ||
    !launch.selectionComplete ||
    shouldShowFirstLaunchTour ||
    shouldShowOnboardingSetup ||
    shouldShowWhatsNew;
  const blockedRef = useRef(blockedBySurface);
  blockedRef.current = blockedBySurface;

  const readyRef = useRef(false);
  readyRef.current =
    hydrated && !notifLoading && !activityLoading && !tourLoading;
  const visibleRef = useRef(visible);
  visibleRef.current = visible;

  /** The one pending open, so two moments in quick succession queue one card, not two. */
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      readyRef.current = false;
      if (pendingRef.current) clearTimeout(pendingRef.current);
    },
    [],
  );

  const requestAsk = useCallback(
    (trigger: RatingAskTrigger) => {
      if (pendingRef.current || visibleRef.current) return;
      // Still loading: the moment passes rather than being queued. Asking a few
      // seconds after the moment, once storage catches up, is the launch-frame
      // ambush this design exists to avoid.
      if (!readyRef.current) return;

      if (handoffRef.current) return;
      const social = stateRef.current.storeHandoffCount > 0 && stateRef.current.outcome !== 'declined';
      const eligible = social ? isEligibleForSocialPrompt(stateRef.current.social, true,
        trigger !== 'app-engaged', Date.now()) : isEligibleForRatingPrompt({
        trigger,
        state: stateRef.current,
        ...engagementRef.current,
        now: Date.now(),
        blockedBySurface: blockedRef.current,
      });
      if (!eligible || blockedRef.current || isBrandLaunchVisible() || isExploreSurfaceOpen()) return;

      pendingRef.current = setTimeout(() => {
        pendingRef.current = null;
        // A first-run surface may have claimed the screen during the delay.
        if (handoffRef.current || !readyRef.current || visibleRef.current || blockedRef.current || isBrandLaunchVisible() || isExploreSurfaceOpen()) return;
        if (AppState.currentState === 'background' || AppState.currentState === 'inactive') return;
        if (isRatingInteractionActive()) return;
        // Manual rating/feedback may have changed the persisted outcome during the delay.
        const currentSocial = stateRef.current.storeHandoffCount > 0 && stateRef.current.outcome !== 'declined';
        if (currentSocial !== social) return;
        if (!(social ? isEligibleForSocialPrompt(stateRef.current.social, true,
          trigger !== 'app-engaged', Date.now()) : isEligibleForRatingPrompt({
          state: stateRef.current,
          ...engagementRef.current,
          trigger,
          now: Date.now(),
          blockedBySurface: blockedRef.current,
        }))) return;
        const repeat = social || stateRef.current.campaignId !== 'initial' ||
          stateRef.current.lastAskedAt !== null || stateRef.current.respondedAt !== null;
        if (!claimRatingAsk(repeat)) return;
        const current = stateRef.current;
        persist(social ? { ...current, social: { ...current.social,
          askCount: current.social.askCount + 1, lastAskedAt: Date.now() } }
          : afterAsked(current, Date.now(), trigger));
        kindRef.current = social ? 'social' : 'rating';
        setPromptKind(kindRef.current);
        setSocialLinkError(false);
        visibleRef.current = true;
        setVisible(true);
      }, RATING_PROMPT_DELAY_MS);
    },
    [persist],
  );

  useEffect(() => subscribeRatingAsks(requestAsk), [requestAsk]);

  useEffect(() => {
    if (hydrated && !notifLoading && !activityLoading && !tourLoading && !blockedBySurface) {
      requestAsk('app-engaged');
    }
    if (!hydrated || visible || blockedBySurface) return;
    const deadline = state.storeHandoffCount > 0
      ? state.social.lastAskedAt === null || !ENGAGEMENT_PROMPTS.socialEnabled ? null : state.social.lastAskedAt + 2 * 86400000
      : timeBasedRatingAskAt(state);
    if (deadline === null || deadline <= Date.now()) return;
    // Bound waits below the platform timeout maximum, including the 30-day rest.
    const timer = setTimeout(() => setClockTick((n) => n + 1), Math.min(deadline - Date.now(), 86400000));
    return () => clearTimeout(timer);
  }, [hydrated, notifLoading, activityLoading, tourLoading, blockedBySurface,
    meta.appOpenCount, activeDays, requestAsk, state, visible, clockTick]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') requestAsk('app-engaged');
    });
    return () => subscription.remove();
  }, [requestAsk]);

  const open = useCallback(() => {
    if (!readyRef.current || handoffRef.current) return;
    if (pendingRef.current) clearTimeout(pendingRef.current);
    pendingRef.current = null;
    kindRef.current = 'rating';
    setPromptKind('rating');
    visibleRef.current = true;
    setVisible(true);
  }, []);

  const dismiss = useCallback(() => {
    visibleRef.current = false;
    setVisible(false);
    if (kindRef.current === 'social') {
      persist({ ...stateRef.current, social: { ...stateRef.current.social, lastAskedAt: Date.now() } });
      return;
    }
    // Closing the thank-you step must preserve its 30-day pause.
    if (stateRef.current.response !== 'low' && stateRef.current.response !== 'store') {
      persist(afterDismissed(stateRef.current, Date.now()));
    }
  }, [persist]);

  const rate = useCallback(async (stars = 5) => {
    if (!readyRef.current || handoffRef.current || !visibleRef.current) return;
    handoffRef.current = true;
    visibleRef.current = false;
    setVisible(false);
    // A failed URL attempt must not advance to social or reopen immediately.
    if (stateRef.current.response !== 'low') persist(afterDismissed(stateRef.current, Date.now()));
    try {
      try { await Linking.openURL(storeReviewUrl(Platform.OS)); }
      catch { await Linking.openURL(storeListingUrl(Platform.OS)); }
      if (readyRef.current) persist(afterRated(stateRef.current, Date.now(), stars));
    } catch {
      // Both routes failed: keep the review eligible on its normal retry cadence.
    } finally {
      handoffRef.current = false;
    }
  }, [persist]);

  const follow = useCallback(async (platform: SocialPlatform) => {
    const url = socialPageUrl(platform);
    if (!url || handoffRef.current || !visibleRef.current || kindRef.current !== 'social') return;
    handoffRef.current = true;
    setSocialLinkError(false);
    try { await Linking.openURL(url); }
    catch { if (readyRef.current && visibleRef.current) setSocialLinkError(true); }
    finally { handoffRef.current = false; }
  }, []);

  const confirmFollowing = useCallback((platform: SocialPlatform) => {
    if (!readyRef.current || !visibleRef.current || kindRef.current !== 'social' || !socialPageUrl(platform)) return;
    const current = stateRef.current;
    persist({ ...current, social: { ...current.social,
      confirmed: { ...current.social.confirmed, [platform]: true } } });
    // Keep the other platform visible; only explicit confirmations end the campaign.
    const platforms: SocialPlatform[] = ['instagram', 'facebook'];
    if (platforms.every((p) => !socialPageUrl(p) || stateRef.current.social.confirmed[p])) {
      visibleRef.current = false;
      setVisible(false);
    }
  }, [persist]);

  const recordLowRating = useCallback(() => {
    persist(afterLowRating(stateRef.current, Date.now()));
  }, [persist]);

  const writeToUs = useCallback((stars: number) => {
    visibleRef.current = false;
    setVisible(false);
    const email = feedbackEmail();
    if (!email) return;
    // No mail app: fail silently, as the store hand-off does.
    Linking.openURL(
      feedbackMailto(email, stars, Platform.OS, appVersion()),
    ).catch(() => undefined);
  }, []);

  const value = useMemo<RatingPromptContextValue>(
    () => ({
      visible,
      state,
      promptKind,
      socialLinkError,
      follow,
      confirmFollowing,
      open,
      dismiss,
      rate,
      recordLowRating,
      writeToUs,
      requestAsk,
    }),
    [
      visible,
      state,
      promptKind,
      socialLinkError,
      follow,
      confirmFollowing,
      open,
      dismiss,
      rate,
      recordLowRating,
      writeToUs,
      requestAsk,
    ],
  );

  return (
    <RatingPromptContext.Provider value={value}>
      {/* The light "report a moment" context (contexts/ratingAsk.ts) — the
          surfaces that call it must not import this file. */}
      <RatingAskContext.Provider value={requestAsk}>
        {children}
      </RatingAskContext.Provider>
    </RatingPromptContext.Provider>
  );
}

export function useRatingPrompt(): RatingPromptContextValue {
  const ctx = useContext(RatingPromptContext);
  if (!ctx)
    throw new Error('useRatingPrompt must be used inside RatingPromptProvider');
  return ctx;
}
