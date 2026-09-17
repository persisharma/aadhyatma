/**
 * Library counts (TRD-42 §5.3). `tsx --test` — `src/data` is out of Jest.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { libraryCounts, __resetLibraryCountsCache } from '../libraryCounts';
import { library } from '../texts';
import { categories } from '../categories';

test('counts only what a user can actually open', () => {
  __resetLibraryCountsCache();
  const counts = libraryCounts();
  for (const category of categories) {
    const expected = library.filter(
      (e) => e.category === category.id && !e.hidden && e.status === 'active'
    ).length;
    assert.equal(counts[category.id] ?? 0, expected, category.id);
  }
});

test('hidden and non-active entries are excluded', () => {
  __resetLibraryCountsCache();
  const counts = libraryCounts();
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, library.filter((e) => !e.hidden && e.status === 'active').length);
  assert.ok(total < library.length || library.every((e) => !e.hidden && e.status === 'active'));
});

test('memoised: the bundled library cannot change at runtime', () => {
  __resetLibraryCountsCache();
  assert.equal(libraryCounts(), libraryCounts());
});
