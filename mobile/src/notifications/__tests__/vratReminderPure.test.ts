import assert from 'node:assert/strict';

import {
  planVratReminders,
  formatVratReminderContent,
  VRAT_NOTIF_PREFIX,
  type VratReminderInput,
} from '../vratReminderPure';
import { ROLLING_WINDOW_DAYS } from '../pure';

const morning = { hour: 7, minute: 0 };
const defPref = { advanceDays: 1 as const, dayOf: true, dayOfTime: morning };

function input(over: Partial<VratReminderInput>): VratReminderInput {
  return { ruleId: 'x', order: 0, nameHi: 'क', nameEn: 'K', nextDate: null, pref: defPref, ...over };
}

// advanceDays:1 + dayOf:true → two notifications: advance (evening before) + day-of (morning).
{
  const now = new Date(2026, 6, 1, 9, 0, 0, 0); // 1 Jul 09:00
  const occ = new Date(2026, 6, 6); // 6 Jul
  const { planned, truncated } = planVratReminders([input({ ruleId: 'ekadashi', nextDate: occ })], now);
  assert.equal(planned.length, 2);
  assert.equal(truncated, 0);
  const adv = planned.find((p) => p.kind === 'advance');
  const day = planned.find((p) => p.kind === 'dayOf');
  assert.ok(adv && day);
  assert.equal(adv!.fireDate.getDate(), 5); // 6 Jul − 1 day
  assert.equal(adv!.fireDate.getHours(), 18); // evening
  assert.equal(day!.fireDate.getDate(), 6);
  assert.equal(day!.fireDate.getHours(), 7); // morning
  assert.ok(adv!.identifier.startsWith(`${VRAT_NOTIF_PREFIX}:ekadashi:advance:`));
  assert.ok(day!.identifier.startsWith(`${VRAT_NOTIF_PREFIX}:ekadashi:dayOf:`));
}

// advanceDays:0 → no advance; dayOf:false → no day-of.
{
  const now = new Date(2026, 6, 1, 9, 0, 0, 0);
  const occ = new Date(2026, 6, 6);
  const p1 = planVratReminders([input({ nextDate: occ, pref: { advanceDays: 0, dayOf: true, dayOfTime: morning } })], now);
  assert.equal(p1.planned.length, 1);
  assert.equal(p1.planned[0].kind, 'dayOf');

  const p2 = planVratReminders([input({ nextDate: occ, pref: { advanceDays: 2, dayOf: false, dayOfTime: morning } })], now);
  assert.equal(p2.planned.length, 1);
  assert.equal(p2.planned[0].kind, 'advance');
  assert.equal(p2.planned[0].fireDate.getDate(), 4); // 6 Jul − 2
}

// Fire instants in the past are excluded (occurrence is today, both times already passed).
{
  const now = new Date(2026, 6, 6, 9, 0, 0, 0); // on the day, 09:00 (past 07:00 and past 5 Jul 18:00)
  const occ = new Date(2026, 6, 6);
  const { planned } = planVratReminders([input({ nextDate: occ })], now);
  assert.equal(planned.length, 0);
}

// Occurrences beyond the rolling window are excluded.
{
  const now = new Date(2026, 6, 1, 9, 0, 0, 0);
  const occ = new Date(2026, 7, 15); // ~45 days out, > ROLLING_WINDOW_DAYS
  const { planned } = planVratReminders([input({ nextDate: occ })], now);
  assert.equal(planned.length, 0);
}

// A null next occurrence is skipped.
{
  const now = new Date(2026, 6, 1, 9, 0, 0, 0);
  const { planned } = planVratReminders([input({ nextDate: null })], now);
  assert.equal(planned.length, 0);
}

// Over the cap, the highest-priority (lowest order) follows keep their reminders; the rest are truncated.
{
  const now = new Date(2026, 6, 1, 9, 0, 0, 0);
  const inputs: VratReminderInput[] = [];
  for (let i = 0; i < 20; i += 1) {
    inputs.push(
      input({
        ruleId: `v${i}`,
        order: i,
        nextDate: new Date(2026, 6, 2 + i),
        pref: { advanceDays: 1, dayOf: true, dayOfTime: morning },
      })
    );
  }
  const { planned, truncated } = planVratReminders(inputs, now, 5);
  assert.equal(planned.length, 5);
  assert.equal(truncated, 35); // 40 candidates − 5
  const ids = new Set(planned.map((p) => p.ruleId));
  assert.ok(ids.has('v0'));
  assert.ok(!ids.has('v19'));
}

// Content is non-empty and carries the vrat name.
{
  const now = new Date(2026, 6, 1, 9, 0, 0, 0);
  const occ = new Date(2026, 6, 6);
  const { planned } = planVratReminders(
    [input({ ruleId: 'e', nameHi: 'निर्जला एकादशी', nameEn: 'Nirjala Ekadashi', nextDate: occ })],
    now
  );
  for (const p of planned) {
    const { title, body } = formatVratReminderContent(p);
    assert.ok(title.length > 0);
    assert.ok(body.includes('निर्जला एकादशी'));
  }
}

// Sanity: the dedicated vrat cap leaves headroom under the iOS pending limit.
{
  assert.ok(ROLLING_WINDOW_DAYS <= 64);
}

// PRD-28: an optional titleHi override rides through the planner so a solved
// visarjan reads 'विसर्जन स्मरण'; inputs without it keep the family's title.
{
  const now = new Date(2026, 8, 10, 9, 0, 0, 0);
  const occ = new Date(2026, 8, 18);
  const { planned } = planVratReminders(
    [
      input({ ruleId: 'ganesh-chaturthi', nameHi: 'गणेश उत्सव विसर्जन', nameEn: 'Ganesh Utsav Visarjan', nextDate: occ, titleHi: 'विसर्जन स्मरण' }),
      input({ ruleId: 'ekadashi', nextDate: occ, order: 1 }),
    ],
    now
  );
  const visarjanDay = planned.find((p) => p.ruleId === 'ganesh-chaturthi' && p.kind === 'dayOf')!;
  const visarjanAdv = planned.find((p) => p.ruleId === 'ganesh-chaturthi' && p.kind === 'advance')!;
  const ekadashi = planned.find((p) => p.ruleId === 'ekadashi' && p.kind === 'dayOf')!;
  assert.equal(formatVratReminderContent(visarjanDay).title, 'विसर्जन स्मरण');
  assert.equal(formatVratReminderContent(visarjanDay).body, 'आज गणेश उत्सव विसर्जन है · Ganesh Utsav Visarjan today');
  assert.equal(formatVratReminderContent(visarjanAdv).title, 'विसर्जन स्मरण');
  assert.equal(formatVratReminderContent(visarjanAdv).body, 'कल गणेश उत्सव विसर्जन · Ganesh Utsav Visarjan');
  assert.equal(formatVratReminderContent(ekadashi).title, 'व्रत स्मरण');
  assert.equal(ekadashi.titleHi, undefined, 'no override leaks onto other inputs');
  assert.equal(visarjanDay.identifier, `${VRAT_NOTIF_PREFIX}:ganesh-chaturthi:dayOf:2026-09-18`);
}
