/**
 * Two-year robustness sweep: compute muhurat for every day across 2026–2027
 * (Ujjain, both calendar systems irrelevant to rise/set) via the REAL engine and
 * assert structural invariants hold on all 730 days — no NaN, no inverted or
 * gapped windows, kaal always inside the daytime, choghadiya exactly tiling the
 * day/night arcs, and the weekday-table start period always correct.
 *
 * Runs under `npm run test:engine` (tsx glob over src/panchang/__tests__).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computePanchangForDate } from '../engine';
import { computeMuhuratDay } from '../muhurat';

const EXPECTED_DAY_START = ['udveg', 'amrit', 'rog', 'labh', 'shubh', 'char', 'kaal']; // Sun..Sat
const DAY_MS = 86_400_000;

function ok(d: Date): boolean {
  return d instanceof Date && Number.isFinite(d.getTime());
}

test('muhurat invariants hold for every day across 2026–2027', () => {
  let checked = 0;
  const start = new Date(2026, 0, 1);
  for (let i = 0; i < 730; i += 1) {
    const day = new Date(start.getTime() + i * DAY_MS);
    const today = computePanchangForDate(day, {});
    const tomorrow = computePanchangForDate(new Date(day.getTime() + DAY_MS), {});
    const md = computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, day.getDay());
    const label = day.toISOString().slice(0, 10);

    // 8 + 8 periods, no NaN.
    assert.equal(md.dayChoghadiya.length, 8, label);
    assert.equal(md.nightChoghadiya.length, 8, label);
    for (const p of [...md.dayChoghadiya, ...md.nightChoghadiya]) {
      assert.ok(ok(p.start) && ok(p.end), `NaN window ${label}`);
      assert.ok(p.end.getTime() > p.start.getTime(), `inverted window ${label} ${p.key}`);
    }

    // Day tiles [sunrise, sunset] exactly and contiguously.
    assert.equal(md.dayChoghadiya[0].start.getTime(), today.sunrise.getTime(), label);
    assert.equal(md.dayChoghadiya[7].end.getTime(), today.sunset.getTime(), label);
    for (let k = 1; k < 8; k += 1) {
      assert.equal(md.dayChoghadiya[k].start.getTime(), md.dayChoghadiya[k - 1].end.getTime(), label);
    }
    // Night tiles [sunset, next sunrise].
    assert.equal(md.nightChoghadiya[0].start.getTime(), today.sunset.getTime(), label);
    assert.equal(md.nightChoghadiya[7].end.getTime(), tomorrow.sunrise.getTime(), label);

    // Weekday-table start period.
    assert.equal(md.dayChoghadiya[0].key, EXPECTED_DAY_START[day.getDay()], `day-start ${label}`);

    // Kaal windows inside the daytime, valid, non-empty.
    for (const kaal of [md.rahu, md.gulika, md.yamaganda]) {
      assert.ok(ok(kaal.start) && ok(kaal.end), `kaal NaN ${label}`);
      assert.ok(kaal.start.getTime() >= today.sunrise.getTime(), `${kaal.key} before sunrise ${label}`);
      assert.ok(kaal.end.getTime() <= today.sunset.getTime(), `${kaal.key} after sunset ${label}`);
      assert.ok(kaal.end.getTime() > kaal.start.getTime(), `${kaal.key} empty ${label}`);
    }

    // Abhijit within the day when present.
    if (md.abhijit) {
      assert.ok(md.abhijit.start.getTime() > today.sunrise.getTime(), `abhijit start ${label}`);
      assert.ok(md.abhijit.end.getTime() < today.sunset.getTime(), `abhijit end ${label}`);
    }
    checked += 1;
  }
  assert.equal(checked, 730);
});
