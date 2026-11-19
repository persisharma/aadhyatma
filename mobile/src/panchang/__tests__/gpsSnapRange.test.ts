/**
 * "Use my location" must not move a phone that is abroad into India.
 *
 * Every Panchang place is Indian and the GPS snap had no distance limit, so a
 * phone in London or New Jersey was silently stored as the nearest Indian
 * pincode and every date was computed for it.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_GPS_SNAP_KM, distanceKm, snapToNearestLocation, snapToNearestLocationInRange } from '../pincodes';

const ABROAD: [string, number, number][] = [
  ['New York', 40.7128, -74.006],
  ['San Francisco', 37.7749, -122.4194],
  ['London', 51.5074, -0.1278],
  ['Dubai', 25.2048, 55.2708],
  ['Singapore', 1.3521, 103.8198],
  ['Sydney', -33.8688, 151.2093],
];

// The corners and the known sparse regions of India, plus an ordinary town.
const IN_INDIA: [string, number, number][] = [
  ['Kolhapur', 16.705, 74.2433],
  ['Srinagar', 34.0837, 74.7973],
  ['Leh', 34.1526, 77.5771],
  ['Port Blair', 11.6234, 92.7265],
  ['Kavaratti', 10.5593, 72.6358],
  ['Tawang', 27.5861, 91.8594],
  ['Kanyakumari', 8.0883, 77.5385],
  ['Bhuj', 23.242, 69.6669],
];

test('haversine distance is right to within a km on a known pair', () => {
  // Delhi → Mumbai is ~1,150 km.
  const d = distanceKm(28.6139, 77.209, 19.076, 72.8777);
  assert.ok(d > 1130 && d < 1170, `Delhi–Mumbai ${d.toFixed(0)} km`);
});

for (const [name, lat, lng] of ABROAD) {
  test(`${name} is refused — it is not near any Indian place`, () => {
    const unlimited = snapToNearestLocation(lat, lng);
    const away = distanceKm(lat, lng, unlimited.latitude, unlimited.longitude);
    assert.ok(away > MAX_GPS_SNAP_KM, `${name} is ${away.toFixed(0)} km from ${unlimited.labelEn}`);
    assert.equal(snapToNearestLocationInRange(lat, lng), null);
  });
}

for (const [name, lat, lng] of IN_INDIA) {
  test(`${name} still snaps, to exactly the place the unlimited snap chooses`, () => {
    const snapped = snapToNearestLocationInRange(lat, lng);
    assert.ok(snapped, `${name} was refused`);
    assert.deepEqual(snapped, snapToNearestLocation(lat, lng));
    assert.ok(distanceKm(lat, lng, snapped.latitude, snapped.longitude) <= MAX_GPS_SNAP_KM);
  });
}
