/**
 * Hora engine (PRD-16/P3 §4.5, §10): 12 + 12 unequal hours tiling day and
 * night, weekday-lord first hora, classical descending-speed sequence.
 *
 * The ruler sequence is checked against the universally published hora rule
 * (first hora = weekday lord; order Sun→Venus→Mercury→Moon→Saturn→Jupiter→
 * Mars), whose structural consequence — the 25th hora is the NEXT weekday's
 * lord — is asserted for all seven weekdays; that property only holds for the
 * correct table, so a transcription slip cannot pass. Hora is evidence and
 * tie-break only (RULEBOOK §17): eventMuhuratPhase3.test.ts pins that it
 * never moves a tier.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { horaForDay, horaAt, BENEFIC_HORA, HORA_NAMES_HI, type HoraRuler } from '../hora';

const WEEKDAY_LORD: HoraRuler[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const SEQUENCE: HoraRuler[] = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars'];

const sunrise = new Date(2026, 7, 17, 6, 4);
const sunset = new Date(2026, 7, 17, 18, 58);
const nextSunrise = new Date(2026, 7, 18, 6, 4, 30);

test('24 horas tile sunrise → next sunrise; 12 day + 12 night', () => {
  const horas = horaForDay(sunrise, sunset, nextSunrise, 1);
  assert.equal(horas.length, 24);
  assert.equal(horas.filter((h) => h.isDay).length, 12);
  assert.equal(horas[0].start.getTime(), sunrise.getTime());
  assert.equal(horas[11].end.getTime(), sunset.getTime());
  assert.equal(horas[12].start.getTime(), sunset.getTime());
  assert.equal(horas[23].end.getTime(), nextSunrise.getTime());
  for (let i = 1; i < 24; i += 1) {
    assert.equal(horas[i].start.getTime(), horas[i - 1].end.getTime(), `gap at hora ${i}`);
  }
  // Unequal hours: a day hour and a night hour differ unless day == night.
  const dayHour = horas[0].end.getTime() - horas[0].start.getTime();
  const nightHour = horas[12].end.getTime() - horas[12].start.getTime();
  assert.notEqual(dayHour, nightHour);
});

test('first hora is the weekday lord; sequence follows the classical order; 25th hora = next weekday lord', () => {
  for (let weekday = 0; weekday < 7; weekday += 1) {
    const horas = horaForDay(sunrise, sunset, nextSunrise, weekday);
    assert.equal(horas[0].ruler, WEEKDAY_LORD[weekday], `weekday ${weekday} first hora`);
    const startIndex = SEQUENCE.indexOf(horas[0].ruler);
    for (let i = 0; i < 24; i += 1) {
      assert.equal(horas[i].ruler, SEQUENCE[(startIndex + i) % 7], `weekday ${weekday} hora ${i}`);
    }
    // The property that pins the table: 24 horas later the cycle lands on the
    // NEXT weekday's lord (24 ≡ 3 mod 7 — exactly the lord-to-lord stride).
    const twentyFifth = SEQUENCE[(startIndex + 24) % 7];
    assert.equal(twentyFifth, WEEKDAY_LORD[(weekday + 1) % 7], `weekday ${weekday} 25th hora`);
  }
});

test('horaAt resolves the containing hora; outside the range → null', () => {
  const horas = horaForDay(sunrise, sunset, nextSunrise, 4);
  const noonish = new Date(2026, 7, 17, 12, 30);
  const hit = horaAt(horas, noonish);
  assert.ok(hit && hit.isDay);
  assert.ok(hit!.start.getTime() <= noonish.getTime() && noonish.getTime() < hit!.end.getTime());
  assert.equal(horaAt(horas, new Date(sunrise.getTime() - 1)), null);
  assert.equal(horaAt(horas, nextSunrise), null);
});

test('benefic tie-break set is exactly Guru/Shukra/Budh; names carry Devanagari', () => {
  assert.deepEqual([...BENEFIC_HORA].sort(), ['jupiter', 'mercury', 'venus']);
  for (const ruler of SEQUENCE) assert.match(HORA_NAMES_HI[ruler], /[ऀ-ॿ]/);
});

test('hora source stays pure: no wall clock, randomness, network, storage, React, or astronomy', () => {
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../hora.ts'), 'utf8');
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
  assert.doesNotMatch(source, /astronomy-engine|from ['"]\.\/kundali['"]|from ['"]\.\/engine['"]/);
});
