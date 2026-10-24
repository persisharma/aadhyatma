import { defaultSuvichar, suvicharDeities, suvicharFrames, suvicharReflections, suvicharWishes, type SuvicharDeity, type SuvicharFrame } from './suvichar';
import { suvicharVaarFor, suvicharVaarReflection } from './suvicharVaar';

export type SuvicharTemplate = {
  id: string; kind: 'daily' | 'wish' | 'vaar'; deity: SuvicharDeity; frame: SuvicharFrame;
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

/** Today's weekday cards: each of the day's deities in every frame, with the day's reflection. Empty on a day with no deity. */
export function suvicharVaarTemplates(date: Date): SuvicharTemplate[] {
  const vaar = suvicharVaarFor(date);
  if (!vaar) return [];
  const reflection = suvicharVaarReflection(date);
  return vaar.deities.flatMap(id => {
    const deity = suvicharDeities.find(d => d.id === id)!;
    return suvicharFrames.map((frame): SuvicharTemplate => ({ id: `vaar-${id}-${frame.id}`, kind: 'vaar', deity: id, frame: frame.id,
      hi: deity.hi, en: deity.en, messageHi: reflection.hi, messageEn: reflection.en }));
  });
}
