import { homeLayout } from '../homeLayout';

// Regression: portrait widths used to persist after rotation while flex-wrap
// produced accidental columns and a Daan row narrower than its grid.
describe('Home responsive grid', () => {
  test.each([375, 402, 440])('retains three balanced phone columns at %spt', (width) => {
    const layout = homeLayout(width);
    expect(layout.columns).toBe(3);
    expect(layout.launcherHeight).toBe(72);
    expect(layout.tileWidth * layout.columns + layout.gridGap * (layout.columns - 1)).toBeCloseTo(layout.gridWidth);
  });

  test('recalculates tablet tracks on rotation and caps the reading width', () => {
    const portrait = homeLayout(744);
    const landscape = homeLayout(1133);
    expect(portrait.columns).toBe(5);
    expect(landscape.columns).toBe(5);
    expect(landscape.tileWidth).toBeGreaterThan(portrait.tileWidth);
    expect(landscape.contentWidth).toBeLessThan(1133);
    for (const layout of [portrait, landscape]) {
      expect(layout.tileWidth * layout.columns + (layout.columns - 1) * layout.gridGap).toBeCloseTo(layout.gridWidth);
    }
    expect(homeLayout(744)).toEqual(portrait);
  });

  test.each([1.3, 1.64, 2, 3.12])('keeps enlarged badges above the whole art canvas at scale %s', (scale) => {
    const layout = homeLayout(375, scale);
    expect(layout.columns).toBe(2);
    const artworkTop = (layout.launcherHeight - 62.7) / 2;
    const badgeBottom = 2 + 13 * scale;
    expect(artworkTop - badgeBottom).toBeGreaterThanOrEqual(4);
    expect(layout.tileWidth).toBeGreaterThanOrEqual(48);
    expect(homeLayout(744, scale).columns).toBe(3);
  });
});
