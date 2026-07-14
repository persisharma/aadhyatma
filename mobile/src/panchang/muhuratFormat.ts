/**
 * Display helpers for muhurat times. Pure — 12-hour clock with AM/PM, matching
 * the Panchang tab's existing time cells.
 */
import { transliterateDevanagari } from '@/utils/transliterate';
import type { Lang } from '@/data/gita/language';

/** 12-hour clock with AM/PM. Null → '' (matches the Panchang tab's time cells). */
export function formatClock(d: Date | null): string {
  if (!d) return '';
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function formatRange(a: Date, b: Date): string {
  return `${formatClock(a)} – ${formatClock(b)}`;
}

/**
 * Range with the shared meridiem written once — `11:17 – 12:05 PM` instead of
 * `11:17 AM – 12:05 PM` — for tight glance surfaces (Home Today strip). Falls
 * back to the full range when the window crosses noon/midnight.
 */
export function formatRangeCompact(a: Date, b: Date): string {
  const from = formatClock(a);
  const to = formatClock(b);
  const fromMeridiem = from.slice(-2);
  return fromMeridiem === to.slice(-2) ? `${from.slice(0, -3)} – ${to}` : `${from} – ${to}`;
}

const MONTHS_SHORT_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_SHORT_HI = ['जन', 'फ़र', 'मार्च', 'अप्रै', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्टू', 'नवं', 'दिसं'];

export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Clock for an anga/muhurat end instant, with a short-date suffix whenever it
 * falls on a different civil day than `referenceDay` — a bare "2:04 AM" for
 * tonight otherwise reads as this morning. Shared by every end-time surface
 * (Panchang anga tiles, Muhurat detail/share card).
 */
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
