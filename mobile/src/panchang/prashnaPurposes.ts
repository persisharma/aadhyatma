import type { Graha } from './kundali';

/** Mirrors `KundaliReportPracticeId` (kundaliReportModel.ts) without importing it:
 * this registry sits on the Ask lexicon's path, and the launch-graph walker counts
 * `import type` lines — the model's chain (basis, format) is 15 KB it must not pull. */
export type PrashnaPracticeId = 'navagraha-stotram' | 'surya-ashtakam' | 'shani-ashtakam';

/**
 * प्रश्न purpose registry — PRD-43 Wave D.
 *
 * People do not consult an astrologer for a report; they arrive with a
 * purpose. Each record here is what a traditional reader looks at for that
 * purpose: the bhavas, the natural karakas (significators), the age below
 * which the purpose is not read at all (RULEBOOK §14.3.5), and the surface
 * forms the Ask grammar derives its lexicon from (§25.2 — never a hand list
 * in the ask module). The bhava/karaka sets are classical textbook (BPHS,
 * Phaladeepika) and carry the same §10 source block `EVENT_RULES` does.
 *
 * Adding a purpose is a data edit here, not an engine change in `prashna.ts`.
 */

export type PurposeId =
  | 'vidya'
  | 'vyapar'
  | 'naukri'
  | 'dhan'
  | 'vivah'
  | 'santan'
  | 'swasthya'
  | 'yatra'
  | 'man';

export type PrashnaPurpose = {
  id: PurposeId;
  nameHi: string;
  nameEn: string;
  /** The question as a person asks it — the picker's second line. */
  askHi: string;
  askEn: string;
  /** Bhavas read for this purpose; the first is primary and weighs double. */
  bhavas: readonly number[];
  karakas: readonly Graha[];
  /** Derived age below which no reading renders (§14.3.5). 0 = open to all. */
  minAge: number;
  /** Constitution-and-routine only; never a prognosis (§14.3.5). */
  noPrognosis?: boolean;
  practiceSourceId: PrashnaPracticeId;
  /** Ask-lexicon surface forms in hi / en / Hinglish. */
  forms: readonly string[];
  source: {
    verified: boolean;
    referenceUrls: readonly string[];
    notes: string;
  };
};

const SOURCE_NOTE = 'BPHS bhava karakatva (ch. 11) + Phaladeepika ch. 15. Classical canon; two-source URL review pending.';

export const PRASHNA_PURPOSES: readonly PrashnaPurpose[] = [
  {
    id: 'vidya',
    nameHi: 'विद्या',
    nameEn: 'Study',
    askHi: 'पढ़ाई, परीक्षा और सीखने की दिशा',
    askEn: 'Study, exams and how learning goes',
    bhavas: [5, 4, 9],
    karakas: ['jupiter', 'mercury'],
    minAge: 0,
    practiceSourceId: 'navagraha-stotram',
    forms: ['vidya', 'padhai', 'padhaai', 'study', 'studies', 'exam', 'exams', 'pariksha', 'shiksha', 'education', 'विद्या', 'पढ़ाई', 'परीक्षा', 'शिक्षा'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'vyapar',
    nameHi: 'व्यापार',
    nameEn: 'Business',
    askHi: 'व्यापार, नया उद्यम, साझेदारी',
    askEn: 'Business, a new venture, partnership',
    bhavas: [10, 7, 11, 3],
    karakas: ['mercury', 'jupiter', 'mars'],
    minAge: 18,
    practiceSourceId: 'navagraha-stotram',
    forms: ['vyapar', 'vyapaar', 'business', 'dhandha', 'dukan', 'dukaan', 'startup', 'venture', 'udyam', 'व्यापार', 'व्यवसाय', 'दुकान', 'उद्यम'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'naukri',
    nameHi: 'नौकरी',
    nameEn: 'Job',
    askHi: 'नौकरी, सेवा, पदोन्नति',
    askEn: 'Job, service, promotion',
    bhavas: [10, 6, 11],
    karakas: ['saturn', 'sun'],
    minAge: 18,
    practiceSourceId: 'surya-ashtakam',
    forms: ['naukri', 'naukari', 'nokri', 'job', 'career', 'sarkari', 'promotion', 'seva', 'नौकरी', 'कैरियर', 'पदोन्नति', 'सेवा'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'dhan',
    nameHi: 'धन',
    nameEn: 'Money',
    askHi: 'धन, संचय, संपत्ति',
    askEn: 'Money, savings, property',
    bhavas: [2, 11, 4],
    karakas: ['jupiter', 'venus', 'mars'],
    minAge: 18,
    practiceSourceId: 'navagraha-stotram',
    forms: ['dhan', 'paisa', 'paise', 'money', 'wealth', 'sampatti', 'property', 'ghar kharidna', 'savings', 'bachat', 'धन', 'पैसा', 'संपत्ति', 'बचत'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'vivah',
    nameHi: 'विवाह',
    nameEn: 'Marriage',
    askHi: 'विवाह और जीवन-साथी',
    askEn: 'Marriage and partnership',
    bhavas: [7, 2, 11],
    karakas: ['venus', 'jupiter'],
    minAge: 21,
    practiceSourceId: 'navagraha-stotram',
    forms: ['vivah', 'vivaah', 'shadi', 'shaadi', 'marriage', 'wedding', 'jeevan sathi', 'विवाह', 'शादी'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'santan',
    nameHi: 'संतान',
    nameEn: 'Children',
    askHi: 'संतान और परिवार-वृद्धि',
    askEn: 'Children and family',
    bhavas: [5, 9],
    karakas: ['jupiter'],
    minAge: 21,
    practiceSourceId: 'navagraha-stotram',
    // 'bacche' folds to the same key as Hinglish 'bache' (remaining) — kept out.
    forms: ['santan', 'santaan', 'children', 'child', 'putra', 'putri', 'संतान', 'पुत्र', 'पुत्री'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'swasthya',
    nameHi: 'स्वास्थ्य',
    nameEn: 'Constitution',
    askHi: 'प्रकृति और दिनचर्या — रोग-विचार नहीं',
    askEn: 'Constitution and routine — never a diagnosis',
    bhavas: [1, 6, 8],
    karakas: ['sun', 'moon'],
    minAge: 0,
    noPrognosis: true,
    practiceSourceId: 'shani-ashtakam',
    forms: ['swasthya', 'swasth', 'health', 'sehat', 'tabiyat', 'prakriti', 'स्वास्थ्य', 'सेहत', 'तबियत', 'प्रकृति'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'yatra',
    nameHi: 'यात्रा',
    nameEn: 'Travel',
    askHi: 'यात्रा, स्थान-परिवर्तन, विदेश',
    askEn: 'Travel, relocation, abroad',
    bhavas: [9, 3, 12],
    karakas: ['rahu', 'moon'],
    minAge: 0,
    practiceSourceId: 'navagraha-stotram',
    forms: ['yatra', 'yaatra', 'travel', 'videsh', 'abroad', 'foreign', 'shift', 'relocation', 'यात्रा', 'विदेश'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
  {
    id: 'man',
    nameHi: 'मन',
    nameEn: 'Peace of mind',
    askHi: 'मन की शांति, एकाग्रता, नींद',
    askEn: 'Peace of mind, focus, rest',
    bhavas: [4, 1, 12],
    karakas: ['moon'],
    minAge: 0,
    practiceSourceId: 'navagraha-stotram',
    forms: ['man', 'mann', 'shanti', 'peace', 'focus', 'ekagrata', 'chinta', 'anxiety', 'neend', 'sleep', 'मन', 'शांति', 'एकाग्रता', 'चिंता', 'नींद'],
    source: { verified: false, referenceUrls: [], notes: SOURCE_NOTE },
  },
];

export function getPurpose(id: PurposeId): PrashnaPurpose {
  const found = PRASHNA_PURPOSES.find((purpose) => purpose.id === id);
  if (!found) throw new Error(`unknown purpose ${id}`);
  return found;
}

export function isPurposeId(value: string): value is PurposeId {
  return PRASHNA_PURPOSES.some((purpose) => purpose.id === value);
}
