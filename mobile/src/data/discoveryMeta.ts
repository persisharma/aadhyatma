import { library, type LibraryEntry } from './texts';
import { purposes, type PurposeId } from './purposes';
import { deityForWeekday } from './routine/vaar';
import { getObservancesForDate } from '@/panchang/festivalEngine';

export type Vaar = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Viniyog = {
  rishiHi: string;
  rishiEn: string;
  chandasHi: string;
  chandasEn: string;
  devataHi: string;
  devataEn: string;
};

export type BestTime = 'brahma-muhurta' | 'sunrise' | 'sunset' | 'any';

export type DiscoveryMeta = {
  purposes?: readonly PurposeId[];
  bestDays?: readonly Vaar[];
  bestFestivals?: readonly string[];
  bestTime?: BestTime;
  viniyog?: Viniyog;
  source: string;
};

const SOURCE_BUNDLED =
  'Curated from bundled source provenance for this text; associations are devotional browse metadata, not prescriptions.';

export const discoveryMeta: Readonly<Record<string, DiscoveryMeta>> = {
  'hanuman-chalisa': {
    purposes: ['protection', 'courage', 'obstacles', 'devotion'],
    bestDays: [2, 6],
    bestFestivals: ['hanuman-jayanti'],
    bestTime: 'brahma-muhurta',
    source: `${SOURCE_BUNDLED} Hanuman Chalisa source references in hanuman-chalisa.json.`,
  },
  'sundarkand': {
    purposes: ['courage', 'protection', 'peace', 'devotion'],
    bestDays: [2, 6],
    bestTime: 'any',
    source: `${SOURCE_BUNDLED} Sundarkand source references in sundarkand/*.json.`,
  },
  'rama-raksha-stotra': {
    purposes: ['protection', 'peace', 'family-welfare'],
    bestDays: [0, 2, 6],
    bestTime: 'sunrise',
    viniyog: {
      rishiHi: 'बुधकौशिक ऋषि',
      rishiEn: 'Budha Kaushika Rishi',
      chandasHi: 'अनुष्टुप्',
      chandasEn: 'Anushtubh',
      devataHi: 'श्री सीतारामचन्द्र',
      devataEn: 'Shri Sita Ramachandra',
    },
    source: `${SOURCE_BUNDLED} Rama Raksha Stotra source references in kavacham/rama-raksha-stotra.json.`,
  },
  'durga-kavach': {
    purposes: ['protection', 'victory', 'courage'],
    bestDays: [2, 5],
    bestFestivals: ['navratri-start'],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Durga Kavach source references in kavacham/durga-kavach.json.`,
  },
  'ganesha-kavacham': {
    purposes: ['protection', 'obstacles', 'auspicious-beginnings'],
    bestDays: [3],
    bestFestivals: ['ganesh-chaturthi'],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Ganesha Kavacham source references in kavacham/ganesha-kavacham.json.`,
  },
  'ganesh-chalisa': {
    purposes: ['obstacles', 'auspicious-beginnings', 'prosperity'],
    bestDays: [3],
    bestFestivals: ['ganesh-chaturthi'],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Ganesh Chalisa source references in ganesh-chalisa.json.`,
  },
  'saraswati-chalisa': {
    purposes: ['knowledge', 'peace'],
    bestDays: [4],
    bestFestivals: ['vasant-panchami'],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Saraswati Chalisa source references in saraswati-chalisa.json.`,
  },
  'vidyarambha-prarthana': {
    purposes: ['knowledge', 'auspicious-beginnings', 'morning-practice'],
    bestDays: [4],
    bestFestivals: ['vasant-panchami'],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Vidyarambha Prarthana source references in sanskar/vidyarambha-prarthana.json.`,
  },
  'mahalakshmi-ashtakam': {
    purposes: ['wealth', 'prosperity', 'devotion'],
    bestDays: [5],
    bestFestivals: ['diwali'],
    bestTime: 'sunset',
    source: `${SOURCE_BUNDLED} Mahalakshmi Ashtakam source references in ashtakam/mahalakshmi-ashtakam.json.`,
  },
  'kubera-stotram': {
    purposes: ['wealth', 'prosperity'],
    bestDays: [4, 5],
    bestTime: 'sunset',
    source: `${SOURCE_BUNDLED} Kubera Stotram source references in stuti/kubera-stotram.json.`,
  },
  'surya-ashtakam': {
    purposes: ['health', 'morning-practice'],
    bestDays: [0],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Surya Ashtakam source references in ashtakam/surya-ashtakam.json.`,
  },
  'surya-namaskar': {
    purposes: ['health', 'morning-practice'],
    bestDays: [0],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Surya Namaskar source references in sanskar/surya-namaskar.json.`,
  },
  'bhagavad-gita': {
    purposes: ['knowledge', 'peace', 'devotion', 'moksha'],
    bestDays: [4],
    bestFestivals: ['gita-jayanti'],
    bestTime: 'any',
    source: `${SOURCE_BUNDLED} Bhagavad Gita source references in gita/*.json.`,
  },
  'vishnu-sahasranama': {
    purposes: ['peace', 'devotion', 'prosperity', 'moksha'],
    bestDays: [4],
    bestTime: 'brahma-muhurta',
    source: `${SOURCE_BUNDLED} Vishnu Sahasranama source references in vishnu-sahasranama/*.json.`,
  },
  'shiva-strotam': {
    purposes: ['peace', 'moksha', 'devotion'],
    bestDays: [1],
    bestTime: 'brahma-muhurta',
    source: `${SOURCE_BUNDLED} Shiva Stotram source references in shiva-strotam/*.json.`,
  },
  lingashtakam: {
    purposes: ['peace', 'moksha', 'devotion'],
    bestDays: [1],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Lingashtakam source references in ashtakam/lingashtakam.json.`,
  },
  'durga-stuti-arjuna': {
    purposes: ['victory', 'protection', 'courage'],
    bestDays: [2, 5],
    bestFestivals: ['navratri-start'],
    bestTime: 'any',
    source: `${SOURCE_BUNDLED} Durga Stuti source references in stuti/durga-stuti-arjuna.json.`,
  },
  'devi-suktam': {
    purposes: ['victory', 'protection', 'devotion'],
    bestDays: [5],
    bestFestivals: ['navratri-start'],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Devi Suktam source references in suktam/devi-suktam.json.`,
  },
  'ram-chalisa': {
    purposes: ['family-welfare', 'peace', 'devotion'],
    bestDays: [0],
    bestTime: 'sunrise',
    source: `${SOURCE_BUNDLED} Ram Chalisa source references in ram-chalisa.json.`,
  },
  'ram-aarti': {
    purposes: ['family-welfare', 'devotion', 'peace'],
    bestDays: [0],
    bestTime: 'sunset',
    source: `${SOURCE_BUNDLED} Ram Stuti/Ram Aarti source references in ram-stuti/*.json.`,
  },
  'prabhati-shloka': {
    purposes: ['morning-practice', 'peace'],
    bestDays: [0, 1, 2, 3, 4, 5, 6],
    bestTime: 'brahma-muhurta',
    source: `${SOURCE_BUNDLED} Prabhati Shloka source references in sanskar/prabhati-shloka.json.`,
  },
};

const PURPOSE_IDS = new Set(purposes.map((purpose) => purpose.id));
const activeById = new Map(
  library
    .filter((entry) => entry.status === 'active' && !entry.hidden)
    .map((entry) => [entry.id, entry] as const)
);
let purposeIndex: Map<PurposeId, LibraryEntry[]> | null = null;

function buildPurposeIndex(): Map<PurposeId, LibraryEntry[]> {
  const index = new Map<PurposeId, LibraryEntry[]>();
  for (const purpose of purposes) index.set(purpose.id, []);

  for (const [textId, meta] of Object.entries(discoveryMeta)) {
    const entry = activeById.get(textId);
    if (!entry) continue;
    for (const purposeId of meta.purposes ?? []) {
      if (!PURPOSE_IDS.has(purposeId)) continue;
      index.get(purposeId)?.push(entry);
    }
  }

  return index;
}

function getPurposeIndex(): Map<PurposeId, LibraryEntry[]> {
  if (!purposeIndex) purposeIndex = buildPurposeIndex();
  return purposeIndex;
}

export function textsForPurpose(id: PurposeId): LibraryEntry[] {
  return [...(getPurposeIndex().get(id) ?? [])];
}

export function purposesForText(textId: string): PurposeId[] {
  return [...(discoveryMeta[textId]?.purposes ?? [])];
}

export function getDiscoveryMeta(textId: string): DiscoveryMeta | null {
  return discoveryMeta[textId] ?? null;
}

export function getTodayRecommendationsForDate(date: Date): LibraryEntry[] {
  const recommendations: LibraryEntry[] = [];
  const seen = new Set<string>();
  const add = (entry: LibraryEntry | undefined) => {
    if (!entry || seen.has(entry.id) || entry.hidden || entry.status !== 'active') return;
    seen.add(entry.id);
    recommendations.push(entry);
  };

  const weekdayDeity = deityForWeekday(date.getDay());
  for (const entry of library) {
    if (entry.deities.includes(weekdayDeity) && entry.category !== 'theerth') add(entry);
  }

  const observances = getObservancesForDate(date);
  const festivalIds = new Set(observances.map((item) => item.rule.id));
  for (const [textId, meta] of Object.entries(discoveryMeta)) {
    if (meta.bestFestivals?.some((festivalId) => festivalIds.has(festivalId))) {
      add(activeById.get(textId));
    }
  }
  for (const observance of observances) {
    if (observance.rule.linkSectionId) add(activeById.get(observance.rule.linkSectionId));
  }

  return recommendations.slice(0, 8);
}

export function bestTimeLabel(bestTime: BestTime): { hi: string; en: string } {
  switch (bestTime) {
    case 'brahma-muhurta':
      return { hi: 'ब्रह्म मुहूर्त', en: 'Brahma Muhurta' };
    case 'sunrise':
      return { hi: 'सूर्योदय', en: 'Sunrise' };
    case 'sunset':
      return { hi: 'संध्या', en: 'Sunset' };
    case 'any':
      return { hi: 'सुविधा अनुसार', en: 'Any time' };
  }
}
