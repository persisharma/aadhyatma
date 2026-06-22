/**
 * Per-language typography selection. The pre-gu/kn code branched `lang === 'hi'`
 * between a Devanagari token and a Latin token; these helpers generalize that
 * choice to four languages while reproducing the hi/en picks exactly.
 *
 * Tokens still come from the theme (`useTheme().typography`) at the call site —
 * the helpers only select among them (RULEBOOK §3: tokens, not literals).
 */

import { fontFamilies, type TypographyScale } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';

/** True only for English — drives italic/size ternaries that are script-class based. */
export function isLatinLang(lang: Lang): boolean {
  return lang === 'en';
}

type ReadingToken = { fontFamily: string; fontSize: number; lineHeight: number };

/** Verse/recitation body token for the language's script. */
export function verseToken(lang: Lang, t: TypographyScale): ReadingToken {
  switch (lang) {
    case 'hi':
      return t.verse;
    case 'en':
      return t.verseLatin;
    case 'gu':
      return t.verseGujarati;
    case 'kn':
      return t.verseKannada;
  }
}

/**
 * Meaning/commentary body token. Pass `meaningSourceLang(lang)` (utils/localize.ts),
 * not the raw UI language — kn shows English meaning prose and must style it as such.
 */
export function meaningToken(lang: Lang, t: TypographyScale): ReadingToken {
  switch (lang) {
    case 'hi':
      return t.meaning;
    case 'en':
      return t.meaningEnglish;
    case 'gu':
      return t.meaningGujarati;
    case 'kn':
      return t.meaningKannada;
  }
}

/**
 * Top-bar / heading font family. Reproduces the readers' historic pick exactly:
 * hi → readerTitle's Devanagari semibold, en → cardLatin's italic Cormorant.
 */
export function titleFontByLang(lang: Lang): string {
  switch (lang) {
    case 'hi':
      return fontFamilies.devanagariBold;
    case 'en':
      return fontFamilies.latinItalic;
    case 'gu':
      return fontFamilies.gujaratiBold;
    case 'kn':
      return fontFamilies.kannadaBold;
  }
}

/** Card-title font family (cardHindi ↔ cardLatin class). Same cuts as titleFontByLang. */
export function cardFontByLang(lang: Lang): string {
  return titleFontByLang(lang);
}

/**
 * Override a heading/title fontFamily for gu/kn only, leaving the hi/en `fallback`
 * untouched. Use at call sites that hard-code a Devanagari token (e.g.
 * `typography.readerTitle.fontFamily`) for a name/title that becomes Gujarati or
 * Kannada under runtime transliteration — those would otherwise render in the
 * Devanagari face. hi/en behaviour is unchanged.
 */
export function scriptTitleFont(lang: Lang, fallback: string): string {
  if (lang === 'gu') return fontFamilies.gujaratiBold;
  if (lang === 'kn') return fontFamilies.kannadaBold;
  return fallback;
}

/** Body/medium-weight counterpart of {@link scriptTitleFont} (gu/kn → their serif; else fallback). */
export function scriptBodyFont(lang: Lang, fallback: string): string {
  if (lang === 'gu') return fontFamilies.gujarati;
  if (lang === 'kn') return fontFamilies.kannada;
  return fallback;
}
