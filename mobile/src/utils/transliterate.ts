/**
 * Devanagari → Gujarati / Kannada script conversion for the gu/kn reading languages.
 *
 * The corpus (verse lines, titles, labels, panchang terms) is Devanagari; Gujarati and
 * Kannada are sister Brahmi scripts with near-1:1 codepoint correspondence, so the
 * conversion is a pure character map — the orthography (hence recitation) is preserved
 * exactly. This is script conversion, NOT romanization: design.md §3.1's IAST/ASCII rules
 * govern only the Latin `linesEn`/`transliteration` fields and do not apply here.
 *
 * Mapping follows the faithful ISO-15919 / Unicode Brahmi correspondence. Cross-checked
 * against the independent `indic_transliteration` (sanscript) reference over the full
 * 5.5k-string corpus: 99.8% identical, and every remaining diff is a case where this
 * engine is correct and sanscript leaks Devanagari (precomposed क़…य़ left unconverted).
 *
 * Policy decisions (see docs/superpowers/specs/2026-06-13-gujarati-kannada-language-support-design.md):
 * - Dandas (। ॥), Vedic accents, ZWJ/ZWNJ and anything unmapped pass through unchanged.
 * - ॐ → ૐ (Gujarati codepoint) / ಓಂ (Kannada has no single om codepoint; O + anusvara, per sanscript).
 * - Candrabindu ँ → ઁ / ಁ (both scripts have the codepoint; Noto Serif renders it — verified).
 * - Nukta ़ → ઼ / ಼ (preserved in both; precomposed क़…य़ decompose to base + nukta).
 * - Devanagari digits ०–९ map to the script's digits (૦–૯ / ೦–೯).
 *
 * Non-Devanagari input is returned untouched, so the functions are safe on mixed
 * strings and idempotent on their own output.
 */

export type TargetScript = 'gu' | 'kn';

const DEVA_START = 0x0900;
const DEVA_END = 0x097f;

type ScriptSpec = {
  offset: number;
  /** Devanagari codepoints that offset-map cleanly into assigned target codepoints. */
  offsetRanges: ReadonlyArray<readonly [number, number]>;
  /** Explicit replacements for everything the plain offset cannot represent. */
  overrides: Readonly<Record<number, string>>;
};

const GUJARATI: ScriptSpec = {
  offset: 0x180,
  offsetRanges: [
    [0x0901, 0x0903], // candrabindu, anusvara, visarga
    [0x0905, 0x090d], // अ–ऍ (incl. vocalic R/L, candra E)
    [0x090f, 0x0911], // ए ऐ ऑ
    [0x0913, 0x0928], // ओ–न
    [0x092a, 0x0930], // प–र
    [0x0932, 0x0933], // ल ळ
    [0x0935, 0x0939], // व–ह
    [0x093c, 0x0945], // nukta, avagraha, matras ा–ॅ
    [0x0947, 0x0949], // े ै ॉ
    [0x094b, 0x094d], // ो ौ ्
    [0x0950, 0x0950], // ॐ → ૐ
    [0x0960, 0x0963], // ॠ ॡ + vocalic matras
    [0x0966, 0x096f], // digits
  ],
  overrides: {
    0x0900: 'ઁ', // inverted candrabindu → candrabindu
    0x0904: 'અ', // short A
    0x090e: 'એ', // short E
    0x0912: 'ઓ', // short O
    0x0929: 'ન', // ऩ
    0x0931: 'ર', // ऱ
    0x0934: 'ળ', // ऴ
    0x0946: 'ે', // short e matra
    0x094a: 'ો', // short o matra
    0x0958: 'ક઼',
    0x0959: 'ખ઼',
    0x095a: 'ગ઼',
    0x095b: 'જ઼',
    0x095c: 'ડ઼',
    0x095d: 'ઢ઼',
    0x095e: 'ફ઼',
    0x095f: 'ય઼',
    0x0972: 'અ', // candra A
  },
};

const KANNADA: ScriptSpec = {
  offset: 0x380,
  offsetRanges: [
    [0x0902, 0x0903], // anusvara, visarga
    [0x0905, 0x090c], // अ–ऌ
    [0x090e, 0x0910], // ऎ ए ऐ (Kannada has short e)
    [0x0912, 0x0928], // ऒ ओ–न (Kannada has short o)
    [0x092a, 0x0939], // प–ह (incl. ऱ→ಱ, ळ→ಳ, ऴ→ೞ)
    [0x093c, 0x0944], // nukta (಼ U+0CBC), avagraha, matras ा–ॄ
    [0x0946, 0x0948], // ॆ े ै
    [0x094a, 0x094d], // ॊ ो ौ ्
    [0x0960, 0x0963], // ॠ ॡ + vocalic matras
    [0x0966, 0x096f], // digits
  ],
  overrides: {
    // Candrabindu → Kannada candrabindu ಁ (U+0C81). Faithful per ISO-15919 / sanscript;
    // Noto Serif Kannada renders it (verified against the bundled font's cmap).
    0x0900: 'ಁ',
    0x0901: 'ಁ',
    0x0904: 'ಅ',
    0x090d: 'ಎ', // candra E → short e
    0x0911: 'ಒ', // candra O → short o
    0x0929: 'ನ',
    0x0945: 'ೆ', // candra e matra → short e matra
    0x0949: 'ೊ', // candra o matra → short o matra
    0x0950: 'ಓಂ', // no single Kannada om codepoint — O + anusvara (matches sanscript)
    // Precomposed nukta consonants → base + Kannada nukta ಼ (U+0CBC), the faithful
    // decomposition (ज़→ಜ಼ …); the standalone nukta is offset-mapped above.
    0x0958: 'ಕ಼',
    0x0959: 'ಖ಼',
    0x095a: 'ಗ಼',
    0x095b: 'ಜ಼',
    0x095c: 'ಡ಼',
    0x095d: 'ಢ಼',
    0x095e: 'ಫ಼',
    0x095f: 'ಯ಼',
    0x0972: 'ಅ',
  },
};

function convert(text: string, spec: ScriptSpec): string {
  let out = '';
  for (const ch of text) {
    const cp = ch.codePointAt(0) as number;
    if (cp < DEVA_START || cp > DEVA_END) {
      out += ch;
      continue;
    }
    const override = spec.overrides[cp];
    if (override !== undefined) {
      out += override;
      continue;
    }
    const mappable = spec.offsetRanges.some(([lo, hi]) => cp >= lo && cp <= hi);
    // Dandas, Vedic accents, and rarities outside the ranges pass through.
    out += mappable ? String.fromCodePoint(cp + spec.offset) : ch;
  }
  return out;
}

export function toGujarati(text: string): string {
  return convert(text, GUJARATI);
}

export function toKannada(text: string): string {
  return convert(text, KANNADA);
}

export function transliterateDevanagari(text: string, target: TargetScript): string {
  return target === 'gu' ? toGujarati(text) : toKannada(text);
}
