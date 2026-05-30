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
import ch17 from './chapter-17.json';
import ch18 from './chapter-18.json';
import ch19 from './chapter-19.json';
import ch20 from './chapter-20.json';
import ch21 from './chapter-21.json';
import ch22 from './chapter-22.json';
import ch23 from './chapter-23.json';
import ch24 from './chapter-24.json';
import ch25 from './chapter-25.json';
import ch26 from './chapter-26.json';
import ch27 from './chapter-27.json';
import ch28 from './chapter-28.json';
import ch29 from './chapter-29.json';
import ch30 from './chapter-30.json';
import ch31 from './chapter-31.json';
import ch32 from './chapter-32.json';
import ch33 from './chapter-33.json';
import ch34 from './chapter-34.json';
import ch35 from './chapter-35.json';
import ch36 from './chapter-36.json';
import ch37 from './chapter-37.json';
import ch38 from './chapter-38.json';
import ch39 from './chapter-39.json';
import ch40 from './chapter-40.json';
import ch41 from './chapter-41.json';
import ch42 from './chapter-42.json';
import ch43 from './chapter-43.json';
import ch44 from './chapter-44.json';
import ch45 from './chapter-45.json';
import ch46 from './chapter-46.json';
import ch47 from './chapter-47.json';
import ch48 from './chapter-48.json';
import ch49 from './chapter-49.json';
import ch50 from './chapter-50.json';
import ch51 from './chapter-51.json';
import ch52 from './chapter-52.json';
import ch53 from './chapter-53.json';
import ch54 from './chapter-54.json';
import ch55 from './chapter-55.json';
import ch56 from './chapter-56.json';
import ch57 from './chapter-57.json';
import ch58 from './chapter-58.json';
import ch59 from './chapter-59.json';

export type RamcharitmanasVerse = {
  id: string;
  section: 'doha' | 'chaupai' | 'sortha' | 'chhand' | 'shloka';
  stanza: number;
  numInSection: number;
  subSuffix: string;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type RamcharitmanasSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type RamcharitmanasChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  source: RamcharitmanasSource;
  verses: RamcharitmanasVerse[];
};

export type RamcharitmanasChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ramcharitmanasTitleHi = 'रामचरितमानस — बालकाण्ड';
export const ramcharitmanasTitleEn = 'Ramcharitmanas — Bal Kand';

export const ramcharitmanasChaptersManifest: readonly RamcharitmanasChapterSummary[] =
  manifest as RamcharitmanasChapterSummary[];

export const ramcharitmanasChapters: readonly RamcharitmanasChapter[] = [
  ch01 as RamcharitmanasChapter,
  ch02 as RamcharitmanasChapter,
  ch03 as RamcharitmanasChapter,
  ch04 as RamcharitmanasChapter,
  ch05 as RamcharitmanasChapter,
  ch06 as RamcharitmanasChapter,
  ch07 as RamcharitmanasChapter,
  ch08 as RamcharitmanasChapter,
  ch09 as RamcharitmanasChapter,
  ch10 as RamcharitmanasChapter,
  ch11 as RamcharitmanasChapter,
  ch12 as RamcharitmanasChapter,
  ch13 as RamcharitmanasChapter,
  ch14 as RamcharitmanasChapter,
  ch15 as RamcharitmanasChapter,
  ch16 as RamcharitmanasChapter,
  ch17 as RamcharitmanasChapter,
  ch18 as RamcharitmanasChapter,
  ch19 as RamcharitmanasChapter,
  ch20 as RamcharitmanasChapter,
  ch21 as RamcharitmanasChapter,
  ch22 as RamcharitmanasChapter,
  ch23 as RamcharitmanasChapter,
  ch24 as RamcharitmanasChapter,
  ch25 as RamcharitmanasChapter,
  ch26 as RamcharitmanasChapter,
  ch27 as RamcharitmanasChapter,
  ch28 as RamcharitmanasChapter,
  ch29 as RamcharitmanasChapter,
  ch30 as RamcharitmanasChapter,
  ch31 as RamcharitmanasChapter,
  ch32 as RamcharitmanasChapter,
  ch33 as RamcharitmanasChapter,
  ch34 as RamcharitmanasChapter,
  ch35 as RamcharitmanasChapter,
  ch36 as RamcharitmanasChapter,
  ch37 as RamcharitmanasChapter,
  ch38 as RamcharitmanasChapter,
  ch39 as RamcharitmanasChapter,
  ch40 as RamcharitmanasChapter,
  ch41 as RamcharitmanasChapter,
  ch42 as RamcharitmanasChapter,
  ch43 as RamcharitmanasChapter,
  ch44 as RamcharitmanasChapter,
  ch45 as RamcharitmanasChapter,
  ch46 as RamcharitmanasChapter,
  ch47 as RamcharitmanasChapter,
  ch48 as RamcharitmanasChapter,
  ch49 as RamcharitmanasChapter,
  ch50 as RamcharitmanasChapter,
  ch51 as RamcharitmanasChapter,
  ch52 as RamcharitmanasChapter,
  ch53 as RamcharitmanasChapter,
  ch54 as RamcharitmanasChapter,
  ch55 as RamcharitmanasChapter,
  ch56 as RamcharitmanasChapter,
  ch57 as RamcharitmanasChapter,
  ch58 as RamcharitmanasChapter,
  ch59 as RamcharitmanasChapter,
];

export const ramcharitmanasTotal = ramcharitmanasChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getRamcharitmanasChapter(chapter: number): RamcharitmanasChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ramcharitmanasChapters.length) {
    throw new Error(`ramcharitmanas: chapter ${chapter} out of range (1-${ramcharitmanasChapters.length})`);
  }
  return ramcharitmanasChapters[idx];
}

(function assertRamcharitmanasInvariants() {
  if (ramcharitmanasChapters.length !== ramcharitmanasChaptersManifest.length) {
    throw new Error(`ramcharitmanas: chapter count mismatch with manifest`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < ramcharitmanasChapters.length; i++) {
    const c = ramcharitmanasChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`ramcharitmanas: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `ramcharitmanas: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`
      );
    }
    const manifestEntry = ramcharitmanasChaptersManifest[i];
    if (manifestEntry.chapter !== c.chapter || manifestEntry.verseCount !== c.verseCount) {
      throw new Error(`ramcharitmanas: manifest entry ${i + 1} drifts from chapter payload`);
    }
    if (!c.source?.referenceUrls || c.source.referenceUrls.length < 2) {
      throw new Error(`ramcharitmanas: chapter ${c.chapter} is missing source references`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`ramcharitmanas: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.lines.length < 1) throw new Error(`ramcharitmanas: ${v.id} has no lines`);
      if (v.lines.length !== v.linesEn.length) {
        throw new Error(`ramcharitmanas: ${v.id} line/transliteration count mismatch`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`ramcharitmanas: ${v.id} has empty meaning`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== ramcharitmanasTotal) {
    throw new Error(`ramcharitmanas: total mismatch ${totalVerses} vs ${ramcharitmanasTotal}`);
  }
})();
