import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';

export type GaneshStotramVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type GaneshStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: GaneshStotramVerse[];
};

export type GaneshStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const ganeshStotramTitleHi = 'गणेश स्तोत्रम्';
export const ganeshStotramTitleEn = 'Ganesh Stotram';

export const ganeshStotramChaptersManifest: readonly GaneshStotramChapterSummary[] =
  manifest as GaneshStotramChapterSummary[];

export const ganeshStotramChapters: readonly GaneshStotramChapter[] = [
  ch01 as GaneshStotramChapter,
  ch02 as GaneshStotramChapter,
  ch03 as GaneshStotramChapter,
];

export const ganeshStotramTotal = ganeshStotramChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getGaneshStotramChapter(chapter: number): GaneshStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= ganeshStotramChapters.length) {
    throw new Error(`ganesh-stotram: chapter ${chapter} out of range (1-${ganeshStotramChapters.length})`);
  }
  return ganeshStotramChapters[idx];
}

(function assertGaneshStotramInvariants() {
  if (ganeshStotramChapters.length !== 3) {
    throw new Error(`ganesh-stotram: expected 3 chapters, got ${ganeshStotramChapters.length}`);
  }
  if (ganeshStotramChaptersManifest.length !== 3) {
    throw new Error(`ganesh-stotram: manifest should list 3 chapters, got ${ganeshStotramChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < ganeshStotramChapters.length; i++) {
    const c = ganeshStotramChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`ganesh-stotram: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `ganesh-stotram: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    const manifestEntry = ganeshStotramChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`ganesh-stotram: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`ganesh-stotram: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`ganesh-stotram: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) {
        throw new Error(`ganesh-stotram: ${v.id} has no Sanskrit lines`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`ganesh-stotram: ${v.id} has empty meaning (hi or en)`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 28) {
    throw new Error(`ganesh-stotram: expected 28 total verses, got ${totalVerses}`);
  }
})();
