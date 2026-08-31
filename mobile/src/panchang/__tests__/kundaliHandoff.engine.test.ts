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
});

test('the machine-readable tail parses back to the exact report model', () => {
  const text = buildKundaliHandoffText(chart, model);
  const match = text.match(/```json\n([\s\S]*?)\n```/);
  assert.ok(match, 'JSON block present');
  const parsed = JSON.parse(match![1]) as KundaliReportModel;
  assert.deepEqual(parsed, model, 'round-trips to the serializable model');
});
