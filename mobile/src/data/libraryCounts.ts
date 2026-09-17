/**
 * Per-category text counts for the पाठ Library screen (TRD-42 §5.3).
 *
 * `panchang/vratCatalog.getCategoryCounts()` looks similar but counts
 * *observance rules*, not library texts — they are different registries and
 * must not be confused.
 *
 * Counts what a user can actually open: `status: 'active'` and not `hidden`,
 * the same pair `HomeScreen` and `getTodayRecommendationDetails` already filter
 * on. A `coming` tile shows SOON and no number rather than a misleading 0.
 */
import { library, type ContentCategory } from '@/data/texts';

export type LibraryCounts = Partial<Record<ContentCategory, number>>;

let cached: LibraryCounts | null = null;

/**
 * Memoised: the library is a frozen bundled array, so this can only produce one
 * answer per process, and the Library screen re-renders on every language and
 * font-scale change.
 */
export function libraryCounts(): LibraryCounts {
  if (cached) return cached;
  const counts: LibraryCounts = {};
  for (const entry of library) {
    if (entry.hidden || entry.status !== 'active') continue;
    counts[entry.category] = (counts[entry.category] ?? 0) + 1;
  }
  cached = counts;
  return counts;
}

/** Test seam — the bundled library never changes at runtime. */
export function __resetLibraryCountsCache(): void {
  cached = null;
}
