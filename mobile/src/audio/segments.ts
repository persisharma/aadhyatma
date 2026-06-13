/**
 * Pure helpers for verse-anchored audio playback.
 *
 * A section ships ONE bundled recitation file plus a list of segments that map
 * each verse to a `[startMs, endMs)` slice of that file. These functions are
 * deliberately free of React / expo-audio so the boundary-advance and
 * manifest-invariant logic can be unit-tested in isolation (PRD-02 §7).
 */

export type AudioSegment = {
  /** 0-based verse index within the section, equal to the array position. */
  verseIndex: number;
  startMs: number;
  endMs: number;
};

/**
 * Which verse is playing at `ms`. Segments are contiguous and cover
 * `[0, durationMs)`, so the lookup clamps to the first/last verse outside the
 * covered range rather than returning -1.
 */
export function findVerseIndexAtMs(segments: AudioSegment[], ms: number): number {
  if (segments.length === 0) return 0;
  if (ms <= segments[0].startMs) return segments[0].verseIndex;
  for (const s of segments) {
    if (ms >= s.startMs && ms < s.endMs) return s.verseIndex;
  }
  return segments[segments.length - 1].verseIndex;
}

/** Start offset (ms) of a verse's segment; 0 if the index is unknown. */
export function segmentStartMs(segments: AudioSegment[], verseIndex: number): number {
  return segments.find((s) => s.verseIndex === verseIndex)?.startMs ?? 0;
}

export function clampVerseIndex(index: number, count: number): number {
  if (count <= 0) return 0;
  if (index < 0) return 0;
  if (index > count - 1) return count - 1;
  return index;
}

/**
 * Validate a section's segment manifest. Throws with a descriptive message on
 * the first violation. Guarantees: dense 0..n-1 verse indices, each segment
 * non-empty, starts at 0, contiguous with no gaps/overlaps, and — when
 * `durationMs` is supplied — covers the whole file exactly.
 */
export function validateSegments(segments: AudioSegment[], durationMs?: number): void {
  if (segments.length === 0) {
    throw new Error('audio segments: manifest is empty');
  }
  if (segments[0].startMs !== 0) {
    throw new Error(`audio segments: first segment must start at 0, got ${segments[0].startMs}`);
  }
  for (let i = 0; i < segments.length; i++) {
    const s = segments[i];
    if (s.verseIndex !== i) {
      throw new Error(`audio segments: index ${i} has verseIndex ${s.verseIndex} (must be dense, 0-based)`);
    }
    if (!(s.endMs > s.startMs)) {
      throw new Error(`audio segments: verse ${i} has non-positive duration (${s.startMs}–${s.endMs})`);
    }
    if (i > 0 && s.startMs !== segments[i - 1].endMs) {
      throw new Error(
        `audio segments: gap/overlap between verse ${i - 1} (ends ${segments[i - 1].endMs}) and verse ${i} (starts ${s.startMs})`
      );
    }
  }
  if (durationMs != null) {
    const last = segments[segments.length - 1];
    if (last.endMs !== durationMs) {
      throw new Error(`audio segments: last segment ends at ${last.endMs}, expected ${durationMs}`);
    }
  }
}

export function isValidSegments(segments: AudioSegment[], durationMs?: number): boolean {
  try {
    validateSegments(segments, durationMs);
    return true;
  } catch {
    return false;
  }
}
