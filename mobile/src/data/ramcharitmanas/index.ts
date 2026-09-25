import manifest from './chapters-manifest.json';

export type RamcharitmanasVerse = {
  id: string;
  section: 'doha' | 'chaupai' | 'sortha' | 'chhand' | 'shloka';
  stanza: number;
  numInSection: number;
  subSuffix: string;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type RamcharitmanasChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: RamcharitmanasVerse[];
};

export type RamcharitmanasChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ramcharitmanasTitleHi = 'रामचरितमानस मंगलाचरण';
export const ramcharitmanasTitleEn = 'Ramcharitmanas Mangalacharan';

export const ramcharitmanasChaptersManifest: readonly RamcharitmanasChapterSummary[] =
  manifest as RamcharitmanasChapterSummary[];

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
const ramcharitmanasChaptersLoaders: readonly (() => RamcharitmanasChapter)[] = [
  () => require('./chapter-01.json') as RamcharitmanasChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const ramcharitmanasTotal = ramcharitmanasChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getRamcharitmanasChapter(chapter: number): RamcharitmanasChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ramcharitmanasChaptersLoaders.length) {
    throw new Error(`ramcharitmanas: chapter ${chapter} out of range (1-${ramcharitmanasChaptersLoaders.length})`);
  }
  return ramcharitmanasChaptersLoaders[idx]();
}

