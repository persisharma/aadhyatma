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
    'snapshot',
    'summary',
    'lagna',
    'moon',
    'combinations',
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
    // 3 pair paragraphs + 9 dated period lines + closing framing line.
    assert.equal(vimshottari.bodyEn.length, 13);
    const periodLines = vimshottari.bodyEn.filter((line) => /Mahadasha( \(current\))? · /.test(line));
    assert.equal(periodLines.length, 9);
    assert.equal(periodLines.filter((line) => line.includes('(current)')).length, 1);
    assert.equal(periodLines.filter((line) => line.includes('active at birth')).length, 1, 'exactly one period ran at birth');
    // Every interpretive section names its basis (RULEBOOK §14.3.1).
    for (const section of model.sections) {
      if (section.id === 'summary' || section.id === 'snapshot') continue;
      assert.ok((section.basis?.length ?? 0) > 0, `${section.id} has a basis chain`);
    }
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
  const summary = model.sections.find((section) => section.id === 'summary')!;
  const factIds = summary.facts.map((factEntry) => factEntry.id);
  for (const id of ['name', 'birth-date', 'birth-time', 'birth-city', 'lagna', 'moon-rashi', 'nakshatra']) {
    assert.ok(factIds.includes(id), `summary fact ${id}`);
  }
  assert.ok(model.disclaimerHi.includes('निश्चित भविष्यवाणी नहीं'));
  assert.ok(model.disclaimerEn.includes('not a certain prediction'));
  assert.equal(model.reportVersion, 2);
  assert.equal(model.generatedDateKey, '2026-08-19');
  assert.equal(model.asOfLabelEn, '19 Aug 2026');
  assert.equal(model.ageBand, 'adult');
});

/* ---------------- PRD-43 Wave A: precision ---------------- */

test('ordinal grammar: no "1th/2th/3th bhava" anywhere in an emitted model, in any lagna', () => {
  for (let step = 0; step < 24; step += 1) {
    const stepChart = computeKundali({
      date: new Date(Date.UTC(1995, 2, 15, step, 0, 0)),
      latitude: 23.1793,
      longitude: 75.7849,
      timezone: 'Asia/Kolkata',
    });
    const serialized = JSON.stringify(build(stepChart));
    assert.doesNotMatch(serialized, /\b(?:\d*[02-9])?[123]th bhava/, `lagna step ${step}`);
    assert.doesNotMatch(serialized, /\d भाव/, `Hindi bhava with a bare digit, lagna step ${step}`);
  }
});

test('the disclaimer appears once in the model, never per life area', () => {
  const model = build(chart);
  const serialized = JSON.stringify(model);
  const sentence = 'structural view of the houses';
  assert.equal(serialized.split(sentence).length - 1, 0, 'per-area disclaimer removed');
  assert.equal(serialized.split(model.disclaimerEn).length - 1, 1, 'disclaimer exactly once');
});

test('dasha lines lead with dates and name the balance at birth', () => {
  const model = build(chart);
  const vimshottari = model.sections.find((section) => section.id === 'vimshottari')!;
  const atBirth = vimshottari.bodyEn.find((line) => line.includes('active at birth'))!;
  assert.ok(atBirth, 'the birth-time period is labelled');
  assert.match(atBirth, /balance at birth \d+ y( \d+ m)? of the full \d+ y/);
  assert.match(atBirth, /→ \d{1,2} [A-Z][a-z]{2} \d{4} \(until age /);
  const others = vimshottari.bodyEn.filter((line) => /Mahadasha( \(current\))? · \d/.test(line));
  assert.equal(others.length, 8, 'the other eight periods carry start → end dates');
  for (const line of others) assert.match(line, /\d{1,2} [A-Z][a-z]{2} \d{4} → \d{1,2} [A-Z][a-z]{2} \d{4} \(ages \d+–\d+\)/);
  // Never age alone.
  assert.ok(!vimshottari.bodyEn.some((line) => /^Age \d+–\d+ · /.test(line)));
  // The pair reading opens the section with both date ranges.
  assert.match(vimshottari.bodyEn[0], /Mahadasha runs .* → .* Antardasha runs .* → /);
  const facts = vimshottari.facts.map((factEntry) => factEntry.id);
  assert.ok(facts.includes('current-maha-dates') && facts.includes('current-antar-dates'));
});

test('transit statements are stamped with the report date and say when they change', () => {
  const model = build(chart);
  const observations = model.sections.find((section) => section.id === 'observations')!;
  assert.ok(observations.bodyEn[0].startsWith('As of 19 Aug 2026:'));
  assert.ok(observations.bodyEn[1].includes('dated') || observations.bodyEn[1].includes('next sign change'));
  assert.equal(observations.facts[0].id, 'as-of');
  assert.equal(observations.facts[0].valueEn, '19 Aug 2026');
  // The snapshot's transit line carries the same stamp.
  const snapshot = model.sections[0];
  assert.ok(snapshot.facts.find((factEntry) => factEntry.id === 'observations')!.valueEn.endsWith('as of 19 Aug 2026'));
});

/* ---------------- PRD-43 Wave B: synthesis ---------------- */

test('the snapshot is a projection: every fact id is a real section id and the count is 5–7', () => {
  const model = build(chart);
  const snapshot = model.sections[0];
  assert.equal(snapshot.id, 'snapshot');
  const ids = new Set(model.sections.map((section) => section.id));
  assert.ok(snapshot.facts.length >= 5 && snapshot.facts.length <= 7, `${snapshot.facts.length} lines`);
  for (const factEntry of snapshot.facts) {
    assert.ok(ids.has(factEntry.id), `snapshot line ${factEntry.id} traces to a section`);
  }
  const uniq = new Set(snapshot.facts.map((factEntry) => factEntry.id));
  assert.equal(uniq.size, snapshot.facts.length, 'one line per source section');
});

test('combinations section leads with the Lagna lord and carries basis for every line', () => {
  const model = build(chart);
  const combinations = model.sections.find((section) => section.id === 'combinations')!;
  assert.ok(combinations.bodyEn.length >= 1 && combinations.bodyEn.length <= 6);
  assert.ok(combinations.facts[0].id.startsWith('lagna-lord-'));
  assert.equal(combinations.bodyEn.length, combinations.facts.length);
  assert.ok((combinations.basis?.length ?? 0) >= combinations.bodyEn.length);
});

test('life areas are age-aware with stable ids: a 13-year-old gets no partnership section', () => {
  const childChart = computeKundali({
    date: new Date('2013-08-10T05:00:00Z'),
    latitude: 26.9124,
    longitude: 75.7873,
    timezone: 'Asia/Kolkata',
  });
  const teen = buildKundaliReport(childChart, META, new Date('2026-09-14T09:00:00Z'), { sadeSatiBoundaryScanDays: 0 });
  assert.equal(teen.ageBand, 'adolescent');
  assert.equal(teen.ageLabelEn, '13 y 1 m');
  const ids = teen.sections.map((section) => section.id);
  assert.deepEqual(ids, build(chart).sections.map((section) => section.id), 'section ids identical across bands');
  const career = teen.sections.find((section) => section.id === 'career')!;
  const relationships = teen.sections.find((section) => section.id === 'relationships')!;
  assert.equal(career.titleEn, 'Learning, talents and future direction');
  assert.equal(relationships.titleEn, 'Friends, teamwork and social nature');
  assert.ok(!relationships.facts.some((factEntry) => factEntry.id === 'relationships-house-7') || relationships.facts.length > 1, 'the 7th is not read alone for a teen');
  assert.ok(relationships.bodyEn.at(-1)!.startsWith('For a parent:'));
  // The snapshot says so.
  assert.ok(teen.sections[0].facts.some((factEntry) => factEntry.id === 'career' && factEntry.valueEn.includes('addressed to a parent')));

  const adult = build(chart);
  assert.equal(adult.sections.find((section) => section.id === 'career')!.titleEn, 'Career and work');
  assert.equal(adult.sections.find((section) => section.id === 'relationships')!.titleEn, 'Relationships');
});
