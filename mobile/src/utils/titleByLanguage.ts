import { fontFamilies } from '@/theme/typography';
import type { GitaLang } from '@/data/gita/language';

/**
 * Bilingual listing/catalog titles (`nameHi · nameEn`) historically rendered
 * Devanagari-first with a larger, heavier font regardless of the reader's
 * language choice. This helper orders the pair by the active reading language
 * so the user's primary language takes the prominent (top / larger / heavier)
 * slot and the other language follows as a lighter supporting line.
 *
 * Crucially, weight and style follow the **role (primary vs. secondary)**, not
 * the script — so a primary English title is bold upright (a real focus title)
 * and a demoted Hindi title drops to medium weight, instead of Hindi always
 * staying bold and English always staying a thin italic. Font families come
 * from the theme `fontFamilies` tokens (no literals). Default `'hi'` preserves
 * the historic Devanagari-first layout.
 *
 * The two scripts also carry different *optical* weight at the same point size:
 * Noto Serif Devanagari reads dark/dense while Cormorant Garamond reads light.
 * So the Latin primary uses the **Bold (700)** face with a touch of tracking to
 * hold its own as a heading — without it, an English-primary title reads as a
 * peer of its demoted Devanagari line instead of dominating it. Callers further
 * compensate by sizing `latPrimary` a step above `devPrimary` (see call sites).
 */

export type TitleScript = 'devanagari' | 'latin';

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
  /** Optional tracking — set on the Latin primary so the bold heading breathes; omitted elsewhere. */
  letterSpacing?: number;
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
    fontFamily: role === 'primary' ? fontFamilies.latinBold : fontFamilies.latinItalic,
    fontStyle: role === 'primary' ? 'normal' : 'italic',
    fontSize: role === 'primary' ? sizes.latPrimary : sizes.latSecondary,
    ...(role === 'primary' ? { letterSpacing: 0.3 } : null),
  });

  return lang === 'en'
    ? { primary: latin('primary'), secondary: devanagari('secondary') }
    : { primary: devanagari('primary'), secondary: latin('secondary') };
}
