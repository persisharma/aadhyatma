import assert from 'node:assert/strict';

import { getVersePool, findVerse } from '@/data/versePool';
import { assignSlotVerseIndices, type ReminderSlot } from '../seed';

// The fix depends on this round-trip: the verse identity baked into a
// notification payload (sourceId/chapter/verseIndex) must be re-findable by
// `findVerse` so the Daily Bhakti tab shows the exact verse the reminder
// advertised, independent of pool-size drift.
{
  const pool = getVersePool();
  assert.ok(pool.length > 0, 'verse pool should be non-empty in tests');

  const sample = pool[Math.floor(pool.length / 2)];
  const found = findVerse(sample.sourceId, sample.verseIndex, sample.chapter);
  assert.ok(found, 'findVerse should locate a verse by its identity');
  assert.equal(found.sourceId, sample.sourceId);
  assert.equal(found.verseIndex, sample.verseIndex);
  assert.equal(found.chapter ?? null, sample.chapter ?? null);
  assert.deepEqual(found.textHi, sample.textHi);
}

// Unknown identity (e.g. a verse removed by an OTA update) resolves to null so
// the screen can fall back to a random verse instead of crashing.
{
  assert.equal(findVerse('does-not-exist', 9999, 0), null);
}

// Multiple reminder times on the SAME day must surface DIFFERENT verses — that
// is the whole point of configuring more than one reminder.
{
  const pool = getVersePool();
  const slots: ReminderSlot[] = [
    { dateKey: '2026-07-02', hhmm: '0700' },
    { dateKey: '2026-07-02', hhmm: '1300' },
    { dateKey: '2026-07-02', hhmm: '2030' },
  ];
  const indices = assignSlotVerseIndices(slots, pool.length);
  assert.equal(new Set(indices).size, slots.length, 'same-day reminders must be distinct verses');
}

// Deterministic: the same ordered slots + pool length yield the same indices,
// so rescheduling within a day never reshuffles content.
{
  const slots: ReminderSlot[] = [
    { dateKey: '2026-07-02', hhmm: '0700' },
    { dateKey: '2026-07-02', hhmm: '1300' },
    { dateKey: '2026-07-03', hhmm: '0700' },
  ];
  assert.deepEqual(assignSlotVerseIndices(slots, 500), assignSlotVerseIndices(slots, 500));
}

// Forward-probing guarantees same-day distinctness even when the pool is tiny
// and hashes collide. With a pool of 2, two same-day slots must still differ.
{
  const slots: ReminderSlot[] = [
    { dateKey: '2026-07-02', hhmm: '0700' },
    { dateKey: '2026-07-02', hhmm: '1300' },
  ];
  const indices = assignSlotVerseIndices(slots, 2);
  assert.equal(new Set(indices).size, 2, 'distinct even when pool barely fits the slots');
}

// Empty pool yields a sentinel index per slot (caller skips these).
{
  assert.deepEqual(assignSlotVerseIndices([{ dateKey: '2026-07-02', hhmm: '0700' }], 0), [-1]);
}
