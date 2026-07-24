import assert from 'node:assert/strict';
import { test } from 'node:test';

import rawCorpus from './fixtures/kundali-swiss-ephemeris-150.json';
import {
  computeKundali,
  DASHA_YEARS,
  getCurrentDasha,
  GRAHA_ORDER,
  type DashaLord,
  type Graha,
  type KundaliInput,
} from '../kundali';

type ReferenceGraha = {
  longitude: number;
  speedLongitudePerDay: number;
};

type ReferenceInstant = {
  id: string;
  localBirthIst: string;
  dateUtc: string;
  expected: {
    ayanamsa: number;
    lagnaByCity: Record<string, number>;
    grahas: Record<Graha, ReferenceGraha>;
    vimshottari: {
      firstLord: DashaLord;
      firstStartUtc: string;
      firstEndUtc: string;
      birthAntardashaLord: DashaLord;
    };
  };
};

type ReferenceLocation = {
  id: string;
  latitude: number;
  longitude: number;
  elevation: number;
};

type SwissCorpus = {
  schemaVersion: number;
  source: {
    library: string;
    libraryVersion: string;
    sourceCommit: string;
    pythonBinding: string;
    siderealMode: string;
    calculation: string;
    requestedFlags: readonly string[];
    ephemerisFiles: readonly {
      name: string;
      sha256: string;
      url: string;
    }[];
  };
  coverage: {
    caseCount: number;
    cityCount: number;
    instantCount: number;
    cityIds: readonly string[];
    localInstantsIst: readonly string[];
    yearRange: readonly number[];
  };
  locations: readonly ReferenceLocation[];
  instants: readonly ReferenceInstant[];
};

const corpus = rawCorpus as SwissCorpus;
const DAY_MS = 86_400_000;
const MEAN_TROPICAL_YEAR_DAYS = 365.2425;
const NAKSHATRA_SPAN = 360 / 27;

// These bounds are deliberately much tighter than PRD-C's original
// 0.10° graha / 0.15° Lagna acceptance thresholds. The 150-case corpus spans
// 1950-2026 and India's geographic extremes; changing the engine or reference
// data must be reviewed instead of silently widening them.
const AYANAMSA_TOLERANCE_DEGREES = 0.005;
const LONGITUDE_TOLERANCE_DEGREES = 0.012;
const LAGNA_TOLERANCE_DEGREES = 0.012;
const EXTERNAL_DASHA_TOLERANCE_DAYS = 5;

function angularDifference(actual: number, expected: number): number {
  return Math.abs(((actual - expected + 540) % 360) - 180);
}

function assertAngleWithin(
  actual: number,
  expected: number,
  tolerance: number,
  label: string
): number {
  const difference = angularDifference(actual, expected);
  assert.ok(
    difference <= tolerance,
    `${label}: expected ${expected.toFixed(6)}°, got ${actual.toFixed(6)}° `
      + `(difference ${difference.toFixed(6)}°, tolerance ${tolerance}°)`
  );
  return difference;
}

function inputFor(
  instant: ReferenceInstant,
  location: ReferenceLocation
): KundaliInput {
  return {
    date: new Date(instant.dateUtc),
    latitude: location.latitude,
    longitude: location.longitude,
    elevation: location.elevation,
    timezone: 'Asia/Kolkata',
  };
}

test('Swiss Ephemeris corpus is independently sourced and covers 150 India/IST charts', () => {
  assert.equal(corpus.schemaVersion, 1);
  assert.equal(corpus.source.library, 'Swiss Ephemeris');
  assert.equal(corpus.source.libraryVersion, '2.10.03');
  assert.equal(corpus.source.pythonBinding, 'pyswisseph 2.10.3.2');
  assert.equal(corpus.source.siderealMode, 'SIDM_LAHIRI');
  assert.equal(corpus.source.calculation, 'calc_ut');
  assert.deepEqual(corpus.source.requestedFlags, [
    'FLG_SWIEPH',
    'FLG_SIDEREAL',
    'FLG_SPEED',
  ]);
  assert.match(corpus.source.sourceCommit, /^[0-9a-f]{40}$/);
  assert.deepEqual(
    corpus.source.ephemerisFiles.map((file) => file.name),
    ['sepl_18.se1', 'semo_18.se1']
  );
  for (const file of corpus.source.ephemerisFiles) {
    assert.match(file.sha256, /^[0-9a-f]{64}$/);
    assert.ok(file.url.includes(corpus.source.sourceCommit));
  }

  assert.equal(corpus.coverage.caseCount, 150);
  assert.equal(corpus.coverage.cityCount, 15);
  assert.equal(corpus.coverage.instantCount, 10);
  assert.deepEqual(corpus.coverage.yearRange, [1950, 2026]);
  assert.equal(corpus.locations.length, corpus.coverage.cityCount);
  assert.equal(corpus.instants.length, corpus.coverage.instantCount);
  assert.equal(
    corpus.locations.length * corpus.instants.length,
    corpus.coverage.caseCount
  );
  assert.deepEqual(
    corpus.locations.map((location) => location.id),
    corpus.coverage.cityIds
  );
  assert.deepEqual(
    corpus.instants.map((instant) => instant.localBirthIst),
    corpus.coverage.localInstantsIst
  );
});

test('150 charts match Swiss Ephemeris Lahiri positions, Lagna, houses, and Dasha', () => {
  let checkedCases = 0;
  let checkedGrahas = 0;
  let maxAyanamsaDifference = 0;
  let maxLagnaDifference = 0;
  let maxGrahaDifference = 0;
  let maxDashaDifferenceDays = 0;

  for (const instant of corpus.instants) {
    for (const location of corpus.locations) {
      const caseId = `${location.id}-${instant.id}`;
      const chart = computeKundali(inputFor(instant, location));
      checkedCases += 1;

      maxAyanamsaDifference = Math.max(
        maxAyanamsaDifference,
        assertAngleWithin(
          chart.ayanamsa,
          instant.expected.ayanamsa,
          AYANAMSA_TOLERANCE_DEGREES,
          `${caseId} ayanamsa`
        )
      );

      const expectedLagna = instant.expected.lagnaByCity[location.id];
      assert.ok(Number.isFinite(expectedLagna), `${caseId} has a Lagna reference`);
      maxLagnaDifference = Math.max(
        maxLagnaDifference,
        assertAngleWithin(
          chart.lagnaLongitude,
          expectedLagna,
          LAGNA_TOLERANCE_DEGREES,
          `${caseId} Lagna`
        )
      );

      const expectedLagnaRashi = Math.floor(expectedLagna / 30) % 12;
      assert.equal(
        chart.lagnaRashiIndex,
        expectedLagnaRashi,
        `${caseId} Lagna rashi`
      );
      assert.deepEqual(
        chart.houses,
        Array.from(
          { length: 12 },
          (_, index) => (expectedLagnaRashi + index) % 12
        ),
        `${caseId} whole-sign houses`
      );

      assert.deepEqual(
        chart.grahas.map((position) => position.graha),
        GRAHA_ORDER,
        `${caseId} graha order`
      );
      for (const position of chart.grahas) {
        checkedGrahas += 1;
        const reference = instant.expected.grahas[position.graha];
        maxGrahaDifference = Math.max(
          maxGrahaDifference,
          assertAngleWithin(
            position.siderealLongitude,
            reference.longitude,
            LONGITUDE_TOLERANCE_DEGREES,
            `${caseId} ${position.graha}`
          )
        );

        const expectedRashi = Math.floor(reference.longitude / 30) % 12;
        const expectedNakshatra =
          Math.floor(reference.longitude / NAKSHATRA_SPAN) % 27;
        const expectedPada =
          Math.floor(
            (reference.longitude % NAKSHATRA_SPAN) / (NAKSHATRA_SPAN / 4)
          ) + 1;
        const expectedHouse =
          ((expectedRashi - expectedLagnaRashi + 12) % 12) + 1;
        const expectedRetrograde =
          position.graha === 'rahu' || position.graha === 'ketu'
            ? true
            : position.graha === 'sun' || position.graha === 'moon'
              ? false
              : reference.speedLongitudePerDay < 0;

        assert.equal(position.rashiIndex, expectedRashi, `${caseId} ${position.graha} rashi`);
        assert.equal(
          position.nakshatraIndex,
          expectedNakshatra,
          `${caseId} ${position.graha} nakshatra`
        );
        assert.equal(position.pada, expectedPada, `${caseId} ${position.graha} pada`);
        assert.equal(position.house, expectedHouse, `${caseId} ${position.graha} house`);
        assert.equal(
          position.retrograde,
          expectedRetrograde,
          `${caseId} ${position.graha} retrograde state`
        );
      }

      const firstPeriod = chart.vimshottari[0];
      const expectedDasha = instant.expected.vimshottari;
      assert.equal(firstPeriod.lord, expectedDasha.firstLord, `${caseId} first Mahadasha`);
      const startDifferenceMs = Math.abs(
        firstPeriod.start.getTime() - new Date(expectedDasha.firstStartUtc).getTime()
      );
      const endDifferenceMs = Math.abs(
        firstPeriod.end.getTime() - new Date(expectedDasha.firstEndUtc).getTime()
      );
      const dashaToleranceMs = EXTERNAL_DASHA_TOLERANCE_DAYS * DAY_MS;
      assert.ok(
        startDifferenceMs <= dashaToleranceMs,
        `${caseId} first Mahadasha start differs by ${(startDifferenceMs / DAY_MS).toFixed(3)} days`
      );
      assert.ok(
        endDifferenceMs <= dashaToleranceMs,
        `${caseId} first Mahadasha end differs by ${(endDifferenceMs / DAY_MS).toFixed(3)} days`
      );
      maxDashaDifferenceDays = Math.max(
        maxDashaDifferenceDays,
        startDifferenceMs / DAY_MS,
        endDifferenceMs / DAY_MS
      );

      // The Dasha boundary shift must be exactly the shift implied by the
      // independently measured Moon-longitude delta. This separates the small
      // ephemeris delta from a Dasha-formula defect.
      const moon = chart.grahas.find((position) => position.graha === 'moon');
      assert.ok(moon);
      const moonDifference = angularDifference(
        moon.siderealLongitude,
        instant.expected.grahas.moon.longitude
      );
      const impliedBoundaryDifferenceMs =
        moonDifference
        / NAKSHATRA_SPAN
        * DASHA_YEARS[firstPeriod.lord]
        * MEAN_TROPICAL_YEAR_DAYS
        * DAY_MS;
      assert.ok(
        Math.abs(startDifferenceMs - impliedBoundaryDifferenceMs) <= 60_000,
        `${caseId} Dasha boundary delta is not explained by its Moon-position delta`
      );

      const current = getCurrentDasha(chart, new Date(instant.dateUtc));
      assert.equal(
        current?.antar?.lord,
        expectedDasha.birthAntardashaLord,
        `${caseId} birth Antardasha`
      );
    }
  }

  assert.equal(checkedCases, 150);
  assert.equal(checkedGrahas, 1_350);
  console.info(
    'Swiss Ephemeris audit: '
      + `${checkedCases} charts / ${checkedGrahas} graha placements; `
      + `max ayanamsa ${maxAyanamsaDifference.toFixed(6)}°, `
      + `Lagna ${maxLagnaDifference.toFixed(6)}°, `
      + `graha ${maxGrahaDifference.toFixed(6)}°, `
      + `Dasha boundary ${maxDashaDifferenceDays.toFixed(3)} days; `
      + '0 rashi/nakshatra/pada/house/retrograde/Antardasha mismatches.'
  );
});
