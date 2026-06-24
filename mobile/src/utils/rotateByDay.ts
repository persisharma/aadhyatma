/**
 * Day-stable rotation for the Home "Discover" spotlight carousel (design.md §32).
 *
 * All spotlight cards always render — coverage is the whole point of the
 * awareness section — but the card that *leads* the row rotates once per day so
 * Home feels fresh without ever hiding a section. The rotation is derived from a
 * caller-supplied day index (e.g. day-of-year) rather than `Math.random()` /
 * `Date.now()`, so it is pure and unit-testable and stays stable across renders
 * within the same day.
 *
 * Returns a NEW array (does not mutate input). Empty input → empty output.
 */
export function rotateLeadByDay<T>(items: readonly T[], dayIndex: number): T[] {
  const n = items.length;
  if (n === 0) return [];
  // Guard against negative / non-integer day indices.
  const offset = ((Math.floor(dayIndex) % n) + n) % n;
  return items.map((_, i) => items[(i + offset) % n]);
}

/**
 * Day-of-year (1–366) for a given date in local time — the default rotation
 * seed. Kept tiny and separate so the rotation itself stays pure.
 */
export function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / 86_400_000);
}
