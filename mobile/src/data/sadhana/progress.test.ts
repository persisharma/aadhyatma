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

test('withDayCommitted appends the day immutably', () => {
  const e = enrollment();
  const next = withDayCommitted(e, 1, { at: '2026-07-02', via: 'marked' });
  assert.deepEqual(e.completedDays, {}); // unchanged
  assert.equal(completedDayCount({ ...e, completedDays: next }), 1);
  assert.equal(next[1].via, 'marked');
});
