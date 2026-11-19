import { JAPAM_BEADS_PER_ROUND } from '@/data/japam';

/**
 * Pure geometry for the turning mala on the Japam counter (design.md §35).
 *
 * The 108 beads sit on a ring with a gap at the bottom for the Sumeru (guru
 * bead). A fixed marker sits at the top; the ring rotates so the bead under the
 * fingers is always under the marker. Tradition says the Sumeru is never
 * crossed: at the end of a round the mala is turned and the next round runs
 * back the other way, so the direction flips with every completed round.
 */

const N = JAPAM_BEADS_PER_ROUND;

/** Degrees of ring left empty on each side of the Sumeru. */
export const MALA_SUMERU_GAP_DEG = 8;

/** Space inside the mala box around the bead ring, for the Sumeru + tassel. */
export const MALA_RING_INSET = 34;

/** Bead radius for a mala box of `size` (beads nearly touch on the thread). */
export function malaBeadRadius(size: number): number {
  const r = size / 2 - MALA_RING_INSET;
  return Math.max(2.2, ((2 * Math.PI * r) / N) * 0.46);
}

/**
 * Farthest any part of the mala reaches from its centre. The Sumeru and tassel
 * hang below the ring and rotate with it, so they can point anywhere: the tassel's
 * outer corners sit 10.6 beadR below the ring (Sumeru centre r + 2.6 beadR, tassel
 * end + 8 beadR) and 2.5 beadR to each side (JapamMala's tassel path).
 */
export function malaOuterReach(size: number): number {
  const r = size / 2 - MALA_RING_INSET;
  const beadR = malaBeadRadius(size);
  return Math.hypot(beadR * 2.5, r + beadR * 10.6);
}

/** Angle (SVG degrees: 0 = +x, 90 = bottom) of bead `i`, walking clockwise
 *  from just beside the Sumeru. */
export function malaBeadAngle(i: number, gapDeg: number = MALA_SUMERU_GAP_DEG): number {
  return 90 + gapDeg + (i * (360 - 2 * gapDeg)) / (N - 1);
}

/** +1 on even rounds (clockwise away from the Sumeru), -1 on odd rounds (the
 *  mala has been turned at the Sumeru and runs back). */
export function malaDirection(completedRounds: number): 1 | -1 {
  return completedRounds % 2 === 0 ? 1 : -1;
}

/** Physical index of the bead under the marker after `count` beads of the
 *  current round. */
export function malaMarkerBead(count: number, dir: 1 | -1): number {
  const c = Math.max(0, Math.min(count, N - 1));
  return dir > 0 ? c : N - 1 - c;
}

/** Ring rotation (degrees) that brings bead `pos` under the top marker. Linear
 *  in `pos`, so consecutive beads never animate the long way round. */
export function malaRotation(pos: number, gapDeg: number = MALA_SUMERU_GAP_DEG): number {
  return 270 - malaBeadAngle(pos, gapDeg);
}

export type MalaBeadState = 'current' | 'chanted' | 'ahead';

/** Whether bead `i` is under the marker, already chanted this round, or still ahead. */
export function malaBeadState(i: number, pos: number, dir: 1 | -1): MalaBeadState {
  if (i === pos) return 'current';
  const chanted = dir > 0 ? i < pos : i > pos;
  return chanted ? 'chanted' : 'ahead';
}
