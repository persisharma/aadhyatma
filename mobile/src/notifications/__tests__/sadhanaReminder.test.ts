/**
 * Pure tests for the sadhana-reminder planner (PRD-11 P3). Runs under
 * `tsx --test`; wired into `npm run test:data`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  planSadhanaReminders,
  formatSadhanaReminderContent,
  SADHANA_NOTIF_PREFIX,
  SADHANA_REMINDER_CAP,
  type SadhanaReminderInput,
} from '../sadhanaReminderPure';

function input(over: Partial<SadhanaReminderInput> = {}): SadhanaReminderInput {
  return { programId: 'hanuman-41', order: 0, titleHi: 'हनुमान चालीसा', titleEn: 'Hanuman Chalisa', time: { hour: 7, minute: 0 }, ...over };
}

const NOW = new Date(2026, 6, 2, 6, 0, 0); // Jul 2 2026, 6:00 local (before 7am)

test('schedules one reminder per day across the window', () => {
  const { planned } = planSadhanaReminders([input()], NOW, 5);
  assert.equal(planned.length, 5);
  assert.ok(planned.every((p) => p.identifier.startsWith(`${SADHANA_NOTIF_PREFIX}:hanuman-41:`)));
  // All fire at 07:00 and strictly after now.
  assert.ok(planned.every((p) => p.fireDate.getHours() === 7 && p.fireDate.getTime() > NOW.getTime()));
});

test("skips today's slot when its time has already elapsed", () => {
  const afterSeven = new Date(2026, 6, 2, 8, 0, 0); // 8am, past the 7am slot
  const { planned } = planSadhanaReminders([input()], afterSeven, 5);
  // Today's 7am is in the past → first fire is tomorrow.
  assert.equal(planned.length, 4);
  assert.notEqual(planned[0].dateKey, '2026-07-02');
});

test('caps total notifications, priority-first', () => {
  const many: SadhanaReminderInput[] = [
    input({ programId: 'a', order: 0 }),
    input({ programId: 'b', order: 1 }),
  ];
  const { planned, truncated } = planSadhanaReminders(many, NOW, 20, SADHANA_REMINDER_CAP);
  assert.equal(planned.length, SADHANA_REMINDER_CAP);
  assert.equal(truncated, 40 - SADHANA_REMINDER_CAP);
  // Lowest order kept first — program 'a' should not be starved.
  assert.ok(planned.some((p) => p.programId === 'a'));
});

test('content is Hindi-led and names the program', () => {
  const { planned } = planSadhanaReminders([input()], NOW, 1);
  const { title, body } = formatSadhanaReminderContent(planned[0]);
  assert.equal(title, 'संकल्प स्मरण');
  assert.ok(body.includes('हनुमान चालीसा'));
});
