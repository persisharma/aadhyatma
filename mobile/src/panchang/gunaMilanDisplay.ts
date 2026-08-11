import type { Lang } from '@/data/gita/language';
import { RASHI_NAMES_EN, RASHI_NAMES_HI } from './kundali';
import type { KootaId, MoonClassification } from './gunaMilan';
import { NAKSHATRA_NAMES_EN, NAKSHATRA_NAMES_HI } from './names';
import { contentByLang } from '@/utils/localize';

type LocalName = readonly [hi: string, en: string];

const VARNA_NAMES: Record<MoonClassification['varna'], LocalName> = {
  brahmin: ['ब्राह्मण', 'Brahmin'],
  kshatriya: ['क्षत्रिय', 'Kshatriya'],
  vaishya: ['वैश्य', 'Vaishya'],
  shudra: ['शूद्र', 'Shudra'],
};

const VASHYA_NAMES: Record<MoonClassification['vashya'], LocalName> = {
  chatushpada: ['चतुष्पद', 'Quadruped'],
  manava: ['मानव', 'Human'],
  jalachara: ['जलचर', 'Aquatic'],
  vanachara: ['वनचर', 'Wild'],
  keeta: ['कीट', 'Insect'],
};

const YONI_NAMES: Record<MoonClassification['yoni'], LocalName> = {
  horse: ['अश्व', 'Horse'],
  elephant: ['गज', 'Elephant'],
  sheep: ['मेष', 'Sheep'],
  serpent: ['सर्प', 'Serpent'],
  dog: ['श्वान', 'Dog'],
  cat: ['मार्जार', 'Cat'],
  rat: ['मूषक', 'Rat'],
  cow: ['गौ', 'Cow'],
  buffalo: ['महिष', 'Buffalo'],
  tiger: ['व्याघ्र', 'Tiger'],
  deer: ['मृग', 'Deer'],
  monkey: ['वानर', 'Monkey'],
  mongoose: ['नकुल', 'Mongoose'],
  lion: ['सिंह', 'Lion'],
};

const LORD_NAMES: Record<MoonClassification['rashiLord'], LocalName> = {
  sun: ['सूर्य', 'Sun'],
  moon: ['चन्द्र', 'Moon'],
  mars: ['मंगल', 'Mars'],
  mercury: ['बुध', 'Mercury'],
  jupiter: ['गुरु', 'Jupiter'],
  venus: ['शुक्र', 'Venus'],
  saturn: ['शनि', 'Saturn'],
};

const GANA_NAMES: Record<MoonClassification['gana'], LocalName> = {
  deva: ['देव', 'Deva'],
  manushya: ['मनुष्य', 'Manushya'],
  rakshasa: ['राक्षस', 'Rakshasa'],
};

const NADI_NAMES: Record<MoonClassification['nadi'], LocalName> = {
  adi: ['आदि', 'Adi'],
  madhya: ['मध्य', 'Madhya'],
  antya: ['अन्त्य', 'Antya'],
};

function localName(lang: Lang, name: LocalName): string {
  return contentByLang(lang, name[0], name[1]);
}

export function localizedNakshatraName(index: number, lang: Lang): string {
  const hi = NAKSHATRA_NAMES_HI[index];
  const en = NAKSHATRA_NAMES_EN[index];
  if (!hi || !en) throw new Error(`Unknown nakshatra index: ${index}`);
  return contentByLang(lang, hi, en);
}

export function localizedNakshatraList(indices: readonly number[], lang: Lang): string {
  return indices.map((index) => localizedNakshatraName(index, lang)).join(' · ');
}

export function localizedKootaInput(
  id: KootaId,
  classification: MoonClassification,
  lang: Lang
): string {
  switch (id) {
    case 'varna': return localName(lang, VARNA_NAMES[classification.varna]);
    case 'vashya': return localName(lang, VASHYA_NAMES[classification.vashya]);
    case 'tara': return localizedNakshatraName(classification.nakshatraIndex, lang);
    case 'yoni': return localName(lang, YONI_NAMES[classification.yoni]);
    case 'grahaMaitri': return localName(lang, LORD_NAMES[classification.rashiLord]);
    case 'gana': return localName(lang, GANA_NAMES[classification.gana]);
    case 'bhakoot': return contentByLang(
      lang,
      RASHI_NAMES_HI[classification.rashiIndex],
      RASHI_NAMES_EN[classification.rashiIndex]
    );
    case 'nadi': return localName(lang, NADI_NAMES[classification.nadi]);
  }
}

export function localizedKootaInputList(
  id: KootaId,
  classifications: readonly MoonClassification[],
  lang: Lang
): string {
  return [...new Set(classifications.map((value) => localizedKootaInput(id, value, lang)))].join(' · ');
}
