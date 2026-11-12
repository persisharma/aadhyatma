import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buildDashaPractice, DASHA_PRACTICE_NOTE } from '../dashaPractice';
import { GRAHA_UPAY, MANTRA_COUNT } from '../grahaReadingContent';
import { computeKundali, DASHA_ORDER, GRAHA_NAMES_EN, GRAHA_NAMES_HI, indiaDateKey } from '../kundali';
import { formatIstDateEn, formatIstDateHi } from '../reportFormat';

const chart = computeKundali({
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
});
const ADULT_AT = new Date('2026-11-12T06:30:00Z');

test('dasha practice engine stays pure and has no wall-clock fallback', () => {
  const source = readFileSync('src/panchang/dashaPractice.ts', 'utf8');
  assert.doesNotMatch(
    source,
    /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/
  );
});

test('the practice of every Mahadasha is its lord’s GRAHA_UPAY row, word for word', () => {
  assert.deepEqual([...chart.vimshottari.map((period) => period.lord)].sort(), [...DASHA_ORDER].sort());
  for (const period of chart.vimshottari) {
    const practice = buildDashaPractice(chart, period, ADULT_AT);
    assert.ok(practice, `${period.lord} has a practice for an adult`);
    const row = GRAHA_UPAY[period.lord];
    assert.equal(practice.lord, period.lord);
    assert.deepEqual(practice.upay, {
      vaarHi: row.vaarHi,
      vaarEn: row.vaarEn,
      daanHi: row.daanHi,
      daanEn: row.daanEn,
      sevaHi: row.sevaHi,
      sevaEn: row.sevaEn,
      mantraHi: row.mantraHi,
      mantraEn: row.mantraEn,
      mantraCountHi: MANTRA_COUNT.hi,
      mantraCountEn: MANTRA_COUNT.en,
      practiceSourceId: row.practiceSourceId,
    });
    assert.ok(practice.titleHi.startsWith(GRAHA_NAMES_HI[period.lord]));
    assert.ok(practice.titleEn.startsWith(GRAHA_NAMES_EN[period.lord]));
    // The intro names the period by its own IST dates — a calculated window.
    assert.ok(practice.introHi.includes(formatIstDateHi(period.start)) && practice.introHi.includes(formatIstDateHi(period.end)));
    assert.ok(practice.introEn.includes(formatIstDateEn(period.start)) && practice.introEn.includes(formatIstDateEn(period.end)));
    assert.equal(practice.noteHi, DASHA_PRACTICE_NOTE.hi);
    assert.equal(practice.noteEn, DASHA_PRACTICE_NOTE.en);
    // §14.3.1: the statement names the chart fact it came from.
    assert.deepEqual(practice.basis, [
      { kind: 'dasha', level: 'maha', lord: period.lord, startKey: indiaDateKey(period.start), endKey: indiaDateKey(period.end) },
    ]);
  }
});

test('a minor gets no practice — the surface keeps what it showed before', () => {
  const period = chart.vimshottari[0];
  const birth = chart.input.date.getTime();
  const year = 365.2425 * 86_400_000;
  assert.equal(buildDashaPractice(chart, period, new Date(birth + 5 * year)), null, 'child');
  assert.equal(buildDashaPractice(chart, period, new Date(birth + 15 * year)), null, 'adolescent');
  assert.ok(buildDashaPractice(chart, period, new Date(birth + 18.1 * year)), 'adult');
});

test('authored practice copy stays inside the upaya framing', () => {
  const source = readFileSync('src/panchang/dashaPractice.ts', 'utf8');
  const banned = [
    /will happen/i,
    /guaranteed/i,
    /certainly/i,
    /अवश्य होगा/,
    /निश्चित रूप से/,
    /दुर्भाग्य/,
    /संकट/,
    /खतरा/,
    /\bdoom\b/i,
    /misfortune/i,
    /\bdanger\b/i,
    /\bcure/i,
    /protect/i,
    /gemstone/i,
    /रत्न/,
    /consult an astrologer/i,
    /उपाय खरीदें/,
    /dosha/i,
    /दोष/,
  ];
  for (const pattern of banned) assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
  assert.match(DASHA_PRACTICE_NOTE.en, /not a fix or a guarantee/);
  assert.match(DASHA_PRACTICE_NOTE.hi, /अभ्यास/);
});
