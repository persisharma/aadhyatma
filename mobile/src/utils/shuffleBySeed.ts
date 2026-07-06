/**
 * Deterministic, seeded shuffle for the Home "Discover" spotlight carousel
 * (design.md §32).
 *
 * All spotlight cards always render — awareness is about coverage, so no section
 * is ever hidden — but their order is shuffled once per app open so a different
 * section leads each visit and the row never reads as static "banner blindness".
 *
 * The shuffle is seeded (the screen captures one seed at mount) rather than
 * calling `Math.random()` directly, so it is:
 *   - pure & unit-testable (same seed → same order), and
 *   - stable across re-renders within a single mount (the order doesn't jump
 *     while the user interacts with Home).
 *
 * Returns a NEW array (does not mutate input). Fisher–Yates driven by a
 * mulberry32 PRNG.
 */
export function shuffleBySeed<T>(items: readonly T[], seed: number): T[] {
  const out = items.slice();
  const rand = mulberry32(Math.floor(seed) >>> 0);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Small fast seeded PRNG → floats in [0, 1). Deterministic per seed. */
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
