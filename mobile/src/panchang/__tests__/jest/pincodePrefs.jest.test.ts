/**
 * The persistence half of the pincode tier.
 *
 * A stored CITY is rebuilt by looking its id up in the bundled list, so coordinates and
 * labels always match the running build. A stored PINCODE cannot be: the table is 700 KB
 * behind a lazy require in `pincodes.ts` specifically so it never lands on the launch path,
 * and `parseStoredLocation` IS the launch path. So a `pin-` record is self-describing on
 * disk and validated structurally instead — which is only safe if the validation is real.
 * These tests pin that it is, because the failure mode is silent: an unvalidated record
 * would put NaN coordinates into the engine, and a record rejected too eagerly would
 * quietly demote a user back to Ujjain on every relaunch.
 */
import { parseStoredLocation } from '@/panchang/panchangPrefs';
import { lookupPincode, toPincodeLocation } from '@/panchang/pincodes';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  multiGet: jest.fn(() => Promise.resolve([])),
}));

const KOLHAPUR = toPincodeLocation(lookupPincode('416001')!, 'pincode');

describe('parseStoredLocation: pincode records', () => {
  test('round-trips a stored pincode location unchanged', () => {
    const parsed = parseStoredLocation(JSON.stringify(KOLHAPUR));
    expect(parsed).toEqual(KOLHAPUR);
  });

  test('keeps a gps-sourced pincode marked as gps', () => {
    const viaGps = { ...KOLHAPUR, source: 'gps' as const };
    expect(parseStoredLocation(JSON.stringify(viaGps))?.source).toBe('gps');
  });

  test('normalises any other source to pincode', () => {
    const odd = { ...KOLHAPUR, source: 'city' };
    expect(parseStoredLocation(JSON.stringify(odd))?.source).toBe('pincode');
  });

  test('rejects a record missing its labels or coordinates', () => {
    for (const drop of ['labelHi', 'labelEn', 'latitude', 'longitude', 'elevation'] as const) {
      const broken: Record<string, unknown> = { ...KOLHAPUR };
      delete broken[drop];
      expect(parseStoredLocation(JSON.stringify(broken))).toBeNull();
    }
  });

  test('rejects non-finite and out-of-India coordinates', () => {
    const cases = [
      { ...KOLHAPUR, latitude: Number.NaN },
      { ...KOLHAPUR, longitude: Number.POSITIVE_INFINITY },
      { ...KOLHAPUR, latitude: 51.5 }, // London
      { ...KOLHAPUR, longitude: -0.12 },
      { ...KOLHAPUR, latitude: '16.6' },
    ];
    for (const record of cases) {
      expect(parseStoredLocation(JSON.stringify(record))).toBeNull();
    }
  });

  test('rejects a malformed pincode id rather than trusting the record', () => {
    // `pin-41600` is not a pincode id, so it falls through to the city lookup and misses.
    expect(parseStoredLocation(JSON.stringify({ ...KOLHAPUR, cityId: 'pin-41600' }))).toBeNull();
  });

  test('still rebuilds ordinary city records from the bundled list', () => {
    const stored = { cityId: 'ujjain', source: 'city', latitude: 0, longitude: 0, elevation: 0 };
    const parsed = parseStoredLocation(JSON.stringify(stored));
    // Coordinates come from the bundle, NOT from the stored zeros.
    expect(parsed?.cityId).toBe('ujjain');
    expect(parsed?.latitude).toBeGreaterThan(20);
    expect(parsed?.source).toBe('city');
  });

  test('returns null for absent and corrupt payloads', () => {
    expect(parseStoredLocation(null)).toBeNull();
    expect(parseStoredLocation('{not json')).toBeNull();
    expect(parseStoredLocation('{}')).toBeNull();
  });
});
