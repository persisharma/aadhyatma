/**
 * Reviewed YouTube fallbacks, keyed by a text's stable content id.
 *
 * This registry is the ONLY source of a "Play video" offer. It is deliberately
 * independent of the audio catalog (`@/data/audio/tracks`): a text with no
 * recitation track can still receive a video fallback, and a text that later
 * gains a real recording keeps its recorded ▶ (the reader prefers the recording —
 * see the source-priority logic in each reader screen).
 *
 * Integrity rules (RULEBOOK — do not weaken):
 *  - A mapping only surfaces to users when `status === 'verified'`. Verification
 *    means a human watched the video end-to-end and confirmed it is the correct,
 *    COMPLETE devotional text from a legitimate (official artist/temple/publisher)
 *    upload — a matching title is NOT sufficient.
 *  - `status: 'dev-demo'` entries surface ONLY in development (`__DEV__`), never in
 *    a release. They exist to exercise the player during the build; they are not a
 *    claim of editorial review.
 *  - Never invent a video id or auto-pick a search result. Unreviewed candidates
 *    live outside this file (editorial shortlist), not here.
 */
import type { Lang } from '@/data/gita/language';
import { isValidYouTubeId } from '@/video/videoId';

export type VideoReviewStatus =
  /** Human-reviewed: correct, complete, legitimate upload. Surfaces to users. */
  | 'verified'
  /** Awaiting editorial review. Never surfaces. */
  | 'pending'
  /** Dev-only placeholder to exercise the player. Surfaces only in __DEV__. */
  | 'dev-demo';

/** The spoken/sung language of the recording itself (not the reader's UI language). */
export type SpokenLang = Lang | 'sa';

export type VideoMapping = {
  /** Stable content id — the text's `LibraryEntry.id` / reader route slug. */
  contentId: string;
  /** 11-char YouTube video id. */
  videoId: string;
  /** Video title as it should read in the player (Devanagari preferred). */
  titleHi: string;
  titleEn: string;
  /** Uploading channel, shown under the title. */
  channel: string;
  /** Canonical source url, recorded for provenance/audit. */
  sourceUrl: string;
  /** Language actually spoken/sung in the recording. */
  spokenLang: SpokenLang;
  /** ISO date (YYYY-MM-DD) the review was performed, or null when unreviewed. */
  reviewedOn: string | null;
  status: VideoReviewStatus;
  /**
   * Optional auto-scroll sync hints (see `@/video/verseSync`). Absent → the reader
   * auto-advances proportionally (drifts around the intro/pacing). Provide EITHER
   * `cues` (per-verse start seconds — exact) OR `startSec`/`endSec` (recitation
   * window — trims intro/outro). Editorial fills these per video.
   */
  cues?: readonly number[];
  startSec?: number;
  endSec?: number;
};

/**
 * The registry. Seeded with ONE dev-demo so the player can be exercised in the
 * simulator; every production mapping lands here as `verified` after editorial
 * review picks a video from the shortlist. Pending/uncovered texts are tracked in
 * the editorial report, not as disabled rows here.
 */
export const VIDEO_MAPPINGS: readonly VideoMapping[] = [
  {
    contentId: 'hanuman-chalisa',
    // T-Series official — Gulshan Kumar / Hariharan, full 9:42 recitation with
    // on-screen text; ~5.8B views (the most-viewed Hanuman Chalisa). Embeddable
    // (oEmbed-confirmed). Picked by the user 2026-10-12.
    videoId: 'AETFvQonfV8',
    titleHi: 'श्री हनुमान चालीसा — गुलशन कुमार, हरिहरन',
    titleEn: 'Shree Hanuman Chalisa — Gulshan Kumar, Hariharan',
    channel: 'T-Series Bhakti Sagar',
    sourceUrl: 'https://www.youtube.com/watch?v=AETFvQonfV8',
    spokenLang: 'hi',
    reviewedOn: '2026-10-12',
    status: 'verified',
    // Per-verse recitation start times in SECONDS, index-aligned to the 43
    // hanumanChalisaVerses (2 opening dohas, 40 chaupais, closing doha). Sourced
    // from this recording's on-screen lyric alignment and converted from the
    // supplied M:SS marks. Drives exact auto-scroll (verseSync.ts `cues` mode).
    // The video runs 582 s; recitation spans ~2 s … 570 s.
    cues: [
      2, 24, 56, 67, 83, 93, 104, 115, 131, 141, 152, 162, 178, 189, 199, 210,
      225, 231, 242, 257, 273, 284, 295, 305, 321, 332, 342, 353, 369, 379, 390,
      401, 416, 427, 437, 448, 464, 474, 485, 495, 511, 523, 540,
    ],
  },
];

/** A mapping is user-visible when verified (always) or dev-demo (dev builds only). */
export function isMappingEnabled(m: VideoMapping, isDev: boolean = __DEV__): boolean {
  if (!isValidYouTubeId(m.videoId)) return false;
  if (m.status === 'verified') return true;
  if (m.status === 'dev-demo') return isDev;
  return false;
}

/**
 * The enabled video fallback for a text, or undefined. This is the single entry
 * point readers call; it already applies the status gate, so a reader never has to
 * reason about review state.
 */
export function getVideoMapping(
  contentId: string,
  isDev: boolean = __DEV__
): VideoMapping | undefined {
  const m = VIDEO_MAPPINGS.find((x) => x.contentId === contentId);
  return m && isMappingEnabled(m, isDev) ? m : undefined;
}
