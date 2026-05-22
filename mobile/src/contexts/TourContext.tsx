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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [tour, seen] = await AsyncStorage.multiGet([
          TOUR_COMPLETED_KEY,
          WHATS_NEW_SEEN_KEY,
        ]);
        if (cancelled) return;
        setTourCompletedVersion(tour[1] ?? null);
        setWhatsNewSeenVersion(seen[1] ?? null);
      } catch {
        // AsyncStorage is best-effort. On read failure, default to "never
        // seen" so the user gets the tour — over-showing is friendlier than
        // missing it entirely on first install.
        if (!cancelled) {
          setTourCompletedVersion(null);
          setWhatsNewSeenVersion(null);
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
    try {
      await AsyncStorage.multiSet([
        [TOUR_COMPLETED_KEY, APP_TOUR_VERSION],
        [WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION],
      ]);
    } catch {
      // Persistence failure — still update in-memory so we don't loop the
      // tour within this session.
    }
    setTourCompletedVersion(APP_TOUR_VERSION);
    setWhatsNewSeenVersion(APP_TOUR_VERSION);
  }, []);

  const markWhatsNewSeen = useCallback(async () => {
    try {
      await AsyncStorage.setItem(WHATS_NEW_SEEN_KEY, APP_TOUR_VERSION);
    } catch {
      /* best-effort */
    }
    setWhatsNewSeenVersion(APP_TOUR_VERSION);
  }, []);

  const resetTour = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([TOUR_COMPLETED_KEY, WHATS_NEW_SEEN_KEY]);
    } catch {
      /* best-effort */
    }
    setTourCompletedVersion(null);
    setWhatsNewSeenVersion(null);
  }, []);

  const value = useMemo<TourContextValue>(() => {
    const whatsNewEntry = getWhatsNewForVersion(APP_TOUR_VERSION);
    const shouldShowFirstLaunchTour = !isLoading && tourCompletedVersion === null;
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
