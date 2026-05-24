import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';

export type RamStutiVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type RamStutiChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: RamStutiVerse[];
};

export type RamStutiChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ramStutiTitleHi = 'राम स्तुति';
export const ramStutiTitleEn = 'Ram Stuti';

export const ramStutiChaptersManifest: readonly RamStutiChapterSummary[] =
  manifest as RamStutiChapterSummary[];

export const ramStutiChapters: readonly RamStutiChapter[] = [
  ch01 as RamStutiChapter,
];

export const ramStutiTotal = ramStutiChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getRamStutiChapter(chapter: number): RamStutiChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ramStutiChapters.length) {
    throw new Error(`ram-stuti: chapter ${chapter} out of range (1-${ramStutiChapters.length})`);
  }
  return ramStutiChapters[idx];
}

(function assertRamStutiInvariants() {
  if (ramStutiChapters.length !== 1) {
    throw new Error(`ram-stuti: expected 1 chapter, got ${ramStutiChapters.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (const c of ramStutiChapters) {
    if (c.verses.length !== c.verseCount) {
      throw new Error(`ram-stuti: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`ram-stuti: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.sanskrit.length < 1) throw new Error(`ram-stuti: ${v.id} has no Sanskrit lines`);
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) throw new Error(`ram-stuti: ${v.id} has empty meaning`);
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 9) {
    throw new Error(`ram-stuti: expected 9 total verses, got ${totalVerses}`);
  }
})();
