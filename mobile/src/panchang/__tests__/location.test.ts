import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePanchangForDate, computeTithiAndMonth, locationKey, UJJAIN_GEO } from '../engine';
import {
  isObservanceDataReady,
  resolveObservancesForYear,
  resolveObservancesForYearLive,
  resolveObservancesForYearLiveChunked,
} from '../festivalEngine';
import {
  CITIES,
  DEFAULT_LOCATION,
  MAJOR_CITIES,
  cityMatchesQuery,
  getCityById,
  nearestCity,
  toPanchangLocation,
} from '../locations';
import { RAJASTHAN_TEHSILS } from '../rajasthanTehsils';
import { setStoredObservanceYear, subscribeObservanceStore } from '../observanceStore';

const DELHI = { latitude: 28.6139, longitude: 77.209, elevation: 216, cityId: 'delhi' };
const GUWAHATI = { latitude: 26.1445, longitude: 91.7362, elevation: 55, cityId: 'guwahati' };

// Engine sunrise/sunset are true UTC instants; expected times are Indian wall-clock
// (IST). Read the instant in Asia/Kolkata so assertions are independent of the test
// runner's timezone (CI runs in UTC).
const IST_HM = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
});
function istHourMin(d: Date): { h: number; m: number } {
  const parts = IST_HM.formatToParts(d);
  return {
    h: Number(parts.find((p) => p.type === 'hour')!.value),
    m: Number(parts.find((p) => p.type === 'minute')!.value),
  };
}

function assertTimeWithin(actual: Date | null, expectedHour: number, expectedMin: number, toleranceMin: number, label: string) {
  assert.ok(actual, `${label}: expected a Date but got null`);
  const { h, m } = istHourMin(actual);
  const actualMin = h * 60 + m;
  const expectedTotalMin = expectedHour * 60 + expectedMin;
  const diff = Math.abs(actualMin - expectedTotalMin);
  assert.ok(
    diff <= toleranceMin || diff >= (1440 - toleranceMin),
    `${label}: expected ~${expectedHour}:${String(expectedMin).padStart(2, '0')}, got ${h}:${String(m).padStart(2, '0')} (diff ${diff} min, tolerance ${toleranceMin})`
  );
}

test('omitted location ≡ explicit Ujjain', () => {
  const date = new Date(2026, 0, 14);
  const def = computePanchangForDate(date);
  const ujjain = computePanchangForDate(date, { location: { ...UJJAIN_GEO, cityId: 'ujjain' } });
  assert.equal(def.sunrise.getTime(), ujjain.sunrise.getTime(), 'sunrise');
  assert.equal(def.sunset.getTime(), ujjain.sunset.getTime(), 'sunset');
  assert.equal(def.tithi.index, ujjain.tithi.index, 'tithi');
  assert.equal(def.nakshatra.index, ujjain.nakshatra.index, 'nakshatra');
});

test('Delhi sunrise/sunset differ from Ujjain (14 Jan 2026, vs drikpanchang Delhi)', () => {
  const date = new Date(2026, 0, 14);
  const delhi = computePanchangForDate(date, { location: DELHI });
  assertTimeWithin(delhi.sunrise, 7, 15, 10, 'Delhi sunrise');
  assertTimeWithin(delhi.sunset, 17, 45, 10, 'Delhi sunset');
  const ujjain = computePanchangForDate(date);
  assert.notEqual(delhi.sunrise.getTime(), ujjain.sunrise.getTime(), 'Delhi ≠ Ujjain sunrise');
});

test('Guwahati sunrise ~1 h earlier than Ujjain (14 Jan 2026)', () => {
  const date = new Date(2026, 0, 14);
  const guwahati = computePanchangForDate(date, { location: GUWAHATI });
  assertTimeWithin(guwahati.sunrise, 6, 12, 10, 'Guwahati sunrise');
  const ujjain = computePanchangForDate(date);
  const diffMin = (ujjain.sunrise.getTime() - guwahati.sunrise.getTime()) / 60000;
  assert.ok(diffMin > 40 && diffMin < 80, `expected 40–80 min earlier, got ${diffMin.toFixed(1)}`);
});

test('Brahma Muhurta tracks the location-specific sunrise', () => {
  const p = computePanchangForDate(new Date(2026, 4, 22), { location: GUWAHATI });
  const diffStart = (p.sunrise.getTime() - p.brahmaMuhurta.start.getTime()) / 60000;
  assert.ok(Math.abs(diffStart - 96) <= 2, `BM start ~96 min before sunrise, got ${diffStart.toFixed(1)}`);
});

test('computeTithiAndMonth cache isolates locations', () => {
  const date = new Date(2026, 2, 3);
  const ujjainFirst = computeTithiAndMonth(date);
  const delhi = computeTithiAndMonth(date, { location: DELHI });
  const ujjainAgain = computeTithiAndMonth(date);
  // Same-day repeat for the default must return the Ujjain value, not Delhi's
  // (regression for the location-aware cache key).
  assert.deepEqual(ujjainAgain, ujjainFirst, 'Ujjain result stable after Delhi computation');
  assert.ok(delhi.tithiIndex >= 0 && delhi.tithiIndex <= 29, 'valid Delhi tithi');
});

test('locationKey: undefined ⇒ ujjain; cityId preferred; coords fallback', () => {
  assert.equal(locationKey(undefined), 'ujjain');
  assert.equal(locationKey(DELHI), 'delhi');
  assert.equal(locationKey({ latitude: 11.5, longitude: 76.25 }), '11.50,76.25');
});

test('city list: unique ids, Ujjain first as default', () => {
  const ids = new Set(CITIES.map((c) => c.id));
  assert.equal(ids.size, CITIES.length, 'no duplicate city ids');
  assert.equal(CITIES[0].id, 'ujjain');
  assert.equal(DEFAULT_LOCATION.cityId, 'ujjain');
  assert.equal(DEFAULT_LOCATION.source, 'default');
});

test('city list is two tiers: national cities first, then Rajasthan tehsils', () => {
  assert.deepEqual(CITIES, [...MAJOR_CITIES, ...RAJASTHAN_TEHSILS]);
  // The picker splits the list at the first entry carrying a district, so every
  // national entry must be district-less and every tehsil must carry one.
  assert.ok(MAJOR_CITIES.every((c) => !c.districtEn && !c.districtHi), 'no districts on national tier');
  assert.ok(
    RAJASTHAN_TEHSILS.every((c) => !!c.districtEn && !!c.districtHi),
    'every tehsil names its district in both scripts'
  );
});

test('Rajasthan tehsils: prefixed ids, all 33 districts, coordinates inside the state', () => {
  assert.ok(RAJASTHAN_TEHSILS.length > 300, `expected 300+ tehsils, got ${RAJASTHAN_TEHSILS.length}`);
  assert.ok(RAJASTHAN_TEHSILS.every((c) => c.id.startsWith('rj-')), 'ids are rj-prefixed');
  assert.equal(new Set(RAJASTHAN_TEHSILS.map((c) => c.districtEn)).size, 33, '33 revenue districts');
  for (const c of RAJASTHAN_TEHSILS) {
    assert.ok(
      c.latitude >= 23 && c.latitude <= 30.4 && c.longitude >= 69.4 && c.longitude <= 78.4,
      `${c.nameEn} (${c.latitude}, ${c.longitude}) is outside Rajasthan`
    );
    assert.ok(c.elevation >= 0 && c.elevation <= 1800, `${c.nameEn} elevation ${c.elevation} out of range`);
    assert.ok(c.nameHi.length > 0 && /[ऀ-ॿ]/.test(c.nameHi), `${c.nameEn} lacks a Devanagari name`);
  }
});

test('Rajasthan tehsils: no two share a coordinate (would mean a bad geocode)', () => {
  const seen = new Map<string, string>();
  for (const c of RAJASTHAN_TEHSILS) {
    const key = `${c.latitude},${c.longitude}`;
    assert.equal(seen.get(key), undefined, `${c.nameEn} shares ${key} with ${seen.get(key)}`);
    seen.set(key, c.nameEn);
  }
});

test('cityMatchesQuery matches name in either script, and a tehsil by its district', () => {
  const jaipur = getCityById('jaipur')!;
  assert.equal(cityMatchesQuery(jaipur, ''), true, 'empty query matches everything');
  assert.equal(cityMatchesQuery(jaipur, 'JAIP'), true, 'case-insensitive English');
  assert.equal(cityMatchesQuery(jaipur, 'जयपु'), true, 'Hindi');
  assert.equal(cityMatchesQuery(jaipur, 'kochi'), false);

  const tehsil = getCityById('rj-mount-abu')!;
  assert.equal(tehsil.districtEn, 'Sirohi');
  assert.equal(cityMatchesQuery(tehsil, 'sirohi'), true, 'found by district');
  assert.equal(cityMatchesQuery(tehsil, 'सिरोही'), true, 'found by district in Hindi');
});

test('nearestCity snaps GPS coordinates to the expected city', () => {
  assert.equal(nearestCity(28.7, 77.1).id, 'delhi');
  assert.equal(nearestCity(19.2, 72.97).id, 'mumbai', 'Thane → Mumbai');
  assert.equal(nearestCity(23.18, 75.79).id, 'ujjain');
  assert.equal(nearestCity(25.59, 85.14).id, 'patna');
});

test('nearestCity resolves inside Rajasthan at tehsil granularity', () => {
  // Before the tehsil tier every one of these snapped to Jaipur, Ajmer or Jodhpur.
  assert.equal(nearestCity(24.5925, 72.7156).id, 'rj-mount-abu', 'Mount Abu');
  assert.equal(nearestCity(27.28, 75.2).id, 'rj-dantaramgarh', 'Danta Ramgarh, Sikar');
  assert.equal(nearestCity(24.88, 74.63).id, 'rj-chittorgarh', 'Chittorgarh');
  assert.equal(nearestCity(28.02, 73.31).id, 'rj-bikaner', 'Bikaner');
  assert.equal(nearestCity(26.92, 71.92).id, 'rj-pokaran', 'Pokaran');
});

test('non-Ujjain location falls back to Ujjain observances until store fills, then upgrades', async () => {
  const year = 2026;
  const ujjainDates = resolveObservancesForYear(year, 'purnimant');
  assert.ok(ujjainDates.length > 0, 'precomputed Ujjain year present');

  const kochi = getCityById('kochi');
  assert.ok(kochi);
  const location = toPanchangLocation(kochi, 'city');

  assert.equal(isObservanceDataReady(year, 'purnimant', location), false, 'not ready before store fills');
  const fallback = resolveObservancesForYear(year, 'purnimant', location);
  assert.deepEqual(
    fallback.map((o) => [o.rule.id, o.date.getTime()]),
    ujjainDates.map((o) => [o.rule.id, o.date.getTime()]),
    'fallback equals Ujjain dates'
  );

  let notified = false;
  const unsubscribe = subscribeObservanceStore(() => {
    notified = true;
  });
  setStoredObservanceYear('kochi', 'purnimant', year, [{ id: 'diwali', date: '2026-11-09' }]);
  unsubscribe();
  assert.ok(notified, 'store notifies subscribers');
  assert.equal(isObservanceDataReady(year, 'purnimant', location), true, 'ready after store fills');
  const upgraded = resolveObservancesForYear(year, 'purnimant', location);
  assert.equal(upgraded.length, 1, 'stored entries take over from the fallback');
  assert.equal(upgraded[0].rule.id, 'diwali');
});

test('chunked live scan matches the sync live scan (Delhi 2026)', { timeout: 300000 }, async () => {
  const chunked = await resolveObservancesForYearLiveChunked(2026, 'purnimant', DELHI);
  const sync = resolveObservancesForYearLive(2026, 'purnimant', DELHI);
  assert.deepEqual(
    chunked.map((o) => [o.rule.id, o.date.getTime()]),
    sync.map((o) => [o.rule.id, o.date.getTime()]),
    'chunked ≡ sync results'
  );
  assert.ok(chunked.length >= 30, `expected a full festival year, got ${chunked.length}`);
});
