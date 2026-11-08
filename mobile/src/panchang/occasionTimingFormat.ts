import { formatClock, formatEndInstant, formatShortDate, isSameLocalDay } from './muhuratFormat';
import type { OccasionTiming, OccasionWindow } from './occasionTimings';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';

const MINUTE_MS = 60_000;

/** Display only: do not round astronomical timestamps, cache inputs or event instants.
 * For ritual windows, choose the first whole minute at/after the real start,
 * and the last whole minute at/before the real end.
 * Extremely short windows with no full displayed minute retain the raw bounds
 * rather than showing an inverted/zero-length minute range.
 */
export function occasionDisplayEndpoints(w: OccasionWindow): { start: Date; end?: Date } {
  if (w.event) return { start: w.start };
  const start = new Date(Math.ceil(w.start.getTime() / MINUTE_MS) * MINUTE_MS);
  const end = new Date(Math.floor(w.end.getTime() / MINUTE_MS) * MINUTE_MS);
  return start < end ? { start, end } : { start: w.start, end: w.end };
}

/** Shared by compact Panchang, illustrated Vrat, full/focused PNG and text. */
export function occasionRangeParts(w: OccasionWindow, date: Date, lang: Lang) {
  const { start, end } = occasionDisplayEndpoints(w);
  return {
    start, end,
    startText: formatEndInstant(start, date, lang),
    endText: end ? formatEndInstant(end, date, lang) : undefined,
  };
}

export function occasionRange(w: OccasionWindow, date: Date, lang: Lang): string {
  const { startText, endText } = occasionRangeParts(w, date, lang);
  return endText ? `${startText} – ${endText}` : startText;
}

/** Compact UI keeps dates beside their own endpoint, out of the large clock.
 * The full range remains the screen-reader/share description. */
export function compactOccasionRange(w: OccasionWindow, date: Date, lang: Lang) {
  const { start, end } = occasionDisplayEndpoints(w);
  const dated = !isSameLocalDay(start, date) || (end !== undefined && !isSameLocalDay(end, date));
  const year = start.getFullYear() !== date.getFullYear() || (end !== undefined && end.getFullYear() !== date.getFullYear());
  const label = (d: Date) => `${formatShortDate(d, lang)}${year ? ` ${d.getFullYear()}` : ''}`;
  return {
    start: formatClock(start), end: end ? formatClock(end) : undefined,
    startDate: dated ? label(start) : undefined,
    endDate: dated && end ? label(end) : undefined,
  };
}
export function occasionShareText(items: readonly OccasionTiming[], date: Date, lang: Lang): string {
  return items.map(i => [contentByLang(lang, i.nameHi, i.nameEn), ...i.windows.map(w => `${contentByLang(lang, w.labelHi, w.labelEn)} · ${occasionRange(w, date, lang)}`), i.noteHi ? contentByLang(lang, i.noteHi, i.noteEn ?? '') : ''].filter(Boolean).join('\n')).join('\n\n');
}

/** Adjacent rites in a festival detail keep their own poster date. A parana
 * displayed on today's Panchang keeps today's date instead of yesterday's fast. */
export function occasionCardReference(item: OccasionTiming, selected: Date): Date {
  const lo = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const hi = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
  return item.windows.some(w => w.start < hi && w.end >= lo) ? selected : item.date;
}
