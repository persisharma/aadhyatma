/**
 * Display helpers for muhurat times. Pure — 24-hour `HH:MM` clock, the one
 * time format the whole app uses.
 */
import { transliterateDevanagari } from '@/utils/transliterate';
import { civilDateOf, civilFieldsOf, isOnCivilDay } from './civilTime';
import type { Lang } from '@/data/gita/language';
import { isRescriptLang } from '@/utils/localize';

/**
 * 24-hour `HH:MM` clock of an INSTANT at the Panchang location, e.g. `06:24` /
 * `17:13`. Null → ''. India's clock, not the phone's (`civilTime.ts`): a phone
 * abroad must print the same sunrise as one in India.
 */
export function formatClock(d: Date | null): string {
  if (!d) return '';
  const { hour, minute } = civilFieldsOf(d);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatRange(a: Date, b: Date): string {
  return `${formatClock(a)} – ${formatClock(b)}`;
}

const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SHORT_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

/** Two INSTANTS on the same civil date at the Panchang location. */
export function isSameCivilDay(a: Date, b: Date): boolean {
  return isOnCivilDay(a, civilDateOf(b));
}

/** Two LABELS naming the same civil date. For an INSTANT against a label use
 * `isOnCivilDay` — an instant's own y/m/d are the phone's, not India's. */
export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "17 Aug" / "17 अग" — the finder's result-card date (weekday rendered separately). */
export function formatShortDate(d: Date, lang: Lang): string {
  const month =
    lang === 'en'
      ? MONTHS_SHORT_EN[d.getMonth()]
      : !isRescriptLang(lang)
        ? MONTHS_SHORT_HI[d.getMonth()]
        : transliterateDevanagari(MONTHS_SHORT_HI[d.getMonth()], lang);
  return `${d.getDate()} ${month}`;
}

/**
 * Clock for an anga/muhurat end instant, with a short-date suffix whenever it
 * falls on a different civil day than `referenceDay` — a bare "02:04" for
 * tonight otherwise reads as this morning. Shared by every end-time surface
 * (Panchang anga tiles, Muhurat detail/share card).
 */
/**
 * Start–end range whose END goes through `formatEndInstant`, for windows that
 * routinely outlive midnight (the शुभ योग windows, PRD-27): `06:24 – 02:12,
 * 15 अक्टू`. Never the printed-panchang extended-hour style (26:12).
 */
export function formatRangeEndAware(start: Date, end: Date, referenceDay: Date, lang: Lang): string {
  return `${formatClock(start)} – ${formatEndInstant(end, referenceDay, lang)}`;
}

/** `end` is an INSTANT; `referenceDay` is the civil-date LABEL it is shown under. */
export function formatEndInstant(end: Date, referenceDay: Date, lang: Lang): string {
  const time = formatClock(end);
  if (isOnCivilDay(end, referenceDay)) return time;
  return `${time}, ${formatShortDate(civilDateOf(end), lang)}`;
}
