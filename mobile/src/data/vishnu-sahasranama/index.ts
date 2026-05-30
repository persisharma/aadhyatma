import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';
import ch02 from './chapter-02.json';
import ch03 from './chapter-03.json';
import ch04 from './chapter-04.json';

export type VishnuSahasranamaVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type VishnuSahasranamaChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: VishnuSahasranamaVerse[];
};

export type VishnuSahasranamaChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const vishnuSahasranamaTitleHi = 'विष्णु सहस्रनाम';
export const vishnuSahasranamaTitleEn = 'Vishnu Sahasranama';

export const vishnuSahasranamaChaptersManifest: readonly VishnuSahasranamaChapterSummary[] =
  manifest as VishnuSahasranamaChapterSummary[];

export const vishnuSahasranamaChapters: readonly VishnuSahasranamaChapter[] = [
  ch01 as VishnuSahasranamaChapter,
  ch02 as VishnuSahasranamaChapter,
  ch03 as VishnuSahasranamaChapter,
  ch04 as VishnuSahasranamaChapter,
];

export const vishnuSahasranamaTotal = vishnuSahasranamaChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getVishnuSahasranamaChapter(chapter: number): VishnuSahasranamaChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= vishnuSahasranamaChapters.length) {
    throw new Error(`vishnu-sahasranama: chapter ${chapter} out of range (1-${vishnuSahasranamaChapters.length})`);
  }
  return vishnuSahasranamaChapters[idx];
}

(function assertVishnuSahasranamaInvariants() {
  if (vishnuSahasranamaChapters.length !== 4) {
    throw new Error(`vishnu-sahasranama: expected 4 chapters, got ${vishnuSahasranamaChapters.length}`);
  }
  if (vishnuSahasranamaChaptersManifest.length !== 4) {
    throw new Error(`vishnu-sahasranama: manifest should list 4 chapters, got ${vishnuSahasranamaChaptersManifest.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (let i = 0; i < vishnuSahasranamaChapters.length; i++) {
    const c = vishnuSahasranamaChapters[i];
    if (c.chapter !== i + 1) {
      throw new Error(`vishnu-sahasranama: chapter at index ${i} has number ${c.chapter}, expected ${i + 1}`);
    }
    if (c.verses.length !== c.verseCount) {
      throw new Error(
        `vishnu-sahasranama: chapter ${c.chapter} declares ${c.verseCount} verses but verses[] has ${c.verses.length}`
      );
    }
    const manifestEntry = vishnuSahasranamaChaptersManifest[i];
    if (
      manifestEntry.chapter !== c.chapter ||
      manifestEntry.verseCount !== c.verseCount ||
      manifestEntry.titleHi !== c.titleHi ||
      manifestEntry.titleEn !== c.titleEn
    ) {
      throw new Error(`vishnu-sahasranama: manifest entry ${i + 1} drifts from chapter ${c.chapter} payload`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`vishnu-sahasranama: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.chapter !== c.chapter) {
        throw new Error(`vishnu-sahasranama: verse ${v.id} chapter mismatch (${v.chapter} vs ${c.chapter})`);
      }
      if (v.sanskrit.length < 1) {
        throw new Error(`vishnu-sahasranama: ${v.id} has no Sanskrit lines`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`vishnu-sahasranama: ${v.id} has empty meaning (hi or en)`);
      }
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 79) {
    throw new Error(`vishnu-sahasranama: expected 79 total verses, got ${totalVerses}`);
  }
})();
