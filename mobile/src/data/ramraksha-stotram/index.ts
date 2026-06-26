import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';

export type RamrakshaStotramVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type RamrakshaStotramChapterSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type RamrakshaStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: RamrakshaStotramVerse[];
  source?: RamrakshaStotramChapterSource;
};

export type RamrakshaStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ramrakshaStotramTitleHi = 'श्रीरामरक्षा स्तोत्रम्';
export const ramrakshaStotramTitleEn = 'Ramraksha Stotram';

export const ramrakshaStotramChaptersManifest: readonly RamrakshaStotramChapterSummary[] =
  manifest as RamrakshaStotramChapterSummary[];

export const ramrakshaStotramChapters: readonly RamrakshaStotramChapter[] = [
  ch01 as RamrakshaStotramChapter,
];

export const ramrakshaStotramTotal = ramrakshaStotramChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getRamrakshaStotramChapter(chapter: number): RamrakshaStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ramrakshaStotramChapters.length) {
    throw new Error(`ramraksha-stotram: chapter ${chapter} out of range (1-${ramrakshaStotramChapters.length})`);
  }
  return ramrakshaStotramChapters[idx];
}

(function assertRamrakshaStotramInvariants() {
  if (ramrakshaStotramChapters.length !== 1) {
    throw new Error(`ramraksha-stotram: expected 1 chapter, got ${ramrakshaStotramChapters.length}`);
  }
  if (ramrakshaStotramChaptersManifest.length !== 1) {
    throw new Error(`ramraksha-stotram: manifest should list 1 chapter, got ${ramrakshaStotramChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < ramrakshaStotramChapters.length; i++) {
    const c = ramrakshaStotramChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`ramraksha-stotram: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(`ramraksha-stotram: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`);
    }
    const manifestEntry = ramrakshaStotramChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`ramraksha-stotram: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`ramraksha-stotram: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`ramraksha-stotram: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) throw new Error(`ramraksha-stotram: ${v.id} has no Sanskrit lines`);
      if (v.sanskrit.length !== v.linesEn.length) {
        throw new Error(`ramraksha-stotram: ${v.id} Sanskrit/IAST line count mismatch`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`ramraksha-stotram: ${v.id} has empty meaning`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 39) {
    throw new Error(`ramraksha-stotram: expected 39 total verses, got ${totalVerses}`);
  }
})();
