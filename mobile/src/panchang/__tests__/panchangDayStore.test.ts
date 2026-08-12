/**
 * The shared muhurat day store: an absolute-date-keyed, per-(city, calendar
 * system) cache bounded to 5 cities (LRU). These pin the user-visible contract:
 *   - a day is computed once and reused (no recompute for the same date),
 *   - keying is by absolute date (survives a day rollover),
 *   - at most 5 cities are held; a 6th evicts the LEAST-recently-used one only,
 *   - choosing a new city never evicts the others (until the cap forces it).
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { UJJAIN_GEO } from '../engine';
import {
  cachedDayInputs,
  dayStoreFor,
  dateKeyFor,
  scopeKeyFor,
  subscribePanchangEviction,
  panchangStoreScopes,
  __resetPanchangDayStore,
  MAX_CITIES,
} from '../panchangDayStore';

const opts = { calendarSystem: 'purnimant' as const, location: { ...UJJAIN_GEO, cityId: 'ujjain' } };

test('computes a day once, then reuses it by absolute date', () => {
  __resetPanchangDayStore();
  const map = dayStoreFor(scopeKeyFor(opts.location, 'purnimant'));
  const d = new Date(2026, 7, 20);
  const first = cachedDayInputs(map, d, opts);
  assert.equal(first.miss, true, 'first touch computes');
  const second = cachedDayInputs(map, new Date(2026, 7, 20), opts);
  assert.equal(second.miss, false, 'same absolute date is a cache hit');
  assert.equal(second.inputs, first.inputs, 'returns the identical cached object');
  assert.ok(map.has(dateKeyFor(d)));
});

test('scopeKeyFor separates cities, calendar systems, and cityId-less GPS points', () => {
  const uj = { cityId: 'ujjain', latitude: 23.18, longitude: 75.79 };
  const dl = { cityId: 'delhi', latitude: 28.61, longitude: 77.21 };
  assert.notEqual(scopeKeyFor(uj, 'purnimant'), scopeKeyFor(dl, 'purnimant'));
  assert.notEqual(scopeKeyFor(uj, 'purnimant'), scopeKeyFor(uj, 'amanta'));
  // Two DIFFERENT GPS points with no cityId must NOT share a scope (the aliasing bug).
  const gpsA = { latitude: 19.07, longitude: 72.88 };
  const gpsB = { latitude: 13.08, longitude: 80.27 };
  assert.notEqual(scopeKeyFor(gpsA, 'purnimant'), scopeKeyFor(gpsB, 'purnimant'));
});

test('holds at most 5 cities; a 6th evicts the least-recently-used only', () => {
  __resetPanchangDayStore();
  const evicted: string[] = [];
  const unsub = subscribePanchangEviction((s) => evicted.push(s));

  for (let i = 1; i <= MAX_CITIES; i += 1) dayStoreFor(`city${i}:purnimant`);
  assert.equal(panchangStoreScopes().length, 5);

  // Touch city1 so it becomes most-recently-used; city2 is now the LRU.
  dayStoreFor('city1:purnimant');
  // A 6th city forces exactly one eviction — city2, not the freshly-touched city1.
  dayStoreFor('city6:purnimant');

  assert.deepEqual(evicted, ['city2:purnimant'], 'evicted exactly the LRU city');
  const scopes = panchangStoreScopes();
  assert.equal(scopes.length, 5, 'still capped at 5');
  assert.ok(scopes.includes('city1:purnimant'), 'the recently-used city survived');
  assert.ok(scopes.includes('city6:purnimant'), 'the new city is held');
  assert.ok(!scopes.includes('city2:purnimant'), 'only the LRU city was dropped');
  unsub();
});

test('choosing a new city does not evict others while under the cap', () => {
  __resetPanchangDayStore();
  dayStoreFor('a:purnimant');
  dayStoreFor('b:purnimant');
  dayStoreFor('c:purnimant'); // new city, still under 5
  assert.deepEqual(panchangStoreScopes().sort(), ['a:purnimant', 'b:purnimant', 'c:purnimant']);
});
