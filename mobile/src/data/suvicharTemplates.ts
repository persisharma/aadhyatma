import { defaultSuvichar, suvicharDeities, suvicharReflections, suvicharWishes, type SuvicharDeity, type SuvicharFrame } from './suvichar';
import type { Lang } from './gita/language';
import { contentByLang } from '@/utils/localize';
import { isSourcedSuvicharMessage, suvicharSourcedThoughts, suvicharThoughtForDay } from './suvicharContent';

export type SuvicharTemplate = {
  id: string; kind: 'daily' | 'wish' | 'vaar'; deity: SuvicharDeity; frame: SuvicharFrame;
  hi: string; en: string; messageHi: string; messageEn: string; thoughtId?: string;
};

/** Complete approved collection; each deity rotates within its own family. */
export const suvicharThoughts = suvicharSourcedThoughts;
const legacyThoughts = [defaultSuvichar, ...suvicharReflections];
const LANGS: Lang[] = ['hi', 'en', 'gu', 'kn'];
/** An unedited authored thought in any reading language (not a wish or a user's own words). */
export function isSuvicharThought(message: string): boolean {
  return isSourcedSuvicharMessage(message) || legacyThoughts.some(t => LANGS.some(lang => contentByLang(lang, t.hi, t.en) === message));
}

/** The local calendar day as a day count; daily cards turn over at local midnight. */
export function suvicharDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

/** Curated complete compositions over the existing artwork for one day; no extra image payload. */
export function suvicharTemplatesFor(day: number): SuvicharTemplate[] {
  return [
    ...suvicharDeities.map((deity, index): SuvicharTemplate => {
      const thought = suvicharThoughtForDay(deity.id, day);
      return { id: `daily-${deity.id}`, kind: 'daily', deity: deity.id,
        frame: (['mandir-jharokha', 'pushp-aangan', 'bhakti-patra'] as const)[index % 3],
        hi: deity.hi, en: deity.en, messageHi: thought.hi, messageEn: thought.en, thoughtId: thought.id };
    }),
    ...suvicharWishes.map((wish): SuvicharTemplate => ({ ...wish, id: `wish-${wish.id}`, kind: 'wish', frame: 'mandir-jharokha' })),
  ];
}
