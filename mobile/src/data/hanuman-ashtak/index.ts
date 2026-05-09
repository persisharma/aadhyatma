import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';

export type HanumanAshtakVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type HanumanAshtakChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: HanumanAshtakVerse[];
};

export type HanumanAshtakChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const hanumanAshtakTitleHi = 'हनुमान अष्टक';
export const hanumanAshtakTitleEn = 'Hanuman Ashtak';

export const hanumanAshtakChaptersManifest: readonly HanumanAshtakChapterSummary[] =
  manifest as HanumanAshtakChapterSummary[];

export const hanumanAshtakChapters: readonly HanumanAshtakChapter[] = [
  ch01 as HanumanAshtakChapter,
];

export const hanumanAshtakTotal = hanumanAshtakChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getHanumanAshtakChapter(chapter: number): HanumanAshtakChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= hanumanAshtakChapters.length) {
    throw new Error(`hanuman-ashtak: chapter ${chapter} out of range (1-${hanumanAshtakChapters.length})`);
  }
  return hanumanAshtakChapters[idx];
}

(function assertHanumanAshtakInvariants() {
  if (hanumanAshtakChapters.length !== 1) {
    throw new Error(`hanuman-ashtak: expected 1 chapter, got ${hanumanAshtakChapters.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (const c of hanumanAshtakChapters) {
    if (c.verses.length !== c.verseCount) {
      throw new Error(`hanuman-ashtak: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`hanuman-ashtak: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.sanskrit.length < 1) throw new Error(`hanuman-ashtak: ${v.id} has no Sanskrit lines`);
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) throw new Error(`hanuman-ashtak: ${v.id} has empty meaning`);
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 8) {
    throw new Error(`hanuman-ashtak: expected 8 total verses, got ${totalVerses}`);
  }
})();
