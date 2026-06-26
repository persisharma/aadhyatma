import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';
import ch04 from './chapter-04.json';

export type ShivaStrotamVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type ShivaStrotamChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: ShivaStrotamVerse[];
};

export type ShivaStrotamChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const shivaStrotamTitleHi = 'शिव स्तोत्रम्';
export const shivaStrotamTitleEn = 'Shiva Stotram';

export const shivaStrotamChaptersManifest: readonly ShivaStrotamChapterSummary[] =
  manifest as ShivaStrotamChapterSummary[];

export const shivaStrotamChapters: readonly ShivaStrotamChapter[] = [
  ch01 as ShivaStrotamChapter,
  ch02 as ShivaStrotamChapter,
  ch03 as ShivaStrotamChapter,
  ch04 as ShivaStrotamChapter,
];

export const shivaStrotamTotal = shivaStrotamChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getShivaStrotamChapter(chapter: number): ShivaStrotamChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= shivaStrotamChapters.length) {
    throw new Error(`shiva-strotam: chapter ${chapter} out of range (1-${shivaStrotamChapters.length})`);
  }
  return shivaStrotamChapters[idx];
}

(function assertShivaStrotamInvariants() {
  if (shivaStrotamChapters.length !== 4) {
    throw new Error(`shiva-strotam: expected 4 chapters, got ${shivaStrotamChapters.length}`);
  }
  if (shivaStrotamChaptersManifest.length !== 4) {
    throw new Error(`shiva-strotam: manifest should list 4 chapters, got ${shivaStrotamChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < shivaStrotamChapters.length; i++) {
    const c = shivaStrotamChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`shiva-strotam: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `shiva-strotam: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    if (!c.titleHi.trim() || !c.titleEn.trim()) {
      throw new Error(`shiva-strotam: chapter ${c.chapter} has empty title`);
    }
    const manifestEntry = shivaStrotamChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`shiva-strotam: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`shiva-strotam: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`shiva-strotam: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) {
        throw new Error(`shiva-strotam: ${v.id} has no Sanskrit lines`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`shiva-strotam: ${v.id} has empty meaning (hi or en)`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 23) {
    throw new Error(`shiva-strotam: expected 23 total verses, got ${totalVerses}`);
  }
})();
