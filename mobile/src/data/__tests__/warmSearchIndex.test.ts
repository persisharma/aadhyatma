import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  getSearchIndex,
  peekSearchIndex,
  warmSearchIndex,
  runSearch,
  _resetSearchIndexForTest,
} from '../searchIndex';
import { library } from '../texts';

/** The reference: one uninterrupted synchronous build. */
function referenceSnapshot(): string {
  _resetSearchIndexForTest();
  return JSON.stringify(getSearchIndex());
}

/**
 * The warm-up must produce EXACTLY the index the synchronous build produces —
 * it is the same job, only paused. If these ever diverged, search results would
 * silently depend on whether the user tapped before or after the warm-up
 * finished, which is the worst kind of bug to chase.
 */
test('a sliced build is byte-identical to an uninterrupted one — at any budget', async () => {
  const reference = referenceSnapshot();
  // Budget 0: every unit is its own slice, the most interruptions possible.
  for (const budget of [0, 8, 50]) {
    _resetSearchIndexForTest();
    const warmed = await warmSearchIndex(async () => {}, budget);
    assert.equal(JSON.stringify(warmed), reference, `budget ${budget} ms produced a different index`);
  }
});

test('a warmed index is the one later callers get back', async () => {
  _resetSearchIndexForTest();
  const warmed = await warmSearchIndex();
  assert.equal(getSearchIndex(), warmed, 'getSearchIndex() rebuilt instead of using the warmed index');
  assert.equal(peekSearchIndex(), warmed);
});

test('peekSearchIndex never does work', () => {
  _resetSearchIndexForTest();
  assert.equal(peekSearchIndex(), null);
  assert.equal(peekSearchIndex(), null, 'peeking must not start or advance the build');
});

/**
 * Slicing per library ENTRY was too coarse: the Gītā alone was ~225 ms, over a
 * dozen frames, in one piece. The heavy sources now yield per chapter / per
 * temple, so with a zero budget there must be far more slices than entries.
 */
test('the build is sliced finer than one-entry-per-slice', async () => {
  _resetSearchIndexForTest();
  const entries = library.filter((e) => !e.hidden && e.status === 'active').length;
  let slices = 0;
  await warmSearchIndex(async () => {
    slices += 1;
  }, 0);
  // 18 Gītā chapters, 16 Sundarkand chapters and 71+ temple units alone add
  // over a hundred slices on top of one per entry.
  assert.ok(slices > entries + 100, `expected sub-entry slicing, got ${slices} slices for ${entries} entries`);
});

test('concurrent callers share ONE job and resolve to the same index', async () => {
  const reference = referenceSnapshot();
  _resetSearchIndexForTest();
  // The background walk and the Search screen both warm the index; each
  // advances the same job, so between them every unit is done exactly once.
  const [a, b] = await Promise.all([warmSearchIndex(async () => {}, 0), warmSearchIndex(async () => {}, 0)]);
  assert.equal(a, b, 'two callers produced two different indexes');
  assert.equal(JSON.stringify(a), reference, 'sharing the job duplicated or dropped work');
});

test('a tap mid-warm FINISHES the warm-up\'s work instead of starting over', async () => {
  const reference = referenceSnapshot();
  _resetSearchIndexForTest();
  let tapped: unknown = null;
  let slices = 0;
  const warm = warmSearchIndex(async () => {
    slices += 1;
    // After some real progress, the user opens Search and needs it now.
    if (slices === 40) tapped = getSearchIndex();
  }, 0);
  const warmed = await warm;
  assert.equal(warmed, tapped, 'the warm-up and the tap ended with different indexes');
  assert.equal(JSON.stringify(warmed), reference, 'resuming mid-build changed the result');
  assert.equal(slices, 40, 'the warm-up kept working after the tap had already finished the job');
});

test('search works off a warmed index', async () => {
  _resetSearchIndexForTest();
  const index = await warmSearchIndex();
  const res = runSearch('हनुमान', index);
  assert.ok(res.sections.length > 0, 'expected section hits from the warmed index');
});
