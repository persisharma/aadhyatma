import { readContent } from '../../storage/content';
import manifest from './chapters-manifest.json';
const ch01 = readContent<typeof import('./chapter-01.json')>('sundarkand/chapter-01.json');
const ch02 = readContent<typeof import('./chapter-02.json')>('sundarkand/chapter-02.json');
const ch03 = readContent<typeof import('./chapter-03.json')>('sundarkand/chapter-03.json');
const ch04 = readContent<typeof import('./chapter-04.json')>('sundarkand/chapter-04.json');
const ch05 = readContent<typeof import('./chapter-05.json')>('sundarkand/chapter-05.json');
const ch06 = readContent<typeof import('./chapter-06.json')>('sundarkand/chapter-06.json');
const ch07 = readContent<typeof import('./chapter-07.json')>('sundarkand/chapter-07.json');
const ch08 = readContent<typeof import('./chapter-08.json')>('sundarkand/chapter-08.json');
const ch09 = readContent<typeof import('./chapter-09.json')>('sundarkand/chapter-09.json');
const ch10 = readContent<typeof import('./chapter-10.json')>('sundarkand/chapter-10.json');
const ch11 = readContent<typeof import('./chapter-11.json')>('sundarkand/chapter-11.json');
const ch12 = readContent<typeof import('./chapter-12.json')>('sundarkand/chapter-12.json');
const ch13 = readContent<typeof import('./chapter-13.json')>('sundarkand/chapter-13.json');
const ch14 = readContent<typeof import('./chapter-14.json')>('sundarkand/chapter-14.json');
const ch15 = readContent<typeof import('./chapter-15.json')>('sundarkand/chapter-15.json');
const ch16 = readContent<typeof import('./chapter-16.json')>('sundarkand/chapter-16.json');

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

export const sundarkandChapters: readonly SundarkandChapter[] = [
  ch01 as SundarkandChapter,
  ch02 as SundarkandChapter,
  ch03 as SundarkandChapter,
  ch04 as SundarkandChapter,
  ch05 as SundarkandChapter,
  ch06 as SundarkandChapter,
  ch07 as SundarkandChapter,
  ch08 as SundarkandChapter,
  ch09 as SundarkandChapter,
  ch10 as SundarkandChapter,
  ch11 as SundarkandChapter,
  ch12 as SundarkandChapter,
  ch13 as SundarkandChapter,
  ch14 as SundarkandChapter,
  ch15 as SundarkandChapter,
  ch16 as SundarkandChapter,
];

export const sundarkandTotal = sundarkandChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getSundarkandChapter(chapter: number): SundarkandChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= sundarkandChapters.length) {
    throw new Error(`sundarkand: chapter ${chapter} out of range (1-${sundarkandChapters.length})`);
  }
  return sundarkandChapters[idx];
}

(function assertSundarkandInvariants() {
  if (sundarkandChapters.length !== 16) {
    throw new Error(`sundarkand: expected 16 chapters, got ${sundarkandChapters.length}`);
  }
  if (sundarkandChaptersManifest.length !== 16) {
    throw new Error(`sundarkand: manifest should list 16 chapters, got ${sundarkandChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < sundarkandChapters.length; i++) {
    const c = sundarkandChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`sundarkand: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `sundarkand: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    if (!c.titleHi.trim() || !c.titleEn.trim()) {
      throw new Error(`sundarkand: chapter ${c.chapter} has empty title`);
    }
    const manifestEntry = sundarkandChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`sundarkand: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`sundarkand: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.lines.length === 0) {
        throw new Error(`sundarkand: verse '${v.id}' has no Devanagari lines`);
      }
      if (!v.meaningHi.trim() && !v.meaningEn.trim()) {
        throw new Error(`sundarkand: verse '${v.id}' has empty meaning in both languages`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 354) {
    throw new Error(`sundarkand: expected 354 total verses, got ${totalVerses}`);
  }
})();
