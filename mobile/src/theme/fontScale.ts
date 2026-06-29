import { type TypographyScale } from './typography';

/**
 * Reading-text size presets. Two only (product decision): M is the default,
 * L is the larger comfort size. The factor multiplies font size + line height
 * of the *reading* styles only — UI chrome (titles, counters, labels) is never
 * scaled, so nothing clips.
 */
export const FONT_SCALES = {
  M: 1.0,
  L: 1.15,
} as const;

export type FontScale = keyof typeof FONT_SCALES;

export const DEFAULT_FONT_SCALE: FontScale = 'M';

/**
 * The typography keys that carry verse / meaning reading text across every
 * script (Devanagari, Latin transliteration, Gujarati, Kannada). Only these are
 * scaled — everything else (screenTitle, readerTitle, pageCounter, labels, …)
 * stays fixed.
 */
export const READING_STYLE_KEYS = [
  'verse',
  'meaning',
  'verseLatin',
  'verseGujarati',
  'verseKannada',
  'meaningEnglish',
  'meaningGujarati',
  'meaningKannada',
] as const;

export function fontScaleFactor(scale: FontScale): number {
  return FONT_SCALES[scale];
}

/**
 * Return a new typography object with the reading styles' `fontSize` and
 * `lineHeight` multiplied by `factor`. Pure — never mutates the input. Both
 * fields scale by the same factor so spacing stays proportional. `factor === 1`
 * (the M default) returns the input unchanged.
 */
export function scaleTypography(typography: TypographyScale, factor: number): TypographyScale {
  if (factor === 1) return typography;
  const source = typography as Record<string, { fontSize?: number; lineHeight?: number }>;
  const next: Record<string, unknown> = { ...source };
  for (const key of READING_STYLE_KEYS) {
    const style = source[key];
    if (!style) continue;
    const scaled = { ...style };
    if (typeof style.fontSize === 'number') scaled.fontSize = Math.round(style.fontSize * factor);
    if (typeof style.lineHeight === 'number') scaled.lineHeight = Math.round(style.lineHeight * factor);
    next[key] = scaled;
  }
  return next as TypographyScale;
}
