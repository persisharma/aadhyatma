import manifest from './chapters-manifest.json';

export type HanumanAshtakVerse = {
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

export type HanumanAshtakChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: HanumanAshtakVerse[];
};

export type HanumanAshtakChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const hanumanAshtakTitleHi = 'संकटमोचन हनुमानाष्टक';
export const hanumanAshtakTitleEn = 'Sankat Mochan Hanuman Ashtak';

export const hanumanAshtakChaptersManifest: readonly HanumanAshtakChapterSummary[] =
  manifest as HanumanAshtakChapterSummary[];

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
const hanumanAshtakChaptersLoaders: readonly (() => HanumanAshtakChapter)[] = [
  () => require('./chapter-01.json') as HanumanAshtakChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const hanumanAshtakTotal = hanumanAshtakChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getHanumanAshtakChapter(chapter: number): HanumanAshtakChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= hanumanAshtakChaptersLoaders.length) {
    throw new Error(`hanuman-ashtak: chapter ${chapter} out of range (1-${hanumanAshtakChaptersLoaders.length})`);
  }
  return hanumanAshtakChaptersLoaders[idx]();
}

