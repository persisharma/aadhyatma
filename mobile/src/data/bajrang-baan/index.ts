import manifest from './chapters-manifest.json';
import ch01 from './bajrang-baan.json';

export type BajrangBaanVerse = {
  id: string;
  chapter: number;
  number: number;
  section: 'doha' | 'chhand';
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type BajrangBaanChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: BajrangBaanVerse[];
};

export type BajrangBaanChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const bajrangBaanTitleHi = 'बजरंग बाण';
export const bajrangBaanTitleEn = 'Bajrang Baan';

export const bajrangBaanChaptersManifest: readonly BajrangBaanChapterSummary[] =
  manifest as BajrangBaanChapterSummary[];

export const bajrangBaanChapters: readonly BajrangBaanChapter[] = [
  ch01 as BajrangBaanChapter,
];

export const bajrangBaanTotal = bajrangBaanChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getBajrangBaanChapter(chapter: number): BajrangBaanChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= bajrangBaanChapters.length) {
    throw new Error(`bajrang-baan: chapter ${chapter} out of range (1-${bajrangBaanChapters.length})`);
  }
  return bajrangBaanChapters[idx];
}

(function assertBajrangBaanInvariants() {
  if (bajrangBaanChapters.length !== 1) {
    throw new Error(`bajrang-baan: expected 1 chapter, got ${bajrangBaanChapters.length}`);
  }
  const seenIds = new Set<string>();
  for (const c of bajrangBaanChapters) {
    if (c.verses.length !== c.verseCount) {
      throw new Error(`bajrang-baan: ch${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`bajrang-baan: duplicate id '${v.id}'`);
      seenIds.add(v.id);
      if (v.lines.length < 1) throw new Error(`bajrang-baan: ${v.id} has no lines`);
      if (!v.meaningHi.trim()) throw new Error(`bajrang-baan: ${v.id} has empty meaningHi`);
      if (!v.meaningEn.trim()) throw new Error(`bajrang-baan: ${v.id} has empty meaningEn`);
    }
  }
})();
