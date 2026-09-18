import { indiaDateKey } from './kundali';

/**
 * Shared, pure formatting for the Jyotish reading surfaces (PRD-43 Wave A).
 *
 * Bhava ordinals were composed as `${house}th` in three places and produced
 * "1th / 2th / 3th bhava" in every exported reading; the correct helper lived
 * only in `JyotishGuidanceRows.tsx`. This is now the ONE implementation, and
 * the Hindi side uses the classical ordinal words (प्रथम … द्वादश) rather
 * than a bare digit before भाव.
 *
 * Dates render from the IST civil day (`indiaDateKey`), never from the local
 * zone of whatever machine builds the model — a dasha boundary must read the
 * same in a test, in the app, and in a pasted export.
 */

export function ordinalEn(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
}

export const BHAVA_ORDINAL_HI = [
  'प्रथम',
  'द्वितीय',
  'तृतीय',
  'चतुर्थ',
  'पंचम',
  'षष्ठ',
  'सप्तम',
  'अष्टम',
  'नवम',
  'दशम',
  'एकादश',
  'द्वादश',
] as const;

export function bhavaLabelHi(house: number): string {
  const word = BHAVA_ORDINAL_HI[house - 1];
  if (!word) throw new Error(`house out of range: ${house}`);
  return `${word} भाव`;
}

export function bhavaLabelEn(house: number): string {
  if (house < 1 || house > 12) throw new Error(`house out of range: ${house}`);
  return `${ordinalEn(house)} bhava`;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_HI = [
  'जनवरी',
  'फ़रवरी',
  'मार्च',
  'अप्रैल',
  'मई',
  'जून',
  'जुलाई',
  'अगस्त',
  'सितम्बर',
  'अक्टूबर',
  'नवम्बर',
  'दिसम्बर',
];

function istParts(date: Date): { year: number; month: number; day: number } {
  const [year, month, day] = indiaDateKey(date).split('-').map(Number);
  return { year, month, day };
}

/** `4 Jul 2029` — the IST civil day. */
export function formatIstDateEn(date: Date): string {
  const { year, month, day } = istParts(date);
  return `${day} ${MONTHS_EN[month - 1]} ${year}`;
}

/** `4 जुलाई 2029` — ASCII digits, matching `formatShortDate`'s Hindi convention. */
export function formatIstDateHi(date: Date): string {
  const { year, month, day } = istParts(date);
  return `${day} ${MONTHS_HI[month - 1]} ${year}`;
}

export type AgeSpan = { years: number; months: number };

/**
 * Whole years and months between two instants on the IST civil calendar.
 * Negative spans (an instant before birth) clamp to zero — the caller states
 * "before birth" in words; a negative age is never printed.
 */
export function ageBetween(birth: Date, at: Date): AgeSpan {
  const b = istParts(birth);
  const a = istParts(at);
  let months = (a.year - b.year) * 12 + (a.month - b.month);
  if (a.day < b.day) months -= 1;
  if (months < 0) months = 0;
  return { years: Math.floor(months / 12), months: months % 12 };
}

export function ageLabelEn(span: AgeSpan): string {
  if (span.years === 0) return `${span.months} m`;
  if (span.months === 0) return `${span.years} y`;
  return `${span.years} y ${span.months} m`;
}

export function ageLabelHi(span: AgeSpan): string {
  if (span.years === 0) return `${span.months} माह`;
  if (span.months === 0) return `${span.years} वर्ष`;
  return `${span.years} वर्ष ${span.months} माह`;
}

/** Years only, floored — for `(ages 15–22)` style parentheticals. */
export function ageYears(birth: Date, at: Date): number {
  return ageBetween(birth, at).years;
}
