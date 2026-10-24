import { contentByLang } from '@/utils/localize';
import { defaultSuvichar, suvicharArtRequest, suvicharFrames, suvicharReflections, suvicharWishes, type SuvicharDeity, type SuvicharPreferences } from './suvichar';

export type SuvicharVaar = { hi: string; en: string; deities: readonly SuvicharDeity[] };

/**
 * Weekday cards, keyed by `Date#getDay()`. The day lives only in the card title, never in a message,
 * so any reflection and any listed deity read correctly on that day. The first deity is the default;
 * the rest are existing masters of the same tradition (Salasar is a Hanuman form, Tirupati and Jagannath
 * are Vishnu forms). Latin spellings follow the weekday hashtags in shareHashtags.ts.
 * Friday follows the editorial drafts (Lakshmi), unlike Routine's VAAR_DEITY (Durga), which keeps Durga
 * as the alternate. Sunday stays empty until Surya masters are published: no other deity stands in.
 * A listed deity appears only once all three of its masters are in the runtime manifest.
 */
export const suvicharVaar: readonly SuvicharVaar[] = [
  { hi: 'शुभ रविवार', en: 'Shubh Ravivar', deities: [] },
  { hi: 'शुभ सोमवार', en: 'Shubh Somvar', deities: ['shiva'] },
  { hi: 'शुभ मंगलवार', en: 'Shubh Mangalwar', deities: ['hanuman', 'salasar-balaji'] },
  { hi: 'शुभ बुधवार', en: 'Shubh Budhwar', deities: ['ganesha'] },
  { hi: 'शुभ गुरुवार', en: 'Shubh Guruvar', deities: ['vishnu', 'tirupati-balaji', 'jagannath'] },
  { hi: 'शुभ शुक्रवार', en: 'Shubh Shukrawar', deities: ['lakshmi', 'durga'] },
  { hi: 'शुभ शनिवार', en: 'Shubh Shanivar', deities: ['hanuman', 'salasar-balaji'] },
];

const published = (deity: SuvicharDeity) => suvicharFrames.every(frame => suvicharArtRequest(deity, frame.id));
/** Today's weekday card, or null on a day with no published deity. Uses the device's civil date. */
export function suvicharVaarFor(date: Date): SuvicharVaar | null {
  const vaar = suvicharVaar[date.getDay()];
  const deities = vaar.deities.filter(published);
  return deities.length ? { ...vaar, deities } : null;
}

/** Local calendar day, so a composer left open overnight can tell that the title has changed. */
export function suvicharDayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

const reflections = [defaultSuvichar, ...suvicharReflections];
/** A shipped, day-free reflection picked by day of year, so consecutive days differ. */
export function suvicharVaarReflection(date: Date): { hi: string; en: string } {
  const day = Math.round((new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000);
  return reflections[day % reflections.length];
}

const shipped = new Set([...reflections, ...suvicharWishes.map(w => ({ hi: w.messageHi, en: w.messageEn }))]
  .flatMap(t => (['hi', 'en', 'gu', 'kn'] as const).map(lang => contentByLang(lang, t.hi, t.en))));
/** True when the reader wrote the message, rather than picking a shipped reflection or wish. */
export function isAuthoredSuvicharMessage(message: string): boolean {
  return !!message.trim() && !shipped.has(message);
}

/**
 * Opens the composer on today's card: an empty message shows the day's reflection under the day title.
 * A message the reader wrote is never replaced. Frame, sender and favorites are kept, and so is the deity
 * when it is one of today's.
 */
export function withTodaysVaar(prefs: SuvicharPreferences, date: Date): SuvicharPreferences {
  const vaar = suvicharVaarFor(date);
  if (!vaar || isAuthoredSuvicharMessage(prefs.message)) return prefs;
  return { ...prefs, vaar: true, message: '', deity: vaar.deities.includes(prefs.deity) ? prefs.deity : vaar.deities[0] };
}
