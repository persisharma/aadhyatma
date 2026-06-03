import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  resolveFestivalsForYear,
  getUpcomingFestivals,
  getObservancesForDate,
  getUpcomingObservances,
} from '../festivalEngine';

test('resolveFestivalsForYear returns festivals for 2026', () => {
  const festivals = resolveFestivalsForYear(2026);
  assert.ok(festivals.length >= 30, `expected major festivals plus Ekadashi vrats, got ${festivals.length}`);
  assert.ok(festivals.length <= 48, `expected at most one bundled observance per rule, got ${festivals.length}`);
});

test('festivals are sorted chronologically', () => {
  const festivals = resolveFestivalsForYear(2026);
  for (let i = 1; i < festivals.length; i++) {
    assert.ok(
      festivals[i].date.getTime() >= festivals[i - 1].date.getTime(),
      `festival ${festivals[i].rule.id} before ${festivals[i - 1].rule.id}`
    );
  }
});

test('Holi 2026 falls in Feb-Mar', () => {
  const festivals = resolveFestivalsForYear(2026);
  const holi = festivals.find((f) => f.rule.id === 'holi');
  if (holi) {
    const month = holi.date.getMonth();
    assert.ok(month >= 1 && month <= 3, `Holi should be Feb-Apr, got month ${month}`);
  }
});

test('getUpcomingFestivals returns future festivals', () => {
  const upcoming = getUpcomingFestivals(new Date(2026, 0, 1), 5);
  assert.equal(upcoming.length, 5);
  for (const f of upcoming) {
    assert.ok(f.date.getTime() >= new Date(2026, 0, 1).getTime());
  }
});

test('each resolved festival has valid rule fields', () => {
  const festivals = resolveFestivalsForYear(2026);
  for (const f of festivals) {
    assert.ok(f.rule.id.length > 0, 'id non-empty');
    assert.ok(f.rule.nameHi.length > 0, 'nameHi non-empty');
    assert.ok(f.rule.nameEn.length > 0, 'nameEn non-empty');
    assert.ok(['star', 'dot', 'halfmoon'].includes(f.rule.marker), `valid marker: ${f.rule.marker}`);
    assert.ok(f.date instanceof Date, 'date is Date');
  }
});

test('Makar Sankranti 2026 resolves to Jan 14 or 15', () => {
  const festivals = resolveFestivalsForYear(2026);
  const sankranti = festivals.find((f) => f.rule.id === 'makar-sankranti');
  assert.ok(sankranti, 'Makar Sankranti should be resolved');
  const day = sankranti.date.getDate();
  const month = sankranti.date.getMonth();
  assert.equal(month, 0, 'Makar Sankranti should be in January');
  assert.ok(day === 14 || day === 15, `Makar Sankranti should be Jan 14 or 15, got Jan ${day}`);
});

test('getUpcomingFestivals includes today festival when called mid-day', () => {
  const festivals = resolveFestivalsForYear(2026);
  const holi = festivals.find((f) => f.rule.id === 'holi');
  assert.ok(holi, 'Holi must be resolved');
  const holiNoon = new Date(holi.date.getFullYear(), holi.date.getMonth(), holi.date.getDate(), 12, 0, 0);
  const upcoming = getUpcomingFestivals(holiNoon, 5);
  const holiInUpcoming = upcoming.find((f) => f.rule.id === 'holi');
  assert.ok(holiInUpcoming, 'Holi should still be in upcoming when called at noon on Holi day');
});

test('2026 Ashwin and Kartik festival ordering is internally consistent', () => {
  const festivals = resolveFestivalsForYear(2026);
  const dateFor = (id: string) => {
    const festival = festivals.find((f) => f.rule.id === id);
    assert.ok(festival, `${id} must be resolved`);
    return festival.date;
  };

  const navratri = dateFor('navratri-start');
  const dussehra = dateFor('dussehra');
  const diwali = dateFor('diwali');
  const govardhan = dateFor('govardhan-puja');
  const bhaiDooj = dateFor('bhai-dooj');

  assert.ok(navratri.getTime() < dussehra.getTime(), 'Navratri must begin before Dussehra');
  assert.ok(diwali.getTime() < govardhan.getTime(), 'Diwali must be before Govardhan Puja');
  assert.ok(govardhan.getTime() < bhaiDooj.getTime(), 'Govardhan Puja must be before Bhai Dooj');
});

test('selected-date observances include short details and linked reading hints', () => {
  const observances = getObservancesForDate(new Date(2026, 0, 29), 'purnimant');
  const jaya = observances.find((item) => item.rule.id === 'jaya-ekadashi');

  assert.ok(jaya, 'Jaya Ekadashi should resolve on 29 Jan 2026');
  assert.equal(jaya.rule.category, 'vrat');
  assert.equal(jaya.rule.tithi, 11);
  assert.ok(jaya.rule.shortDescriptionEn.length > 0);
  assert.ok(jaya.rule.shortDescriptionHi.length > 0);
  assert.ok(jaya.rule.deityEn.length > 0);
  assert.ok(jaya.rule.linkSectionId, 'vrat cards should have a reading hook when available');
});

test('selected-date observances are deduplicated by id', () => {
  const observances = getObservancesForDate(new Date(2026, 10, 21), 'purnimant');
  const ids = observances.map((item) => item.rule.id);

  assert.equal(new Set(ids).size, ids.length);
});

test('upcoming observances are anchored to the selected date and calendar system', () => {
  const purnimant = getUpcomingObservances(new Date(2026, 0, 29, 12), 3, 'purnimant');
  const amanta = getUpcomingObservances(new Date(2026, 0, 29, 12), 3, 'amanta');

  assert.equal(purnimant.length, 3);
  assert.equal(amanta.length, 3);
  assert.equal(purnimant[0].date.getDate(), 29, 'selected-day observance should still be included at noon');
  assert.deepEqual(
    purnimant.map((item) => item.rule.id),
    amanta.map((item) => item.rule.id),
    'calendar-system matching should preserve canonical observance identity'
  );
});

test('Krishna Paksha festivals keep their civil date across Purnimant and Amanta', () => {
  const purnimant = getUpcomingObservances(new Date(2026, 6, 1), 12, 'purnimant');
  const amanta = getUpcomingObservances(new Date(2026, 6, 1), 12, 'amanta');
  const purnimantJanmashtami = purnimant.find((item) => item.rule.id === 'janmashtami');
  const amantaJanmashtami = amanta.find((item) => item.rule.id === 'janmashtami');

  assert.ok(purnimantJanmashtami, 'Purnimant Janmashtami should resolve');
  assert.ok(amantaJanmashtami, 'Amanta Janmashtami should resolve');
  assert.equal(amantaJanmashtami.date.toDateString(), purnimantJanmashtami.date.toDateString());

  const sameDayAmanta = getObservancesForDate(purnimantJanmashtami.date, 'amanta');
  assert.ok(
    sameDayAmanta.some((item) => item.rule.id === 'janmashtami'),
    'Amanta same-day observances should include Janmashtami on the canonical date'
  );
});

test('Ekadashi names follow source-backed Krishna Paksha month convention', () => {
  for (const calendarSystem of ['purnimant', 'amanta'] as const) {
    const observances = getObservancesForDate(new Date(2026, 7, 9), calendarSystem);
    assert.ok(
      observances.some((item) => item.rule.id === 'kamika-ekadashi'),
      `${calendarSystem} should identify 2026-08-09 as Kamika Ekadashi`
    );
    assert.ok(
      !observances.some((item) => item.rule.id === 'aja-ekadashi'),
      `${calendarSystem} should not identify 2026-08-09 as Aja Ekadashi`
    );
  }
});
