import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@vedansh/feature-tour-seen';

export type FeatureTourContextValue = {
  /** True only after AsyncStorage has been read on app boot. */
  isReady: boolean;
  /**
   * True when the tour should be visible. On first launch this flips to true
   * once `isReady` is true and storage shows no prior dismissal. The
   * `FeatureTourModal` consumes this and the user dismisses via
   * `markTourSeen`.
   */
  isVisible: boolean;
  /**
   * Replay entry point for the More screen. Re-opens the tour without
   * mutating the persisted "seen" flag — closing still calls
   * `markTourSeen`, which is idempotent.
   */
  startTour: () => void;
  /** Persist that the user has seen (or skipped) the tour and hide the modal. */
  markTourSeen: () => Promise<void>;
};

const FeatureTourContext = createContext<FeatureTourContextValue | null>(null);

type ProviderProps = {
  children: React.ReactNode;
};

export function FeatureTourProvider({ children }: ProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored !== '1') setIsVisible(true);
      })
      .catch(() => undefined)
      .finally(() => setIsReady(true));
  }, []);

  const startTour = useCallback(() => {
    setIsVisible(true);
  }, []);

  const markTourSeen = useCallback(async () => {
    setIsVisible(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, '1');
    } catch {
      // Storage failure is non-fatal; the in-memory flag still hides the modal
      // for this session.
    }
  }, []);

  const value = useMemo<FeatureTourContextValue>(
    () => ({ isReady, isVisible, startTour, markTourSeen }),
    [isReady, isVisible, startTour, markTourSeen]
  );

  return (
    <FeatureTourContext.Provider value={value}>{children}</FeatureTourContext.Provider>
  );
}

export function useFeatureTour(): FeatureTourContextValue {
  const ctx = useContext(FeatureTourContext);
  if (!ctx) {
    throw new Error(
      'useFeatureTour must be used inside <FeatureTourProvider>. Check App.tsx wiring.'
    );
  }
  return ctx;
}
