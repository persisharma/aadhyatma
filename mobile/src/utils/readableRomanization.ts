/**
 * Reader-facing respelling of romanized Sanskrit verse lines (design.md §3.1).
 *
 * The corpus stores two IAST dialects: the Gita's IAST + Hunterian digraphs
 * (`śh`, `ṣh`, `ṛi`, `ch` = च, `chh` = छ) and strict IAST in Valmiki Ramayan,
 * the stotras and suktams (`ś`, `ṣ`, `ṛ`, `c` = च, `ch` = छ). Both display as
 * one "long vowels only" form: ā ī ū keep their macron (the chanting length),
 * every dotted or accented letter takes its plain spelling (ś/ṣ → sh, ṛ → ri,
 * ṁ/ṃ → m, ṇ → n …), and strict IAST's c/ch become ch/chh.
 *
 *   śhiṣhyaste ’haṁ śhādhi māṁ  →  shishyaste ’ham shādhi mām
 *   kṛṣṇaḥ śaniḥ piṅgalamandasauriḥ  →  krishnah shanih pingalamandasaurih
 *
 * Content JSON keeps the scholarly spelling; this runs at render, through
 * `verseLinesByLang`. Lines without IAST letters (the Awadhi/Gujarati
 * pronunciation ASCII) and lines carrying Devanagari pass through unchanged.
 */

// Any IAST letter, macron vowels included, so a strict-IAST verse that happens
// to carry no dotted letter still gets its c/ch respelled.
const IAST_LETTER = /[āīūṛṝḷṅñṭḍṇśṣḥṁṃĀĪŪṚṜḶṄÑṬḌṆŚṢḤṀṂ]/;
const DEVANAGARI = /[ऀ-ॿ]/;
// Strict IAST writes च as a bare `c`; the Hunterian dialect writes `ch` and
// marks itself with digraphs strict IAST never uses. A digraph wins over a
// stray `c`, which in a Hunterian verse is a data typo (VSN `chārcayan`).
const STRICT_C = /c(?!h)/i;
const HUNTERIAN = /śh|ṣh|ṛi|chh/i;

const PLAIN: Record<string, string> = {
  ṝ: 'rī', Ṝ: 'Rī', ḷ: 'li', Ḷ: 'Li', ḻ: 'l',
  ṅ: 'n', Ṅ: 'N', ñ: 'n', Ñ: 'N',
  ṭ: 't', Ṭ: 'T', ḍ: 'd', Ḍ: 'D', ṇ: 'n', Ṇ: 'N',
  ḥ: 'h', Ḥ: 'H', ṁ: 'm', Ṁ: 'M', ṃ: 'm', Ṃ: 'M',
};

function respell(line: string, strict: boolean): string {
  if (DEVANAGARI.test(line)) return line;
  let out = line.normalize('NFC');
  if (strict) out = out.replace(/([Cc])(h?)/g, (_, c: string, h: string) => (h ? `${c}hh` : `${c}h`));
  return out
    .replace(/([ṛṚ])i?/g, (_, r: string) => (r === 'Ṛ' ? 'Ri' : 'ri'))
    .replace(/([śṣŚṢ])h?/g, (_, s: string) => (s === 'Ś' || s === 'Ṣ' ? 'Sh' : 'sh'))
    .replace(/[ṝṜḷḶḻṅṄñÑṭṬḍḌṇṆḥḤṁṀṃṂ]/g, (ch) => PLAIN[ch]);
}

// Keyed by the source array so a reader re-render gets the same array back
// (verseLinesByLang promises referential stability for FlatList data).
const cache = new WeakMap<readonly string[], readonly string[]>();

/** Respells one verse's romanized lines. The dialect is decided per verse, not per line. */
export function readableRomanization(lines: readonly string[]): readonly string[] {
  const hit = cache.get(lines);
  if (hit) return hit;
  let result: readonly string[] = lines;
  if (lines.some((l) => IAST_LETTER.test(l))) {
    const latin = lines.filter((l) => !DEVANAGARI.test(l));
    const strict = latin.some((l) => STRICT_C.test(l)) && !latin.some((l) => HUNTERIAN.test(l));
    result = lines.map((l) => respell(l, strict));
  }
  cache.set(lines, result);
  return result;
}
