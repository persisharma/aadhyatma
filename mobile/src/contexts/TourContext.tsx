import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  APP_TOUR_VERSION,
  getWhatsNewForVersion,
  type WhatsNewEntry,
} from '@/data/tour/whatsNew';
import { UPGRADER_SIGNAL_KEYS } from '@/contexts/NewContentContext';

const TOUR_COMPLETED_KEY = '@vedansh/tour-completed-v';
const WHATS_NEW_SEEN_KEY = '@vedansh/whats-new-seen-v';
const PHASE_KEY = '@vedansh/onboarding-phase';
const SETUP_COMPLETED_KEY = '@vedansh/onboarding-setup-v';

type TourContextValue = {
  isLoading: boolean;
  /** First-launch tour should be shown right now. */
  shouldShowFirstLaunchTour: boolean;
  /**
   * First-run language, city and reminder setup should be shown right now.
   * Fires for a fresh install (or a tour replay) once the tour's own gate has
   * closed, so the walkthrough that *showed* those settings is immediately
   * followed by the prompt to pick them. Never for a returning user.
   */
  shouldShowOnboardingSetup: boolean;
  /** What's-new modal should be shown right now (update launch). */
  shouldShowWhatsNew: boolean;
  /** What's-new entry for the current version (null if none defined). */
  whatsNewEntry: WhatsNewEntry | null;
  /**
   * Marks the first-launch tour complete. Also records the current version as
   * "what's new seen" so a brand-new user doesn't immediately get hit with the
   * what's-new modal too.
   */
  markTourCompleted: () => Promise<void>;
  /** Marks the first-run setup done for the current version. */
  markOnboardingSetupCompleted: () => Promise<void>;
  /** Marks the what's-new modal seen for the current version. */
  markWhatsNewSeen: () => Promise<void>;
  /** Resets the tour state so it shows again — surface this if we want a "Show tour again" affordance. */
  resetTour: () => Promise<void>;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'setup' | 'tour' | 'done'>('done');
  const [isLoading, setIsLoading] = useState(true);
  const [tourCompletedVersion, setTourCompletedVersion] = useState<
    string | null
  >(null);
  const [whatsNewSeenVersion, setWhatsNewSeenVersion] = useState<string | null>(
    null,
  );
  // Distinguishes a genuine fresh install from a returning user on the debut
  // release (both lack the tour keys). A fresh install gets the full tour; a
  // returning user gets the version's What's New instead — matching "install →
  // tour, update → new-features-only". Detected via deliberate-action keys that
  // never exist on a clean first boot (see NewContentContext).
  const [isFreshInstall, setIsFreshInstall] = useState(false);
  // Explicit replay request (More → Show App Tour). Forces the tour regardless
  // of install-vs-upgrade classification or a prior completion.
  const [replayRequested, setReplayRequested] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [[, tour], [, seen], [, setup], [, savedPhase]] =
          await AsyncStorage.multiGet([
            TOUR_COMPLETED_KEY,
            WHATS_NEW_SEEN_KEY,
            SETUP_COMPLETED_KEY,
            PHASE_KEY,
          ]);
        let freshInstall = false;
        try {
          const keys = await AsyncStorage.getAllKeys();
          // No deliberate-action key from a prior session ⇒ nobody has used the
          // app before ⇒ genuine fresh install.
          freshInstall = !UPGRADER_SIGNAL_KEYS.some((k) => keys.includes(k));
        } catch {
          // getAllKeys failed — assume returning user (the safer default is to
          // show the lighter What's New sheet, not the full tour, to someone
          // who may already know the app).
          freshInstall = false;
        }
        if (cancelled) return;
        const nextPhase =
          savedPhase === 'setup' || savedPhase === 'tour'
            ? savedPhase
            : savedPhase === 'done' || tour
              ? 'done'
              : setup
                ? 'tour'
                : freshInstall
                  ? 'setup'
                  : 'done';
        await AsyncStorage.setItem(PHASE_KEY, nextPhase);
        if (cancelled) return;
        setPhase(nextPhase);
        freshInstall = nextPhase !== 'done' || freshInstall;
        setTourCompletedVersion(tour ?? null);
        setWhatsNewSeenVersion(seen ?? null);
        setIsFreshInstall(freshInstall);
      } catch {
        // AsyncStorage is best-effort. On read failure, default to a fresh
        // install so the user still gets oriented — over-showing the tour is
        // friendlier than missing onboarding entirely.
        if (!cancelled) {
          setPhase('setup');
          setTourCompletedVersion(null);
          setWhatsNewSeenVersion(null);
          setIsFreshInstall(true);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markTourCompleted = useCallback(async () => {
    // Flip in-memory state FIRST (synchronously), before the awaited write, so
    // a consumer that hides on dismissal can't observe a stale "should show"
    // and bounce back open (mirrors NotificationPreferences.persistMeta).
    setPhase('done');
    setTourCompletedVersion(APP_TOUR_VERSION);
    setWhatsNewSeenVersion(APP_TOUR_VERSION);
    setReplayRequested(false);
    try {
      await AsyncStorage.multiSet([
        [PHASE_KEY, 'done'],
        [TOUR_COMPLETED_KEY, APP_TOUR_VERSION],
        [WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION],
      ]);
    } catch {
      // Persistence failure — in-memory state already updated above.
    }
  }, []);

  const markOnboardingSetupCompleted = useCallback(async () => {
    setPhase('tour');
    try {
      await AsyncStorage.multiSet([
        [SETUP_COMPLETED_KEY, APP_TOUR_VERSION],
        [PHASE_KEY, 'tour'],
      ]);
    } catch {
      /* best-effort — in-memory state already updated */
    }
  }, []);

  const markWhatsNewSeen = useCallback(async () => {
    setWhatsNewSeenVersion(APP_TOUR_VERSION);
    try {
      await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION);
    } catch {
      /* best-effort — in-memory state already updated */
    }
  }, []);

  const resetTour = useCallback(async () => {
    // Force the tour on the next render regardless of install-vs-upgrade or a
    // prior completion; clear the persisted markers so it re-shows.
    setReplayRequested(true);
    setTourCompletedVersion(null);
    setWhatsNewSeenVersion(null);
    try {
      await AsyncStorage.multiRemove([TOUR_COMPLETED_KEY, WHATS_NEW_SEEN_KEY]);
    } catch {
      /* best-effort — in-memory state already updated */
    }
  }, []);

  const value = useMemo<TourContextValue>(() => {
    const whatsNewEntry = getWhatsNewForVersion(APP_TOUR_VERSION);
    // Tour: an explicit replay, or an un-completed genuine fresh install.
    const shouldShowFirstLaunchTour =
      !isLoading &&
      (replayRequested ||
        (phase === 'tour' && tourCompletedVersion === null && isFreshInstall));
    // Setup owns the fresh-install phase; an explicit replay only re-arms the tour.
    const shouldShowOnboardingSetup =
      !isLoading && phase === 'setup' && !replayRequested;
    // What's New: a returning user on a version whose notes they haven't seen —
    // never alongside the tour, never on a fresh install (the tour covers it).
    const shouldShowWhatsNew =
      !isLoading &&
      phase === 'done' &&
      !shouldShowFirstLaunchTour &&
      whatsNewEntry !== null &&
      whatsNewSeenVersion !== APP_TOUR_VERSION;
    return {
      isLoading,
      shouldShowFirstLaunchTour,
      shouldShowOnboardingSetup,
      shouldShowWhatsNew,
      whatsNewEntry,
      markTourCompleted,
      markOnboardingSetupCompleted,
      markWhatsNewSeen,
      resetTour,
    };
  }, [
    isLoading,
    phase,
    tourCompletedVersion,
    whatsNewSeenVersion,
    isFreshInstall,
    replayRequested,
    markTourCompleted,
    markOnboardingSetupCompleted,
    markWhatsNewSeen,
    resetTour,
  ]);

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return ctx;
}
