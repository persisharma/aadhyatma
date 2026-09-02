/**
 * Integration test: the muhurat compute over REAL engine sunrise/sunset
 * (Ujjain default). Runs under `npm run test:engine` (tsx glob over
 * src/panchang/__tests__/*.test.ts).
 *
 * Asserts structural correctness against the engine's own rise/set — the day
 * choghadiya exactly spans sunrise→sunset, night spans sunset→next sunrise, and
 * the kaal windows fall inside the daytime. Exact DrikPanchang minute-parity is
 * a follow-up once reference values are captured per the PRD; the pure tables
 * are pinned in muhurat.test.ts.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computePanchangForDate } from '../engine';
import { computeMuhuratDay, classifyNow, nextAuspiciousPeriod } from '../muhurat';

const DAY = new Date(2026, 6, 5); // Jul 5 2026 (Sunday)
const NEXT = new Date(2026, 6, 6);

test('muhurat windows align with engine sunrise/sunset (Ujjain)', () => {
  const today = computePanchangForDate(DAY, {});
  const tomorrow = computePanchangForDate(NEXT, {});
  const md = computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, DAY.getDay());

  // Day choghadiya covers exactly sunrise → sunset.
  assert.equal(md.dayChoghadiya[0].start.getTime(), today.sunrise.getTime());
  assert.equal(md.dayChoghadiya[7].end.getTime(), today.sunset.getTime());
  // Night choghadiya covers sunset → next sunrise.
  assert.equal(md.nightChoghadiya[0].start.getTime(), today.sunset.getTime());
  assert.equal(md.nightChoghadiya[7].end.getTime(), tomorrow.sunrise.getTime());

  // All kaal windows sit within the daytime.
  for (const k of [md.rahu, md.gulika, md.yamaganda]) {
    assert.ok(k.start.getTime() >= today.sunrise.getTime(), `${k.key} start`);
    assert.ok(k.end.getTime() <= today.sunset.getTime(), `${k.key} end`);
  }

  // Abhijit sits around solar noon, inside the day.
  assert.ok(md.abhijit);
  assert.ok(md.abhijit!.start.getTime() > today.sunrise.getTime());
  assert.ok(md.abhijit!.end.getTime() < today.sunset.getTime());

  // At sunrise + 1 min we're in the first day choghadiya, no kaal necessarily.
  const justAfterSunrise = new Date(today.sunrise.getTime() + 60000);
  const { nowChoghadiya } = classifyNow(md, justAfterSunrise);
  assert.equal(nowChoghadiya?.phase, 'day');
});

test('nextAuspiciousPeriod finds the first auspicious window at/after the clock', () => {
  const today = computePanchangForDate(DAY, {});
  const tomorrow = computePanchangForDate(NEXT, {});
  const md = computeMuhuratDay(today.sunrise, today.sunset, tomorrow.sunrise, DAY.getDay());
  const all = [...md.dayChoghadiya, ...md.nightChoghadiya];

  // From just after sunrise: the first period whose start is >= the clock and
  // whose quality is auspicious — never the running first period itself.
  const at = new Date(today.sunrise.getTime() + 60000);
  const next = nextAuspiciousPeriod(md, at);
  assert.ok(next);
  assert.equal(next!.quality, 'auspicious');
  assert.ok(next!.start.getTime() >= at.getTime());
  const earlier = all.filter(
    (p) => p.quality === 'auspicious' && p.start.getTime() >= at.getTime() && p.start.getTime() < next!.start.getTime()
  );
  assert.equal(earlier.length, 0, 'nothing auspicious was skipped');

  // Contiguity: while an avoid period runs, a shubh period starting exactly at
  // its end must match (start >= at when at == avoid.start works through the
  // whole avoid span).
  const firstAvoid = all.find((p) => p.quality === 'avoid');
  assert.ok(firstAvoid);
  const during = new Date(firstAvoid!.start.getTime() + 60000);
  const after = nextAuspiciousPeriod(md, during);
  assert.ok(after);
  assert.ok(after!.start.getTime() >= firstAvoid!.end.getTime() - 1);

  // Past the last auspicious start of the night: nothing remains.
  const lastAuspicious = [...all].reverse().find((p) => p.quality === 'auspicious');
  assert.ok(lastAuspicious);
  const late = new Date(lastAuspicious!.start.getTime() + 60000);
  assert.equal(nextAuspiciousPeriod(md, late), null);
});
