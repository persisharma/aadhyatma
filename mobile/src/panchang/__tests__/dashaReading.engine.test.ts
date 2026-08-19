import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  buildDashaReading,
  DASHA_LORD_THEME_EN,
  DASHA_LORD_THEME_HI,
} from '../dashaReading';
import {
  computeKundali,
  DASHA_ORDER,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
} from '../kundali';

const chart = computeKundali({
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
});

test('dasha reading engine stays pure and has no wall-clock fallback', () => {
  const source = readFileSync('src/panchang/dashaReading.ts', 'utf8');
  assert.doesNotMatch(
    source,
    /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/
  );
});

test('authored dasha copy stays inside guidance framing', () => {
  const source = readFileSync('src/panchang/dashaReading.ts', 'utf8');
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
  ];
  for (const pattern of banned) {
    assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
  }
  for (const lord of DASHA_ORDER) {
    assert.ok(DASHA_LORD_THEME_HI[lord].includes('परम्परा'), `${lord} hi names tradition`);
    assert.ok(DASHA_LORD_THEME_EN[lord].startsWith('Tradition'), `${lord} en names tradition`);
  }
});

test('every Mahadasha × Antardasha combination produces a complete reading', () => {
  let combinations = 0;
  for (const maha of chart.vimshottari) {
    for (const antar of maha.antardashas) {
      const midpoint = new Date((antar.start.getTime() + antar.end.getTime()) / 2);
      const reading = buildDashaReading(chart, midpoint);
      assert.ok(reading, `reading exists inside ${maha.lord}/${antar.lord}`);
      combinations += 1;
      assert.equal(reading.mahaLord, maha.lord);
      assert.equal(reading.antarLord, antar.lord);
      assert.equal(reading.mahaStart.getTime(), maha.start.getTime());
      assert.equal(reading.mahaEnd.getTime(), maha.end.getTime());
      assert.equal(reading.antarStart?.getTime(), antar.start.getTime());
      assert.equal(reading.antarEnd?.getTime(), antar.end.getTime());
      assert.ok(reading.titleHi.includes(GRAHA_NAMES_HI[maha.lord]));
      assert.ok(reading.titleEn.includes(GRAHA_NAMES_EN[maha.lord]));
      assert.ok(reading.titleHi.includes(GRAHA_NAMES_HI[antar.lord]));
      assert.ok(reading.titleEn.includes(GRAHA_NAMES_EN[antar.lord]));
      assert.equal(reading.themeHi, DASHA_LORD_THEME_HI[maha.lord]);
      assert.equal(reading.themeEn, DASHA_LORD_THEME_EN[maha.lord]);
      assert.ok(reading.placementHi.length > 0 && reading.placementEn.length > 0);
      assert.ok(reading.natalHouse >= 1 && reading.natalHouse <= 12);
      assert.ok(reading.antarHi && reading.antarEn);
    }
  }
  assert.equal(combinations, 81, 'all 9×9 lord combinations covered');
});

test('reading is deterministic and null outside the 120-year table', () => {
  const at = new Date('2026-08-19T09:00:00Z');
  assert.deepEqual(buildDashaReading(chart, at), buildDashaReading(chart, at));
  const beforeBirth = new Date(chart.vimshottari[0].start.getTime() - 86_400_000);
  assert.equal(buildDashaReading(chart, beforeBirth), null);
  const afterCycle = new Date(
    chart.vimshottari[chart.vimshottari.length - 1].end.getTime() + 86_400_000
  );
  assert.equal(buildDashaReading(chart, afterCycle), null);
});
