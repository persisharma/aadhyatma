/**
 * Pure layout for the Infinity view's rotating mantra rings.
 *
 * Each word is placed as its own straight, natively shaped text run whose
 * centre sits on the circle, rotated tangent to it. An SVG `textPath` would lay
 * Devanagari/Gujarati/Kannada out glyph by glyph and break conjuncts and matras,
 * so the ring is built from whole words instead.
 */

/**
 * Between repetitions: the double danda for Indic scripts (it is in every
 * bundled Indic face, so no fallback glyph), a bullet for romanized text.
 */
export function ringSeparator(text: string): string {
  return /[\u0900-\u0DFF]/.test(text) ? '॥' : '•';
}

/** Hard stop so a tiny width can never produce an unbounded token list. */
const MAX_TOKENS = 160;

export type PlacedRingToken = {
  key: string;
  text: string;
  width: number;
  /** Clockwise from 12 o'clock, in degrees, of the word's centre. */
  angleDeg: number;
};

/** The words to repeat round the ring (dandas and verse numbers are dropped). */
export function ringWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map((word) => word.replace(/[।॥|]+/g, '').replace(/^[\d०-९.]+$/, ''))
    .filter((word) => word.length > 0);
}

/**
 * Lay `words` (then a separator) round a circle of `radius`, repeating while
 * whole repetitions fit, and spread the leftover evenly so the ring has no seam.
 * A mantra too long for one turn keeps as many leading words as fit, then the
 * separator. Returns [] until every width is known.
 */
export function layoutRing(
  words: readonly string[],
  separator: string,
  widthOf: (token: string) => number | undefined,
  radius: number,
  gap: number,
): PlacedRingToken[] {
  if (words.length === 0 || radius <= 0) return [];
  const sequence = [...words, separator];
  const widths = sequence.map(widthOf);
  if (widths.some((w) => w === undefined || !Number.isFinite(w) || w <= 0)) return [];
  const circumference = 2 * Math.PI * radius;
  const placed: { text: string; width: number }[] = [];
  let used = 0;
  for (let i = 0; i < MAX_TOKENS; i++) {
    const at = i % sequence.length;
    const width = widths[at] as number;
    if (used + width + gap > circumference) break;
    placed.push({ text: sequence[at], width });
    used += width + gap;
  }
  if (placed.length >= sequence.length) {
    // Keep whole repetitions only, so every turn reads mantra ॥ mantra ॥.
    while (placed.length > 0 && placed[placed.length - 1].text !== separator) {
      used -= placed.pop()!.width + gap;
    }
  } else {
    // Longer than one turn: leading words, then the separator closes the ring.
    const sep = widths[sequence.length - 1] as number;
    while (placed.length > 0 && (used + sep + gap > circumference || placed[placed.length - 1].text === separator)) {
      used -= placed.pop()!.width + gap;
    }
    if (placed.length === 0) return [];
    placed.push({ text: separator, width: sep });
    used += sep + gap;
  }
  const spread = gap + (circumference - used) / placed.length;
  let start = 0;
  return placed.map((token, i) => {
    const centre = start + token.width / 2;
    start += token.width + spread;
    return { key: `${i}`, text: token.text, width: token.width, angleDeg: (centre / circumference) * 360 };
  });
}
