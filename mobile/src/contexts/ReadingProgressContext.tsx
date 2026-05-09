import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserActivity } from '@/contexts/UserActivityContext';

const STORAGE_KEY = '@vedansh/reading-progress';

export type ReadingProgress = {
  sourceId: string;
  chapter?: number;
  verseIndex: number;
  updatedAt: number;
};

type ProgressMap = Record<string, ReadingProgress>;

type ReadingProgressContextValue = {
  progress: ProgressMap;
  getProgress: (sourceId: string) => ReadingProgress | undefined;
  setProgress: (entry: ReadingProgress) => void;
  clearProgress: (sourceId: string) => void;
};

const ReadingProgressContext = createContext<ReadingProgressContextValue>({
  progress: {},
  getProgress: () => undefined,
  setProgress: () => {},
  clearProgress: () => {},
});

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgressState] = useState<ProgressMap>({});
  const { logRead } = useUserActivity();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setProgressState(JSON.parse(raw));
        } catch {}
      }
    });
  }, []);

  const persist = useCallback((next: ProgressMap) => {
    setProgressState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const setProgress = useCallback(
    (entry: ReadingProgress) => {
      const current = progress[entry.sourceId];
      if (
        current &&
        current.chapter === entry.chapter &&
        current.verseIndex === entry.verseIndex
      ) {
        return;
      }
      persist({ ...progress, [entry.sourceId]: entry });
      logRead(entry.sourceId);
    },
    [progress, persist, logRead]
  );

  const clearProgress = useCallback(
    (sourceId: string) => {
      if (!(sourceId in progress)) return;
      const next = { ...progress };
      delete next[sourceId];
      persist(next);
    },
    [progress, persist]
  );

  const getProgress = useCallback(
    (sourceId: string) => progress[sourceId],
    [progress]
  );

  return (
    <ReadingProgressContext.Provider
      value={{ progress, getProgress, setProgress, clearProgress }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
