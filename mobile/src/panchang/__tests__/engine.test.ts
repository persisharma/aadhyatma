import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePanchangForDate, computeTithiAndMonth } from '../engine';

// Engine sunrise/sunset are true UTC instants; expected times are Ujjain wall-clock
// (IST). Read the instant in Asia/Kolkata so assertions are independent of the test
// runner's timezone (CI runs in UTC).
const IST_HM = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false,
});
function istHourMin(d: Date): { h: number; m: number } {
  const parts = IST_HM.formatToParts(d);
  return {
    h: Number(parts.find((p) => p.type === 'hour')!.value),
    m: Number(parts.find((p) => p.type === 'minute')!.value),
  };
}

function assertTimeWithin(actual: Date | null, expectedHour: number, expectedMin: number, toleranceMin: number, label: string) {
  assert.ok(actual, `${label}: expected a Date but got null`);
  const { h, m } = istHourMin(actual);
  const actualMin = h * 60 + m;
  const expectedTotalMin = expectedHour * 60 + expectedMin;
  const diff = Math.abs(actualMin - expectedTotalMin);
  assert.ok(
    diff <= toleranceMin || diff >= (1440 - toleranceMin),
    `${label}: expected ~${expectedHour}:${String(expectedMin).padStart(2, '0')}, got ${h}:${String(m).padStart(2, '0')} (diff ${diff} min, tolerance ${toleranceMin})`
  );
}

test('14 Jan 2026 — Wednesday', () => {
  const p = computePanchangForDate(new Date(2026, 0, 14));
  assert.equal(p.vara.index, 3, 'Wednesday');
  assert.ok(p.tithi.index >= 0 && p.tithi.index <= 29, `valid tithi, got ${p.tithi.index}`);
  assert.ok(p.nakshatra.index >= 0 && p.nakshatra.index <= 26, 'valid nakshatra');
  assertTimeWithin(p.sunrise, 7, 12, 15, 'sunrise');
});

test('3 Mar 2026 — Holi Purnima', () => {
  const p = computePanchangForDate(new Date(2026, 2, 3));
  assert.equal(p.vara.index, 2, 'Tuesday');
  assert.equal(p.tithi.paksha, 'shukla');
  assert.equal(p.tithi.index, 14, `Purnima (14), got ${p.tithi.index}`);
  assertTimeWithin(p.sunrise, 6, 45, 15, 'sunrise');
});

test('22 May 2026 — Shukla Paksha', () => {
  const p = computePanchangForDate(new Date(2026, 4, 22));
  assert.equal(p.vara.index, 5, 'Friday');
  assert.equal(p.tithi.paksha, 'shukla');
  assert.ok(p.tithi.index >= 4 && p.tithi.index <= 7, `~Shashthi range, got ${p.tithi.index}`);
  assertTimeWithin(p.sunrise, 5, 43, 10, 'sunrise');
});

test('20 Oct 2026 — Shukla Navami', () => {
  const p = computePanchangForDate(new Date(2026, 9, 20));
  assert.equal(p.vara.index, 2, 'Tuesday');
  assert.equal(p.tithi.paksha, 'shukla');
  assert.ok(p.tithi.index >= 7 && p.tithi.index <= 9, `~Navami, got ${p.tithi.index}`);
  assertTimeWithin(p.sunrise, 6, 25, 10, 'sunrise');
});

test('12 Aug 2026 — Krishna Amavasya', () => {
  const p = computePanchangForDate(new Date(2026, 7, 12));
  assert.equal(p.vara.index, 3, 'Wednesday');
  assert.equal(p.tithi.paksha, 'krishna');
  assert.ok(p.tithi.index >= 28 || p.tithi.index === 0, `Amavasya range (28-29/0), got ${p.tithi.index}`);
});

test('Brahma Muhurta = sunrise - 96min to sunrise - 48min', () => {
  const p = computePanchangForDate(new Date(2026, 4, 22));
  const sunriseMs = p.sunrise.getTime();
  const diffStart = (sunriseMs - p.brahmaMuhurta.start.getTime()) / 60000;
  const diffEnd = (sunriseMs - p.brahmaMuhurta.end.getTime()) / 60000;
  assert.ok(Math.abs(diffStart - 96) <= 2, `BM start ~96 min before sunrise, got ${diffStart.toFixed(1)}`);
  assert.ok(Math.abs(diffEnd - 48) <= 2, `BM end ~48 min before sunrise, got ${diffEnd.toFixed(1)}`);
});

test('Vara matches JS getDay()', () => {
  const dates = [
    new Date(2026, 0, 1),
    new Date(2026, 5, 15),
    new Date(2026, 11, 25),
  ];
  for (const d of dates) {
    const p = computePanchangForDate(d);
    assert.equal(p.vara.index, d.getDay(), `vara mismatch for ${d.toISOString()}`);
  }
});

test('Vikram Samvat 2082-2083 in 2026', () => {
  const jan = computePanchangForDate(new Date(2026, 0, 15));
  assert.ok(jan.vikramSamvat === 2082 || jan.vikramSamvat === 2083, `VS ${jan.vikramSamvat}`);
  const nov = computePanchangForDate(new Date(2026, 10, 15));
  assert.equal(nov.vikramSamvat, 2083);
});

test('all name fields are non-empty', () => {
  const p = computePanchangForDate(new Date(2026, 4, 22));
  assert.ok(p.vara.nameHi.length > 0);
  assert.ok(p.vara.nameEn.length > 0);
  assert.ok(p.tithi.nameHi.length > 0);
  assert.ok(p.tithi.nameEn.length > 0);
  assert.ok(p.nakshatra.nameHi.length > 0);
  assert.ok(p.nakshatra.nameEn.length > 0);
  assert.ok(p.yoga.nameHi.length > 0);
  assert.ok(p.yoga.nameEn.length > 0);
  assert.ok(p.karana.nameHi.length > 0);
  assert.ok(p.karana.nameEn.length > 0);
});

test('tithi endTime is reasonable relative to sunrise', () => {
  const p = computePanchangForDate(new Date(2026, 4, 22));
  if (p.tithi.endTime) {
    const diff = p.tithi.endTime.getTime() - p.sunrise.getTime();
    assert.ok(diff > -6 * 3600000, 'tithi endTime not more than 6h before sunrise');
  }
});

test('lunar month has valid index and names', () => {
  const p = computePanchangForDate(new Date(2026, 4, 22));
  assert.ok(p.lunarMonth.index >= 1 && p.lunarMonth.index <= 12, `month 1-12, got ${p.lunarMonth.index}`);
  assert.ok(p.lunarMonth.nameHi.length > 0);
  assert.ok(p.lunarMonth.nameEn.length > 0);
});

test('Amanta and Purnimant months are identical in Shukla Paksha', () => {
  const purnimant = computePanchangForDate(new Date(2026, 4, 22), { calendarSystem: 'purnimant' });
  const amanta = computePanchangForDate(new Date(2026, 4, 22), { calendarSystem: 'amanta' });

  assert.equal(purnimant.tithi.paksha, 'shukla');
  assert.equal(amanta.lunarMonth.index, purnimant.lunarMonth.index);
  assert.equal(amanta.lunarMonth.nameEn, purnimant.lunarMonth.nameEn);
});

test('Amanta month is one month behind Purnimant in Krishna Paksha', () => {
  const purnimant = computePanchangForDate(new Date(2026, 7, 12), { calendarSystem: 'purnimant' });
  const amanta = computePanchangForDate(new Date(2026, 7, 12), { calendarSystem: 'amanta' });
  const expectedAmantaMonth = purnimant.lunarMonth.index === 1 ? 12 : purnimant.lunarMonth.index - 1;

  assert.equal(purnimant.tithi.paksha, 'krishna');
  assert.equal(amanta.tithi.paksha, 'krishna');
  assert.equal(amanta.lunarMonth.index, expectedAmantaMonth);
  assert.notEqual(amanta.lunarMonth.nameEn, purnimant.lunarMonth.nameEn);
});

test('Karana at sunrise matches source-backed boundary cases', () => {
  assert.equal(computePanchangForDate(new Date(2026, 7, 15)).karana.nameEn, 'Gara');
  assert.equal(computePanchangForDate(new Date(2027, 1, 17)).karana.nameEn, 'Vishti');
});

test('Tithi/month helper uses the corrected lunar month logic', () => {
  const dates = [
    new Date(2026, 5, 30),
    new Date(2026, 6, 30),
    new Date(2026, 10, 25),
    new Date(2027, 1, 21),
  ];

  for (const date of dates) {
    for (const calendarSystem of ['purnimant', 'amanta'] as const) {
      const panchang = computePanchangForDate(date, { calendarSystem });
      const helper = computeTithiAndMonth(date, { calendarSystem });

      assert.equal(helper.tithiIndex, panchang.tithi.index, `${date.toDateString()} ${calendarSystem} tithi`);
      assert.equal(helper.paksha, panchang.tithi.paksha, `${date.toDateString()} ${calendarSystem} paksha`);
      assert.equal(helper.lunarMonth, panchang.lunarMonth.index, `${date.toDateString()} ${calendarSystem} month`);
    }
  }
});
