import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

/**
 * All tracked reading positions ordered most-recent first — drives the Home
 * "Continue reading" card (design.md §49), which walks the list and surfaces
 * the first entry that is still routable/visible (so a hidden or retired
 * source doesn't blank the card while older valid progress exists). The single
 * ordering implementation: "the latest entry" is `[0]` of this list.
 */
export function readingProgressByRecency(
  progress: Record<string, ReadingProgress>
): ReadingProgress[] {
  return Object.values(progress).sort((a, b) => b.updatedAt - a.updatedAt);
}
