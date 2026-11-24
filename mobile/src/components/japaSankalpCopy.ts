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
    return pick(lang, { hi: 'माला', en: count === 1 ? 'mala' : 'malas', gu: 'માળા', kn: 'ಮಾಲೆ', mr: 'माळा', te: 'మాల' });
  }
  return pick(lang, { hi: 'जप', en: 'japa', gu: 'જપ', kn: 'ಜಪ', mr: 'जप', te: 'జపం' });
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
    mr: `आतापर्यंत ${n} जप`,
    te: `ఇప్పటివరకు ${n} జపం`,
  });
}

/** "= 1,188 जप" for malas, "= 101 माला + 92 जप" for a japa count; null below one mala. */
export function sankalpConversion(lang: Lang, unit: JapaSankalpUnit, amount: number): string | null {
  if (unit === 'mala') {
    const beads = fmt(amount * 108);
    return pick(lang, { hi: `= ${beads} जप`, en: `= ${beads} japa`, gu: `= ${beads} જપ`, kn: `= ${beads} ಜಪ`, mr: `= ${beads} जप`, te: `= ${beads} జపం` });
  }
  const { malas, rest } = malaBreakdown(amount);
  if (malas === 0) return null;
  const m = `${fmt(malas)} ${sankalpUnitWord(lang, 'mala', malas)}`;
  if (rest === 0) return `= ${m}`;
  return `= ${m} + ${fmt(rest)} ${sankalpUnitWord(lang, 'japa', rest)}`;
}

export function sankalpEyebrow(lang: Lang, complete: boolean): string {
  return complete
    ? pick(lang, { hi: 'संकल्प पूर्ण 🙏', en: 'Sankalp complete 🙏', gu: 'સંકલ્પ પૂર્ણ 🙏', kn: 'ಸಂಕಲ್ಪ ಪೂರ್ಣ 🙏', mr: 'संकल्प पूर्ण 🙏', te: 'సంకల్పం పూర్తి 🙏' })
    : pick(lang, { hi: 'संकल्प', en: 'Sankalp', gu: 'સંકલ્પ', kn: 'ಸಂಕಲ್ಪ', mr: 'संकल्प', te: 'సంకల్పం' });
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
    mr: `1 ते ${top} दरम्यान संख्या लिहा`,
    te: `1 నుండి ${top} వరకు సంఖ్య రాయండి`,
  });
}

export const SANKALP_COPY = {
  open: { hi: 'संकल्प', en: 'Sankalp', gu: 'સંકલ્પ', kn: 'ಸಂಕಲ್ಪ', mr: 'संकल्प', te: 'సంకల్పం' },
  title: { hi: 'जप संकल्प', en: 'Japa Sankalp', gu: 'જપ સંકલ્પ', kn: 'ಜಪ ಸಂಕಲ್ಪ', mr: 'जप संकल्प', te: 'జప సంకల్పం' },
  intro: {
    hi: 'इस मंत्र के कितने जप का संकल्प लेना है? प्रगति हर दिन जुड़ती रहेगी।',
    en: 'How much japa of this mantra do you vow to complete? Progress carries over from day to day.',
    gu: 'આ મંત્રના કેટલા જપનો સંકલ્પ લેવો છે? પ્રગતિ દરરોજ ઉમેરાતી રહેશે.',
    kn: 'ಈ ಮಂತ್ರದ ಎಷ್ಟು ಜಪದ ಸಂಕಲ್ಪ ಮಾಡುವಿರಿ? ಪ್ರಗತಿ ದಿನದಿಂದ ದಿನಕ್ಕೆ ಸೇರುತ್ತಾ ಹೋಗುತ್ತದೆ.',
    mr: 'या मंत्राच्या किती जपाचा संकल्प घ्यायचा आहे? प्रगती दररोज जोडली जाईल.',
    te: 'ఈ మంత్రాన్ని ఎన్ని జపాలు చేయాలని సంకల్పిస్తారు? పురోగతి రోజురోజుకూ జతవుతూ ఉంటుంది.',
  },
  completeLine: {
    hi: 'पूर्णाहुति — आपका संकल्प पूर्ण हुआ।',
    en: 'Purnahuti — your sankalp is complete.',
    gu: 'પૂર્ણાહુતિ — આપનો સંકલ્પ પૂર્ણ થયો.',
    kn: 'ಪೂರ್ಣಾಹುತಿ — ನಿಮ್ಮ ಸಂಕಲ್ಪ ಪೂರ್ಣವಾಯಿತು.',
    mr: 'पूर्णाहुती — तुमचा संकल्प पूर्ण झाला.',
    te: 'పూర్ణాహుతి — మీ సంకల్పం పూర్తయింది.',
  },
  unitMala: { hi: 'माला', en: 'Malas', gu: 'માળા', kn: 'ಮಾಲೆ', mr: 'माळा', te: 'మాల' },
  unitJapa: { hi: 'जप संख्या', en: 'Japa count', gu: 'જપ સંખ્યા', kn: 'ಜಪ ಸಂಖ್ಯೆ', mr: 'जप संख्या', te: 'జప సంఖ్య' },
  newTarget: { hi: 'नया लक्ष्य', en: 'New target', gu: 'નવું લક્ષ્ય', kn: 'ಹೊಸ ಗುರಿ', mr: 'नवे लक्ष्य', te: 'కొత్త లక్ష్యం' },
  target: { hi: 'लक्ष्य', en: 'Target', gu: 'લક્ષ્ય', kn: 'ಗುರಿ', mr: 'लक्ष्य', te: 'లక్ష్యం' },
  take: { hi: 'संकल्प लें', en: 'Take this sankalp', gu: 'સંકલ્પ લો', kn: 'ಸಂಕಲ್ಪ ಮಾಡಿ', mr: 'संकल्प घ्या', te: 'సంకల్పం తీసుకోండి' },
  update: { hi: 'लक्ष्य बदलें', en: 'Update target', gu: 'લક્ષ્ય બદલો', kn: 'ಗುರಿ ಬದಲಿಸಿ', mr: 'लक्ष्य बदला', te: 'లక్ష్యం మార్చండి' },
  takeNew: { hi: 'नया संकल्प लें', en: 'Take a new sankalp', gu: 'નવો સંકલ્પ લો', kn: 'ಹೊಸ ಸಂಕಲ್ಪ ಮಾಡಿ', mr: 'नवा संकल्प घ्या', te: 'కొత్త సంకల్పం తీసుకోండి' },
  setAside: { hi: 'संकल्प स्थगित करें', en: 'Set this sankalp aside', gu: 'સંકલ્પ સ્થગિત કરો', kn: 'ಸಂಕಲ್ಪವನ್ನು ಬದಿಗಿಡಿ', mr: 'संकल्प स्थगित करा', te: 'సంకల్పాన్ని వాయిదా వేయండి' },
  clearDone: { hi: 'पूर्ण संकल्प हटाएँ', en: 'Clear completed sankalp', gu: 'પૂર્ણ સંકલ્પ દૂર કરો', kn: 'ಪೂರ್ಣ ಸಂಕಲ್ಪ ತೆಗೆದುಹಾಕಿ', mr: 'पूर्ण संकल्प काढा', te: 'పూర్తయిన సంకల్పం తీసివేయండి' },
  setAsideTitle: { hi: 'संकल्प स्थगित करें?', en: 'Set this sankalp aside?', gu: 'સંકલ્પ સ્થગિત કરવો?', kn: 'ಸಂಕಲ್ಪವನ್ನು ಬದಿಗಿಡಬೇಕೆ?', mr: 'संकल्प स्थगित करायचा?', te: 'సంకల్పాన్ని వాయిదా వేయాలా?' },
  setAsideBody: {
    hi: 'अब तक की संकल्प-प्रगति हट जाएगी। माला की गिनती वैसी ही रहेगी।',
    en: 'Sankalp progress so far will be removed. Your mala count stays as it is.',
    gu: 'અત્યાર સુધીની સંકલ્પ-પ્રગતિ દૂર થશે. માળાની ગણતરી એમ જ રહેશે.',
    kn: 'ಇದುವರೆಗಿನ ಸಂಕಲ್ಪ ಪ್ರಗತಿ ತೆಗೆದುಹಾಕಲಾಗುತ್ತದೆ. ಮಾಲೆಯ ಎಣಿಕೆ ಹಾಗೆಯೇ ಉಳಿಯುತ್ತದೆ.',
    mr: 'आतापर्यंतची संकल्प-प्रगती काढली जाईल. माळेची गणती तशीच राहील.',
    te: 'ఇప్పటివరకు ఉన్న సంకల్ప పురోగతి తీసివేయబడుతుంది. మాల లెక్క అలాగే ఉంటుంది.',
  },
  keptOnReset: {
    hi: 'संकल्प की प्रगति सुरक्षित रहेगी।',
    en: 'Your sankalp progress is kept.',
    gu: 'સંકલ્પની પ્રગતિ સચવાશે.',
    kn: 'ಸಂಕಲ್ಪದ ಪ್ರಗತಿ ಉಳಿಯುತ್ತದೆ.',
    mr: 'संकल्पाची प्रगती सुरक्षित राहील.',
    te: 'సంకల్ప పురోగతి సురక్షితంగా ఉంటుంది.',
  },
  cancel: { hi: 'रद्द करें', en: 'Cancel', gu: 'રદ કરો', kn: 'ರದ್ದುಮಾಡಿ', mr: 'रद्द करा', te: 'రద్దు చేయండి' },
} as const;

/** Count-bar label after "3 / 11": "माला पूर्ण · संकल्प" / "malas done · Sankalp". */
export function sankalpRowLabel(lang: Lang, s: JapaSankalp): string {
  const unit = sankalpUnitWord(lang, s.unit, s.amount);
  return pick(lang, {
    hi: `${unit} पूर्ण · संकल्प`,
    en: `${unit} done · Sankalp`,
    gu: `${unit} પૂર્ણ · સંકલ્પ`,
    kn: `${unit} ಪೂರ್ಣ · ಸಂಕಲ್ಪ`,
    mr: `${unit} पूर्ण · संकल्प`,
    te: `${unit} పూర్తి · సంకల్పం`,
  });
}
