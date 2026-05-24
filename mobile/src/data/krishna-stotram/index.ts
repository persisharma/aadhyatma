import manifest from './chapters-manifest.json';
import ch01 from './chapter-01.json';

export type KrishnaStotramVerse = {
  id: string;
  chapter: number;
  number: number;
  sanskrit: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
};

export type KrishnaStotramChapter = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
  verses: KrishnaStotramVerse[];
};

export type KrishnaStotramChapterSummary = {
  chapter: number;
  titleHi: string;
  titleEn: string;
  verseCount: number;
};

export const krishnaStotramTitleHi = 'कृष्ण स्तोत्रम्';
export const krishnaStotramTitleEn = 'Krishna Stotram';

export const krishnaStotramChaptersManifest: readonly KrishnaStotramChapterSummary[] =
  manifest as KrishnaStotramChapterSummary[];

export const krishnaStotramChapters: readonly KrishnaStotramChapter[] = [
  ch01 as KrishnaStotramChapter,
];

export const krishnaStotramTotal = krishnaStotramChapters.reduce(
  (sum, ch) => sum + ch.verseCount,
  0
);

export function getKrishnaStotramChapter(chapter: number): KrishnaStotramChapter {
  const idx = chapter - 1;
  if (idx < 0 || idx >= krishnaStotramChapters.length) {
    throw new Error(`krishna-stotram: chapter ${chapter} out of range (1-${krishnaStotramChapters.length})`);
  }
  return krishnaStotramChapters[idx];
}

(function assertKrishnaStotramInvariants() {
  if (krishnaStotramChapters.length !== 1) {
    throw new Error(`krishna-stotram: expected 1 chapter, got ${krishnaStotramChapters.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (const c of krishnaStotramChapters) {
    if (c.verses.length !== c.verseCount) {
      throw new Error(`krishna-stotram: chapter ${c.chapter} declares ${c.verseCount} verses but has ${c.verses.length}`);
    }
    for (const v of c.verses) {
      if (seenIds.has(v.id)) throw new Error(`krishna-stotram: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.sanskrit.length < 1) throw new Error(`krishna-stotram: ${v.id} has no Sanskrit lines`);
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) throw new Error(`krishna-stotram: ${v.id} has empty meaning`);
    }
    totalVerses += c.verses.length;
  }
  if (totalVerses !== 9) {
    throw new Error(`krishna-stotram: expected 9 total verses, got ${totalVerses}`);
  }
})();
