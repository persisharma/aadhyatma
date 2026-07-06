/**
 * External-source cross-check. Verifies the muhurat MATH against a real,
 * independently published panchang card — the Sujangarh card for Sunday
 * 5 July 2026 (sunrise 05:42, sunset 19:30):
 *
 *   Choghadiya: Char 07:26–09:10 · Labh 09:10–10:53 · Amrit 10:53–12:37 · Shubh 14:20–16:04
 *   Rahu Kaal:  17:47–19:31
 *   Abhijit:    12:09–12:57
 *
 * We feed the card's own sunrise/sunset into computeMuhuratDay and check the
 * derived windows match the published times. This isolates the muhurat tables
 * from the engine's rise/set (which is separately validated against the
 * DrikPanchang fixture in engine tests). Pure — runs under test:engine glob.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeMuhuratDay } from '../muhurat';

// 5 Jul 2026 is a Sunday (getDay() === 0).
const D = 5;
const sunrise = new Date(2026, 6, D, 5, 42);
const sunset = new Date(2026, 6, D, 19, 30);
const nextSunrise = new Date(2026, 6, D + 1, 5, 43); // only affects night tiling
const md = computeMuhuratDay(sunrise, sunset, nextSunrise, 0);

function minutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes();
}
function near(actual: Date, hh: number, mm: number, tolMin = 2, label = '') {
  const diff = Math.abs(minutes(actual) - (hh * 60 + mm));
  assert.ok(diff <= tolMin, `${label}: expected ~${hh}:${String(mm).padStart(2, '0')}, got ${actual.getHours()}:${String(actual.getMinutes()).padStart(2, '0')} (Δ${diff}m)`);
}
function byKey(key: string) {
  return md.dayChoghadiya.find((c) => c.key === key && c.start.getTime() < sunset.getTime())!;
}

test('day choghadiya matches the published Sujangarh card (±2 min)', () => {
  const char = md.dayChoghadiya[1]; // 2nd period (Sunday: Udveg, Char, …)
  near(char.start, 7, 26, 2, 'Char start');
  near(char.end, 9, 10, 2, 'Char end');

  const labh = md.dayChoghadiya[2];
  near(labh.start, 9, 10, 2, 'Labh start');
  near(labh.end, 10, 53, 2, 'Labh end');

  const amrit = md.dayChoghadiya[3];
  near(amrit.start, 10, 53, 2, 'Amrit start');
  near(amrit.end, 12, 37, 2, 'Amrit end');

  const shubh = md.dayChoghadiya[5];
  near(shubh.start, 14, 20, 2, 'Shubh start');
  near(shubh.end, 16, 4, 2, 'Shubh end');
});

test('Rahu Kaal matches the published card (±2 min)', () => {
  near(md.rahu.start, 17, 47, 2, 'Rahu start');
  near(md.rahu.end, 19, 30, 2, 'Rahu end'); // card prints 19:31; sunset is 19:30
});

test('Abhijit start matches; duration follows the DrikPanchang 15-part convention', () => {
  // The card's Abhijit is 12:09–12:57 (a fixed ~48-min muhurta). Our start
  // matches to the minute; DrikPanchang defines Abhijit as the 8th of 15 EQUAL
  // day-parts, so on this 828-min day it runs ~55 min (ends ~13:04), not 48.
  // Start parity is the meaningful check; the end differs by convention (see
  // PRD-14 — pinned to DrikPanchang).
  assert.ok(md.abhijit);
  near(md.abhijit!.start, 12, 9, 3, 'Abhijit start');
});
