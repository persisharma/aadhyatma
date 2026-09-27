import assert from 'node:assert/strict';
import { test } from 'node:test';

import drikFixture from './fixtures/drikpanchang-ujjain.json';

import { computePanchangForDate, getSiderealMoonLng, UJJAIN_GEO } from '../engine';
import { NAKSHATRA_NAMES_EN, TITHI_NAMES_EN } from '../names';
import { agniVaasPlace, chandraVaasDirection, dayVaas, vaasTiles } from '../vaas';

test('chandra vaas maps each rashi to its element direction', () => {
  const expected = [
    'east', 'south', 'west', 'north', // मेष वृषभ मिथुन कर्क
    'east', 'south', 'west', 'north', // सिंह कन्या तुला वृश्चिक
    'east', 'south', 'west', 'north', // धनु मकर कुम्भ मीन
  ];
  assert.deepEqual(Array.from({ length: 12 }, (_, i) => chandraVaasDirection(i)), expected);
  assert.equal(chandraVaasDirection(12), 'east'); // मीन → मेष wraps
});

test('agni vaas: (tithi + 1 + vara) mod 4 — 0/3 prithvi, 1 akash, 2 patal', () => {
  // शुक्ल प्रतिपदा (1) on रविवार (1): 1 + 1 + 1 = 3 → पृथ्वी.
  assert.equal(agniVaasPlace(0, 0), 'prithvi');
  // शुक्ल द्वितीया (2) on रविवार: 4 → 0 → पृथ्वी.
  assert.equal(agniVaasPlace(1, 0), 'prithvi');
  // शुक्ल तृतीया (3) on रविवार: 5 → 1 → आकाश.
  assert.equal(agniVaasPlace(2, 0), 'akash');
  // शुक्ल चतुर्थी (4) on रविवार: 6 → 2 → पाताल.
  assert.equal(agniVaasPlace(3, 0), 'patal');
  // अमावस्या (30) on शनिवार (7): 38 → 2 → पाताल.
  assert.equal(agniVaasPlace(29, 6), 'patal');
});

test('the engine solves the Moon rashi at sunrise and its change instant', () => {
  let sawChange = false;
  for (let d = 1; d <= 30; d++) {
    const p = computePanchangForDate(new Date(2026, 8, d), { location: UJJAIN_GEO });
    const year = p.sunrise.getFullYear();
    assert.equal(p.moonRashi.index, Math.floor(getSiderealMoonLng(p.sunrise, year) / 30));
    if (p.moonRashi.endTime) {
      sawChange = true;
      const before = new Date(p.moonRashi.endTime.getTime() - 60_000);
      const after = new Date(p.moonRashi.endTime.getTime() + 60_000);
      assert.equal(Math.floor(getSiderealMoonLng(before, year) / 30), p.moonRashi.index);
      assert.equal(Math.floor(getSiderealMoonLng(after, year) / 30), (p.moonRashi.index + 1) % 12);
    }
  }
  assert.ok(sawChange, 'a month must contain Moon sign changes');
});

test('dayVaas carries the sunrise reading, its end, and what follows', () => {
  const base = { vara: { index: 0, nameHi: '', nameEn: '' } };
  const tithiEnd = new Date(2026, 8, 27, 15, 0);
  const rashiEnd = new Date(2026, 8, 27, 20, 0);
  const v = dayVaas({
    ...base,
    tithi: { index: 1, paksha: 'shukla', nameHi: '', nameEn: '', endTime: tithiEnd },
    moonRashi: { index: 3, nameHi: '', nameEn: '', endTime: rashiEnd },
  });
  assert.deepEqual(v.chandra, { value: 'north', until: rashiEnd, next: 'east' });
  // द्वितीया on रविवार = पृथ्वी, then तृतीया = आकाश.
  assert.deepEqual(v.agni, { value: 'prithvi', until: tithiEnd, next: 'akash' });

  const steady = dayVaas({
    ...base,
    tithi: { index: 0, paksha: 'shukla', nameHi: '', nameEn: '', endTime: tithiEnd },
    moonRashi: { index: 3, nameHi: '', nameEn: '', endTime: null },
  });
  assert.deepEqual(steady.chandra, { value: 'north', until: null, next: null });
  // प्रतिपदा → द्वितीया on रविवार stays पृथ्वी (3 → 0), so no change is named.
  assert.deepEqual(steady.agni, { value: 'prithvi', until: null, next: null });
});

test('disha shool follows the vara (Sun/Fri W, Mon/Sat E, Tue/Wed N, Thu S)', () => {
  const expected = ['west', 'east', 'north', 'north', 'south', 'west', 'east'];
  const got = Array.from({ length: 7 }, (_, i) =>
    dayVaas({
      vara: { index: i, nameHi: '', nameEn: '' },
      tithi: { index: 0, paksha: 'shukla', nameHi: '', nameEn: '', endTime: null },
      moonRashi: { index: 0, nameHi: '', nameEn: '', endTime: null },
    }).dishaShool,
  );
  assert.deepEqual(got, expected);
});

test('the चन्द्रमा tile names the rashi and the next one when it changes', () => {
  const end = new Date(2026, 8, 27, 20, 0);
  const moonRashi = { index: 11, nameHi: 'मीन', nameEn: 'Meena', endTime: end };
  const t = vaasTiles(
    dayVaas({
      vara: { index: 0, nameHi: '', nameEn: '' },
      tithi: { index: 0, paksha: 'shukla', nameHi: '', nameEn: '', endTime: null },
      moonRashi,
    }),
    moonRashi,
  );
  assert.equal(t.chandrama.element.nameHi, 'मीन');
  assert.deepEqual(t.chandrama.successor, { nameHi: 'मेष', nameEn: 'Mesha' });
  assert.equal(t.dishaShool.element.nameHi, 'पश्चिम');
  assert.equal(t.dishaShool.successor, null);
  // The havan verdict is its own line, never glued onto the headline.
  assert.equal(t.agni.element.nameHi, 'पृथ्वी');
  assert.deepEqual(t.agni.note, { hi: 'हवन शुभ', en: 'havan favoured' });
});

// Cross-check against the recorded drikpanchang.com Ujjain days (Mar–Jul 2026):
// अग्नि वास and दिशा शूल read only the sunrise tithi + vara, and चन्द्रमा/चन्द्र वास
// only the Moon's rashi, so these inputs matching Drik is what makes the tiles
// match Drik. The rashi is implied by Drik's nakshatra wherever that nakshatra
// lies wholly inside one sign (18 of 27); straddling nakshatras are skipped.
// The reading CONVENTIONS themselves are not in the fixture (see vaas.ts).
test('vaas inputs agree with the recorded Drik Panchang days', () => {
  const days = (drikFixture as { days: Array<{ date: string; weekday: number; paksha: string; tithi: string; nakshatra: string }> }).days;
  let rashiChecked = 0;
  for (const d of days) {
    const [y, m, dd] = d.date.split('-').map(Number);
    const p = computePanchangForDate(new Date(y, m - 1, dd), { location: UJJAIN_GEO });
    const tithi = TITHI_NAMES_EN.indexOf(d.tithi) + (d.paksha === 'krishna' && d.tithi !== 'Amavasya' ? 15 : 0);
    assert.equal(p.tithi.index, tithi, `${d.date} tithi`);
    assert.equal(p.vara.index, d.weekday, `${d.date} vara`);
    const nak = NAKSHATRA_NAMES_EN.indexOf(d.nakshatra);
    assert.ok(nak >= 0, `${d.date} nakshatra ${d.nakshatra}`);
    const lo = Math.floor((nak * 360) / 27 / 30);
    const hi = Math.floor(((nak + 1) * 360) / 27 / 30 - 1e-9);
    if (lo === hi) {
      rashiChecked++;
      assert.equal(p.moonRashi.index, lo, `${d.date} moon rashi`);
    }
  }
  assert.ok(rashiChecked > 60, `only ${rashiChecked} days had an unambiguous rashi`);
});

// Published Delhi almanac rows (Hindi dailies, Sept 2026), within 5 minutes:
// 21 Sep — Moon in धनु until 11:15 AM, then मकर; दिशा शूल पूर्व (Monday).
// 28 Sep — Moon enters मेष; द्वितीया until 7:13 PM; दिशा शूल पूर्व.
// 26 Sep — Moon in मीन; पूर्णिमा until 10:19 PM.
test('moon sign changes match published Delhi almanac rows', () => {
  const DELHI = { latitude: 28.6139, longitude: 77.209, elevation: 216 };
  const near = (a: Date | null, h: number, m: number, label: string) => {
    assert.ok(a, `${label}: no instant`);
    const mins = a!.getHours() * 60 + a!.getMinutes();
    assert.ok(Math.abs(mins - (h * 60 + m)) <= 5, `${label}: ${a!.toString()}`);
  };
  const s21 = computePanchangForDate(new Date(2026, 8, 21), { location: DELHI });
  assert.equal(s21.moonRashi.index, 8); // धनु
  near(s21.moonRashi.endTime, 11, 15, '21 Sep धनु → मकर');
  assert.equal(dayVaas(s21).dishaShool, 'east');

  const s28 = computePanchangForDate(new Date(2026, 8, 28), { location: DELHI });
  assert.equal(s28.moonRashi.index, 11); // मीन at sunrise, मेष after
  assert.ok(s28.moonRashi.endTime, '28 Sep: Moon enters मेष during the day');
  near(s28.tithi.endTime, 19, 13, '28 Sep द्वितीया end');
  assert.equal(dayVaas(s28).dishaShool, 'east');

  const s26 = computePanchangForDate(new Date(2026, 8, 26), { location: DELHI });
  assert.equal(s26.moonRashi.index, 11);
  near(s26.tithi.endTime, 22, 19, '26 Sep पूर्णिमा end');
});
