import manifest from './chapters-manifest.json';

export type ShivaStrotamVerse = {
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

export type ShivaStrotamChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: ShivaStrotamVerse[];
};

export type ShivaStrotamChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const shivaStrotamTitleHi = 'शिव स्तोत्रम्';
export const shivaStrotamTitleEn = 'Shiva Stotram';

export const shivaStrotamChaptersManifest: readonly ShivaStrotamChapterSummary[] =
  manifest as ShivaStrotamChapterSummary[];

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
const shivaStrotamChaptersLoaders: readonly (() => ShivaStrotamChapter)[] = [
  () => require('./chapter-01.json') as ShivaStrotamChapter,
  () => require('./chapter-02.json') as ShivaStrotamChapter,
  () => require('./chapter-03.json') as ShivaStrotamChapter,
  () => require('./chapter-04.json') as ShivaStrotamChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const shivaStrotamTotal = shivaStrotamChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getShivaStrotamChapter(chapter: number): ShivaStrotamChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= shivaStrotamChaptersLoaders.length) {
    throw new Error(`shiva-strotam: chapter ${chapter} out of range (1-${shivaStrotamChaptersLoaders.length})`);
  }
  return shivaStrotamChaptersLoaders[idx]();
}

