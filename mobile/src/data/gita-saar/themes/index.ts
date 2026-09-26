/**
 * The theme registry, in reading order. A theme's position here IS its
 * chapter number in the reader (`GitaSaarReader {chapter}`), so append new
 * themes at the end — reordering renumbers every saved bookmark and progress
 * row for this source. Loaded through a `require()` thunk from `../index.ts`
 * (launch-graph rule); nothing on the launch path may import this module.
 */
import type { GitaSaarTheme } from '../types';
import { TRUE_PREMA_THEME } from './true-prema';

export const GITA_SAAR_THEMES: readonly GitaSaarTheme[] = [TRUE_PREMA_THEME];
