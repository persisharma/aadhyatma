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

export type ChalisaId = 'hanuman-chalisa' | 'shiv-chalisa' | 'durga-chalisa' | 'ganesh-chalisa';

export type ChalisaVerse =
  | HanumanChalisaVerse
  | ShivChalisaVerse
  | DurgaChalisaVerse
  | GaneshChalisaVerse;

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
};

export function getChalisa(id: string | undefined): ChalisaPayload {
  if (id && id in registry) return registry[id as ChalisaId];
  return registry['hanuman-chalisa'];
}
