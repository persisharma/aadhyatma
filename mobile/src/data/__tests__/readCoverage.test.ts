import assert from 'node:assert/strict';
import { test } from 'node:test';
import { library } from '../texts';
import { getVersePoolLastPositions } from '../versePool';
import {
  EMPTY_COVERAGE,
  addRange,
  backfillFromProgress,
  coverageKey,
  findFirstUnread,
  firstGap,
  getChapterCoverage,
  getCoverageShape,
  getSourceCoverage,
  isVerseRead,
  markVerseRead,
  parseCoverage,
  rangesCount,
  resetChapterCoverage,
  resetSourceCoverage,
  restoreCoverage,
  type ChapterShape,
  type CoverageState,
} from '../readCoverage';

function readAll(state: CoverageState, sourceId: string, chapter: number | undefined, from: number, to: number): CoverageState {
  let s = state;
  for (let i = from; i <= to; i += 1) s = markVerseRead(s, sourceId, chapter, i, 1000).state;
  return s;
}

test('addRange keeps ranges sorted, disjoint and merges adjacent runs', () => {
  let r = addRange(undefined, 5, 5);
  r = addRange(r, 1, 2);
  r = addRange(r, 9, 9);
  assert.deepEqual(r, [[1, 2], [5, 5], [9, 9]]);
  r = addRange(r, 3, 4); // bridges 1-2 and 5
  assert.deepEqual(r, [[1, 5], [9, 9]]);
  r = addRange(r, 6, 8);
  assert.deepEqual(r, [[1, 9]]);
  assert.equal(rangesCount(r), 9);
  assert.equal(firstGap(r, 12), 0);
  assert.equal(firstGap(addRange(r, 0, 0), 12), 10);
  assert.equal(firstGap([[0, 11]], 12), null);
});

test('every library text with countable pages has a shape; chaptered shapes total the library verseCount', () => {
  for (const entry of library) {
    const shape = getCoverageShape(entry.id);
    if (!entry.verseCount) continue;
    assert.ok(shape, `${entry.id} has a verseCount but no coverage shape`);
    if (shape.length === 1 && shape[0].chapter === 1 && !['ram-stuti', 'ram-aarti', 'hanuman-ashtak', 'bajrang-baan', 'ramcharitmanas'].includes(entry.id)) continue;
    const total = shape.reduce((s, c) => s + c.verseCount, 0);
    assert.equal(total, entry.verseCount, `${entry.id}: shape total ${total} ≠ library verseCount ${entry.verseCount}`);
  }
});

test('shapes agree with the reader page counts the verse pool derives from the corpora', () => {
  const pool = getVersePoolLastPositions();
  for (const [sourceId, pos] of Object.entries(pool)) {
    const shape = getCoverageShape(sourceId);
    if (!shape) continue; // japa: single counter page, no coverage
    if (sourceId === 'valmiki-ramayan') continue; // pool holds the 28-row daily selection only
    for (const [ch, last] of Object.entries(pos.chapters)) {
      const row: ChapterShape | undefined = shape.find((c) => c.chapter === Number(ch));
      assert.ok(row, `${sourceId} chapter ${ch} missing from shape`);
      assert.equal(row.verseCount, last + 1, `${sourceId} chapter ${ch}`);
    }
  }
});

test('japa and pilgrimage rows have no coverage', () => {
  assert.equal(getCoverageShape('gayatri-mantra'), null);
  assert.equal(getCoverageShape('char-dham'), null);
  assert.equal(getSourceCoverage(EMPTY_COVERAGE, 'char-dham'), null);
});

test('markVerseRead ignores transition-card and unknown indices, and repeats', () => {
  let s = markVerseRead(EMPTY_COVERAGE, 'bhagavad-gita', 3, 43, 1).state; // ch 3 has 43 pages (0..42)
  assert.equal(s, EMPTY_COVERAGE);
  s = markVerseRead(s, 'bhagavad-gita', 99, 0, 1).state;
  assert.equal(s, EMPTY_COVERAGE);
  s = markVerseRead(s, 'bhagavad-gita', 3, -1, 1).state;
  assert.equal(s, EMPTY_COVERAGE);
  const once = markVerseRead(s, 'bhagavad-gita', 3, 4, 1).state;
  assert.equal(markVerseRead(once, 'bhagavad-gita', 3, 4, 2).state, once);
  assert.ok(isVerseRead(once, 'bhagavad-gita', 3, 4));
});

test('a restart moves no coverage: re-reading early verses keeps the later ones', () => {
  let s = readAll(EMPTY_COVERAGE, 'bhagavad-gita', 3, 0, 22); // 3.1–3.23
  s = readAll(s, 'bhagavad-gita', 3, 0, 4); // "Start over" and read 3.1–3.5 again
  assert.deepEqual(getChapterCoverage(s, 'bhagavad-gita', 3), { chapter: 3, read: 23, total: 43, complete: false });
  assert.deepEqual(findFirstUnread(s, 'bhagavad-gita', 3), { chapter: 3, verseIndex: 23 });
});

test('chapter completion is reported; source summary counts complete chapters and floors pct', () => {
  const r = markVerseRead(readAll(EMPTY_COVERAGE, 'bhagavad-gita', 12, 0, 18), 'bhagavad-gita', 12, 19, 5);
  assert.equal(r.completedChapter, true);
  assert.equal(r.completedPaath, false);
  const cov = getSourceCoverage(r.state, 'bhagavad-gita')!;
  assert.equal(cov.read, 20);
  assert.equal(cov.chaptersComplete, 1);
  assert.equal(cov.hasChapters, true);
  assert.equal(cov.pct, Math.floor((20 / cov.total) * 100));
});

test('finishing every page banks one पाठ and clears the text for the next reading', () => {
  const total = getCoverageShape('hanuman-chalisa')![0].verseCount;
  let s = readAll(EMPTY_COVERAGE, 'hanuman-chalisa', undefined, 0, total - 2);
  const last = markVerseRead(s, 'hanuman-chalisa', undefined, total - 1, 777);
  assert.equal(last.completedPaath, true);
  s = last.state;
  const cov = getSourceCoverage(s, 'hanuman-chalisa')!;
  assert.equal(cov.read, 0);
  assert.equal(cov.paath, 1);
  assert.equal(cov.paathAt, 777);
  assert.equal(cov.hasChapters, false);
  // Second reading.
  s = readAll(s, 'hanuman-chalisa', undefined, 0, total - 1);
  assert.equal(getSourceCoverage(s, 'hanuman-chalisa')!.paath, 2);
});

test('findFirstUnread scans from the given chapter and wraps round', () => {
  let s = readAll(EMPTY_COVERAGE, 'durga-stotram', 2, 0, 21); // chapter 2 complete
  assert.deepEqual(findFirstUnread(s, 'durga-stotram', 2), { chapter: 3, verseIndex: 0 });
  s = readAll(s, 'durga-stotram', 3, 0, 5); // chapter 3 complete too
  assert.deepEqual(findFirstUnread(s, 'durga-stotram', 2), { chapter: 1, verseIndex: 0 });
});

test('resets clear read marks but never the पाठ count; restore merges back', () => {
  const total = getCoverageShape('hanuman-chalisa')![0].verseCount;
  let s = readAll(EMPTY_COVERAGE, 'hanuman-chalisa', undefined, 0, total - 1); // 1 पाठ
  s = readAll(s, 'hanuman-chalisa', undefined, 0, 9);
  const src = resetSourceCoverage(s, 'hanuman-chalisa');
  assert.equal(getSourceCoverage(src.state, 'hanuman-chalisa')!.read, 0);
  assert.equal(getSourceCoverage(src.state, 'hanuman-chalisa')!.paath, 1);

  let g = readAll(EMPTY_COVERAGE, 'bhagavad-gita', 1, 0, 4);
  g = readAll(g, 'bhagavad-gita', 2, 0, 2);
  const ch = resetChapterCoverage(g, 'bhagavad-gita', 1);
  assert.equal(getChapterCoverage(ch.state, 'bhagavad-gita', 1)!.read, 0);
  assert.equal(getChapterCoverage(ch.state, 'bhagavad-gita', 2)!.read, 3);
  // A verse read after the reset survives the undo.
  const after = markVerseRead(ch.state, 'bhagavad-gita', 1, 10, 3).state;
  const back = restoreCoverage(after, ch.snapshot);
  assert.equal(getChapterCoverage(back, 'bhagavad-gita', 1)!.read, 6);
  // Nothing to reset → same state, empty snapshot.
  const none = resetChapterCoverage(EMPTY_COVERAGE, 'bhagavad-gita', 5);
  assert.equal(none.state, EMPTY_COVERAGE);
  assert.deepEqual(none.snapshot, { read: {} });
});

test('backfill seeds up to each saved position, skips first-page positions, banks fully seeded texts', () => {
  const chalisaLast = getCoverageShape('hanuman-chalisa')![0].verseCount - 1;
  const s = backfillFromProgress([
    { sourceId: 'bhagavad-gita', chapter: 3, verseIndex: 4, updatedAt: 10 },
    { sourceId: 'bhagavad-gita', chapter: 4, verseIndex: 0, updatedAt: 11 },
    { sourceId: 'hanuman-chalisa', verseIndex: chalisaLast, updatedAt: 42 },
    { sourceId: 'aarti-0', verseIndex: 2, updatedAt: 5 }, // legacy positional aarti id
  ]);
  assert.equal(getChapterCoverage(s, 'bhagavad-gita', 3)!.read, 5);
  assert.equal(getChapterCoverage(s, 'bhagavad-gita', 4)!.read, 0);
  const chalisa = getSourceCoverage(s, 'hanuman-chalisa')!;
  assert.equal(chalisa.read, 0);
  assert.equal(chalisa.paath, 1);
  assert.equal(chalisa.paathAt, 42);
  assert.equal(getSourceCoverage(s, 'om-jai-jagdish')!.read, 3);
});

test('ram-aarti reports the Ram Stuti coverage it reads', () => {
  const s = markVerseRead(EMPTY_COVERAGE, 'ram-stuti', 1, 0, 1).state;
  assert.equal(coverageKey('ram-aarti', 1), coverageKey('ram-stuti', 1));
  assert.equal(getSourceCoverage(s, 'ram-aarti')!.read, 1);
});

test('parseCoverage drops malformed data instead of throwing', () => {
  assert.deepEqual(parseCoverage(null), EMPTY_COVERAGE);
  const parsed = parseCoverage({
    read: { 'bhagavad-gita::1': [[0, 2], [2, 4], ['x', 1], [5, 3]], bad: 'nope' },
    paath: { 'hanuman-chalisa': 2, nope: -1 },
    paathAt: { 'hanuman-chalisa': 9 },
  });
  assert.deepEqual(parsed.read, { 'bhagavad-gita::1': [[0, 4]] });
  assert.deepEqual(parsed.paath, { 'hanuman-chalisa': 2 });
  assert.deepEqual(parsed.paathAt, { 'hanuman-chalisa': 9 });
});
