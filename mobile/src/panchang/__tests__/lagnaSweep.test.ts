/**
 * Lagna sweep (PRD-16/P3 §4.1, §10) — span boundaries, tiling, and external
 * agreement.
 *
 * External anchor: the committed 150-chart Swiss Ephemeris corpus
 * (kundali-swiss-ephemeris-150.json — independent SIDM_LAHIRI lagna
 * longitudes, NOT captured from this engine). `lagnaAt(spans, instant)` must
 * land on the Swiss rashi for every chart, which validates both the
 * closed-form ascendant and the time-bisection at once. A published per-city
 * daily lagna table (DrikPanchang prints one) remains owed to the §10 content
 * review — this environment had no content egress; do NOT substitute engine
 * output for it (standing gotcha).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { lagnaSpansForDay, lagnaAt } from '../lagnaSweep';
import { ascendantSiderealLongitude, computeLagna } from '../kundali';
import { computePanchangForDate, sunriseForDate, UJJAIN_GEO } from '../engine';

type Corpus = {
  locations: { id: string; latitude: number; longitude: number; elevation: number }[];
  instants: { id: string; dateUtc: string; expected: { lagnaByCity: Record<string, number> } }[];
};
const corpus = JSON.parse(
  readFileSync(join(import.meta.dirname, 'fixtures/kundali-swiss-ephemeris-150.json'), 'utf8')
) as Corpus;

const CITIES = [
  { id: 'ujjain', latitude: 23.1765, longitude: 75.7885 },
  { id: 'delhi', latitude: 28.6139, longitude: 77.209 },
  { id: 'thiruvananthapuram', latitude: 8.5241, longitude: 76.9366 },
];
// Solstices included deliberately — the day arc is at its most asymmetric.
const DATES = [new Date(2026, 2, 20), new Date(2026, 5, 21), new Date(2026, 8, 23), new Date(2026, 11, 21)];

function spansFor(city: { latitude: number; longitude: number }, d: Date) {
  const opts = { location: { ...city, elevation: 0 } };
  const p = computePanchangForDate(d, opts);
  const next = sunriseForDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1), opts);
  return { p, next, spans: lagnaSpansForDay(p.sunrise, next, city.latitude, city.longitude) };
}

test('spans tile [sunrise, nextSunrise) exactly, 12–13 spans, rashi monotonic mod 12', () => {
  for (const city of CITIES) {
    for (const d of DATES) {
      const { p, next, spans } = spansFor(city, d);
      const label = `${city.id} ${d.toDateString()}`;
      assert.ok(spans.length === 12 || spans.length === 13, `${label}: ${spans.length} spans`);
      assert.equal(spans[0].start.getTime(), p.sunrise.getTime(), `${label}: first span starts at sunrise`);
      assert.equal(spans[spans.length - 1].end.getTime(), next.getTime(), `${label}: last span ends at next sunrise`);
      for (let i = 1; i < spans.length; i += 1) {
        assert.equal(spans[i].start.getTime(), spans[i - 1].end.getTime(), `${label}: gap at span ${i}`);
        assert.equal(spans[i].rashiIndex, (spans[i - 1].rashiIndex + 1) % 12, `${label}: rashi order at span ${i}`);
      }
    }
  }
});

test('every internal boundary sits on a 30° ascendant crossing (< 1 min resolution)', () => {
  for (const city of CITIES) {
    const { spans } = spansFor(city, DATES[0]);
    for (const span of spans.slice(1)) {
      const before = ascendantSiderealLongitude(new Date(span.start.getTime() - 60_000), city.latitude, city.longitude);
      const at = ascendantSiderealLongitude(new Date(span.start.getTime() + 60_000), city.latitude, city.longitude);
      assert.notEqual(Math.floor(before / 30), Math.floor(at / 30), `${city.id}: no crossing within ±1 min of ${span.start.toISOString()}`);
      assert.equal(Math.floor(at / 30) % 12, span.rashiIndex, `${city.id}: span rashi disagrees with the ascendant just past its start`);
    }
  }
});

test('lagnaAt agrees with the Swiss Ephemeris corpus rashi for all 150 charts', () => {
  let checked = 0;
  for (const instant of corpus.instants) {
    const t = new Date(instant.dateUtc);
    for (const loc of corpus.locations) {
      const expected = Math.floor(instant.expected.lagnaByCity[loc.id] / 30) % 12;
      // Any [t0, t1) bracket works — the sweep needs no real sunrise, so a
      // ±2 h window keeps the corpus check location-cheap.
      const spans = lagnaSpansForDay(
        new Date(t.getTime() - 2 * 3600_000),
        new Date(t.getTime() + 2 * 3600_000),
        loc.latitude,
        loc.longitude
      );
      assert.equal(lagnaAt(spans, t), expected, `${instant.id} @ ${loc.id}`);
      checked += 1;
    }
  }
  assert.equal(checked, 150, 'the whole corpus must be swept');
});

test('closed-form ascendant equals computeLagna (the corpus-verified solver) at arbitrary instants', () => {
  for (const loc of corpus.locations.slice(0, 5)) {
    for (let i = 0; i < 24; i += 1) {
      const t = new Date(Date.UTC(2026, i % 12, 3 + i, (i * 7) % 24, (i * 13) % 60));
      const viaBisection = computeLagna({ date: t, latitude: loc.latitude, longitude: loc.longitude, timezone: 'Asia/Kolkata' });
      const closed = ascendantSiderealLongitude(t, loc.latitude, loc.longitude);
      const diff = Math.abs(((viaBisection - closed + 540) % 360) - 180);
      assert.ok(diff < 1e-6, `${loc.id} ${t.toISOString()}: ${diff}°`);
    }
  }
});

test('degenerate day (nextSunrise <= sunrise) yields no spans; lagnaAt degrades to -1', () => {
  const t = new Date(2026, 0, 1, 7);
  assert.deepEqual(lagnaSpansForDay(t, t, UJJAIN_GEO.latitude, UJJAIN_GEO.longitude), []);
  assert.equal(lagnaAt([], t), -1);
});

test('lagnaSweep source stays pure: no wall clock, randomness, network, storage, or React', async () => {
  const { resolve, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../lagnaSweep.ts'), 'utf8');
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
  // The one declared astronomy primitive is the kundali ascendant.
  assert.doesNotMatch(source, /astronomy-engine/);
});
