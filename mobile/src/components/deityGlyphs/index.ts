import type { ComponentType } from 'react';

import type { DeityIconKey } from '@/data/deities';

import BansuriPeacockFeatherGlyph from './bansuriPeacockFeather';
import BowArrowGlyph from './bowArrow';
import ChakraGlyph from './chakra';
import DattatreyaGlyph from './dattatreya';
import GadaGlyph from './gada';
import GangaGlyph from './ganga';
import KaliGlyph from './kali';
import KartikeyaGlyph from './kartikeya';
import KuberaGlyph from './kubera';
import LakshmiGlyph from './lakshmi';
import LotusGlyph from './lotus';
import ModakGlyph from './modak';
import NarasimhaGlyph from './narasimha';
import NavagrahaGlyph from './navagraha';
import ParvatiGlyph from './parvati';
import RadhaGlyph from './radha';
import ShaniGlyph from './shani';
import SuryaGlyph from './surya';
import SuryadevGlyph from './suryadev';
import TrishulGlyph from './trishul';
import VeenaGlyph from './veena';

/**
 * Registry of hand-built View-composition glyphs, one per deity icon key
 * (design.md §42). The Record is total over DeityIconKey, so a deity added
 * without a drawn glyph is a typecheck error — never a blank avatar.
 */
export const deityGlyphs: Record<DeityIconKey, ComponentType> = {
  bansuriPeacockFeather: BansuriPeacockFeatherGlyph,
  bowArrow: BowArrowGlyph,
  chakra: ChakraGlyph,
  dattatreya: DattatreyaGlyph,
  gada: GadaGlyph,
  ganga: GangaGlyph,
  kali: KaliGlyph,
  kartikeya: KartikeyaGlyph,
  kubera: KuberaGlyph,
  lakshmi: LakshmiGlyph,
  lotus: LotusGlyph,
  modak: ModakGlyph,
  narasimha: NarasimhaGlyph,
  navagraha: NavagrahaGlyph,
  parvati: ParvatiGlyph,
  radha: RadhaGlyph,
  shani: ShaniGlyph,
  surya: SuryaGlyph,
  suryadev: SuryadevGlyph,
  trishul: TrishulGlyph,
  veena: VeenaGlyph,
};
