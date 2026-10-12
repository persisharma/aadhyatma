import manifest from './chapters-manifest.json';
import { assertChapterMatchesManifest } from '../chapterInvariants';

export type VishnuSahasranamaVerse = {
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

export type VishnuSahasranamaChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: VishnuSahasranamaVerse[];
};

export type VishnuSahasranamaChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const vishnuSahasranamaTitleHi = 'विष्णु सहस्रनाम अंश';
export const vishnuSahasranamaTitleEn = 'Vishnu Sahasranama Excerpt';

export const vishnuSahasranamaChaptersManifest: readonly VishnuSahasranamaChapterSummary[] =
  manifest as VishnuSahasranamaChapterSummary[];

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
const vishnuSahasranamaChaptersLoaders: readonly (() => VishnuSahasranamaChapter)[] = [
  () => require('./chapter-01.json') as VishnuSahasranamaChapter,
  () => require('./chapter-02.json') as VishnuSahasranamaChapter,
  () => require('./chapter-03.json') as VishnuSahasranamaChapter,
  () => require('./chapter-04.json') as VishnuSahasranamaChapter,
];
/* eslint-enable @typescript-eslint/no-require-imports */

export const vishnuSahasranamaTotal = vishnuSahasranamaChaptersManifest.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getVishnuSahasranamaChapter(chapter: number): VishnuSahasranamaChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= vishnuSahasranamaChaptersLoaders.length) {
    throw new Error(`vishnu-sahasranama: chapter ${chapter} out of range (1-${vishnuSahasranamaChaptersLoaders.length})`);
  }
  return assertChapterMatchesManifest('vishnu-sahasranama', vishnuSahasranamaChaptersLoaders[idx](), vishnuSahasranamaChaptersManifest[idx]);
}

