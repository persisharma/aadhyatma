import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  activeHouseThemes,
  computeGocharSnapshot,
  computePersonalGuidance,
  computeSadeSati,
  computeTaraBala,
  computeUpcomingIngresses,
  findNextIngress,
  TARA_NAMES_EN,
  TARA_NAMES_HI,
} from '../gochar';
import {
  computeKundali,
  computeRashifal,
  getSiderealPlanetLongitude,
  GRAHA_NAMES_EN,
  GRAHA_NAMES_HI,
  GRAHA_ORDER,
  HOUSE_THEME_EN,
  HOUSE_THEME_HI,
  indiaDayAnchor,
  type KundaliChart,
  type KundaliInput,
} from '../kundali';

const UJJAIN_INPUT: KundaliInput = {
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
};

const chart = computeKundali(UJJAIN_INPUT);

/** Same chart with the Moon re-seated — Sade Sati depends only on janma rashi. */
function withJanma(
  base: KundaliChart,
  rashiIndex: number,
  nakshatraIndex: number
): KundaliChart {
  return {
    ...base,
    grahas: base.grahas.map((position) =>
      position.graha === 'moon'
        ? { ...position, rashiIndex, nakshatraIndex }
        : position
    ),
  };
}

test('gochar engine stays pure and has no wall-clock fallback', () => {
  const source = readFileSync('src/panchang/gochar.ts', 'utf8');
  assert.doesNotMatch(
    source,
    /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/
  );
});

test('authored gochar copy stays inside guidance framing', () => {
  const source = readFileSync('src/panchang/gochar.ts', 'utf8');
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
    /\bcurse\b/i,
  ];
  for (const pattern of banned) {
    assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
  }
});

test('snapshot and personal guidance are deterministic', () => {
  const date = new Date('2026-08-19T09:00:00Z');
  assert.deepEqual(
    computeGocharSnapshot(chart, date),
    computeGocharSnapshot(chart, date)
  );
  assert.deepEqual(
    computePersonalGuidance(chart, date),
    computePersonalGuidance(chart, date)
  );
});

test('snapshot covers all nine grahas with consistent houses', () => {
  const snapshot = computeGocharSnapshot(chart, new Date('2026-08-19T09:00:00Z'));
  assert.equal(snapshot.transits.length, GRAHA_ORDER.length);
  for (const transit of snapshot.transits) {
    assert.ok(transit.transitRashiIndex >= 0 && transit.transitRashiIndex <= 11);
    assert.ok(transit.houseFromMoon >= 1 && transit.houseFromMoon <= 12);
    assert.ok(transit.houseFromLagna >= 1 && transit.houseFromLagna <= 12);
    const expectedMoonHouse =
      ((transit.transitRashiIndex - snapshot.janmaRashiIndex + 12) % 12) + 1;
    assert.equal(transit.houseFromMoon, expectedMoonHouse);
    const expectedLagnaHouse =
      ((transit.transitRashiIndex - snapshot.lagnaRashiIndex + 12) % 12) + 1;
    assert.equal(transit.houseFromLagna, expectedLagnaHouse);
  }
  assert.ok(snapshot.transits.find((t) => t.graha === 'rahu')?.retrograde);
  assert.equal(snapshot.transits.find((t) => t.graha === 'sun')?.retrograde, false);
});

test('tara bala covers the full 27×27 grid with the classical 9-cycle', () => {
  for (let janma = 0; janma < 27; janma += 1) {
    for (let day = 0; day < 27; day += 1) {
      const tara = computeTaraBala(janma, day);
      const expectedIndex = ((((day - janma + 27) % 27) % 9) + 1);
      assert.equal(tara.index, expectedIndex);
      assert.equal(tara.nameHi, TARA_NAMES_HI[expectedIndex - 1]);
      assert.equal(tara.nameEn, TARA_NAMES_EN[expectedIndex - 1]);
      assert.ok(['favourable', 'steady', 'reflective'].includes(tara.tone));
    }
  }
  assert.equal(computeTaraBala(0, 0).nameEn, 'Janma');
  assert.equal(computeTaraBala(0, 0).tone, 'steady');
  assert.equal(computeTaraBala(0, 1).nameEn, 'Sampat');
  assert.equal(computeTaraBala(0, 1).tone, 'favourable');
  assert.equal(computeTaraBala(0, 2).nameEn, 'Vipat');
  assert.equal(computeTaraBala(0, 2).tone, 'reflective');
  assert.equal(computeTaraBala(26, 0).nameEn, 'Sampat');
  assert.throws(() => computeTaraBala(-1, 0));
  assert.throws(() => computeTaraBala(0, 27));
  assert.throws(() => computeTaraBala(0.5, 0));
});

test('personal guidance is a strict superset of computeRashifal', () => {
  const dates = [
    new Date('2025-01-15T09:00:00Z'),
    new Date('2026-08-19T02:00:00Z'),
    new Date('2027-11-02T18:00:00Z'),
  ];
  const janmaRashi = chart.grahas.find((p) => p.graha === 'moon')!.rashiIndex;
  for (const date of dates) {
    const base = computeRashifal(date, janmaRashi);
    const personal = computePersonalGuidance(chart, date);
    for (const key of Object.keys(base) as (keyof typeof base)[]) {
      assert.deepEqual(personal[key], base[key], `field ${key} on ${date.toISOString()}`);
    }
    assert.ok(
      ['navagraha-stotram', 'surya-ashtakam', 'shani-ashtakam'].includes(
        personal.sourceId
      )
    );
    assert.ok(personal.favourHouseFromLagna >= 1 && personal.favourHouseFromLagna <= 12);
    assert.ok(personal.pauseHouseFromLagna >= 1 && personal.pauseHouseFromLagna <= 12);
    assert.ok(
      personal.reflectionHouseFromLagna >= 1 && personal.reflectionHouseFromLagna <= 12
    );
  }
});

test('dasha note appears exactly when a focus transit is a running lord', () => {
  for (let month = 0; month < 24; month += 1) {
    const date = new Date(Date.UTC(2025, month, 10, 6, 0, 0));
    const personal = computePersonalGuidance(chart, date);
    const matches =
      personal.mahaLord === personal.favourGraha
      || personal.mahaLord === personal.pauseGraha
      || personal.antarLord === personal.favourGraha
      || personal.antarLord === personal.pauseGraha;
    assert.equal(personal.dashaNoteHi !== null, matches, date.toISOString());
    assert.equal(personal.dashaNoteEn !== null, matches, date.toISOString());
    if (personal.dashaNoteHi && personal.dashaNoteEn) {
      const named = [personal.favourGraha, personal.pauseGraha].some(
        (graha) =>
          personal.dashaNoteHi!.includes(GRAHA_NAMES_HI[graha])
          && personal.dashaNoteEn!.includes(GRAHA_NAMES_EN[graha])
      );
      assert.ok(named, 'dasha note names the matched graha');
    }
  }
});

test('Saturn ingress into Meena lands in the verified late-March 2025 window', () => {
  const from = new Date('2025-01-15T00:00:00Z');
  const event = findNextIngress('saturn', from, 200);
  assert.ok(event, 'Saturn changes sign within 200 days of Jan 2025');
  assert.equal(event.fromRashiIndex, 10, 'from Kumbha');
  assert.equal(event.toRashiIndex, 11, 'to Meena');
  assert.ok(
    event.at.getTime() >= Date.UTC(2025, 2, 26)
      && event.at.getTime() <= Date.UTC(2025, 3, 2),
    `ingress ${event.at.toISOString()} within 26 Mar – 2 Apr 2025`
  );
  const before = getSiderealPlanetLongitude('saturn', new Date(event.at.getTime() - 2 * 3_600_000));
  const after = getSiderealPlanetLongitude('saturn', event.at);
  assert.ok(before < 330 && after >= 330, 'bisected instant brackets 330°');
});

test('Sade Sati phases move with the 2025 Saturn ingress', () => {
  const beforeIngress = new Date('2025-01-15T09:00:00Z');
  const afterIngress = new Date('2025-06-15T09:00:00Z');
  const cases = [
    { janma: 10, before: 'peak', after: 'setting' },
    { janma: 11, before: 'rising', after: 'peak' },
    { janma: 0, before: 'none', after: 'rising' },
    { janma: 4, before: 'none', after: 'none' },
  ] as const;
  for (const { janma, before, after } of cases) {
    const seated = withJanma(chart, janma, janma * 2);
    const statusBefore = computeSadeSati(seated, beforeIngress, { boundaryScanDays: 0 });
    const statusAfter = computeSadeSati(seated, afterIngress, { boundaryScanDays: 0 });
    assert.equal(statusBefore.phase, before, `janma ${janma} before ingress`);
    assert.equal(statusAfter.phase, after, `janma ${janma} after ingress`);
    assert.equal(statusBefore.nextTransitionAt, null);
    assert.ok(statusBefore.headlineHi.length > 0 && statusBefore.bodyEn.length > 0);
  }
});

test('Sade Sati boundary scan returns the Saturn ingress instant', () => {
  const seated = withJanma(chart, 11, 22);
  const status = computeSadeSati(seated, new Date('2025-01-15T09:00:00Z'));
  assert.ok(status.nextTransitionAt, 'boundary resolved');
  const ingress = findNextIngress(
    'saturn',
    indiaDayAnchor(new Date('2025-01-15T09:00:00Z')),
    1_200
  );
  assert.equal(status.nextTransitionAt!.getTime(), ingress!.at.getTime());
});

test('dhaiya flags surface as secondary observations, never as a phase', () => {
  const beforeIngress = new Date('2025-01-15T09:00:00Z');
  // Saturn in Kumbha (10): 4th from Vrischika (7), 8th from Karka (3).
  const ardha = computeSadeSati(withJanma(chart, 7, 14), beforeIngress, {
    boundaryScanDays: 0,
  });
  assert.equal(ardha.phase, 'none');
  assert.equal(ardha.secondary, 'ardhashtama');
  const ashtama = computeSadeSati(withJanma(chart, 3, 6), beforeIngress, {
    boundaryScanDays: 0,
  });
  assert.equal(ashtama.phase, 'none');
  assert.equal(ashtama.secondary, 'ashtama');
});

test('upcoming ingresses are future-dated, sorted, and sign-consistent', () => {
  const date = new Date('2026-08-19T09:00:00Z');
  const anchor = indiaDayAnchor(date);
  const events = computeUpcomingIngresses(date);
  assert.ok(events.length > 0, 'fast movers guarantee at least one event');
  let previous = 0;
  for (const event of events) {
    assert.ok(event.at.getTime() > anchor.getTime(), 'strictly future');
    assert.ok(event.at.getTime() >= previous, 'sorted soonest first');
    previous = event.at.getTime();
    assert.notEqual(event.fromRashiIndex, event.toRashiIndex);
    const atRashi = Math.floor(getSiderealPlanetLongitude(event.graha, event.at) / 30) % 12;
    assert.equal(atRashi, event.toRashiIndex, `${event.graha} sign at instant`);
  }
});

test('findNextIngress validates inputs and honours maxDays', () => {
  assert.throws(() => findNextIngress('sun', new Date(Number.NaN), 10));
  assert.throws(() => findNextIngress('sun', new Date('2026-01-01T00:00:00Z'), 0));
  // Saturn cannot change sign within a couple of days.
  assert.equal(findNextIngress('saturn', new Date('2026-01-01T00:00:00Z'), 2), null);
});

test('active house themes are unique, sorted, and theme-aligned', () => {
  const snapshot = computeGocharSnapshot(chart, new Date('2026-08-19T09:00:00Z'));
  const themes = activeHouseThemes(snapshot);
  const houses = themes.map((entry) => entry.house);
  assert.deepEqual(houses, [...new Set(houses)].sort((a, b) => a - b));
  for (const entry of themes) {
    assert.equal(entry.themeHi, HOUSE_THEME_HI[entry.house - 1]);
    assert.equal(entry.themeEn, HOUSE_THEME_EN[entry.house - 1]);
  }
  const supportiveHouses = new Set(
    snapshot.transits.filter((t) => t.supportive).map((t) => t.houseFromMoon)
  );
  assert.equal(themes.length, supportiveHouses.size);
});
