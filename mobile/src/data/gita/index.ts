/* JSON chapters are produced by scripts/parse-gita.mjs from
   BhagwadGita/chapters/chapter-NN-*.md. Do not hand-edit the .json files. */

import manifest from './chapters-manifest.json';

export type GitaVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  transliteration: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
  commentaryHi: string[];
  commentaryEn: string[];
};

export type GitaChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  summaryHi?: string;
  summaryEn?: string;
  verses: GitaVerse[];
};

export type GitaChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const gitaTitleHi = 'भगवद् गीता';
export const gitaTitleEn = 'Bhagavad Gītā';

export const gitaChaptersManifest: readonly GitaChapterSummary[] =
  manifest as GitaChapterSummary[];

/**
 * The full corpus is intentionally loaded one chapter at a time — the same rule
 * `valmiki-ramayan/index.ts` follows, and for the same reason. Importing all 18
 * payloads here put **6.5 MB of JSON on the launch path**: `entryRoutes.ts`
 * needs only `gitaChaptersManifest.length`, but it is reached from
 * `notifications/deepLink.ts` at `App.tsx` module scope, so every cold start
 * materialised the whole Gītā (~5.5 MB of heap) before the first frame — and
 * then walked all 701 verses in a module-scope invariant check. Neither is
 * something Home needs to paint.
 *
 * The invariants did not go away; they moved to first load of each chapter,
 * where the data they describe actually arrives.
 */
const chapterLoaders: readonly (() => GitaChapter)[] = [
  () => require('./chapter-01.json') as GitaChapter,
  () => require('./chapter-02.json') as GitaChapter,
  () => require('./chapter-03.json') as GitaChapter,
  () => require('./chapter-04.json') as GitaChapter,
  () => require('./chapter-05.json') as GitaChapter,
  () => require('./chapter-06.json') as GitaChapter,
  () => require('./chapter-07.json') as GitaChapter,
  () => require('./chapter-08.json') as GitaChapter,
  () => require('./chapter-09.json') as GitaChapter,
  () => require('./chapter-10.json') as GitaChapter,
  () => require('./chapter-11.json') as GitaChapter,
  () => require('./chapter-12.json') as GitaChapter,
  () => require('./chapter-13.json') as GitaChapter,
  () => require('./chapter-14.json') as GitaChapter,
  () => require('./chapter-15.json') as GitaChapter,
  () => require('./chapter-16.json') as GitaChapter,
  () => require('./chapter-17.json') as GitaChapter,
  () => require('./chapter-18.json') as GitaChapter,
];

const chapterCache = new Map<number, GitaChapter>();

export function getGitaChapter(chapter: number): GitaChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= chapterLoaders.length) {
    throw new Error(`gita: chapter ${chapter} out of range (1-${chapterLoaders.length})`);
  }
  const cached = chapterCache.get(chapter);
  if (cached) return cached;
  const loaded = chapterLoaders[idx]();
  assertChapterInvariants(loaded, gitaChaptersManifest[idx]);
  chapterCache.set(chapter, loaded);
  return loaded;
}

/**
 * Everything the old module-scope walk asserted about a chapter, checked when
 * that chapter is loaded. Verse ids are `bg-<chapter>-<n>`, so uniqueness within
 * a chapter plus the id-prefix check below is the same guarantee the old
 * corpus-wide `Set` gave — without needing all 18 chapters in memory to get it.
 */
function assertChapterInvariants(c: GitaChapter, manifestEntry: GitaChapterSummary): void {
  if (c.chapter !== manifestEntry.chapter) {
    throw new Error(`gita: chapter payload says ${c.chapter}, manifest says ${manifestEntry.chapter}`);
  }
  if (c.verses.length !== c.verseCount) {
    throw new Error(
      `gita: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
    );
  }
  if (!c.titleHi.trim() || !c.titleEn.trim()) {
    throw new Error(`gita: chapter ${c.chapter} has empty title`);
  }
  if (
    manifestEntry.verseCount !== c.verseCount ||
    manifestEntry.titleHi !== c.titleHi ||
    manifestEntry.titleEn !== c.titleEn
  ) {
    throw new Error(`gita: manifest entry ${c.chapter} drifts from its chapter payload`);
  }
  const seenIds = new Set<string>();
  for (const v of c.verses) {
    if (seenIds.has(v.id)) throw new Error(`gita: duplicate verse id '${v.id}'`);
    seenIds.add(v.id);
    if (!v.id.startsWith(`bg-${c.chapter}-`)) {
      throw new Error(`gita: verse id '${v.id}' does not belong to chapter ${c.chapter}`);
    }
    if (v.chapter !== c.chapter) {
      throw new Error(`gita: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
    }
    if (v.sanskrit.length < 2) {
      throw new Error(`gita: ${v.id} has fewer than 2 Sanskrit lines`);
    }
    if (v.transliteration.length === 0) {
      throw new Error(`gita: ${v.id} transliteration empty`);
    }
    if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
      throw new Error(`gita: ${v.id} has empty meaning (hi or en)`);
    }
    if (v.commentaryHi.length === 0 && v.commentaryEn.length === 0) {
      throw new Error(`gita: ${v.id} has empty commentary in both languages`);
    }
  }
}

/**
 * Manifest-only invariants — the part that can still run at module scope,
 * because it reads 3 KB rather than 6.5 MB. The 701-verse total is now derived
 * from the manifest, which `assertChapterInvariants` pins to each payload on
 * load, so the guarantee survives the split.
 */
(function assertGitaManifestInvariants() {
  if (chapterLoaders.length !== 18) {
    throw new Error(`gita: expected 18 chapter loaders, got ${chapterLoaders.length}`);
  }
  if (gitaChaptersManifest.length !== 18) {
    throw new Error(`gita: manifest should list 18 chapters, got ${gitaChaptersManifest.length}`);
  }
  let totalVerses = 0;
  for (let i = 0; i < gitaChaptersManifest.length; i++) {
    const entry = gitaChaptersManifest[i];
    if (entry.chapter !== i + 1) {
      throw new Error(`gita: manifest entry ${i} has chapter ${entry.chapter}, expected ${i + 1}`);
    }
    if (entry.verseCount < 1) {
      throw new Error(`gita: manifest entry ${entry.chapter} has no verses`);
    }
    totalVerses += entry.verseCount;
  }
  if (totalVerses !== 701) {
    throw new Error(`gita: expected 701 total verses, got ${totalVerses}`);
  }
})();
