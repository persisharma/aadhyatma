import manifest from './chapters-manifest.json';

export type GaneshStotramVerse = {
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

export type GaneshStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: GaneshStotramVerse[];
};

export type GaneshStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ganeshStotramTitleHi = 'गणेश स्तोत्रम्';
export const ganeshStotramTitleEn = 'Ganesh Stotram';

export const ganeshStotramChaptersManifest: readonly GaneshStotramChapterSummary[] =
  manifest as GaneshStotramChapterSummary[];

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
const ganeshStotramChaptersLoaders: readonly (() => GaneshStotramChapter)[] = [
  () => require('./chapter-01.json') as GaneshStotramChapter,
  () => require('./chapter-02.json') as GaneshStotramChapter,
  () => require('./chapter-03.json') as GaneshStotramChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const ganeshStotramTotal = ganeshStotramChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getGaneshStotramChapter(chapter: number): GaneshStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ganeshStotramChaptersLoaders.length) {
    throw new Error(`ganesh-stotram: chapter ${chapter} out of range (1-${ganeshStotramChaptersLoaders.length})`);
  }
  return ganeshStotramChaptersLoaders[idx]();
}

