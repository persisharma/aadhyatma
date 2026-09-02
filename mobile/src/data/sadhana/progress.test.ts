/**
 * Pure-resolver tests for Sadhana Programs. Runs under `tsx --test` (no RN),
 * wired into `npm run test:data`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SADHANA_PROGRAMS, getProgram } from './programs';
import {
  completedDayCount,
  dayItemsFor,
  orderSadhanaCards,
  programDayCount,
  resolveSadhanaToday,
  withDayCommitted,
  type SadhanaOrderable,
  type SadhanaTodayStatus,
} from './progress';
import type { SadhanaEnrollment } from './types';

const HANUMAN = getProgram('hanuman-41')!; // consecutive (daily)
const GITA = getProgram('gita-18')!;
const NAVRATRI = getProgram('navratri-durga-9')!; // festival-window
const SHRAVAN = getProgram('shravan-somvar')!; // weekday

function enrollment(over: Partial<SadhanaEnrollment> = {}): SadhanaEnrollment {
  return { programId: 'hanuman-41', startedOn: '2026-07-01', status: 'active', completedDays: {}, ...over };
}

test('catalog is well-formed', () => {
  assert.ok(SADHANA_PROGRAMS.length >= 2);
  for (const p of SADHANA_PROGRAMS) {
    // Exactly one of day / days is present.
    assert.notEqual(Boolean(p.day), Boolean(p.days), `${p.id} must have day XOR days`);
    assert.ok(programDayCount(p) > 0);
    // Every program carries a Devanagari thumb glyph for its listing card
    // (design.md §8 — LibraryCard-style thumb).
    assert.ok(p.thumb && p.thumb.trim().length > 0, `${p.id} must have a thumb glyph`);
    // The grace rule lives in the detail screen's footer for every program —
    // intros must not restate it (it duplicated on-screen for hanuman-41 once).
    assert.ok(!p.introHi.includes('टूटत'), `${p.id} introHi must not restate the grace rule`);
    assert.ok(!/never breaks|does not break/i.test(p.introEn), `${p.id} introEn must not restate the grace rule`);
  }
});

test('day counts', () => {
  assert.equal(programDayCount(HANUMAN), 41);
  assert.equal(programDayCount(GITA), 18);
});

test('uniform program repeats the same unit every day', () => {
  assert.deepEqual(dayItemsFor(HANUMAN, 1), dayItemsFor(HANUMAN, 41));
  assert.equal(dayItemsFor(HANUMAN, 1)[0].sourceId, 'hanuman-chalisa');
});

test('per-day program maps dayIndex → chapter', () => {
  assert.equal(dayItemsFor(GITA, 1)[0].chapter, 1);
  assert.equal(dayItemsFor(GITA, 18)[0].chapter, 18);
  assert.deepEqual(dayItemsFor(GITA, 0), []);
  assert.deepEqual(dayItemsFor(GITA, 19), []);
});

test('fresh enrollment → active on day 1', () => {
  const s = resolveSadhanaToday(enrollment(), HANUMAN, '2026-07-02');
  assert.equal(s.kind, 'active');
  if (s.kind === 'active') {
    assert.equal(s.dayIndex, 1);
    assert.equal(s.totalDays, 41);
    assert.equal(s.items[0].sourceId, 'hanuman-chalisa');
  }
});

test('completing today → done-today, next day locked until tomorrow', () => {
  const e = enrollment({ completedDays: { 1: { at: '2026-07-02', via: 'read-to-end' } } });
  const s = resolveSadhanaToday(e, HANUMAN, '2026-07-02');
  assert.equal(s.kind, 'done-today');
  if (s.kind === 'done-today') assert.equal(s.dayIndex, 1);
});

test('grace: a calendar gap does not consume a day — next day is active, not skipped', () => {
  // Completed day 1 three days ago; nothing since. Still on day 2.
  const e = enrollment({ completedDays: { 1: { at: '2026-07-02', via: 'read-to-end' } } });
  const s = resolveSadhanaToday(e, HANUMAN, '2026-07-05');
  assert.equal(s.kind, 'active');
  if (s.kind === 'active') assert.equal(s.dayIndex, 2);
});

test('completing the final day → completed (पूर्णाहुति)', () => {
  const completedDays: Record<number, { at: string; via: 'read-to-end' }> = {};
  for (let d = 1; d <= 18; d++) completedDays[d] = { at: '2026-07-02', via: 'read-to-end' };
  const e: SadhanaEnrollment = {
    programId: 'gita-18',
    startedOn: '2026-07-01',
    status: 'active',
    completedDays,
    completedOn: '2026-07-19',
  };
  const s = resolveSadhanaToday(e, GITA, '2026-07-20');
  assert.equal(s.kind, 'completed');
  if (s.kind === 'completed') assert.equal(s.completedOn, '2026-07-19');
});

// ── Phase 4 cadences ────────────────────────────────────────────────────────

test('day counts for weekday + festival cadences', () => {
  assert.equal(programDayCount(NAVRATRI), 9);
  assert.equal(programDayCount(SHRAVAN), 4);
});

test('navratri: unique completion key per day, chapter rotation', () => {
  // Distinct item ids per day so completion keys never collide across the window.
  const ids = Array.from({ length: 9 }, (_, i) => dayItemsFor(NAVRATRI, i + 1)[0].id);
  const sources = Array.from({ length: 9 }, (_, i) => dayItemsFor(NAVRATRI, i + 1)[0].sourceId);
  assert.equal(new Set(ids).size, 9);
  assert.equal(dayItemsFor(NAVRATRI, 1)[0].sourceId, 'durga-chalisa');
  assert.ok(sources.includes('jai-ambe-gauri'));
  assert.ok(sources.includes('durga-stotram'));
});

test('festival-window: waiting when no window today, active inside the window', () => {
  const e = enrollment({ programId: 'navratri-durga-9' });
  // No window fact → upcoming.
  const up = resolveSadhanaToday(e, NAVRATRI, '2026-10-01', { windowStartKey: '2026-10-03' });
  assert.equal(up.kind, 'waiting');
  if (up.kind === 'waiting') {
    assert.equal(up.reason, 'window-upcoming');
    assert.equal(up.whenKey, '2026-10-03');
    assert.equal(up.items[0].sourceId, 'durga-chalisa');
  }
  // Inside the window on day 3.
  const inW = resolveSadhanaToday(e, NAVRATRI, '2026-10-05', { windowDayIndex: 3 });
  assert.equal(inW.kind, 'active');
  if (inW.kind === 'active') assert.equal(inW.dayIndex, 3);
});

test('festival-window: a completed calendar day shows done-today', () => {
  const e = enrollment({ programId: 'navratri-durga-9', completedDays: { 3: { at: '2026-10-05', via: 'read-to-end' } } });
  const s = resolveSadhanaToday(e, NAVRATRI, '2026-10-05', { windowDayIndex: 3 });
  assert.equal(s.kind, 'done-today');
  if (s.kind === 'done-today') assert.equal(s.dayIndex, 3);
});

test('weekday: resting on an off-day, active on an eligible day', () => {
  const e = enrollment({ programId: 'shravan-somvar' });
  const off = resolveSadhanaToday(e, SHRAVAN, '2026-07-02', { todayEligible: false, nextEligibleKey: '2026-07-06' });
  assert.equal(off.kind, 'waiting');
  if (off.kind === 'waiting') {
    assert.equal(off.reason, 'weekday-off');
    assert.equal(off.whenKey, '2026-07-06');
    assert.equal(off.items[0].sourceId, 'shiv-chalisa');
  }
  const on = resolveSadhanaToday(e, SHRAVAN, '2026-07-06', { todayEligible: true });
  assert.equal(on.kind, 'active');
  if (on.kind === 'active') {
    assert.equal(on.dayIndex, 1);
    assert.equal(on.items[0].sourceId, 'shiv-chalisa');
  }
});

test('weekday: grace — a missed eligible day does not advance the vow', () => {
  // One Monday done; the next eligible day resumes at day 2, not skipped ahead.
  const e = enrollment({ programId: 'shravan-somvar', completedDays: { 1: { at: '2026-07-06', via: 'read-to-end' } } });
  const on = resolveSadhanaToday(e, SHRAVAN, '2026-07-20', { todayEligible: true });
  assert.equal(on.kind, 'active');
  if (on.kind === 'active') assert.equal(on.dayIndex, 2);
});

test('withDayCommitted appends the day immutably', () => {
  const e = enrollment();
  const next = withDayCommitted(e, 1, { at: '2026-07-02', via: 'marked' });
  assert.deepEqual(e.completedDays, {}); // unchanged
  assert.equal(completedDayCount({ ...e, completedDays: next }), 1);
  assert.equal(next[1].via, 'marked');
});

// ── ordering ─────────────────────────────────────────────────────────────
const orderCard = (program: typeof HANUMAN, status: SadhanaTodayStatus): SadhanaOrderable => ({
  program,
  status,
});
const order = (cards: SadhanaOrderable[]) => orderSadhanaCards(cards).map((c) => c.program.id);

test('orderSadhanaCards: daily card first, then upcoming sankalps nearest-first', () => {
  const cards: SadhanaOrderable[] = [
    orderCard(NAVRATRI, { kind: 'waiting', totalDays: 9, doneCount: 0, reason: 'window-upcoming', whenKey: '2026-10-11', items: [] }),
    orderCard(SHRAVAN, { kind: 'waiting', totalDays: 4, doneCount: 0, reason: 'weekday-off', whenKey: '2026-08-03', items: [] }),
    orderCard(HANUMAN, { kind: 'active', dayIndex: 3, totalDays: 41, items: [] }),
  ];
  assert.deepEqual(order(cards), ['hanuman-41', 'shravan-somvar', 'navratri-durga-9']);
});

test('orderSadhanaCards: daily (consecutive) active outranks a calendar-gated card eligible today', () => {
  const cards: SadhanaOrderable[] = [
    orderCard(SHRAVAN, { kind: 'active', dayIndex: 1, totalDays: 4, items: [] }),
    orderCard(HANUMAN, { kind: 'active', dayIndex: 1, totalDays: 41, items: [] }),
  ];
  assert.deepEqual(order(cards), ['hanuman-41', 'shravan-somvar']);
});

test('orderSadhanaCards: resting sankalps sort nearest-first regardless of input order', () => {
  const cards: SadhanaOrderable[] = [
    orderCard(NAVRATRI, { kind: 'waiting', totalDays: 9, doneCount: 0, reason: 'window-upcoming', whenKey: '2026-10-11', items: [] }),
    orderCard(SHRAVAN, { kind: 'waiting', totalDays: 4, doneCount: 0, reason: 'weekday-off', whenKey: '2026-08-03', items: [] }),
  ];
  assert.deepEqual(order(cards), ['shravan-somvar', 'navratri-durga-9']);
});

test('orderSadhanaCards: done-today outranks waiting; completed sinks last', () => {
  const cards: SadhanaOrderable[] = [
    orderCard(NAVRATRI, { kind: 'completed', totalDays: 9, completedOn: '2026-01-01' }),
    orderCard(SHRAVAN, { kind: 'waiting', totalDays: 4, doneCount: 1, reason: 'weekday-off', whenKey: '2026-08-03', items: [] }),
    orderCard(HANUMAN, { kind: 'done-today', dayIndex: 2, totalDays: 41 }),
  ];
  assert.deepEqual(order(cards), ['hanuman-41', 'shravan-somvar', 'navratri-durga-9']);
});

test('orderSadhanaCards: does not mutate its input', () => {
  const cards: SadhanaOrderable[] = [
    orderCard(HANUMAN, { kind: 'active', dayIndex: 1, totalDays: 41, items: [] }),
    orderCard(NAVRATRI, { kind: 'waiting', totalDays: 9, doneCount: 0, reason: 'window-upcoming', whenKey: '2026-10-11', items: [] }),
  ];
  const before = cards.map((c) => c.program.id);
  orderSadhanaCards(cards);
  assert.deepEqual(cards.map((c) => c.program.id), before);
});
