import type { Rect } from './tourTargets';

/**
 * Pure geometry for the feature-tour overlay. Kept dependency-free (no RN) so
 * the placement rules are unit-tested in isolation.
 */

export type Screen = { width: number; height: number };
export type Insets = { top: number; bottom: number };
export type ArrowDir = 'up' | 'down';

export type CardPlacement = {
  /** Absolute top of the card container (px from screen top). Set when the card
   *  sits BELOW the target (arrow points up at it). */
  top?: number;
  /** Absolute bottom of the card container (px from screen bottom). Set when the
   *  card sits ABOVE the target (arrow points down at it). */
  bottom?: number;
  arrow: ArrowDir;
  /** Left offset (px) of the arrow triangle within the card's content box
   *  [cardHPad, width - cardHPad], so the arrow lines up under the target. */
  arrowLeft: number;
};

/** Gap between the target's edge and the card (leaves room for the arrow). */
export const CARD_GAP = 10;

/** Fallback tooltip-card height (px), incl. arrow — used to decide whether a side
 *  has room until the card reports its real rendered height (which varies with
 *  the bilingual copy, the type scale, and the device). `FeatureTour` measures the
 *  card via `onLayout` and passes that back in; this constant only seeds the very
 *  first frame before the measurement lands. */
export const CARD_HEIGHT_EST = 300;

/**
 * Place the tooltip card **adjacent** to the highlighted target — hugging the
 * side that can actually fit it — so the card never covers the ring and its
 * controls stay on-screen. Target in the upper part → card just below it (arrow
 * up); target low (e.g. a bottom tab) → card just above it (arrow down). When
 * neither side can hold the whole card (a tall target, a short screen, or a
 * large type scale) the card pins flush to the safe-area edge on the **roomier**
 * side, so it clears the ring as much as possible and its controls stay
 * reachable; the arrow still leads back toward the target from the card's near
 * edge. The arrow is nudged horizontally to sit under the target's centre.
 *
 * `cardHeight` is the card's real rendered height (incl. its arrow) when known —
 * measured by `FeatureTour` and fed back in — so the fit decision holds on any
 * device and type scale, not just when the card happens to match a fixed guess.
 */
export function placeTourCard(
  target: Rect,
  screen: Screen,
  insets: Insets,
  cardHPad = 20,
  arrowW = 22,
  cardHeight = CARD_HEIGHT_EST
): CardPlacement {
  const availBelow = screen.height - insets.bottom - (target.y + target.height) - CARD_GAP;
  const availAbove = target.y - insets.top - CARD_GAP;

  // Arrow x: under the target centre, clamped inside the card's content box.
  const slotWidth = Math.max(0, screen.width - 2 * cardHPad);
  const targetCenterX = target.x + target.width / 2;
  const arrowLeft = clamp(targetCenterX - cardHPad - arrowW / 2, 0, Math.max(0, slotWidth - arrowW));

  if (availBelow >= cardHeight) {
    return { top: target.y + target.height + CARD_GAP, arrow: 'up', arrowLeft };
  }
  if (availAbove >= cardHeight) {
    return { bottom: screen.height - target.y + CARD_GAP, arrow: 'down', arrowLeft };
  }
  // Neither side holds the whole card. Keep the card's bottom controls
  // (Back/Next) reachable: top-pin only when the whole card fits within the safe
  // viewport AND there is more room above the target — that clears a low target
  // (arrow down) without pushing the controls off-screen. Otherwise pin flush to
  // the bottom edge (arrow up), which keeps the controls on-screen even for a
  // card taller than the viewport (large type scale). The arrow still leads to
  // the target.
  const usableHeight = screen.height - insets.top - insets.bottom - 16;
  if (cardHeight <= usableHeight && availAbove > availBelow) {
    return { top: insets.top + 8, arrow: 'down', arrowLeft };
  }
  return { bottom: insets.bottom + 8, arrow: 'up', arrowLeft };
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/**
 * Re-measure loop tuning. A freshly-navigated screen shifts for several frames as
 * its header/content lays out (and, on the Panchang home, as the muhurat card
 * mounts after the calendar computes). Taking an early measurement rings the wrong
 * spot, so keep re-measuring until the rect holds still for a run of frames.
 */
export const MEASURE_MAX_TRIES = 48; // hard cap (~0.8s at 60fps) before giving up
export const MEASURE_MIN_TRIES = 6; // never accept before the entry animation settles
export const MEASURE_STABLE_FRAMES = 4; // consecutive identical frames = "settled"

/**
 * Whether the re-measure loop should stop: either the rect has held still for
 * `MEASURE_STABLE_FRAMES` consecutive frames past the `MEASURE_MIN_TRIES` warm-up,
 * or we've hit the hard `MEASURE_MAX_TRIES` cap. `stable` counts consecutive
 * frames whose measurement matched the previous one.
 */
export function measureSettled(tries: number, stable: number): boolean {
  if (tries >= MEASURE_MAX_TRIES) return true;
  return tries >= MEASURE_MIN_TRIES && stable >= MEASURE_STABLE_FRAMES;
}

/** Whether two rects are the same to the nearest pixel (measurement settled). */
export function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (!a || !b) return a === b;
  return (
    Math.round(a.x) === Math.round(b.x) &&
    Math.round(a.y) === Math.round(b.y) &&
    Math.round(a.width) === Math.round(b.width) &&
    Math.round(a.height) === Math.round(b.height)
  );
}

/**
 * Geometry of a bottom-tab item, used to ring the destination tab when a step
 * has no on-screen element target. Mirrors the default `createBottomTabNavigator`
 * bar: equal-width items across the screen, `barContentHeight` tall, sitting
 * above the bottom safe-area inset.
 */
export function tabItemRect(
  tabIndex: number,
  tabCount: number,
  screen: Screen,
  insetsBottom: number,
  barContentHeight = 60
): Rect {
  const tabWidth = screen.width / tabCount;
  const barTop = screen.height - (barContentHeight + insetsBottom);
  return { x: tabIndex * tabWidth, y: barTop, width: tabWidth, height: barContentHeight };
}

/** Inflate a rect by `pad` on every side (for the ring's breathing room), clamped to >= 0. */
export function inflateRect(rect: Rect, pad: number): Rect {
  return {
    x: Math.max(0, rect.x - pad),
    y: Math.max(0, rect.y - pad),
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  };
}
