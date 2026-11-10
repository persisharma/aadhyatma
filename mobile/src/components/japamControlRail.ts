/**
 * The JapaMala counter's control column (design.md §35): speedometer, ▶/❚❚ and ↺
 * as 44 dp circles stacked at the right edge of the tap area, just above the
 * count bar. Always shown. Pure geometry so the screen can size the mala and the Infinity
 * frame to stay clear of it *before* they are shown — computed from the measured
 * viewport, never adjusted afterwards, so nothing jumps.
 */
import { malaOuterReach } from './japamMalaGeometry';

export const RAIL_RIGHT = 16;
export const RAIL_BOTTOM = 8;
export const RAIL_BUTTON = 44;
export const RAIL_GAP = 8;
/** Extra air kept between the column and anything it must not cover. */
export const RAIL_AIR = 4;
export const RAIL_BUTTONS = 3;
export const RAIL_HEIGHT = RAIL_BUTTONS * RAIL_BUTTON + (RAIL_BUTTONS - 1) * RAIL_GAP;
/** Width from the right screen edge the column claims (margin + button + air). */
export const RAIL_CLEARANCE = RAIL_RIGHT + RAIL_BUTTON + RAIL_AIR;

/** What the view is sized around: the whole (always shown) column. */
export const RAIL_KEEP_OUT = RAIL_HEIGHT;

/** The keep-out box in tap-area coordinates (width × viewport height). */
export function railBox(width: number, viewport: number, height: number = RAIL_KEEP_OUT) {
  return {
    left: width - RAIL_CLEARANCE,
    top: viewport - RAIL_BOTTOM - height - RAIL_AIR,
    bottom: viewport - RAIL_BOTTOM,
  };
}

/** Distance from (cx, cy) to the nearest point of the keep-out box. */
export function distanceToRail(width: number, viewport: number, cx: number, cy: number, height: number = RAIL_KEEP_OUT): number {
  const box = railBox(width, viewport, height);
  const dx = cx < box.left ? box.left - cx : 0;
  const py = Math.min(Math.max(cy, box.top), box.bottom);
  return Math.hypot(dx, py - cy);
}

/**
 * Largest even mala box ≤ `size` (down to `min`) whose ring, Sumeru and tassel
 * stay clear of the column. Mirrors the tap surface: 8 dp padding top/bottom,
 * the measured head, 4 dp, then the ring, centred while it fits.
 */
export function fitMalaBesideRail(p: { width: number; viewport: number; head: number; size: number; min: number }): number {
  const { width, viewport, head, min } = p;
  let s = Math.floor(p.size);
  while (s > min) {
    const fits = 16 + head + 4 + s <= viewport;
    const cy = fits ? viewport / 2 + head / 2 + 2 : 12 + head + s / 2;
    if (distanceToRail(width, viewport, width / 2, cy) >= malaOuterReach(s)) return s;
    s -= 2;
  }
  return min;
}

/** The smallest block under the Infinity frame: one reading line + the hint (M size). */
export const INFINITY_BELOW_MIN = 66;

/**
 * Largest Infinity frame ≤ `size` (down to `min`) clear of the column. The frame's
 * height position depends on how much text sits below it; the lowest it can sit
 * is with the shortest block below, so that is the case sized for — longer
 * readings only lift it further away.
 */
export function fitMandalaBesideRail(p: { width: number; viewport: number; size: number; min: number }): number {
  const { width, viewport, min } = p;
  let m = Math.floor(p.size);
  while (m > min) {
    const cy = Math.max(16 + m / 2, viewport / 2 - INFINITY_BELOW_MIN / 2);
    if (distanceToRail(width, viewport, width / 2, cy) >= m / 2 + RAIL_AIR) return m;
    m -= 2;
  }
  return min;
}
