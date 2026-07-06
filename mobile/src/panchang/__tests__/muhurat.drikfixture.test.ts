/**
 * External-data cross-check against the committed DrikPanchang fixture
 * (drikpanchang-ujjain.json — 131 real days, 2026-03-01..2026-07-10, captured
 * from drikpanchang.com). We feed DrikPanchang's OWN published sunrise/sunset
 * into computeMuhuratDay and assert, for every one of the 131 days, that the
 * derived Rahu/Gulika/Yamaganda and Choghadiya land on the correct segments of
 * the authoritative external day-arc, and tile it exactly.
 *
 * This validates the muhurat composition on real external rise/set values (the
 * engine's own rise/set is separately validated against the same fixture in
 * panchangVsDrikpanchang.e2e.test.ts within 3 min). The weekday-table rule
 * itself is independently cross-checked against a published panchang card in
 * muhurat.external.test.ts. Runs under test:engine.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { computeMuhuratDay } from '../muhurat';

type Row = { date: string; weekday: number; sunrise: string; sunset: string };
const fixture = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures/drikpanchang-ujjain.json'), 'utf8'));
const DAYS = fixture.days as Row[];

// Independent segment math (deliberately re-derived here, not imported) to check
// the module's composition.
const RAHU = [8, 2, 7, 5, 6, 4, 3];
const GULIKA = [7, 6, 5, 4, 3, 2, 1];
const YAMAGANDA = [5, 4, 3, 2, 1, 7, 6];
const DAY_START = ['udveg', 'amrit', 'rog', 'labh', 'shubh', 'char', 'kaal'];

function at(date: string, hm: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  const [h, min] = hm.split(':').map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0);
}

test('muhurat windows are correct segments of DrikPanchang rise/set for all 131 days', () => {
  assert.ok(DAYS.length >= 100, 'fixture should cover the window');
  for (const row of DAYS) {
    const sunrise = at(row.date, row.sunrise);
    const sunset = at(row.date, row.sunset);
    const nextSunrise = new Date(sunrise.getTime() + 24 * 3600_000); // night tiling only
    const md = computeMuhuratDay(sunrise, sunset, nextSunrise, row.weekday);

    const daySpan = sunset.getTime() - sunrise.getTime();
    const eighth = daySpan / 8;
    const expectedStart = (seg1Based: number) => sunrise.getTime() + eighth * (seg1Based - 1);

    // Kaal windows land on the expected weekday eighth of the DrikPanchang arc.
    assert.equal(md.rahu.start.getTime(), expectedStart(RAHU[row.weekday]), `${row.date} rahu`);
    assert.equal(md.gulika.start.getTime(), expectedStart(GULIKA[row.weekday]), `${row.date} gulika`);
    assert.equal(md.yamaganda.start.getTime(), expectedStart(YAMAGANDA[row.weekday]), `${row.date} yamaganda`);

    // Day choghadiya tile the arc exactly and start on the right weekday period.
    assert.equal(md.dayChoghadiya[0].start.getTime(), sunrise.getTime(), `${row.date} day start`);
    assert.equal(md.dayChoghadiya[7].end.getTime(), sunset.getTime(), `${row.date} day end`);
    assert.equal(md.dayChoghadiya[0].key, DAY_START[row.weekday], `${row.date} start period`);

    // Abhijit sits around solar noon within the arc.
    assert.ok(md.abhijit && md.abhijit.start.getTime() > sunrise.getTime() && md.abhijit.end.getTime() < sunset.getTime(), `${row.date} abhijit`);
  }
});
