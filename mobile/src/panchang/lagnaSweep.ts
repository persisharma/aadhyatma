/**
 * Lagna sweep — the 12–13 ascendant-rashi spans covering one civil day
 * (PRD-16/P3 §4.1). Splitting and grading muhurat windows at lagna boundaries
 * needs the whole day's spans, not one chart's ascendant, so this sweeps the
 * closed-form `ascendantSiderealLongitude` (kundali.ts — exactly equal to
 * `computeLagna`'s bisected root) and bisects each 30° crossing IN TIME.
 *
 * PURE: caller supplies every date — no wall-clock reads, no React, no
 * astronomy beyond the declared kundali primitive (source-purity test). The
 * spans are persisted in `DayInputs` (panchangDaySerde v3), so this runs once per
 * (day, location) inside `computeDayInputs` — off the render path via the
 * finder's chunked sweep and the 7-day prewarm.
 */
import { ascendantSiderealLongitude } from './kundali';

export type LagnaSpan = { rashiIndex: number; start: Date; end: Date };

/**
 * Coarse scan step. The fastest-rising sign at Indian latitudes takes well
 * over an hour to rise (≈55 min even at 35°N), so a 10-minute walk can never
 * skip a rashi; the curated-city assumption (RULEBOOK §17) bounds latitude.
 */
const COARSE_STEP_MS = 10 * 60_000;
/** Boundary bisection resolution — spans are quoted to the minute in the UI. */
const BOUNDARY_PRECISION_MS = 30_000;

/**
 * The lagna spans tiling [sunrise, nextSunrise) exactly, in rising order
 * (rashi advances by 1 mod 12 at every boundary). Returns [] on a degenerate
 * day (`nextSunrise <= sunrise`) — upstream already nulls such days (the
 * shipped polar-latitude guard).
 */
export function lagnaSpansForDay(
  sunrise: Date,
  nextSunrise: Date,
  latitude: number,
  longitude: number
): LagnaSpan[] {
  const startMs = sunrise.getTime();
  const endMs = nextSunrise.getTime();
  if (!(endMs > startMs)) return [];

  const rashiAt = (ms: number) =>
    Math.floor(ascendantSiderealLongitude(new Date(ms), latitude, longitude) / 30) % 12;

  const spans: LagnaSpan[] = [];
  let spanStartMs = startMs;
  let spanRashi = rashiAt(startMs);
  let prevMs = startMs;
  let prevRashi = spanRashi;

  for (let ms = startMs + COARSE_STEP_MS; ; ms += COARSE_STEP_MS) {
    const probeMs = Math.min(ms, endMs);
    const rashi = rashiAt(probeMs);
    if (rashi !== prevRashi) {
      // Exactly one 30° crossing in a 10-min bracket: bisect it in time.
      let lo = prevMs;
      let hi = probeMs;
      while (hi - lo > BOUNDARY_PRECISION_MS) {
        const mid = Math.floor((lo + hi) / 2);
        if (rashiAt(mid) === prevRashi) lo = mid;
        else hi = mid;
      }
      const boundary = new Date(hi);
      spans.push({ rashiIndex: spanRashi, start: new Date(spanStartMs), end: boundary });
      spanStartMs = hi;
      spanRashi = rashi;
    }
    prevMs = probeMs;
    prevRashi = rashi;
    if (probeMs >= endMs) break;
  }

  spans.push({ rashiIndex: spanRashi, start: new Date(spanStartMs), end: new Date(endMs) });
  return spans;
}

/**
 * The rashi of the span containing `t`. Instants outside the tiled range clamp
 * to the nearest edge span (a window start can never actually be outside
 * [sunrise, nextSunrise) — this is belt-and-braces for boundary rounding).
 */
export function lagnaAt(spans: readonly LagnaSpan[], t: Date): number {
  if (spans.length === 0) return -1;
  const ms = t.getTime();
  for (const span of spans) {
    if (ms < span.end.getTime()) return span.rashiIndex;
  }
  return spans[spans.length - 1].rashiIndex;
}
