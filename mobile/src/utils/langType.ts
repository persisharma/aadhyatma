/**
 * Per-language typography selection. The pre-gu/kn code branched `lang === 'hi'`
 * between a Devanagari token and a Latin token; these helpers generalize that
 * choice to four languages while reproducing the hi/en picks exactly.
 *
 * Tokens still come from the theme (`useTheme().typography`) at the call site —
 * the helpers only select among them (RULEBOOK §3: tokens, not literals).
 */

import type { TextStyle } from 'react-native';
import { fontFamilies, type TypographyScale } from '@/theme/typography';
import type { Lang } from '@/data/gita/language';

/** True only for English — drives italic/size ternaries that are script-class based. */
export function isLatinLang(lang: Lang): boolean {
  return lang === 'en';
}

/**
 * Script-safe style for micro-labels / pills / eyebrows whose token carries Latin
 * tracking + uppercase (e.g. `versePill`, `sectionLabel`, `meaningLabel`). Those
 * tokens were designed for Latin labels (their `fontFamily` is Inter, which has no
 * Indic glyphs); spread onto Indic text the `letterSpacing` splits the connecting
 * shirorekha ("सु झा व") and the face falls back inconsistently. For `en` we keep
 * the original tracking + uppercase + Inter face; for hi/gu/kn we use the script
 * serif and drop tracking/uppercase (which are meaningless and harmful for Indic).
 * Use this INSTEAD of spreading the raw token at any pill rendering Indic content.
 */
export function pillTextStyle(
  lang: Lang,
  token: {
    fontFamily?: string;
    fontSize?: number;
    fontWeight?: TextStyle['fontWeight'];
    letterSpacing?: number;
  },
): TextStyle {
  const latin = isLatinLang(lang);
  return {
    fontSize: token.fontSize,
    // A loaded static face (Inter_600SemiBold) already carries its weight; applying
    // fontWeight on top fake-bolds on Android. Keep it only when no family is set.
    fontWeight: latin && token.fontFamily ? undefined : token.fontWeight,
    letterSpacing: latin ? token.letterSpacing : 0,
    textTransform: latin ? 'uppercase' : 'none',
    // scriptTitleFont gives the *bold* script cut (gu/kn → SemiBold), matching the
    // pill's semibold weight; scriptBodyFont would drop gu/kn to Medium.
    fontFamily: latin ? token.fontFamily : scriptTitleFont(lang, fontFamilies.devanagariBold),
  };
}

/**
 * Mixed-case micro tag — the small Inter-tracked label class that is *not* an
 * uppercase pill (`यही · this one`, `९ चरण · 12 अक्षर`). Latin keeps Inter with a
 * touch of tracking; hi/gu/kn take the script serif with none, because Inter has
 * no Indic glyphs and Latin tracking splits the shirorekha (design.md §3.0).
 * Size and layout stay with the caller. Use {@link pillTextStyle} instead when
 * the label is an uppercase section/pill token — that one also swaps the case.
 */
export function indicSafeTag(lang: Lang, latinTracking = 0.4): TextStyle {
  return isLatinLang(lang)
    ? { fontFamily: fontFamilies.interSemiBold, letterSpacing: latinTracking }
    : { fontFamily: scriptTitleFont(lang, fontFamilies.devanagariBold), letterSpacing: 0 };
}

/**
 * Card eyebrow / kicker style (the small `saffron-deep` context line atop the
 * glance cards — Muhurat glance card, Home Today strip). The Latin face is the
 * italic Cormorant `cardLatin` cut with a touch of tracking; hi/gu/kn swap to
 * the script serif bold with NO tracking — Cormorant has no Indic glyphs and
 * Latin tracking splits the connecting shirorekha (design.md §3). One
 * definition so eyebrow-bearing cards can't drift apart.
 */
export function eyebrowTextStyle(lang: Lang, fontSize: number, latinTracking = 0.4): TextStyle {
  const latin = isLatinLang(lang);
  return {
    fontSize,
    fontFamily: latin ? fontFamilies.latinItalic : scriptTitleFont(lang, fontFamilies.devanagariBold),
    letterSpacing: latin ? latinTracking : 0,
  };
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
