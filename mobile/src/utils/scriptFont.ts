import { fontFamilies } from '@/theme/typography';
// Caption / secondary-line font picker.
//
// Bilingual rows show a name in one script with its counterpart in the other
// (a Devanagari line under a Latin one in English mode, and vice versa). Many of
// these captions hard-coded Cormorant Garamond — a Latin face — so Devanagari
// rendered in it fell back thin and tiny ("not readable"). Choosing the font from
// the text's *actual script* keeps every caption legible without each call site
// having to reason about the active language.
const DEVANAGARI = /[ऀ-ॿ]/;
const GUJARATI = /[઀-૿]/;
const KANNADA = /[ಀ-೿]/;

export function isDevanagari(text: string): boolean {
  return DEVANAGARI.test(text);
}

/**
 * Font family + style for a secondary/caption line, chosen by the script of the
 * text itself: the matching Noto Serif face (upright) for any Indic script we
 * support — Devanagari, Gujarati, or Kannada — and Cormorant Garamond italic for
 * Latin. Spread into a Text style alongside fontSize/color. Choosing the font from
 * the text's actual script keeps every caption legible whatever the reading
 * language, including the Gujarati/Kannada renderings derived at runtime.
 */
export function captionFont(text: string): { fontFamily: string; fontStyle: 'normal' | 'italic' } {
  if (GUJARATI.test(text)) return { fontFamily: fontFamilies.gujarati, fontStyle: 'normal' };
  if (KANNADA.test(text)) return { fontFamily: fontFamilies.kannada, fontStyle: 'normal' };
  if (DEVANAGARI.test(text)) return { fontFamily: fontFamilies.devanagari, fontStyle: 'normal' };
  return { fontFamily: fontFamilies.latinItalic, fontStyle: 'italic' };
}

/**
 * Font family + tracking for a card meta line ("४ श्लोक · अर्थ सहित", "12 temples"),
 * chosen by the script of the text: the upright Noto Serif face with NO tracking
 * for Indic text (tracking splits the shirorekha, and Inter has no Indic glyphs —
 * design.md §46), Inter with the `cardMeta` tracking for Latin.
 */
export function metaFont(text: string): { fontFamily: string; letterSpacing: number } {
  if (GUJARATI.test(text)) return { fontFamily: fontFamilies.gujarati, letterSpacing: 0 };
  if (KANNADA.test(text)) return { fontFamily: fontFamilies.kannada, letterSpacing: 0 };
  if (DEVANAGARI.test(text)) return { fontFamily: fontFamilies.devanagari, letterSpacing: 0 };
  return { fontFamily: fontFamilies.inter, letterSpacing: 0.4 };
}

/**
 * Semibold/title face for a heading whose text is built dynamically (e.g. a
 * caption prop): the Noto Serif SemiBold for Gujarati/Kannada text, else the
 * given `fallback`. Use where a fixed Devanagari title token can't tell whether
 * its content was re-scripted to gu/kn and `lang` isn't in scope. hi/en (the
 * fallback path) are unchanged.
 */
export function titleScriptFont(text: string, fallback: string): string {
  if (GUJARATI.test(text)) return fontFamilies.gujaratiBold;
  if (KANNADA.test(text)) return fontFamilies.kannadaBold;
  return fallback;
}
