import assert from 'node:assert/strict';
import { test } from 'node:test';

import { computePanchangForDate, getSiderealMoonLng, UJJAIN_GEO } from '../engine';
import { agniVaasPlace, chandraVaasDirection, dayVaas } from '../vaas';

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
