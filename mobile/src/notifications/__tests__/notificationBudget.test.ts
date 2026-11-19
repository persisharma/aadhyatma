/**
 * BEH-09: the families' iOS slices must add up to iOS's 64 pending
 * notifications, and a worst-case demand from every family must fit. Runs under
 * `tsx --test`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import {
  familyCap,
  familyWindowDays,
  IOS_FAMILY_BUDGET,
  IOS_PENDING_BUDGET,
  IOS_REMINDER_WINDOW_DAYS,
  type BudgetFamily,
} from '../notificationBudget';
import { computeFireDatesMulti, MAX_REMINDER_TIMES, ROLLING_WINDOW_DAYS } from '../pure';
import { planVratReminders } from '../vratReminderPure';
import { planSadhanaReminders } from '../sadhanaReminderPure';
import { planRoutineReminders } from '../routineReminderPure';
import { planFestiveReminders } from '../festiveReminderPure';
import { planPitruPakshaReminders } from '../pitruPakshaReminderPure';

const FAMILIES = Object.keys(IOS_FAMILY_BUDGET) as BudgetFamily[];

test('the iOS slices sum to no more than the 64-notification limit', () => {
  const sum = FAMILIES.reduce((n, f) => n + IOS_FAMILY_BUDGET[f], 0);
  assert.ok(sum <= IOS_PENDING_BUDGET, `budget sums to ${sum}`);
  assert.ok(FAMILIES.every((f) => IOS_FAMILY_BUDGET[f] > 0));
});

test('iOS caps come from the table; every other platform keeps the larger legacy cap', () => {
  for (const f of FAMILIES) {
    assert.equal(familyCap('ios', f), IOS_FAMILY_BUDGET[f]);
    assert.ok(familyCap('android', f) >= IOS_FAMILY_BUDGET[f], f);
  }
  assert.equal(familyCap('android', 'vrat'), 24);
  assert.equal(familyCap('android', 'dailyVerse'), 64);
  assert.equal(familyWindowDays('ios', 'sadhana', 9), IOS_REMINDER_WINDOW_DAYS.sadhana);
  assert.equal(familyWindowDays('android', 'sadhana', 9), 9);
});

test('daily verse never exceeds its slice at any number of reminder times', () => {
  const now = new Date(2026, 6, 2, 6, 0, 0);
  const cap = familyCap('ios', 'dailyVerse');
  for (let n = 1; n <= MAX_REMINDER_TIMES; n += 1) {
    const times = Array.from({ length: n }, (_, i) => ({ hour: 7 + i, minute: 0 }));
    const dates = computeFireDatesMulti(times, now, cap);
    assert.ok(dates.length <= cap, `${n} times -> ${dates.length}`);
    assert.ok(dates.length > 0);
    // Fair share: each time keeps the same number of days.
    assert.equal(dates.length, n * Math.min(ROLLING_WINDOW_DAYS, Math.floor(cap / n)));
  }
  // The default cap (Android / legacy) is unchanged.
  assert.equal(computeFireDatesMulti([{ hour: 7, minute: 0 }, { hour: 8, minute: 0 }, { hour: 9, minute: 0 }, { hour: 10, minute: 0 }], now).length, 64);
});

test('worst-case demand from every planner fits the iOS limit', () => {
  const now = new Date(2026, 6, 2, 6, 0, 0);
  const day = (n: number) => new Date(2026, 6, 2 + n);

  const dailyTimes = Array.from({ length: MAX_REMINDER_TIMES }, (_, i) => ({ hour: 7 + i, minute: 0 }));
  let total = computeFireDatesMulti(dailyTimes, now, familyCap('ios', 'dailyVerse')).length;

  const pref = { advanceDays: 1 as const, dayOf: true, dayOfTime: { hour: 7, minute: 0 } };
  const vrats = Array.from({ length: 30 }, (_, i) => ({
    ruleId: `v${i}`, order: i, nameHi: 'क', nameEn: 'K', nextDate: day(3 + (i % 20)), pref,
  }));
  total += planVratReminders(vrats, now, familyCap('ios', 'vrat')).planned.length;

  const sadhana = Array.from({ length: 10 }, (_, i) => ({
    programId: `s${i}`, order: i, titleHi: 'क', titleEn: 'K', time: { hour: 7, minute: 0 },
  }));
  total += planSadhanaReminders(
    sadhana, now, familyWindowDays('ios', 'sadhana', 9), familyCap('ios', 'sadhana')
  ).planned.length;

  const routines = Array.from({ length: 10 }, (_, i) => ({
    routineId: `r${i}`, order: i, nameHi: 'क', nameEn: 'K', time: { hour: 7, minute: 0 }, days: [0, 1, 2, 3, 4, 5, 6], completedToday: false,
  }));
  total += planRoutineReminders(
    routines as never, now, familyWindowDays('ios', 'routine', 7), familyCap('ios', 'routine')
  ).planned.length;

  const festivals = Array.from({ length: 12 }, (_, i) => ({
    ruleId: `f${i}`, nameHi: 'क', nameEn: 'K', occurrences: [day(2 + i * 5)],
    entry: { ruleId: `f${i}`, sourceId: 's', greetingHi: 'क', greetingEn: 'K', inviteHi: 'क', inviteEn: 'K' },
  }));
  total += planFestiveReminders(festivals, now, undefined, familyCap('ios', 'festive')).planned.length;

  const windows = [2026, 2027].map((year) => ({
    year,
    window: { purnima: new Date(year, 8, 20), end: new Date(year, 9, 5) },
  }));
  total += planPitruPakshaReminders(windows as never, now, familyCap('ios', 'pitruPaksha')).length;

  // return (5), Pitru Smaran (3) and Janma (2) are bounded by their caps alone.
  total += familyCap('ios', 'return') + familyCap('ios', 'pitruSmaran') + familyCap('ios', 'janmaTithi');

  assert.ok(total <= IOS_PENDING_BUDGET, `worst case requests ${total}`);
});
