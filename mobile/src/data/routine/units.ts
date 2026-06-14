/**
 * Resolves a RoutineItem to its display metadata and computes completion.
 *
 * Completion is derived live (not stored): an item is auto-complete when the
 * reader's persisted progress shows the user reached the last verse-page of the
 * unit *today*, or — for japam — when today's round count meets the target.
 * A separate manual fallback lives in RoutineContext.
 */
import { library, type LibraryEntry } from '@/data/texts';
import { findJapamMantra } from '@/data/japam';
import { getVersePool } from '@/data/versePool';
import type { ReadingProgress } from '@/contexts/ReadingProgressContext';
import type { RoutineItem } from './types';

export type RoutineItemDisplay = {
  titleHi: string;
  titleEn: string;
  /** Short bilingual descriptor of the unit, e.g. "अध्याय 1" / "Chapter 1". */
  subHi: string;
  subEn: string;
  entry?: LibraryEntry;
};

type LastPositions = {
  /** chapter number → last (max) verseIndex in that chapter */
  chapters: Record<number, number>;
  lastChapter: number;
};

let cache: Record<string, LastPositions> | null = null;

/** Build, once, the last verse-page per chapter for every pooled source. */
function lastPositionsBySource(): Record<string, LastPositions> {
  if (cache) return cache;
  const map: Record<string, LastPositions> = {};
  for (const v of getVersePool()) {
    const ch = v.chapter ?? 1;
    const existing = map[v.sourceId] ?? { chapters: {}, lastChapter: ch };
    if (existing.chapters[ch] == null || v.verseIndex > existing.chapters[ch]) {
      existing.chapters[ch] = v.verseIndex;
    }
    if (ch > existing.lastChapter) existing.lastChapter = ch;
    map[v.sourceId] = existing;
  }
  cache = map;
  return map;
}

export function resolveRoutineItem(item: RoutineItem): RoutineItemDisplay {
  if (item.kind === 'japam') {
    const m = findJapamMantra(item.sourceId);
    const target = item.targetRounds ?? 1;
    return {
      titleHi: m?.nameHi ?? item.sourceId,
      titleEn: m?.nameEn ?? item.sourceId,
      subHi: `${target} माला`,
      subEn: `${target} mala`,
    };
  }
  const entry = library.find((e) => e.id === item.sourceId);
  const titleHi = entry?.nameHi ?? item.sourceId;
  const titleEn = entry?.nameEn ?? item.sourceId;
  if (item.kind === 'chapter' && item.chapter != null) {
    return {
      titleHi,
      titleEn,
      subHi: `अध्याय ${item.chapter}`,
      subEn: `Chapter ${item.chapter}`,
      entry,
    };
  }
  return { titleHi, titleEn, subHi: 'पूरा पाठ', subEn: 'Whole text', entry };
}

export type CompletionCtx = {
  getProgress: (sourceId: string) => ReadingProgress | undefined;
  /** Today's completed japa rounds for a mantra (from UserActivity day totals). */
  japaRoundsToday: (mantraId: string) => number;
  /** 'YYYY-MM-DD' for today, to scope reading completion to the current day. */
  todayKey: string;
  /** Maps an epoch-ms timestamp to a 'YYYY-MM-DD' key. */
  toDateKey: (d: Date) => string;
};

/** Whether the item counts as completed today via genuine reading / japa. */
export function isItemAutoComplete(item: RoutineItem, ctx: CompletionCtx): boolean {
  if (item.kind === 'japam') {
    return ctx.japaRoundsToday(item.sourceId) >= (item.targetRounds ?? 1);
  }
  const p = ctx.getProgress(item.sourceId);
  if (!p) return false;
  // Reading completion is scoped to "read today".
  if (ctx.toDateKey(new Date(p.updatedAt)) !== ctx.todayKey) return false;

  const pos = lastPositionsBySource()[item.sourceId];
  if (item.kind === 'chapter' && item.chapter != null) {
    const last = pos?.chapters[item.chapter];
    if (last == null) return false; // not a known chaptered source — manual only
    return p.chapter === item.chapter && p.verseIndex >= last;
  }
  // Whole section.
  if (pos) {
    // Chaptered source: complete when at the last verse-page of the last chapter.
    return p.chapter === pos.lastChapter && p.verseIndex >= pos.chapters[pos.lastChapter];
  }
  const entry = library.find((e) => e.id === item.sourceId);
  if (entry?.verseCount) return p.verseIndex + 1 >= entry.verseCount;
  return false;
}

/** Test seam: reset the memoised position cache. */
export function __resetUnitsCache(): void {
  cache = null;
}
