/**
 * Which नया feature cards this user has already opened (TRD-42 §4).
 *
 * Deliberately separate from `NewContentContext`: that one tracks *content*
 * (texts and temples, keyed by discoverable id) and answers "is this reading
 * new". This one tracks *features*, is keyed by `FeatureFeedEntry.id`, and
 * answers "has this user been shown this door yet". Folding them together would
 * mean one storage blob whose two halves invalidate on different events.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FEATURE_FEED,
  pendingFeatures,
  seedSeenForFreshInstall,
  type FeatureFeedEntry,
} from '@/data/home/featureFeed';
import { APP_TOUR_VERSION } from '@/data/tour/whatsNew';
import { UPGRADER_SIGNAL_KEYS } from '@/contexts/NewContentContext';

const STORAGE_KEY = '@vedansh/feature-seen';

type SeenMap = Record<string, string>;

type FeatureSeenValue = {
  isLoading: boolean;
  /** At most three, newest first, already filtered by what was opened. */
  pending: FeatureFeedEntry[];
  markFeatureSeen: (id: string) => void;
};

const FeatureSeenContext = createContext<FeatureSeenValue>({
  isLoading: true,
  pending: [],
  markFeatureSeen: () => undefined,
});

export function FeatureSeenProvider({ children }: { children: React.ReactNode }) {
  const [seen, setSeen] = useState<SeenMap>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as unknown;
          if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            if (!cancelled) setSeen(parsed as SeenMap);
            return;
          }
        }
        // No map yet. A returning user gets an empty one, so every feature that
        // shipped since their last version surfaces. A fresh install gets a
        // full seed, because nothing can be "new" to someone seeing the app for
        // the first time — they get the tour instead (featureFeed §4.1).
        let isUpgrader = false;
        try {
          const keys = await AsyncStorage.getAllKeys();
          isUpgrader = UPGRADER_SIGNAL_KEYS.some((k) => keys.includes(k));
        } catch {
          isUpgrader = false;
        }
        const initial = isUpgrader ? {} : seedSeenForFreshInstall(APP_TOUR_VERSION);
        if (!cancelled) setSeen(initial);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial)).catch(() => undefined);
      } catch {
        // Storage unreadable: treat everything as seen. An empty map would
        // advertise every feature to a user who may have opened them all —
        // the opposite of the safe fallback, and the same stance
        // NewContentContext takes on a failed read.
        if (!cancelled) setSeen(seedSeenForFreshInstall(APP_TOUR_VERSION));
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const markFeatureSeen = useCallback((id: string) => {
    // In-memory first, then the awaited write — a card that hides on tap must
    // not read a stale map on the next render and reappear. Same order as
    // TourContext.markTourCompleted and NotificationPreferences.persistMeta.
    setSeen((prev) => {
      if (prev[id] !== undefined) return prev;
      const next = { ...prev, [id]: APP_TOUR_VERSION };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const pending = isLoading ? [] : pendingFeatures(seen, APP_TOUR_VERSION, FEATURE_FEED);

  return (
    <FeatureSeenContext.Provider value={{ isLoading, pending, markFeatureSeen }}>
      {children}
    </FeatureSeenContext.Provider>
  );
}

export function useFeatureSeen() {
  return useContext(FeatureSeenContext);
}
