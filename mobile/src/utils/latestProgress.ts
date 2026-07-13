import type { ReadingProgress } from '@/contexts/ReadingProgressContext';

/**
 * The single most-recent reading position across every tracked source and
 * subsection — drives the Home "Continue reading" card (design.md §49).
 * Returns null when nothing has been read yet.
 */
export function latestReadingProgress(
  progress: Record<string, ReadingProgress>
): ReadingProgress | null {
  let latest: ReadingProgress | null = null;
  for (const entry of Object.values(progress)) {
    if (!latest || entry.updatedAt > latest.updatedAt) latest = entry;
  }
  return latest;
}
