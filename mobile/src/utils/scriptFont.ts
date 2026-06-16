// Caption / secondary-line font picker.
//
// Bilingual rows show a name in one script with its counterpart in the other
// (a Devanagari line under a Latin one in English mode, and vice versa). Many of
// these captions hard-coded Cormorant Garamond — a Latin face — so Devanagari
// rendered in it fell back thin and tiny ("not readable"). Choosing the font from
// the text's *actual script* keeps every caption legible without each call site
// having to reason about the active language.
const DEVANAGARI = /[ऀ-ॿ]/;

export function isDevanagari(text: string): boolean {
  return DEVANAGARI.test(text);
}

/**
 * Font family + style for a secondary/caption line, chosen by the script of the
 * text itself: Noto Serif Devanagari (upright) for Devanagari, Cormorant Garamond
 * italic for Latin. Spread into a Text style alongside fontSize/color.
 */
export function captionFont(text: string): { fontFamily: string; fontStyle: 'normal' | 'italic' } {
  return isDevanagari(text)
    ? { fontFamily: 'NotoSerifDevanagari_500Medium', fontStyle: 'normal' }
    : { fontFamily: 'CormorantGaramond_400Regular_Italic', fontStyle: 'italic' };
}
