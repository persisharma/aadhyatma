import {
  hanumanChalisaTitleEn,
  hanumanChalisaTitleHi,
  hanumanChalisaVerses,
  type HanumanChalisaVerse,
} from './hanuman-chalisa';
import {
  shivChalisaTitleEn,
  shivChalisaTitleHi,
  shivChalisaVerses,
  type ShivChalisaVerse,
} from './shiv-chalisa';
import {
  durgaChalisaTitleEn,
  durgaChalisaTitleHi,
  durgaChalisaVerses,
  type DurgaChalisaVerse,
} from './durga-chalisa';
import {
  ganeshChalisaTitleEn,
  ganeshChalisaTitleHi,
  ganeshChalisaVerses,
  type GaneshChalisaVerse,
} from './ganesh-chalisa';
import {
  lakshmiChalisaTitleEn,
  lakshmiChalisaTitleHi,
  lakshmiChalisaVerses,
  type LakshmiChalisaVerse,
} from './lakshmi-chalisa';
import {
  saraswatiChalisaTitleEn,
  saraswatiChalisaTitleHi,
  saraswatiChalisaVerses,
  type SaraswatiChalisaVerse,
} from './saraswati-chalisa';
import {
  vishnuChalisaTitleEn,
  vishnuChalisaTitleHi,
  vishnuChalisaVerses,
  type VishnuChalisaVerse,
} from './vishnu-chalisa';
import {
  krishnaChalisaTitleEn,
  krishnaChalisaTitleHi,
  krishnaChalisaVerses,
  type KrishnaChalisaVerse,
} from './krishna-chalisa';
import {
  ramChalisaTitleEn,
  ramChalisaTitleHi,
  ramChalisaVerses,
  type RamChalisaVerse,
} from './ram-chalisa';

export type ChalisaId = 'hanuman-chalisa' | 'shiv-chalisa' | 'durga-chalisa' | 'ganesh-chalisa' | 'lakshmi-chalisa' | 'saraswati-chalisa' | 'vishnu-chalisa' | 'krishna-chalisa' | 'ram-chalisa';

export type ChalisaVerse =
  | HanumanChalisaVerse
  | ShivChalisaVerse
  | DurgaChalisaVerse
  | GaneshChalisaVerse
  | LakshmiChalisaVerse
  | SaraswatiChalisaVerse
  | VishnuChalisaVerse
  | KrishnaChalisaVerse
  | RamChalisaVerse;

export type ChalisaPayload = {
  id: ChalisaId;
  titleHi: string;
  titleEn: string;
  verses: readonly ChalisaVerse[];
};

const registry: Record<ChalisaId, ChalisaPayload> = {
  'hanuman-chalisa': {
    id: 'hanuman-chalisa',
    titleHi: hanumanChalisaTitleHi,
    titleEn: hanumanChalisaTitleEn,
    verses: hanumanChalisaVerses,
  },
  'shiv-chalisa': {
    id: 'shiv-chalisa',
    titleHi: shivChalisaTitleHi,
    titleEn: shivChalisaTitleEn,
    verses: shivChalisaVerses,
  },
  'durga-chalisa': {
    id: 'durga-chalisa',
    titleHi: durgaChalisaTitleHi,
    titleEn: durgaChalisaTitleEn,
    verses: durgaChalisaVerses,
  },
  'ganesh-chalisa': {
    id: 'ganesh-chalisa',
    titleHi: ganeshChalisaTitleHi,
    titleEn: ganeshChalisaTitleEn,
    verses: ganeshChalisaVerses,
  },
  'lakshmi-chalisa': {
    id: 'lakshmi-chalisa',
    titleHi: lakshmiChalisaTitleHi,
    titleEn: lakshmiChalisaTitleEn,
    verses: lakshmiChalisaVerses,
  },
  'saraswati-chalisa': {
    id: 'saraswati-chalisa',
    titleHi: saraswatiChalisaTitleHi,
    titleEn: saraswatiChalisaTitleEn,
    verses: saraswatiChalisaVerses,
  },
  'vishnu-chalisa': {
    id: 'vishnu-chalisa',
    titleHi: vishnuChalisaTitleHi,
    titleEn: vishnuChalisaTitleEn,
    verses: vishnuChalisaVerses,
  },
  'krishna-chalisa': {
    id: 'krishna-chalisa',
    titleHi: krishnaChalisaTitleHi,
    titleEn: krishnaChalisaTitleEn,
    verses: krishnaChalisaVerses,
  },
  'ram-chalisa': {
    id: 'ram-chalisa',
    titleHi: ramChalisaTitleHi,
    titleEn: ramChalisaTitleEn,
    verses: ramChalisaVerses,
  },
};

export function getChalisa(id: string | undefined): ChalisaPayload {
  if (id && id in registry) return registry[id as ChalisaId];
  return registry['hanuman-chalisa'];
}
