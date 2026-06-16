import assert from 'node:assert/strict';
import { test } from 'node:test';

import { KATHA_CONTENT } from '../kathaContent';
import {
  getCategoryCounts,
  getKathaLibrary,
  getNextOccurrence,
  getNextOccurrences,
  getRuleById,
  getRulesForCategory,
  type BrowseCategory,
} from '../vratCatalog';

const BROWSE: BrowseCategory[] = ['vrat', 'festival', 'upavas'];

test('getRulesForCategory returns only default-visible rules of that category', () => {
  for (const category of BROWSE) {
    const rules = getRulesForCategory(category);
    assert.ok(rules.length > 0, `expected some ${category} rules`);
    assert.ok(rules.every((r) => r.category === category), `${category}: wrong category present`);
    assert.ok(rules.every((r) => r.visibility === 'default'), `${category}: non-default rule present`);
  }
});

test('getCategoryCounts mirror getRulesForCategory for each browsable type', () => {
  const counts = getCategoryCounts();
  assert.deepEqual(counts.map((c) => c.category), BROWSE);
  for (const c of counts) {
    assert.ok(c.count > 0, `${c.category} count should be positive`);
    assert.equal(c.count, getRulesForCategory(c.category).length);
  }
});

test('getNextOccurrences returns ascending future dates for a recurring rule', () => {
  const from = new Date(2026, 5, 1); // 1 June 2026, local
  const next = getNextOccurrences('sankashti-chaturthi-vrat', from, 3, 'purnimant');
  assert.equal(next.length, 3);
  assert.ok(next.every((o) => o.rule.id === 'sankashti-chaturthi-vrat'));
  assert.ok(next.every((o) => o.date.getTime() >= from.getTime()));
  for (let i = 1; i < next.length; i++) {
    assert.ok(next[i].date.getTime() > next[i - 1].date.getTime(), 'dates strictly ascending');
  }
});

test('getNextOccurrence returns the single soonest future date, or null when unknown', () => {
  const from = new Date(2026, 5, 1);
  const soonest = getNextOccurrence('sankashti-chaturthi-vrat', from, 'purnimant');
  assert.ok(soonest && soonest.date.getTime() >= from.getTime());
  assert.equal(getNextOccurrence('does-not-exist', from, 'purnimant'), null);
});

test('getNextOccurrences returns [] for an unknown rule id', () => {
  assert.deepEqual(getNextOccurrences('does-not-exist', new Date(2026, 5, 1), 3, 'purnimant'), []);
});

test('getRuleById finds a rule (including hidden) or returns null', () => {
  const rule = getRuleById('sankashti-chaturthi-vrat');
  assert.ok(rule && rule.id === 'sankashti-chaturthi-vrat');
  assert.equal(getRuleById('does-not-exist'), null);
});

test('getKathaLibrary exposes the bundled bilingual kathas', () => {
  const lib = getKathaLibrary();
  assert.equal(lib.length, KATHA_CONTENT.length);
  assert.ok(lib.length > 0);
  assert.ok(lib.every((k) => typeof k.id === 'string' && !!k.titleHi && !!k.titleEn));
});
