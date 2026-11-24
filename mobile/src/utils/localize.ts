/**
 * Six-language selection helpers. The content corpus is authored bilingually
 * (Devanagari + English/romanized fields); Gujarati, Kannada and Telugu renderings
 * are derived at runtime from the Devanagari via script transliteration, and Marathi
 * reads the Devanagari directly (same script). See
 * docs/superpowers/specs/2026-06-13-gujarati-kannada-language-support-design.md and
 * docs/superpowers/specs/2026-11-24-telugu-marathi-language-support-design.md.
 *
 * Which helper to use:
 * - `pick`            — free UI prose (button labels, headings): all six hand-authored.
 * - `contentByLang`   — content-bearing strings (section/chapter titles, verse-pill
 *                       labels, Sanskrit terms): gu/kn/te re-script the Devanagari and
 *                       mr keeps it, which is the correct regional rendering for these.
 * - `verseLinesByLang`— recitation text: gu/kn/te always re-script the Devanagari lines
 *                       and mr keeps them (never the romanization).
 * - `authoredByLang`  — authored content objects (kids stories, comics) that carry
 *                       hi/en/gu/kn and optionally mr/te: mr falls back to the Hindi
 *                       text, te to the Hindi text re-scripted into Telugu.
 * - `meaningByLang` / `commentaryByLang` — prose meaning policy (see below).
 *
 * Meaning policy: every reading language renders in its OWN script. Gujarati, Kannada
 * and Telugu show the Hindi meaning re-scripted into their script (Hindi wording in
 * the regional script) unless a verified native translation exists; Marathi shows the
 * Hindi meaning as-is (same script) unless a native `meaningMr` exists. English shows the English meaning. Encoded only here, so when native
 * `meaningGu`/`meaningKn` fields are added later this is the single place to prefer them.
 * `meaningSourceLang` reports which language's typography the meaning body should use
 * (now identity — each language styles in its own script).
 */

import type { Lang } from '@/data/gita/language';
import { verseLinesForDisplay } from './versePresentation';
import { readableRomanization } from './readableRomanization';
import { transliterateDevanagari } from './transliterate';

export type LocalizedStrings = { hi: string; en: string; gu: string; kn: string; mr: string; te: string };

/** UI chrome strings — every language explicitly authored at the call site. */
export function pick(lang: Lang, s: LocalizedStrings): string {
  return s[lang];
}

/** Languages whose script differs from Devanagari and is derived from it at runtime. */
export type RescriptLang = 'gu' | 'kn' | 'te';

export function isRescriptLang(lang: Lang): lang is RescriptLang {
  return lang === 'gu' || lang === 'kn' || lang === 'te';
}

/** Languages read in Devanagari script (Hindi and Marathi). */
export function isDevanagariLang(lang: Lang): boolean {
  return lang === 'hi' || lang === 'mr';
}

/**
 * Authored per-language content (kids stories, comics, data copy) that predates the
 * mr/te reading languages: hi/en/gu/kn are required, mr/te optional. Missing mr shows
 * the Hindi text (same script); missing te shows the Hindi text re-scripted to Telugu.
 */
export type AuthoredStrings = { hi: string; en: string; gu: string; kn: string; mr?: string; te?: string };

export function authoredByLang(lang: Lang, s: AuthoredStrings): string {
  if (lang === 'mr') return s.mr || s.hi;
  if (lang === 'te') return s.te || transliterateDevanagari(s.hi, 'te');
  return s[lang];
}

/** Titles, labels, and other content-bearing strings: gu/kn/te/mr derive from the Devanagari. */
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

/** Authored native meaning translations, when they exist. Native-only: omit/empty → fall back. */
export type NativeMeaning = { gu?: string; kn?: string; mr?: string; te?: string };

/**
 * Meaning prose. en stays English; hi stays Hindi. For gu/kn, prefer an authored
 * native translation (`native.gu`/`native.kn`) when present; otherwise fall back to
 * re-scripting the Hindi meaning into that script (transliteration). The native
 * fields are native-only — an absent or empty string falls back, so the app never
 * mistakes a transliterated Hindi meaning for an authored translation.
 */
export function meaningByLang(
  lang: Lang,
  meaningHi: string,
  meaningEn: string,
  native?: NativeMeaning
): string {
  if (lang === 'en') return meaningEn;
  if (lang === 'gu') return native?.gu || transliterateDevanagari(meaningHi, 'gu');
  if (lang === 'kn') return native?.kn || transliterateDevanagari(meaningHi, 'kn');
  if (lang === 'te') return native?.te || transliterateDevanagari(meaningHi, 'te');
  if (lang === 'mr') return native?.mr || meaningHi;
  return meaningHi; // 'hi'
}

/** Commentary paragraphs follow the meaning policy. */
export function commentaryByLang(
  lang: Lang,
  commentaryHi: readonly string[],
  commentaryEn: readonly string[]
): readonly string[] {
  if (lang === 'en') return commentaryEn;
  if (isRescriptLang(lang)) return commentaryHi.map((p) => transliterateDevanagari(p, lang));
  return commentaryHi; // 'hi'
}

/**
 * Verse/recitation lines. `devaLines` is the Devanagari source (`lines`/`sanskrit`),
 * `latinLines` the curated romanization (`linesEn`/`transliteration`). en shows the
 * romanization respelled for reading (`readableRomanization`, design.md §3.1). Arrays
 * stay referentially stable per input for hi/en (FlatList data).
 */
export function verseLinesByLang(
  lang: Lang,
  devaLines: readonly string[],
  latinLines: readonly string[],
  referenceLabel?: string
): readonly string[] {
  const deva = verseLinesForDisplay(devaLines, referenceLabel);
  if (isDevanagariLang(lang)) return deva;
  if (lang === 'en') return readableRomanization(verseLinesForDisplay(latinLines, referenceLabel));
  return deva.map((l) => transliterateDevanagari(l, lang));
}
