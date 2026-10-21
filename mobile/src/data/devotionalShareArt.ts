import type { DevotionalArt } from '@/utils/devotionalShareLayout';

export const devotionalSourceArt: Readonly<Record<string, DevotionalArt>> = {
  'bhagavad-gita': 'krishna', 'krishna-stotram': 'krishna',
  'shiva-strotam': 'shiva', 'om-namah-shivaya': 'shiva',
  'durga-stotram': 'durga', 'saraswati-stotram': 'saraswati',
  'saraswati-moola-mantra': 'saraswati', 'vidyarambha-prarthana': 'saraswati',
  'ganesh-stotram': 'ganesha', 'vishnu-sahasranama': 'vishnu',
  'om-namo-bhagavate-vasudevaya': 'vishnu', 'hanuman-ashtak': 'hanuman',
  sundarkand: 'hanuman', 'bajrang-baan': 'hanuman', 'ram-stuti': 'rama',
  ramcharitmanas: 'rama', 'valmiki-ramayan': 'rama', 'hare-krishna-mahamantra': 'krishna',
  'gayatri-mantra': 'surya', 'surya-namaskar': 'surya', 'bhojan-mantra': 'krishna',
  'gau-seva': 'prayer', 'matribhumi-vandana': 'prayer', 'prabhati-shloka': 'prayer',
  'sandhya-deepam': 'prayer', 'tulsi-puja': 'prayer', 'ratri-shloka': 'rama',
  // Chalisas, aartis, ashtakams, suktams, kavachs and stutis: a painted deity
  // only when the text is addressed to it by name, else the neutral plate.
  'gayatri-chalisa': 'prayer', 'khatu-shyam-chalisa': 'prayer', 'lakshmi-chalisa': 'prayer',
  'gayatri-aarti': 'prayer', 'khatu-shyam-aarti': 'prayer', 'om-jai-lakshmi-mata': 'prayer',
  'shani-aarti': 'prayer', 'dattatreya-aarti': 'prayer', 'om-jai-gange-mata': 'prayer',
  'ambe-tu-hai-jagdambe-kali': 'prayer', 'kubera-aarti': 'prayer', 'santoshi-mata-aarti': 'prayer',
  'ahoi-mata-aarti': 'prayer', 'vaishno-devi-aarti': 'prayer', 'ekadashi-mata-aarti': 'prayer',
  'tulsi-aarti': 'prayer', 'shakambhari-aarti': 'prayer',
  'mahalakshmi-ashtakam': 'prayer', radhashtakam: 'prayer', 'subrahmanya-ashtakam': 'prayer',
  gangashtakam: 'prayer', 'narasimha-ashtakam': 'prayer', 'datta-ashtakam': 'prayer',
  'shani-ashtakam': 'prayer', 'kalika-ashtakam': 'prayer',
  'kubera-stotram': 'prayer', 'navagraha-stotram': 'prayer',
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
