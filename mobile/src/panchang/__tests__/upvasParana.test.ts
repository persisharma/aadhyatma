/**
 * Pure parana-derivation suite (PRD-09 Phase 4 §10) — `tsx --test`.
 *
 * The engine-solved cases reuse the Yogini Ekadashi 2026 kshaya reference from
 * the engine suite (Bengaluru, occurrence 2026-07-10: Dashami till 8:16 AM
 * with kshaya Ekadashi till 5:23 AM on 11 Jul, so the tithi never touches a
 * sunrise): the parana morning 2026-07-11 carries Dwadashi at sunrise, ending
 * 02:04 on 12 Jul — a day-crossing end, which the display formats via
 * formatEndInstant.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePanchangForDate } from '../engine';
import { deriveUpvasParana } from '../upvasParana';
import type { PanchangData, UpvasParanaRule } from '../types';

const BENGALURU = { latitude: 12.9719, longitude: 77.5937, elevation: 900 };

function solve(y: number, m: number, d: number): PanchangData {
  return computePanchangForDate(new Date(y, m - 1, d), {
    location: BENGALURU,
    calendarSystem: 'purnimant',
  });
}

const TITHI_BOUND: UpvasParanaRule = {
  kind: 'next-day-sunrise-tithi-bound',
  boundTithi: 12,
  textHi: 'क',
  textEn: 'a',
};
const MOONRISE: UpvasParanaRule = { kind: 'same-day-after-moonrise', textHi: 'क', textEn: 'a' };
const TEXT_ONLY: UpvasParanaRule = { kind: 'text-only', textHi: 'क', textEn: 'a' };

/** Minimal synthetic day for branch tests — only the fields the helper reads. */
function syntheticDay(over: {
  tithiIndex: number;
  tithiEnd: Date | null;
  sunrise: Date;
  moonrise?: Date | null;
  date?: Date;
}): PanchangData {
  return {
    date: over.date ?? new Date(2026, 5, 16),
    sunrise: over.sunrise,
    moonrise: over.moonrise ?? null,
    tithi: { index: over.tithiIndex, paksha: over.tithiIndex < 15 ? 'shukla' : 'krishna', nameHi: 'क', nameEn: 'a', endTime: over.tithiEnd },
  } as PanchangData;
}

test('normal Dwadashi morning: window = parana-day sunrise → Dwadashi end (kshaya-occurrence reference)', () => {
  // Occurrence resolved by the festival engine to 2026-07-10 (kshaya Ekadashi);
  // the helper looks ONLY at resolved-date + 1 and never re-matches tithis.
  const paranaDay = solve(2026, 7, 11);
  assert.equal(paranaDay.tithi.index, 26, 'Dwadashi (krishna) at the parana sunrise');
  const display = deriveUpvasParana(TITHI_BOUND, null, paranaDay);
  assert.ok(display && display.kind === 'window');
  assert.equal(display.start.getTime(), paranaDay.sunrise.getTime());
  assert.equal(display.end.getTime(), paranaDay.tithi.endTime!.getTime());
  assert.ok(display.end.getTime() > display.start.getTime());
});

test('bound tithi already over before the parana sunrise ⇒ null (text-only renders)', () => {
  // 2026-07-12 carries Trayodashi at sunrise — the morning after a real
  // Dwadashi — so the same rule must refuse to invent a window for it.
  const dayAfter = solve(2026, 7, 12);
  assert.equal(dayAfter.tithi.index, 27);
  assert.equal(deriveUpvasParana(TITHI_BOUND, null, dayAfter), null);
});

test('both pakshas of the bound tithi fold to the same 1–15 value', () => {
  const sunrise = new Date(2026, 5, 16, 5, 42);
  const end = new Date(2026, 5, 16, 8, 10);
  const shukla = syntheticDay({ tithiIndex: 11, tithiEnd: end, sunrise }); // shukla Dwadashi
  const krishna = syntheticDay({ tithiIndex: 26, tithiEnd: end, sunrise }); // krishna Dwadashi
  assert.ok(deriveUpvasParana(TITHI_BOUND, null, shukla));
  assert.ok(deriveUpvasParana(TITHI_BOUND, null, krishna));
  const ekadashiMorning = syntheticDay({ tithiIndex: 10, tithiEnd: end, sunrise }); // vriddhi edge
  assert.equal(deriveUpvasParana(TITHI_BOUND, null, ekadashiMorning), null);
});

test('missing or inverted tithi end ⇒ null — never an invented time', () => {
  const sunrise = new Date(2026, 5, 16, 5, 42);
  assert.equal(
    deriveUpvasParana(TITHI_BOUND, null, syntheticDay({ tithiIndex: 11, tithiEnd: null, sunrise })),
    null
  );
  assert.equal(
    deriveUpvasParana(
      TITHI_BOUND,
      null,
      syntheticDay({ tithiIndex: 11, tithiEnd: new Date(2026, 5, 16, 5, 0), sunrise })
    ),
    null
  );
  // Missing parana day entirely (solve still in flight) ⇒ null.
  assert.equal(deriveUpvasParana(TITHI_BOUND, null, null), null);
});

test('moonrise kind: the occurrence day’s engine moonrise, verbatim', () => {
  const occurrence = solve(2026, 7, 11);
  assert.ok(occurrence.moonrise, 'reference day has a moonrise');
  const display = deriveUpvasParana(MOONRISE, occurrence, null);
  assert.ok(display && display.kind === 'instant');
  assert.equal(display.at.getTime(), occurrence.moonrise!.getTime());
  assert.equal(display.date.getTime(), occurrence.date.getTime());
});

test('null moonrise ⇒ null (engine can return it)', () => {
  const sunrise = new Date(2026, 9, 29, 6, 30);
  const day = syntheticDay({ tithiIndex: 18, tithiEnd: new Date(2026, 9, 30, 1, 0), sunrise, moonrise: null });
  assert.equal(deriveUpvasParana(MOONRISE, day, null), null);
  assert.equal(deriveUpvasParana(MOONRISE, null, null), null);
});

test('text-only kind never computes, whatever days are handed in', () => {
  const day = solve(2026, 7, 11);
  assert.equal(deriveUpvasParana(TEXT_ONLY, day, day), null);
});
