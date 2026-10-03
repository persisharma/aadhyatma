/**
 * The theme registry, in reading order. A theme's position here IS its
 * chapter number in the reader (`GitaSaarReader {chapter}`), so append new
 * themes at the end — reordering renumbers every saved bookmark and progress
 * row for this source. Loaded through a `require()` thunk from `../index.ts`
 * (launch-graph rule); nothing on the launch path may import this module.
 *
 * Order follows docs/roadmap/gita-saar-themes.md: the moods people search at
 * night first, then the everyday questions, then the deeper topics.
 */
import type { GitaSaarTheme } from '../types';
import { TRUE_PREMA_THEME } from './true-prema';
import { BHAY_CHINTA_THEME } from './bhay-chinta';
import { SHOK_THEME } from './shok';
import { KRODH_THEME } from './krodh';
import { KARMA_THEME } from './karma';
import { GUNA_THEME } from './guna';
import { MAN_THEME } from './man';
import { SANSHAY_THEME } from './sanshay';
import { SHARANAGATI_THEME } from './sharanagati';
import { STHITAPRAJNA_THEME } from './sthitaprajna';
import { KAMNA_SANTOSH_THEME } from './kamna-santosh';
import { SAFALTA_THEME } from './safalta';
import { ATMA_THEME } from './atma';
import { AKELA_THEME } from './akela';
import { DAIVI_THEME } from './daivi';
import { DHYAN_THEME } from './dhyan';

export const GITA_SAAR_THEMES: readonly GitaSaarTheme[] = [
  TRUE_PREMA_THEME,
  BHAY_CHINTA_THEME,
  SHOK_THEME,
  KRODH_THEME,
  KARMA_THEME,
  GUNA_THEME,
  MAN_THEME,
  SANSHAY_THEME,
  SHARANAGATI_THEME,
  STHITAPRAJNA_THEME,
  KAMNA_SANTOSH_THEME,
  SAFALTA_THEME,
  ATMA_THEME,
  AKELA_THEME,
  DAIVI_THEME,
  DHYAN_THEME,
];
