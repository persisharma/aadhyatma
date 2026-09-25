import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { computeKundali, GRAHA_ORDER, type KundaliChart } from '../kundali';
import {
  CLOSE_CONJUNCTION_ORB_DEGREES,
  computeCombinations,
  formatSeparation,
  separationWithinSign,
  YOGA_DEFINITIONS,
} from '../kundaliYoga';

const chart = computeKundali({
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
});

test('combinations engine stays pure', () => {
  const source = readFileSync('src/panchang/kundaliYoga.ts', 'utf8');
  assert.doesNotMatch(source, /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/);
});

test('authored combination copy stays inside guidance framing and names tradition', () => {
  const source = readFileSync('src/panchang/kundaliYoga.ts', 'utf8');
  for (const pattern of [/will happen/i, /guaranteed/i, /certainly/i, /अवश्य होगा/, /निश्चित रूप से/, /दुर्भाग्य/, /संकट/, /खतरा/, /\bdoom\b/i, /misfortune/i, /\bcurse\b/i, /\bdanger\b/i, /मृत्यु/, /\bdeath\b/i, /lifespan/i, /gemstone/i, /रत्न/]) {
    assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
  }
  for (const def of YOGA_DEFINITIONS) {
    assert.ok(def.themeHi.includes('परम्परा'), `${def.id} hi names tradition`);
    assert.ok(/tradition/i.test(def.themeEn), `${def.id} en names tradition`);
  }
});

test('no yoga definition claims verification before its two-source review', () => {
  for (const def of YOGA_DEFINITIONS) {
    assert.equal(def.source.verified, false, def.id);
    assert.ok(def.source.notes.length > 0, def.id);
  }
});

test('every combination carries a non-empty basis, the list is capped and deterministic', () => {
  const first = computeCombinations(chart);
  const second = computeCombinations(chart);
  assert.deepEqual(first, second);
  assert.ok(first.length >= 1 && first.length <= 6, `count ${first.length}`);
  for (const combination of first) {
    assert.ok(combination.basis.length > 0, `${combination.id} basis`);
    assert.ok(combination.titleHi && combination.titleEn && combination.bodyHi && combination.bodyEn, combination.id);
  }
  // Ranked by weight desc, then id — never by insertion.
  for (let i = 1; i < first.length; i += 1) {
    const a = first[i - 1];
    const b = first[i];
    assert.ok(a.weight > b.weight || (a.weight === b.weight && a.id.localeCompare(b.id) <= 0), `${a.id} before ${b.id}`);
  }
  assert.equal(first[0].kind, 'lagna-lord', 'the Lagna lord always leads');
  assert.equal(computeCombinations(chart, { cap: 2 }).length, 2);
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first, 'plain JSON');
});

/** Re-seat grahas synthetically so every detector has a positive case. */
function seat(base: KundaliChart, placements: Partial<Record<(typeof GRAHA_ORDER)[number], number>>): KundaliChart {
  return {
    ...base,
    grahas: base.grahas.map((position) => {
      const house = placements[position.graha];
      if (house === undefined) return position;
      return { ...position, house, rashiIndex: (base.lagnaRashiIndex + house - 1) % 12 };
    }),
  };
}

test('detectors: conjunction, Budhaditya, Gajakesari, Chandra-Mangal, dignity all fire on a seated chart', () => {
  // Tula Lagna (index 6) → house h holds rashi (6 + h - 1) % 12.
  const tula: KundaliChart = { ...chart, lagnaRashiIndex: 6, houses: Array.from({ length: 12 }, (_, i) => (6 + i) % 12) };
  const seated = seat(tula, {
    saturn: 1, // Tula → Saturn exalted in the Lagna
    rahu: 1,
    sun: 11, // Simha → Sun own sign
    mercury: 11,
    mars: 10,
    jupiter: 9,
    moon: 6,
    venus: 12,
    ketu: 7,
  });
  const all = computeCombinations(seated, { cap: 50 });
  const ids = all.map((combination) => combination.id);
  assert.ok(ids.includes('conj-sun-mercury-11'), `Sun+Mercury conjunction: ${ids.join(', ')}`);
  assert.ok(ids.includes('conj-saturn-rahu-1'), 'Saturn+Rahu conjunction in the Lagna');
  assert.ok(ids.includes('yoga-budhaditya'), 'Budhaditya');
  // Jupiter in the 9th, Moon in the 6th → Jupiter is 4th from the Moon (a kendra).
  assert.ok(ids.includes('yoga-gajakesari'), 'Gajakesari');
  assert.ok(ids.includes('dignity-saturn-exalted'), 'Saturn exalted');
  assert.ok(ids.includes('dignity-sun-own'), 'Sun own sign');
  assert.ok(ids[0].startsWith('lagna-lord-venus-12'), 'Lagna lord Venus in the 12th leads');
  const lagnaLord = all[0];
  assert.ok(lagnaLord.bodyEn.includes('dusthana'));
  const conj = all.find((combination) => combination.id === 'conj-saturn-rahu-1')!;
  assert.equal(conj.basis.length, 3, 'bhava + two grahas');
  assert.ok(conj.bodyEn.includes('1st bhava'), 'ordinal grammar in composed copy');
  assert.doesNotMatch(conj.bodyEn, /\b1th\b/);

  const withChandraMangal = seat(tula, { moon: 6, mars: 6 });
  assert.ok(computeCombinations(withChandraMangal, { cap: 50 }).some((c) => c.id === 'yoga-chandra-mangal'));

  // Cap: the default six is a hard ceiling even with ten candidates.
  assert.ok(all.length > 6, 'seated chart yields more than the cap');
  assert.equal(computeCombinations(seated).length, 6);
});

test('kendra–trikona and dhana yogas fire on lord association and never double-count the Lagna lord', () => {
  // Simha Lagna (index 4): 10th = Vrishabha (Venus), 5th = Dhanu (Jupiter), 2nd = Kanya (Mercury), 11th = Mithuna (Mercury).
  const simha: KundaliChart = { ...chart, lagnaRashiIndex: 4, houses: Array.from({ length: 12 }, (_, i) => (4 + i) % 12) };
  // Venus (10th lord) and Jupiter (5th lord) together in the 10th → kendra–trikona.
  const kt = seat(simha, { venus: 10, jupiter: 10, mercury: 2 });
  const ktIds = computeCombinations(kt, { cap: 50 }).map((c) => c.id);
  assert.ok(ktIds.includes('yoga-kendra-trikona'), ktIds.join(', '));
  // Mercury rules both 2 and 11 here; seated in the 2nd → dhana (lords in the wealth houses).
  assert.ok(ktIds.includes('yoga-dhana'), 'dhana on a single lord seated in a wealth house');
  const kendraTrikona = computeCombinations(kt, { cap: 50 }).find((c) => c.id === 'yoga-kendra-trikona')!;
  assert.ok(!kendraTrikona.grahas.includes('sun'), 'the Lagna lord (Sun) is not counted on the kendra side');
});

test('same-sign groups always state the degree gap and only call a tight pair a close conjunction', () => {
  const tula: KundaliChart = { ...chart, lagnaRashiIndex: 6, houses: Array.from({ length: 12 }, (_, i) => (6 + i) % 12) };
  const seated = seat(tula, { sun: 11, mercury: 11 });
  const withDegrees = (sunDeg: number, mercuryDeg: number, mercuryRetro = false): KundaliChart => ({
    ...seated,
    grahas: seated.grahas.map((position) =>
      position.graha === 'sun'
        ? { ...position, degreeInRashi: sunDeg, retrograde: false }
        : position.graha === 'mercury'
          ? { ...position, degreeInRashi: mercuryDeg, retrograde: mercuryRetro }
          : position
    ),
  });
  const wide = computeCombinations(withDegrees(25.033, 14.5, true), { cap: 50 });
  const wideConj = wide.find((combination) => combination.id === 'conj-sun-mercury-11')!;
  assert.equal(wideConj.titleEn, 'Sun and Mercury in the same bhava · 11th bhava');
  assert.equal(wideConj.titleHi, 'सूर्य और बुध एक ही भाव में · एकादश भाव');
  assert.ok(wideConj.bodyEn.includes('about 10°32′ apart — the whole-sign reading places them in one bhava; this is not a tight conjunction. Mercury is retrograde.'), wideConj.bodyEn);
  assert.ok(wideConj.bodyHi.includes('10°32′'));
  const wideYoga = wide.find((combination) => combination.id === 'yoga-budhaditya')!;
  assert.equal(wideYoga.titleEn, 'Sun–Mercury association · Budhaditya yoga (traditional same-sign rule)');
  assert.ok(wideYoga.bodyEn.includes('10°32′ apart'));
  assert.ok(wideYoga.bodyEn.includes('not a yoga of equal strength in every chart'));

  const close = computeCombinations(withDegrees(12, 9.75), { cap: 50 });
  const closeConj = close.find((combination) => combination.id === 'conj-sun-mercury-11')!;
  assert.ok(closeConj.bodyEn.includes('within about 2°15′ of each other — a close conjunction by degree as well as by sign.'), closeConj.bodyEn);
  assert.ok(!closeConj.bodyEn.includes('retrograde'));
  assert.equal(separationWithinSign(withDegrees(12, 9.75).grahas.filter((p) => p.graha === 'sun' || p.graha === 'mercury')), 2.25);
  assert.equal(formatSeparation(15), '15°00′');
  assert.equal(formatSeparation(10.533), '10°32′');
  assert.equal(CLOSE_CONJUNCTION_ORB_DEGREES, 10);

  // Child band appends the observe framing to conjunctions and yogas only.
  const child = computeCombinations(withDegrees(25.033, 14.5, true), { cap: 50, band: 'child' });
  assert.ok(child.find((c) => c.id === 'conj-sun-mercury-11')!.bodyEn.endsWith('not a fixed trait.'));
  assert.ok(child.find((c) => c.id === 'yoga-budhaditya')!.bodyEn.endsWith('not a settled trait.'));
  assert.ok(!child[0].bodyEn.includes('not a fixed trait'), 'the Lagna-lord line is untouched');
  assert.ok(!wideConj.bodyEn.includes('not a fixed trait'), 'adult default unchanged');
  // The node's permanent retrogression is never remarked on.
  const nodes = computeCombinations(seat(tula, { moon: 7, rahu: 7 }), { cap: 50 });
  const nodeConj = nodes.find((c) => c.kind === 'conjunction' && c.grahas.includes('rahu'))!;
  assert.ok(nodeConj, 'Moon+Rahu share the 7th');
  assert.ok(!nodeConj.bodyEn.includes('Rahu is retrograde'), nodeConj.bodyEn);
});
