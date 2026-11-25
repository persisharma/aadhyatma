import manifest from './chapters-manifest.json';
import type { GitaChapter, GitaChapterSummary, GitaVerse } from '../gita';

export const BHAGAVATAM_ID = 'srimad-bhagavatam';
export const bhagavatamTitleHi = 'श्रीमद्भागवतम्';
export const bhagavatamTitleEn = 'Śrīmad Bhāgavatam';

type BhagavatamReading = GitaChapterSummary & {
  scriptureChapter: { canto: number; chapter: number };
  verseNumbers: readonly number[];
};

// The reading and page indices are persisted. Append new selections and verses.
export const bhagavatamChaptersManifest: readonly BhagavatamReading[] = manifest;
export const bhagavatamVerseCount = manifest.reduce((count, reading) => count + reading.verseCount, 0);
export const bhagavatamReadingCount = manifest.length;

type VerseBody = Omit<GitaVerse, 'id' | 'chapter' | 'scriptureRef'>;
const loadReadings: readonly (() => VerseBody[])[] = [
  () => require('./reading-01.json') as VerseBody[],
  () => require('./reading-02.json') as VerseBody[],
  () => require('./reading-03.json') as VerseBody[],
  () => require('./reading-04.json') as VerseBody[],
  () => require('./reading-05.json') as VerseBody[],
  () => require('./reading-06.json') as VerseBody[],
];
const cache = new Map<number, GitaChapter>();

export function getBhagavatamVerseReference(chapter: number | undefined, verseIndex: number): string | undefined {
  const reading = bhagavatamChaptersManifest[(chapter ?? 0) - 1];
  const number = reading?.verseNumbers[verseIndex];
  if (number == null) return undefined;
  const scripture = reading.scriptureChapter;
  return `${scripture.canto}.${scripture.chapter}.${number}`;
}

export function getBhagavatamChapter(chapter: number): GitaChapter {
  const existing = cache.get(chapter);
  if (existing) return existing;
  const reading = bhagavatamChaptersManifest[chapter - 1];
  if (!reading) throw new Error(`Bhāgavatam reading ${chapter} does not exist`);
  const source = loadReadings[chapter - 1]();
  if (source.length !== reading.verseCount || source.some((verse, index) => verse.number !== reading.verseNumbers[index])) {
    throw new Error(`Bhāgavatam reading ${chapter} does not match the selected verses`);
  }
  const verses = source.map((verse, index) => {
    const scriptureRef = getBhagavatamVerseReference(chapter, index)!;
    return { ...verse, chapter, scriptureRef, id: `sb-${scriptureRef.replace(/\./g, '-')}` };
  });
  const result: GitaChapter = { ...reading, verses };
  cache.set(chapter, result);
  return result;
}
