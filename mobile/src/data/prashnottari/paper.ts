/**
 * Pure paper logic for the question book: seeded draws, option shuffles and
 * grading. No React, no storage — screens call these and persist only ids.
 *
 * Determinism: the same seed always yields the same paper and the same option
 * order, so a resumed sitting is identical; a new attempt number yields a
 * fresh paper. Authored packs list the correct option first for review — every
 * screen MUST present questions through `presentPrashna`, never the raw order.
 */
import type { Bilingual, ParikshaGrade, Prashna, PrashnaSection } from './types';

/** FNV-1a, 32-bit. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 — small, fast, good enough for shuffling a question bank. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededShuffle<T>(items: readonly T[], seed: string): T[] {
  const out = items.slice();
  const rand = mulberry32(hashSeed(seed));
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export type PresentedPrashna = {
  prashna: Prashna;
  options: readonly [Bilingual, Bilingual, Bilingual];
  correctIndex: 0 | 1 | 2;
};

export function presentPrashna(prashna: Prashna, seed: string): PresentedPrashna {
  const order = seededShuffle<0 | 1 | 2>([0, 1, 2], `${seed}:${prashna.id}`);
  const options: readonly [Bilingual, Bilingual, Bilingual] = [
    prashna.options[order[0]],
    prashna.options[order[1]],
    prashna.options[order[2]],
  ];
  const correctIndex = order[0] === prashna.answer ? 0 : order[1] === prashna.answer ? 1 : 2;
  return { prashna, options, correctIndex };
}

/** The exam tradition's section order on a printed paper. */
export const SECTION_ORDER: readonly PrashnaSection[] = ['shlokarth', 'prasang', 'siddhant', 'katha'];

export const SECTION_LABELS: Record<PrashnaSection, Bilingual> = {
  shlokarth: { hi: 'श्लोकार्थ', en: 'Verse meaning' },
  prasang: { hi: 'प्रसंग', en: 'Context' },
  siddhant: { hi: 'सिद्धांत', en: 'Teaching' },
  katha: { hi: 'कथा', en: 'Story' },
};

export function paperSeed(level: number, attempt: number): string {
  return `gita-pariksha:${level}:${attempt}`;
}

/**
 * Draws `size` questions from `bank` and presents them grouped by section in
 * `SECTION_ORDER` (stable within a section, so the draw order survives).
 */
export function drawPaper(bank: readonly Prashna[], size: number, seed: string): PresentedPrashna[] {
  if (size > bank.length) {
    throw new Error(`drawPaper: paper of ${size} needs a bank of at least ${size}, got ${bank.length}`);
  }
  const drawn = seededShuffle(bank, seed).slice(0, size);
  const rank = (p: Prashna) => SECTION_ORDER.indexOf(p.section);
  const grouped = drawn
    .map((p, i) => ({ p, i }))
    .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
    .map(({ p }) => p);
  return grouped.map((p) => presentPrashna(p, seed));
}

/**
 * Integer-exact bands (no float gaps at a boundary such as 32.5 of 36):
 * विशेष योग्यता ≥ 85% · प्रथम श्रेणी ≥ 70% · उत्तीर्ण ≥ 50% · otherwise प्रयास-पत्र.
 */
export function gradePaper(correct: number, total: number): ParikshaGrade {
  if (total <= 0 || correct < 0 || correct > total) {
    throw new Error(`gradePaper: invalid score ${correct}/${total}`);
  }
  if (correct * 100 >= 85 * total) return 'vishesh';
  if (correct * 100 >= 70 * total) return 'pratham';
  if (correct * 100 >= 50 * total) return 'uttirn';
  return 'prayas';
}

export const GRADE_LABELS: Record<ParikshaGrade, Bilingual> = {
  vishesh: { hi: 'विशेष योग्यता', en: 'Distinction' },
  pratham: { hi: 'प्रथम श्रेणी', en: 'First class' },
  uttirn: { hi: 'उत्तीर्ण', en: 'Passed' },
  prayas: { hi: 'प्रयास-पत्र', en: 'Certificate of participation' },
};
