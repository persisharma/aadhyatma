/**
 * Pure normalization + ranking helpers for the on-device search index (PRD-03).
 *
 * Bundle-only: no I/O, no React, no native deps. Lives in its own module so the
 * unit tests can import it without bootstrapping React Native.
 */

/** Lowest = best match. */
export const enum MatchRank {
  /** Whole-string equality with the indexed field. */
  EXACT = 0,
  /** The query is a prefix of the field. */
  PREFIX = 1,
  /** The query appears as a substring somewhere in the field. */
  SUBSTRING = 2,
  /** No match. */
  NONE = 99,
}

/** IAST diacritics → base ASCII letter. Covers the Hunterian-style romanization the corpus uses. */
const IAST_FOLD: Record<string, string> = {
  ā: 'a', Ā: 'a',
  ī: 'i', Ī: 'i',
  ū: 'u', Ū: 'u',
  ṛ: 'r', Ṛ: 'r',
  ṝ: 'r', Ṝ: 'r',
  ḷ: 'l', Ḷ: 'l',
  ṅ: 'n', Ṅ: 'n',
  ñ: 'n', Ñ: 'n',
  ṭ: 't', Ṭ: 't',
  ḍ: 'd', Ḍ: 'd',
  ṇ: 'n', Ṇ: 'n',
  ś: 's', Ś: 's',
  ṣ: 's', Ṣ: 's',
  ḥ: 'h', Ḥ: 'h',
  ṁ: 'm', Ṁ: 'm',
  ṃ: 'm', Ṃ: 'm',
  // Common diacritic-light variants
  ĕ: 'e', ŏ: 'o',
};

/**
 * Combining nukta (U+093C). After NFD normalization, every nukta-bearing
 * Devanagari letter (क़, ज़, फ़, ड़, ढ़, …) decomposes to base + U+093C; stripping
 * U+093C then yields the bare letter regardless of how the input was encoded
 * (precomposed or already decomposed).
 */
const NUKTA_RE = /़/g;

/** Punctuation we drop before comparison. Devanagari danda + Latin standard set. */
const PUNCT_RE = /[.,;:!?'"()/\\\-—–।॥·]+/g;

/** Repeated whitespace including Devanagari spaces. */
const WS_RE = /\s+/g;

/**
 * Fold a string to its search-normalized form:
 *  - Unicode NFD then strip combining nukta (so क़ ⇄ क)
 *  - Lowercase
 *  - Strip IAST diacritics (`kṛṣṇa` → `krsna`)
 *  - Drop punctuation including Devanagari danda (`।`, `॥`)
 *  - Collapse whitespace
 *  - Strip leading/trailing whitespace
 *
 * Pure and idempotent: `normalize(normalize(x)) === normalize(x)`.
 */
export function normalize(input: string): string {
  if (!input) return '';
  // 1. Decompose so precomposed nukta letters split into base + U+093C, then
  //    strip U+093C. NFC the result so any remaining combining marks recompose
  //    cleanly.
  const denuktaed = input.normalize('NFD').replace(NUKTA_RE, '').normalize('NFC');
  // 2. Per-codepoint IAST fold + lowercase.
  let out = '';
  for (const ch of denuktaed) {
    const folded = IAST_FOLD[ch] ?? ch;
    out += folded.toLowerCase();
  }
  // 3. Punctuation + whitespace cleanup.
  return out.replace(PUNCT_RE, ' ').replace(WS_RE, ' ').trim();
}

/**
 * Score how well `field` matches `query`. Both inputs should already be
 * normalized via {@link normalize}. Returns one of {@link MatchRank}.
 */
export function rank(field: string, query: string): MatchRank {
  if (!query) return MatchRank.NONE;
  if (!field) return MatchRank.NONE;
  if (field === query) return MatchRank.EXACT;
  if (field.startsWith(query)) return MatchRank.PREFIX;
  if (field.includes(query)) return MatchRank.SUBSTRING;
  return MatchRank.NONE;
}

/**
 * Rank a query against multiple candidate fields and return the best (lowest)
 * rank. Used to score an entry whose searchable text comes from several
 * sources (title, verse body, meaning, …).
 */
export function rankAny(fields: readonly string[], query: string): MatchRank {
  let best: MatchRank = MatchRank.NONE;
  for (const f of fields) {
    const r = rank(f, query);
    if (r < best) best = r;
    if (best === MatchRank.EXACT) return best;
  }
  return best;
}
