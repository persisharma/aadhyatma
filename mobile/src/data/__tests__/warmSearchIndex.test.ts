import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getSearchIndex,
  warmSearchIndex,
  runSearch,
  _resetSearchIndexForTest,
} from '../searchIndex';

/**
 * The warm-up must produce EXACTLY the index the synchronous build produces —
 * it is the same work, only sliced. If these ever diverge, search results would
 * silently depend on whether the user tapped before or after the walk reached
 * the index, which is the worst kind of bug to chase.
 */
test('the warmed index matches the synchronous build, entry for entry', async () => {
  _resetSearchIndexForTest();
  const sync = getSearchIndex();
  const syncSnapshot = JSON.stringify(sync);

  _resetSearchIndexForTest();
  const warmed = await warmSearchIndex();

  assert.equal(warmed.verses.length, sync.verses.length);
  assert.equal(warmed.sections.length, sync.sections.length);
  assert.equal(warmed.deities.length, sync.deities.length);
  assert.equal(JSON.stringify(warmed), syncSnapshot, 'warmed index differs from the synchronous build');
});

test('a warmed index is the one later callers get back', async () => {
  _resetSearchIndexForTest();
  const warmed = await warmSearchIndex();
  assert.equal(getSearchIndex(), warmed, 'getSearchIndex() rebuilt instead of using the warmed index');
});

test('it yields to the UI between entries rather than building in one block', async () => {
  _resetSearchIndexForTest();
  let ticks = 0;
  await warmSearchIndex(async () => {
    ticks += 1;
  });
  // One tick per indexed library entry, plus the final assembly tick — the
  // point being that this is many small slices, not one long one.
  assert.ok(ticks > 20, `expected the build to be sliced across many ticks, got ${ticks}`);
});

test('concurrent warm-ups share one build', async () => {
  _resetSearchIndexForTest();
  let ticks = 0;
  const tick = async () => {
    ticks += 1;
  };
  const [a, b] = await Promise.all([warmSearchIndex(tick), warmSearchIndex(tick)]);
  assert.equal(a, b, 'two warm-ups produced two different indexes');
  const single = ticks;
  _resetSearchIndexForTest();
  ticks = 0;
  await warmSearchIndex(tick);
  assert.equal(single, ticks, 'the second concurrent caller did duplicate work');
});

test('a tap that beats the warm-up wins, and the walk drops its partial work', async () => {
  _resetSearchIndexForTest();
  let built: unknown = null;
  const warm = warmSearchIndex(async () => {
    // Simulate the user opening Search after the first slice.
    built ??= getSearchIndex();
  });
  assert.equal(await warm, built, 'the warm-up discarded the index the tap had already built');
});

test('search still works off a warmed index', async () => {
  _resetSearchIndexForTest();
  const index = await warmSearchIndex();
  const res = runSearch('हनुमान', index);
  assert.ok(res.sections.length > 0, 'expected section hits from the warmed index');
});
