import assert from 'node:assert/strict';

import {
  FESTIVE_HOUR,
  FESTIVE_MINUTE,
  FESTIVE_NOTIF_PREFIX,
  FESTIVE_REMINDER_CAP,
  FESTIVE_WINDOW_DAYS,
  formatFestiveReminderContent,
  planFestiveReminders,
  type FestiveReminderInput,
} from '../festiveReminderPure';
import type { FestiveReminderEntry } from '../festiveReminders';

function entry(over: Partial<FestiveReminderEntry> = {}): FestiveReminderEntry {
  return {
    ruleId: 'diwali',
    sourceId: 'mahalakshmi-ashtakam',
    greetingHi: 'शुभ दीपावली',
    greetingEn: 'Happy Diwali',
    inviteHi: 'दीप जलाएँ और महालक्ष्म्यष्टकम् का पाठ करें।',
    inviteEn: 'Light a lamp and read the Mahalakshmi Ashtakam.',
    ...over,
  };
}

function input(
  ruleId: string,
  occurrences: Date[],
  over: Partial<FestiveReminderInput> = {}
): FestiveReminderInput {
  return {
    ruleId,
    nameHi: 'दीपावली',
    nameEn: 'Diwali',
    occurrences,
    entry: entry({ ruleId }),
    ...over,
  };
}

const NOW = new Date(2026, 7, 7, 9, 0, 0, 0); // 7 Aug 2026, 09:00 local

// ---------------------------------------------------------------------------
// Fire time
// ---------------------------------------------------------------------------
{
  const { planned } = planFestiveReminders([input('diwali', [new Date(2026, 10, 8)])], NOW);
  assert.equal(planned.length, 1);
  const fire = planned[0].fireDate;
  assert.equal(fire.getFullYear(), 2026);
  assert.equal(fire.getMonth(), 10);
  assert.equal(fire.getDate(), 8, 'fires ON the festival day, not the evening before');
  assert.equal(fire.getHours(), FESTIVE_HOUR);
  assert.equal(fire.getMinutes(), FESTIVE_MINUTE);
  assert.equal(planned[0].occurrenceDateKey, '2026-11-08');
  assert.equal(planned[0].identifier, `${FESTIVE_NOTIF_PREFIX}:diwali:2026-11-08`);
  assert.equal(planned[0].sourceId, 'mahalakshmi-ashtakam', 'the content target rides the plan');
}

// The default fire time must not collide with the daily-verse default (07:00),
// or the two families land in the same instant and read as a duplicate.
{
  // Widened off the literal types so this stays a runtime guard rather than a
  // comparison TypeScript can fold away.
  const hour: number = FESTIVE_HOUR;
  const minute: number = FESTIVE_MINUTE;
  assert.ok(
    hour !== 7 || minute !== 0,
    'festive fire time must differ from the 07:00 daily-verse default'
  );
  assert.ok(hour >= 0 && hour < 24 && minute >= 0 && minute < 60);
}

// ---------------------------------------------------------------------------
// Window bounds
// ---------------------------------------------------------------------------
{
  // A festival earlier today whose 07:30 has already passed must NOT be scheduled
  // into the past — expo would deliver it immediately.
  const { planned } = planFestiveReminders([input('holi', [new Date(2026, 7, 7)])], NOW);
  assert.equal(planned.length, 0, 'today past the fire time is dropped, not fired late');
}
{
  // Today BEFORE the fire time still counts.
  const early = new Date(2026, 7, 7, 5, 0, 0, 0);
  const { planned } = planFestiveReminders([input('holi', [new Date(2026, 7, 7)])], early);
  assert.equal(planned.length, 1, 'today before the fire time still fires today');
}
{
  const justInside = new Date(NOW);
  justInside.setDate(justInside.getDate() + FESTIVE_WINDOW_DAYS);
  const justOutside = new Date(NOW);
  justOutside.setDate(justOutside.getDate() + FESTIVE_WINDOW_DAYS + 1);

  const inside = planFestiveReminders([input('a', [justInside])], NOW);
  assert.equal(inside.planned.length, 1, 'the last day of the window is included');

  const outside = planFestiveReminders([input('b', [justOutside])], NOW);
  assert.equal(outside.planned.length, 0, 'one day past the window is excluded');
}
{
  // A rule with no resolvable occurrence contributes nothing.
  const { planned, truncated } = planFestiveReminders([input('c', [])], NOW);
  assert.equal(planned.length, 0);
  assert.equal(truncated, 0);
}

// ---------------------------------------------------------------------------
// Capping is soonest-first, NOT fame-first
// ---------------------------------------------------------------------------
{
  // Inputs arrive in fame order (Diwali first). The cap must still keep the
  // festival that happens sooner — nobody opted into these, so losing a
  // three-days-away festival to a four-months-away one is the wrong trade.
  const soonest = new Date(2026, 7, 10); // 3 days out
  const distant = new Date(2026, 10, 8); // ~3 months out
  const { planned, truncated } = planFestiveReminders(
    [input('diwali', [distant]), input('raksha', [soonest])],
    NOW,
    FESTIVE_WINDOW_DAYS,
    1
  );
  assert.equal(planned.length, 1);
  assert.equal(truncated, 1);
  assert.equal(planned[0].ruleId, 'raksha', 'soonest wins the last slot');
}
{
  // Same instant → fame order (catalog position) breaks the tie deterministically.
  const same = new Date(2026, 7, 20);
  const { planned } = planFestiveReminders(
    [input('famous', [same]), input('lesser', [same])],
    NOW,
    FESTIVE_WINDOW_DAYS,
    1
  );
  assert.equal(planned[0].ruleId, 'famous');
}
{
  // Plans are always ordered soonest-first, whatever order the inputs arrive in.
  const { planned } = planFestiveReminders(
    [
      input('c', [new Date(2026, 9, 1)]),
      input('a', [new Date(2026, 7, 20)]),
      input('b', [new Date(2026, 8, 5)]),
    ],
    NOW
  );
  assert.deepEqual(
    planned.map((p) => p.ruleId),
    ['a', 'b', 'c']
  );
}
{
  // The default cap is a real ceiling.
  const many = Array.from({ length: FESTIVE_REMINDER_CAP + 4 }, (_, i) =>
    input(`rule-${i}`, [new Date(2026, 7, 10 + i)])
  );
  const { planned, truncated } = planFestiveReminders(many, NOW);
  assert.equal(planned.length, FESTIVE_REMINDER_CAP);
  assert.equal(truncated, 4);
}

// ---------------------------------------------------------------------------
// One notification per rule-occurrence
// ---------------------------------------------------------------------------
{
  // The same date handed in twice (overlapping resolved years, a re-resolve
  // mid-scan) must not produce two notifications for one festival.
  const d = new Date(2026, 10, 8);
  const { planned } = planFestiveReminders(
    [input('diwali', [d, new Date(2026, 10, 8)])],
    NOW
  );
  assert.equal(planned.length, 1);
}
{
  // Two genuinely different occurrences of one rule inside the window both count.
  const { planned } = planFestiveReminders(
    [input('purnima', [new Date(2026, 7, 20), new Date(2026, 8, 18)])],
    NOW
  );
  assert.equal(planned.length, 2);
  assert.notEqual(planned[0].identifier, planned[1].identifier);
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------
{
  const { planned } = planFestiveReminders([input('diwali', [new Date(2026, 10, 8)])], NOW);
  const p = planned[0];

  const hi = formatFestiveReminderContent(p, 'hi');
  assert.equal(hi.title, 'दीपावली', 'the title is the festival name, nothing appended');
  assert.equal(hi.body, 'शुभ दीपावली · दीप जलाएँ और महालक्ष्म्यष्टकम् का पाठ करें।');
  assert.ok(hi.body.includes('महालक्ष्म्यष्टकम्'), 'the body names the reading it opens');

  const en = formatFestiveReminderContent(p, 'en');
  assert.equal(en.title, 'Diwali');
  assert.equal(en.body, 'Happy Diwali · Light a lamp and read the Mahalakshmi Ashtakam.');

  // gu/kn are re-scripted from the Devanagari (no authored gu/kn copy exists),
  // so they must be non-empty, differ from both hi and en, and carry no
  // Devanagari LETTER left over from an incomplete transliteration. The danda
  // (U+0964) is deliberately excluded — it is shared Indic punctuation and stays
  // put in every script.
  const DEVANAGARI_LETTER = /[ऀ-ॣ०-ॿ]/;
  for (const lang of ['gu', 'kn'] as const) {
    const out = formatFestiveReminderContent(p, lang);
    assert.ok(out.title.length > 0, `${lang} title must not be empty`);
    assert.ok(out.body.length > 0, `${lang} body must not be empty`);
    assert.notEqual(out.title, hi.title, `${lang} title must be re-scripted`);
    assert.notEqual(out.title, en.title, `${lang} title must not fall back to English`);
    assert.ok(!DEVANAGARI_LETTER.test(out.title), `${lang} title must carry no Devanagari`);
    assert.ok(!DEVANAGARI_LETTER.test(out.body), `${lang} body must carry no Devanagari`);
  }

  // Default language is Hindi, matching every other notification family.
  assert.deepEqual(formatFestiveReminderContent(p), hi);
}

// ---------------------------------------------------------------------------
// Purity: the planner never reads the clock
// ---------------------------------------------------------------------------
{
  const at = new Date(2026, 7, 7, 9, 0, 0, 0);
  const args: [FestiveReminderInput[], Date] = [
    [input('diwali', [new Date(2026, 10, 8)]), input('holi', [new Date(2026, 8, 2)])],
    at,
  ];
  const first = planFestiveReminders(...args);
  const second = planFestiveReminders(...args);
  assert.deepEqual(
    first.planned.map((p) => p.identifier),
    second.planned.map((p) => p.identifier),
    'same inputs must plan identically — no Date.now(), no randomness'
  );
}
