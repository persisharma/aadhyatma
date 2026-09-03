import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import {
  buildKundaliReport,
  computeMangalDosha,
  MANGAL_HOUSES,
  RASHI_LORD,
  type KundaliReportMeta,
} from '../kundaliReport';
import {
  computeKundali,
  GRAHA_ORDER,
  RASHI_NAMES_EN,
  type KundaliChart,
} from '../kundali';

const META: KundaliReportMeta = {
  name: 'Aarav',
  birthDateLabelHi: '१५ मार्च १९९५',
  birthDateLabelEn: '15 March 1995',
  birthTimeLabel: '10:00 AM',
  cityNameHi: 'उज्जैन',
  cityNameEn: 'Ujjain',
};

const NOW = new Date('2026-08-19T09:00:00Z');

const chart = computeKundali({
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
});

function build(target: KundaliChart, options?: Parameters<typeof buildKundaliReport>[3]) {
  return buildKundaliReport(target, META, NOW, {
    sadeSatiBoundaryScanDays: 0,
    ...options,
  });
}

test('report engine stays pure and has no wall-clock fallback', () => {
  for (const file of ['src/panchang/kundaliReport.ts', 'src/panchang/kundaliReportModel.ts']) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(
      source,
      /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/,
      file
    );
  }
});

test('authored report copy stays inside guidance framing', () => {
  const source = readFileSync('src/panchang/kundaliReport.ts', 'utf8');
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
    /\bcurse\b/i,
    /दोषपूर्ण/,
  ];
  for (const pattern of banned) {
    assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
  }
});

test('the model is deterministic and survives a JSON round trip unchanged', () => {
  const first = build(chart);
  const second = build(chart);
  assert.deepEqual(first, second);
  // The AI-readiness contract (PRD-20 §5): plain JSON only.
  assert.deepEqual(JSON.parse(JSON.stringify(first)), first);
});

test('section order and completeness hold for charts across all twelve lagnas', () => {
  const expectedOrder = [
    'summary',
    'lagna',
    'moon',
    'career',
    'relationships',
    'wealth',
    'wellbeing',
    'learning',
    'dharma',
    'observations',
    'vimshottari',
  ];
  const seenLagnas = new Set<number>();
  // Two-hour steps through one day rotate the ascendant through all 12 signs.
  for (let step = 0; step < 24; step += 1) {
    const input = {
      date: new Date(Date.UTC(1995, 2, 15, step, 0, 0)),
      latitude: 23.1793,
      longitude: 75.7849,
      timezone: 'Asia/Kolkata' as const,
    };
    const stepChart = computeKundali(input);
    seenLagnas.add(stepChart.lagnaRashiIndex);
    const model = build(stepChart);
    assert.deepEqual(
      model.sections.map((section) => section.id),
      expectedOrder,
      `section order for lagna ${RASHI_NAMES_EN[stepChart.lagnaRashiIndex]}`
    );
    for (const section of model.sections) {
      assert.equal(section.bodyHi.length, section.bodyEn.length, `${section.id} paragraph parity`);
      assert.ok(section.bodyHi.length > 0, `${section.id} has body copy`);
      assert.ok(section.titleHi.length > 0 && section.titleEn.length > 0);
    }
    const vimshottari = model.sections.find((section) => section.id === 'vimshottari')!;
    // 9 periods + closing framing line.
    assert.equal(vimshottari.bodyEn.length, 10);
    assert.equal(vimshottari.bodyEn.filter((line) => line.includes('Mahadasha')).length, 9);
    assert.equal(vimshottari.bodyEn.filter((line) => line.includes('(current)')).length, 1);
  }
  assert.equal(seenLagnas.size, 12, 'fixtures covered every lagna');
});

test('Kaal Sarp never appears anywhere in an emitted model', () => {
  const serialized = JSON.stringify(build(chart, { includeMangalDosha: true }));
  assert.ok(!serialized.includes('काल सर्प'));
  assert.ok(!/kaal\s*sarp/i.test(serialized));
});

test('Mangal Dosha is display-gated off by default and truth-tabled when on', () => {
  const defaultModel = build(chart);
  assert.ok(!JSON.stringify(defaultModel).includes('मांगलिक'));
  assert.ok(!JSON.stringify(defaultModel).toLowerCase().includes('mangal yoga'));

  const mangal = computeMangalDosha(chart);
  assert.equal(mangal.presentFromLagna, MANGAL_HOUSES.includes(mangal.houseFromLagna));
  assert.equal(mangal.presentFromMoon, MANGAL_HOUSES.includes(mangal.houseFromMoon));

  // Truth table across all 12 Mars houses, by re-seating Mars synthetically.
  for (let house = 1; house <= 12; house += 1) {
    const mars = chart.grahas.find((position) => position.graha === 'mars')!;
    const targetRashi = (chart.lagnaRashiIndex + house - 1) % 12;
    const seated: KundaliChart = {
      ...chart,
      grahas: chart.grahas.map((position) =>
        position.graha === 'mars'
          ? { ...position, rashiIndex: targetRashi, house }
          : position
      ),
    };
    const result = computeMangalDosha(seated);
    assert.equal(result.houseFromLagna, house);
    assert.equal(result.presentFromLagna, MANGAL_HOUSES.includes(house), `house ${house}`);
    assert.ok(mars, 'mars exists');
  }

  const gatedOn = build(chart, { includeMangalDosha: true });
  const observations = gatedOn.sections.find((section) => section.id === 'observations')!;
  const joined = observations.bodyEn.join(' ');
  assert.ok(
    joined.includes('Mangal') || joined.includes('outside the conventional Mangal houses'),
    'gated-on report states the Mangal observation either way'
  );
  if (computeMangalDosha(chart).presentFromLagna || computeMangalDosha(chart).presentFromMoon) {
    assert.ok(joined.includes('A large share of charts carry it'), 'prevalence-normalizing copy is mandatory');
    assert.ok(!joined.toLowerCase().includes('dosha'), 'observation avoids the fear label in copy');
  }
});

test('life-area sections read house lords from the classical table', () => {
  const model = build(chart);
  const career = model.sections.find((section) => section.id === 'career')!;
  const houseRashi = chart.houses[9];
  const lord = RASHI_LORD[houseRashi];
  assert.ok(GRAHA_ORDER.includes(lord));
  assert.ok(career.facts[0].valueEn.includes(RASHI_NAMES_EN[houseRashi]));
  const empty = model.sections
    .flatMap((section) => section.bodyEn)
    .some((line) => line.includes('No graha occupies this house'));
  const occupied = model.sections
    .flatMap((section) => section.bodyEn)
    .some((line) => line.includes('Grahas placed here'));
  assert.ok(empty || occupied, 'occupancy is always stated plainly');
});

test('summary carries birth facts and the disclaimer frames both ends', () => {
  const model = build(chart);
  const summary = model.sections[0];
  const factIds = summary.facts.map((factEntry) => factEntry.id);
  for (const id of ['name', 'birth-date', 'birth-time', 'birth-city', 'lagna', 'moon-rashi', 'nakshatra']) {
    assert.ok(factIds.includes(id), `summary fact ${id}`);
  }
  assert.ok(model.disclaimerHi.includes('निश्चित भविष्यवाणी नहीं'));
  assert.ok(model.disclaimerEn.includes('not a certain prediction'));
  assert.equal(model.reportVersion, 1);
  assert.equal(model.generatedDateKey, '2026-08-19');
});
