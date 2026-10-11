import { aartiIdByIndex } from './aarti';

/**
 * How many aartis existed while the legacy `aarti-N` form was being written.
 * Frozen: aartis appended since (index 8 = `om-jai-lakshmi-mata`, 1.5.0) never
 * had a legacy id, so a stored `aarti-8` is not a real reference to them and
 * must keep falling through unchanged rather than silently resolve.
 */
const LEGACY_AARTI_INDEX_COUNT = 8;

/**
 * Normalize a stored sourceId to its canonical form.
 *
 * Legacy bookmarks/progress saved aartis as `aarti-N` (where N is the index).
 * The canonical form is the aarti's library id (e.g. `om-jai-jagdish`).
 *
 * Returns the input unchanged if it does not match a legacy pattern.
 */
export function canonicalSourceId(raw: string): string {
  const aartiMatch = /^aarti-(\d+)$/.exec(raw);
  if (aartiMatch) {
    const idx = Number(aartiMatch[1]);
    if (Number.isInteger(idx) && idx >= 0 && idx < Math.min(LEGACY_AARTI_INDEX_COUNT, aartiIdByIndex.length)) {
      return aartiIdByIndex[idx];
    }
  }
  return raw;
}

/**
 * Normalize a legacy bookmark id to its canonical form. Aarti bookmarks were
 * stored as `aarti:<index>:<verse>`; the canonical form mirrors the new write
 * path used by `AartiReaderScreen` — `<canonicalSourceId>:<verse>`.
 *
 * Without this, a migrated bookmark's `sourceId` would point at the right
 * aarti but its `id` would still match the legacy `aarti:N:M` pattern, so
 * `isBookmarked('<canonical>:M')` from the new reader returns false and the
 * verse appears unbookmarked.
 */
export function canonicalBookmarkId(rawId: string, canonicalSource: string): string {
  const aartiMatch = /^aarti:(\d+):(\d+)$/.exec(rawId);
  if (aartiMatch) {
    return `${canonicalSource}:${aartiMatch[2]}`;
  }
  return rawId;
}
