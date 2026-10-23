import { defaultSuvichar, suvicharDeities, suvicharReflections, suvicharWishes, type SuvicharDeity, type SuvicharFrame } from './suvichar';

export type SuvicharTemplate = {
  id: string; kind: 'daily' | 'wish'; deity: SuvicharDeity; frame: SuvicharFrame;
  hi: string; en: string; messageHi: string; messageEn: string;
};

/** Curated complete compositions over the existing artwork; no extra image payload. */
export const suvicharTemplates: SuvicharTemplate[] = [
  ...suvicharDeities.map((deity, index): SuvicharTemplate => {
    const reflection = index === 0 ? defaultSuvichar : suvicharReflections[index - 1];
    return { id: `daily-${deity.id}`, kind: 'daily', deity: deity.id,
      frame: (['mandir-jharokha', 'pushp-aangan', 'bhakti-patra'] as const)[index % 3],
      hi: deity.hi, en: deity.en, messageHi: reflection.hi, messageEn: reflection.en };
  }),
  ...suvicharWishes.map((wish): SuvicharTemplate => ({ ...wish, id: `wish-${wish.id}`, kind: 'wish', frame: 'mandir-jharokha' })),
];
