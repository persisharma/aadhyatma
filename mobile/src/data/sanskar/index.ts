import { readContent } from '../../storage/content';
const prabhatiShloka = readContent<typeof import('./prabhati-shloka.json')>('sanskar/prabhati-shloka.json');
const suryaNamaskar = readContent<typeof import('./surya-namaskar.json')>('sanskar/surya-namaskar.json');
const tulsiPuja = readContent<typeof import('./tulsi-puja.json')>('sanskar/tulsi-puja.json');
const bhojanMantra = readContent<typeof import('./bhojan-mantra.json')>('sanskar/bhojan-mantra.json');
const gauSeva = readContent<typeof import('./gau-seva.json')>('sanskar/gau-seva.json');
const sandhyaDeepam = readContent<typeof import('./sandhya-deepam.json')>('sanskar/sandhya-deepam.json');
const ratriShloka = readContent<typeof import('./ratri-shloka.json')>('sanskar/ratri-shloka.json');
const vidyarambhaPrarthana = readContent<typeof import('./vidyarambha-prarthana.json')>('sanskar/vidyarambha-prarthana.json');

import type { SanskarData } from './types';
export type { SanskarData, SanskarVerse } from './types';
export type { SanskarVerseType } from './types';

export const sanskarCollection: readonly SanskarData[] = [
  prabhatiShloka as SanskarData,
  suryaNamaskar as SanskarData,
  tulsiPuja as SanskarData,
  bhojanMantra as SanskarData,
  gauSeva as SanskarData,
  sandhyaDeepam as SanskarData,
  ratriShloka as SanskarData,
  vidyarambhaPrarthana as SanskarData,
];

export const sanskarIds = [
  'prabhati-shloka',
  'surya-namaskar',
  'tulsi-puja',
  'bhojan-mantra',
  'gau-seva',
  'sandhya-deepam',
  'ratri-shloka',
  'vidyarambha-prarthana',
] as const satisfies readonly string[];

export type SanskarId = (typeof sanskarIds)[number];

export function getSanskar(id: string): SanskarData {
  const index = sanskarIds.indexOf(id as SanskarId);
  if (index === -1) {
    throw new Error(`sanskar: unknown id '${id}'`);
  }
  return sanskarCollection[index];
}

export const getSanskarById: Readonly<Record<string, SanskarData>> = Object.freeze(
  sanskarIds.reduce<Record<string, SanskarData>>((acc, id, i) => {
    acc[id] = sanskarCollection[i];
    return acc;
  }, {})
);

// ─── Module-level invariant assertions ───────────────────────────────────────

(function assertSanskarInvariants() {
  // Exactly 8 sections
  if (sanskarCollection.length !== 8) {
    throw new Error(
      `sanskar: expected 8 sections, got ${sanskarCollection.length}`
    );
  }

  const seenVerseIds = new Set<string>();

  for (let s = 0; s < sanskarCollection.length; s++) {
    const section = sanskarCollection[s];
    const sectionName = section.titleEn;

    // counts.totalVerses matches actual verses.length
    if (section.counts.totalVerses !== section.verses.length) {
      throw new Error(
        `sanskar: ${sectionName} declares ${section.counts.totalVerses} verses but has ${section.verses.length}`
      );
    }

    // First verse of each section has type='intro'
    if (section.verses.length === 0 || section.verses[0].type !== 'intro') {
      throw new Error(
        `sanskar: ${sectionName} first verse must have type='intro'`
      );
    }

    for (const v of section.verses) {
      // No duplicate verse IDs across ALL sections
      if (seenVerseIds.has(v.id)) {
        throw new Error(`sanskar: duplicate verse id '${v.id}'`);
      }
      seenVerseIds.add(v.id);

      // Every verse has non-empty lines, linesEn, meaningHi, meaningEn
      if (!v.lines.length) {
        throw new Error(`sanskar: ${v.id} has empty lines`);
      }
      if (!v.linesEn.length) {
        throw new Error(`sanskar: ${v.id} has empty linesEn`);
      }
      if (!v.meaningHi.trim()) {
        throw new Error(`sanskar: ${v.id} has empty meaningHi`);
      }
      if (!v.meaningEn.trim()) {
        throw new Error(`sanskar: ${v.id} has empty meaningEn`);
      }

      // lines.length === linesEn.length for every verse
      if (v.lines.length !== v.linesEn.length) {
        throw new Error(
          `sanskar: ${v.id} lines/linesEn length mismatch (${v.lines.length} vs ${v.linesEn.length})`
        );
      }
    }
  }
})();
