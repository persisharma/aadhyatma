import { fontFamilies } from '@/theme/typography';
import type { GitaLang } from '@/data/gita/language';
import { transliterateDevanagari } from './transliterate';

/**
 * Bilingual listing/catalog titles (`nameHi · nameEn`) historically rendered
 * Devanagari-first with a larger, heavier font regardless of the reader's
 * language choice. This helper orders the pair by the active reading language
 * so the user's primary language takes the prominent (top / larger / heavier)
 * slot and the other language follows as a lighter supporting line.
 *
 * Crucially, weight and style follow the **role (primary vs. secondary)**, not
 * the script — so a primary English title is semibold upright (a real focus
 * title) and a demoted Hindi title drops to medium weight, instead of Hindi
 * always staying bold and English always staying a thin italic. Font families
 * come from the theme `fontFamilies` tokens (no literals). Default `'hi'`
 * preserves the historic Devanagari-first layout.
 */

export type TitleScript = 'devanagari' | 'latin' | 'gujarati' | 'kannada';

/** Point sizes for each script in the prominent vs. supporting slot. */
export type TitleSizeScale = {
  devPrimary: number;
  devSecondary: number;
  latPrimary: number;
  latSecondary: number;
};

export type OrderedTitlePart = {
  text: string;
  script: TitleScript;
  /** Theme font family chosen by role: heavier for primary, lighter for secondary. */
  fontFamily: string;
  fontStyle: 'normal' | 'italic';
  fontSize: number;
};

export type OrderedTitles = {
  /** Prominent line — the user's primary language. */
  primary: OrderedTitlePart;
  /** Supporting line — the other language. */
  secondary: OrderedTitlePart;
};

export function orderTitlesByLanguage(
  lang: GitaLang,
  nameHi: string,
  nameEn: string,
  sizes: TitleSizeScale
): OrderedTitles {
  const devanagari = (role: 'primary' | 'secondary'): OrderedTitlePart => ({
    text: nameHi,
    script: 'devanagari',
    fontFamily: role === 'primary' ? fontFamilies.devanagariBold : fontFamilies.devanagari,
    fontStyle: 'normal',
    fontSize: role === 'primary' ? sizes.devPrimary : sizes.devSecondary,
  });
  const latin = (role: 'primary' | 'secondary'): OrderedTitlePart => ({
    text: nameEn,
    script: 'latin',
    fontFamily: role === 'primary' ? fontFamilies.latinSemiBold : fontFamilies.latinItalic,
    fontStyle: role === 'primary' ? 'normal' : 'italic',
    fontSize: role === 'primary' ? sizes.latPrimary : sizes.latSecondary,
  });
  // gu/kn titles are the Devanagari name re-scripted; they take the Devanagari size
  // class (same x-height) and the script's own serif cuts.
  const indic = (script: 'gujarati' | 'kannada'): OrderedTitlePart => ({
    text: transliterateDevanagari(nameHi, script === 'gujarati' ? 'gu' : 'kn'),
    script,
    fontFamily:
      script === 'gujarati' ? fontFamilies.gujaratiBold : fontFamilies.kannadaBold,
    fontStyle: 'normal',
    fontSize: sizes.devPrimary,
  });

  if (lang === 'en') return { primary: latin('primary'), secondary: devanagari('secondary') };
  if (lang === 'gu') return { primary: indic('gujarati'), secondary: latin('secondary') };
  if (lang === 'kn') return { primary: indic('kannada'), secondary: latin('secondary') };
  return { primary: devanagari('primary'), secondary: latin('secondary') };
}
