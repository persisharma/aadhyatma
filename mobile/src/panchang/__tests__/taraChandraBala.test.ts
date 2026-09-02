/**
 * Tarabala/Chandrabala engine (PRD-16 Phase 4, §10): the full 27×27 tara
 * matrix and 12×12 chandra matrix row-for-row against
 * docs/roadmap/conventions/muhurat-tarabala-v1.md, चंद्राष्टम, the
 * जन्म-contested flag, and the divergence-from-Guna-Milan-Tara guard.
 *
 * The expected classes below are TRANSCRIBED from the convention doc's tables
 * (the calculation contract), not from engine output — change the doc and the
 * code together, with a new convention id.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CHANDRASHTAMA_POSITION,
  TARA_NAMES_HI,
  TARA_NAMES_EN,
  chandrabala,
  janmaFromMoonLongitude,
  tarabala,
  type TaraClass,
} from '../taraChandraBala';
import { NAKSHATRA_SPAN } from '../kundali';

// muhurat-tarabala-v1.md — "The nine taras", verbatim.
const DOC_TARA_CLASSES: readonly TaraClass[] = [
  'contested', // 1 जन्म
  'favourable', // 2 सम्पत्
  'unfavourable', // 3 विपत्
  'favourable', // 4 क्षेम
  'unfavourable', // 5 प्रत्यरि
  'favourable', // 6 साधक
  'unfavourable', // 7 वध
  'favourable', // 8 मित्र
  'favourable', // 9 परम मित्र
];

// muhurat-tarabala-v1.md — "Chandrabala positions", verbatim.
const DOC_CHANDRA_CLASSES: readonly TaraClass[] = [
  'favourable', // 1
  'contested', // 2
  'favourable', // 3
  'unfavourable', // 4
  'contested', // 5
  'favourable', // 6
  'favourable', // 7
  'unfavourable', // 8 — चंद्राष्टम
  'contested', // 9
  'favourable', // 10
  'favourable', // 11
  'unfavourable', // 12
];

test('the full 27×27 tara matrix matches muhurat-tarabala-v1.md row-for-row', () => {
  for (let janma = 0; janma < 27; janma += 1) {
    for (let day = 0; day < 27; day += 1) {
      const count = ((day - janma + 27) % 27) + 1; // inclusive, janma → day
      const expectedTara = ((count - 1) % 9) + 1;
      const { tara, cls } = tarabala(janma, day);
      assert.equal(tara, expectedTara, `tara(${janma},${day})`);
      assert.equal(cls, DOC_TARA_CLASSES[expectedTara - 1], `class(${janma},${day})`);
    }
  }
});

test('the full 12×12 chandra matrix matches muhurat-tarabala-v1.md row-for-row', () => {
  for (let janma = 0; janma < 12; janma += 1) {
    for (let day = 0; day < 12; day += 1) {
      const expectedPosition = ((day - janma + 12) % 12) + 1;
      const { position, cls } = chandrabala(janma, day);
      assert.equal(position, expectedPosition, `position(${janma},${day})`);
      assert.equal(cls, DOC_CHANDRA_CLASSES[expectedPosition - 1], `class(${janma},${day})`);
    }
  }
});

test('चंद्राष्टम: the 8th from the janma rashi is the strongest bar, at every janma rashi', () => {
  assert.equal(CHANDRASHTAMA_POSITION, 8);
  for (let janma = 0; janma < 12; janma += 1) {
    const eighth = (janma + 7) % 12;
    const { position, cls } = chandrabala(janma, eighth);
    assert.equal(position, 8);
    assert.equal(cls, 'unfavourable');
  }
});

test('the जन्म tara (same nakshatra, and +9/+18) is CONTESTED, never a plain verdict', () => {
  for (let janma = 0; janma < 27; janma += 1) {
    for (const offset of [0, 9, 18]) {
      const { tara, cls } = tarabala(janma, (janma + offset) % 27);
      assert.equal(tara, 1);
      assert.equal(cls, 'contested');
    }
  }
});

test('DIVERGENCE GUARD: muhurat Tarabala disagrees with the Guna Milan Tara koota by design', () => {
  // The Ashtakoota Tara (gunaMilan.ts taraHalf) scores a same-nakshatra
  // direction FAVOURABLY (remainder 1 → 1.5 of 1.5); muhurat Tarabala calls
  // the same relation जन्म and CONTESTED. Assert the disagreement on a
  // concrete pair so nobody "unifies" the two conventions (the trap named in
  // PRD-16/P3 §8.2 and muhurat-tarabala-v1.md).
  const janma = 7; // Pushya
  const day = 7;
  const gunaMilanRemainder = ((((day - janma + 27) % 27) + 1) % 9); // = 1
  const kootaFavourable = ![3, 5, 7].includes(gunaMilanRemainder); // taraHalf's rule → true
  assert.equal(kootaFavourable, true, 'the koota scores this direction favourably');
  assert.equal(tarabala(janma, day).cls, 'contested', 'muhurat Tarabala must NOT follow the koota');
});

test('janma derivation floors like gunaMilan/kundali (13°20′ nakshatras, 30° rashis)', () => {
  // Pushya spans 93°20′–106°40′; Karka spans 90°–120° (the prototype's example).
  const pushyaMid = 100;
  assert.deepEqual(janmaFromMoonLongitude(pushyaMid), { nakshatraIndex: 7, rashiIndex: 3 });
  // Boundary: exactly at a span start belongs to the higher cell.
  assert.equal(janmaFromMoonLongitude(NAKSHATRA_SPAN * 7).nakshatraIndex, 7);
  assert.equal(janmaFromMoonLongitude(NAKSHATRA_SPAN * 7 - 1e-9).nakshatraIndex, 6);
  assert.equal(janmaFromMoonLongitude(0).nakshatraIndex, 0);
  assert.equal(janmaFromMoonLongitude(359.999).rashiIndex, 11);
});

test('tara names carry Devanagari + English, all nine', () => {
  assert.equal(TARA_NAMES_HI.length, 9);
  assert.equal(TARA_NAMES_EN.length, 9);
  for (const n of TARA_NAMES_HI) assert.match(n, /[ऀ-ॿ]/);
});

test('taraChandraBala source stays pure: no wall clock, randomness, network, storage, React, or astronomy', () => {
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../taraChandraBala.ts'), 'utf8');
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
  assert.doesNotMatch(source, /astronomy-engine|getSiderealPlanetLongitude/);
  // And it must never import the Ashtakoota convention it diverges from.
  assert.doesNotMatch(source, /from ['"]\.\/gunaMilan/);
});
