import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';

export type AdityaHridayamVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type AdityaHridayamChapterSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type AdityaHridayamChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: AdityaHridayamVerse[];
  source?: AdityaHridayamChapterSource;
};

export type AdityaHridayamChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const adityaHridayamTitleHi = 'आदित्य हृदयम्';
export const adityaHridayamTitleEn = 'Aditya Hridayam';

export const adityaHridayamChaptersManifest: readonly AdityaHridayamChapterSummary[] =
  manifest as AdityaHridayamChapterSummary[];

export const adityaHridayamChapters: readonly AdityaHridayamChapter[] = [
  ch01 as AdityaHridayamChapter,
];

export const adityaHridayamTotal = adityaHridayamChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getAdityaHridayamChapter(chapter: number): AdityaHridayamChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= adityaHridayamChapters.length) {
    throw new Error(`aditya-hridayam: chapter ${chapter} out of range (1-${adityaHridayamChapters.length})`);
  }
  return adityaHridayamChapters[idx];
}

(function assertAdityaHridayamInvariants() {
  if (adityaHridayamChapters.length !== 1) {
    throw new Error(`aditya-hridayam: expected 1 chapter, got ${adityaHridayamChapters.length}`);
  }
  if (adityaHridayamChaptersManifest.length !== 1) {
    throw new Error(`aditya-hridayam: manifest should list 1 chapter, got ${adityaHridayamChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < adityaHridayamChapters.length; i++) {
    const c = adityaHridayamChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`aditya-hridayam: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(`aditya-hridayam: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`);
    }
    const manifestEntry = adityaHridayamChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`aditya-hridayam: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`aditya-hridayam: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`aditya-hridayam: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) throw new Error(`aditya-hridayam: ${v.id} has no Sanskrit lines`);
      if (v.sanskrit.length !== v.linesEn.length) {
        throw new Error(`aditya-hridayam: ${v.id} Sanskrit/IAST line count mismatch`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`aditya-hridayam: ${v.id} has empty meaning`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 32) {
    throw new Error(`aditya-hridayam: expected 32 total verses, got ${totalVerses}`);
  }
})();
