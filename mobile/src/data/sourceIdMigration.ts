import { aartiIdByIndex } from './aarti';

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
    if (Number.isInteger(idx) && idx >= 0 && idx < aartiIdByIndex.length) {
      return aartiIdByIndex[idx];
    }
  }
  return raw;
}
