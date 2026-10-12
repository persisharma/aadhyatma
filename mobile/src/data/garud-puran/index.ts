import manifest from './chapters-manifest.json';

export type GarudPuranArtId = 'cover' | 'daan' | 'babhruvahana' | 'five-pretas' | 'viravahana' | 'sita-ancestors' | 'ancestors' | 'yama' | 'vaitarani';
export type GarudPuranPage = {
  id: string;
  chapter: number;
  number: number;
  titleHi: string;
  titleEn: string;
  bodyHi: string[];
  bodyEn: string[];
  meaningHi: string;
  meaningEn: string;
  artId: GarudPuranArtId;
};
export type GarudPuranSource = {
  baseText: string;
  retrievedOn: string;
  verificationLevel: string;
  referenceUrls: string[];
  independentSourceFamilies: string[];
  sanskritReferences: string[];
  verificationNote: string;
  notes: string;
  citeHi: string;
  citeEn: string;
};
export type GarudPuranChapter = {
  chapter: number;
  id: string;
  titleHi: string;
  titleEn: string;
  kind: 'teaching' | 'story' | 'tradition';
  artId: GarudPuranArtId;
  status: 'verified' | 'draft';
  contentKind: 'editorial-summary';
  source: GarudPuranSource;
  /** Shared reader/progress API name; these are prose pages, never shlokas. */
  verses: GarudPuranPage[];
  verseCount: number;
};
export const garudPuranTitleHi = 'गरुड़ पुराण';
export const garudPuranTitleEn = 'Garud Puran';
export const garudPuranChaptersManifest = manifest.filter(row => row.status === 'verified');
export const garudPuranTotal = garudPuranChaptersManifest.reduce((sum, row) => sum + row.verseCount, 0);

// Only the manifest is eager. Preserve these chapter numbers for saved progress.
const loaders: Record<number, () => Omit<GarudPuranChapter, 'verseCount'>> = {
  1: () => require('./chapter-01.json'),
  2: () => require('./chapter-02.json'),
  3: () => require('./chapter-03.json'),
  4: () => require('./chapter-04.json'),
  5: () => require('./chapter-05.json'),
  6: () => require('./chapter-06.json'),
  7: () => require('./chapter-07.json'),
  8: () => require('./chapter-08.json'),
  9: () => require('./chapter-09.json'),
  10: () => require('./chapter-10.json'),
  11: () => require('./chapter-11.json'),
  12: () => require('./chapter-12.json'),
};
const cache = new Map<number, GarudPuranChapter>();

export function getGarudPuranChapter(chapter: number): GarudPuranChapter {
  const summary = garudPuranChaptersManifest.find(row => row.chapter === chapter);
  if (!summary || !loaders[chapter]) throw new Error(`Unknown Garud Puran selection: ${chapter}`);
  const saved = cache.get(chapter);
  if (saved) return saved;
  const data = loaders[chapter]();
  if (data.status !== 'verified' || data.verses.length !== summary.verseCount ||
      new Set(data.source.independentSourceFamilies).size < 2 ||
      data.verses.some(page => !page.meaningHi.trim() || !page.meaningEn.trim())) {
    throw new Error(`Unverified Garud Puran selection: ${chapter}`);
  }
  const result = { ...data, verseCount: data.verses.length };
  cache.set(chapter, result);
  return result;
}
