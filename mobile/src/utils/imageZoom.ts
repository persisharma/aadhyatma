/**
 * Pure geometry for the shared picture viewer (design.md §93).
 *
 * The picture is laid out at its fitted size in the centre of the viewport and
 * then transformed `translate → scale`, so a point `p` (measured from the
 * viewport centre) lands on screen at `p * scale + offset`.
 */
export type ZoomState = { scale: number; x: number; y: number };
export type Size = { width: number; height: number };
export type Point = { x: number; y: number };

/** Buttons and double-tap step through these; a pinch may rest anywhere between. */
export const ZOOM_LEVELS: readonly number[] = [1, 1.75, 2.5, 3];
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const DOUBLE_TAP_ZOOM = 2.5;
export const RESTING_ZOOM: ZoomState = { scale: 1, x: 0, y: 0 };

const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/** `contain`: the largest size with the picture's ratio that fits the viewport. */
export function fitSize(view: Size, aspectRatio: number): Size {
  if (view.width <= 0 || view.height <= 0 || aspectRatio <= 0) return { width: 0, height: 0 };
  const width = Math.min(view.width, view.height * aspectRatio);
  return { width, height: width / aspectRatio };
}

/** Keep the scale in range and never drag an edge of the picture past the viewport edge. */
export function clampZoom(state: ZoomState, fit: Size, view: Size): ZoomState {
  const scale = clamp(state.scale, MIN_ZOOM, MAX_ZOOM);
  const maxX = Math.max(0, (fit.width * scale - view.width) / 2);
  const maxY = Math.max(0, (fit.height * scale - view.height) / 2);
  // `+ 0` normalises -0 so a resting state compares equal to RESTING_ZOOM.
  return { scale, x: clamp(state.x, -maxX, maxX) + 0, y: clamp(state.y, -maxY, maxY) + 0 };
}

/** Zoom to `nextScale` keeping the picture point under `focal` (from the viewport centre) in place. */
export function zoomAbout(state: ZoomState, nextScale: number, focal: Point, fit: Size, view: Size): ZoomState {
  const scale = clamp(nextScale, MIN_ZOOM, MAX_ZOOM);
  const ratio = scale / state.scale;
  return clampZoom({ scale, x: focal.x - (focal.x - state.x) * ratio, y: focal.y - (focal.y - state.y) * ratio }, fit, view);
}

/** The next preset above (`+1`) or below (`-1`) the current scale. */
export function stepZoom(scale: number, direction: 1 | -1): number {
  const epsilon = 0.01;
  if (direction === 1) return ZOOM_LEVELS.find(level => level > scale + epsilon) ?? MAX_ZOOM;
  return [...ZOOM_LEVELS].reverse().find(level => level < scale - epsilon) ?? MIN_ZOOM;
}

/** "1×", "1.75×", "2.5×" — at most two decimals, no trailing zeros. */
export function zoomLabel(scale: number): string {
  return `${Number(scale.toFixed(2))}×`;
}
