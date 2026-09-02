import test from 'node:test';
import assert from 'node:assert/strict';
import {
  planMuhuratReminders,
  formatMuhuratReminderContent,
  clampDayOf,
  MUHURAT_NOTIF_PREFIX,
  MUHURAT_REMINDER_CAP,
  WINDOW_LEAD_MINUTES,
  ADVANCE_HOUR,
  type MuhuratReminderInput,
  type ResolvedMuhuratReminder,
} from '../muhuratReminderPure';

// Anchored on the real engine output the PRD-16 prototype uses: Bengaluru,
// 17 Aug 2026, वाहन क्रय, श्रेष्ठ, best window Amrit 6:07–7:41 AM.
const AUG_17 = new Date(2026, 7, 17);
const AMRIT_START = new Date(2026, 7, 17, 6, 7);
const AMRIT_END = new Date(2026, 7, 17, 7, 41);

const PREF: ResolvedMuhuratReminder = {
  advanceDays: 1,
  dayOf: true,
  dayOfTime: { hour: 7, minute: 0 },
  dayOfAtWindow: true,
};

function input(over: Partial<MuhuratReminderInput> = {}): MuhuratReminderInput {
  return {
    occasionId: 'vahan',
    dateKey: '2026-08-17',
    date: AUG_17,
    nameHi: 'वाहन क्रय',
    nameEn: 'Vehicle Purchase',
    windowStart: AMRIT_START,
    windowEnd: AMRIT_END,
    windowNameHi: 'अमृत',
    windowNameEn: 'Amrit',
    tier: 'shreshtha',
    pref: PREF,
    ...over,
  };
}

// ── the clamp ───────────────────────────────────────────────────────────────

test('clampDayOf: window-anchored day-of fires WINDOW_LEAD_MINUTES before the window', () => {
  const fire = clampDayOf(AUG_17, { hour: 7, minute: 0 }, AMRIT_START, true);
  assert.equal(fire.getTime(), AMRIT_START.getTime() - WINDOW_LEAD_MINUTES * 60_000);
  assert.equal(fire.getHours(), 5);
  assert.equal(fire.getMinutes(), 37);
});

test('clampDayOf: a literal 07:00 is pulled BACK behind an early window', () => {
  // The bug this exists to prevent: the shipped vrat default (07:00) would land
  // 53 minutes after the 6:07 AM Amrit window opened.
  const fire = clampDayOf(AUG_17, { hour: 7, minute: 0 }, AMRIT_START, false);
  assert.equal(fire.getTime(), AMRIT_START.getTime() - WINDOW_LEAD_MINUTES * 60_000);
});

test('clampDayOf: a chosen time already before the window is left alone', () => {
  // Abhijit 11:43 AM — 07:00 is comfortably earlier, so no clamping.
  const abhijit = new Date(2026, 10, 26, 11, 43);
  const fire = clampDayOf(new Date(2026, 10, 26), { hour: 7, minute: 0 }, abhijit, false);
  assert.equal(fire.getHours(), 7);
  assert.equal(fire.getMinutes(), 0);
});

test('clampDayOf: window-anchored beats a LATER chosen time too', () => {
  const abhijit = new Date(2026, 10, 26, 11, 43);
  const fire = clampDayOf(new Date(2026, 10, 26), { hour: 7, minute: 0 }, abhijit, true);
  assert.equal(fire.getHours(), 11);
  assert.equal(fire.getMinutes(), 13);
});

test('clampDayOf: never crosses back past local midnight', () => {
  // A hypothetical 00:10 window would put lead-30min on the previous evening,
  // where it would collide with the advance notice.
  const preDawn = new Date(2026, 7, 17, 0, 10);
  const fire = clampDayOf(AUG_17, { hour: 7, minute: 0 }, preDawn, true);
  assert.equal(fire.getTime(), AUG_17.getTime());
});

test('clampDayOf: no window falls back to the chosen time', () => {
  const fire = clampDayOf(AUG_17, { hour: 8, minute: 30 }, null, true);
  assert.equal(fire.getHours(), 8);
  assert.equal(fire.getMinutes(), 30);
});

// ── planning ────────────────────────────────────────────────────────────────

test('plans one advance + one day-of per follow', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const { planned, truncated } = planMuhuratReminders([input()], now);
  assert.equal(truncated, 0);
  assert.equal(planned.length, 2);

  const advance = planned.find((p) => p.kind === 'advance')!;
  const dayOf = planned.find((p) => p.kind === 'dayOf')!;

  // Advance: evening before, at the hour SHARED with the vrat planner.
  assert.equal(advance.fireDate.getDate(), 16);
  assert.equal(advance.fireDate.getHours(), ADVANCE_HOUR);
  // Day-of: clamped behind the 6:07 AM window.
  assert.equal(dayOf.fireDate.getDate(), 17);
  assert.equal(dayOf.fireDate.getHours(), 5);
  assert.equal(dayOf.fireDate.getMinutes(), 37);
});

test('identifiers are prefix-scoped and stable per (occasion, kind, date)', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const { planned } = planMuhuratReminders([input()], now);
  for (const p of planned) assert.ok(p.identifier.startsWith(MUHURAT_NOTIF_PREFIX));
  assert.ok(planned.some((p) => p.identifier === 'muhurat-reminder:vahan:advance:2026-08-17'));
  assert.ok(planned.some((p) => p.identifier === 'muhurat-reminder:vahan:dayOf:2026-08-17'));
});

test('an excluded day schedules NOTHING (verdict drift after a location change)', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const { planned } = planMuhuratReminders([input({ tier: 'excluded' })], now);
  assert.equal(planned.length, 0);
});

test('advanceDays 0 drops the advance notice; dayOf false drops the day-of', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const noAdvance = planMuhuratReminders(
    [input({ pref: { ...PREF, advanceDays: 0 } })],
    now
  ).planned;
  assert.deepEqual(noAdvance.map((p) => p.kind), ['dayOf']);

  const noDayOf = planMuhuratReminders([input({ pref: { ...PREF, dayOf: false } })], now).planned;
  assert.deepEqual(noDayOf.map((p) => p.kind), ['advance']);

  const off = planMuhuratReminders(
    [input({ pref: { ...PREF, advanceDays: 0, dayOf: false } })],
    now
  ).planned;
  assert.equal(off.length, 0);
});

test('advanceDays 3 fires three evenings before', () => {
  const now = new Date(2026, 7, 12, 9, 0);
  const { planned } = planMuhuratReminders([input({ pref: { ...PREF, advanceDays: 3 } })], now);
  const advance = planned.find((p) => p.kind === 'advance')!;
  assert.equal(advance.fireDate.getDate(), 14);
  assert.equal(advance.fireDate.getHours(), ADVANCE_HOUR);
});

test('fire times already past are dropped', () => {
  // Standing at 6:30 AM on the day itself: the 5:37 AM day-of and the 16 Aug
  // advance are both behind us.
  const now = new Date(2026, 7, 17, 6, 30);
  const { planned } = planMuhuratReminders([input()], now);
  assert.equal(planned.length, 0);
});

test('fire times beyond the rolling window are dropped', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const far = input({ dateKey: '2027-03-01', date: new Date(2027, 2, 1), windowStart: null, windowEnd: null, windowNameHi: null, windowNameEn: null });
  const { planned } = planMuhuratReminders([far], now);
  assert.equal(planned.length, 0);
});

test('cap keeps the SOONEST notices and reports the truncation', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  // Six follows on consecutive days => 12 candidates, cap 8.
  const inputs = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(2026, 7, 20 + i);
    return input({
      occasionId: `occ-${i}`,
      dateKey: `2026-08-${20 + i}`,
      date: d,
      windowStart: new Date(2026, 7, 20 + i, 9, 0),
      windowEnd: new Date(2026, 7, 20 + i, 10, 30),
    });
  });
  const { planned, truncated } = planMuhuratReminders(inputs, now);
  assert.equal(planned.length, MUHURAT_REMINDER_CAP);
  assert.equal(truncated, 4);

  // Soonest-first: the plan is sorted, and nothing kept fires after anything dropped.
  const times = planned.map((p) => p.fireDate.getTime());
  assert.deepEqual(times, [...times].sort((a, b) => a - b));
  // The two nearest follows (20 & 21 Aug) keep BOTH their notices.
  assert.equal(planned.filter((p) => p.dateKey === '2026-08-20').length, 2);
  assert.equal(planned.filter((p) => p.dateKey === '2026-08-21').length, 2);
  // The furthest follow (25 Aug) keeps none.
  assert.equal(planned.filter((p) => p.dateKey === '2026-08-25').length, 0);
});

test('planning is deterministic when two notices share a fire minute', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const a = input({ occasionId: 'vahan', dateKey: '2026-08-17' });
  const b = input({ occasionId: 'namkaran', dateKey: '2026-08-17' });
  const first = planMuhuratReminders([a, b], now).planned.map((p) => p.identifier);
  const second = planMuhuratReminders([b, a], now).planned.map((p) => p.identifier);
  assert.deepEqual(first, second);
});

test('a day with no resolvable window still gets both notices at the chosen time', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const { planned } = planMuhuratReminders(
    [input({ windowStart: null, windowEnd: null, windowNameHi: null, windowNameEn: null })],
    now
  );
  assert.equal(planned.length, 2);
  const dayOf = planned.find((p) => p.kind === 'dayOf')!;
  assert.equal(dayOf.fireDate.getHours(), 7);
  assert.equal(dayOf.windowLabelHi, null);
});

// ── copy ────────────────────────────────────────────────────────────────────

test('day-of copy carries the window; advance copy names the day', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const { planned } = planMuhuratReminders([input()], now);
  const dayOf = formatMuhuratReminderContent(planned.find((p) => p.kind === 'dayOf')!);
  const advance = formatMuhuratReminderContent(planned.find((p) => p.kind === 'advance')!);

  assert.equal(dayOf.title, 'मुहूर्त स्मरण');
  assert.ok(dayOf.body.includes('वाहन क्रय'), dayOf.body);
  assert.ok(dayOf.body.includes('अमृत'), dayOf.body);
  assert.ok(dayOf.body.includes('6:07'), dayOf.body);
  assert.ok(dayOf.body.includes('Vehicle Purchase'), dayOf.body);

  assert.ok(advance.body.startsWith('कल '), advance.body);
  assert.ok(advance.body.includes('वाहन क्रय'), advance.body);
});

test('multi-day advance copy counts the days', () => {
  const now = new Date(2026, 7, 12, 9, 0);
  const { planned } = planMuhuratReminders([input({ pref: { ...PREF, advanceDays: 3 } })], now);
  const advance = formatMuhuratReminderContent(planned.find((p) => p.kind === 'advance')!);
  assert.ok(advance.body.startsWith('3 दिन में '), advance.body);
});

test('every notification body is authored Hindi-first with an English counterpart', () => {
  const now = new Date(2026, 7, 14, 9, 0);
  const { planned } = planMuhuratReminders([input()], now);
  for (const p of planned) {
    const { title, body } = formatMuhuratReminderContent(p);
    assert.match(title, /[ऀ-ॿ]/, `title lacks Devanagari: ${title}`);
    assert.match(body, /[ऀ-ॿ]/, `body lacks Devanagari: ${body}`);
    assert.match(body, /[A-Za-z]/, `body lacks the English counterpart: ${body}`);
  }
});
