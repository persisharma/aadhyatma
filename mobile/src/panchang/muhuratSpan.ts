import { transliterateDevanagari } from '@/utils/transliterate';
import { contentByLang } from '@/utils/localize';
import type { Lang } from '@/data/gita/language';

/**
 * A span of whole minutes, rounded up: "41 मिनट" / "1 घं 11 मि" / "41 min" /
 * "1 h 11 m" — the "time left" and "starts in" reads on the Panchang sky and the
 * Muhurat card. Kept out of `muhuratFormat.ts`, which Home's launch path loads.
 */
export function formatSpan(ms: number, lang: Lang): string {
  const total = Math.max(1, Math.ceil(ms / 60000));
  const h = Math.floor(total / 60);
  const m = total % 60;
  const [hi, en] =
    h === 0 ? [`${m} मिनट`, `${m} min`]
      : m === 0 ? [`${h} घं`, `${h} h`]
        : [`${h} घं ${m} मि`, `${h} h ${m} m`];
  return lang === 'en' ? en : lang === 'hi' ? hi : transliterateDevanagari(hi, lang);
}

/** Where a today window stands against the clock: "in 5 h 13 m" / running / passed. */
export function windowState(start: Date, end: Date, at: number, lang: Lang): string {
  if (at < start.getTime()) {
    const span = formatSpan(start.getTime() - at, lang);
    return contentByLang(lang, `${span} में`, `in ${span}`);
  }
  if (at < end.getTime()) return contentByLang(lang, 'अभी चल रहा', 'running now');
  return contentByLang(lang, 'बीत गया', 'passed');
}
