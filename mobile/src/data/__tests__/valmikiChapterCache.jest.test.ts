import {
  MAX_RESIDENT_CHAPTERS,
  loadValmikiRamayanChapter,
  peekValmikiRamayanChapter,
} from '../valmiki-ramayan';

// PERF-03: the 27 MB corpus must not stay resident for the life of the process.
jest.setTimeout(60000);

test('only the most recently used kāṇḍas stay resident', async () => {
  expect(MAX_RESIDENT_CHAPTERS).toBe(3);
  await loadValmikiRamayanChapter(1);
  await loadValmikiRamayanChapter(2);
  await loadValmikiRamayanChapter(3);
  expect([1, 2, 3].map((n) => peekValmikiRamayanChapter(n) !== null)).toEqual([true, true, true]);

  // A fourth evicts the least recently used. The peeks above made 3 the most recent, 1 the oldest.
  await loadValmikiRamayanChapter(4);
  expect(peekValmikiRamayanChapter(1)).toBeNull();
  expect(peekValmikiRamayanChapter(4)).not.toBeNull();
});

test('reading a kāṇḍa (peek or load) keeps it resident while an idle one is evicted', async () => {
  await loadValmikiRamayanChapter(2);
  await loadValmikiRamayanChapter(3);
  await loadValmikiRamayanChapter(4);
  // The reader on 2 re-renders: it is in use, so 3 is now the least recent.
  expect(peekValmikiRamayanChapter(2)).not.toBeNull();
  await loadValmikiRamayanChapter(5);
  expect(peekValmikiRamayanChapter(3)).toBeNull();
  expect(peekValmikiRamayanChapter(2)).not.toBeNull();
});

test('an evicted kāṇḍa reloads on demand with the same content', async () => {
  const first = await loadValmikiRamayanChapter(6);
  await loadValmikiRamayanChapter(7);
  await loadValmikiRamayanChapter(1);
  await loadValmikiRamayanChapter(2);
  expect(peekValmikiRamayanChapter(6)).toBeNull();
  const again = await loadValmikiRamayanChapter(6);
  expect(again).not.toBe(first);
  expect(again.verses.length).toBe(first.verses.length);
});
