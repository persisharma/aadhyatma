import type { Deity } from './texts';

export type DeityMeta = {
  id: Deity;
  nameHi: string;
  nameEn: string;
};

export const deities: readonly DeityMeta[] = [
  { id: 'rama', nameHi: 'श्री राम', nameEn: 'Shri Rama' },
  { id: 'krishna', nameHi: 'श्री कृष्ण', nameEn: 'Shri Krishna' },
  { id: 'shiva', nameHi: 'श्री शिव', nameEn: 'Shri Shiva' },
  { id: 'hanuman', nameHi: 'श्री हनुमान', nameEn: 'Shri Hanuman' },
  { id: 'durga', nameHi: 'माँ दुर्गा', nameEn: 'Maa Durga' },
  { id: 'ganesha', nameHi: 'श्री गणेश', nameEn: 'Shri Ganesha' },
];
