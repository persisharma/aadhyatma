import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getObservanceCatalog, OBSERVANCE_RULES } from '../festivals';
import {
  generatedObservanceRuleIds,
  getObservancesForDateKey,
  getObservancesForMonth,
  getUpcomingObservances,
  observancePresentationMemoKey,
  resolveAllObservancesForYear,
  resolveObservancesForYear,
  searchObservances,
} from '../festivalEngine';
import { getCategoryCounts, getNextOccurrence, getRulesForCategory } from '../vratCatalog';
import {
  canonicalizeLenses,
  lensForStateCode,
  OBSERVANCE_LENSES,
  parseStoredLenses,
  ruleIsVisibleForLenses,
  serializeLenses,
} from '../lenses';
import { CITIES, getCityById, MAJOR_CITIES } from '../locations';

test('the registry is the exact fifteen-value PRD-42 lens union', () => {
  assert.deepEqual(
    [...OBSERVANCE_LENSES.map(({ id }) => id)].sort(),
    [
      'assam-northeast', 'bengal-odisha', 'bihar-mithila', 'gaudiya', 'gujarat',
      'jain', 'kerala', 'maharashtra-konkan', 'punjab-haryana', 'pushtimarg',
      'rajasthan', 'shaiva', 'sri-vaishnava', 'tamil', 'telugu-kannada',
    ]
  );
});

test('the सम्प्रदाय group holds exactly the five tradition lenses', () => {
  assert.deepEqual(
    OBSERVANCE_LENSES.filter((lens) => lens.group === 'tradition').map(({ id }) => id).sort(),
    ['gaudiya', 'jain', 'pushtimarg', 'shaiva', 'sri-vaishnava']
  );
  // Ten state lenses are unchanged — the split is presentation-only, and क्षेत्र still seeds.
  assert.equal(OBSERVANCE_LENSES.filter((lens) => lens.group === 'state').length, 10);
});

test('storage is deduped, validated, and canonically sorted', () => {
  assert.equal(serializeLenses(['tamil', 'jain', 'tamil']), 'jain,tamil');
  assert.deepEqual(parseStoredLenses('tamil,unknown,jain,tamil'), ['jain', 'tamil']);
  assert.deepEqual(canonicalizeLenses([]), []);
});

test('catalog presentation filters lenses while direct search stays lens-independent', () => {
  assert.equal(getObservanceCatalog().some(({ id }) => id === 'karthigai-vrat'), false);
  assert.equal(getObservanceCatalog({ lenses: ['tamil'] }).some(({ id }) => id === 'karthigai-vrat'), true);
  assert.equal(getObservanceCatalog({ lenses: ['jain'] }).some(({ id }) => id === 'rohini-vrat'), true);
  assert.equal(searchObservances('Karthigai').some(({ id }) => id === 'karthigai-vrat'), true);
  assert.equal(searchObservances('Rohini').some(({ id }) => id === 'rohini-vrat'), true);
  assert.equal(getRulesForCategory('festival').some(({ id }) => id === 'karthigai-vrat'), false);
  assert.equal(getRulesForCategory('festival', ['tamil']).some(({ id }) => id === 'karthigai-vrat'), true);
  const baseFestivalCount = getCategoryCounts().find(({ category }) => category === 'festival')!.count;
  const tamilFestivalCount = getCategoryCounts(['tamil']).find(({ category }) => category === 'festival')!.count;
  assert.equal(tamilFestivalCount, baseFestivalCount + 1);
});

test('the raw generator roster includes lensed rules and no regional visibility remains', () => {
  const generated = new Set(generatedObservanceRuleIds());
  assert.equal(generated.has('karthigai-vrat'), true);
  assert.equal(generated.has('rohini-vrat'), true);
  assert.equal(OBSERVANCE_RULES.some((rule) => (rule.visibility as string) === 'regional'), false);
});

test('presentation visibility is additive and supports multi-lens rules', () => {
  assert.equal(ruleIsVisibleForLenses(undefined, new Set()), true);
  assert.equal(ruleIsVisibleForLenses(['jain'], new Set()), false);
  assert.equal(ruleIsVisibleForLenses(['jain', 'gujarat'], new Set(['gujarat'])), true);
});

test('presentation memo keys canonicalize lens order and change with the set', () => {
  const a = observancePresentationMemoKey(2026, 'purnimant', undefined, ['tamil', 'jain']);
  const b = observancePresentationMemoKey(2026, 'purnimant', undefined, ['jain', 'tamil']);
  const c = observancePresentationMemoKey(2026, 'purnimant', undefined, ['jain']);
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test('Wave 2 is a zero-date no-op and does not change universal day load', () => {
  const raw = resolveAllObservancesForYear(2026, 'purnimant');
  const universal = resolveObservancesForYear(2026, 'purnimant');
  assert.equal(raw.length, universal.length);
  assert.equal(universal.length, 279);
});

test('presentation hides a lensed date while direct occurrence lookup remains independent', () => {
  const diwali = OBSERVANCE_RULES.find((rule) => rule.id === 'diwali');
  assert.ok(diwali);
  const previous = diwali.lens;
  const uncachedLocation = { cityId: 'lens-test', latitude: 23.1765, longitude: 75.7885, elevation: 490 };
  try {
    diwali.lens = ['jain'];
    assert.equal(getObservancesForDateKey('2026-11-09').some(({ rule }) => rule.id === 'diwali'), false);
    assert.equal(getObservancesForDateKey('2026-11-09', 'purnimant', undefined, ['jain']).some(({ rule }) => rule.id === 'diwali'), true);
    assert.equal(getObservancesForMonth(2026, 10, 'purnimant', uncachedLocation).some(({ rule }) => rule.id === 'diwali'), false);
    assert.equal(getObservancesForMonth(2026, 10, 'purnimant', uncachedLocation, ['jain']).some(({ rule }) => rule.id === 'diwali'), true);
    assert.equal(getUpcomingObservances(new Date(2026, 10, 1), 30, 'purnimant', 30, uncachedLocation).some(({ rule }) => rule.id === 'diwali'), false);
    assert.equal(getUpcomingObservances(new Date(2026, 10, 1), 30, 'purnimant', 30, uncachedLocation, ['jain']).some(({ rule }) => rule.id === 'diwali'), true);
    assert.equal(getNextOccurrence('diwali', new Date(2026, 0, 1))?.rule.id, 'diwali');
  } finally {
    diwali.lens = previous;
  }
});

test('all major cities and Rajasthan tehsils carry explicit state codes', () => {
  assert.equal(MAJOR_CITIES.length, 52);
  assert.equal(MAJOR_CITIES.every((city) => city.stateCode !== undefined), true);
  assert.equal(CITIES.filter((city) => city.id.startsWith('rj-')).every((city) => city.stateCode === 'RJ'), true);
  assert.equal(lensForStateCode(getCityById('jaipur')?.stateCode), 'rajasthan');
  assert.equal(lensForStateCode(getCityById('patna')?.stateCode), 'bihar-mithila');
  assert.equal(lensForStateCode(getCityById('ujjain')?.stateCode), null);
});
