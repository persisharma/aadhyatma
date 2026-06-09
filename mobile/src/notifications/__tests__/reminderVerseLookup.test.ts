import assert from 'node:assert/strict';

import { getVersePool, findVerse } from '@/data/versePool';
import { pickVerseForDateKey, toDateKey } from '../seed';

// The fix depends on this round-trip: the verse the scheduler bakes into a
// notification payload (sourceId/chapter/verseIndex, derived from the daily
// pick) must be re-findable by `findVerse` so the Daily Bhakti tab shows the
// exact verse the reminder advertised.
{
  const pool = getVersePool();
  assert.ok(pool.length > 0, 'verse pool should be non-empty in tests');

  const dateKey = toDateKey(new Date('2026-07-01T09:00:00'));
  const picked = pickVerseForDateKey(dateKey, pool);
  assert.ok(picked, 'pickVerseForDateKey should resolve a verse');

  const found = findVerse(picked.sourceId, picked.verseIndex, picked.chapter);
  assert.ok(found, 'findVerse should locate the scheduled verse by identity');
  assert.equal(found.sourceId, picked.sourceId);
  assert.equal(found.verseIndex, picked.verseIndex);
  assert.equal(found.chapter ?? null, picked.chapter ?? null);
  assert.deepEqual(found.textHi, picked.textHi);
}

// Every same-day reminder time keys off the calendar day only, so they all
// advertise — and resolve to — the same verse.
{
  const pool = getVersePool();
  const morning = pickVerseForDateKey(toDateKey(new Date('2026-07-02T07:00:00')), pool);
  const evening = pickVerseForDateKey(toDateKey(new Date('2026-07-02T20:30:00')), pool);
  assert.ok(morning && evening);
  assert.equal(morning.sourceId, evening.sourceId);
  assert.equal(morning.verseIndex, evening.verseIndex);
  assert.equal(morning.chapter ?? null, evening.chapter ?? null);
}

// Unknown identity (e.g. a verse removed by an OTA update) resolves to null so
// the screen can fall back to a random verse instead of crashing.
{
  assert.equal(findVerse('does-not-exist', 9999, 0), null);
}
