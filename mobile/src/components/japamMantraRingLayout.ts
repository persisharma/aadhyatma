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

/** The arc of a ring the stage shows, clockwise from 12 o'clock in degrees. */
export type VisibleArc = { fromDeg: number; toDeg: number };

const mod360 = (deg: number) => ((deg % 360) + 360) % 360;

/**
 * Angle (degrees) from a word's centre to where its box first meets the radial
 * line through the ring centre — the stage's clip edge. `halfHeight` is the
 * word box's radial half-extent.
 */
export function wordClearanceDeg(width: number, halfHeight: number, radius: number): number {
  const lever = radius - halfHeight;
  if (lever <= 0) return 90;
  return (Math.atan2(width / 2, lever) * 180) / Math.PI;
}

/**
 * Opacity keyframes over one ring turn (0 → 1) for a word at `angleDeg`, so the
 * word fades out whole before the stage edge would cut it and fades back in
 * once it is wholly inside `arc`. `clearDeg` is the word's half-width as an
 * angle (plus any margin); `fadeDeg` is the ramp length. The ring turns by
 * `direction × 360°` per cycle, as `JapamMantraRing` rotates it.
 */
export function ringWordFade(
  angleDeg: number,
  clearDeg: number,
  direction: 1 | -1,
  arc: VisibleArc,
  fadeDeg: number,
): { inputRange: number[]; outputRange: number[] } {
  const span = mod360(arc.toDeg - arc.fromDeg) || 360;
  const lo = clearDeg;
  const hi = span - clearDeg;
  if (hi <= lo) return { inputRange: [0, 1], outputRange: [0, 0] };
  // A ramp of at least half a degree keeps the curve continuous (no division by zero).
  const fade = Math.min(Math.max(fadeDeg, 0.5), (hi - lo) / 2);
  // Opacity by position within the arc; zero everywhere outside it.
  const at = (rho: number) => {
    if (rho <= lo || rho >= hi) return 0;
    if (rho < lo + fade) return (rho - lo) / fade;
    if (rho > hi - fade) return (hi - rho) / fade;
    return 1;
  };
  const start = mod360(angleDeg - arc.fromDeg);
  const points = ([[lo, 0], [lo + fade, 1], [hi - fade, 1], [hi, 0]] as const).map(([rho, v]) => ({
    t: mod360(direction * (rho - start)) / 360,
    v,
  }));
  points.push({ t: 0, v: at(start) }, { t: 1, v: at(start) });
  points.sort((a, b) => a.t - b.t);
  const inputRange: number[] = [];
  const outputRange: number[] = [];
  for (const { t, v } of points) {
    if (inputRange.length > 0 && t - inputRange[inputRange.length - 1] < 1e-9) continue;
    inputRange.push(t);
    outputRange.push(v);
  }
  return { inputRange, outputRange };
}

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
