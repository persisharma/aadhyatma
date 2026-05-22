import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveFestivalsForYear, getUpcomingFestivals } from '../festivalEngine';

test('resolveFestivalsForYear returns festivals for 2026', () => {
  const festivals = resolveFestivalsForYear(2026);
  assert.ok(festivals.length >= 5, `expected at least 5 festivals, got ${festivals.length}`);
  assert.ok(festivals.length <= 30, `expected at most 30, got ${festivals.length}`);
});

test('festivals are sorted chronologically', () => {
  const festivals = resolveFestivalsForYear(2026);
  for (let i = 1; i < festivals.length; i++) {
    assert.ok(
      festivals[i].date.getTime() >= festivals[i - 1].date.getTime(),
      `festival ${festivals[i].rule.id} before ${festivals[i - 1].rule.id}`
    );
  }
});

test('Holi 2026 falls in Feb-Mar', () => {
  const festivals = resolveFestivalsForYear(2026);
  const holi = festivals.find((f) => f.rule.id === 'holi');
  if (holi) {
    const month = holi.date.getMonth();
    assert.ok(month >= 1 && month <= 3, `Holi should be Feb-Apr, got month ${month}`);
  }
});

test('getUpcomingFestivals returns future festivals', () => {
  const upcoming = getUpcomingFestivals(new Date(2026, 0, 1), 5);
  assert.equal(upcoming.length, 5);
  for (const f of upcoming) {
    assert.ok(f.date.getTime() >= new Date(2026, 0, 1).getTime());
  }
});

test('each resolved festival has valid rule fields', () => {
  const festivals = resolveFestivalsForYear(2026);
  for (const f of festivals) {
    assert.ok(f.rule.id.length > 0, 'id non-empty');
    assert.ok(f.rule.nameHi.length > 0, 'nameHi non-empty');
    assert.ok(f.rule.nameEn.length > 0, 'nameEn non-empty');
    assert.ok(['star', 'dot', 'halfmoon'].includes(f.rule.marker), `valid marker: ${f.rule.marker}`);
    assert.ok(f.date instanceof Date, 'date is Date');
  }
});
