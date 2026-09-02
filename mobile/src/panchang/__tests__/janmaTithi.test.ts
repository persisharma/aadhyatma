// जन्म तिथि (PRD-29 Part A) — pure derivations for the tithis of the living.
// Runs under `tsx --test` (npm run test:engine, TZ=Asia/Kolkata).
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  janmaNakshatraIndex,
  janmaTithiRuleFromBirthDate,
  nakshatraName,
} from '../janmaTithi';
import {
  deriveTithiRuleFromDate,
  entryMatchesDate,
  isValidTithiRule,
  pakshaShraddhaDay,
  solveNextOccurrence,
  tithiRuleMatchesDate,
} from '../pitruSmaran';
import { getSiderealPlanetLongitude, NAKSHATRA_SPAN } from '../kundali';
import { addDays } from '../calendarGrid';

test('janmaTithiRuleFromBirthDate rejects malformed and impossible dates', () => {
  assert.equal(janmaTithiRuleFromBirthDate(''), null);
  assert.equal(janmaTithiRuleFromBirthDate('12-11-1988'), null);
  assert.equal(janmaTithiRuleFromBirthDate('1988-13-01'), null);
  assert.equal(janmaTithiRuleFromBirthDate('2026-02-31'), null);
  assert.equal(janmaTithiRuleFromBirthDate('not-a-date'), null);
});

test('janmaTithiRuleFromBirthDate is the sunrise tithi of the birth civil date (PRD-17 convention)', () => {
  const rule = janmaTithiRuleFromBirthDate('1988-11-12');
  assert.ok(rule, 'a valid birth date derives a rule');
  assert.ok(isValidTithiRule(rule));
  // Identical to the Pitru derivation over the same civil day — one convention,
  // both directions.
  assert.deepEqual(rule, deriveTithiRuleFromDate(new Date(1988, 10, 12)));
});

test('the derived rule solves forward and matches its own occurrence day', () => {
  const rule = janmaTithiRuleFromBirthDate('1988-11-12');
  assert.ok(rule);
  const from = new Date(2026, 0, 1);
  const next = solveNextOccurrence(rule, from);
  assert.ok(next, 'an annual rule places inside 430 days');
  assert.equal(tithiRuleMatchesDate(rule, next), true, 'the solved day matches its own rule');
  assert.equal(
    tithiRuleMatchesDate(rule, addDays(next, 20)),
    false,
    'twenty days later is a different tithi'
  );
});

test('tithiRuleMatchesDate does NOT fire on the Pitru-Paksha mapped day (living ≠ dead)', () => {
  // A Magha rule: its shraddha mapping lands in the Mahalaya fortnight
  // (Bhadrapada/Ashwin), far from the annual day.
  const rule = { lunarMonth: 11, paksha: 'krishna', tithi: 8 } as const;
  const pakshaDay = pakshaShraddhaDay(rule, 2026);
  assert.ok(pakshaDay, 'the fortnight maps the tithi');
  // The dead's matcher fires there; the living's must not.
  assert.equal(entryMatchesDate({ tithiRule: rule }, pakshaDay), true);
  assert.equal(tithiRuleMatchesDate(rule, pakshaDay), false);
});

test('janmaNakshatraIndex agrees with the shared Moon-longitude primitive at the IST instant', () => {
  const profile = { date: '1988-11-12', time: '06:40' };
  const index = janmaNakshatraIndex(profile);
  assert.ok(index !== null && index >= 0 && index <= 26);
  const instant = new Date(Date.UTC(1988, 10, 12, 6, 40) - 330 * 60_000);
  const longitude = getSiderealPlanetLongitude('moon', instant);
  const expected = Math.min(Math.floor((((longitude % 360) + 360) % 360) / NAKSHATRA_SPAN), 26);
  assert.equal(index, expected);
  assert.notEqual(nakshatraName(index, 'hi'), '');
  assert.notEqual(nakshatraName(index, 'en'), '');
});

test('janmaNakshatraIndex rejects malformed inputs', () => {
  assert.equal(janmaNakshatraIndex({ date: 'bad', time: '06:40' }), null);
  assert.equal(janmaNakshatraIndex({ date: '1988-11-12', time: '24:00' }), null);
  assert.equal(janmaNakshatraIndex({ date: '1988-11-12', time: '' }), null);
});
