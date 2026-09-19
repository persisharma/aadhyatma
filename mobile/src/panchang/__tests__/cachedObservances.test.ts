import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  getCachedObservancesForDate,
  getObservancesForDate,
} from '../festivalEngine';

// getCachedObservancesForDate is the render-path-safe seed for the Home Today strip:
// it must return the SAME observances getObservancesForDate would for anything already
// synchronous, and null for anything that would need the multi-second live scan — so
// the chips paint on the first frame without ever freezing the launch.

test('precomputed Ujjain year seeds identically to the deferred resolve', () => {
  // 2026 is inside the precomputed table (purnimant:2024–2031) — a real vrat day.
  const day = new Date(2026, 8, 18); // Fri 18 Sep 2026 — inside Pitru Paksha
  const seed = getCachedObservancesForDate(day, 'purnimant');
  const deferred = getObservancesForDate(day, 'purnimant');
  assert.notEqual(seed, null, 'a precomputed Ujjain year must seed synchronously');
  assert.deepEqual(
    seed!.map((o) => o.rule.id).sort(),
    deferred.map((o) => o.rule.id).sort()
  );
});

test('an empty precomputed day still seeds (a valid empty answer, not a miss)', () => {
  // Some civil days genuinely carry no default observance; the seed must be [] (a
  // definitive answer), never null, so the strip does not needlessly defer.
  const seed = getCachedObservancesForDate(new Date(2026, 0, 2), 'purnimant');
  assert.notEqual(seed, null);
  assert.ok(Array.isArray(seed));
});

test('a non-precomputed Ujjain year returns null so the caller defers the live scan', () => {
  // 2045 is well past the precomputed range and untouched by other suites, so it is
  // neither cached nor baked — the ONLY answer is a live scan, which must not run here.
  const seed = getCachedObservancesForDate(new Date(2045, 5, 1), 'purnimant');
  assert.equal(seed, null);
});

test('amanta is precomputed too, so it seeds identically to the deferred resolve', () => {
  // Both calendar systems are baked in the supported range (amanta:2024–2031), so the
  // amanta seed must match its deferred resolve, never fall back to a live scan.
  const day = new Date(2028, 3, 10);
  const seed = getCachedObservancesForDate(day, 'amanta');
  const deferred = getObservancesForDate(day, 'amanta');
  assert.notEqual(seed, null);
  assert.deepEqual(
    seed!.map((o) => o.rule.id).sort(),
    deferred.map((o) => o.rule.id).sort()
  );
});

test('an unknown city with no stored scan falls back to the Ujjain precomputed table', () => {
  // Before a city's background scan lands, the strip should still show the Ujjain-wide
  // dates (correct for bundled cities but rare tithi-boundary edges) — never null.
  const day = new Date(2026, 8, 18);
  const seed = getCachedObservancesForDate(day, 'purnimant', {
    latitude: 19.076,
    longitude: 72.8777,
    elevation: 14,
    cityId: 'mumbai',
  });
  const ujjain = getCachedObservancesForDate(day, 'purnimant');
  assert.notEqual(seed, null);
  assert.deepEqual(
    seed!.map((o) => o.rule.id).sort(),
    ujjain!.map((o) => o.rule.id).sort()
  );
});
