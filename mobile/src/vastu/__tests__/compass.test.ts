/**
 * दिशा चक्र heading math (PRD-24, RULEBOOK §22.10). The wrap smoothing and the
 * sector boundaries are the regression-prone spots — every rule here is pinned
 * with explicit degrees, not derived expectations.
 */
import { DISHA_ORDER } from '@/panchang/eventMuhurat';
import {
  ALL_DIK,
  FIELD_MAX_UT,
  FIELD_MIN_UT,
  applyDeclination,
  dikCenterDegrees,
  dikForHeading,
  fieldMagnitude,
  headingFromSample,
  isFieldPlausible,
  normalizeHeading,
  smoothHeading,
} from '../compass';

describe('normalizeHeading', () => {
  test('wraps negatives and over-rotations into [0, 360)', () => {
    expect(normalizeHeading(0)).toBe(0);
    expect(normalizeHeading(-90)).toBe(270);
    expect(normalizeHeading(450)).toBe(90);
    expect(normalizeHeading(360)).toBe(0);
    expect(normalizeHeading(-360)).toBe(0);
  });
});

describe('headingFromSample (flat portrait, device axes +X right / +Y top)', () => {
  test('top edge to magnetic north → 0°: horizontal field along +Y', () => {
    expect(headingFromSample({ x: 0, y: 30, z: -20 })).toBeCloseTo(0, 5);
  });
  test('top edge east → 90°: field appears along −X', () => {
    expect(headingFromSample({ x: -30, y: 0, z: -20 })).toBeCloseTo(90, 5);
  });
  test('top edge south → 180°: field along −Y', () => {
    expect(headingFromSample({ x: 0, y: -30, z: -20 })).toBeCloseTo(180, 5);
  });
  test('top edge west → 270°: field along +X', () => {
    expect(headingFromSample({ x: 30, y: 0, z: -20 })).toBeCloseTo(270, 5);
  });
});

describe('smoothHeading', () => {
  test('first sample passes through unchanged', () => {
    expect(smoothHeading(null, 123.4)).toBeCloseTo(123.4, 5);
  });
  test('steps the SHORT way through north: 358° → 2° moves forward, not back around', () => {
    // delta = +4 → 358 + 0.25·4 = 359, never 358 → 269 territory.
    expect(smoothHeading(358, 2, 0.25)).toBeCloseTo(359, 5);
  });
  test('and the mirror crossing: 2° → 358° steps back through north', () => {
    expect(smoothHeading(2, 358, 0.25)).toBeCloseTo(1, 5);
  });
  test('plain in-range smoothing', () => {
    expect(smoothHeading(100, 120, 0.25)).toBeCloseTo(105, 5);
  });
});

describe('dikForHeading — 45° sectors centred on the dik', () => {
  test('north owns [337.5, 22.5)', () => {
    expect(dikForHeading(0)).toBe('north');
    expect(dikForHeading(22.4)).toBe('north');
    expect(dikForHeading(337.5)).toBe('north');
    expect(dikForHeading(359.9)).toBe('north');
  });
  test('sector boundaries hand over exactly at 22.5°', () => {
    expect(dikForHeading(22.5)).toBe('northeast');
    expect(dikForHeading(67.4)).toBe('northeast');
    expect(dikForHeading(67.5)).toBe('east');
  });
  test('all eight centres map to themselves', () => {
    for (const dik of DISHA_ORDER) {
      expect(dikForHeading(dikCenterDegrees(dik))).toBe(dik);
    }
  });
  test('cardinal centres are the compass degrees', () => {
    expect(dikCenterDegrees('north')).toBe(0);
    expect(dikCenterDegrees('east')).toBe(90);
    expect(dikCenterDegrees('south')).toBe(180);
    expect(dikCenterDegrees('west')).toBe(270);
    expect(dikCenterDegrees('southeast')).toBe(135);
  });
});

describe('applyDeclination (east-positive, WMM convention)', () => {
  test('true = magnetic + declination, wrapped', () => {
    expect(applyDeclination(359, 2)).toBeCloseTo(1, 5);
    expect(applyDeclination(10, -1.7)).toBeCloseTo(8.3, 5);
  });
  test('null declination (unknown city) silently stays magnetic — never invents a value', () => {
    expect(applyDeclination(123.4, null)).toBeCloseTo(123.4, 5);
  });
});

describe('field plausibility (the honest-accuracy band)', () => {
  test('magnitude is the vector norm', () => {
    expect(fieldMagnitude({ x: 3, y: 4, z: 12 })).toBeCloseTo(13, 5);
  });
  test('Earth-plausible readings pass, rebar/appliance readings fail', () => {
    expect(isFieldPlausible({ x: 0, y: 45, z: 0 })).toBe(true);
    expect(isFieldPlausible({ x: 0, y: FIELD_MIN_UT, z: 0 })).toBe(true);
    expect(isFieldPlausible({ x: 0, y: FIELD_MAX_UT, z: 0 })).toBe(true);
    expect(isFieldPlausible({ x: 0, y: 10, z: 0 })).toBe(false);
    expect(isFieldPlausible({ x: 0, y: 200, z: 0 })).toBe(false);
  });
});

test('the module exposes the shared dik vocabulary, not a second enum', () => {
  expect(ALL_DIK).toBe(DISHA_ORDER);
});
