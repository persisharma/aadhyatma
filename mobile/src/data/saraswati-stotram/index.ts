import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';

export type SaraswatiStotramVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type SaraswatiStotramChapterSource = {
  baseText: string;
  referenceUrls: string[];
  retrievedOn: string;
};

export type SaraswatiStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: SaraswatiStotramVerse[];
  source?: SaraswatiStotramChapterSource;
};

export type SaraswatiStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const saraswatiStotramTitleHi = 'सरस्वती स्तोत्रम्';
export const saraswatiStotramTitleEn = 'Saraswati Stotram';

export const saraswatiStotramChaptersManifest: readonly SaraswatiStotramChapterSummary[] =
  manifest as SaraswatiStotramChapterSummary[];

export const saraswatiStotramChapters: readonly SaraswatiStotramChapter[] = [
  ch01 as SaraswatiStotramChapter,
  ch02 as SaraswatiStotramChapter,
  ch03 as SaraswatiStotramChapter,
];

export const saraswatiStotramTotal = saraswatiStotramChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getSaraswatiStotramChapter(chapter: number): SaraswatiStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= saraswatiStotramChapters.length) {
    throw new Error(`saraswati-stotram: chapter ${chapter} out of range (1-${saraswatiStotramChapters.length})`);
  }
  return saraswatiStotramChapters[idx];
}

(function assertSaraswatiStotramInvariants() {
  if (saraswatiStotramChapters.length !== 3) {
    throw new Error(`saraswati-stotram: expected 3 chapters, got ${saraswatiStotramChapters.length}`);
  }
  if (saraswatiStotramChaptersManifest.length !== 3) {
    throw new Error(`saraswati-stotram: manifest should list 3 chapters, got ${saraswatiStotramChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < saraswatiStotramChapters.length; i++) {
    const c = saraswatiStotramChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`saraswati-stotram: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `saraswati-stotram: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    if (!c.titleHi.trim() || !c.titleEn.trim()) {
      throw new Error(`saraswati-stotram: chapter ${c.chapter} has empty title`);
    }
    const manifestEntry = saraswatiStotramChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`saraswati-stotram: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`saraswati-stotram: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`saraswati-stotram: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) {
        throw new Error(`saraswati-stotram: ${v.id} has no Sanskrit lines`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`saraswati-stotram: ${v.id} has empty meaning (hi or en)`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 7) {
    throw new Error(`saraswati-stotram: expected 7 total verses, got ${totalVerses}`);
  }
})();
