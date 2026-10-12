/**
 * The per-chapter half of RULEBOOK §2 row 2: "every verse payload sits behind a
 * `require()` thunk ... with that chapter's invariant check run on first load".
 *
 * `gita/index.ts` does this with its own `assertChapterInvariants`; the eleven
 * other chaptered corpora share this one. It runs when a chapter is first
 * opened — never at module scope, which would force every payload back onto the
 * launch path — and each chapter object is checked once (the `WeakSet`), so
 * reopening a chapter costs nothing.
 *
 * What it cannot check is anything spanning chapters, such as verse-id
 * uniqueness across a whole corpus; that walk lives in
 * `__tests__/chapteredCorpusInvariants.test.ts`, where loading everything is free.
 */
type ChapterSummary = { chapter: number; titleHi: string; titleEn: string; verseCount: number };
type ChapterVerse = {
  id: string;
  chapter?: number;
  lines?: readonly string[];
  sanskrit?: readonly string[];
  meaningHi: string;
  meaningEn: string;
};
type ChapterPayload = ChapterSummary & { verses: readonly ChapterVerse[] };

const validated = new WeakSet<object>();

export function assertChapterMatchesManifest<C extends ChapterPayload>(
  corpus: string,
  chapter: C,
  manifestEntry: ChapterSummary | undefined,
): C {
  if (validated.has(chapter)) return chapter;
  if (!manifestEntry) {
    throw new Error(`${corpus}: chapter ${chapter.chapter} has no manifest entry`);
  }
  if (
    manifestEntry.chapter !== chapter.chapter ||
    manifestEntry.verseCount !== chapter.verseCount ||
    manifestEntry.titleHi !== chapter.titleHi ||
    manifestEntry.titleEn !== chapter.titleEn
  ) {
    throw new Error(`${corpus}: manifest entry ${manifestEntry.chapter} drifts from chapter ${chapter.chapter} payload`);
  }
  if (chapter.verses.length !== chapter.verseCount) {
    throw new Error(
      `${corpus}: chapter ${chapter.chapter} declares ${chapter.verseCount} verses but verses[] has ${chapter.verses.length}`
    );
  }
  for (const v of chapter.verses) {
    if (v.chapter !== undefined && v.chapter !== chapter.chapter) {
      throw new Error(`${corpus}: verse ${v.id} chapter mismatch (${v.chapter} vs ${chapter.chapter})`);
    }
    if ((v.lines ?? v.sanskrit ?? []).length === 0) {
      throw new Error(`${corpus}: verse '${v.id}' has no text lines`);
    }
    if (!v.meaningHi.trim() && !v.meaningEn.trim()) {
      throw new Error(`${corpus}: verse '${v.id}' has an empty meaning in both languages`);
    }
  }
  validated.add(chapter);
  return chapter;
}
