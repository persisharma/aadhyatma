import { contentByLang } from '@/utils/localize';
import { suvicharArtRequest, suvicharFrames, suvicharWishes, type SuvicharDeity, type SuvicharPreferences } from './suvichar';
import { isSuvicharThought, suvicharDay, suvicharTemplatesFor, type SuvicharTemplate } from './suvicharTemplates';

export type SuvicharVaar = { hi: string; en: string; deities: readonly SuvicharDeity[] };

/**
 * Weekday cards, keyed by `Date#getDay()`. The day lives only in the card title, never in a message,
 * so any thought and any listed deity read correctly on that day. Every catalog deity belongs to at
 * least one day; the first deity is the day's default. Forms follow their deity: Salasar with Hanuman,
 * Tirupati, Jagannath, Ram and Ram Darbar with Vishnu, and Radha–Krishna, Sanwariya Seth and Khatu Shyam
 * with Krishna; Saraswati joins Ganesha as the pair for learning. Friday follows the editorial drafts
 * (Lakshmi), unlike Routine's VAAR_DEITY (Durga). Sunday is Surya's day; there are no Surya masters yet,
 * so it shows Vishnu as Surya-Narayan. Put Surya first once its masters are published. A listed deity
 * with artwork appears only once all three masters are in the runtime manifest; Annapurna is explicitly
 * text-only. Latin spellings follow the
 * weekday hashtags in shareHashtags.ts.
 */
export const suvicharVaar: readonly SuvicharVaar[] = [
  { hi: 'शुभ रविवार', en: 'Shubh Ravivar', deities: ['vishnu', 'tirupati-balaji'] },
  { hi: 'शुभ सोमवार', en: 'Shubh Somvar', deities: ['shiva', 'mahakaal'] },
  { hi: 'शुभ मंगलवार', en: 'Shubh Mangalwar', deities: ['hanuman', 'salasar-balaji'] },
  { hi: 'शुभ बुधवार', en: 'Shubh Budhwar', deities: ['ganesha', 'saraswati', 'krishna', 'radha-krishna', 'sanwariya-seth', 'khatu-shyam'] },
  { hi: 'शुभ गुरुवार', en: 'Shubh Guruvar', deities: ['vishnu', 'tirupati-balaji', 'jagannath', 'rama', 'ram-darbar'] },
  { hi: 'शुभ शुक्रवार', en: 'Shubh Shukrawar', deities: ['lakshmi', 'durga', 'annapurna'] },
  { hi: 'शुभ शनिवार', en: 'Shubh Shanivar', deities: ['hanuman', 'salasar-balaji'] },
];

const published = (deity: SuvicharDeity) => suvicharFrames.every(frame => suvicharArtRequest(deity, frame.id));
/** Today's weekday card, or null on a day with no published deity. Uses the device's civil date. */
export function suvicharVaarFor(date: Date): SuvicharVaar | null {
  const vaar = suvicharVaar[date.getDay()];
  const deities = vaar.deities.filter(published);
  return deities.length ? { ...vaar, deities } : null;
}

/** Today's weekday cards: each of the day's deities in every frame, carrying that deity's thought for the day. */
export function suvicharVaarTemplates(date: Date, templates: SuvicharTemplate[] = suvicharTemplatesFor(suvicharDay(date))): SuvicharTemplate[] {
  const vaar = suvicharVaarFor(date);
  if (!vaar) return [];
  return vaar.deities.flatMap(id => {
    const daily = templates.find(t => t.kind === 'daily' && t.deity === id)!;
    return suvicharFrames.map((frame): SuvicharTemplate => ({ ...daily, id: `vaar-${id}-${frame.id}`, kind: 'vaar', frame: frame.id }));
  });
}

const wishes = new Set(suvicharWishes.flatMap(w => (['hi', 'en', 'gu', 'kn'] as const).map(lang => contentByLang(lang, w.messageHi, w.messageEn))));
/** True when the reader wrote the message, rather than keeping a shipped thought or wish. */
export function isAuthoredSuvicharMessage(message: string): boolean {
  return !!message.trim() && !isSuvicharThought(message) && !wishes.has(message);
}

/**
 * Opens the composer on today's card: an empty message shows the deity's thought for the day under the
 * day title. A message the reader wrote is never replaced. Frame, sender and favorites are kept, and so
 * is the deity when it is one of today's.
 */
export function withTodaysVaar(prefs: SuvicharPreferences, date: Date): SuvicharPreferences {
  const vaar = suvicharVaarFor(date);
  if (!vaar || isAuthoredSuvicharMessage(prefs.message)) return prefs;
  return { ...prefs, vaar: true, message: '', thoughtId: '', deity: vaar.deities.includes(prefs.deity) ? prefs.deity : vaar.deities[0] };
}
