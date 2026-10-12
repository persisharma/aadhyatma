/**
 * Verse sync for the docked video. A cue sheet lists, per reader page, the second
 * of the video at which that page starts being sung (index === page index). The
 * pager follows the sheet; there is deliberately no proportional fallback — a
 * recording's intro music, slower dohas and interludes make "fraction of video ≈
 * fraction of text" drift by several verses, and a pager that swipes to the wrong
 * verse is worse than one that waits for the reader's hand.
 */

/**
 * A usable sheet has exactly one finite, non-negative cue per page and strictly
 * increasing times. Anything else (a text that gained or split a verse after the
 * sheet was captured) disables auto-advance rather than mis-syncing.
 */
export function isValidCueSheet(cues: readonly number[] | undefined, pageCount: number): cues is readonly number[] {
  if (!cues || pageCount <= 0 || cues.length !== pageCount) return false;
  for (let i = 0; i < cues.length; i += 1) {
    const c = cues[i];
    if (!Number.isFinite(c) || c < 0) return false;
    if (i > 0 && c <= cues[i - 1]) return false;
  }
  return true;
}

/** The page being sung at `seconds`: the last cue at or before it (page 0 before the first cue). */
export function pageAtTime(cues: readonly number[], seconds: number): number {
  let lo = 0;
  let hi = cues.length - 1;
  let page = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (cues[mid] <= seconds) {
      page = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return page;
}
