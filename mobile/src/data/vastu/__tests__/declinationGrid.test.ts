/**
 * Declination grid (PRD-24 Phase 2 §A3/US-05): the bundled 1°×1° WMM-2025 grid
 * must agree with the independently generated per-city table within 0.2° for
 * EVERY bundled city — the table is the oracle; a breach means re-verify that
 * city against the BGS service, never loosen the tolerance.
 */
import {
  DECLINATION_GRID_TENTHS,
  GRID_COLS,
  GRID_LAT_MAX,
  GRID_LAT_MIN,
  GRID_LON_MAX,
  GRID_LON_MIN,
  GRID_ROWS,
  getDeclinationForCoords,
} from '../declinationGrid';
import { DECLINATION_BY_CITY, getDeclination } from '../declination';
import { CITIES } from '@/panchang/locations';

describe('declination grid shape', () => {
  test('carries exactly one node per 1° over 6–38°N / 66–100°E', () => {
    expect(GRID_ROWS).toBe(33);
    expect(GRID_COLS).toBe(35);
    expect(DECLINATION_GRID_TENTHS).toHaveLength(GRID_ROWS * GRID_COLS);
    for (const value of DECLINATION_GRID_TENTHS) {
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  test('an exact node returns its own value; a midpoint bilinearly interpolates', () => {
    // Node (lat 23, lon 75): row 17, col 9.
    const node = DECLINATION_GRID_TENTHS[(23 - GRID_LAT_MIN) * GRID_COLS + (75 - GRID_LON_MIN)];
    expect(getDeclinationForCoords(23, 75)).toBeCloseTo(node / 10, 6);
    // The centre of the cell is the mean of its four corners.
    const corners = [
      [23, 75],
      [23, 76],
      [24, 75],
      [24, 76],
    ].map(([lat, lon]) => DECLINATION_GRID_TENTHS[(lat - GRID_LAT_MIN) * GRID_COLS + (lon - GRID_LON_MIN)]);
    const mean = corners.reduce((sum, v) => sum + v, 0) / 4 / 10;
    expect(getDeclinationForCoords(23.5, 75.5)).toBeCloseTo(mean, 6);
  });

  test('the box edges interpolate; outside stays null (silently magnetic)', () => {
    expect(getDeclinationForCoords(GRID_LAT_MAX, GRID_LON_MAX)).not.toBeNull();
    expect(getDeclinationForCoords(GRID_LAT_MIN, GRID_LON_MIN)).not.toBeNull();
    expect(getDeclinationForCoords(5.9, 75)).toBeNull();
    expect(getDeclinationForCoords(23, 100.1)).toBeNull();
    expect(getDeclinationForCoords(NaN, 75)).toBeNull();
    expect(getDeclinationForCoords(51.5, -0.1)).toBeNull(); // London stays magnetic
  });
});

describe('grid vs the per-city table (the oracle)', () => {
  test('every bundled city: |grid − table| ≤ 0.2°', () => {
    const breaches: string[] = [];
    for (const city of CITIES) {
      const table = DECLINATION_BY_CITY[city.id];
      expect(table).toBeDefined();
      const grid = getDeclinationForCoords(city.latitude, city.longitude);
      expect(grid).not.toBeNull();
      if (Math.abs((grid as number) - table) > 0.2) {
        breaches.push(`${city.id}: grid ${grid} vs table ${table}`);
      }
    }
    expect(breaches).toEqual([]);
  });

  test('getDeclination prefers coordinates, falls back to the city table, then null', () => {
    // Inside the box: the grid answers even for a cityId the table never knew.
    expect(getDeclination({ latitude: 23.1765, longitude: 75.7885, cityId: 'not-a-city' })).not.toBeNull();
    // Outside the box with a known city: the table answers.
    expect(getDeclination({ latitude: 51.5, longitude: -0.1, cityId: 'ujjain' })).toBe(
      DECLINATION_BY_CITY['ujjain']
    );
    // Outside the box, unknown city: silently magnetic.
    expect(getDeclination({ latitude: 51.5, longitude: -0.1, cityId: 'not-a-city' })).toBeNull();
  });
});
