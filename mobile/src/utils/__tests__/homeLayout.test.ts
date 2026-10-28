import { homeLayout } from '../homeLayout';

// The row must fit strictly inside the grid (exact fits wrap on Android) while
// losing no more than one physical pixel per tile.
function expectRowFits(layout: ReturnType<typeof homeLayout>, pixelRatio: number) {
  const row = layout.tileWidth * layout.columns + layout.gridGap * (layout.columns - 1);
  expect(row).toBeLessThan(layout.gridWidth);
  expect(layout.gridWidth - row).toBeLessThanOrEqual(layout.columns / pixelRatio + 1e-9);
}

// Regression: portrait widths used to persist after rotation while flex-wrap
// produced accidental columns and a Daan row narrower than its grid.
describe('Home responsive grid', () => {
  test.each([375, 402, 440])('retains three balanced phone columns at %spt', (width) => {
    const layout = homeLayout(width);
    expect(layout.columns).toBe(3);
    expect(layout.gridPadding).toBe(16);
    expect(layout.gridWidth).toBe(width - 32);
    expect(layout.launcherHeight).toBe(72);
    expectRowFits(layout, 2);
  });

  // Regression: an Android phone wrapped the third launcher of every row,
  // leaving two 3-column-wide tiles per row and an empty right third.
  test.each([
    [360, 2],
    [360, 3],
    [392.72727272727275, 2.75],
    [411.42857142857144, 2.625],
    [384, 2],
  ])('keeps three launchers on one row at %sdp, density %s', (width, density) => {
    const layout = homeLayout(width, 1, density);
    expect(layout.columns).toBe(3);
    expectRowFits(layout, density);
    // Yoga breaks lines by summing tiles and gaps in float32; the exact-fit
    // track overflowed by ~3e-5dp at the fractional widths above.
    const f = Math.fround;
    let row = f(0);
    for (let i = 0; i < layout.columns; i++) {
      row = f(row + f(layout.tileWidth));
      if (i < layout.columns - 1) row = f(row + layout.gridGap);
    }
    expect(row).toBeLessThanOrEqual(f(layout.gridWidth));
  });

  test('recalculates tablet tracks on rotation and caps the reading width', () => {
    const portrait = homeLayout(744);
    const landscape = homeLayout(1133);
    expect(portrait.columns).toBe(5);
    expect(landscape.columns).toBe(5);
    expect(landscape.tileWidth).toBeGreaterThan(portrait.tileWidth);
    expect(landscape.contentWidth).toBeLessThan(1133);
    for (const layout of [portrait, landscape]) {
      expect(layout.gridPadding).toBe(16);
      expect(layout.gridWidth).toBe(layout.contentWidth - 32);
      expectRowFits(layout, 2);
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
