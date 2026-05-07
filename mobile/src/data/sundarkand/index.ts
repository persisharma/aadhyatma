import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';
import ch04 from './chapter-04.json';
import ch05 from './chapter-05.json';
import ch06 from './chapter-06.json';
import ch07 from './chapter-07.json';
import ch08 from './chapter-08.json';
import ch09 from './chapter-09.json';
import ch10 from './chapter-10.json';
import ch11 from './chapter-11.json';
import ch12 from './chapter-12.json';
import ch13 from './chapter-13.json';
import ch14 from './chapter-14.json';
import ch15 from './chapter-15.json';
import ch16 from './chapter-16.json';

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
  if (totalVerses !== 343) {
    throw new Error(`sundarkand: expected 343 total verses, got ${totalVerses}`);
  }
})();
