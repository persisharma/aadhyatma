import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';

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

export type RamcharitmanasChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: RamcharitmanasVerse[];
};

export type RamcharitmanasChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ramcharitmanasTitleHi = 'रामचरितमानस मंगलाचरण';
export const ramcharitmanasTitleEn = 'Ramcharitmanas Mangalacharan';

export const ramcharitmanasChaptersManifest: readonly RamcharitmanasChapterSummary[] =
  manifest as RamcharitmanasChapterSummary[];

export const ramcharitmanasChapters: readonly RamcharitmanasChapter[] = [
  ch01 as RamcharitmanasChapter,
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
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`ramcharitmanas: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.lines.length < 1) throw new Error(`ramcharitmanas: ${v.id} has no lines`);
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`ramcharitmanas: ${v.id} has empty meaning`);
      }
    }
    totalVerses += c.verses.length;
  }
})();
