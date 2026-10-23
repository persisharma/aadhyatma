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
