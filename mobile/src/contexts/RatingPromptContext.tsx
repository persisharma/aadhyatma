import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  RATING_PROMPT_DEFAULTS,
  RATING_PROMPT_STORAGE_KEY,
  afterAsked,
  afterRated,
  isEligibleForRatingPrompt,
  parseRatingPromptState,
  storeListingUrl,
  storeReviewUrl,
  type RatingAskTrigger,
  type RatingPromptState,
} from '@/data/ratingPrompt';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useTour } from '@/contexts/TourContext';
import { RatingAskContext } from '@/contexts/ratingAsk';

/**
 * Owns the app-rating ask: when it may open, what the buttons do, and the
 * persisted outcome. Rendering lives in `components/RatingPromptSheet`; the
 * gate itself is pure (`data/ratingPrompt.ts`).
 *
 * Two entry points:
 *  - Moment-triggered — a surface where the user has just finished something
 *    (routine celebration done, a mala completed, a verse shared) calls
 *    `requestAsk(trigger)`. The request is honoured at most once per app
 *    session, only on a `REASK_COOLDOWN_DAYS` cadence with no lifetime ceiling,
 *    only for users with real practice history, and never on top of another
 *    first-run/post-update surface. Opening records the ask and restarts the
 *    cooldown, so a swipe-away still counts as "we asked". Rating is the only
 *    outcome the sheet can reach that ends the cadence. There is deliberately
 *    NO cold-start trigger any more (Sept 2026): a prompt on launch interrupts
 *    whatever the user opened the app to do.
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
  /** Open the sheet from a user action (More row) — ignores the gate. */
  open: () => void;
  /**
   * "Maybe later": close. The 5-day cadence brings the card back — there is no
   * permanent opt-out on the sheet (design.md §54, RULEBOOK §6.2).
   */
  dismiss: () => void;
  /** "Rate Vedansh": hand off to the store listing and stop asking. */
  rate: () => void;
  /**
   * A good moment just happened — ask if the gate allows. Safe to call freely:
   * every refusal (not eligible, already asked this session, another surface on
   * screen, state still loading) is silent, and the moment simply passes.
   */
  requestAsk: (trigger: RatingAskTrigger) => void;
};

const RatingPromptContext = createContext<RatingPromptContextValue | null>(null);

/**
 * Delay between a moment being requested and the sheet appearing. Long enough
 * that the moment's own feedback (a success haptic, the last petals, the share
 * sheet closing) has finished and the screen has settled — a card that lands on
 * the same frame as the thing it is thanking the user for reads as an ad.
 */
export const RATING_PROMPT_DELAY_MS = 1200;

export function RatingPromptProvider({ children }: { children: React.ReactNode }) {
  const { meta, isLoading: notifLoading, shouldShowOptIn } = useNotificationPreferences();
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
  /** One auto-open per app session, even if eligibility recomputes. */
  const askedThisSessionRef = useRef(false);
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
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: RatingPromptState) => {
    stateRef.current = next;
    setState(next);
    AsyncStorage.setItem(RATING_PROMPT_STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const { activeDays, totalReads } = lifetimeTotals();

  /**
   * Everything the gate reads goes through refs, not the dependency array of an
   * effect: `requestAsk` is called from other surfaces' callbacks (an animation's
   * onDone, a screen unmount, a resolved share), so it must see the latest
   * counters and flags without being re-created on every render — a re-created
   * callback would churn every consumer's effects while the user reads.
   */
  const engagementRef = useRef({ appOpens: 0, activeDays: 0, totalReads: 0 });
  engagementRef.current = { appOpens: meta.appOpenCount, activeDays, totalReads };

  const blockedBySurface =
    shouldShowOptIn || shouldShowFirstLaunchTour || shouldShowOnboardingSetup || shouldShowWhatsNew;
  const blockedRef = useRef(blockedBySurface);
  blockedRef.current = blockedBySurface;

  const readyRef = useRef(false);
  readyRef.current = hydrated && !notifLoading && !activityLoading && !tourLoading;

  /** The one pending open, so two moments in quick succession queue one card, not two. */
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    },
    []
  );

  const requestAsk = useCallback(
    (trigger: RatingAskTrigger) => {
      if (askedThisSessionRef.current || pendingRef.current) return;
      // Still loading: the moment passes rather than being queued. Asking a few
      // seconds after the moment, once storage catches up, is the launch-frame
      // ambush this design exists to avoid.
      if (!readyRef.current) return;

      const eligible = isEligibleForRatingPrompt({
        state: stateRef.current,
        ...engagementRef.current,
        now: Date.now(),
        blockedBySurface: blockedRef.current,
      });
      if (!eligible) return;

      pendingRef.current = setTimeout(() => {
        pendingRef.current = null;
        // A first-run surface may have claimed the screen during the delay.
        if (blockedRef.current || askedThisSessionRef.current) return;
        askedThisSessionRef.current = true;
        persist(afterAsked(stateRef.current, Date.now(), trigger));
        setVisible(true);
      }, RATING_PROMPT_DELAY_MS);
    },
    [persist]
  );

  const open = useCallback(() => setVisible(true), []);

  const dismiss = useCallback(() => setVisible(false), []);

  const rate = useCallback(() => {
    setVisible(false);
    persist(afterRated(stateRef.current, Date.now()));
    // The review deep link is the preferred target; if the OS refuses it (older
    // iOS, no App Store app, web) fall back to the plain listing, then give up
    // silently — a failed hand-off must never surface an error to a user who
    // just tried to do us a favour.
    Linking.openURL(storeReviewUrl(Platform.OS)).catch(() => {
      Linking.openURL(storeListingUrl(Platform.OS)).catch(() => undefined);
    });
  }, [persist]);

  const value = useMemo<RatingPromptContextValue>(
    () => ({ visible, state, open, dismiss, rate, requestAsk }),
    [visible, state, open, dismiss, rate, requestAsk]
  );

  return (
    <RatingPromptContext.Provider value={value}>
      {/* The light "report a moment" context (contexts/ratingAsk.ts) — the
          surfaces that call it must not import this file. */}
      <RatingAskContext.Provider value={requestAsk}>{children}</RatingAskContext.Provider>
    </RatingPromptContext.Provider>
  );
}

export function useRatingPrompt(): RatingPromptContextValue {
  const ctx = useContext(RatingPromptContext);
  if (!ctx) throw new Error('useRatingPrompt must be used inside RatingPromptProvider');
  return ctx;
}
