import { useEffect, useState } from 'react';
import { peekSearchIndex, warmSearchIndex, type SearchIndex } from '@/data/searchIndex';

/**
 * The search index for the Search screen, WITHOUT ever blocking it.
 *
 * Normally the background warm-up (`navigation/dataWarmups.ts`) has built the
 * index long before anyone opens Search, and this returns it on the first
 * render. If the user gets here first — within seconds of launch — it returns
 * null and takes over the same build job at a foreground pace; the screen
 * renders straight away and shows "preparing" until the index lands.
 *
 * The old path called `getSearchIndex()` in a `useMemo`: a synchronous build
 * that froze this screen for the whole remaining job.
 */

/** A full slice per tick: the user is waiting on this, but typing must still land. */
const FOREGROUND_BUDGET_MS = 12;

const LEFT_THE_SCREEN = Symbol('left-the-screen');

export function useSearchIndex(): SearchIndex | null {
  const [index, setIndex] = useState<SearchIndex | null>(peekSearchIndex);
  const [error, setError] = useState<unknown>(null);
  // A corpus that fails to index should fail loudly, as the synchronous build did.
  if (error) throw error;

  useEffect(() => {
    if (index) return undefined;
    let live = true;
    // Between slices, hand the thread back for one macrotask so keystrokes and
    // renders interleave. Leaving the screen aborts THIS loop only — the job's
    // progress is kept, and the background walk finishes it at its own pace.
    const pace = () =>
      new Promise<void>((resolve, reject) =>
        setTimeout(() => (live ? resolve() : reject(LEFT_THE_SCREEN)), 0)
      );
    warmSearchIndex(pace, FOREGROUND_BUDGET_MS).then(
      (built) => {
        if (live) setIndex(built);
      },
      (e: unknown) => {
        if (live && e !== LEFT_THE_SCREEN) setError(e);
      }
    );
    return () => {
      live = false;
    };
  }, [index]);

  return index;
}
