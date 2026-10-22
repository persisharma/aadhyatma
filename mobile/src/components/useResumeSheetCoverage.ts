import type { LibraryEntry } from '@/data/texts';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import { navigateToEntryStart, navigateToProgress } from '@/navigation/entryRoutes';
import { formatLocation } from '@/utils/formatLocation';
import { useReadCoverage } from '@/utils/readCoverageStore';

type Nav = Parameters<typeof navigateToProgress>[0];

/** The optional ResumeReadingSheet props this hook fills in. */
export type ResumeSheetCoverage = {
  coverageHi?: string;
  coverageEn?: string;
  coveragePct?: number;
  nextUnreadHi?: string;
  nextUnreadEn?: string;
  onNextUnread?: () => void;
  onAllChapters?: () => void;
};

/**
 * The read-coverage additions to ResumeReadingSheet (design.md §84), shared by
 * every listing that opens the sheet: how much of the resumed subsection and
 * of the whole text is read, a jump to the first unread verse, and a way into
 * the subsection list. `close` runs before any navigation (mark seen + hide).
 */
export function useResumeSheetCoverage(
  entry: LibraryEntry | null,
  progress: ReadingProgress | undefined,
  navigation: Nav,
  close: () => void
): ResumeSheetCoverage {
  const { getSourceCoverage, getChapterCoverage, firstUnread } = useReadCoverage();
  if (!entry || !progress) return {};
  const source = getSourceCoverage(entry.id);
  if (!source) return {};

  const onAllChapters = source.hasChapters
    ? () => {
        close();
        navigateToEntryStart(navigation, entry);
      }
    : undefined;
  if (source.read === 0 && source.paath === 0) return { onAllChapters };

  const paathHi = source.paath > 0 ? ` · ${source.paath} पाठ` : '';
  const paathEn = source.paath > 0 ? ` · ${source.paath} ${source.paath === 1 ? 'reading' : 'readings'}` : '';
  const chapter = source.hasChapters ? getChapterCoverage(entry.id, progress.chapter) : null;
  const coverage = chapter
    ? {
        coverageHi: `इस भाग में ${chapter.read} / ${chapter.total} पठित · कुल ${source.pct}%${paathHi}`,
        coverageEn: `${chapter.read} / ${chapter.total} read here · ${source.pct}% overall${paathEn}`,
        coveragePct: (chapter.read / chapter.total) * 100,
      }
    : {
        coverageHi: `${source.read} / ${source.total} पठित${paathHi}`,
        coverageEn: `${source.read} / ${source.total} read${paathEn}`,
        coveragePct: source.pct,
      };

  // Offer the jump only when it goes somewhere Resume does not.
  const unread = source.read > 0 ? firstUnread(entry.id, progress.chapter) : null;
  const target: ReadingProgress | null = unread
    ? {
        sourceId: progress.sourceId,
        chapter: progress.chapter != null ? unread.chapter : undefined,
        verseIndex: unread.verseIndex,
        updatedAt: Date.now(),
      }
    : null;
  const sameAsResume =
    !target || ((target.chapter ?? 1) === (progress.chapter ?? 1) && target.verseIndex === progress.verseIndex);
  const next =
    target && !sameAsResume
      ? (() => {
          const where = formatLocation(target);
          return {
            nextUnreadHi: where.hi,
            nextUnreadEn: where.en,
            onNextUnread: () => {
              close();
              navigateToProgress(navigation, target);
            },
          };
        })()
      : {};

  return { ...coverage, ...next, onAllChapters };
}
