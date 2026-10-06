import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { buildKundaliHandoffText } from '../kundaliHandoff';
import { buildKundaliReport, type KundaliReportMeta } from '../kundaliReport';
import {
  computeKundali,
  GRAHA_NAMES_EN,
  GRAHA_ORDER,
  indiaDateKey,
} from '../kundali';
import type { KundaliReportModel } from '../kundaliReportModel';
import { buildPrashnaReading } from '../prashnaGuidance';

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

const model = buildKundaliReport(chart, META, NOW, { sadeSatiBoundaryScanDays: 0 });

test('handoff engine stays pure and has no wall-clock fallback', () => {
  const source = readFileSync('src/panchang/kundaliHandoff.ts', 'utf8');
  assert.doesNotMatch(
    source,
    /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/
  );
});

test('handoff text is deterministic and complete', () => {
  const text = buildKundaliHandoffText(chart, model);
  assert.equal(text, buildKundaliHandoffText(chart, model));

  // Framing for the receiving reader, human or AI.
  assert.ok(text.includes('Vedic astrology (Jyotish) chart export'));
  assert.ok(text.includes('not predictions'));

  // Every birth detail the report shows (this is why the share is warned).
  assert.ok(text.includes('Name: Aarav'));
  assert.ok(text.includes('Birth date: 15 March 1995'));
  assert.ok(text.includes('Birth time: 10:00 AM IST'));
  assert.ok(text.includes('Birth place: Ujjain'));

  // Full chart data: all nine grahas with houses, and the ayanamsa.
  for (const graha of GRAHA_ORDER) {
    assert.ok(text.includes(`${GRAHA_NAMES_EN[graha]} (`), `${graha} row present`);
  }
  assert.ok(text.includes('Ayanamsa:'));
  assert.ok(text.includes('Lagna (ascendant):'));
  assert.ok(/house \d{1,2}/.test(text));
  assert.ok(text.includes('retrograde'), 'Rahu/Ketu are always retrograde');

  // Complete Vimshottari table with real boundary dates.
  for (const period of chart.vimshottari) {
    assert.ok(
      text.includes(`${indiaDateKey(period.start)} → ${indiaDateKey(period.end)}`),
      `${period.lord} Mahadasha dates present`
    );
  }

  // Every report section title and every English paragraph.
  for (const section of model.sections) {
    assert.ok(text.includes(section.titleEn), `section ${section.id} title`);
    for (const paragraph of section.bodyEn) {
      assert.ok(text.includes(paragraph), `section ${section.id} paragraph`);
    }
  }
  assert.ok(text.includes(model.disclaimerEn));
  assert.ok(text.includes(model.disclaimerHi));

  // PRD-43: the export is self-dating and shows every section's working.
  assert.ok(text.includes(`as of ${model.asOfLabelEn}`));
  const basisLines = text.split('\n').filter((line) => line.startsWith('Basis: '));
  const interpretive = model.sections.filter((section) => (section.basis?.length ?? 0) > 0);
  assert.equal(basisLines.length, interpretive.length, 'one Basis line per interpretive section');
  assert.ok(basisLines.some((line) => line.includes('→')), 'chains are rendered as arrows');
  assert.doesNotMatch(text, /\b(?:\d*[02-9])?[123]th bhava/, 'no ordinal regression in the export');
  const prose = text.slice(0, text.indexOf('## Machine-readable'));
  assert.equal(prose.split(model.disclaimerEn).length - 1, 1, 'disclaimer once in the export prose');
});

test('the machine-readable tail parses back to the exact report model', () => {
  const text = buildKundaliHandoffText(chart, model);
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(match, 'JSON block present');
  const parsed = JSON.parse(match![1]) as KundaliReportModel;
  assert.deepEqual(parsed, model, 'round-trips to the serializable model');
});

test('selected question export carries auditable context and preserves the original report tail', () => {
  const reading = buildPrashnaReading(chart, 'naukri', NOW, { questionId: 'job-switch', gocharScanDays: 0 });
  const text = buildKundaliHandoffText(chart, model, reading);
  assert.ok(text.includes('Considering a job switch'));
  assert.ok(text.includes('editorial interpretation of the listed signals'));
  const blocks = [...text.matchAll(/```json\n([\s\S]*?)\n```/g)].map(m => JSON.parse(m[1]));
  assert.equal(blocks.length, 2);
  assert.deepEqual(blocks[0].phase, reading.phase);
  assert.equal(blocks[0].guidance, undefined);
  assert.deepEqual(blocks[0].factors, [...reading.analysis.supports, ...reading.analysis.resists, ...reading.analysis.qualifies]);
  assert.deepEqual(blocks[1], model);
  const otherDay = buildPrashnaReading(chart, 'naukri', new Date('2026-08-20T09:00:00Z'), { gocharScanDays: 0 });
  assert.throws(() => buildKundaliHandoffText(chart, model, otherDay), /dates must match/);
  assert.equal(buildKundaliHandoffText(chart, model, { ...reading, guidance: null }), buildKundaliHandoffText(chart, model));
});

test('the graha cards export card by card, each with its own basis line (RULEBOOK §14.7)', () => {
  const withGrahas = buildKundaliReport(chart, META, NOW, { sadeSatiBoundaryScanDays: 0, includeGrahaReadings: true });
  const text = buildKundaliHandoffText(chart, withGrahas);
  const grahas = withGrahas.sections.find((section) => section.id === 'grahas')!;
  assert.ok(text.includes('## Your nine grahas, one by one'));
  // The intro and every card list print as bullets, one idea per line.
  for (const item of grahas.bodyEn) assert.ok(text.includes(`\n- ${item}\n`), `intro bullet: ${item}`);
  for (const card of grahas.grahaCards!) {
    const at = text.indexOf(`### ${card.nameEn} — ${card.placeEn} · ${card.toneLabelEn}`);
    assert.ok(at >= 0, `${card.graha} card printed`);
    const block = text.slice(at, text.indexOf('\n\n', at));
    assert.ok(block.includes(`\n- ${card.strengthEn}\n`), `${card.graha} sign bullet`);
    assert.ok(block.includes(`\n- ${card.karakaEn}\n`), `${card.graha} house karaka`);
    assert.ok(block.includes('\nWhat it gives:\n'), `${card.graha} gives heading`);
    for (const item of card.givesEn) assert.ok(block.includes(`\n- ${item}\n`), `${card.graha} gives: ${item}`);
    assert.ok(block.includes('\nWhere to take care:\n'), `${card.graha} care heading`);
    for (const item of card.careEn) assert.ok(block.includes(`\n- ${item}\n`), `${card.graha} care: ${item}`);
    for (const item of card.rulesEn) assert.ok(block.includes(`\n- ${item}\n`), `${card.graha} rules: ${item}`);
    if (card.maitri) assert.ok(block.includes(`\n- Friends: ${card.maitri.friendsEn}\n`), `${card.graha} friends`);
    else assert.ok(!block.includes('Friends and enemies:'), `${card.graha}: the nodes have no maitri row`);
    assert.ok(block.includes(`mantra: ${card.upay.mantraEn}`), `${card.graha} upay`);
    assert.ok(block.includes(`paath: ${card.upay.practiceSourceId}`), `${card.graha} paath`);
    assert.match(block, /\nBasis: /, `${card.graha} basis`);
  }
  // The empty houses print after the cards, one bullet each, with their own basis line.
  const emptyAt = text.indexOf('### Empty houses');
  assert.ok(emptyAt >= 0, 'empty houses printed');
  const emptyBlock = text.slice(emptyAt, text.indexOf('\n\n', emptyAt));
  for (const item of grahas.emptyHouses!.introEn) assert.ok(emptyBlock.includes(`\n- ${item}\n`), `empty intro: ${item}`);
  for (const entry of grahas.emptyHouses!.houses) assert.ok(emptyBlock.includes(`\n- ${entry.lineEn}\n`), `empty house ${entry.house}`);
  assert.match(emptyBlock, /\nBasis: /, 'empty houses basis');
  // The JSON tail is still the parse-back-equal model.
  const tail = text.slice(text.lastIndexOf('```json') + '```json'.length, text.lastIndexOf('```')).trim();
  assert.deepEqual(JSON.parse(tail), withGrahas);
});
