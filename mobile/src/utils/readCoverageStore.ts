import { useMemo, useSyncExternalStore } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  EMPTY_COVERAGE,
  backfillFromProgress,
  findFirstUnread,
  getChapterCoverage,
  getSourceCoverage,
  isVerseRead,
  markVerseRead,
  parseCoverage,
  resetChapterCoverage,
  resetSourceCoverage,
  restoreCoverage,
  type CoverageSnapshot,
  type CoverageState,
} from '@/data/readCoverage';

// ── The read-coverage store ─────────────────────────────────────────────────
// A module-level store rather than an App-level provider: nothing on the first
// frame needs it (the launch graph has no room to spare), so it hydrates the
// first time a reader, chapter list or library card asks for it. Consumed via
// `useSyncExternalStore`, the same shape as `panchangPrefs`' calendar system.

const STORAGE_KEY = '@vedansh/read-coverage';
/** ReadingProgressContext's key — read once, to seed installs that predate coverage. */
const PROGRESS_STORAGE_KEY = '@vedansh/reading-progress';

type Phase = 'idle' | 'loading' | 'ready';

let snapshot: { state: CoverageState; phase: Phase } = { state: EMPTY_COVERAGE, phase: 'idle' };
const listeners = new Set<() => void>();

function set(next: Partial<typeof snapshot>): void {
  snapshot = { ...snapshot, ...next };
  listeners.forEach((listener) => listener());
}

function commit(next: CoverageState): void {
  if (next === snapshot.state) return;
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
  set({ state: next });
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  loadReadCoverage();
  return () => {
    listeners.delete(onStoreChange);
  };
}

const getSnapshot = () => snapshot;

/**
 * Hydrate once per process. An install with nothing stored yet is seeded from
 * the saved reading positions (`backfillFromProgress`) and the seed persisted,
 * so it happens exactly once.
 */
export function loadReadCoverage(): void {
  if (snapshot.phase !== 'idle') return;
  set({ phase: 'loading' });
  AsyncStorage.getItem(STORAGE_KEY)
    .then(async (raw) => {
      if (raw != null) {
        let state = EMPTY_COVERAGE;
        try {
          state = parseCoverage(JSON.parse(raw));
        } catch {
          /* corrupted JSON — start empty rather than re-seeding over it */
        }
        set({ state, phase: 'ready' });
        return;
      }
      let entries: { sourceId: string; chapter?: number; verseIndex: number; updatedAt: number }[] = [];
      try {
        const progress = JSON.parse((await AsyncStorage.getItem(PROGRESS_STORAGE_KEY)) ?? '{}');
        if (progress && typeof progress === 'object') entries = Object.values(progress);
      } catch {
        /* unreadable positions — nothing to seed from */
      }
      set({ phase: 'ready' });
      commit(backfillFromProgress(entries.filter((e) => e && typeof e.sourceId === 'string')));
    })
    .catch(() => set({ phase: 'ready' }));
}

/** Record a verse-page as read. Dropped until hydrated — callers gate it on the dwell rule. */
export function markRead(sourceId: string, chapter: number | undefined, verseIndex: number): void {
  if (snapshot.phase !== 'ready') return;
  commit(markVerseRead(snapshot.state, sourceId, chapter, verseIndex, Date.now()).state);
}

/** Clear one subsection's read marks (the पाठ count is untouched); returns what an undo needs. */
export function resetChapter(sourceId: string, chapter?: number): CoverageSnapshot {
  const { state, snapshot: removed } = resetChapterCoverage(snapshot.state, sourceId, chapter);
  commit(state);
  return removed;
}

/** Clear every subsection's read marks for a source (the पाठ count is untouched). */
export function resetSource(sourceId: string): CoverageSnapshot {
  const { state, snapshot: removed } = resetSourceCoverage(snapshot.state, sourceId);
  commit(state);
  return removed;
}

export function restore(removed: CoverageSnapshot): void {
  commit(restoreCoverage(snapshot.state, removed));
}

/** Test seam: forget everything, as on a fresh launch. */
export function __resetReadCoverageStore(): void {
  snapshot = { state: EMPTY_COVERAGE, phase: 'idle' };
  listeners.clear();
}

/** Read-side view of the store (design.md §84). Re-renders when coverage changes. */
export function useReadCoverage() {
  const { state, phase } = useSyncExternalStore(subscribe, getSnapshot);
  return useMemo(
    () => ({
      isLoading: phase !== 'ready',
      getSourceCoverage: (sourceId: string) => getSourceCoverage(state, sourceId),
      getChapterCoverage: (sourceId: string, chapter?: number) => getChapterCoverage(state, sourceId, chapter),
      isVerseRead: (sourceId: string, chapter: number | undefined, verseIndex: number) =>
        isVerseRead(state, sourceId, chapter, verseIndex),
      firstUnread: (sourceId: string, fromChapter?: number) => findFirstUnread(state, sourceId, fromChapter),
    }),
    [state, phase]
  );
}
