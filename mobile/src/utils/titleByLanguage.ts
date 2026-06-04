import type { GitaLang } from '@/data/gita/language';

/**
 * Bilingual listing/catalog titles (`nameHi · nameEn`) historically rendered
 * Devanagari-first with a larger font, regardless of the reader's language
 * choice. This helper orders the pair by the active reading language so the
 * user's primary language takes the prominent (top / larger) slot and the
 * other language follows as a supporting line.
 *
 * It only decides *order* and *size* — the caller maps `script` to the
 * appropriate theme font family so no font literals live here. Default `'hi'`
 * preserves the original Devanagari-first layout.
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
    fontSize: role === 'primary' ? sizes.devPrimary : sizes.devSecondary,
  });
  const latin = (role: 'primary' | 'secondary'): OrderedTitlePart => ({
    text: nameEn,
    script: 'latin',
    fontSize: role === 'primary' ? sizes.latPrimary : sizes.latSecondary,
  });

  return lang === 'en'
    ? { primary: latin('primary'), secondary: devanagari('secondary') }
    : { primary: devanagari('primary'), secondary: latin('secondary') };
}
