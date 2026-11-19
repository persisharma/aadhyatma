import { DOUBLE_TAP_ZOOM, MAX_ZOOM, RESTING_ZOOM, clampZoom, fitSize, stepZoom, zoomAbout, zoomLabel } from '../imageZoom';

const view = { width: 390, height: 600 };
const fit = fitSize(view, 1.5);

test('the picture is contained in the viewport at its own ratio', () => {
  expect(fit).toEqual({ width: 390, height: 260 });
  // A short viewport limits by height instead.
  expect(fitSize({ width: 390, height: 100 }, 1.5)).toEqual({ width: 150, height: 100 });
  expect(fitSize({ width: 0, height: 0 }, 1.5)).toEqual({ width: 0, height: 0 });
});

test('scale stays within 1× and the maximum, and edges never leave the viewport', () => {
  expect(clampZoom({ scale: 0.4, x: 80, y: -80 }, fit, view)).toEqual(RESTING_ZOOM);
  const zoomed = clampZoom({ scale: 9, x: 5000, y: -5000 }, fit, view);
  expect(zoomed.scale).toBe(MAX_ZOOM);
  // 390 × 3 = 1170 wide → 390 of overflow each side; 260 × 3 = 780 tall → 90 each side.
  expect(zoomed.x).toBe(390);
  expect(zoomed.y).toBe(-90);
  // Zoomed but still shorter than the viewport: no vertical drag at all.
  expect(clampZoom({ scale: 1.75, x: 0, y: 40 }, fit, view).y).toBe(0);
});

test('zooming keeps the picture point under the fingers in place', () => {
  const focal = { x: 100, y: 0 };
  const next = zoomAbout(RESTING_ZOOM, 2, focal, fit, view);
  // The point that was under the focal before (100 / 1) is still there: 100 × 2 + offset.
  expect(100 * next.scale + next.x).toBeCloseTo(focal.x);
  expect(next).toEqual({ scale: 2, x: -100, y: 0 });
  // Zooming back out returns to rest rather than leaving the picture off-centre.
  expect(zoomAbout(next, 1, focal, fit, view)).toEqual(RESTING_ZOOM);
  expect(zoomAbout(RESTING_ZOOM, 99, { x: 0, y: 0 }, fit, view).scale).toBe(MAX_ZOOM);
});

test('the buttons step through the presets from any pinched scale', () => {
  expect(stepZoom(1, 1)).toBe(1.75);
  expect(stepZoom(1.75, 1)).toBe(2.5);
  expect(stepZoom(2.1, 1)).toBe(2.5);
  expect(stepZoom(2.5, 1)).toBe(3);
  expect(stepZoom(3, 1)).toBe(MAX_ZOOM);
  expect(stepZoom(3, -1)).toBe(2.5);
  expect(stepZoom(2.1, -1)).toBe(1.75);
  expect(stepZoom(1, -1)).toBe(1);
  expect(DOUBLE_TAP_ZOOM).toBeLessThanOrEqual(MAX_ZOOM);
});

test('the readout drops trailing zeros', () => {
  expect(zoomLabel(1)).toBe('1×');
  expect(zoomLabel(1.75)).toBe('1.75×');
  expect(zoomLabel(2.5)).toBe('2.5×');
  expect(zoomLabel(2.3333)).toBe('2.33×');
});
