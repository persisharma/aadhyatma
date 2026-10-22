import type { DevotionalSubjectArt } from '@/data/devotionalShareArt';
import type { Lang } from '@/data/gita/language';
import { devotionalFrameSpec } from '@/data/devotionalFrameSpec';
import { charsPerLine } from './shareCardType';

export type DevotionalArt = 'krishna' | 'shiva' | 'durga' | 'saraswati' | 'ganesha' | 'vishnu' | 'hanuman' | 'rama' | 'surya' | 'prayer' | DevotionalSubjectArt;
export type DevotionalPage = { art: DevotionalArt; verse: string; verseRows?: readonly string[]; meaning: string; heroHeight: number; continuation: boolean };
export const devotionalMetrics = {
  width: 540, height: 728, inset: 28, contentBottom: 608, contentTop: 12,
  sourceSize: 15, sourceLeading: 26, sourceGap: 11,
  verseSize: 28.5, verseLeading: 42, meaningSize: 22.5, meaningLeading: 29,
  latinVerseSize: 26, latinVerseLeading: 35, latinMeaningSize: 23, latinMeaningLeading: 32,
  meaningLabelSize: 18, meaningLabelLeading: 28, meaningGap: 20, bottomSlack: 18, footerSpace: 80,
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
    + (parts.meaning ? 48 + 32 + m.meaningLabelLeading + 8 + devotionalTextHeight(parts.meaning, lang, size, leading, 420) : 0)
    + (parts.commentary ? 42 + devotionalTextHeight(parts.commentary, lang, size, leading) : 0);
}
/** One complete devotional image. A wide artwork header; native text sets height. */
export function devotionalHeroGeometry(art: DevotionalArt, width: number): { height: number; imageHeight: number } {
  const imageHeight = devotionalFrameSpec(art).hero * width / 1080;
  return { imageHeight, height: imageHeight };
}
export function devotionalCardGeometry(bodyHeight: number, art: DevotionalArt = 'vishnu'): { heroHeight: number; height: number } {
  const heroHeight = devotionalHeroGeometry(art, devotionalMetrics.width).height;
  return { heroHeight, height: Math.ceil(Math.max(devotionalMetrics.height, heroHeight + bodyHeight + devotionalMetrics.footerSpace)) };
}
export function paginateDevotional(input: { art: DevotionalArt; header: string; verse: string; verseRows?: readonly string[]; meaning: string; lang: Lang }): DevotionalPage[] {
  const geometry = devotionalCardGeometry(devotionalBodyHeight(input.header, input.verse, input.meaning, input.lang), input.art);
  return [{ art: input.art, verse: input.verse, ...(input.verseRows && { verseRows: input.verseRows }), meaning: input.meaning, heroHeight: geometry.heroHeight, continuation: false }];
}
/** A stored chaupai line "X। Y॥" carries two charans; split at its one inner danda. */
function coupletHalves(line: string): string[] | null {
  const m = /^(.*?[^।]।)\s+(\S.*)$/.exec(line.trim());
  return m && m[2].endsWith('॥') && !/[^।]।\s+\S/.test(m[2]) ? [m[1], m[2]] : null;
}
/**
 * Verse rows with one charan each. Only a stored couplet line (Sundarkand and Bajrang
 * Baan keep two charans per line) splits; romanized lines split at their single ". "
 * where the Devanagari line did. Every other line stays whole. DevotionalVerseBody shows
 * these rows only when each fits on one row.
 */
export function devotionalCharanRows(lang: Lang, devaLines: readonly string[], shownLines: readonly string[]): string[] {
  return shownLines.flatMap((line, i) => {
    if (!coupletHalves(devaLines[i] ?? '')) return [line.trim()];
    const latin = lang === 'en' ? /^(.*?\.)\s+(\S.*)$/.exec(line.trim()) : null;
    return coupletHalves(line) ?? (latin && !/\.\s+\S/.test(latin[2]) ? [latin[1], latin[2]] : [line.trim()]);
  });
}
