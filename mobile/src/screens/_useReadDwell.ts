import { useEffect } from 'react';
import { AppState } from 'react-native';
import { loadReadCoverage, markRead } from '@/utils/readCoverageStore';

/** How long a verse-page must stay on screen before it counts as read (design.md §84). */
export const READ_DWELL_MS = 3000;

function inForeground(): boolean {
  return AppState.currentState !== 'background' && AppState.currentState !== 'inactive';
}

/**
 * Counts the current verse-page as read once it has been on screen for
 * READ_DWELL_MS. The mark is recorded when the page is left — paging on,
 * leaving the reader, or the app going to the background — so a fast swipe
 * through a chapter marks nothing, and no timer outlives the reader. Time
 * spent in the background never counts: returning restarts the clock.
 *
 * Every reader calls this next to its setProgress effect, before any early
 * return (RULEBOOK §3 *Read coverage*). Indices outside the subsection — the
 * prev/next chapter transition cards — are ignored by the store.
 */
export function useReadDwell(sourceId: string, chapter: number | undefined, verseIndex: number): void {
  // Hydrate without subscribing: a reader only writes, so it must not
  // re-render on every mark.
  useEffect(loadReadCoverage, []);
  useEffect(() => {
    if (verseIndex < 0) return;
    let shownAt: number | null = inForeground() ? Date.now() : null;
    const settle = () => {
      if (shownAt != null && Date.now() - shownAt >= READ_DWELL_MS) markRead(sourceId, chapter, verseIndex);
      shownAt = null;
    };
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'active') shownAt = shownAt ?? Date.now();
      else settle();
    });
    return () => {
      sub.remove();
      settle();
    };
  }, [sourceId, chapter, verseIndex]);
}
