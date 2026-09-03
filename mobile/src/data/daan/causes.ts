/**
 * दान के प्रयोजन — the CAUSE axis (PRD-26 §5.1, RULEBOOK §27.12).
 *
 * Two axes exist and must not be conflated:
 *   - `DaanCategory` (ledger.ts) is the **dravya** — WHAT was given (anna,
 *     vastra, til, deep, shram…). It is what the खाता records.
 *   - `DaanCause` (here) is the **प्रयोजन** — WHOM the giving serves (food
 *     relief, gaushala, children, elders, animals…). It is how the दान-द्वार
 *     is organised and how an occasion points at the right door.
 *
 * PURPOSE BRIDGE (`purposeId`): the app already ships an intent taxonomy for
 * TEXTS (`data/purposes.ts` — protection, knowledge, health, wealth…). Only
 * the two causes whose names ARE that vocabulary are bridged — विद्या →
 * `knowledge`, आरोग्य → `health`. `wealth`/`prosperity` are deliberately NOT
 * bridged: pointing "give here" at a prosperity intent is the fruit-promise
 * the §2 stance guard bans. An unbridged cause is honest; an invented bridge
 * is not (RULEBOOK §27.9).
 */
import type { PurposeId } from '@/data/purposes';
import type { DaanCause } from './types';

export type DaanCauseMeta = {
  id: DaanCause;
  nameHi: string;
  nameEn: string;
  /** One line: whom this serves — rendered under the cause heading. */
  whomHi: string;
  whomEn: string;
  /** Only where the app's own text-intent vocabulary already names it. */
  purposeId?: PurposeId;
};

/** Display order: the dharmic ordering — anna first (the §10 Anuśāsana spine). */
export const DAAN_CAUSES: readonly DaanCauseMeta[] = [
  {
    id: 'anna',
    nameHi: 'अन्न-जल सेवा', nameEn: 'Food & water',
    whomHi: 'भूखे और प्यासे — अन्नक्षेत्र, मध्याह्न भोजन, प्याऊ',
    whomEn: 'the hungry and thirsty — anna-kshetras, mid-day meals, water',
  },
  {
    id: 'gau',
    nameHi: 'गौ-सेवा', nameEn: 'Gau seva',
    whomHi: 'गौवंश — गौशाला, चारा, गौ-ग्रास',
    whomEn: 'cows — gaushalas, fodder, gau-gras',
  },
  {
    id: 'bal',
    nameHi: 'बाल-सेवा', nameEn: 'Children',
    whomHi: 'बच्चे — पोषण, सुरक्षा, विद्यालय',
    whomEn: 'children — nutrition, protection, schooling',
  },
  {
    id: 'vriddha',
    nameHi: 'वृद्ध-सेवा', nameEn: 'Elder care',
    whomHi: 'वृद्धजन — आश्रय, चिकित्सा, आजीविका',
    whomEn: 'elders — shelter, medical care, livelihood',
  },
  {
    id: 'vidya',
    nameHi: 'विद्या-दान', nameEn: 'Education',
    whomHi: 'विद्यार्थी — पुस्तकें, शुल्क, शिक्षण',
    whomEn: 'learners — books, fees, teaching',
    purposeId: 'knowledge',
  },
  {
    id: 'arogya',
    nameHi: 'आरोग्य-सेवा', nameEn: 'Health',
    whomHi: 'रोगी — चिकित्सा, रक्त-दान, औषधि',
    whomEn: 'the ill — medical care, blood donation, medicine',
    purposeId: 'health',
  },
  {
    id: 'vastra',
    nameHi: 'वस्त्र-सेवा', nameEn: 'Clothing',
    whomHi: 'ठिठुरते हुए — वस्त्र, कम्बल, गरिमा',
    whomEn: 'those without cover — cloth, blankets, dignity',
  },
  {
    id: 'jeev',
    nameHi: 'जीव-सेवा', nameEn: 'Animals & birds',
    whomHi: 'पशु-पक्षी — आश्रय, चिकित्सा, दाना-पानी',
    whomEn: 'animals and birds — shelter, treatment, feed and water',
  },
  {
    id: 'aapada',
    nameHi: 'आपदा-राहत', nameEn: 'Disaster relief',
    whomHi: 'आपदा-पीड़ित — तत्काल राहत और पुनर्वास',
    whomEn: 'those struck by disaster — immediate relief and rebuilding',
  },
];

const CAUSE_BY_ID = new Map(DAAN_CAUSES.map((cause) => [cause.id, cause] as const));

export function getDaanCause(id: DaanCause): DaanCauseMeta | null {
  return CAUSE_BY_ID.get(id) ?? null;
}

/** The cause a text-intent purpose honestly names, or null (never invented). */
export function causeForPurpose(purposeId: PurposeId): DaanCauseMeta | null {
  return DAAN_CAUSES.find((cause) => cause.purposeId === purposeId) ?? null;
}
