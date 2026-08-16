/**
 * Deterministic type fit for the share card's meaning block (design.md §39).
 *
 * The meaning used to be pinned at 14/24 with `adjustsFontSizeToFit` +
 * `minimumFontScale={0.5}` over `numberOfLines={5}`. Two things broke that:
 *
 *  1. The 5-line cap forced almost every real meaning to shrink, and the shrink
 *     bottomed out at 7 pt — under the §3.0 10 pt floor and unreadable in a
 *     1080×1350 PNG viewed in a chat thread.
 *  2. `lineHeight` stayed a fixed 24 while the glyphs shrank, so the leading
 *     ratio blew out to ~3.4×. That is the "fixed leading + platform auto-fit"
 *     trap already recorded on CategoryCard and Namkaran: on iOS a multi-line
 *     label with a fixed `lineHeight` shrinks erratically and ignores
 *     `minimumFontScale` entirely.
 *
 * So the card picks its own size in JS instead: the largest step on the ladder
 * whose estimated wrap fits the height the card actually has left, with leading
 * derived from that size. No platform auto-fit, nothing below 12 pt, and the
 * line budget comes from real geometry rather than a hard-coded 5.
 */

/**
 * Vertical/horizontal metrics of the share card, in dp. Mirrored into
 * `ShareCard`'s StyleSheet so the budget below and the rendered card cannot
 * drift apart. The three `*_BLOCK` numbers are measured heights of chrome the
 * meaning has to share the card with (label, ornament, branding footer),
 * including their own margins.
 */
export const shareCardMetrics = {
  paddingTop: 28,
  paddingBottom: 22,
  paddingHorizontal: 28,
  /** 13 pt tracked label on its natural Devanagari line box + its 18 dp margin. */
  headerBlock: 40,
  /** `Ornament`: a 14 pt glyph row inside 26 dp of margin, top and bottom. */
  ornamentBlock: 74,
  /** Divider rule + wordmark + tagline + store line, with margins. */
  footerBlock: 100,
  verseLineHeight: 40,
  verseLineMargin: 2,
  meaningMarginTop: 6,
  meaningPaddingHorizontal: 12,
} as const;

/** Largest → smallest. 12 keeps the §3.0 ≥10 pt floor with room to spare. */
const SIZE_LADDER = [18, 17, 16, 15, 14, 13, 12] as const;

/**
 * Leading multiple. Indic needs ≥1.4× or matras clip (§3.0); 1.5× also keeps
 * a centred multi-line block from reading as a stack of loose strips.
 */
const LEADING = 1.5;

/**
 * Mean glyph advance as a fraction of the font size, used only to estimate how
 * many lines a meaning will wrap to. Deliberately a touch wide on both scripts:
 * over-estimating the wrap costs one step down the ladder, under-estimating
 * would let the tail of a meaning fall past the line budget and ellipsize.
 * (Devanagari measures ~0.50 in Noto Serif once zero-width matras are averaged
 * in; Cormorant italic is nearer 0.42.)
 */
const AVG_ADVANCE = { indic: 0.52, latin: 0.46 } as const;

export type MeaningScript = keyof typeof AVG_ADVANCE;

export type MeaningTypeFit = {
  fontSize: number;
  lineHeight: number;
  /** Height-derived cap; the meaning is only clipped past this many lines. */
  numberOfLines: number;
};

export function meaningScriptFor(lang: string): MeaningScript {
  return lang === 'en' ? 'latin' : 'indic';
}

/** Lines `text` wraps to at `fontSize`, honouring explicit newlines. */
export function estimateWrappedLines(
  text: string,
  widthDp: number,
  fontSize: number,
  script: MeaningScript
): number {
  const charsPerLine = Math.max(8, Math.floor(widthDp / (fontSize * AVG_ADVANCE[script])));
  return text
    .split('\n')
    .reduce((total, para) => total + Math.max(1, Math.ceil(para.trim().length / charsPerLine)), 0);
}

/**
 * Pick the meaning's size, leading, and line cap for a given card and verse.
 *
 * The verse block flex-grows above the meaning, so a four-line shloka leaves
 * the meaning less room than a two-line one — the budget is computed from the
 * verse's actual line count rather than assumed.
 */
export function fitMeaningType(params: {
  meaning: string;
  verseLineCount: number;
  cardWidth: number;
  cardHeight: number;
  script: MeaningScript;
}): MeaningTypeFit {
  const m = shareCardMetrics;
  const chrome =
    m.paddingTop +
    m.paddingBottom +
    m.headerBlock +
    m.ornamentBlock +
    m.footerBlock +
    m.meaningMarginTop;
  const verseBlock =
    Math.max(1, params.verseLineCount) * (m.verseLineHeight + m.verseLineMargin);
  const available = Math.max(0, params.cardHeight - chrome - verseBlock);
  const textWidth = Math.max(
    120,
    params.cardWidth - 2 * m.paddingHorizontal - 2 * m.meaningPaddingHorizontal
  );

  for (const fontSize of SIZE_LADDER) {
    const lineHeight = Math.round(fontSize * LEADING);
    const maxLines = Math.floor(available / lineHeight);
    if (maxLines < 1) continue;
    const wrapped = estimateWrappedLines(params.meaning, textWidth, fontSize, params.script);
    if (wrapped <= maxLines) return { fontSize, lineHeight, numberOfLines: maxLines };
  }

  // Longer than the card can hold even at the floor size (a handful of Valmiki
  // Ramayan prose meanings run past 1200 characters). Show a readable excerpt
  // rather than a full-length but illegible one.
  const fontSize = SIZE_LADDER[SIZE_LADDER.length - 1];
  const lineHeight = Math.round(fontSize * LEADING);
  return {
    fontSize,
    lineHeight,
    numberOfLines: Math.max(1, Math.floor(available / lineHeight)),
  };
}
