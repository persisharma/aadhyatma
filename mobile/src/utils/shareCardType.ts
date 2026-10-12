/** Readable type and spacing for the content-sized verse share image (§39). */
export const shareCardMetrics = {
  paddingTop: 28,
  paddingBottom: 22,
  paddingHorizontal: 28,
  verseLineHeight: 40,
  verseLineMargin: 2,
  meaningFontSize: 18,
  meaningLineHeight: 27,
  meaningMarginTop: 6,
  meaningPaddingHorizontal: 12,
} as const;

export function meaningScriptFor(lang: string): 'latin' | 'indic' {
  return lang === 'en' ? 'latin' : 'indic';
}

/** Prose pagination uses its separately calibrated glyph advances. */
export function charsPerLine(widthDp: number, fontSize: number, advance: number): number {
  return Math.max(8, Math.floor(widthDp / (fontSize * advance)));
}
