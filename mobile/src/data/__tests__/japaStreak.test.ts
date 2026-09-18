/**
 * Japa-only streak (TRD-42 §5.1). `tsx --test` — `src/data` is out of Jest.
 *
 * The behaviour worth pinning is the one a reader gets wrong: today with no
 * japa yet must NOT read as a broken streak.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { computeJapaStreak, japaDayIsActive, shiftDateKey } from '../japaStreak';
import type { DailyEntry } from '@/contexts/UserActivityContext';

const day = (beads: number, rounds = 0): DailyEntry =>
  ({ reads: 0, perSource: {}, japa: beads || rounds ? { gayatri: { beads, rounds } } : {} }) as unknown as DailyEntry;

test('a day with no japa is not active, even if it exists', () => {
  assert.equal(japaDayIsActive(day(0)), false);
  assert.equal(japaDayIsActive(undefined), false);
  assert.equal(japaDayIsActive(day(1)), true);
  assert.equal(japaDayIsActive(day(0, 1)), true);
});

test('today not yet chanted keeps yesterday-anchored streak', () => {
  // The whole point: opening the app in the morning must not show 0 and read as
  // punishment for not having sat down yet.
  const activity = { '2026-09-16': day(108), '2026-09-15': day(54) };
  assert.equal(computeJapaStreak(activity, '2026-09-17'), 2);
});

test('today chanted counts today', () => {
  const activity = { '2026-09-17': day(9), '2026-09-16': day(108) };
  assert.equal(computeJapaStreak(activity, '2026-09-17'), 2);
});

test('a whole missed day ends the streak', () => {
  const activity = { '2026-09-15': day(108), '2026-09-14': day(108) };
  assert.equal(computeJapaStreak(activity, '2026-09-17'), 0);
});

test('no japa ever is zero, not a crash', () => {
  assert.equal(computeJapaStreak({}, '2026-09-17'), 0);
});

test('date keys shift across month and year ends', () => {
  assert.equal(shiftDateKey('2026-03-01', -1), '2026-02-28');
  assert.equal(shiftDateKey('2027-01-01', -1), '2026-12-31');
  assert.equal(shiftDateKey('2024-03-01', -1), '2024-02-29');
});
