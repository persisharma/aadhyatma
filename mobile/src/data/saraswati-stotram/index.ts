import manifest from './chapters-manifest.json';

export type SaraswatiStotramVerse = {
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

export type SaraswatiStotramChapterSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type SaraswatiStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: SaraswatiStotramVerse[];
  source?: SaraswatiStotramChapterSource;
};

export type SaraswatiStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const saraswatiStotramTitleHi = 'सरस्वती स्तोत्रम्';
export const saraswatiStotramTitleEn = 'Saraswati Stotram';

export const saraswatiStotramChaptersManifest: readonly SaraswatiStotramChapterSummary[] =
  manifest as SaraswatiStotramChapterSummary[];

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
const saraswatiStotramChaptersLoaders: readonly (() => SaraswatiStotramChapter)[] = [
  () => require('./chapter-01.json') as SaraswatiStotramChapter,
  () => require('./chapter-02.json') as SaraswatiStotramChapter,
  () => require('./chapter-03.json') as SaraswatiStotramChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const saraswatiStotramTotal = saraswatiStotramChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getSaraswatiStotramChapter(chapter: number): SaraswatiStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= saraswatiStotramChaptersLoaders.length) {
    throw new Error(`saraswati-stotram: chapter ${chapter} out of range (1-${saraswatiStotramChaptersLoaders.length})`);
  }
  return saraswatiStotramChaptersLoaders[idx]();
}

