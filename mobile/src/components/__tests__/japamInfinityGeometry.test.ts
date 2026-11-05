import { infinityPoint, INFINITY_PATH } from '../japamInfinityGeometry';

test('closes the path smoothly at each 108-bead rollover', () => {
  const start = infinityPoint(0);
  for (const round of [1, 2, 1000]) {
    const end = infinityPoint(round);
    expect(end.x).toBeCloseTo(start.x);
    expect(end.y).toBeCloseTo(start.y);
  }
  const before = infinityPoint(107 / 108);
  expect(Math.hypot(before.x - start.x, before.y - start.y)).toBeLessThan(0.05);
});

test('both lobes remain within the normalized viewbox', () => {
  for (let i = 0; i <= 108; i++) {
    const { x, y } = infinityPoint(i / 108);
    expect(x).toBeGreaterThanOrEqual(0.059);
    expect(x).toBeLessThanOrEqual(0.941);
    expect(y).toBeGreaterThanOrEqual(0.074);
    expect(y).toBeLessThanOrEqual(0.576);
  }
  expect(INFINITY_PATH.startsWith('M500.000 325.000')).toBe(true);
});
