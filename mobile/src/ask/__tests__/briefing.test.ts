/**
 * आज का विधान is standing questions through the same resolver (PRD-25 Phase 2):
 * the briefing always leads with the day, carries the day's observance (or the
 * next one within the look-ahead), the windows, and the sankalp only when one
 * is running. Every card is a real AskAnswer with its working and actions.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { warmAsk } from '../engine';
import { composeBriefing } from '../briefing';
import { testContext } from './_ctx';

warmAsk();

test('leads with today, then observance or upcoming, then windows', () => {
  const sections = composeBriefing(testContext());
  assert.ok(sections.length >= 3, `only ${sections.length} sections`);
  assert.equal(sections[0].key, 'day');
  assert.equal(sections[0].answer.intentId, 'panchang.day');
  assert.ok(['observance', 'upcoming', 'muhurat'].includes(sections[1].key));
  assert.ok(sections.some((s) => s.key === 'muhurat' && s.answer.intentId === 'muhurat.now'));
  assert.ok(!sections.some((s) => s.key === 'sadhana'), 'no sankalp card without an enrolment');
  for (const s of sections) {
    assert.ok(s.answer.working.length > 0, `${s.key} has no working`);
    assert.ok(s.answer.actions.length > 0, `${s.key} has no action`);
  }
});

test('the sankalp card appears only when an enrolment is active', () => {
  const sections = composeBriefing(
    testContext({ sadhana: [{ programId: 'hanuman-41', titleHi: 'हनुमान चालीसा', titleEn: 'Hanuman Chalisa', dayIndex: 7, total: 41, doneToday: false }] })
  );
  const s = sections.find((x) => x.key === 'sadhana');
  assert.ok(s);
  assert.equal(s!.answer.intentId, 'sadhana.progress');
  assert.match(s!.answer.headline.hi, /दिन 7 \/ 41/);
});

test('is deterministic for a fixed context', () => {
  const a = JSON.stringify(composeBriefing(testContext()));
  const b = JSON.stringify(composeBriefing(testContext()));
  assert.equal(a, b);
});
