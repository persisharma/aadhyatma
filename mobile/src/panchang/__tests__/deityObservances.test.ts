import assert from 'node:assert/strict';
import { test } from 'node:test';

import { getNextOccurrence, getRuleById, getRulesForCategory } from '../vratCatalog';
import { getKathaContent } from '../kathaContent';

// The deity-art map in src/data/backgrounds.ts keys on these exact English labels,
// so the rules must keep them verbatim or the Panchang detail backdrop goes blank.
// (backgrounds.ts can't be imported here — it require()s PNGs — so the coupling is
// asserted from both sides: this test pins deityEn; the Jest coverage test pins the
// image lookup against the live rule.)
test('Shani Jayanti is a dated, browsable festival with Shani art label', () => {
  const rule = getRuleById('shani-jayanti');
  assert.ok(rule, 'shani-jayanti rule exists');
  assert.equal(rule.category, 'festival');
  assert.equal(rule.visibility, 'default');
  assert.equal(rule.deityEn, 'Shani Dev');
  assert.ok(
    getRulesForCategory('festival').some((r) => r.id === 'shani-jayanti'),
    'shani-jayanti surfaces in the festival browse list',
  );
  assert.equal(rule.kathaId, 'shani-jayanti-vrat-katha');
});

test('Shani Jayanti resolves to Jyeshtha Amavasya — the same day as Vat Savitri', () => {
  const from = new Date(2026, 0, 1);
  const shani = getNextOccurrence('shani-jayanti', from, 'purnimant');
  const vatSavitri = getNextOccurrence('vat-savitri-vrat', from, 'purnimant');
  assert.ok(shani, 'shani-jayanti resolves a date');
  assert.ok(vatSavitri, 'vat-savitri-vrat resolves a date');
  assert.equal(shani.date.getTime(), vatSavitri.date.getTime());
});

test('Santoshi Mata Vrat browses as a catalog-only vrat with no calendar date', () => {
  const rule = getRuleById('santoshi-mata-vrat');
  assert.ok(rule, 'santoshi-mata-vrat rule exists');
  assert.equal(rule.category, 'vrat');
  assert.equal(rule.visibility, 'default');
  assert.equal(rule.ruleType, 'catalog-only');
  assert.equal(rule.deityEn, 'Santoshi Mata');
  assert.ok(
    getRulesForCategory('vrat').some((r) => r.id === 'santoshi-mata-vrat'),
    'santoshi-mata-vrat surfaces in the vrat browse list',
  );
  assert.equal(rule.kathaId, 'santoshi-mata-vrat-katha');
  // Friday-only weekly vrat: intentionally no resolvable single date.
  assert.equal(getNextOccurrence('santoshi-mata-vrat', new Date(2026, 0, 1), 'purnimant'), null);
});

test('both new vrats resolve full bilingual katha content', () => {
  for (const id of ['shani-jayanti-vrat-katha', 'santoshi-mata-vrat-katha']) {
    const katha = getKathaContent(id);
    assert.ok(katha, `${id} content resolves`);
    assert.ok(katha.sections.length >= 4, `${id} reads as full episodes`);
    assert.equal(katha.languageAvailability, 'bilingual');
  }
});
