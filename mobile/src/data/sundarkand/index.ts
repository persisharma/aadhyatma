import manifest from './chapters-manifest.json';
import { assertChapterMatchesManifest } from '../chapterInvariants';

export type SundarkandSection = 'shloka' | 'chaupai' | 'doha' | 'sortha' | 'chhand';

export type SundarkandVerse = {
  id: string;
  chapter: number;
  section: SundarkandSection;
  stanza: number;
  numInSection: number;
  subSuffix: string | null;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type SundarkandChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: SundarkandVerse[];
};

export type SundarkandChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const sundarkandTitleHi = 'सुंदरकाण्ड';
export const sundarkandTitleEn = 'Sundarkand';

export const sundarkandChaptersManifest: readonly SundarkandChapterSummary[] =
  manifest as SundarkandChapterSummary[];

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
const sundarkandChaptersLoaders: readonly (() => SundarkandChapter)[] = [
  () => require('./chapter-01.json') as SundarkandChapter,
  () => require('./chapter-02.json') as SundarkandChapter,
  () => require('./chapter-03.json') as SundarkandChapter,
  () => require('./chapter-04.json') as SundarkandChapter,
  () => require('./chapter-05.json') as SundarkandChapter,
  () => require('./chapter-06.json') as SundarkandChapter,
  () => require('./chapter-07.json') as SundarkandChapter,
  () => require('./chapter-08.json') as SundarkandChapter,
  () => require('./chapter-09.json') as SundarkandChapter,
  () => require('./chapter-10.json') as SundarkandChapter,
  () => require('./chapter-11.json') as SundarkandChapter,
  () => require('./chapter-12.json') as SundarkandChapter,
  () => require('./chapter-13.json') as SundarkandChapter,
  () => require('./chapter-14.json') as SundarkandChapter,
  () => require('./chapter-15.json') as SundarkandChapter,
  () => require('./chapter-16.json') as SundarkandChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const sundarkandTotal = sundarkandChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getSundarkandChapter(chapter: number): SundarkandChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= sundarkandChaptersLoaders.length) {
    throw new Error(`sundarkand: chapter ${chapter} out of range (1-${sundarkandChaptersLoaders.length})`);
  }
  return assertChapterMatchesManifest('sundarkand', sundarkandChaptersLoaders[idx](), sundarkandChaptersManifest[idx]);
}

