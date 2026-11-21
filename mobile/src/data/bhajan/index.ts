import type { BhajanGroupId } from './ids';

export {
  bhajanCatalog,
  bhajanIds,
  bhajanGroupOf,
  BHAJAN_REGIONS,
  type BhajanCatalogRow,
  type BhajanGroupId,
  type BhajanRegion,
} from './ids';

/** Same page shape as an aarti verse, so the shared `VersePage` renders it. */
export type BhajanVerse = {
  id: string;
  type: 'refrain' | 'stanza';
  section: 'body';
  number: number;
  labelHi: string;
  labelEn: string;
  lines: string[];
  linesEn: string[];
  meaningHi: string;
  meaningEn: string;
  meaningGu?: string;
  meaningKn?: string;
};

export type BhajanData = {
  id: string;
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  group: BhajanGroupId;
  /** Poet or tradition, e.g. मीराबाई / Meerabai, पारम्परिक / Traditional. */
  attributionHi: string;
  attributionEn: string;
  /** Spoken language of the lines, e.g. `hi`, `raj` (Rajasthani), `bho` (Bhojpuri). */
  language: string;
  source: {
    baseText: string;
    referenceUrls: string[];
    retrievedOn: string;
    notes?: string;
  };
  counts: { totalVerses: number };
  verses: BhajanVerse[];
};

/**
 * Payload loaders, keyed by catalog id. `require` thunks keep every JSON out of
 * module evaluation until a reader (or the search index) asks for it.
 * `bhajanLibrary.test.ts` pins this map to `bhajanCatalog` one-to-one.
 */
export const bhajanLoaders: Readonly<Record<string, () => unknown>> = {};

const cache = new Map<string, BhajanData>();

export function getBhajan(id: string): BhajanData | null {
  const cached = cache.get(id);
  if (cached) return cached;
  const load = bhajanLoaders[id];
  if (!load) return null;
  const data = load() as BhajanData;
  cache.set(id, data);
  return data;
}
