import manifest from './chapters-manifest.json';

export type DurgaStotramVerse = {
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

export type DurgaStotramChapterSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type DurgaStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: DurgaStotramVerse[];
  source?: DurgaStotramChapterSource;
};

export type DurgaStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const durgaStotramTitleHi = 'दुर्गा स्तोत्रम्';
export const durgaStotramTitleEn = 'Durga Stotram';

export const durgaStotramChaptersManifest: readonly DurgaStotramChapterSummary[] =
  manifest as DurgaStotramChapterSummary[];

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
const durgaStotramChaptersLoaders: readonly (() => DurgaStotramChapter)[] = [
  () => require('./chapter-01.json') as DurgaStotramChapter,
  () => require('./chapter-02.json') as DurgaStotramChapter,
  () => require('./chapter-03.json') as DurgaStotramChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const durgaStotramTotal = durgaStotramChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getDurgaStotramChapter(chapter: number): DurgaStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= durgaStotramChaptersLoaders.length) {
    throw new Error(`durga-stotram: chapter ${chapter} out of range (1-${durgaStotramChaptersLoaders.length})`);
  }
  return durgaStotramChaptersLoaders[idx]();
}

