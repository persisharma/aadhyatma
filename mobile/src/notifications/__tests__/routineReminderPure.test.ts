/**
 * Pure tests for the routine-reminder planner (PRD-07 Phase 3). Runs under
 * `tsx --test`; wired into `npm run test:data`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  planRoutineReminders,
  formatRoutineReminderContent,
  ROUTINE_NOTIF_PREFIX,
  ROUTINE_REMINDER_CAP,
  ROUTINE_WINDOW_DAYS,
  type RoutineReminderInput,
} from '../routineReminderPure';

function input(over: Partial<RoutineReminderInput> = {}): RoutineReminderInput {
  return {
    routineId: 'r1',
    order: 0,
    nameHi: 'शनि साधना',
    nameEn: 'Shani Sadhana',
    time: { hour: 7, minute: 0 },
    days: 'daily',
    ...over,
  };
}

const NOW = new Date(2026, 6, 2, 6, 0, 0); // Jul 2 2026, 6:00 local (before 7am)
const NOW_KEY = '2026-07-02';

test('daily mode fills one reminder per day across the window', () => {
  const { planned, truncated } = planRoutineReminders([input()], NOW, 5);
  assert.equal(planned.length, 5);
  assert.equal(truncated, 0);
  assert.ok(planned.every((p) => p.identifier.startsWith(`${ROUTINE_NOTIF_PREFIX}:r1:`)));
  // All fire at 07:00, strictly after now, and today's slot is included.
  assert.ok(planned.every((p) => p.fireDate.getHours() === 7 && p.fireDate.getTime() > NOW.getTime()));
  assert.equal(planned[0].dateKey, NOW_KEY);
});

test('weekday mode fires only on the scheduled days (Sat-only → Saturdays only)', () => {
  const { planned } = planRoutineReminders([input({ days: [6] })], NOW, 7);
  assert.equal(planned.length, 1); // one Saturday in any 7-day window
  assert.ok(planned.every((p) => p.fireDate.getDay() === 6));

  const monSat = planRoutineReminders([input({ days: [1, 6] })], NOW, 7).planned;
  assert.equal(monSat.length, 2);
  assert.ok(monSat.every((p) => [1, 6].includes(p.fireDate.getDay())));
});

test('an empty weekday union yields zero candidates', () => {
  const { planned, truncated } = planRoutineReminders([input({ days: [] })], NOW, 7);
  assert.equal(planned.length, 0);
  assert.equal(truncated, 0);
});

test("skips today's slot when its time has already elapsed", () => {
  const afterSeven = new Date(2026, 6, 2, 8, 0, 0); // 8am, past the 7am slot
  const { planned } = planRoutineReminders([input()], afterSeven, 5);
  assert.equal(planned.length, 4);
  assert.notEqual(planned[0].dateKey, NOW_KEY);
});

test('completedToday suppresses today only; tomorrow onward is untouched', () => {
  const { planned } = planRoutineReminders([input({ completedToday: true })], NOW, 5);
  assert.equal(planned.length, 4);
  assert.ok(planned.every((p) => p.dateKey !== NOW_KEY));
  // Without the flag, today is planned.
  const control = planRoutineReminders([input()], NOW, 5).planned;
  assert.equal(control.length, 5);
  assert.equal(control[0].dateKey, NOW_KEY);
});

test('caps priority-first (creation order), soonest fire as tie-break', () => {
  const many: RoutineReminderInput[] = [
    input({ routineId: 'a', order: 0 }),
    input({ routineId: 'b', order: 1 }),
  ];
  const { planned, truncated } = planRoutineReminders(many, NOW, 20, ROUTINE_REMINDER_CAP);
  assert.equal(planned.length, ROUTINE_REMINDER_CAP);
  assert.equal(truncated, 40 - ROUTINE_REMINDER_CAP);
  // Routine 'a' (order 0) has 20 candidates ≥ the cap, so it fills every kept
  // slot — the first routine is never starved by a later one.
  assert.ok(planned.every((p) => p.routineId === 'a'));
  // Within one routine, slots are kept soonest-first.
  for (let i = 1; i < planned.length; i += 1) {
    assert.ok(planned[i - 1].fireDate.getTime() < planned[i].fireDate.getTime());
  }
});

test('the default window is 7 days and the cap 12 — the PRD-07 P3 budget slice', () => {
  assert.equal(ROUTINE_WINDOW_DAYS, 7);
  assert.equal(ROUTINE_REMINDER_CAP, 12);
  // Two daily routines over the default window: 14 candidates → capped at 12.
  const { planned, truncated } = planRoutineReminders(
    [input({ routineId: 'a', order: 0 }), input({ routineId: 'b', order: 1 })],
    NOW
  );
  assert.equal(planned.length, 12);
  assert.equal(truncated, 2);
});

test('identifiers follow routine-reminder:{routineId}:{dateKey}', () => {
  const { planned } = planRoutineReminders([input()], NOW, 1);
  assert.match(planned[0].identifier, /^routine-reminder:r1:\d{4}-\d{2}-\d{2}$/);
  assert.equal(planned[0].identifier, `${ROUTINE_NOTIF_PREFIX}:r1:${planned[0].dateKey}`);
});

test('copy is Devanagari-led and names the routine; blank nameHi falls back to nameEn', () => {
  const { planned } = planRoutineReminders([input()], NOW, 1);
  const { title, body } = formatRoutineReminderContent(planned[0]);
  assert.equal(title, 'नित्य साधना स्मरण');
  assert.equal(body, 'शनि साधना · आज की साधना');

  const enOnly = planRoutineReminders([input({ nameHi: '' })], NOW, 1).planned[0];
  assert.equal(formatRoutineReminderContent(enOnly).body, 'Shani Sadhana · आज की साधना');
});

test('deterministic for a fixed now — no clock reads', () => {
  const a = planRoutineReminders([input({ days: [1, 6] })], NOW);
  const b = planRoutineReminders([input({ days: [1, 6] })], NOW);
  assert.deepEqual(
    a.planned.map((p) => p.identifier),
    b.planned.map((p) => p.identifier)
  );
  assert.deepEqual(
    a.planned.map((p) => p.fireDate.getTime()),
    b.planned.map((p) => p.fireDate.getTime())
  );
});
