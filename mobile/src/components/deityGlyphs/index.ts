import type { ComponentType } from 'react';

import type { DeityIconKey } from '@/data/deities';

import BansuriPeacockFeatherGlyph from './bansuriPeacockFeather';
import ChakraGlyph from './chakra';
import GadaGlyph from './gada';
import GangaGlyph from './ganga';
import KartikeyaGlyph from './kartikeya';
import KuberaGlyph from './kubera';
import ModakGlyph from './modak';
import NavagrahaGlyph from './navagraha';
import ParvatiGlyph from './parvati';
import ShaniGlyph from './shani';
import SuryaGlyph from './surya';
import SuryadevGlyph from './suryadev';
import VeenaGlyph from './veena';

/**
 * Registry of hand-built View-composition glyphs, one per deity icon key
 * (design.md §42). Temporarily Partial while the remaining keys are being
 * converted from the interim emoji path; flips to a total Record once all
 * 21 keys have drawn glyphs.
 */
export const deityGlyphs: Partial<Record<DeityIconKey, ComponentType>> = {
  bansuriPeacockFeather: BansuriPeacockFeatherGlyph,
  chakra: ChakraGlyph,
  gada: GadaGlyph,
  ganga: GangaGlyph,
  kartikeya: KartikeyaGlyph,
  kubera: KuberaGlyph,
  modak: ModakGlyph,
  navagraha: NavagrahaGlyph,
  parvati: ParvatiGlyph,
  shani: ShaniGlyph,
  surya: SuryaGlyph,
  suryadev: SuryadevGlyph,
  veena: VeenaGlyph,
};
