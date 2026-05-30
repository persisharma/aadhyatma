import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';

export type DurgaStotramVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type DurgaStotramChapterSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type DurgaStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: DurgaStotramVerse[];
  source?: DurgaStotramChapterSource;
};

export type DurgaStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const durgaStotramTitleHi = 'दुर्गा स्तोत्रम्';
export const durgaStotramTitleEn = 'Durga Stotram';

export const durgaStotramChaptersManifest: readonly DurgaStotramChapterSummary[] =
  manifest as DurgaStotramChapterSummary[];

export const durgaStotramChapters: readonly DurgaStotramChapter[] = [
  ch01 as DurgaStotramChapter,
  ch02 as DurgaStotramChapter,
  ch03 as DurgaStotramChapter,
];

export const durgaStotramTotal = durgaStotramChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getDurgaStotramChapter(chapter: number): DurgaStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= durgaStotramChapters.length) {
    throw new Error(`durga-stotram: chapter ${chapter} out of range (1-${durgaStotramChapters.length})`);
  }
  return durgaStotramChapters[idx];
}

(function assertDurgaStotramInvariants() {
  if (durgaStotramChapters.length !== 3) {
    throw new Error(`durga-stotram: expected 3 chapters, got ${durgaStotramChapters.length}`);
  }
  if (durgaStotramChaptersManifest.length !== 3) {
    throw new Error(`durga-stotram: manifest should list 3 chapters, got ${durgaStotramChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < durgaStotramChapters.length; i++) {
    const c = durgaStotramChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`durga-stotram: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `durga-stotram: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    if (!c.titleHi.trim() || !c.titleEn.trim()) {
      throw new Error(`durga-stotram: chapter ${c.chapter} has empty title`);
    }
    const manifestEntry = durgaStotramChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`durga-stotram: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`durga-stotram: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`durga-stotram: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) {
        throw new Error(`durga-stotram: ${v.id} has no Sanskrit lines`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`durga-stotram: ${v.id} has empty meaning (hi or en)`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 33) {
    throw new Error(`durga-stotram: expected 33 total verses, got ${totalVerses}`);
  }
})();
