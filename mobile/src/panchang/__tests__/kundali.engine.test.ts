import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import fixtures from './fixtures/kundali-swiss-ephemeris.json';
import {
  buildKundaliInsights,
  computeKundali,
  computeRashifal,
  computeVimshottariDasha,
  computeWholeSignHouses,
  DASHA_ORDER,
  DASHA_YEARS,
  getCurrentDasha,
  GRAHA_ORDER,
  type Graha,
  type KundaliInput,
} from '../kundali';

type GoldenFixture = {
  id: string;
  dateUtc: string;
  latitude: number;
  longitude: number;
  elevation: number;
  expected: {
    ayanamsa: number;
    lagna: number;
    grahas: Record<Graha, number>;
  };
};

function angularDifference(actual: number, expected: number): number {
  return Math.abs(((actual - expected + 540) % 360) - 180);
}

function assertAngleWithin(
  actual: number,
  expected: number,
  tolerance: number,
  label: string
): void {
  const difference = angularDifference(actual, expected);
  assert.ok(
    difference <= tolerance,
    `${label}: expected ${expected.toFixed(6)}°, got ${actual.toFixed(6)}° `
      + `(difference ${difference.toFixed(6)}°, tolerance ${tolerance}°)`
  );
}

function inputFor(fixture: GoldenFixture): KundaliInput {
  return {
    date: new Date(fixture.dateUtc),
    latitude: fixture.latitude,
    longitude: fixture.longitude,
    elevation: fixture.elevation,
    timezone: 'Asia/Kolkata',
  };
}

for (const rawFixture of fixtures) {
  const fixture = rawFixture as GoldenFixture;
  test(`${fixture.id} matches independent Swiss Ephemeris Lahiri fixture`, () => {
    const chart = computeKundali(inputFor(fixture));

    assertAngleWithin(chart.ayanamsa, fixture.expected.ayanamsa, 0.03, 'ayanamsa');
    assertAngleWithin(chart.lagnaLongitude, fixture.expected.lagna, 0.15, 'Lagna');
    for (const graha of GRAHA_ORDER) {
      const position = chart.grahas.find((candidate) => candidate.graha === graha);
      assert.ok(position, `${graha} position exists`);
      assertAngleWithin(
        position.siderealLongitude,
        fixture.expected.grahas[graha],
        0.10,
        graha
      );
      assert.ok(position.rashiIndex >= 0 && position.rashiIndex <= 11);
      assert.ok(position.house >= 1 && position.house <= 12);
      assert.ok(position.nakshatraIndex >= 0 && position.nakshatraIndex <= 26);
      assert.ok(position.pada >= 1 && position.pada <= 4);
    }
  });
}

test('whole-sign houses rotate exactly from the Lagna sign', () => {
  assert.deepEqual(computeWholeSignHouses(0), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.deepEqual(computeWholeSignHouses(10), [10, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  assert.throws(() => computeWholeSignHouses(12), /Invalid Lagna/);
});

test('Rahu and Ketu are exactly opposite and all nine grahas are present', () => {
  const chart = computeKundali(inputFor(fixtures[0] as GoldenFixture));
  assert.deepEqual(chart.grahas.map((position) => position.graha), GRAHA_ORDER);
  const rahu = chart.grahas.find((position) => position.graha === 'rahu')!;
  const ketu = chart.grahas.find((position) => position.graha === 'ketu')!;
  assertAngleWithin(ketu.siderealLongitude, rahu.siderealLongitude + 180, 1e-9, 'node axis');
});

test('Vimshottari starts from the Moon nakshatra and spans one 120-year cycle', () => {
  const birth = new Date('2000-01-01T00:00:00.000Z');
  const periods = computeVimshottariDasha(0, birth);

  assert.equal(periods.length, 9);
  assert.deepEqual(periods.map((period) => period.lord), DASHA_ORDER);
  assert.equal(periods[0].start.getTime(), birth.getTime());
  assert.equal(periods[0].antardashas.length, 9);
  assert.ok(
    Math.abs(
      periods[0].end.getTime() - birth.getTime() - 7 * 365.2425 * 86_400_000
    ) < 1
  );

  for (let index = 0; index < periods.length; index += 1) {
    const period = periods[index];
    assert.ok(
      Math.abs(
        period.end.getTime()
          - period.start.getTime()
          - DASHA_YEARS[period.lord] * 365.2425 * 86_400_000
      ) < 1
    );
    if (index > 0) {
      assert.equal(period.start.getTime(), periods[index - 1].end.getTime());
    }
    assert.equal(period.antardashas[0].start.getTime(), period.start.getTime());
    assert.equal(
      period.antardashas[period.antardashas.length - 1].end.getTime(),
      period.end.getTime()
    );
    for (let antarIndex = 1; antarIndex < period.antardashas.length; antarIndex += 1) {
      assert.equal(
        period.antardashas[antarIndex].start.getTime(),
        period.antardashas[antarIndex - 1].end.getTime()
      );
    }
  }

  const totalYears = periods.reduce(
    (sum, period) => sum + DASHA_YEARS[period.lord],
    0
  );
  assert.equal(totalYears, 120);
});

test('birth falls within the balance of the first Vimshottari period', () => {
  const birth = new Date('1992-08-14T00:12:00.000Z');
  const chart = computeKundali(inputFor(fixtures[0] as GoldenFixture));
  const current = getCurrentDasha(chart, birth);
  assert.ok(current);
  assert.equal(current.maha, chart.vimshottari[0]);
  assert.ok(current.antar);
});

test('beginner insights explain Lagna, Moon, and Dasha without deterministic claims', () => {
  const chart = computeKundali(inputFor(fixtures[0] as GoldenFixture));
  const insights = buildKundaliInsights(chart, new Date('2026-07-24T06:30:00.000Z'));

  assert.deepEqual(insights.map((insight) => insight.id), ['lagna', 'moon', 'dasha']);
  const copy = insights.map((insight) => insight.bodyEn).join(' ').toLowerCase();
  assert.match(copy, /traditional/);
  assert.match(copy, /does not guarantee/);
  assert.doesNotMatch(copy, /\byou will\b|\bwill happen\b|\bcertain to\b/);
  assert.equal(
    insights.find((insight) => insight.id === 'moon')?.bodyEn,
    'The Moon sign is a traditional lens on inner rhythm, and the nakshatra refines its placement. A reflection aid, not a personality verdict.'
  );
  assert.equal(insights.find((insight) => insight.id === 'lagna')?.targetTab, 'chart');
  assert.equal(insights.find((insight) => insight.id === 'moon')?.targetTab, 'grahas');
  assert.equal(insights.find((insight) => insight.id === 'dasha')?.targetTab, 'dasha');
});

test('Rashifal is deterministic for an India civil day and valid for all rashis', () => {
  const early = new Date('2026-07-24T00:00:00.000Z');
  const late = new Date('2026-07-24T17:59:00.000Z');
  for (let rashiIndex = 0; rashiIndex < 12; rashiIndex += 1) {
    const first = computeRashifal(early, rashiIndex);
    const second = computeRashifal(late, rashiIndex);
    assert.deepEqual(second, first);
    assert.equal(first.dateKey, '2026-07-24');
    assert.ok(first.favourEn.length > 0);
    assert.ok(first.pauseEn.length > 0);
    assert.ok(first.reflectionEn.endsWith('?'));
    assert.ok(GRAHA_ORDER.includes(first.favourGraha));
    assert.ok(GRAHA_ORDER.includes(first.pauseGraha));
    assert.equal(first.reflectionGraha, 'moon');
    assert.ok(first.favourHouse >= 1 && first.favourHouse <= 12);
    assert.ok(first.pauseHouse >= 1 && first.pauseHouse <= 12);
    assert.ok(first.reflectionHouse >= 1 && first.reflectionHouse <= 12);
    assert.ok(
      ['navagraha-stotram', 'surya-ashtakam', 'shani-ashtakam'].includes(first.sourceId)
    );
  }
});

test('engine source stays pure: no wall clock, randomness, network, storage, or React', () => {
  const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '../kundali.ts');
  const source = readFileSync(sourcePath, 'utf8');
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
});
