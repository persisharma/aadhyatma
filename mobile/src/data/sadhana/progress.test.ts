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
  programDayCount,
  resolveSadhanaToday,
  withDayCommitted,
} from './progress';
import type { SadhanaEnrollment } from './types';

const HANUMAN = getProgram('hanuman-41')!;
const GITA = getProgram('gita-18')!;
const NAVRATRI = getProgram('navratri-durga-9')!;
const SHRAVAN = getProgram('shravan-somvar')!;

function enrollment(over: Partial<SadhanaEnrollment> = {}): SadhanaEnrollment {
  return { programId: 'hanuman-41', startedOn: '2026-07-01', status: 'active', completedDays: {}, ...over };
}

test('catalog is well-formed', () => {
  assert.ok(SADHANA_PROGRAMS.length >= 2);
  for (const p of SADHANA_PROGRAMS) {
    // Exactly one of day / days is present.
    assert.notEqual(Boolean(p.day), Boolean(p.days), `${p.id} must have day XOR days`);
    assert.ok(programDayCount(p) > 0);
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
  assert.equal(new Set(ids).size, 9);
  assert.equal(dayItemsFor(NAVRATRI, 1)[0].sourceId, 'durga-chalisa');
});

test('festival-window: waiting when no window today, active inside the window', () => {
  const e = enrollment({ programId: 'navratri-durga-9' });
  // No window fact → upcoming.
  const up = resolveSadhanaToday(e, NAVRATRI, '2026-10-01', { windowStartKey: '2026-10-03' });
  assert.equal(up.kind, 'waiting');
  if (up.kind === 'waiting') {
    assert.equal(up.reason, 'window-upcoming');
    assert.equal(up.whenKey, '2026-10-03');
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
