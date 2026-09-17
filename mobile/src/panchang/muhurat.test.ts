/**
 * Pure tests for the muhurat compute (PRD-14). `tsx --test`; wired into
 * `npm run test:data`. No engine, no RN.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  computeMuhuratDay,
  splitEqual,
  classifyNow,
  type MuhuratDay,
} from './muhurat';

// A clean synthetic day: sunrise 06:00, sunset 18:00 (12h day), next sunrise 06:00+24h.
const SUNRISE = new Date(2026, 6, 5, 6, 0, 0); // Sun Jul 5 2026 (getDay()===0)
const SUNSET = new Date(2026, 6, 5, 18, 0, 0);
const NEXT_SUNRISE = new Date(2026, 6, 6, 6, 0, 0);

function build(weekday: number): MuhuratDay {
  return computeMuhuratDay(SUNRISE, SUNSET, NEXT_SUNRISE, weekday);
}

test('splitEqual produces n contiguous equal spans covering the range', () => {
  const parts = splitEqual(SUNRISE, SUNSET, 8);
  assert.equal(parts.length, 8);
  assert.equal(parts[0][0].getTime(), SUNRISE.getTime());
  assert.equal(parts[7][1].getTime(), SUNSET.getTime());
  for (let i = 1; i < parts.length; i++) {
    assert.equal(parts[i][0].getTime(), parts[i - 1][1].getTime()); // contiguous
  }
  // 12h / 8 = 90 min each
  assert.equal((parts[0][1].getTime() - parts[0][0].getTime()) / 60000, 90);
});

test('day + night each have 8 choghadiya covering their span', () => {
  const md = build(0);
  assert.equal(md.dayChoghadiya.length, 8);
  assert.equal(md.nightChoghadiya.length, 8);
  assert.equal(md.dayChoghadiya[0].start.getTime(), SUNRISE.getTime());
  assert.equal(md.dayChoghadiya[7].end.getTime(), SUNSET.getTime());
  assert.equal(md.nightChoghadiya[0].start.getTime(), SUNSET.getTime());
  assert.equal(md.nightChoghadiya[7].end.getTime(), NEXT_SUNRISE.getTime());
});

test('DrikPanchang day-start choghadiya per weekday', () => {
  // Sun→Udveg, Mon→Amrit, Tue→Rog, Wed→Labh, Thu→Shubh, Fri→Char, Sat→Kaal
  const expected = ['udveg', 'amrit', 'rog', 'labh', 'shubh', 'char', 'kaal'];
  for (let wd = 0; wd < 7; wd++) {
    assert.equal(build(wd).dayChoghadiya[0].key, expected[wd], `weekday ${wd}`);
  }
});

test('night choghadiya starts +5 around the wheel from the day start', () => {
  // Sunday day starts Udveg(0) → night starts Shubh(5)
  assert.equal(build(0).nightChoghadiya[0].key, 'shubh');
  // Wednesday day starts Labh(2) → night starts Udveg(0)
  assert.equal(build(3).nightChoghadiya[0].key, 'udveg');
});

// The full published tables (DrikPanchang; identical in every standard almanac).
// Day walks the wheel one key at a time; night is its OWN cycle
// (Shubh → Amrit → Char → Rog → Kaal → Labh → Udveg), so it must be pinned in
// full — checking only the first night period let a +1 walk ship for months.
const DAY_SEQUENCE: Record<number, string[]> = {
  0: ['udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg'],
  1: ['amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char', 'labh', 'amrit'],
  2: ['rog', 'udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh', 'rog'],
  3: ['labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char', 'labh'],
  4: ['shubh', 'rog', 'udveg', 'char', 'labh', 'amrit', 'kaal', 'shubh'],
  5: ['char', 'labh', 'amrit', 'kaal', 'shubh', 'rog', 'udveg', 'char'],
  6: ['kaal', 'shubh', 'rog', 'udveg', 'char', 'labh', 'amrit', 'kaal'],
};
const NIGHT_SEQUENCE: Record<number, string[]> = {
  0: ['shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg', 'shubh'],
  1: ['char', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'char'],
  2: ['kaal', 'labh', 'udveg', 'shubh', 'amrit', 'char', 'rog', 'kaal'],
  3: ['udveg', 'shubh', 'amrit', 'char', 'rog', 'kaal', 'labh', 'udveg'],
  4: ['amrit', 'char', 'rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit'],
  5: ['rog', 'kaal', 'labh', 'udveg', 'shubh', 'amrit', 'char', 'rog'],
  6: ['labh', 'udveg', 'shubh', 'amrit', 'char', 'rog', 'kaal', 'labh'],
};

test('day choghadiya follow the published weekday sequence, all 8 periods', () => {
  for (let wd = 0; wd < 7; wd++) {
    assert.deepEqual(build(wd).dayChoghadiya.map((p) => p.key), DAY_SEQUENCE[wd], `weekday ${wd}`);
  }
});

test('night choghadiya follow the published weekday sequence, all 8 periods', () => {
  for (let wd = 0; wd < 7; wd++) {
    assert.deepEqual(build(wd).nightChoghadiya.map((p) => p.key), NIGHT_SEQUENCE[wd], `weekday ${wd}`);
  }
});

test('Saturday 10:30 PM is Shubh (then Amrit), never the morning Kaal → Shubh pair', () => {
  // The Sep 2026 report: Bengaluru, Sat 5 Sep, sunset ≈ 18:25, next sunrise ≈ 06:09.
  const sunrise = new Date(2026, 8, 5, 6, 9, 0);
  const sunset = new Date(2026, 8, 5, 18, 25, 0);
  const nextSunrise = new Date(2026, 8, 6, 6, 9, 0);
  const md = computeMuhuratDay(sunrise, sunset, nextSunrise, 6);
  const { nowChoghadiya } = classifyNow(md, new Date(2026, 8, 5, 22, 30, 0));
  assert.equal(nowChoghadiya?.phase, 'night');
  assert.equal(nowChoghadiya?.key, 'shubh');
  const idx = md.nightChoghadiya.indexOf(nowChoghadiya!);
  assert.equal(md.nightChoghadiya[idx + 1].key, 'amrit');
});

test('quality mapping — amrit/shubh/labh/char auspicious; udveg/kaal/rog avoid', () => {
  const md = build(0);
  const q = (k: string) => md.dayChoghadiya.find((p) => p.key === k)!.quality;
  assert.equal(q('amrit'), 'auspicious');
  assert.equal(q('shubh'), 'auspicious');
  assert.equal(q('labh'), 'auspicious');
  assert.equal(q('char'), 'auspicious');
  assert.equal(q('udveg'), 'avoid');
  assert.equal(q('kaal'), 'avoid');
  assert.equal(q('rog'), 'avoid');
});

test('Rahu Kaal is the correct weekday eighth (Sun=8th, Mon=2nd)', () => {
  const sun = build(0);
  // 8th eighth on a 12h day starting 06:00 → 16:30–18:00
  assert.equal(sun.rahu.start.getHours(), 16);
  assert.equal(sun.rahu.start.getMinutes(), 30);
  assert.equal(sun.rahu.end.getTime(), SUNSET.getTime());
  const mon = build(1);
  // 2nd eighth → 07:30–09:00
  assert.equal(mon.rahu.start.getHours(), 7);
  assert.equal(mon.rahu.start.getMinutes(), 30);
});

test('Gulika and Yamaganda land on their weekday eighths', () => {
  const sat = build(6); // Saturday: Gulika 1st eighth, Yamaganda 6th eighth
  assert.equal(sat.gulika.start.getTime(), SUNRISE.getTime());
  // 6th eighth = index 5 → start 06:00 + 5*90min = 13:30
  assert.equal(sat.yamaganda.start.getHours(), 13);
  assert.equal(sat.yamaganda.start.getMinutes(), 30);
});

test('Abhijit is the 8th of 15 day-muhurtas (≈ midday)', () => {
  const md = build(0);
  // 12h/15 = 48min; 8th muhurta = 06:00 + 7*48 = 11:36 → 12:24
  assert.ok(md.abhijit);
  assert.equal(md.abhijit!.start.getHours(), 11);
  assert.equal(md.abhijit!.start.getMinutes(), 36);
  assert.equal(md.abhijit!.end.getHours(), 12);
  assert.equal(md.abhijit!.end.getMinutes(), 24);
});

test('classifyNow finds the containing choghadiya and any kaal', () => {
  const md = build(0);
  const at = new Date(2026, 6, 5, 17, 0, 0); // 5pm — inside Rahu (16:30–18:00) & last day period
  const { nowChoghadiya, nowKaal } = classifyNow(md, at);
  assert.ok(nowChoghadiya);
  assert.equal(nowChoghadiya!.phase, 'day');
  assert.equal(nowKaal?.key, 'rahu');
  // Before sunrise → nothing
  const pre = classifyNow(md, new Date(2026, 6, 5, 5, 0, 0));
  assert.equal(pre.nowChoghadiya, null);
});
