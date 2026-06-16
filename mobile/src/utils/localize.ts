/**
 * Four-language selection helpers. The content corpus is authored bilingually
 * (Devanagari + English/romanized fields); Gujarati and Kannada renderings are
 * derived at runtime from the Devanagari via script transliteration — no content
 * JSON carries gu/kn fields. See
 * docs/superpowers/specs/2026-06-13-gujarati-kannada-language-support-design.md.
 *
 * Which helper to use:
 * - `pick`            — free UI prose (button labels, headings): all four hand-authored.
 * - `contentByLang`   — content-bearing strings (section/chapter titles, verse-pill
 *                       labels, Sanskrit terms): gu/kn re-script the Devanagari, which
 *                       is the correct regional rendering for these.
 * - `verseLinesByLang`— recitation text: gu/kn always re-script the Devanagari lines
 *                       (never the romanization).
 * - `meaningByLang` / `commentaryByLang` — prose meaning policy (see below).
 *
 * Meaning policy: every reading language renders in its OWN script. Gujarati and
 * Kannada show the Hindi meaning re-scripted into Gujarati / Kannada (Hindi wording in
 * the regional script — readable in-script, since no native gu/kn translations are
 * authored yet). English shows the English meaning. Encoded only here, so when native
 * `meaningGu`/`meaningKn` fields are added later this is the single place to prefer them.
 * `meaningSourceLang` reports which language's typography the meaning body should use
 * (now identity — each language styles in its own script).
 */

import type { Lang } from '@/data/gita/language';
import { transliterateDevanagari } from './transliterate';

export type LocalizedStrings = { hi: string; en: string; gu: string; kn: string };

/** UI chrome strings — every language explicitly authored at the call site. */
export function pick(lang: Lang, s: LocalizedStrings): string {
  return s[lang];
}

/** Titles, labels, and other content-bearing strings: gu/kn derive from the Devanagari. */
export function contentByLang(lang: Lang, hi: string, en: string): string {
  if (lang === 'hi') return hi;
  if (lang === 'en') return en;
  return transliterateDevanagari(hi, lang);
}

/**
 * The language whose typography/styling the meaning body should use — identity:
 * each language renders the meaning in its own script.
 */
export function meaningSourceLang(lang: Lang): Lang {
  return lang;
}

/** Meaning prose: gu/kn re-script the Hindi meaning into their script; en stays English. */
export function meaningByLang(lang: Lang, meaningHi: string, meaningEn: string): string {
  if (lang === 'en') return meaningEn;
  if (lang === 'gu' || lang === 'kn') return transliterateDevanagari(meaningHi, lang);
  return meaningHi; // 'hi'
}

/** Commentary paragraphs follow the meaning policy. */
export function commentaryByLang(
  lang: Lang,
  commentaryHi: readonly string[],
  commentaryEn: readonly string[]
): readonly string[] {
  if (lang === 'en') return commentaryEn;
  if (lang === 'gu' || lang === 'kn')
    return commentaryHi.map((p) => transliterateDevanagari(p, lang));
  return commentaryHi; // 'hi'
}

/**
 * Verse/recitation lines. `devaLines` is the Devanagari source (`lines`/`sanskrit`),
 * `latinLines` the curated romanization (`linesEn`/`transliteration`). Returns the
 * input arrays untouched for hi/en (referential stability for FlatList data).
 */
export function verseLinesByLang(
  lang: Lang,
  devaLines: readonly string[],
  latinLines: readonly string[]
): readonly string[] {
  if (lang === 'hi') return devaLines;
  if (lang === 'en') return latinLines;
  return devaLines.map((l) => transliterateDevanagari(l, lang));
}
