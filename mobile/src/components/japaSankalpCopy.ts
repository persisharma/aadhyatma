/**
 * Copy for the japa sankalp strip and sheet (design.md §35.2), in the four UI
 * languages. Numerals stay ASCII with Indian grouping, matching the counter's
 * `/ 108`. Accessibility labels are English by contract (e2e selects on them).
 */
import type { Lang } from '@/data/gita/language';
import {
  formatIndianNumber as fmt,
  malaBreakdown,
  sankalpProgress,
  type JapaSankalp,
  type JapaSankalpUnit,
} from '@/data/japam/sankalp';
import { pick } from '@/utils/localize';

export function sankalpUnitWord(lang: Lang, unit: JapaSankalpUnit, count: number): string {
  if (unit === 'mala') {
    return pick(lang, { hi: 'माला', en: count === 1 ? 'mala' : 'malas', gu: 'માળા', kn: 'ಮಾಲೆ' });
  }
  return pick(lang, { hi: 'जप', en: 'japa', gu: 'જપ', kn: 'ಜಪ' });
}

/** "12 / 21 माला" or "3,456 / 11,000 जप". */
export function sankalpHeadline(lang: Lang, s: JapaSankalp): string {
  const p = sankalpProgress(s);
  const doneInUnit = s.unit === 'mala' ? p.malasDone : p.done;
  return `${fmt(doneInUnit)} / ${fmt(s.amount)} ${sankalpUnitWord(lang, s.unit, s.amount)}`;
}

/** Japa offered so far, for the sheet's secondary line. */
export function sankalpSoFar(lang: Lang, s: JapaSankalp): string {
  const n = fmt(sankalpProgress(s).done);
  return pick(lang, {
    hi: `अब तक ${n} जप`,
    en: `${n} japa so far`,
    gu: `અત્યાર સુધી ${n} જપ`,
    kn: `ಇದುವರೆಗೆ ${n} ಜಪ`,
  });
}

/** "= 1,188 जप" for malas, "= 101 माला + 92 जप" for a japa count; null below one mala. */
export function sankalpConversion(lang: Lang, unit: JapaSankalpUnit, amount: number): string | null {
  if (unit === 'mala') {
    const beads = fmt(amount * 108);
    return pick(lang, { hi: `= ${beads} जप`, en: `= ${beads} japa`, gu: `= ${beads} જપ`, kn: `= ${beads} ಜಪ` });
  }
  const { malas, rest } = malaBreakdown(amount);
  if (malas === 0) return null;
  const m = `${fmt(malas)} ${sankalpUnitWord(lang, 'mala', malas)}`;
  if (rest === 0) return `= ${m}`;
  return `= ${m} + ${fmt(rest)} ${sankalpUnitWord(lang, 'japa', rest)}`;
}

export function sankalpEyebrow(lang: Lang, complete: boolean): string {
  return complete
    ? pick(lang, { hi: 'संकल्प पूर्ण 🙏', en: 'Sankalp complete 🙏', gu: 'સંકલ્પ પૂર્ણ 🙏', kn: 'ಸಂಕಲ್ಪ ಪೂರ್ಣ 🙏' })
    : pick(lang, { hi: 'संकल्प', en: 'Sankalp', gu: 'સંકલ્પ', kn: 'ಸಂಕಲ್ಪ' });
}

/** English a11y label shared by the strip and tests: "Japa sankalp, 3 of 21 malas". */
export function sankalpA11yLabel(s: JapaSankalp): string {
  const p = sankalpProgress(s);
  const done = s.unit === 'mala' ? p.malasDone : p.done;
  const unit = sankalpUnitWord('en', s.unit, s.amount);
  return `Japa sankalp, ${done} of ${s.amount} ${unit}${p.complete ? ', complete' : ''}`;
}

export function sankalpRangeHint(lang: Lang, max: number): string {
  const top = fmt(max);
  return pick(lang, {
    hi: `1 से ${top} के बीच लिखें`,
    en: `Enter a number from 1 to ${top}`,
    gu: `1 થી ${top} વચ્ચે લખો`,
    kn: `1 ರಿಂದ ${top} ವರೆಗಿನ ಸಂಖ್ಯೆ ಬರೆಯಿರಿ`,
  });
}

export const SANKALP_COPY = {
  open: { hi: 'संकल्प', en: 'Sankalp', gu: 'સંકલ્પ', kn: 'ಸಂಕಲ್ಪ' },
  title: { hi: 'जप संकल्प', en: 'Japa Sankalp', gu: 'જપ સંકલ્પ', kn: 'ಜಪ ಸಂಕಲ್ಪ' },
  intro: {
    hi: 'इस मंत्र के कितने जप का संकल्प लेना है? प्रगति हर दिन जुड़ती रहेगी।',
    en: 'How much japa of this mantra do you vow to complete? Progress carries over from day to day.',
    gu: 'આ મંત્રના કેટલા જપનો સંકલ્પ લેવો છે? પ્રગતિ દરરોજ ઉમેરાતી રહેશે.',
    kn: 'ಈ ಮಂತ್ರದ ಎಷ್ಟು ಜಪದ ಸಂಕಲ್ಪ ಮಾಡುವಿರಿ? ಪ್ರಗತಿ ದಿನದಿಂದ ದಿನಕ್ಕೆ ಸೇರುತ್ತಾ ಹೋಗುತ್ತದೆ.',
  },
  completeLine: {
    hi: 'पूर्णाहुति — आपका संकल्प पूर्ण हुआ।',
    en: 'Purnahuti — your sankalp is complete.',
    gu: 'પૂર્ણાહુતિ — આપનો સંકલ્પ પૂર્ણ થયો.',
    kn: 'ಪೂರ್ಣಾಹುತಿ — ನಿಮ್ಮ ಸಂಕಲ್ಪ ಪೂರ್ಣವಾಯಿತು.',
  },
  unitMala: { hi: 'माला', en: 'Malas', gu: 'માળા', kn: 'ಮಾಲೆ' },
  unitJapa: { hi: 'जप संख्या', en: 'Japa count', gu: 'જપ સંખ્યા', kn: 'ಜಪ ಸಂಖ್ಯೆ' },
  newTarget: { hi: 'नया लक्ष्य', en: 'New target', gu: 'નવું લક્ષ્ય', kn: 'ಹೊಸ ಗುರಿ' },
  target: { hi: 'लक्ष्य', en: 'Target', gu: 'લક્ષ્ય', kn: 'ಗುರಿ' },
  take: { hi: 'संकल्प लें', en: 'Take this sankalp', gu: 'સંકલ્પ લો', kn: 'ಸಂಕಲ್ಪ ಮಾಡಿ' },
  update: { hi: 'लक्ष्य बदलें', en: 'Update target', gu: 'લક્ષ્ય બદલો', kn: 'ಗುರಿ ಬದಲಿಸಿ' },
  takeNew: { hi: 'नया संकल्प लें', en: 'Take a new sankalp', gu: 'નવો સંકલ્પ લો', kn: 'ಹೊಸ ಸಂಕಲ್ಪ ಮಾಡಿ' },
  setAside: { hi: 'संकल्प स्थगित करें', en: 'Set this sankalp aside', gu: 'સંકલ્પ સ્થગિત કરો', kn: 'ಸಂಕಲ್ಪವನ್ನು ಬದಿಗಿಡಿ' },
  clearDone: { hi: 'पूर्ण संकल्प हटाएँ', en: 'Clear completed sankalp', gu: 'પૂર્ણ સંકલ્પ દૂર કરો', kn: 'ಪೂರ್ಣ ಸಂಕಲ್ಪ ತೆಗೆದುಹಾಕಿ' },
  setAsideTitle: { hi: 'संकल्प स्थगित करें?', en: 'Set this sankalp aside?', gu: 'સંકલ્પ સ્થગિત કરવો?', kn: 'ಸಂಕಲ್ಪವನ್ನು ಬದಿಗಿಡಬೇಕೆ?' },
  setAsideBody: {
    hi: 'अब तक की संकल्प-प्रगति हट जाएगी। माला की गिनती वैसी ही रहेगी।',
    en: 'Sankalp progress so far will be removed. Your mala count stays as it is.',
    gu: 'અત્યાર સુધીની સંકલ્પ-પ્રગતિ દૂર થશે. માળાની ગણતરી એમ જ રહેશે.',
    kn: 'ಇದುವರೆಗಿನ ಸಂಕಲ್ಪ ಪ್ರಗತಿ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ. ಮಾಲೆಯ ಎಣಿಕೆ ಹಾಗೆಯೇ ಉಳಿಯುತ್ತದೆ.',
  },
  keptOnReset: {
    hi: 'संकल्प की प्रगति सुरक्षित रहेगी।',
    en: 'Your sankalp progress is kept.',
    gu: 'સંકલ્પની પ્રગતિ સચવાશે.',
    kn: 'ಸಂಕಲ್ಪದ ಪ್ರಗತಿ ಉಳಿಯುತ್ತದೆ.',
  },
  cancel: { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ' },
} as const;
