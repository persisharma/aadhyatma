import { formatEndInstant } from './muhuratFormat';
import type { OccasionTiming, OccasionWindow } from './occasionTimings';
import type { Lang } from '@/data/gita/language';
import { contentByLang } from '@/utils/localize';
export function occasionRange(w: OccasionWindow, date: Date, lang: Lang): string {
  return w.event ? formatEndInstant(w.start, date, lang) : `${formatEndInstant(w.start, date, lang)} – ${formatEndInstant(w.end, date, lang)}`;
}
export function occasionShareText(items: readonly OccasionTiming[], date: Date, lang: Lang): string {
  return items.map(i => [contentByLang(lang, i.nameHi, i.nameEn), ...i.windows.map(w => `${contentByLang(lang, w.labelHi, w.labelEn)} · ${occasionRange(w, date, lang)}`), i.noteHi ? contentByLang(lang, i.noteHi, i.noteEn ?? '') : ''].filter(Boolean).join('\n')).join('\n\n');
}
