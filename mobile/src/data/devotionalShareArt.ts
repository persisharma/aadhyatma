import type { DevotionalArt } from '@/utils/devotionalShareLayout';

/** Complete portrait paintings; every card slice uses its own master. */
export const devotionalSubjectArt = {
  'lakshmi': () => require('@assets/devotional-share/master-lakshmi.webp'),
  'khatu-shyam': () => require('@assets/devotional-share/master-khatu-shyam.webp'),
  'shani': () => require('@assets/devotional-share/master-shani.webp'),
  'dattatreya': () => require('@assets/devotional-share/master-dattatreya.webp'),
  'ganga': () => require('@assets/devotional-share/master-ganga.webp'),
  'kali': () => require('@assets/devotional-share/master-kali.webp'),
  'kubera': () => require('@assets/devotional-share/master-kubera.webp'),
  'radha': () => require('@assets/devotional-share/master-radha.webp'),
  'kartikeya': () => require('@assets/devotional-share/master-kartikeya.webp'),
  'narasimha': () => require('@assets/devotional-share/master-narasimha.webp'),
  'navagraha': () => require('@assets/devotional-share/master-navagraha.webp'),
  'gayatri': () => require('@assets/devotional-share/master-gayatri.webp'),
  'santoshi': () => require('@assets/devotional-share/master-santoshi.webp'),
  'ahoi': () => require('@assets/devotional-share/master-ahoi.webp'),
  'vaishno': () => require('@assets/devotional-share/master-vaishno.webp'),
  'ekadashi': () => require('@assets/devotional-share/master-ekadashi.webp'),
  'tulsi': () => require('@assets/devotional-share/master-tulsi.webp'),
  'shakambhari': () => require('@assets/devotional-share/master-shakambhari.webp'),
} as const;
export type DevotionalSubjectArt = keyof typeof devotionalSubjectArt;
export function isDevotionalSubjectArt(art: DevotionalArt): art is DevotionalSubjectArt {
  return Object.prototype.hasOwnProperty.call(devotionalSubjectArt, art);
}
export function devotionalPlateArt(art: DevotionalArt) {
  return art === 'prayer' ? 'ganesha' : art;
}

export const devotionalSourceArt: Readonly<Record<string, DevotionalArt>> = {
  'bhagavad-gita': 'krishna', 'krishna-stotram': 'krishna',
  'shiva-strotam': 'shiva', 'om-namah-shivaya': 'shiva', 'mahamrityunjaya-mantra': 'shiva',
  'durga-stotram': 'durga', 'saraswati-stotram': 'saraswati',
  'saraswati-moola-mantra': 'saraswati', 'vidyarambha-prarthana': 'saraswati',
  'ganesh-stotram': 'ganesha', 'vishnu-sahasranama': 'vishnu',
  'om-namo-bhagavate-vasudevaya': 'vishnu', 'hanuman-ashtak': 'hanuman',
  sundarkand: 'hanuman', 'bajrang-baan': 'hanuman', 'ram-stuti': 'rama',
  ramcharitmanas: 'rama', 'valmiki-ramayan': 'rama', 'hare-krishna-mahamantra': 'krishna',
  'gayatri-mantra': 'surya', 'surya-namaskar': 'surya', 'bhojan-mantra': 'krishna',
  'ganapati-gam-mantra': 'ganesha', 'om-namo-narayanaya': 'vishnu',
  'hanuman-moola-mantra': 'hanuman', 'shri-ram-jai-ram': 'rama', 'durga-beej-mantra': 'durga',
  'surya-beej-mantra': 'surya',
  'gau-seva': 'prayer', 'matribhumi-vandana': 'prayer', 'prabhati-shloka': 'prayer',
  'sandhya-deepam': 'prayer', 'tulsi-puja': 'tulsi', 'ratri-shloka': 'rama',
  // Chalisas, aartis, ashtakams, suktams, kavachs and stutis: a painted deity
  // only when the text is addressed to it by name; general prayers retain the neutral plate.
  'gayatri-chalisa': 'gayatri', 'khatu-shyam-chalisa': 'khatu-shyam', 'lakshmi-chalisa': 'lakshmi',
  'gayatri-aarti': 'gayatri', 'khatu-shyam-aarti': 'khatu-shyam', 'om-jai-lakshmi-mata': 'lakshmi',
  'shani-aarti': 'shani', 'dattatreya-aarti': 'dattatreya', 'om-jai-gange-mata': 'ganga',
  'ambe-tu-hai-jagdambe-kali': 'kali', 'kubera-aarti': 'kubera', 'santoshi-mata-aarti': 'santoshi',
  'ahoi-mata-aarti': 'ahoi', 'vaishno-devi-aarti': 'vaishno', 'ekadashi-mata-aarti': 'ekadashi',
  'tulsi-aarti': 'tulsi', 'shakambhari-aarti': 'shakambhari',
  'mahalakshmi-ashtakam': 'lakshmi', radhashtakam: 'radha', 'subrahmanya-ashtakam': 'kartikeya',
  gangashtakam: 'ganga', 'narasimha-ashtakam': 'narasimha', 'datta-ashtakam': 'dattatreya',
  'shani-ashtakam': 'shani', 'kalika-ashtakam': 'kali',
  'kubera-stotram': 'kubera', 'navagraha-stotram': 'navagraha',
  'hanuman-chalisa': 'hanuman', 'hanuman-aarti': 'hanuman',
  'shiv-chalisa': 'shiva', 'om-jai-shiv-omkara': 'shiva', lingashtakam: 'shiva',
  rudrashtakam: 'shiva', 'shiva-kavacham': 'shiva',
  'durga-chalisa': 'durga', 'jai-ambe-gauri': 'durga', 'jay-adhya-shakti': 'durga',
  'bhavani-ashtakam': 'durga', 'devi-suktam': 'durga', 'durga-kavach': 'durga',
  'durga-stuti-arjuna': 'durga',
  'ganesh-chalisa': 'ganesha', 'jai-ganesh-deva': 'ganesha', 'ganesha-kavacham': 'ganesha',
  'ram-chalisa': 'rama', 'rama-raksha-stotra': 'rama',
  'krishna-chalisa': 'krishna', 'aarti-kunj-bihari': 'krishna', madhurashtakam: 'krishna',
  achyutashtakam: 'krishna', 'krishna-stuti': 'krishna',
  'vishnu-chalisa': 'vishnu', 'om-jai-jagdish': 'vishnu', 'narayana-suktam': 'vishnu',
  'purusha-suktam': 'vishnu',
  'saraswati-chalisa': 'saraswati', 'saraswati-aarti': 'saraswati',
  'surya-chalisa': 'surya', 'surya-ashtakam': 'surya',
};
const verseArt: Readonly<Record<string, DevotionalArt>> = {
  'prabhati-shloka:3': 'ganesha', 'vidyarambha-prarthana:1': 'ganesha',
  'vidyarambha-prarthana:3': 'prayer', 'ratri-shloka:2': 'shiva',
  'ratri-shloka:3': 'prayer', 'gau-seva:1': 'krishna',
  'bhojan-mantra:2': 'prayer', 'bhojan-mantra:3': 'prayer',
};
export function devotionalArtForVerse(v: { sourceId: string; verseIndex: number }): DevotionalArt {
  return verseArt[`${v.sourceId}:${v.verseIndex}`] ?? devotionalSourceArt[v.sourceId] ?? 'prayer';
}
export function devotionalArtAsset(art: DevotionalArt): number {
  if (isDevotionalSubjectArt(art)) return devotionalSubjectArt[art]();
  switch (art) {
    case 'krishna': return require('@assets/devotional-share/krishna.webp');
    case 'shiva': return require('@assets/devotional-share/shiva.webp');
    case 'durga': return require('@assets/devotional-share/durga.webp');
    case 'saraswati': return require('@assets/devotional-share/saraswati.webp');
    case 'ganesha': return require('@assets/devotional-share/ganesha.webp');
    case 'vishnu': return require('@assets/devotional-share/vishnu.webp');
    case 'hanuman': return require('@assets/devotional-share/hanuman.webp');
    case 'rama': return require('@assets/devotional-share/rama.webp');
    case 'surya': return require('@assets/devotional-share/surya.webp');
    default: return require('@assets/devotional-share/prayer.webp');
  }
}
