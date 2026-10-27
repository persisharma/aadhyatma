import type { ArtworkImage } from '@/data/artworkAsset';
import { readerIllustrationAsset } from '@/data/readerIllustrationAsset';
import type { ObservanceRule } from './types';
import { observancePortraitSources } from '@/components/observancePortraitSources';

export type ObservancePortrait = Readonly<{
  source: ArtworkImage;
  /** The focal point is in source coordinates; crop is independent of text. */
  frame: Readonly<{ aspect: number; x: number; y: number; zoom: number }>;
}>;

function reader(stem: string, x: number, y: number, zoom: number): ObservancePortrait {
  return { source: readerIllustrationAsset(stem), frame: { aspect: 2, x, y, zoom } };
}

// Existing approved paintings and their reviewed portrait centres, also used by
// Routine's PracticePortrait. No reading masters are added to the native bundle.
const portraits: Readonly<Record<string, ObservancePortrait>> = {
  vishnu: reader('source-vishnu-narayana', 0.29, 0.46, 2.6),
  shiva: reader('shiva', 0.45, 0.27, 2.7),
  ganesha: reader('deity-ganesha-modak', 0.49, 0.36, 2.2),
  krishna: reader('deity-krishna-bansuri', 0.48, 0.25, 2.7),
  rama: reader('deity-rama-darbar', 0.47, 0.36, 2.6),
  sita: reader('deity-rama-darbar', 0.58, 0.43, 3),
  hanuman: reader('hanuman-sita', 0.34, 0.40, 2.2),
  durga: reader('deity-durga-lion', 0.51, 0.31, 2.5),
  lakshmi: reader('deity-lakshmi', 0.50, 0.24, 2.5),
  saraswati: reader('deity-saraswati-veena', 0.50, 0.27, 2.5),
  parvati: reader('deity-parvati-bhavani', 0.50, 0.27, 2.5),
  surya: reader('deity-surya', 0.50, 0.36, 2.5),
  shani: reader('deity-shani', 0.50, 0.29, 2.5),
  'radha-krishna': reader('deity-radha-krishna', 0.47, 0.27, 2.5),
  kartikeya: reader('theerth-vetrimalai-murugan', 0.50, 0.28, 2.6),
  narasimha: reader('deity-narasimha-prahlad', 0.51, 0.33, 2.5),
  ganga: reader('deity-ganga', 0.52, 0.24, 2.5),
  dattatreya: reader('deity-dattatreya', 0.49, 0.23, 2.2),
  annapurna: reader('daan-annapurna-bhiksha', 0.65, 0.23, 2.5),
  gogaji: reader('theerth-gogaji-gogamedi', 0.48, 0.28, 2.3),
  ramdev: reader('theerth-ramdevra', 0.50, 0.22, 2.3),
  tejaji: reader('theerth-tejaji-kharnal', 0.49, 0.24, 2.3),
  khandoba: reader('theerth-khandoba-jejuri', 0.52, 0.32, 2.3),
  ahoi: { source: require('@assets/icons/observance-scenes/ahoi-mata.webp'), frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 } },
  tulsi: { source: require('@assets/icons/observance-scenes/tulsi-puja.webp'), frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 } },
  siddhidatri: { source: require('@assets/icons/observance-scenes/siddhidatri.webp'), frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 } },
  ...Object.fromEntries(Object.entries(observancePortraitSources).map(([key, source]) => [key, {
    source, frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 },
  }])),
};

// Exact identities, including every subject named by a composite rule. A
// calendar identity is never inferred by fuzzy matching a deity's name.
export const observanceSubjects: Readonly<Record<string, readonly string[]>> = {
  'Lord Vishnu': ['vishnu'], 'Shri Vishnu': ['vishnu'], 'Shree Satyanarayan': ['vishnu'],
  'Lord Shiva': ['shiva'], 'Bhagwan Mahesh': ['shiva'], 'Shri Ganesh': ['ganesha'],
  'Shri Krishna': ['krishna'], 'Shri Ram': ['rama'], 'Hanuman Ji': ['hanuman'],
  'Maa Durga': ['durga'], 'Maa Lakshmi': ['lakshmi'], 'Maa Saraswati': ['saraswati'],
  'Maa Parvati': ['parvati'], 'Maa Gauri': ['parvati'], 'Surya Deva': ['surya'],
  'Shani Deva': ['shani'], 'Radha Rani': ['radha-krishna'],
  'Shri Radha-Krishna': ['radha-krishna'], 'Shri Krishna and Radha Rani': ['radha-krishna'],
  'Lord Kartikeya': ['kartikeya'], 'Lord Murugan': ['kartikeya'],
  'Lord Narasimha': ['narasimha'], 'Maa Ganga': ['ganga'], 'Lord Dattatreya': ['dattatreya'],
  'Maa Annapurna': ['annapurna'], 'Gogaji (Jaharveer)': ['gogaji'],
  'Baba Ramdevji': ['ramdev'], 'Veer Tejaji': ['tejaji'], 'Ahoi Mata': ['ahoi'], 'Tulasi Mata': ['tulsi'],
  'Bhagwan Vishwakarma': ['vishwakarma'], 'Shitala Mata': ['shitala'],
  'Bhagwan Chitragupta': ['chitragupta'], 'Lord Parashurama': ['parashurama'],
  'Maa Sita': ['sita'], 'Mata Sita': ['sita'], 'Sita Ram': ['sita', 'rama'],
  'Bhagwan Mahavir': ['mahavir'], 'Lord Buddha': ['buddha'], 'Devarshi Narada': ['narada'],
  'Naga Devata': ['naga'], 'Gau Mata': ['gau-mata'],
  'Gau Mata and Shri Krishna': ['gau-mata', 'krishna'], 'Shri Krishna and Gau Mata': ['krishna', 'gau-mata'],
  'Maa Siddhidatri': ['siddhidatri'], 'Chandra Deva': ['chandra'], 'Dhanvantari Deva': ['dhanvantari'],
  'Lord Matsya': ['matsya'], 'Lord Varaha': ['varaha'], 'Lord Vamana': ['vamana'],
  'Lord Kalki': ['kalki'], 'Lord Hayagriva': ['hayagriva'], 'Lord Balarama': ['balarama'],
  'Sant Surdas': ['surdas'], 'Adi Shankaracharya': ['shankaracharya'],
  'Goswami Tulsidas': ['tulsidas'], 'Maharishi Valmiki': ['valmiki'],
  'Shri Vallabhacharya': ['vallabhacharya'], 'Sant Kabir': ['kabir'],
  'Maa Baglamukhi': ['baglamukhi'], 'Maa Dhumavati': ['dhumavati'], 'Maa Narmada': ['narmada'],
  'Kala Bhairava': ['bhairava'], 'Pitamah Bhishma': ['bhishma'],
  'Shri Krishna and Yamaraja': ['krishna', 'yama'],
  'Lord Shiva and Shri Vishnu': ['shiva', 'vishnu'],
  'Lord Shiva and Murugan': ['shiva', 'kartikeya'],
  'Lord Murugan and Shiva–Parvati': ['kartikeya', 'shiva', 'parvati'],
  'Khandoba and Lord Kartikeya': ['khandoba', 'kartikeya'],
  'Isar Ji and Gauri Mata': ['gangaur'], 'Shiva–Parvati and Vishahara': ['madhushravani'],
  'Chauth Mata and Vinayak Ji': ['chauth-mata'],
  'Dasha Mata': ['dasha-mata'], 'Maa Savitri': ['savitri'], 'Jivitputrika Mata': ['jivitputrika'],
  // These are traditions/practices rather than one deity's portrait. Keep the
  // existing neutral ritual/scripture paintings, without inventing a face.
  'Traditional observance': [], 'Folk tradition': [], 'Vrat observance': [],
  'Sacred snan': [], 'Pitru Tarpana': [], 'Guru Parampara': [], 'Veda Parampara': [],
  'Rishi Parampara': [], 'Jain vrat tradition': [], 'The ten Mahavidyas': [],
  'Pitru Tarpana and Shiva': ['shiva'],
};

export function observancePortraits(rule: Pick<ObservanceRule, 'deityEn'>): readonly ObservancePortrait[] {
  return (observanceSubjects[rule.deityEn] ?? []).flatMap(key => portraits[key] ? [portraits[key]] : []);
}

/** Used by the coverage gate: a missing named asset must never silently ship. */
export function missingObservancePortraits(): string[] {
  return [...new Set(Object.values(observanceSubjects).flat())].filter(key => !portraits[key]);
}

export type ObservanceArtVariant = 'list' | 'upcoming' | 'today';
const ritualScene: ObservancePortrait = {
  source: require('@assets/icons/observance-scenes/karwa-chauth-ritual.webp'),
  frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 },
};
const pujaScene: ObservancePortrait = {
  source: require('@assets/icons/observance-scenes/karwa-chauth-puja.webp'),
  frame: { aspect: 2, x: 0.5, y: 0.5, zoom: 1 },
};

const sharedScenes: Readonly<Record<string, number>> = {
  'Gau Mata and Shri Krishna': require('@assets/icons/observance-scenes/krishna-gau-mata.webp'),
  'Shri Krishna and Gau Mata': require('@assets/icons/observance-scenes/krishna-gau-mata.webp'),
  'Lord Shiva and Shri Vishnu': require('@assets/icons/observance-scenes/shiva-vishnu.webp'),
  'Khandoba and Lord Kartikeya': require('@assets/icons/observance-scenes/khandoba-kartikeya.webp'),
  'Shri Krishna and Yamaraja': require('@assets/icons/observance-scenes/krishna-yama.webp'),
  'Lord Shiva and Murugan': require('@assets/icons/observance-scenes/shiva-parvati-murugan.webp'),
  'Lord Murugan and Shiva–Parvati': require('@assets/icons/observance-scenes/shiva-parvati-murugan.webp'),
};

/** Event overrides precede identity art; full figures replace face-only crops. */
export function observanceIllustrations(
  rule: Pick<ObservanceRule, 'deityEn'> & Partial<Pick<ObservanceRule, 'id' | 'category'>>,
  variant: ObservanceArtVariant = 'list',
): readonly ObservancePortrait[] {
  if (rule.id && ['masik-krishna-janmashtami', 'janmashtami', 'janmashtami-vaishnava'].includes(rule.id)) {
    return [{ source: require('@assets/icons/observance-scenes/bal-krishna-makhan.webp'), frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 } }];
  }
  if (rule.id === 'karwa-chauth') return [variant === 'upcoming' ? pujaScene : ritualScene];
  if (rule.id === 'valmiki-jayanti' && variant === 'today') {
    return [reader('category-granth-open-scripture', 0.5, 0.5, 1)];
  }
  if (sharedScenes[rule.deityEn]) return [{ source: sharedScenes[rule.deityEn], frame: { aspect: 1, x: 0.5, y: 0.5, zoom: 1 } }];
  if (rule.deityEn === 'Sita Ram') return [reader('deity-rama-darbar', 0.5, 0.5, 1)];
  const paintings = observancePortraits(rule);
  if (!paintings.length) {
    // Practices/traditions get complete ritual paintings in the same style,
    // never an unrelated deity or a legacy symbolic icon.
    return [reader(['Guru Parampara', 'Veda Parampara', 'Rishi Parampara', 'Jain vrat tradition'].includes(rule.deityEn)
      ? 'category-granth-open-scripture' : 'category-aarti-diya', 0.5, 0.5, 1)];
  }
  return paintings.map(portrait => {
    if (typeof portrait.source !== 'number' && portrait.source.kind === 'reader-illustration') {
      return { ...portrait, frame: { ...portrait.frame, y: 0.5, zoom: 1 } };
    }
    return portrait;
  });
}
