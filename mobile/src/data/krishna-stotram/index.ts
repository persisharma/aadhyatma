import manifest from './chapters-manifest.json';
import { assertChapterMatchesManifest } from '../chapterInvariants';

export type KrishnaStotramVerse = {
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

export type KrishnaStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: KrishnaStotramVerse[];
};

export type KrishnaStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const krishnaStotramTitleHi = 'कृष्ण स्तोत्रम्';
export const krishnaStotramTitleEn = 'Krishna Stotram';

export const krishnaStotramChaptersManifest: readonly KrishnaStotramChapterSummary[] =
  manifest as KrishnaStotramChapterSummary[];

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
const krishnaStotramChaptersLoaders: readonly (() => KrishnaStotramChapter)[] = [
  () => require('./chapter-01.json') as KrishnaStotramChapter,
  () => require('./chapter-02.json') as KrishnaStotramChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const krishnaStotramTotal = krishnaStotramChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getKrishnaStotramChapter(chapter: number): KrishnaStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= krishnaStotramChaptersLoaders.length) {
    throw new Error(`krishna-stotram: chapter ${chapter} out of range (1-${krishnaStotramChaptersLoaders.length})`);
  }
  return assertChapterMatchesManifest('krishna-stotram', krishnaStotramChaptersLoaders[idx](), krishnaStotramChaptersManifest[idx]);
}

