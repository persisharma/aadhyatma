import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalSourceId } from '@/data/sourceIdMigration';
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
  isLoading: boolean;
  getProgress: (sourceId: string) => ReadingProgress | undefined;
  setProgress: (entry: ReadingProgress) => void;
  clearProgress: (sourceId: string) => void;
};

const ReadingProgressContext = createContext<ReadingProgressContextValue>({
  progress: {},
  isLoading: true,
  getProgress: () => undefined,
  setProgress: () => {},
  clearProgress: () => {},
});

function migrate(map: unknown): { items: ProgressMap; changed: boolean } {
  if (!map || typeof map !== 'object' || Array.isArray(map)) return { items: {}, changed: false };
  let changed = false;
  const items: ProgressMap = {};
  for (const [key, value] of Object.entries(map as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') {
      changed = true;
      continue;
    }
    const entry = value as ReadingProgress;
    const canonicalKey = canonicalSourceId(key);
    const canonicalEntry =
      canonicalSourceId(entry.sourceId) === entry.sourceId
        ? entry
        : { ...entry, sourceId: canonicalSourceId(entry.sourceId) };
    if (canonicalKey !== key || canonicalEntry !== entry) {
      changed = true;
    }
    // If both legacy and canonical exist for the same source, keep the more recent one.
    const existing = items[canonicalKey];
    if (!existing || existing.updatedAt < canonicalEntry.updatedAt) {
      items[canonicalKey] = { ...canonicalEntry, sourceId: canonicalKey };
    }
  }
  return { items, changed };
}

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgressState] = useState<ProgressMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const { logRead } = useUserActivity();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const { items, changed } = migrate(parsed);
            setProgressState(items);
            if (changed) {
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => undefined);
            }
          } catch {
            /* corrupted JSON — leave empty */
          }
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
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
      value={{ progress, isLoading, getProgress, setProgress, clearProgress }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
