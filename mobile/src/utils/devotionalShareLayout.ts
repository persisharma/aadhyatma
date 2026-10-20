import type { Lang } from '@/data/gita/language';
import artManifest from '../../assets/devotional-share/manifest.json';
import { charsPerLine } from './shareCardType';

export type DevotionalArt = 'krishna' | 'shiva' | 'durga' | 'saraswati' | 'ganesha' | 'vishnu' | 'hanuman' | 'rama' | 'surya' | 'prayer';
export type DevotionalPage = { art: DevotionalArt; verse: string; meaning: string; heroHeight: number; continuation: boolean };
export const devotionalMetrics = {
  width: 540, height: 675, inset: 38, contentBottom: 608, contentTop: 12,
  sourceSize: 16, sourceLeading: 26, sourceGap: 11,
  verseSize: 25, verseLeading: 43, meaningSize: 21, meaningLeading: 35,
  latinVerseSize: 26, latinVerseLeading: 35, latinMeaningSize: 23, latinMeaningLeading: 32,
  meaningLabelSize: 15, meaningLabelLeading: 25, meaningGap: 20, bottomSlack: 18, footerSpace: 100,
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
export function devotionalTextHeight(text: string, lang: Lang, size: number, leading: number, width = 464): number {
  if (!text.trim()) return 0;
  const perLine = charsPerLine(width, size, advances[lang]);
  return text.trim().split('\n').reduce((sum, line) => sum + wrappedLines(line, perLine) * leading, 0);
}
/** Preserve every stored paragraph; only its presentation changes. */
export function splitDevotionalMeaning(text: string): { meaning: string; commentary: string } {
  const trimmed = text.trim();
  const separator = /\n\s*\n/.exec(trimmed);
  if (!separator) return { meaning: trimmed, commentary: '' };
  return { meaning: trimmed.slice(0, separator.index), commentary: trimmed.slice(separator.index + separator[0].length) };
}
export function devotionalBodyHeight(header: string, verse: string, meaning: string, lang: Lang): number {
  const m = devotionalMetrics, latin = lang === 'en';
  const parts = splitDevotionalMeaning(meaning);
  const size = latin ? m.latinMeaningSize : m.meaningSize;
  const leading = latin ? m.latinMeaningLeading : m.meaningLeading;
  return m.contentTop + 16 + devotionalTextHeight(header, lang, m.sourceSize, m.sourceLeading) + 38
    + devotionalTextHeight(verse, lang, latin ? m.latinVerseSize : m.verseSize, latin ? m.latinVerseLeading : m.verseLeading)
    + (parts.meaning ? 48 + 32 + m.meaningLabelLeading + 8 + devotionalTextHeight(parts.meaning, lang, size, leading, 412) : 0)
    + (parts.commentary ? 42 + devotionalTextHeight(parts.commentary, lang, size, leading) : 0);
}
/** One complete devotional image. A wide artwork header; native text sets height. */
export function devotionalHeroGeometry(art: DevotionalArt, width: number): { height: number; imageHeight: number } {
  const plate = artManifest.assets[art];
  const imageHeight = width * plate.height / plate.width;
  // Only the neutral legacy plate has an empty lower paper band.
  return { imageHeight, height: art === 'prayer' ? width / 2 : imageHeight };
}
export function devotionalCardGeometry(bodyHeight: number, art: DevotionalArt = 'vishnu'): { heroHeight: number; height: number } {
  const heroHeight = devotionalHeroGeometry(art, devotionalMetrics.width).height;
  return { heroHeight, height: Math.ceil(Math.max(devotionalMetrics.height, heroHeight + bodyHeight + devotionalMetrics.footerSpace)) };
}
export function paginateDevotional(input: { art: DevotionalArt; header: string; verse: string; meaning: string; lang: Lang }): DevotionalPage[] {
  const geometry = devotionalCardGeometry(devotionalBodyHeight(input.header, input.verse, input.meaning, input.lang), input.art);
  return [{ art: input.art, verse: input.verse, meaning: input.meaning, heroHeight: geometry.heroHeight, continuation: false }];
}
