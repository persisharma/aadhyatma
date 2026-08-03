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
  afterDeclined,
  afterRated,
  isEligibleForRatingPrompt,
  parseRatingPromptState,
  storeListingUrl,
  storeReviewUrl,
  type RatingPromptState,
} from '@/data/ratingPrompt';
import { useUserActivity } from '@/contexts/UserActivityContext';
import { useNotificationPreferences } from '@/contexts/NotificationPreferencesContext';
import { useTour } from '@/contexts/TourContext';

/**
 * Owns the app-rating ask: when it may open, what the buttons do, and the
 * persisted outcome. Rendering lives in `components/RatingPromptSheet`; the
 * gate itself is pure (`data/ratingPrompt.ts`).
 *
 * Two entry points:
 *  - Auto — at most `MAX_ASKS` times over the app's lifetime, once per cold
 *    start, only for users with real practice history, and never on top of
 *    another first-run/post-update surface. Opening consumes an ask slot and
 *    starts the cooldown, so a swipe-away still counts as "we asked".
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
  /** "Maybe later": close. An auto-open already spent its slot; a manual one hasn't. */
  dismiss: () => void;
  /** "Don't ask again": close and never auto-open again. */
  decline: () => void;
  /** "Rate Vedansh": hand off to the store listing and stop asking. */
  rate: () => void;
};

const RatingPromptContext = createContext<RatingPromptContextValue | null>(null);

/**
 * Delay between "eligible" and the sheet appearing. Long enough that Home has
 * settled and the user is looking at content rather than a launch animation —
 * a prompt that lands on the first frame reads as an ad.
 */
export const RATING_PROMPT_DELAY_MS = 2500;

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
   * Engagement counters are read through a ref, NOT the dependency array. They
   * tick while the user reads, and every tick would otherwise re-run the effect,
   * clear the pending timer, and start a new one — a user paging through a
   * reader faster than the delay could defer the prompt forever. The gate is
   * evaluated once per hydration/blocking change against whatever the counters
   * say at that moment; a session that crosses a threshold mid-way simply gets
   * asked on the next launch.
   */
  const engagementRef = useRef({ appOpens: 0, activeDays: 0, totalReads: 0 });
  engagementRef.current = { appOpens: meta.appOpenCount, activeDays, totalReads };

  const blockedBySurface =
    shouldShowOptIn || shouldShowFirstLaunchTour || shouldShowOnboardingSetup || shouldShowWhatsNew;

  // Auto-open gate. The session ref keeps it to a single open per launch, and
  // the timer is cleared if a blocking surface appears before it fires.
  useEffect(() => {
    if (askedThisSessionRef.current) return undefined;
    if (!hydrated || notifLoading || activityLoading || tourLoading) return undefined;

    const eligible = isEligibleForRatingPrompt({
      state: stateRef.current,
      ...engagementRef.current,
      now: Date.now(),
      blockedBySurface,
    });
    if (!eligible) return undefined;

    const timer = setTimeout(() => {
      askedThisSessionRef.current = true;
      persist(afterAsked(stateRef.current, Date.now()));
      setVisible(true);
    }, RATING_PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [hydrated, notifLoading, activityLoading, tourLoading, blockedBySurface, persist]);

  const open = useCallback(() => setVisible(true), []);

  const dismiss = useCallback(() => setVisible(false), []);

  const decline = useCallback(() => {
    setVisible(false);
    persist(afterDeclined(stateRef.current, Date.now()));
  }, [persist]);

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
    () => ({ visible, state, open, dismiss, decline, rate }),
    [visible, state, open, dismiss, decline, rate]
  );

  return <RatingPromptContext.Provider value={value}>{children}</RatingPromptContext.Provider>;
}

export function useRatingPrompt(): RatingPromptContextValue {
  const ctx = useContext(RatingPromptContext);
  if (!ctx) throw new Error('useRatingPrompt must be used inside RatingPromptProvider');
  return ctx;
}
