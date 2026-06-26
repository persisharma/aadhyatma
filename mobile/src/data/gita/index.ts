/* JSON chapters are produced by scripts/parse-gita.mjs from
   BhagwadGita/chapters/chapter-NN-*.md. Do not hand-edit the .json files. */

import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';
import ch04 from './chapter-04.json';
import ch05 from './chapter-05.json';
import ch06 from './chapter-06.json';
import ch07 from './chapter-07.json';
import ch08 from './chapter-08.json';
import ch09 from './chapter-09.json';
import ch10 from './chapter-10.json';
import ch11 from './chapter-11.json';
import ch12 from './chapter-12.json';
import ch13 from './chapter-13.json';
import ch14 from './chapter-14.json';
import ch15 from './chapter-15.json';
import ch16 from './chapter-16.json';
import ch17 from './chapter-17.json';
import ch18 from './chapter-18.json';

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

export const gitaChapters: readonly GitaChapter[] = [
  ch01 as GitaChapter,
  ch02 as GitaChapter,
  ch03 as GitaChapter,
  ch04 as GitaChapter,
  ch05 as GitaChapter,
  ch06 as GitaChapter,
  ch07 as GitaChapter,
  ch08 as GitaChapter,
  ch09 as GitaChapter,
  ch10 as GitaChapter,
  ch11 as GitaChapter,
  ch12 as GitaChapter,
  ch13 as GitaChapter,
  ch14 as GitaChapter,
  ch15 as GitaChapter,
  ch16 as GitaChapter,
  ch17 as GitaChapter,
  ch18 as GitaChapter,
];

export function getGitaChapter(chapter: number): GitaChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= gitaChapters.length) {
    throw new Error(`gita: chapter ${chapter} out of range (1-18)`);
  }
  return gitaChapters[idx];
}

(function assertGitaInvariants() {
  if (gitaChapters.length !== 18) {
    throw new Error(`gita: expected 18 chapters, got ${gitaChapters.length}`);
  }
  if (gitaChaptersManifest.length !== 18) {
    throw new Error(`gita: manifest should list 18 chapters, got ${gitaChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < gitaChapters.length; i++) {
    const c = gitaChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`gita: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `gita: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    if (!c.titleHi.trim() || !c.titleEn.trim()) {
      throw new Error(`gita: chapter ${c.chapter} has empty title`);
    }
    const manifestEntry = gitaChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`gita: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`gita: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
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
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 701) {
    throw new Error(`gita: expected 701 total verses, got ${totalVerses}`);
  }
})();
