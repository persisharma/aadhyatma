/**
 * Vedansh Guna Milan convention v1.
 *
 * This file is deliberately data-only. The source and variant decisions are
 * pinned in docs/roadmap/conventions/guna-milan-v1.md. Do not replace one
 * matrix in isolation: the eight tables together define the versioned result.
 */

export const GUNA_MILAN_CONVENTION_VERSION = 'vedansh-ashtakoota-v1' as const;

export type Varna = 'brahmin' | 'kshatriya' | 'vaishya' | 'shudra';
export type Vashya = 'chatushpada' | 'manava' | 'jalachara' | 'vanachara' | 'keeta';
export type Yoni =
  | 'horse' | 'elephant' | 'sheep' | 'serpent' | 'dog' | 'cat' | 'rat'
  | 'cow' | 'buffalo' | 'tiger' | 'deer' | 'monkey' | 'mongoose' | 'lion';
export type Gana = 'deva' | 'manushya' | 'rakshasa';
export type Nadi = 'adi' | 'madhya' | 'antya';
export type RashiLord = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

export const VARNA_BY_RASHI: readonly Varna[] = [
  'kshatriya', 'vaishya', 'shudra', 'brahmin',
  'kshatriya', 'vaishya', 'shudra', 'brahmin',
  'kshatriya', 'vaishya', 'shudra', 'brahmin',
];

export const VARNA_RANK: Readonly<Record<Varna, number>> = {
  shudra: 0,
  vaishya: 1,
  kshatriya: 2,
  brahmin: 3,
};

export const VASHYA_ORDER: readonly Vashya[] = [
  'chatushpada', 'manava', 'jalachara', 'vanachara', 'keeta',
];

/** Rows are bride, columns groom. Direction is part of the convention. */
export const VASHYA_SCORE: readonly (readonly number[])[] = [
  [2, 0.5, 1, 0, 2],
  [0.5, 2, 0, 0, 0],
  [1, 0, 2, 2, 2],
  [0, 0, 2, 2, 0],
  [1, 0, 1, 0, 2],
];

export const YONI_ORDER: readonly Yoni[] = [
  'horse', 'elephant', 'sheep', 'serpent', 'dog', 'cat', 'rat',
  'cow', 'buffalo', 'tiger', 'deer', 'monkey', 'mongoose', 'lion',
];

export const YONI_BY_NAKSHATRA: readonly Yoni[] = [
  'horse', 'elephant', 'sheep', 'serpent', 'serpent', 'dog', 'cat',
  'sheep', 'cat', 'rat', 'rat', 'cow', 'buffalo', 'tiger', 'buffalo',
  'tiger', 'deer', 'deer', 'dog', 'monkey', 'mongoose', 'monkey',
  'lion', 'horse', 'lion', 'cow', 'elephant',
];

/** Rows are bride, columns groom, transcribed directionally from B. V. Raman. */
export const YONI_SCORE: readonly (readonly number[])[] = [
  [4,2,2,3,2,2,2,1,0,1,3,3,2,1],
  [2,4,3,3,2,2,2,2,3,1,2,3,2,0],
  [2,3,4,2,1,2,1,3,3,1,2,0,3,1],
  [3,3,2,4,2,1,1,1,1,2,2,2,0,2],
  [2,2,1,2,4,2,1,2,2,1,0,2,1,1],
  [2,2,2,1,2,4,0,2,2,1,3,3,2,1],
  [2,2,1,1,1,0,4,2,2,2,2,2,1,2],
  [1,2,3,1,2,2,2,4,3,0,3,2,2,1],
  [0,3,3,1,2,2,2,3,4,1,2,2,2,1],
  [1,1,1,2,1,1,2,0,1,4,1,1,2,1],
  [1,2,2,2,0,3,2,3,2,1,4,2,2,1],
  [3,3,0,2,2,3,2,2,2,1,2,4,3,2],
  [2,2,3,0,1,2,1,2,2,2,2,3,4,2],
  [1,0,1,2,1,1,2,1,2,1,1,2,2,4],
];

export const GANA_BY_NAKSHATRA: readonly Gana[] = [
  'deva', 'manushya', 'rakshasa', 'manushya', 'deva', 'manushya',
  'deva', 'deva', 'rakshasa', 'rakshasa', 'manushya', 'manushya',
  'deva', 'rakshasa', 'deva', 'rakshasa', 'deva', 'rakshasa',
  'rakshasa', 'manushya', 'manushya', 'deva', 'rakshasa', 'rakshasa',
  'manushya', 'manushya', 'deva',
];

export const GANA_ORDER: readonly Gana[] = ['deva', 'manushya', 'rakshasa'];

/** Rows are groom, columns bride. */
export const GANA_SCORE: readonly (readonly number[])[] = [
  [6, 6, 0],
  [5, 6, 0],
  [1, 0, 6],
];

export const RASHI_LORD_BY_RASHI: readonly RashiLord[] = [
  'mars', 'venus', 'mercury', 'moon', 'sun', 'mercury',
  'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter',
];

export const RASHI_LORD_ORDER: readonly RashiLord[] = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn',
];

/** Rows are bride's lord, columns groom's lord. */
export const GRAHA_MAITRI_SCORE: readonly (readonly number[])[] = [
  [5,5,5,4,5,0,0],
  [5,5,4,1,4,0.5,0.5],
  [5,4,5,0.5,5,3,0.5],
  [4,1,0.5,5,0.5,5,4],
  [5,4,5,0.5,5,0.5,3],
  [0,0.5,3,5,0.5,5,5],
  [0,0.5,0.5,4,3,5,5],
];

export const NADI_BY_NAKSHATRA: readonly Nadi[] = [
  'adi', 'madhya', 'antya', 'antya', 'madhya', 'adi', 'adi', 'madhya', 'antya',
  'antya', 'madhya', 'adi', 'adi', 'madhya', 'antya', 'antya', 'madhya', 'adi',
  'adi', 'madhya', 'antya', 'antya', 'madhya', 'adi', 'adi', 'madhya', 'antya',
];

export const SCORE_BANDS = [
  { id: 'excellent', min: 31, max: 36 },
  { id: 'very-good', min: 21, max: 30.999999 },
  { id: 'middling', min: 17, max: 20.999999 },
  { id: 'below-reference', min: 0, max: 16.999999 },
] as const;

export const KOOTA_MAX = {
  varna: 1,
  vashya: 2,
  tara: 3,
  yoni: 4,
  grahaMaitri: 5,
  gana: 6,
  bhakoot: 7,
  nadi: 8,
} as const;
