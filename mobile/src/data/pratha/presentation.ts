import type { KathaContentSection } from '@/panchang/types';
import type { PrathaEntry, PrathaTier } from './types';
import { normalize } from '@/data/searchNormalize';
import { toGujarati, toKannada } from '@/utils/transliterate';

export const PRATHA_TIERS: Record<PrathaTier, { hi: string; en: string }> = {
  shastra: { hi: 'शास्त्र', en: 'Scripture' },
  purana: { hi: 'पुराण', en: 'Purana' },
  lok: { hi: 'लोक-परम्परा', en: 'Folk tradition' },
  itihas: { hi: 'इतिहास', en: 'History' },
  kavya: { hi: 'काव्य', en: 'Poetry' },
  agama: { hi: 'आगम', en: 'Agama' },
};

export const PRATHA_FOOTER = {
  hi: 'यह परिचय है, विधान नहीं — परिवार की परम्परा सर्वोपरि है।',
  en: 'This is an introduction, not a ritual prescription. Your family’s tradition comes first.',
};

export type PrathaPage = KathaContentSection;

/** Only registry prose enters the reader, speech and share card. Never inline a verse. */
export function prathaPages(entry: PrathaEntry): PrathaPage[] {
  return [
    { id: 'practice', titleHi: entry.questionHi, titleEn: entry.questionEn, bodyHi: [entry.practiceHi], bodyEn: [entry.practiceEn] },
    ...entry.kathas.map((story, i) => ({
      id: `katha-${i}`, titleHi: story.titleHi, titleEn: story.titleEn,
      // Concise regional/folk context belongs to the teaching; research locators
      // remain in the registry and never enter speech, screens or share payloads.
      bodyHi: [...(story.tier === 'lok' ? [story.regionHi ? `लोक-परम्परा · ${story.regionHi}` : 'लोक-परम्परा'] : story.regionHi ? [story.regionHi] : []), ...story.bodyHi],
      bodyEn: [...(story.tier === 'lok' ? [story.regionEn ? `Folk tradition · ${story.regionEn}` : 'Folk tradition'] : story.regionEn ? [story.regionEn] : []), ...story.bodyEn],
    })),
    { id: 'bhav', titleHi: 'भाव', titleEn: 'Meaning', bodyHi: [entry.bhavHi], bodyEn: [entry.bhavEn] },
    ...(entry.bodhHi && entry.bodhEn ? [{ id: 'bodh', titleHi: 'बोध', titleEn: 'A closer look', bodyHi: [entry.bodhHi], bodyEn: [entry.bodhEn] }] : []),
    { id: 'links', titleHi: 'आगे पढ़ें', titleEn: 'Read further', bodyHi: [PRATHA_FOOTER.hi], bodyEn: [PRATHA_FOOTER.en] },
  ];
}

export function matchesPratha(entry: PrathaEntry, query: string): boolean {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const hi = [entry.questionHi, entry.practiceHi, ...entry.kathas.map(s => s.regionHi ?? '')].join(' ');
  const text = normalize([hi, toGujarati(hi), toKannada(hi), entry.questionEn, entry.practiceEn,
    ...entry.kathas.map(s => s.regionEn ?? '')].join(' '));
  return words.every((word) => text.includes(word));
}
