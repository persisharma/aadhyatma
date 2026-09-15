import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ageBetween,
  ageLabelEn,
  ageLabelHi,
  bhavaLabelEn,
  bhavaLabelHi,
  formatIstDateEn,
  formatIstDateHi,
  ordinalEn,
} from '../reportFormat';

test('English ordinals: 1st 2nd 3rd 4th … 11th 12th 13th 21st 22nd 23rd', () => {
  const expected: Record<number, string> = {
    1: '1st', 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th', 7: '7th', 8: '8th', 9: '9th', 10: '10th',
    11: '11th', 12: '12th', 13: '13th', 21: '21st', 22: '22nd', 23: '23rd', 101: '101st', 111: '111th', 112: '112th',
  };
  for (const [value, label] of Object.entries(expected)) {
    assert.equal(ordinalEn(Number(value)), label);
  }
  // The regression the reviewer read in the export.
  for (let house = 1; house <= 12; house += 1) {
    assert.doesNotMatch(bhavaLabelEn(house), /\b[123]th\b/, `house ${house}`);
  }
});

test('Hindi bhava labels use the classical ordinal words, never a bare digit', () => {
  assert.equal(bhavaLabelHi(1), 'प्रथम भाव');
  assert.equal(bhavaLabelHi(5), 'पंचम भाव');
  assert.equal(bhavaLabelHi(12), 'द्वादश भाव');
  for (let house = 1; house <= 12; house += 1) assert.doesNotMatch(bhavaLabelHi(house), /\d/);
  assert.throws(() => bhavaLabelHi(0));
  assert.throws(() => bhavaLabelHi(13));
  assert.throws(() => bhavaLabelEn(13));
});

test('dates render from the IST civil day regardless of the UTC instant', () => {
  // 2029-07-03 22:00 UTC is 2029-07-04 03:30 IST.
  const late = new Date('2029-07-03T22:00:00Z');
  assert.equal(formatIstDateEn(late), '4 Jul 2029');
  assert.equal(formatIstDateHi(late), '4 जुलाई 2029');
});

test('age spans are whole years and months on the IST calendar, clamped at zero', () => {
  const birth = new Date('2013-08-10T05:00:00Z');
  assert.deepEqual(ageBetween(birth, new Date('2026-09-14T09:00:00Z')), { years: 13, months: 1 });
  assert.deepEqual(ageBetween(birth, new Date('2029-07-04T00:00:00Z')), { years: 15, months: 10 });
  assert.deepEqual(ageBetween(birth, new Date('2010-09-01T00:00:00Z')), { years: 0, months: 0 });
  assert.equal(ageLabelEn({ years: 15, months: 11 }), '15 y 11 m');
  assert.equal(ageLabelEn({ years: 16, months: 0 }), '16 y');
  assert.equal(ageLabelEn({ years: 0, months: 7 }), '7 m');
  assert.equal(ageLabelHi({ years: 15, months: 11 }), '15 वर्ष 11 माह');
});
