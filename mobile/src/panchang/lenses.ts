import type { ObservanceLens } from './types';
import type { StateCode } from './locations';

export type LensGroup = 'state' | 'tradition';

export type LensDefinition = {
  id: ObservanceLens;
  group: LensGroup;
  nameHi: string;
  nameEn: string;
  examplesHi: string;
  examplesEn: string;
};

export const OBSERVANCE_LENSES: readonly LensDefinition[] = [
  { id: 'rajasthan', group: 'state', nameHi: 'राजस्थान', nameEn: 'Rajasthan', examplesHi: 'गणगौर, गोगा नवमी, तेजा दशमी', examplesEn: 'Gangaur, Goga Navami, Teja Dashami' },
  { id: 'bihar-mithila', group: 'state', nameHi: 'बिहार · मिथिला', nameEn: 'Bihar · Mithila', examplesHi: 'छठ, मधुश्रावणी, सामा-चकेवा', examplesEn: 'Chhath, Madhushravani, Sama Chakeva' },
  { id: 'maharashtra-konkan', group: 'state', nameHi: 'महाराष्ट्र · कोंकण', nameEn: 'Maharashtra · Konkan', examplesHi: 'गुड़ी पड़वा, वट पूर्णिमा, पोळा', examplesEn: 'Gudi Padwa, Vat Purnima, Pola' },
  { id: 'gujarat', group: 'state', nameHi: 'गुजरात', nameEn: 'Gujarat', examplesHi: 'रांधण छठ, शीतला सातम, लाभ पंचम', examplesEn: 'Randhan Chhath, Shitala Satam, Labh Pancham' },
  { id: 'bengal-odisha', group: 'state', nameHi: 'बंगाल · ओडिशा', nameEn: 'Bengal · Odisha', examplesHi: 'रथ यात्रा, काली पूजा, नुआखाई', examplesEn: 'Rath Yatra, Kali Puja, Nuakhai' },
  { id: 'punjab-haryana', group: 'state', nameHi: 'पंजाब · हरियाणा', nameEn: 'Punjab · Haryana', examplesHi: 'लोहड़ी, सांझी', examplesEn: 'Lohri, Sanjhi' },
  { id: 'tamil', group: 'state', nameHi: 'तमिल', nameEn: 'Tamil', examplesHi: 'कार्तिगई दीपम, तै पूसम, चित्रा पौर्णमी', examplesEn: 'Karthigai Deepam, Thai Pusam, Chitra Pournami' },
  { id: 'kerala', group: 'state', nameHi: 'केरल', nameEn: 'Kerala', examplesHi: 'ओणम, विषु, त्रिशूर पूरम', examplesEn: 'Onam, Vishu, Thrissur Pooram' },
  { id: 'telugu-kannada', group: 'state', nameHi: 'तेलुगु · कन्नड़', nameEn: 'Telugu · Kannada', examplesHi: 'उगादि, बतुकम्मा, नागुल चविति', examplesEn: 'Ugadi, Bathukamma, Nagula Chavithi' },
  { id: 'assam-northeast', group: 'state', nameHi: 'असम · पूर्वोत्तर', nameEn: 'Assam · Northeast', examplesHi: 'बोहाग बिहू, अंबुबाची, काती बिहू', examplesEn: 'Bohag Bihu, Ambubachi, Kati Bihu' },
  { id: 'jain', group: 'tradition', nameHi: 'जैन', nameEn: 'Jain', examplesHi: 'पर्युषण, संवत्सरी, रोहिणी व्रत', examplesEn: 'Paryushana, Samvatsari, Rohini Vrat' },
  { id: 'gaudiya', group: 'tradition', nameHi: 'गौड़ीय · इस्कॉन', nameEn: 'Gaudiya · ISKCON', examplesHi: 'गौर पूर्णिमा, राधाष्टमी, नृसिंह चतुर्दशी', examplesEn: 'Gaura Purnima, Radhashtami, Nrsimha Chaturdashi' },
  { id: 'pushtimarg', group: 'tradition', nameHi: 'पुष्टिमार्ग', nameEn: 'Pushtimarg', examplesHi: 'अन्नकूट, हिंडोला, पवित्रा एकादशी', examplesEn: 'Annakut, Hindola, Pavitra Ekadashi' },
  { id: 'sri-vaishnava', group: 'tradition', nameHi: 'श्री वैष्णव', nameEn: 'Sri Vaishnava', examplesHi: 'वैकुण्ठ एकादशी, अध्ययन उत्सवम्, रामानुज जयंती', examplesEn: 'Vaikunta Ekadashi, Adhyayana Utsavam, Ramanuja Jayanti' },
  { id: 'shaiva', group: 'tradition', nameHi: 'शैव', nameEn: 'Shaiva', examplesHi: 'प्रदोष व्रत, आरुद्रा दर्शनम्, स्कन्द षष्ठी', examplesEn: 'Pradosh Vrat, Arudra Darshanam, Skanda Shashti' },
] as const;

const LENS_IDS = new Set<ObservanceLens>(OBSERVANCE_LENSES.map(({ id }) => id));
const LENS_BY_ID = new Map(OBSERVANCE_LENSES.map((lens) => [lens.id, lens] as const));

export function isObservanceLens(value: unknown): value is ObservanceLens {
  return typeof value === 'string' && LENS_IDS.has(value as ObservanceLens);
}

/** Dedupe and sort so storage and presentation memo keys have one canonical shape. */
export function canonicalizeLenses(values: Iterable<ObservanceLens>): ObservanceLens[] {
  return [...new Set(values)].sort();
}

export function parseStoredLenses(raw: string | null): ObservanceLens[] {
  if (!raw) return [];
  return canonicalizeLenses(raw.split(',').filter(isObservanceLens));
}

export function serializeLenses(values: Iterable<ObservanceLens>): string {
  return canonicalizeLenses(values).join(',');
}

export function lensDefinition(id: ObservanceLens): LensDefinition {
  const definition = LENS_BY_ID.get(id);
  if (!definition) throw new Error(`Unknown observance lens: ${id}`);
  return definition;
}

export function ruleIsVisibleForLenses(
  ruleLenses: readonly ObservanceLens[] | undefined,
  activeLenses: ReadonlySet<ObservanceLens>
): boolean {
  return !ruleLenses?.length || ruleLenses.some((lens) => activeLenses.has(lens));
}

const STATE_LENS: Partial<Record<StateCode, ObservanceLens>> = {
  RJ: 'rajasthan',
  BR: 'bihar-mithila',
  MH: 'maharashtra-konkan',
  GA: 'maharashtra-konkan',
  GJ: 'gujarat',
  WB: 'bengal-odisha',
  OD: 'bengal-odisha',
  PB: 'punjab-haryana',
  HR: 'punjab-haryana',
  CH: 'punjab-haryana',
  TN: 'tamil',
  KL: 'kerala',
  AP: 'telugu-kannada',
  TS: 'telugu-kannada',
  KA: 'telugu-kannada',
  AS: 'assam-northeast',
  AR: 'assam-northeast',
  ML: 'assam-northeast',
  MN: 'assam-northeast',
  MZ: 'assam-northeast',
  NL: 'assam-northeast',
  SK: 'assam-northeast',
  TR: 'assam-northeast',
};

const PINCODE_STATE_CODE: Record<string, StateCode> = {
  'andhra pradesh': 'AP', 'arunachal pradesh': 'AR', assam: 'AS', bihar: 'BR',
  chandigarh: 'CH', goa: 'GA', gujarat: 'GJ', haryana: 'HR', karnataka: 'KA',
  kerala: 'KL', maharashtra: 'MH', manipur: 'MN', meghalaya: 'ML', mizoram: 'MZ',
  nagaland: 'NL', odisha: 'OD', orissa: 'OD', punjab: 'PB', rajasthan: 'RJ',
  sikkim: 'SK', 'tamil nadu': 'TN', telangana: 'TS', tripura: 'TR',
  'west bengal': 'WB',
};

export function lensForStateCode(stateCode: StateCode | undefined): ObservanceLens | null {
  return stateCode ? STATE_LENS[stateCode] ?? null : null;
}

export function lensForPincodeState(stateEn: string | undefined): ObservanceLens | null {
  if (!stateEn) return null;
  return lensForStateCode(PINCODE_STATE_CODE[stateEn.trim().toLowerCase()]);
}
