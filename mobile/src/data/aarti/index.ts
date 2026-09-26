import { readContent } from '../../storage/content';
const omJaiJagdish = readContent<typeof import('./om-jai-jagdish.json')>('aarti/om-jai-jagdish.json');
const hanumanAarti = readContent<typeof import('./hanuman-aarti.json')>('aarti/hanuman-aarti.json');
const jaiGaneshDeva = readContent<typeof import('./jai-ganesh-deva.json')>('aarti/jai-ganesh-deva.json');
const omJaiShivOmkara = readContent<typeof import('./om-jai-shiv-omkara.json')>('aarti/om-jai-shiv-omkara.json');
const jaiAmbeGauri = readContent<typeof import('./jai-ambe-gauri.json')>('aarti/jai-ambe-gauri.json');
const aartiKunjBihari = readContent<typeof import('./aarti-kunj-bihari.json')>('aarti/aarti-kunj-bihari.json');
const saraswatiAarti = readContent<typeof import('./saraswati-aarti.json')>('aarti/saraswati-aarti.json');
const gayatriAarti = readContent<typeof import('./gayatri-aarti.json')>('aarti/gayatri-aarti.json');

export type AartiVerse = {
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

export type AartiData = {
  titleHi: string;
  titleEn: string;
  subtitleHi: string;
  subtitleEn: string;
  deity: string;
  language: string;
  source: { baseText: string; referenceUrls?: string[]; retrievedOn: string };
  counts: { totalVerses: number };
  verses: AartiVerse[];
};

export const aartiCollection: readonly AartiData[] = [
  omJaiJagdish as AartiData,
  hanumanAarti as AartiData,
  jaiGaneshDeva as AartiData,
  omJaiShivOmkara as AartiData,
  jaiAmbeGauri as AartiData,
  aartiKunjBihari as AartiData,
  saraswatiAarti as AartiData,
  gayatriAarti as AartiData,
];

/**
 * Canonical aarti sourceIds in their fixed display order. The position in this
 * array is the value used by `AartiReader`'s `aartiIndex` route param, and is
 * also the suffix in the legacy `aarti-N` sourceId form (migrated on hydrate).
 */
export const aartiIdByIndex = [
  'om-jai-jagdish',
  'hanuman-aarti',
  'jai-ganesh-deva',
  'om-jai-shiv-omkara',
  'jai-ambe-gauri',
  'aarti-kunj-bihari',
  'saraswati-aarti',
  'gayatri-aarti',
] as const satisfies readonly string[];

export type AartiId = (typeof aartiIdByIndex)[number];

export const aartiIndexById: Readonly<Record<AartiId, number>> = Object.freeze(
  aartiIdByIndex.reduce<Record<string, number>>((acc, id, i) => {
    acc[id] = i;
    return acc;
  }, {}) as Record<AartiId, number>
);

export const aartiTitleHi = 'आरती संग्रह';
export const aartiTitleEn = 'Aarti Collection';

export function getAarti(index: number): AartiData {
  if (index < 0 || index >= aartiCollection.length) {
    throw new Error(`aarti: index ${index} out of range (0-${aartiCollection.length - 1})`);
  }
  return aartiCollection[index];
}

(function assertAartiInvariants() {
  if (aartiCollection.length !== 8) {
    throw new Error(`aarti: expected 8 aartis, got ${aartiCollection.length}`);
  }
  const seenIds = new Set<string>();
  let totalVerses = 0;
  for (const aarti of aartiCollection) {
    if (!aarti.titleHi.trim() || !aarti.titleEn.trim()) {
      throw new Error(`aarti: empty title in collection`);
    }
    if (aarti.verses.length !== aarti.counts.totalVerses) {
      throw new Error(`aarti: ${aarti.titleEn} declares ${aarti.counts.totalVerses} verses but has ${aarti.verses.length}`);
    }
    for (const v of aarti.verses) {
      if (seenIds.has(v.id)) throw new Error(`aarti: duplicate verse id '${v.id}'`);
      seenIds.add(v.id);
      if (v.lines.length !== v.linesEn.length) {
        throw new Error(`aarti: ${v.id} lines/linesEn length mismatch`);
      }
      if (!v.meaningHi.trim() || !v.meaningEn.trim()) {
        throw new Error(`aarti: ${v.id} has empty meaning`);
      }
    }
    totalVerses += aarti.verses.length;
  }
})();
