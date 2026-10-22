import type { DevotionalArt } from '@/utils/devotionalShareLayout';
import type { CachedAssetRequest } from '@/utils/assetCache';
import { assetBaseUrl, remoteAssetRequest, type RemoteAssetManifest } from './assetManifest';
import devotionalShareManifestJson from './devotionalShareManifest.json';

const devotionalShareManifest: RemoteAssetManifest = devotionalShareManifestJson;

/** Complete portrait paintings; every card slice uses its own master. */
export const devotionalSubjectArt = {
  'lakshmi': 'lakshmi',
  'khatu-shyam': 'khatu-shyam',
  'shani': 'shani',
  'dattatreya': 'dattatreya',
  'ganga': 'ganga',
  'kali': 'kali',
  'kubera': 'kubera',
  'radha': 'radha',
  'kartikeya': 'kartikeya',
  'narasimha': 'narasimha',
  'navagraha': 'navagraha',
  'gayatri': 'gayatri',
  'santoshi': 'santoshi',
  'ahoi': 'ahoi',
  'vaishno': 'vaishno',
  'ekadashi': 'ekadashi',
  'tulsi': 'tulsi',
  'shakambhari': 'shakambhari',
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
/**
 * The complete portrait masters ship from R2 (prefix `devotional-share`), not the bundle.
 * `mobile/assets/devotional-share/` keeps the reviewed sources and their provenance;
 * `scripts/prepare-devotional-share.mjs` publishes them and writes this manifest.
 */
export function devotionalArtRequest(art: DevotionalArt): CachedAssetRequest | null {
  return remoteAssetRequest(devotionalShareManifest, art, assetBaseUrl());
}
