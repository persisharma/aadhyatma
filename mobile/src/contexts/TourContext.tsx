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

type TourContextValue = {
  isLoading: boolean;
  /** First-launch tour should be shown right now. */
  shouldShowFirstLaunchTour: boolean;
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
  /** Marks the what's-new modal seen for the current version. */
  markWhatsNewSeen: () => Promise<void>;
  /** Resets the tour state so it shows again — surface this if we want a "Show tour again" affordance. */
  resetTour: () => Promise<void>;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [tourCompletedVersion, setTourCompletedVersion] = useState<string | null>(null);
  const [whatsNewSeenVersion, setWhatsNewSeenVersion] = useState<string | null>(null);
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
        const [[, tour], [, seen]] = await AsyncStorage.multiGet([
          TOUR_COMPLETED_KEY,
          WHATS_NEW_SEEN_KEY,
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
        setTourCompletedVersion(tour ?? null);
        setWhatsNewSeenVersion(seen ?? null);
        setIsFreshInstall(freshInstall);
      } catch {
        // AsyncStorage is best-effort. On read failure, default to a fresh
        // install so the user still gets oriented — over-showing the tour is
        // friendlier than missing onboarding entirely.
        if (!cancelled) {
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
    setTourCompletedVersion(APP_TOUR_VERSION);
    setWhatsNewSeenVersion(APP_TOUR_VERSION);
    setReplayRequested(false);
    try {
      await AsyncStorage.multiSet([
        [TOUR_COMPLETED_KEY, APP_TOUR_VERSION],
        [WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION],
      ]);
    } catch {
      // Persistence failure — in-memory state already updated above.
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
      !isLoading && (replayRequested || (tourCompletedVersion === null && isFreshInstall));
    // What's New: a returning user on a version whose notes they haven't seen —
    // never alongside the tour, never on a fresh install (the tour covers it).
    const shouldShowWhatsNew =
      !isLoading &&
      !shouldShowFirstLaunchTour &&
      whatsNewEntry !== null &&
      whatsNewSeenVersion !== APP_TOUR_VERSION;
    return {
      isLoading,
      shouldShowFirstLaunchTour,
      shouldShowWhatsNew,
      whatsNewEntry,
      markTourCompleted,
      markWhatsNewSeen,
      resetTour,
    };
  }, [
    isLoading,
    tourCompletedVersion,
    whatsNewSeenVersion,
    isFreshInstall,
    replayRequested,
    markTourCompleted,
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
