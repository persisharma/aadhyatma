/**
 * Display helpers for muhurat times. Pure — 24-hour `HH:MM` clock, the one
 * time format the whole app uses.
 */
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';

/** 24-hour `HH:MM` clock, e.g. `06:24` / `17:13`. Null → ''. */
export function formatClock(d: Date | null): string {
  if (!d) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function formatRange(a: Date, b: Date): string {
  return `${formatClock(a)} – ${formatClock(b)}`;
}

const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SHORT_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** "17 Aug" / "17 अग" — the finder's result-card date (weekday rendered separately). */
export function formatShortDate(d: Date, lang: Lang): string {
  const month =
    lang === 'en'
      ? MONTHS_SHORT_EN[d.getMonth()]
      : lang === 'hi'
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

export function formatEndInstant(end: Date, referenceDay: Date, lang: Lang): string {
  const time = formatClock(end);
  if (isSameLocalDay(end, referenceDay)) return time;
  const month =
    lang === 'en'
      ? MONTHS_SHORT_EN[end.getMonth()]
      : lang === 'hi'
        ? MONTHS_SHORT_HI[end.getMonth()]
        : transliterateDevanagari(MONTHS_SHORT_HI[end.getMonth()], lang);
  return `${time}, ${end.getDate()} ${month}`;
}
