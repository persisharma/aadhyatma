import { ringWords, ringSeparator, type PlacedRingToken } from './japamMantraRingLayout';

export const MANDALA_MEASURE_SIZE = 20;
export const MANDALA_FONT_SIZES = [18, 15] as const;
export const MANDALA_PERIODS = [56000, 72000] as const;
const TAU = 2 * Math.PI;
const AIR = 4;
const MAX_WORDS = 160;
const MAX_RUNS = 384;

/**
 * Complete script syllables for decorative curvature. A virama, its following
 * consonant, reph, combining vowel/signs and explicit joiners stay in ONE
 * native-shaped Text run. This is deliberately not code-point letter spacing.
 */
export function mandalaClusters(word: string): string[] {
  const runs: string[] = [];
  let joinNext = false;
  for (const char of word) {
    const mark = /[\p{M}\u200C\u200D]/u.test(char);
    if (runs.length && (mark || joinNext)) runs[runs.length - 1] += char;
    else runs.push(char);
    joinNext = /[\u094D\u0ACD\u0CCD]/u.test(char) || joinNext && /[\u200C\u200D]/u.test(char);
  }
  return runs;
}

export type MandalaBand = {
  radius: number;
  fontSize: number;
  lineHeight: number;
  pages: readonly (readonly PlacedRingToken[])[];
};
export type MandalaLayout = {
  outer: number;
  middle: number;
  inner: number;
  loop: number;
  bands: readonly MandalaBand[];
  /** Any words beyond the decorative budget remain in the complete reader. */
  overflow: boolean;
};

/** Actual allocated Text width, including native rounding/shape slack. */
export function mandalaWordWidth(measured: number, fontSize: number): number {
  return Math.ceil(measured * fontSize / MANDALA_MEASURE_SIZE * 1.06) + 4;
}

/** Bounds of a tangent word rectangle at ANY rotation, not just its midpoint. */
export function mandalaWordBounds(radius: number, width: number, height: number) {
  return { inner: radius - height / 2, outer: Math.hypot(radius + height / 2, width / 2) };
}

/** A full-word sector includes all four corners, preserving Indic shaping. */
function sector(width: number, height: number, radius: number): number {
  return 2 * Math.atan2(width / 2 + .4, radius - height / 2);
}

const wordSector = (word: string, widthOf: (text: string) => number, height: number, radius: number) =>
  mandalaClusters(word).reduce((sum, run) => sum + sector(widthOf(run), height, radius), 0) + AIR / radius;

function place(tokens: readonly string[], widthOf: (word: string) => number, radius: number, height: number, repeat = true): PlacedRingToken[] {
  if (!tokens.length) return [];
  const spans = tokens.map(word => wordSector(word, widthOf, height, radius));
  const used = spans.reduce((a, b) => a + b, 0);
  const runs = tokens.reduce((sum, word) => sum + mandalaClusters(word).length, 0);
  const repeats = repeat ? Math.max(1, Math.min(Math.floor(TAU / used), Math.floor(MAX_RUNS / runs))) : 1;
  const gap = (TAU - used * repeats) / (tokens.length * repeats);
  let start = 0;
  const placed: PlacedRingToken[] = [];
  for (let n = 0; n < repeats; n++) tokens.forEach((text, i) => {
    mandalaClusters(text).forEach((run, syllable) => {
      const span = sector(widthOf(run), height, radius);
      placed.push({ key: `${n}:${i}:${syllable}`, text: run, width: widthOf(run), angleDeg: (start + span / 2) * 180 / Math.PI });
      start += span;
    });
    start += AIR / radius + gap;
  });
  return placed;
}

/**
 * Fit complete native-shaped words in an ornamental annulus. The longest word
 * determines its radial allowance. Long passages continue in whole-word pages
 * driven by the existing reading phase; the primary verse is never truncated.
 */
export function layoutMandala(text: string, size: number, measured: Readonly<Record<string, number | undefined>>): MandalaLayout | null {
  const allWords = ringWords(text);
  if (!allWords.length || !Number.isFinite(size) || size < 160) return null;
  const separator = ringSeparator(text);
  const words: string[] = [];
  let runs = 0;
  for (const word of allWords.slice(0, MAX_WORDS)) {
    const length = mandalaClusters(word).length;
    if (runs + length > MAX_RUNS) break;
    words.push(word); runs += length;
  }
  const unique = [...new Set([...words.flatMap(mandalaClusters), separator])];
  if (unique.some(run => { const width = measured[run]; return typeof width !== 'number' || !Number.isFinite(width) || width <= 0; })) return null;
  const outer = size * .46;
  let edge = outer;
  const configs: { radius: number; fontSize: number; lineHeight: number; width: (word: string) => number }[] = [];
  for (const fontSize of MANDALA_FONT_SIZES) {
    const lineHeight = Math.ceil(fontSize * 1.9);
    const width = (word: string) => mandalaWordWidth(measured[word] ?? 0, fontSize);
    const halfWidth = Math.max(...unique.map(width)) / 2;
    const radicand = (edge - AIR) ** 2 - halfWidth ** 2;
    if (radicand <= 0) continue;
    const radius = Math.sqrt(radicand) - lineHeight / 2;
    const inside = radius - lineHeight / 2 - AIR;
    if (inside < 8) continue;
    configs.push({ radius, fontSize, lineHeight, width });
    edge = inside;
  }
  // A very long compound can require the whole diameter. Keep the complete
  // reading text and ornamental frame rather than squeezing/cutting its glyphs.
  if (!configs.length) return { outer, middle: size * .37, inner: size * .28, loop: size * .35, bands: [], overflow: true };
  const pages: PlacedRingToken[][][] = configs.map(() => []);
  const fits = (tokens: readonly string[], c: typeof configs[number]) => tokens.reduce((sum, word) => sum + wordSector(word, c.width, c.lineHeight, c.radius), 0) <= TAU;
  // An unusually long compound can cross a band/page at a complete syllable,
  // never through a matra or conjunct. Most words remain together.
  const flow = words.flatMap(word => {
    if (configs.some(c => fits([word], c))) return [word];
    const parts: string[] = []; let part = '';
    for (const run of mandalaClusters(word)) {
      if (part && !configs.some(c => fits([part + run], c))) { parts.push(part); part = ''; }
      part += run;
    }
    if (part) parts.push(part);
    return parts;
  });
  const complete = [...flow, separator];
  if (configs.every(c => fits(complete, c))) {
    configs.forEach((c, i) => pages[i].push(place(complete, c.width, c.radius, c.lineHeight)));
  } else {
    let at = 0;
    while (at < flow.length) {
      const before = at;
      configs.forEach((c, i) => {
        const part: string[] = [];
        while (at < flow.length && (fits([...part, flow[at], separator], c) || part.length === 0 && fits([flow[at]], c))) part.push(flow[at++]);
        const display = fits([...part, separator], c) ? [...part, separator] : part;
        pages[i].push(part.length ? place(display, c.width, c.radius, c.lineHeight, false) : []);
      });
      if (at === before) break; // bounded fallback; primary reading text is intact
    }
    if (at < flow.length) return { outer, middle: size * .37, inner: size * .28, loop: size * .35, bands: [], overflow: true };
  }
  const bands = configs.map((c, i) => ({ radius: c.radius, fontSize: c.fontSize, lineHeight: c.lineHeight, pages: pages[i] }));
  const middle = configs[0].radius - configs[0].lineHeight / 2 - AIR;
  const inner = configs.length > 1 ? edge : Math.max(0, middle - 6);
  // Reserve the compact jyoti's full halo at every point of the infinity loop.
  const loop = inner >= 36 ? Math.min(size * .45, (inner - 14) / .5) : 0;
  return { outer, middle, inner, loop, bands, overflow: words.length < allWords.length };
}

/** Native-opacity windows; no word timers, JS listeners, or counting callbacks. */
export function mandalaPageOpacity(page: number, total: number) {
  if (total <= 1) return { inputRange: [0, 1], outputRange: [1, 1] };
  const start = page / total, end = (page + 1) / total;
  const fade = Math.min(.02, (end - start) / 4);
  const points = [
    { t: 0, v: page === 0 ? 1 : 0 },
    { t: start, v: page === 0 ? 1 : 0 },
    { t: start + fade, v: 1 },
    { t: end - fade, v: 1 },
    { t: end, v: page === total - 1 ? 1 : 0 },
    { t: 1, v: page === total - 1 ? 1 : 0 },
  ];
  const unique = points.filter((point, i) => i === 0 || point.t !== points[i - 1].t);
  return { inputRange: unique.map(p => p.t), outputRange: unique.map(p => p.v) };
}
