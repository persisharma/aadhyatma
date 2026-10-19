import type { Lang } from '@/data/gita/language';
import { charsPerLine } from './shareCardType';

export type DevotionalArt = 'krishna' | 'shiva' | 'durga' | 'saraswati' | 'ganesha' | 'vishnu' | 'hanuman' | 'rama' | 'surya' | 'prayer';
export type DevotionalPage = { art: DevotionalArt; verse: string; meaning: string; heroHeight: number; continuation: boolean };
export const devotionalMetrics = {
  width: 540, height: 675, inset: 38, contentBottom: 608, contentTop: 12,
  sourceSize: 16, sourceLeading: 26, sourceGap: 11,
  verseSize: 25, verseLeading: 43, meaningSize: 21, meaningLeading: 35,
  latinVerseSize: 26, latinVerseLeading: 35, latinMeaningSize: 23, latinMeaningLeading: 32,
  meaningLabelSize: 15, meaningLabelLeading: 25, meaningGap: 20, bottomSlack: 18,
  heroHeights: [300, 240, 170, 120, 90] as readonly number[],
} as const;
const advances: Record<Lang, number> = { hi: .44, en: .47, gu: .47, kn: .60 };
function wrappedLines(text: string, perLine: number): number {
  let lines = 1, column = 0;
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const length = Array.from(word).length;
    if (column && column + 1 + length > perLine) { lines++; column = 0; }
    if (column) column++;
    column += length;
    while (column > perLine) { lines++; column -= perLine; }
  }
  return lines;
}
export function devotionalTextHeight(text: string, lang: Lang, size: number, leading: number): number {
  if (!text.trim()) return 0;
  const perLine = charsPerLine(464, size, advances[lang]);
  return text.trim().split('\n').reduce((sum, line) => sum + wrappedLines(line, perLine) * leading, 0);
}
export function devotionalBodyHeight(header: string, verse: string, meaning: string, lang: Lang): number {
  const m = devotionalMetrics, latin = lang === 'en';
  return m.contentTop + devotionalTextHeight(header, lang, m.sourceSize, m.sourceLeading) + m.sourceGap
    + devotionalTextHeight(verse, lang, latin ? m.latinVerseSize : m.verseSize, latin ? m.latinVerseLeading : m.verseLeading)
    + (meaning.trim() ? m.meaningGap + m.meaningLabelLeading + devotionalTextHeight(meaning, lang, latin ? m.latinMeaningSize : m.meaningSize, latin ? m.latinMeaningLeading : m.meaningLeading) : 0);
}
function boundary(text: string, limit: number): number {
  if (limit >= text.length) return text.length;
  const para = text.lastIndexOf('\n\n', Math.max(0, limit - 2));
  if (para > limit * .45) return para + 2;
  let end = 0;
  for (const match of text.matchAll(/[।॥.!?][”"]?\s+/g)) {
    const next = match.index! + match[0].length;
    if (next > limit) break;
    end = next;
  }
  if (end > limit * .55) return end;
  const newline = text.lastIndexOf('\n', limit - 1);
  if (newline > limit * .65) return newline + 1;
  const word = text.lastIndexOf(' ', limit - 1);
  let cut = word > limit * .6 ? word + 1 : limit;
  if (/[\uD800-\uDBFF]/.test(text[cut - 1])) cut--;
  return cut;
}
/** Exact source slices, fixed readable type, no page-count truncation. */
export function paginateDevotional(input: { art: DevotionalArt; header: string; verse: string; meaning: string; lang: Lang }): DevotionalPage[] {
  const { art, header, lang } = input;
  const fits = (verse: string, meaning: string, hero: number) => hero + devotionalBodyHeight(header, verse, meaning, lang) <= devotionalMetrics.contentBottom - devotionalMetrics.bottomSlack;
  const heroFor = (verse: string, meaning: string) => devotionalMetrics.heroHeights.find(h => fits(verse, meaning, h)) ?? 90;
  if (fits(input.verse, input.meaning, 90)) return [{ art, verse: input.verse, meaning: input.meaning, heroHeight: heroFor(input.verse, input.meaning), continuation: false }];
  const pages: DevotionalPage[] = [];
  const take = (text: string, field: 'verse' | 'meaning', fixedVerse = '') => {
    let lo = 0, hi = text.length;
    while (lo < hi) {
      const mid = Math.ceil((lo + hi) / 2), part = text.slice(0, mid);
      if (fits(field === 'verse' ? part : fixedVerse, field === 'meaning' ? part : '', 90)) lo = mid;
      else hi = mid - 1;
    }
    const cut = boundary(text, lo);
    if (cut <= 0) throw new Error('Devotional share header leaves no room for text');
    return cut;
  };
  let verse = input.verse, meaning = input.meaning;
  while (!fits(verse, '', 90)) {
    const cut = take(verse, 'verse'), part = verse.slice(0, cut);
    pages.push({ art, verse: part, meaning: '', heroHeight: heroFor(part, ''), continuation: pages.length > 0 });
    verse = verse.slice(cut);
  }
  let firstMeaning = '';
  if (meaning && fits(verse, meaning.slice(0, 1), 90)) {
    const cut = take(meaning, 'meaning', verse);
    firstMeaning = meaning.slice(0, cut); meaning = meaning.slice(cut);
  }
  if (verse || firstMeaning || !pages.length) pages.push({ art, verse, meaning: firstMeaning, heroHeight: heroFor(verse, firstMeaning), continuation: pages.length > 0 });
  while (meaning) {
    const cut = take(meaning, 'meaning'), part = meaning.slice(0, cut);
    pages.push({ art, verse: '', meaning: part, heroHeight: heroFor('', part), continuation: true });
    meaning = meaning.slice(cut);
  }
  return pages;
}
