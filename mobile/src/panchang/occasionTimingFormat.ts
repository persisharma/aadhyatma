import { formatClock, formatEndInstant, formatShortDate, isSameLocalDay } from './muhuratFormat';
import type { OccasionTiming, OccasionWindow } from './occasionTimings';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';

const MINUTE_MS = 60_000;

/** Display only: leave the start and all astronomical instants unchanged.
 * Ritual window END clocks use the last whole minute no later than the end.
 * Very short windows keep their raw endpoint if rounding would move the
 * end before or exactly onto the real start; the clock formatter still
 * truncates the display without inventing an invalid instant.
 * Event instants (e.g. moonrise) are never adjusted.
 */
export function occasionDisplayEndpoints(w: OccasionWindow): { start: Date; end?: Date } {
  if (w.event) return { start: w.start };
  const end = new Date(Math.floor(w.end.getTime() / MINUTE_MS) * MINUTE_MS);
  return { start: w.start, end: end > w.start ? end : w.end };
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
/** Full Panchang already supplies its date. Individual dated shares opt in,
 * using the same reference date as their image; undated guidance stays undated. */
export function occasionShareText(items: readonly OccasionTiming[], date: Date, lang: Lang, includeDate = false): string {
  const range = (w: OccasionWindow) => {
    const { start, end } = occasionDisplayEndpoints(w);
    // A forwarded message must distinguish December from the following January.
    // Keep the image and all calculated instants unchanged.
    if (includeDate && (start.getFullYear() !== date.getFullYear() || (end && end.getFullYear() !== date.getFullYear()))) {
      const endpoint = (d: Date) => `${formatClock(d)}, ${formatShortDate(d, lang)} ${d.getFullYear()}`;
      return end ? `${endpoint(start)} – ${endpoint(end)}` : endpoint(start);
    }
    return occasionRange(w, date, lang);
  };
  return items.map(i => [
    contentByLang(lang, i.nameHi, i.nameEn),
    includeDate ? `${formatShortDate(date, lang)} ${date.getFullYear()}` : '',
    ...i.windows.map(w => `${contentByLang(lang, w.labelHi, w.labelEn)} · ${range(w)}`),
    i.noteHi ? contentByLang(lang, i.noteHi, i.noteEn ?? '') : '',
  ].filter(Boolean).join('\n')).join('\n\n');
}

/** Adjacent rites in a festival detail keep their own poster date. A parana
 * displayed on today's Panchang keeps today's date instead of yesterday's fast. */
export function occasionCardReference(item: OccasionTiming, selected: Date): Date {
  const lo = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
  const hi = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate() + 1);
  return item.windows.some(w => w.start < hi && w.end >= lo) ? selected : item.date;
}
