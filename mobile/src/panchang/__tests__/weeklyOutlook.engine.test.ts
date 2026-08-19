import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { computeTaraBala } from '../gochar';
import {
  CHANDRA_BALA_HOUSES,
  computeWeeklyOutlook,
} from '../weeklyOutlook';
import {
  computeKundali,
  getSiderealPlanetLongitude,
  houseForRashi,
  indiaDayAnchor,
  NAKSHATRA_SPAN,
} from '../kundali';

const chart = computeKundali({
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
});

const janmaMoon = chart.grahas.find((position) => position.graha === 'moon')!;

test('weekly outlook engine stays pure and has no wall-clock fallback', () => {
  const source = readFileSync('src/panchang/weeklyOutlook.ts', 'utf8');
  assert.doesNotMatch(
    source,
    /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/
  );
});

test('authored weekly copy stays inside guidance framing and never scores days', () => {
  const source = readFileSync('src/panchang/weeklyOutlook.ts', 'utf8');
  const banned = [
    /will happen/i,
    /guaranteed/i,
    /certainly/i,
    /अवश्य होगा/,
    /निश्चित रूप से/,
    /दुर्भाग्य/,
    /संकट/,
    /खतरा/,
    /lucky/i,
    /unlucky/i,
    /\bscore\b/i,
    /\bgood day\b/i,
    /\bbad day\b/i,
  ];
  for (const pattern of banned) {
    assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
  }
});

test('seven anchored days with consecutive keys and consistent derivations', () => {
  const start = new Date('2026-08-19T09:00:00Z');
  const outlook = computeWeeklyOutlook(chart, start);
  assert.equal(outlook.days.length, 7);
  assert.equal(outlook.janmaRashiIndex, janmaMoon.rashiIndex);
  assert.equal(outlook.janmaNakshatraIndex, janmaMoon.nakshatraIndex);
  assert.equal(outlook.startDateKey, outlook.days[0].dateKey);

  for (const [index, day] of outlook.days.entries()) {
    if (index > 0) {
      assert.equal(
        day.anchor.getTime() - outlook.days[index - 1].anchor.getTime(),
        86_400_000,
        'anchors are consecutive days'
      );
    }
    const moonLongitude = getSiderealPlanetLongitude('moon', day.anchor);
    assert.equal(day.moonRashiIndex, Math.floor(moonLongitude / 30) % 12);
    assert.equal(
      day.chandraBalaHouse,
      houseForRashi(day.moonRashiIndex, janmaMoon.rashiIndex)
    );
    assert.equal(
      day.chandraBalaFavourable,
      CHANDRA_BALA_HOUSES.includes(day.chandraBalaHouse)
    );
    const expectedTara = computeTaraBala(
      janmaMoon.nakshatraIndex,
      Math.floor(moonLongitude / NAKSHATRA_SPAN) % 27
    );
    assert.deepEqual(day.taraBala, expectedTara);
    // Tone matrix: favourable needs both measures supportive; reflective needs
    // both cautioned; anything mixed is steady.
    const expectedTone =
      day.chandraBalaFavourable && expectedTara.tone === 'favourable'
        ? 'favourable'
        : !day.chandraBalaFavourable && expectedTara.tone === 'reflective'
          ? 'reflective'
          : 'steady';
    assert.equal(day.tone, expectedTone);
    // The traditional basis is named in the copy itself.
    assert.ok(day.lineHi.includes(`${day.chandraBalaHouse} भाव`));
    assert.ok(day.lineHi.includes(day.taraBala.nameHi));
    assert.ok(day.lineEn.includes(day.taraBala.nameEn));
    assert.ok(day.lineEn.includes('bhava'));
  }
});

test('outlook is deterministic and anchor-stable within a civil day', () => {
  const morning = new Date('2026-08-19T02:00:00Z');
  const evening = new Date('2026-08-19T16:00:00Z');
  assert.deepEqual(
    computeWeeklyOutlook(chart, morning),
    computeWeeklyOutlook(chart, morning)
  );
  assert.deepEqual(
    computeWeeklyOutlook(chart, morning),
    computeWeeklyOutlook(chart, evening),
    'any instant inside one India civil day yields the same week'
  );
  assert.equal(
    computeWeeklyOutlook(chart, morning).days[0].anchor.getTime(),
    indiaDayAnchor(morning).getTime()
  );
});
