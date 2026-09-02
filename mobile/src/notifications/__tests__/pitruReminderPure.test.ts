import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  formatPitruSmaranReminderContent,
  planPitruSmaranReminders,
} from '../pitruSmaranReminderPure';
import {
  formatPitruPakshaReminderContent,
  planPitruPakshaReminders,
} from '../pitruPakshaReminderPure';

test('personal planner is opt-in by input and creates day-before plus day-of slots', () => {
  const planned = planPitruSmaranReminders([{
    entryId: 'father',
    displayNameHi: 'पिताजी',
    displayNameEn: 'Father',
    tithiHi: 'माघ कृष्ण अष्टमी',
    tithiEn: 'Magha Krishna Ashtami',
    nextDate: new Date(2026, 7, 20),
  }], new Date(2026, 7, 1, 12));
  assert.deepEqual(planned.map((item) => [item.kind, item.fireDate.getDate(), item.fireDate.getHours()]), [
    ['advance', 19, 18],
    ['dayOf', 20, 7],
  ]);
  assert.match(formatPitruSmaranReminderContent(planned[0], 'hi').body, /कल पिताजी/);
  assert.match(formatPitruSmaranReminderContent(planned[1], 'en').body, /Today is Father/);
  assert.equal(planPitruSmaranReminders([], new Date(2026, 7, 1)).length, 0);
});

test('season planner creates two public, person-free reminders and ignores past slots', () => {
  const window = {
    purnima: new Date(2026, 8, 26),
    start: new Date(2026, 8, 27),
    end: new Date(2026, 9, 10),
  };
  const planned = planPitruPakshaReminders([{ year: 2026, window }], new Date(2026, 7, 1));
  assert.deepEqual(planned.map((item) => [item.kind, item.fireDate.getMonth(), item.fireDate.getDate(), item.fireDate.getHours()]), [
    ['seasonStart', 8, 25, 18],
    ['sarvapitriEve', 9, 9, 18],
  ]);
  for (const item of planned) {
    const copy = formatPitruPakshaReminderContent(item, 'hi');
    assert.doesNotMatch(`${copy.title} ${copy.body}`, /पिताजी|माताजी|Father|Mother/);
  }
  assert.equal(planPitruPakshaReminders([{ year: 2026, window }], new Date(2026, 9, 10)).length, 0);
});
