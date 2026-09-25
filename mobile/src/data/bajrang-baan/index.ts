import manifest from './chapters-manifest.json';

export type BajrangBaanVerse = {
  id: string;
  chapter: number;
  number: number;
  section: 'doha' | 'chhand';
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type BajrangBaanChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: BajrangBaanVerse[];
};

export type BajrangBaanChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const bajrangBaanTitleHi = 'बजरंग बाण';
export const bajrangBaanTitleEn = 'Bajrang Baan';

export const bajrangBaanChaptersManifest: readonly BajrangBaanChapterSummary[] =
  manifest as BajrangBaanChapterSummary[];

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
const bajrangBaanChaptersLoaders: readonly (() => BajrangBaanChapter)[] = [
  () => require('./bajrang-baan.json') as BajrangBaanChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const bajrangBaanTotal = bajrangBaanChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getBajrangBaanChapter(chapter: number): BajrangBaanChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= bajrangBaanChaptersLoaders.length) {
    throw new Error(`bajrang-baan: chapter ${chapter} out of range (1-${bajrangBaanChaptersLoaders.length})`);
  }
  return bajrangBaanChaptersLoaders[idx]();
}

