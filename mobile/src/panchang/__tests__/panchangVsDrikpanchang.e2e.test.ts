import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { computePanchangForDate } from '../engine';

// Cross-checks the engine against reference panchang values captured from
// drikpanchang.com for Ujjain (geoname-id=1253914) — the same location the
// engine is hard-coded to. The fixture spans 2026-03-01 .. 2026-07-10 (131 days)
// and was normalized to the engine's canonical spelling at capture time.
//
// Group A tests are strict regression guards: these fields match drikpanchang
// for every day in the window today, and must keep matching.
//
// Group B tests CHARACTERIZE three known engine gaps (documented in the panchang
// verification report). They pin the exact set of diverging dates, so that fixing
// a bug — or regressing further — makes the relevant test fail loudly and forces
// this file (and the report) to be updated.

type Row = {
  date: string; weekday: number; paksha: 'shukla' | 'krishna';
  tithi: string; nakshatra: string; yoga: string; karana: string;
  purnimantaMonth: string; amantaMonth: string; isAdhik: boolean;
  vikramSamvat: number; sunrise: string; sunset: string;
};

const fixture = JSON.parse(readFileSync(join(import.meta.dirname, 'fixtures/drikpanchang-ujjain.json'), 'utf8'));
const DAYS = fixture.days as Row[];

function parseDate(s: string): Date { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function toMin(hhmm: string): number { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; }
// The engine returns sunrise/sunset as true UTC instants; the drikpanchang fixture
// lists them as Ujjain wall-clock (IST). Read the instant in Asia/Kolkata so the
// comparison is independent of the test runner's timezone (CI runs in UTC).
const IST_HM = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
});
function istMin(d: Date): number {
  const parts = IST_HM.formatToParts(d);
  const h = Number(parts.find((p) => p.type === 'hour')!.value);
  const m = Number(parts.find((p) => p.type === 'minute')!.value);
  return h * 60 + m;
}
const purnimant = (r: Row) => computePanchangForDate(parseDate(r.date), { calendarSystem: 'purnimant' });
const amanta = (r: Row) => computePanchangForDate(parseDate(r.date), { calendarSystem: 'amanta' });
const divergingDates = (predicate: (r: Row) => boolean) => DAYS.filter(predicate).map((r) => r.date);

// ---------- Group A: regression guards (100% match today) ----------

test('drik cross-check: vara / paksha / tithi / nakshatra / yoga / karana match for all 131 days', () => {
  assert.ok(DAYS.length >= 100, 'fixture should cover the verified window');
  for (const r of DAYS) {
    const p = purnimant(r);
    assert.equal(p.vara.index, r.weekday, `${r.date} weekday`);
    assert.equal(p.tithi.paksha, r.paksha, `${r.date} paksha`);
    assert.equal(p.tithi.nameEn, r.tithi, `${r.date} tithi`);
    assert.equal(p.nakshatra.nameEn, r.nakshatra, `${r.date} nakshatra`);
    assert.equal(p.yoga.nameEn, r.yoga, `${r.date} yoga`);
    assert.equal(p.karana.nameEn, r.karana, `${r.date} karana`);
  }
});

test('drik cross-check: sunrise & sunset within 3 minutes for all 131 days', () => {
  for (const r of DAYS) {
    const p = purnimant(r);
    const sr = istMin(p.sunrise);
    const ss = istMin(p.sunset);
    assert.ok(Math.abs(sr - toMin(r.sunrise)) <= 3, `${r.date} sunrise: engine ${sr} vs drik ${r.sunrise}`);
    assert.ok(Math.abs(ss - toMin(r.sunset)) <= 3, `${r.date} sunset: engine ${ss} vs drik ${r.sunset}`);
  }
});

// ---------- Group B: month / samvat / adhik must match drikpanchang ----------
// Adhik (Purushottam) Jyeshtha 2026 runs 2026-05-17 .. 2026-06-15 per drikpanchang;
// Vikram Samvat rolls 2082 -> 2083 at Chaitra Shukla Pratipada (2026-03-19).

test('Adhik Maas flag matches drikpanchang for every day', () => {
  const diverge = divergingDates((r) => purnimant(r).lunarMonth.isAdhik !== r.isAdhik);
  assert.deepEqual(diverge, [], 'isAdhik must match drik on every day');
});

test('Vikram Samvat matches drikpanchang for every day', () => {
  const diverge = divergingDates((r) => purnimant(r).vikramSamvat !== r.vikramSamvat);
  assert.deepEqual(diverge, [], 'Vikram Samvat must match drik on every day');
});

test('Purnimanta lunar month matches drikpanchang for every day', () => {
  const diverge = divergingDates((r) => purnimant(r).lunarMonth.nameEn !== r.purnimantaMonth);
  assert.deepEqual(diverge, [], 'Purnimanta month must match drik on every day');
});

test('Amanta lunar month matches drikpanchang for every day', () => {
  const diverge = divergingDates((r) => amanta(r).lunarMonth.nameEn !== r.amantaMonth);
  assert.deepEqual(diverge, [], 'Amanta month must match drik on every day');
});
