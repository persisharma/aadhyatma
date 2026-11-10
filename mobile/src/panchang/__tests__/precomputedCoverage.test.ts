import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PRECOMPUTED_OBSERVANCES } from '../precomputedObservances';

/**
 * The precomputed observance table must stay AHEAD of the calendar.
 *
 * Any year missing from it falls back to `resolveObservancesForYearLive` — a
 * synchronous full-year astronomy scan (~1.3–1.5 s on desktop V8, several
 * seconds on a phone). Several synchronous callers read NEXT year as well as
 * this one (`getUpcomingObservances`, `getNextOccurrences` behind the vrat
 * reminder scheduler, the widget's late-December window), so the table running
 * out would freeze the Vrat tab, the launch-time reminder pass and later Home
 * itself — with no test failing first. This one fails two years ahead.
 *
 * WHEN IT FAILS: extend `YEARS` in `scripts/gen-precomputed-observances.mts` and
 * regenerate (TZ=Asia/Kolkata npx tsx scripts/gen-precomputed-observances.mts).
 * Existing years must regenerate byte-identically; if one does not, the engine
 * moved and that is a separate review — do not loosen this window instead.
 */
const REQUIRED_YEARS_AHEAD = 2;

function coveredYears(system: 'purnimant' | 'amanta'): number[] {
  return Object.keys(PRECOMPUTED_OBSERVANCES)
    .filter((key) => key.startsWith(`${system}:`))
    .map((key) => Number(key.slice(system.length + 1)))
    .sort((a, b) => a - b);
}

for (const system of ['purnimant', 'amanta'] as const) {
  test(`${system}: the precomputed table covers this year through ${REQUIRED_YEARS_AHEAD} years ahead`, () => {
    const years = coveredYears(system);
    const thisYear = new Date().getFullYear();
    for (let year = thisYear; year <= thisYear + REQUIRED_YEARS_AHEAD; year += 1) {
      assert.ok(
        years.includes(year),
        `${system}:${year} is missing from precomputedObservances.ts — regenerate with more YEARS (see this file's header)`
      );
    }
  });

  test(`${system}: covered years are contiguous and every year is populated`, () => {
    const years = coveredYears(system);
    assert.ok(years.length > 0);
    for (let i = 1; i < years.length; i += 1) {
      assert.equal(years[i], years[i - 1] + 1, `${system}: gap between ${years[i - 1]} and ${years[i]}`);
    }
    for (const year of years) {
      // A real year resolves hundreds of observances; an empty row is a broken
      // generation, and an empty answer would silently hide every festival.
      assert.ok(PRECOMPUTED_OBSERVANCES[`${system}:${year}`].length > 200, `${system}:${year} looks truncated`);
    }
  });
}
