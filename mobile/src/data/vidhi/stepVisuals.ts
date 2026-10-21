/**
 * An explicit editorial map, rather than title matching: the same word can
 * describe different acts in different vidhis. Paintings illustrate the shipped
 * instruction; they never supply a mantra, count, direction or extra obligation.
 * Paintings load through R2; text remains usable when art is unavailable.
 */
export const VIDHI_VISUAL_KEYS = [
  'lakshmi-pushpa', 'vastra-shringar', 'dhoop-deep', 'altar-preparation',
  'kalash', 'sankalp', 'prayer', 'water-offering', 'panchamrit', 'gandha',
  'flowers-akshat', 'naivedya', 'scripture', 'aarti', 'prasad',
  'ganesha-offering', 'ganesha-snana', 'karwa', 'moon-arghya', 'seed-bed', 'kalash-water',
  'kalash-leaves', 'coconut', 'shiva-abhishek', 'bilva', 'sesame-water',
  'tarpana', 'remembrance-vessels', 'sprouts', 'shiva-gandha',
  'lakshmi-ganesha-sthapana', 'shiva-linga', 'panchang', 'satyanarayan-naivedya',
  'asana-five-flowers', 'vastra-yajnopavita', 'chandan-akshat', 'clean-clothes',
  'diwali-naivedya', 'vrat-naivedya', 'panchopachara', 'vishnu-flowers',
  'vishnu-asana-flowers', 'sankalp-white', 'aarti-neutral', 'dhoop-deep-neutral',
  'sankalp-lotus', 'lakshmi-lotus', 'navratri-samagri', 'soil-layer',
  'grain-bed-water', 'ghata-grain-bed', 'deepmala', 'thali-phera', 'karwa-dana',
  'covered-ganesha-kalash', 'ganesha-sthapana', 'shiva-flower', 'self-water-sprinkling',
  'satyanarayan-snana', 'lakshmi-metal-snana', 'lakshmi-symbolic-snana',
  'shiva-panchamrit', 'water-offering-neutral', 'vishnu-vastra-yajnopavita',
  'dhoop-only', 'shiva-bilva-datura', 'ganesha-upachara', 'ganesha-puja',
] as const;

export type VidhiVisualKey = typeof VIDHI_VISUAL_KEYS[number];

export const VIDHI_STEP_VISUALS: Readonly<Record<string, Readonly<Record<string, VidhiVisualKey>>>> = {
  'satyanarayan-puja': {
    sthapana: 'altar-preparation', 'kalash-deep': 'kalash', sankalp: 'sankalp-lotus',
    dhyana: 'prayer', avahana: 'vishnu-flowers', asana: 'vishnu-asana-flowers',
    snana: 'satyanarayan-snana', 'vastra-yajnopavit': 'vishnu-vastra-yajnopavita', gandha: 'chandan-akshat',
    pushpa: 'vishnu-flowers', dhoop: 'dhoop-only', deep: 'aarti-neutral',
    naivedya: 'satyanarayan-naivedya', katha: 'scripture', aarti: 'aarti-neutral', 'kshama-prasad': 'satyanarayan-naivedya',
  },
  'diwali-lakshmi-ganesh-puja': {
    'sthana-sajja': 'altar-preparation', 'pratima-sthapana': 'lakshmi-ganesha-sthapana',
    'atma-shuddhi': 'self-water-sprinkling', sankalp: 'sankalp-lotus', 'kalash-deep': 'kalash',
    'ganesh-avahana': 'flowers-akshat', 'ganesh-vandana': 'prayer',
    'ganesh-upachara': 'ganesha-upachara', 'ganesh-naivedya': 'naivedya',
    'lakshmi-avahana': 'lakshmi-lotus', 'lakshmi-snana': 'lakshmi-symbolic-snana',
    'lakshmi-vastra-shringar': 'vastra-shringar', 'lakshmi-pushpa': 'lakshmi-lotus',
    'lakshmi-dhoop-deep': 'dhoop-deep-neutral', 'lakshmi-naivedya': 'diwali-naivedya',
    'mahalakshmi-path': 'scripture', 'ganesh-aarti': 'aarti-neutral', 'lakshmi-aarti': 'aarti-neutral',
    'deepa-shloka': 'aarti-neutral', 'deepmala-kshama': 'deepmala',
  },
  'ganesh-chaturthi-sthapana': {
    'sthana-sajja': 'altar-preparation', 'kalash-murti': 'covered-ganesha-kalash', sankalp: 'sankalp',
    'avahana-pratishtha': 'ganesha-sthapana', 'ganesh-vandana': 'prayer',
    'asana-padya': 'asana-five-flowers', 'arghya-achamana': 'water-offering-neutral',
    snana: 'ganesha-snana', 'vastra-yajnopavita': 'vastra-yajnopavita',
    'gandha-sindura': 'gandha', 'pushpa-durva': 'ganesha-offering',
    'dhoop-deep': 'dhoop-deep-neutral', naivedya: 'naivedya', katha: 'scripture', aarti: 'aarti-neutral',
    'pushpanjali-kshama': 'flowers-akshat', 'daily-seva': 'ganesha-puja',
  },
  'navratri-ghatasthapana': {
    'muhurat-sthana': 'panchang', 'samagri-sajja': 'navratri-samagri', sankalp: 'sankalp',
    'mrida-prathama': 'seed-bed', 'dhanya-parata': 'soil-layer',
    'kalash-jala': 'kalash-water', 'patra-dhakkana': 'kalash-leaves',
    narikela: 'coconut', 'ghata-sthapana': 'ghata-grain-bed', 'durga-avahana': 'flowers-akshat',
    panchopachara: 'panchopachara', 'devi-stuti': 'prayer', 'day-one-katha': 'scripture',
    aarti: 'aarti-neutral', 'nava-dina-seva': 'sprouts',
  },
  'karwa-chauth-puja': {
    'pratah-sankalp': 'prayer', 'vedi-sajja': 'altar-preparation', 'karwa-thali': 'karwa',
    'deep-ganesh': 'ganesha-puja', 'gaura-puja': 'flowers-akshat',
    'shiva-parivar': 'sankalp-lotus', 'karwa-offering': 'karwa', katha: 'scripture',
    'thali-phera': 'thali-phera', 'karwa-dana': 'karwa-dana', 'chandra-arghya': 'moon-arghya',
    'parana-prasad': 'prasad',
  },
  'maha-shivaratri-puja': {
    'vrat-taiyari': 'clean-clothes', 'linga-sthapana': 'shiva-linga', sankalp: 'sankalp-white',
    'dhyana-avahana': 'shiva-flower', 'asana-padya-arghya': 'water-offering-neutral',
    jalabhisheka: 'shiva-abhishek', panchamrita: 'shiva-panchamrit', shuddhodaka: 'shiva-abhishek',
    'gandha-bhasma': 'shiva-gandha', 'bilva-pushpa': 'shiva-bilva-datura', 'dhoop-deep': 'dhoop-deep-neutral',
    naivedya: 'vrat-naivedya', 'panchakshara-japa': 'prayer', katha: 'scripture', aarti: 'aarti-neutral',
    'kshama-jagaran': 'prayer',
  },
  // Deliberately flame-free, with no deity or ancestor portrait, ritual thread
  // position, compass direction, prescribed count or invented formula.
  'shraddha-tarpan-vidhi': {
    scope: 'remembrance-vessels', 'time-and-tradition': 'panchang',
    'prepare-place': 'remembrance-vessels', 'sankalpa-marker': 'prayer',
    'prepare-tila-water': 'sesame-water', 'offer-water': 'tarpana',
    'silent-remembrance': 'prayer', 'gita-15': 'scripture', 'gita-2': 'scripture',
    'close-and-clean': 'remembrance-vessels',
  },
};

export function getVidhiStepVisual(vidhiId: string, stepId: string): VidhiVisualKey | null {
  return VIDHI_STEP_VISUALS[vidhiId]?.[stepId] ?? null;
}

/** Exact reviewed sequences; compact rows use the primary assignment above. */
export const VIDHI_STEP_VISUAL_SEQUENCES: Readonly<Record<string, Readonly<Record<string, readonly VidhiVisualKey[]>>>> = {
  'satyanarayan-puja': { 'kalash-deep': ['kalash', 'aarti-neutral'] },
  'diwali-lakshmi-ganesh-puja': {
    'kalash-deep': ['kalash', 'aarti-neutral'],
    'ganesh-avahana': ['flowers-akshat', 'water-offering-neutral'],
    'ganesh-upachara': ['ganesha-snana', 'ganesha-upachara'],
    'ganesh-naivedya': ['naivedya', 'dhoop-deep-neutral'],
    // Alternatives, not two baths to perform: captions retain material conditions.
    'lakshmi-snana': ['lakshmi-metal-snana', 'lakshmi-symbolic-snana'],
    'lakshmi-aarti': ['aarti-neutral', 'lakshmi-lotus'],
  },
  'ganesh-chaturthi-sthapana': { 'asana-padya': ['asana-five-flowers', 'water-offering-neutral'] },
  'navratri-ghatasthapana': { 'dhanya-parata': ['soil-layer', 'grain-bed-water'] },
};

export function getVidhiStepVisualSequence(vidhiId: string, stepId: string): readonly VidhiVisualKey[] {
  const sequence = VIDHI_STEP_VISUAL_SEQUENCES[vidhiId]?.[stepId];
  if (sequence) return sequence;
  const visual = getVidhiStepVisual(vidhiId, stepId);
  return visual ? [visual] : [];
}

const CLAUSE_MARKERS: Readonly<Record<string, Readonly<Record<string, { hi: string; en: string }>>>> = {
  'satyanarayan-puja': { 'kalash-deep': { hi: 'फिर', en: 'then ' } },
  'diwali-lakshmi-ganesh-puja': {
    'kalash-deep': { hi: 'फिर', en: 'then ' },
    'ganesh-avahana': { hi: 'फिर', en: 'then ' },
    'ganesh-upachara': { hi: ';', en: ';' },
    'ganesh-naivedya': { hi: ';', en: ';' },
    'lakshmi-snana': { hi: ';', en: ';' },
    'lakshmi-aarti': { hi: 'फिर', en: 'then ' },
  },
  'ganesh-chaturthi-sthapana': { 'asana-padya': { hi: 'और चरण', en: 'and symbolically' } },
  'navratri-ghatasthapana': { 'dhanya-parata': { hi: ';', en: ';' } },
};

/** Exact bilingual clause boundaries are reviewed, never guessed from titles. */
export function hasVidhiVisualClauseCaptions(vidhiId: string, stepId: string): boolean {
  return !!CLAUSE_MARKERS[vidhiId]?.[stepId];
}

export function getVidhiVisualInstructionParts(vidhiId: string, stepId: string, instructionHi: string, instructionEn: string): readonly { hi: string; en: string }[] | null {
  const markers = CLAUSE_MARKERS[vidhiId]?.[stepId];
  if (!markers) return null;
  const split = (text: string, marker: string) => {
    const index = text.indexOf(marker);
    if (index < 0) return null;
    const cut = marker === ';' ? index + 1 : index;
    return [text.slice(0, cut).trimEnd(), text.slice(cut).trimStart()];
  };
  const hi = split(instructionHi, markers.hi);
  const en = split(instructionEn, markers.en);
  return hi && en ? [{ hi: hi[0], en: en[0] }, { hi: hi[1], en: en[1] }] : null;
}
