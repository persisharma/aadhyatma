import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cachedMoonHorizon, computeMoonHorizon, moonHorizonKey, moonHorizonState, type MoonHorizon } from '../moonHorizon';

const ujjain = { latitude: 23.1765, longitude: 75.7885, elevation: 494 };
const time = (iso: string) => new Date(iso);

test('Krishna Paksha moon rises after sunset and stays up across midnight', () => {
  const start = time('2026-10-28T17:51:00+05:30');
  const data = computeMoonHorizon(start, ujjain);
  assert.ok(data.nightRise && data.nextSet);
  assert.ok(data.nightRise > start);
  assert.ok(data.nightRise < time('2026-10-29T06:30:00+05:30'));
  assert.equal(moonHorizonState(data, data.nightRise.getTime() - 1), 'not-risen');
  assert.equal(moonHorizonState(data, data.nightRise.getTime()), 'above');
  assert.equal(moonHorizonState(data, time('2026-10-29T02:00:00+05:30').getTime()), 'above');
  assert.equal(moonHorizonState(data, data.nextSet.getTime()), 'set');
});

test('waxing moon already above at sunset disappears after its nighttime set', () => {
  const start = time('2026-10-19T18:00:00+05:30');
  const data = computeMoonHorizon(start, ujjain);
  assert.ok(data.nightRise && data.nextSet);
  assert.ok(data.nightRise < start);
  assert.equal(moonHorizonState(data, start.getTime()), 'above');
  assert.ok(data.nextSet < time('2026-10-20T06:30:00+05:30'));
  assert.equal(moonHorizonState(data, data.nextSet.getTime()), 'set');
});

test('late Krishna Paksha rise after midnight belongs to the active night', () => {
  const start = time('2026-11-03T17:45:00+05:30');
  const data = computeMoonHorizon(start, ujjain);
  assert.ok(data.nightRise);
  assert.ok(data.nightRise > time('2026-11-04T00:00:00+05:30'));
  assert.equal(moonHorizonState(data, time('2026-11-03T23:00:00+05:30').getTime()), 'not-risen');
  assert.equal(moonHorizonState(data, data.nightRise.getTime() + 60000), 'above');
});

test('cache includes exact location/elevation and reuses the same night solve', () => {
  const start = time('2026-10-28T17:51:00+05:30');
  const first = computeMoonHorizon(start, ujjain);
  assert.equal(cachedMoonHorizon(moonHorizonKey(start, ujjain)), first);
  assert.equal(computeMoonHorizon(start, ujjain), first);
  assert.notEqual(moonHorizonKey(start, ujjain), moonHorizonKey(start, { ...ujjain, latitude: 23.177 }));
  assert.notEqual(moonHorizonKey(start, ujjain), moonHorizonKey(start, { ...ujjain, elevation: 500 }));
});

test('missing or high-latitude events do not create a false rise or above-horizon state', () => {
  const absent: MoonHorizon = { previousRise: null, previousSet: null, nextRise: null, nextSet: null, nightRise: null };
  assert.equal(moonHorizonState(absent, Date.now()), 'unavailable');
  assert.equal(moonHorizonState(null, Date.now()), 'unavailable');
});
