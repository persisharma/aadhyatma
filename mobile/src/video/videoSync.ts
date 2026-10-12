/**
 * Verse sync for the docked video. A cue sheet lists, per reader page, the second
 * of the video at which that page starts being sung (index === page index), and
 * the pager shows the page of the last cue at or before the playback position.
 *
 * Exact sync needs a human-timed sheet on the mapping. Until one exists the reader
 * estimates a sheet from the text itself: each page gets a share of the video
 * proportional to its syllable count, so a doha (~40 syllables) holds the screen
 * longer than a chaupai (~23). The estimate cannot know a recording's intro music
 * or interludes, so it stays approximate — the swipe latch and Auto-scroll chip let
 * the reader take over when it drifts.
 */

/**
 * A usable sheet has exactly one finite, non-negative cue per page and strictly
 * increasing times. Anything else (a text that gained or split a verse after the
 * sheet was captured) is ignored and the reader falls back to the estimate.
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

const CONSONANT_RE = /[\u0915-\u0939\u0958-\u095F]/g;
const VOWEL_RE = /[\u0904-\u0914]/g;
const VIRAMA_RE = /\u094D/g;

/**
 * Rough sung length of a page: its Devanagari syllables (consonants + independent
 * vowels, minus viramas so a conjunct counts once). Verse numbers and dandas add
 * nothing. Floors at 1 so a non-Devanagari page still gets a slot.
 */
export function syllableWeight(lines: readonly string[]): number {
  const text = lines.join('');
  const count = (re: RegExp) => text.match(re)?.length ?? 0;
  return Math.max(1, count(CONSONANT_RE) + count(VOWEL_RE) - count(VIRAMA_RE));
}

/** Estimated cue sheet: `duration` seconds spread over the pages by weight. */
export function estimateCues(weights: readonly number[], duration: number): number[] {
  const total = weights.reduce((sum, w) => sum + w, 0);
  const cues: number[] = [];
  let acc = 0;
  for (const w of weights) {
    cues.push(total > 0 ? (acc / total) * duration : 0);
    acc += w;
  }
  return cues;
}
