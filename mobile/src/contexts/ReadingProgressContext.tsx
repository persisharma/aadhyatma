import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { canonicalSourceId } from '@/data/sourceIdMigration';
import { toDateKey, useUserActivity } from '@/contexts/UserActivityContext';

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
  /** Clear every subsection's saved position for a source. */
  clearProgress: (sourceId: string) => void;
  /** Clear the saved position for a single subsection/chapter, leaving siblings intact. */
  clearChapterProgress: (sourceId: string, chapter?: number) => void;
};

const ReadingProgressContext = createContext<ReadingProgressContextValue>({
  progress: {},
  isLoading: true,
  getProgress: () => undefined,
  getChapterProgress: () => undefined,
  setProgress: () => {},
  clearProgress: () => {},
  clearChapterProgress: () => {},
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
  // Ref mirrors keep the mutators identity-stable (same pattern as
  // UserActivityContext's activityRef). Every reader screen puts setProgress
  // in its persist-effect deps, so a setProgress that depended on `progress`
  // would change identity on every write and re-run every mounted reader's
  // effect — including readers sitting unfocused in other stacks/tabs.
  const progressRef = useRef<ProgressMap>({});
  const loadingRef = useRef(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const { items, changed } = migrate(parsed);
            progressRef.current = items;
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
      .finally(() => {
        loadingRef.current = false;
        setIsLoading(false);
      });
  }, []);

  const persist = useCallback((next: ProgressMap) => {
    progressRef.current = next;
    setProgressState(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  }, []);

  const setProgress = useCallback(
    (entry: ReadingProgress) => {
      if (loadingRef.current) return;
      const current = progressRef.current;
      const key = progressKey(entry.sourceId, entry.chapter);
      const existing = current[key];
      if (existing && existing.verseIndex === entry.verseIndex) {
        if (toDateKey(new Date(existing.updatedAt)) === toDateKey(new Date(entry.updatedAt))) {
          // Same page, same day → hard no-op. Do NOT refresh `updatedAt`:
          // routine/sadhana completion and its doneAt timestamp are derived
          // LIVE from getProgress()'s max-updatedAt entry (routine/units.ts,
          // useSadhanaToday), so bumping a sibling chapter's entry on a mere
          // re-open flips which entry is "latest" and un-completes items
          // finished earlier today. (A recency-bump variant shipped briefly
          // for the retired Home continue-reading card — design.md §49.)
          return;
        }
      }
      persist({ ...current, [key]: entry });
      logRead(entry.sourceId);
    },
    [persist, logRead]
  );

  const clearProgress = useCallback(
    (sourceId: string) => {
      const current = progressRef.current;
      const sid = canonicalSourceId(sourceId);
      const keys = Object.keys(current).filter((k) => current[k].sourceId === sid);
      if (keys.length === 0) return;
      const next = { ...current };
      for (const k of keys) delete next[k];
      persist(next);
    },
    [persist]
  );

  const clearChapterProgress = useCallback(
    (sourceId: string, chapter?: number) => {
      const current = progressRef.current;
      const key = progressKey(canonicalSourceId(sourceId), chapter);
      if (!(key in current)) return;
      const next = { ...current };
      delete next[key];
      persist(next);
    },
    [persist]
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
      value={{ progress, isLoading, getProgress, getChapterProgress, setProgress, clearProgress, clearChapterProgress }}
    >
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  return useContext(ReadingProgressContext);
}
