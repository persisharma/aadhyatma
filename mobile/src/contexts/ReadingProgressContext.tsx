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
  /** Latest position across all subsections of a source (drives the book-level resume sheet). */
  getProgress: (sourceId: string) => ReadingProgress | undefined;
  /** Saved position within a specific subsection/chapter (drives subsection auto-jump). */
  getChapterProgress: (sourceId: string, chapter?: number) => ReadingProgress | undefined;
  setProgress: (entry: ReadingProgress) => void;
  clearProgress: (sourceId: string) => void;
};

const ReadingProgressContext = createContext<ReadingProgressContextValue>({
  progress: {},
  isLoading: true,
  getProgress: () => undefined,
  getChapterProgress: () => undefined,
  setProgress: () => {},
  clearProgress: () => {},
});

/**
 * Storage key for a progress entry. Chaptered sources are tracked per
 * subsection (`<sourceId>::<chapter>`) so each chapter keeps its own resume
 * position; sources without chapters keep a single entry under `<sourceId>`.
 */
function progressKey(sourceId: string, chapter?: number): string {
  return typeof chapter === 'number' ? `${sourceId}::${chapter}` : sourceId;
}

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
    const sid = canonicalSourceId(entry.sourceId);
    const canonicalEntry = sid === entry.sourceId ? entry : { ...entry, sourceId: sid };
    // Re-key to the per-subsection composite key. Legacy stores keyed entries
    // by bare sourceId (one position per book); migrate them to `<sourceId>::<chapter>`.
    const newKey = progressKey(sid, canonicalEntry.chapter);
    if (newKey !== key || canonicalEntry !== entry) {
      changed = true;
    }
    // If two entries collapse to the same key (e.g. legacy + canonical sourceId,
    // or a duplicate), keep the more recent one.
    const existing = items[newKey];
    if (!existing || existing.updatedAt < canonicalEntry.updatedAt) {
      items[newKey] = canonicalEntry;
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
      if (isLoading) return;
      const key = progressKey(entry.sourceId, entry.chapter);
      const current = progress[key];
      if (current && current.verseIndex === entry.verseIndex) {
        return;
      }
      persist({ ...progress, [key]: entry });
      logRead(entry.sourceId);
    },
    [isLoading, progress, persist, logRead]
  );

  const clearProgress = useCallback(
    (sourceId: string) => {
      const sid = canonicalSourceId(sourceId);
      const keys = Object.keys(progress).filter((k) => progress[k].sourceId === sid);
      if (keys.length === 0) return;
      const next = { ...progress };
      for (const k of keys) delete next[k];
      persist(next);
    },
    [progress, persist]
  );

  const getProgress = useCallback(
    (sourceId: string) => {
      const sid = canonicalSourceId(sourceId);
      let latest: ReadingProgress | undefined;
      for (const entry of Object.values(progress)) {
        if (entry.sourceId !== sid) continue;
        if (!latest || entry.updatedAt > latest.updatedAt) latest = entry;
      }
      return latest;
    },
    [progress]
  );

  const getChapterProgress = useCallback(
    (sourceId: string, chapter?: number) =>
      progress[progressKey(canonicalSourceId(sourceId), chapter)],
    [progress]
  );

  return (
    <ReadingProgressContext.Provider
      value={{ progress, isLoading, getProgress, getChapterProgress, setProgress, clearProgress }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
