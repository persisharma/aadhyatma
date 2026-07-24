import type { ComponentType } from 'react';

import type { DeityIconKey } from '@/data/deities';

import BansuriPeacockFeatherGlyph from './bansuriPeacockFeather';
import GadaGlyph from './gada';
import ModakGlyph from './modak';
import VeenaGlyph from './veena';

/**
 * Registry of hand-built View-composition glyphs, one per deity icon key
 * (design.md §42). Temporarily Partial while the remaining keys are being
 * converted from the interim emoji path; flips to a total Record once all
 * 21 keys have drawn glyphs.
 */
export const deityGlyphs: Partial<Record<DeityIconKey, ComponentType>> = {
  bansuriPeacockFeather: BansuriPeacockFeatherGlyph,
  gada: GadaGlyph,
  modak: ModakGlyph,
  veena: VeenaGlyph,
};
