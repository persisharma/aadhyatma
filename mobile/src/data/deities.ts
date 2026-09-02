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
  | 'veena'
  // PRD-A deity expansion (§A.4.2) — drawn glyphs live in components/deityGlyphs/.
  | 'lakshmi'
  | 'suryadev'
  | 'radha'
  | 'kartikeya'
  | 'kubera'
  | 'ganga'
  | 'parvati'
  | 'narasimha'
  | 'dattatreya'
  | 'shani'
  | 'kali'
  | 'navagraha';

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
  // ─── PRD-A deity expansion (§A.4.2) — 9 → 21, each shipped with ≥1 verified text ───
  { id: 'lakshmi', nameHi: 'माँ लक्ष्मी', nameEn: 'Maa Lakshmi', iconKey: 'lakshmi' },
  { id: 'surya', nameHi: 'सूर्य देव', nameEn: 'Surya Dev', iconKey: 'suryadev' },
  { id: 'radha', nameHi: 'राधा रानी', nameEn: 'Radha Rani', iconKey: 'radha' },
  { id: 'kartikeya', nameHi: 'कार्तिकेय', nameEn: 'Kartikeya', iconKey: 'kartikeya' },
  { id: 'kubera', nameHi: 'कुबेर', nameEn: 'Kubera', iconKey: 'kubera' },
  { id: 'ganga', nameHi: 'माँ गंगा', nameEn: 'Maa Ganga', iconKey: 'ganga' },
  { id: 'parvati', nameHi: 'माँ पार्वती', nameEn: 'Maa Parvati', iconKey: 'parvati' },
  { id: 'narasimha', nameHi: 'नरसिंह', nameEn: 'Narasimha', iconKey: 'narasimha' },
  { id: 'dattatreya', nameHi: 'दत्तात्रेय', nameEn: 'Dattatreya', iconKey: 'dattatreya' },
  { id: 'shani', nameHi: 'शनि देव', nameEn: 'Shani Dev', iconKey: 'shani' },
  { id: 'kali', nameHi: 'माँ काली', nameEn: 'Maa Kali', iconKey: 'kali' },
  { id: 'navagraha', nameHi: 'नवग्रह', nameEn: 'Navagraha', iconKey: 'navagraha' },
];

const deityById: Record<Deity, DeityMeta> = Object.fromEntries(
  deities.map((d) => [d.id, d])
) as Record<Deity, DeityMeta>;

/** Full metadata for a deity id. */
export function getDeityMeta(id: Deity): DeityMeta {
  return deityById[id];
}

/** The glyph icon key for a deity id — feed straight to `<DeityIcon />`. */
export function deityIconKey(id: Deity): DeityIconKey {
  return deityById[id].iconKey;
}
