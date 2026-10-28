import { defaultSuvichar, suvicharDeities, suvicharReflections, suvicharWishes, type SuvicharDeity, type SuvicharFrame } from './suvichar';
import type { Lang } from './gita/language';
import { contentByLang } from '@/utils/localize';

export type SuvicharTemplate = {
  id: string; kind: 'daily' | 'wish' | 'vaar'; deity: SuvicharDeity; frame: SuvicharFrame;
  hi: string; en: string; messageHi: string; messageEn: string;
};

/** Every authored daily thought: the opening thought, then the rotating reflections. */
export const suvicharThoughts: readonly { hi: string; en: string }[] = [defaultSuvichar, ...suvicharReflections];
const LANGS: Lang[] = ['hi', 'en', 'gu', 'kn'];
/** An unedited authored thought in any reading language (not a wish or a user's own words). */
export function isSuvicharThought(message: string): boolean {
  return suvicharThoughts.some(t => LANGS.some(lang => contentByLang(lang, t.hi, t.en) === message));
}

/** The local calendar day as a day count; daily cards turn over at local midnight. */
export function suvicharDay(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000;
}

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
// Each day the thoughts advance by a whole rail of deity cards, so the day's own deity always carries a thought
// yesterday's rail did not show; the stride stays coprime so the card in a fixed rank cycles all thoughts before
// repeating one. Ranks start from the day's deities: the weekday card changes deity daily, and ranking by catalog
// index let it land on yesterday's or last week's thought and skip some thoughts altogether.
let stride = suvicharDeities.length;
while (gcd(stride, suvicharThoughts.length) !== 1) stride++;

/**
 * Curated complete compositions over the existing artwork for one day; no extra image payload. `lead` is the
 * day's own deities (the weekday card's), ranked first for the thought rotation; the rail keeps catalog order.
 */
export function suvicharTemplatesFor(day: number, lead: readonly SuvicharDeity[] = []): SuvicharTemplate[] {
  const offset = day * stride;
  const ranked = [...lead, ...suvicharDeities.map(d => d.id).filter(id => !lead.includes(id))];
  return [
    ...suvicharDeities.map((deity, index): SuvicharTemplate => {
      const thought = suvicharThoughts[(offset + ranked.indexOf(deity.id)) % suvicharThoughts.length];
      return { id: `daily-${deity.id}`, kind: 'daily', deity: deity.id,
        frame: (['mandir-jharokha', 'pushp-aangan', 'bhakti-patra'] as const)[index % 3],
        hi: deity.hi, en: deity.en, messageHi: thought.hi, messageEn: thought.en };
    }),
    ...suvicharWishes.map((wish): SuvicharTemplate => ({ ...wish, id: `wish-${wish.id}`, kind: 'wish', frame: 'mandir-jharokha' })),
  ];
}
