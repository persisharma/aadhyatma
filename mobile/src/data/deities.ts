import type { Deity } from './texts';

export type DeityIconKey =
  | 'bowArrow'
  | 'bansuriPeacockFeather'
  | 'chakra'
  | 'trishul'
  | 'gada'
  | 'lotus'
  | 'modak'
  | 'surya'
  | 'veena';

export type DeityMeta = {
  id: Deity;
  nameHi: string;
  nameEn: string;
  iconKey: DeityIconKey;
};

export const deities: readonly DeityMeta[] = [
  { id: 'rama', nameHi: 'श्री राम', nameEn: 'Shri Rama', iconKey: 'bowArrow' },
  {
    id: 'krishna',
    nameHi: 'श्री कृष्ण',
    nameEn: 'Shri Krishna',
    iconKey: 'bansuriPeacockFeather',
  },
  { id: 'vishnu', nameHi: 'श्री विष्णु', nameEn: 'Shri Vishnu', iconKey: 'chakra' },
  { id: 'shiva', nameHi: 'श्री शिव', nameEn: 'Shri Shiva', iconKey: 'trishul' },
  { id: 'hanuman', nameHi: 'श्री हनुमान', nameEn: 'Shri Hanuman', iconKey: 'gada' },
  { id: 'durga', nameHi: 'माँ दुर्गा', nameEn: 'Maa Durga', iconKey: 'lotus' },
  { id: 'ganesha', nameHi: 'श्री गणेश', nameEn: 'Shri Ganesha', iconKey: 'modak' },
  { id: 'savitr', nameHi: 'माँ गायत्री', nameEn: 'Maa Gayatri', iconKey: 'surya' },
  { id: 'saraswati', nameHi: 'माँ सरस्वती', nameEn: 'Maa Saraswati', iconKey: 'veena' },
  { id: 'lakshmi', nameHi: 'माँ लक्ष्मी', nameEn: 'Maa Lakshmi', iconKey: 'lotus' },
];
