import { getSiderealPlanetLongitude, PADA_SPAN } from './kundali';
import { parseIstMoment } from './gunaMilan';
import {
  CHARANA_TABLE,
  NAMAKSHAR_CONVENTION_VERSION,
  type CharanaEntry,
  type Syllable,
} from './namkaranConvention';

const DAY_MS = 86_400_000;
const BISECTION_TOLERANCE_MS = 30_000;

export type NamkaranBasis =
  | { kind: 'instant'; at: Date }
  | { kind: 'dayIST'; civilDate: string }
  | { kind: 'manual'; nakshatraIndex: number; pada: 1 | 2 | 3 | 4 };

export type CharanaCandidate = {
  entry: CharanaEntry;
  rashiIndex: number;
  longitude?: number;
  window?: { startMs: number; endMs: number };
};

export type NamkaranResult =
  | { kind: 'exact'; candidate: CharanaCandidate; conventionVersion: number }
  | { kind: 'range'; candidates: readonly CharanaCandidate[]; conventionVersion: number };

export type MoonLongitudeResolver = (date: Date) => number;

export function normalizeLongitude(longitude: number): number {
  if (!Number.isFinite(longitude)) throw new Error('Moon longitude must be finite');
  return ((longitude % 360) + 360) % 360;
}

/** Half-open [start,end) charana classification shared with Kundali's pada flooring. */
export function charanaOf(siderealLongitude: number): number {
  const longitude = normalizeLongitude(siderealLongitude);
  // Rational multiples of 360/108 can land a few ulps below their mathematical
  // integer in binary. The epsilon is far below the astronomy precision and
  // only preserves the documented exact-boundary ownership.
  return Math.min(107, Math.floor(longitude / PADA_SPAN + 1e-10));
}

export function candidateFromLongitude(longitude: number): CharanaCandidate {
  const normalized = normalizeLongitude(longitude);
  const entry = CHARANA_TABLE[charanaOf(normalized)];
  return {
    entry,
    rashiIndex: Math.min(11, Math.floor(normalized / 30)),
    longitude: normalized,
  };
}

export function candidateFromManual(
  nakshatraIndex: number,
  pada: 1 | 2 | 3 | 4
): CharanaCandidate {
  if (!Number.isInteger(nakshatraIndex) || nakshatraIndex < 0 || nakshatraIndex > 26) {
    throw new Error(`Invalid nakshatra index: ${nakshatraIndex}`);
  }
  if (![1, 2, 3, 4].includes(pada)) throw new Error(`Invalid pada: ${pada}`);
  const entry = CHARANA_TABLE[nakshatraIndex * 4 + pada - 1];
  return { entry, rashiIndex: Math.floor(entry.charanaIndex / 9) };
}

function unwrapFrom(startLongitude: number, currentLongitude: number): number {
  let delta = normalizeLongitude(currentLongitude) - startLongitude;
  if (delta < -180) delta += 360;
  if (delta > 180) delta -= 360;
  return startLongitude + delta;
}

function crossingTime(
  startMs: number,
  endMs: number,
  startLongitude: number,
  boundary: number,
  resolver: MoonLongitudeResolver
): number {
  let low = startMs;
  let high = endMs;
  while (high - low > BISECTION_TOLERANCE_MS) {
    const middle = Math.floor((low + high) / 2);
    const longitude = unwrapFrom(startLongitude, resolver(new Date(middle)));
    if (longitude < boundary) low = middle + 1;
    else high = middle;
  }
  return high;
}

/**
 * Enumerates every charana occupied during an IST civil day. Crossings are
 * solved by bisection; no sampled midpoint is ever treated as a birth time.
 */
export function charanaSetForDay(
  civilDateIST: string,
  moonLongitudeAt: MoonLongitudeResolver = (date) => getSiderealPlanetLongitude('moon', date)
): readonly CharanaCandidate[] {
  const start = parseIstMoment(civilDateIST, '00:00');
  const startMs = start.getTime();
  const endMs = startMs + DAY_MS - 1;
  const startLongitude = normalizeLongitude(moonLongitudeAt(start));
  let endLongitude = unwrapFrom(startLongitude, moonLongitudeAt(new Date(endMs)));
  if (endLongitude < startLongitude) endLongitude += 360;
  if (endLongitude - startLongitude > 30) {
    throw new Error('Unexpected Moon motion while checking an IST civil day');
  }

  const firstBoundary = Math.floor(startLongitude / PADA_SPAN) + 1;
  const lastBoundary = Math.floor(endLongitude / PADA_SPAN);
  const crossings: number[] = [];
  for (let boundaryIndex = firstBoundary; boundaryIndex <= lastBoundary; boundaryIndex += 1) {
    crossings.push(
      crossingTime(startMs, endMs, startLongitude, boundaryIndex * PADA_SPAN, moonLongitudeAt)
    );
  }

  const cuts = [startMs, ...crossings, endMs + 1];
  return cuts.slice(0, -1).map((windowStart, index) => {
    const windowEndExclusive = cuts[index + 1];
    const longitude = normalizeLongitude(moonLongitudeAt(new Date(windowStart)));
    const candidate = candidateFromLongitude(longitude);
    return {
      ...candidate,
      window: { startMs: windowStart, endMs: windowEndExclusive - 1 },
    };
  });
}

export function rashiCharanaEntries(rashiIndex: number): readonly CharanaEntry[] {
  if (!Number.isInteger(rashiIndex) || rashiIndex < 0 || rashiIndex > 11) {
    throw new Error(`Invalid rashi index: ${rashiIndex}`);
  }
  return CHARANA_TABLE.slice(rashiIndex * 9, rashiIndex * 9 + 9);
}

export function rashiSyllables(rashiIndex: number): readonly Syllable[] {
  return rashiCharanaEntries(rashiIndex).flatMap((entry) => entry.syllables);
}

/**
 * The distinct Moon rashis a candidate set touches, in candidate order.
 *
 * An unknown-time day spans ≈ 3.6–4.5 charanas against the 9 a rashi holds, so
 * roughly one day in two crosses a 30° boundary and genuinely occupies two
 * rashis. Surfaces must render every one of them — naming the first candidate's
 * rashi alone would rank a candidate the range path is required not to rank
 * (convention §5.3, PRD-17 §4.2).
 */
export function distinctRashiIndices(
  candidates: readonly CharanaCandidate[]
): readonly number[] {
  const seen = new Set<number>();
  return candidates.flatMap((candidate) => {
    if (seen.has(candidate.rashiIndex)) return [];
    seen.add(candidate.rashiIndex);
    return [candidate.rashiIndex];
  });
}

export function calculateNamkaran(
  basis: NamkaranBasis,
  moonLongitudeAt: MoonLongitudeResolver = (date) => getSiderealPlanetLongitude('moon', date)
): NamkaranResult {
  if (basis.kind === 'manual') {
    return {
      kind: 'exact',
      candidate: candidateFromManual(basis.nakshatraIndex, basis.pada),
      conventionVersion: NAMAKSHAR_CONVENTION_VERSION,
    };
  }
  if (basis.kind === 'dayIST') {
    return {
      kind: 'range',
      candidates: charanaSetForDay(basis.civilDate, moonLongitudeAt),
      conventionVersion: NAMAKSHAR_CONVENTION_VERSION,
    };
  }
  if (!Number.isFinite(basis.at.getTime())) throw new Error('Invalid birth instant');
  return {
    kind: 'exact',
    candidate: candidateFromLongitude(moonLongitudeAt(basis.at)),
    conventionVersion: NAMAKSHAR_CONVENTION_VERSION,
  };
}
