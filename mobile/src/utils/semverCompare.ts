/**
 * Lightweight semver comparison — no external dependency.
 *
 * Splits each version on `.`, compares segments numerically (major → minor →
 * patch …), padding the shorter version with zeros. Non-numeric segments are
 * treated as 0, so plain `x.y.z` app.json versions compare correctly. Does NOT
 * implement full semver precedence (pre-release/build suffixes are ignored —
 * `parseInt('0-beta', 10)` is `0`), which is sufficient for app version codes.
 *
 * @returns -1 if a < b, 0 if equal, 1 if a > b.
 */
export function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const pa = a.split('.').map((s) => parseInt(s, 10) || 0);
  const pb = b.split('.').map((s) => parseInt(s, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}
