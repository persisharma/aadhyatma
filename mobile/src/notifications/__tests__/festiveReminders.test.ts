import assert from 'node:assert/strict';

import { library } from '@/data/texts';
import { buildEntryStartTarget } from '@/navigation/entryRoutes';
import { OBSERVANCE_RULES } from '@/panchang/festivals';
import { getNextOccurrence } from '@/panchang/vratCatalog';
import {
  FESTIVE_REMINDERS,
  festiveReminderOrder,
  getFestiveReminderEntry,
} from '../festiveReminders';

// The curated catalog is data-only by design (it imports neither festivals.ts nor
// texts.ts, so the planner stays pure). This suite is what holds the two ends
// together: it fails the build the moment a rule id or a content id drifts.

const RULE_BY_ID = new Map(OBSERVANCE_RULES.map((r) => [r.id, r] as const));
const ENTRY_BY_ID = new Map(library.map((e) => [e.id, e] as const));

assert.ok(FESTIVE_REMINDERS.length > 0, 'the catalog must not be empty');

// ---------------------------------------------------------------------------
// Every ruleId is a real, default-visible observance
// ---------------------------------------------------------------------------
for (const entry of FESTIVE_REMINDERS) {
  const rule = RULE_BY_ID.get(entry.ruleId);
  assert.ok(rule, `festive reminder "${entry.ruleId}" is not an observance rule id`);
  // `advanced`/`regional` rules are opt-in surfaces inside the Panchang tab.
  // Promoting one onto every user's lock screen by default misrepresents the day
  // — the same rule `pickTitleObservance` enforces for notification titles.
  assert.equal(
    rule.visibility,
    'default',
    `festive reminder "${entry.ruleId}" must be a default-visibility observance`
  );
  assert.ok(rule.nameHi.length > 0 && rule.nameEn.length > 0);
}

// ---------------------------------------------------------------------------
// Every sourceId is a real library entry that actually opens
// ---------------------------------------------------------------------------
for (const entry of FESTIVE_REMINDERS) {
  const libraryEntry = ENTRY_BY_ID.get(entry.sourceId);
  assert.ok(
    libraryEntry,
    `festive reminder "${entry.ruleId}" points at unknown content "${entry.sourceId}"`
  );
  // The whole promise of the message is that the reading it names is one tap
  // away, so an unroutable target is a broken notification, not a cosmetic bug.
  const target = buildEntryStartTarget(libraryEntry);
  assert.ok(
    target,
    `content "${entry.sourceId}" (festive reminder "${entry.ruleId}") has no start route`
  );
}

// ---------------------------------------------------------------------------
// Copy is present in both authored languages, and mentions the reading
// ---------------------------------------------------------------------------
const DEVANAGARI = /[ऀ-ॿ]/;
for (const entry of FESTIVE_REMINDERS) {
  for (const field of ['greetingHi', 'inviteHi'] as const) {
    assert.ok(entry[field].trim().length > 0, `${entry.ruleId}.${field} must not be empty`);
    assert.ok(
      DEVANAGARI.test(entry[field]),
      `${entry.ruleId}.${field} must be Devanagari — gu/kn are transliterated from it`
    );
  }
  for (const field of ['greetingEn', 'inviteEn'] as const) {
    assert.ok(entry[field].trim().length > 0, `${entry.ruleId}.${field} must not be empty`);
    assert.ok(
      !DEVANAGARI.test(entry[field]),
      `${entry.ruleId}.${field} must be the English rendering`
    );
  }
  // The Hindi invitation ends as a sentence; the body reads "<greeting> · <invite>".
  assert.ok(
    entry.inviteHi.endsWith('।'),
    `${entry.ruleId}.inviteHi should end with a danda`
  );
}

// ---------------------------------------------------------------------------
// Uniqueness + lookup
// ---------------------------------------------------------------------------
{
  const ids = FESTIVE_REMINDERS.map((e) => e.ruleId);
  assert.equal(new Set(ids).size, ids.length, 'one entry per festival');

  for (let i = 0; i < FESTIVE_REMINDERS.length; i += 1) {
    const e = FESTIVE_REMINDERS[i];
    assert.equal(getFestiveReminderEntry(e.ruleId), e);
    assert.equal(festiveReminderOrder(e.ruleId), i, 'order is catalog (fame) position');
  }
  assert.equal(getFestiveReminderEntry('not-a-festival'), null);
  assert.equal(festiveReminderOrder('not-a-festival'), Number.MAX_SAFE_INTEGER);
}

// ---------------------------------------------------------------------------
// Every festival actually resolves to a date
// ---------------------------------------------------------------------------
{
  // A catalog id that resolves to no upcoming occurrence would silently never
  // notify. Anchored to a fixed date so the assertion is deterministic, and
  // inside the precomputed 2024–2031 range.
  const from = new Date(2026, 0, 1);
  for (const entry of FESTIVE_REMINDERS) {
    const next = getNextOccurrence(entry.ruleId, from, 'purnimant');
    assert.ok(
      next,
      `festive reminder "${entry.ruleId}" resolves to no occurrence on/after 2026-01-01`
    );
    assert.ok(
      next.date.getTime() >= from.getTime(),
      `"${entry.ruleId}" resolved to a past date`
    );
  }
}
