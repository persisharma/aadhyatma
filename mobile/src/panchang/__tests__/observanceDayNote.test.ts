import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePanchangForDate, UJJAIN_GEO } from '../engine';
import { aparahnaSpan, observanceDayNote, type ObservanceDaySolve } from '../observanceDayNote';
import { getRuleById } from '../vratCatalog';

// Real solves, so the notes are pinned against the same astronomy the card sees.
function solveFor(y: number, m: number, d: number): ObservanceDaySolve {
  const p = computePanchangForDate(new Date(y, m - 1, d), { location: UJJAIN_GEO });
  return {
    sunrise: p.sunrise,
    sunset: p.sunset,
    moonrise: p.moonrise,
    tithiIndex: p.tithi.index,
    tithiEnd: p.tithi.endTime,
  };
}
const hhmm = (d: Date) =>
  `${((d.getHours() + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, '0')} ${d.getHours() < 12 ? 'AM' : 'PM'}`;
const noteFor = (id: string, y: number, m: number, d: number) => {
  const rule = getRuleById(id);
  assert.ok(rule, `${id} must exist`);
  return observanceDayNote(rule!, solveFor(y, m, d), hhmm);
};

test('aparahna is the fourth of the day’s five parts, around the sampled midpoint', () => {
  const sunrise = new Date(2026, 8, 10, 6, 0, 0);
  const sunset = new Date(2026, 8, 10, 18, 0, 0);
  const { start, end, mid } = aparahnaSpan(sunrise, sunset);
  assert.equal(start.getHours(), 13, 'starts at 0.6 of a 12 h day');
  assert.equal(end.getHours(), 15, 'ends at 0.8');
  assert.equal(mid.getHours(), 14, 'the midpoint tithiAtAparahna samples');
});

// The reported pair. The two amavasya cards were indistinguishable — same pill,
// same deity, same katha — so nothing said which day carries the fast.
test('the two amavasya rows say what their own day is for (10 vs 11 Sep 2026)', () => {
  const darsha = noteFor('darsha-amavasya', 2026, 9, 10);
  assert.ok(darsha, 'Darsha 10 Sep must carry a note');
  assert.match(darsha!.hi, /^व्रत व पितृ तर्पण इसी दिन — अपराह्न /u);
  assert.match(darsha!.en, /^Kept this day — vrat and pitru tarpan in the aparahna, /u);

  const udaya = noteFor('amavasya-vrat', 2026, 9, 11);
  assert.ok(udaya, 'the udaya row 11 Sep must carry a note');
  assert.equal(udaya!.hi, 'स्नान व दान प्रातः — अमावस्या तिथि 8:56 AM तक');
  assert.equal(udaya!.en, 'Snan and daan at dawn — Amavasya tithi until 8:56 AM');
});

test('on a coinciding day both notes still describe their own rite (10 Oct 2026)', () => {
  // Ashwina 2026: the amavasya covers 10 Oct's sunrise AND its aparahna, so both
  // rules fire on one date and both notes must render — the fast in the
  // afternoon, the snan-daan at dawn.
  assert.match(noteFor('darsha-amavasya', 2026, 10, 10)!.hi, /^व्रत व पितृ तर्पण इसी दिन/u);
  assert.match(noteFor('amavasya-vrat', 2026, 10, 10)!.hi, /^स्नान व दान प्रातः/u);
});

test('the aparahna note is withheld on the lunation no afternoon carries', () => {
  // Ashadha 2026: the amavasya ends 14 Jul 3:13:30 PM, twenty seconds before that
  // day's aparahna midpoint, so the rule seated here via the udaya fallback
  // (RULEBOOK §23.8). The day is still the vrat's; naming an aparahna window the
  // amavasya does not fill would not be true.
  assert.equal(noteFor('darsha-amavasya', 2026, 7, 14), null);
  // The udaya row is genuinely amavasya-at-sunrise that day, so its note stands.
  assert.match(noteFor('amavasya-vrat', 2026, 7, 14)!.hi, /^स्नान व दान प्रातः/u);
});

test('the udaya note never prints a chaturdashi end as the amavasya’s', () => {
  // 10 Sep 2026 is chaturdashi at sunrise (it ends 10:33 AM, when the amavasya
  // opens). The kshaya fallback can seat `amavasya-vrat` on such a day, and
  // `tithiEnd` there is not the amavasya's end.
  assert.equal(noteFor('amavasya-vrat', 2026, 9, 10), null);
});

test('the chandrodaya note is unchanged, and needs a moonrise', () => {
  const sankashti = noteFor('sankashti-chaturthi-vrat', 2026, 8, 31);
  assert.ok(sankashti, '31 Aug 2026 is the Sankashti night');
  assert.match(sankashti!.hi, /^व्रत इसी रात्रि — चंद्रोदय .+, दर्शन व अर्घ्य के बाद पारण$/u);
  assert.match(sankashti!.en, /^Kept this night — moonrise .+, parana after darshan and arghya$/u);

  const rule = getRuleById('sankashti-chaturthi-vrat')!;
  const noMoon = { ...solveFor(2026, 8, 31), moonrise: null };
  assert.equal(observanceDayNote(rule, noMoon, hhmm), null);
});

test('a rule with no note returns null, and an unsolved day never guesses', () => {
  assert.equal(noteFor('masik-shivaratri', 2026, 9, 10), null);
  assert.equal(observanceDayNote(getRuleById('darsha-amavasya')!, null, hhmm), null);
});
