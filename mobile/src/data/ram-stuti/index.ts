import manifest from './chapters-manifest.json';
import { assertChapterMatchesManifest } from '../chapterInvariants';

export type RamStutiVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type RamStutiChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: RamStutiVerse[];
};

export type RamStutiChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ramStutiTitleHi = 'राम स्तुति';
export const ramStutiTitleEn = 'Ram Stuti';

export const ramStutiChaptersManifest: readonly RamStutiChapterSummary[] =
  manifest as RamStutiChapterSummary[];

/**
 * Chapter payloads behind `require()` thunks — the launch path must be able
 * to read this corpus's MANIFEST (title, verse count) without evaluating its
 * verses. `routine/chapters.ts` and `texts.ts` do exactly that, and importing
 * the payloads here put the whole corpus on every cold start.
 *
 * Same shape as `gita/index.ts`. Metro caches each module, so repeat reads of
 * a chapter are free; the first read of each pays once.
 */
/* eslint-disable @typescript-eslint/no-require-imports */
const ramStutiChaptersLoaders: readonly (() => RamStutiChapter)[] = [
  () => require('./chapter-01.json') as RamStutiChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const ramStutiTotal = ramStutiChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getRamStutiChapter(chapter: number): RamStutiChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ramStutiChaptersLoaders.length) {
    throw new Error(`ram-stuti: chapter ${chapter} out of range (1-${ramStutiChaptersLoaders.length})`);
  }
  return assertChapterMatchesManifest('ram-stuti', ramStutiChaptersLoaders[idx](), ramStutiChaptersManifest[idx]);
}

