import { library, type Deity } from '@/data/texts';
import { findJapamMantra } from '@/data/japam';
import { getVidhiById } from '@/data/vidhi';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import type { RoutineItem } from './types';

/** Reuse approved, published R2 paintings; internal Sadhana only. */
export const practiceDeityStems: Readonly<Record<Deity, string>> = {
  rama: 'deity-rama-darbar', krishna: 'deity-krishna-bansuri',
  vishnu: 'source-vishnu-narayana', shiva: 'shiva', hanuman: 'hanuman-sita',
  durga: 'deity-durga-lion', ganesha: 'deity-ganesha-modak',
  savitr: 'source-gayatri-savitri-sun', saraswati: 'deity-saraswati-veena',
  lakshmi: 'deity-lakshmi', surya: 'deity-surya', radha: 'deity-radha-krishna',
  kartikeya: 'theerth-vetrimalai-murugan', kubera: 'deity-kubera', ganga: 'deity-ganga',
  parvati: 'deity-parvati-bhavani', narasimha: 'deity-narasimha-prahlad',
  dattatreya: 'deity-dattatreya', shani: 'deity-shani', kali: 'deity-kali',
  navagraha: 'deity-navagraha-icons',
};

export function practiceArtwork(item: RoutineItem) {
  const deities = item.kind === 'japam'
    ? findJapamMantra(item.sourceId)?.deities
    : item.kind === 'vidhi'
      ? getVidhiById(item.sourceId)?.deities
      : library.find(entry => entry.id === item.sourceId)?.deities;
  const deity = deities?.[0];
  const stem = deity && Object.prototype.hasOwnProperty.call(practiceDeityStems, deity)
    ? practiceDeityStems[deity as Deity] : 'category-granth-open-scripture';
  return readerIllustrationAsset(stem);
}

/** Normalized portrait centres reviewed against the published full paintings. */
export const practicePortraitFrames: Readonly<Record<string, { x: number; y: number; zoom: number }>> = {
  'deity-rama-darbar': { x: 0.50, y: 0.47, zoom: 2.5 },
  'deity-krishna-bansuri': { x: 0.48, y: 0.25, zoom: 2.7 },
  'source-vishnu-narayana': { x: 0.29, y: 0.46, zoom: 2.6 },
  shiva: { x: 0.45, y: 0.27, zoom: 2.7 },
  'hanuman-sita': { x: 0.34, y: 0.40, zoom: 2.2 },
  'deity-durga-lion': { x: 0.51, y: 0.31, zoom: 2.5 },
  'deity-ganesha-modak': { x: 0.49, y: 0.36, zoom: 2.2 },
  'source-gayatri-savitri-sun': { x: 0.50, y: 0.34, zoom: 1.7 },
  'deity-saraswati-veena': { x: 0.50, y: 0.27, zoom: 2.5 },
  'deity-lakshmi': { x: 0.50, y: 0.24, zoom: 2.5 },
  'deity-surya': { x: 0.50, y: 0.36, zoom: 2.5 },
  'deity-radha-krishna': { x: 0.47, y: 0.27, zoom: 2.5 },
  'theerth-vetrimalai-murugan': { x: 0.50, y: 0.28, zoom: 2.6 },
  'deity-kubera': { x: 0.58, y: 0.28, zoom: 2.5 },
  'deity-ganga': { x: 0.52, y: 0.24, zoom: 2.5 },
  'deity-parvati-bhavani': { x: 0.50, y: 0.27, zoom: 2.5 },
  'deity-narasimha-prahlad': { x: 0.51, y: 0.33, zoom: 2.5 },
  'deity-dattatreya': { x: 0.49, y: 0.23, zoom: 2.2 },
  'deity-shani': { x: 0.50, y: 0.29, zoom: 2.5 },
  'deity-kali': { x: 0.50, y: 0.29, zoom: 2.5 },
};
