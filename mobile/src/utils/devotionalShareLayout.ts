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
  heroHeights: [270] as readonly number[],
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
/** One complete devotional image. Only the artwork shrinks; native text sets height. */
export function devotionalCardGeometry(bodyHeight: number): { heroHeight: number; height: number } {
  // The approved plates paint the deity in the upper three quarters. A wide
  // header removes only the empty lower parchment, not a side of the scene.
  const heroHeight = 270;
  return { heroHeight, height: Math.max(devotionalMetrics.height, heroHeight + bodyHeight + 67) };
}
export function paginateDevotional(input: { art: DevotionalArt; header: string; verse: string; meaning: string; lang: Lang }): DevotionalPage[] {
  const geometry = devotionalCardGeometry(devotionalBodyHeight(input.header, input.verse, input.meaning, input.lang));
  return [{ art: input.art, verse: input.verse, meaning: input.meaning, heroHeight: geometry.heroHeight, continuation: false }];
}
