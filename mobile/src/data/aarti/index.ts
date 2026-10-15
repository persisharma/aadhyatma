import omJaiJagdish from './om-jai-jagdish.json';
import hanumanAarti from './hanuman-aarti.json';
import jaiGaneshDeva from './jai-ganesh-deva.json';
import omJaiShivOmkara from './om-jai-shiv-omkara.json';
import jaiAmbeGauri from './jai-ambe-gauri.json';
import aartiKunjBihari from './aarti-kunj-bihari.json';
import saraswatiAarti from './saraswati-aarti.json';
import gayatriAarti from './gayatri-aarti.json';
import khatuShyamAarti from './khatu-shyam-aarti.json';
import omJaiLakshmiMata from './om-jai-lakshmi-mata.json';
import omJaiGangeMata from './om-jai-gange-mata.json';
import ambeTuHaiJagdambeKali from './ambe-tu-hai-jagdambe-kali.json';
import shaniAarti from './shani-aarti.json';
import kuberaAarti from './kubera-aarti.json';
import santoshiMataAarti from './santoshi-mata-aarti.json';
import ahoiMataAarti from './ahoi-mata-aarti.json';
import vaishnoDeviAarti from './vaishno-devi-aarti.json';
import ekadashiMataAarti from './ekadashi-mata-aarti.json';
import tulsiAarti from './tulsi-aarti.json';
import shakambhariAarti from './shakambhari-aarti.json';
import { aartiIdByIndex } from './ids';
import jayAdhyaShakti from './jay-adhya-shakti.json';

export { aartiIdByIndex, aartiIndexById, type AartiId } from './ids';

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
  khatuShyamAarti as AartiData,
  omJaiLakshmiMata as AartiData,
  jayAdhyaShakti as AartiData,
  omJaiGangeMata as AartiData,
  ambeTuHaiJagdambeKali as AartiData,
  shaniAarti as AartiData,
  kuberaAarti as AartiData,
  santoshiMataAarti as AartiData,
  ahoiMataAarti as AartiData,
  vaishnoDeviAarti as AartiData,
  ekadashiMataAarti as AartiData,
  tulsiAarti as AartiData,
  shakambhariAarti as AartiData,
];

export const aartiTitleHi = 'आरती संग्रह';
export const aartiTitleEn = 'Aarti Collection';

export function getAarti(index: number): AartiData {
  if (index < 0 || index >= aartiCollection.length) {
    throw new Error(`aarti: index ${index} out of range (0-${aartiCollection.length - 1})`);
  }
  return aartiCollection[index];
}

(function assertAartiInvariants() {
  if (aartiCollection.length !== aartiIdByIndex.length) {
    throw new Error(`aarti: expected ${aartiIdByIndex.length} aartis, got ${aartiCollection.length}`);
  }
  const seenIds = new Set<string>();
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
  }
})();
