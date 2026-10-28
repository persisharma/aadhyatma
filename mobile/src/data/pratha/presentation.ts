import type { KathaContentSection } from '@/panchang/types';
import type { PrathaEntry, PrathaTier } from './types';

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

export type PrathaPage = KathaContentSection & { tier?: PrathaTier; canonHi?: string; canonEn?: string };

/** Only registry prose enters the reader, speech and share card. Never inline a verse. */
export function prathaPages(entry: PrathaEntry): PrathaPage[] {
  return [
    { id: 'practice', titleHi: entry.questionHi, titleEn: entry.questionEn, bodyHi: [entry.practiceHi], bodyEn: [entry.practiceEn] },
    ...entry.kathas.map((story, i) => ({
      id: `katha-${i}`, titleHi: story.titleHi, titleEn: story.titleEn,
      bodyHi: [...story.bodyHi], bodyEn: [...story.bodyEn],
      tier: story.tier, canonHi: story.canonHi, canonEn: story.canonEn,
    })),
    { id: 'bhav', titleHi: 'भाव', titleEn: 'Meaning', bodyHi: [entry.bhavHi], bodyEn: [entry.bhavEn] },
    ...(entry.bodhHi && entry.bodhEn ? [{ id: 'bodh', titleHi: 'बोध', titleEn: 'A closer look', bodyHi: [entry.bodhHi], bodyEn: [entry.bodhEn] }] : []),
    { id: 'links', titleHi: 'आगे पढ़ें', titleEn: 'Read further', bodyHi: [PRATHA_FOOTER.hi], bodyEn: [PRATHA_FOOTER.en] },
  ];
}

export function matchesPratha(entry: PrathaEntry, query: string): boolean {
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const text = [entry.questionHi, entry.questionEn, entry.practiceHi, entry.practiceEn,
    ...entry.kathas.flatMap((s) => [s.regionHi ?? '', s.regionEn ?? ''])].join(' ').toLocaleLowerCase();
  return words.every((word) => text.includes(word));
}
