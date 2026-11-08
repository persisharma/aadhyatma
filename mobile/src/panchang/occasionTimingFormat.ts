import { formatClock, formatEndInstant, formatShortDate, isSameLocalDay } from './muhuratFormat';
import type { OccasionTiming, OccasionWindow } from './occasionTimings';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
export function occasionRange(w: OccasionWindow, date: Date, lang: Lang): string {
  return w.event ? formatEndInstant(w.start, date, lang) : `${formatEndInstant(w.start, date, lang)} – ${formatEndInstant(w.end, date, lang)}`;
}
/** Compact UI keeps dates beside their own endpoint, out of the large clock.
 * The full range remains the screen-reader/share description. */
export function compactOccasionRange(w: OccasionWindow, date: Date, lang: Lang) {
  const dated = !isSameLocalDay(w.start, date) || (!w.event && !isSameLocalDay(w.end, date));
  const year = w.start.getFullYear() !== date.getFullYear() || (!w.event && w.end.getFullYear() !== date.getFullYear());
  const label = (d: Date) => `${formatShortDate(d, lang)}${year ? ` ${d.getFullYear()}` : ''}`;
  return {
    start: formatClock(w.start), end: w.event ? undefined : formatClock(w.end),
    startDate: dated ? label(w.start) : undefined,
    endDate: dated && !w.event ? label(w.end) : undefined,
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
