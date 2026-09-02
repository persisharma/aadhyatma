// जन्म तिथि reminder planner (PRD-29 §3.5) — pure, `now` parameterised.
// Runs under `tsx --test` (npm run test:data).
import assert from 'node:assert/strict';
import test from 'node:test';

import {
  formatJanmaTithiReminderContent,
  JANMA_TITHI_EVE_HOUR,
  JANMA_TITHI_NOTIF_PREFIX,
  JANMA_TITHI_REMINDER_CAP,
  planJanmaTithiReminders,
  type JanmaTithiReminderInput,
} from '../janmaTithiReminderPure';

const NOW = new Date(2026, 7, 31, 10, 0, 0);

function input(personId: string, nextDate: Date | null): JanmaTithiReminderInput {
  return {
    personId,
    displayNameHi: 'मधुसूदन',
    displayNameEn: 'Madhusudan',
    tithiHi: 'कार्तिक शुक्ल नवमी',
    tithiEn: 'Kartik Shukla Navami',
    nextDate,
  };
}

test('plans exactly ONE notice per person: the evening before at 18:00', () => {
  const occurrence = new Date(2026, 9, 29);
  const planned = planJanmaTithiReminders([input('p-1', occurrence)], NOW);
  assert.equal(planned.length, 1);
  const [notice] = planned;
  assert.deepEqual(
    [notice.fireDate.getFullYear(), notice.fireDate.getMonth(), notice.fireDate.getDate()],
    [2026, 9, 28]
  );
  assert.equal(notice.fireDate.getHours(), JANMA_TITHI_EVE_HOUR);
  assert.equal(notice.occurrenceDateKey, '2026-10-29');
  assert.equal(notice.identifier, `${JANMA_TITHI_NOTIF_PREFIX}:p-1:2026-10-29`);
});

test('a null date, a passed eve, and an out-of-window date all schedule nothing', () => {
  assert.equal(planJanmaTithiReminders([input('p-1', null)], NOW).length, 0);
  // Occurrence is today: its eve (yesterday 18:00) is already past — silence,
  // the Home chip owns the day itself.
  assert.equal(planJanmaTithiReminders([input('p-1', new Date(2026, 7, 31))], NOW).length, 0);
  const farFuture = new Date(2028, 0, 1);
  assert.equal(planJanmaTithiReminders([input('p-1', farFuture)], NOW).length, 0);
});

test('the cap keeps the SOONEST notices (dated one-shots have no user ranking)', () => {
  const inputs = Array.from({ length: JANMA_TITHI_REMINDER_CAP + 3 }, (_, i) =>
    input(`p-${i}`, new Date(2026, 9, 10 + i))
  );
  const planned = planJanmaTithiReminders(inputs, NOW);
  assert.equal(planned.length, JANMA_TITHI_REMINDER_CAP);
  for (let i = 1; i < planned.length; i += 1) {
    assert.ok(planned[i - 1].fireDate.getTime() <= planned[i].fireDate.getTime());
  }
  assert.equal(planned[0].personId, 'p-0');
  assert.ok(!planned.some((p) => p.personId === `p-${JANMA_TITHI_REMINDER_CAP + 2}`));
});

test('copy is devotional, never social — names the tithi, no greeting, no exclamation', () => {
  const [notice] = planJanmaTithiReminders([input('p-1', new Date(2026, 9, 29))], NOW);
  const hi = formatJanmaTithiReminderContent(notice, 'hi');
  assert.equal(hi.title, 'जन्म तिथि');
  assert.equal(hi.body, 'कल मधुसूदन की जन्म तिथि है · कार्तिक शुक्ल नवमी');
  const en = formatJanmaTithiReminderContent(notice, 'en');
  assert.equal(en.title, 'Janma Tithi');
  assert.ok(en.body.includes('Kartik Shukla Navami'));
  for (const text of [hi.title, hi.body, en.title, en.body]) {
    assert.ok(!text.includes('!'), 'no exclamation marks — round 1 §3 rejected greeting cards');
    assert.ok(!/happy birthday/i.test(text));
  }
});
