/**
 * The Phase-1 ship gate (PRD-25 §6): ≥ 85% top-1 on the golden corpus, and ZERO
 * wrong answers. Prints the misses so the next release knows which phrasings
 * to add — the offline analogue of the on-device unanswered log (§7.2).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { askQuestion, warmAsk } from '../engine';
import { testContext } from './_ctx';
import { CORPUS } from './corpus';

warmAsk();
const ctx = testContext({
  sadhana: [{ programId: 'hanuman-41', titleHi: 'हनुमान चालीसा', titleEn: 'Hanuman Chalisa', dayIndex: 7, total: 41, doneToday: false }],
});

const positives = CORPUS.filter((c): c is Extract<typeof c, { intent: string }> => 'intent' in c);
const negatives = CORPUS.filter((c): c is Extract<typeof c, { expect: string }> => 'expect' in c);

test('golden corpus: ≥ 85% top-1 and zero wrong answers', () => {
  let hit = 0;
  const misses: string[] = [];
  const wrong: string[] = [];
  for (const c of positives) {
    const r = askQuestion(c.q, ctx);
    if (r.kind !== 'answer') {
      misses.push(`  ✗ ${c.q}  → ${r.kind} (wanted ${c.intent}) key="${r.trace.key}" ents=${JSON.stringify(Object.fromEntries(Object.entries(r.trace.entities).map(([k, v]) => [k, typeof v === 'object' ? v.id : v])))}`);
      continue;
    }
    if (r.answer.intentId !== c.intent) {
      wrong.push(`  ‼ ${c.q}  → ${r.answer.intentId} (wanted ${c.intent})`);
      continue;
    }
    if (c.slot) {
      const got = r.trace.entities[c.slot[0] as keyof typeof r.trace.entities];
      const gotId = got && typeof got === 'object' ? got.id : String(got);
      if (gotId !== c.slot[1]) {
        wrong.push(`  ‼ ${c.q}  → ${c.slot[0]}=${gotId} (wanted ${c.slot[1]})`);
        continue;
      }
    }
    hit++;
  }
  const rate = hit / positives.length;
  const report = `\n${positives.length} positives · ${hit} hit · ${misses.length} miss · ${wrong.length} wrong · top-1 ${(rate * 100).toFixed(1)}%\n${wrong.join('\n')}\n${misses.join('\n')}`;
  console.log(report);
  assert.equal(wrong.length, 0, `wrong answers:\n${wrong.join('\n')}`);
  assert.ok(rate >= 0.85, `top-1 ${(rate * 100).toFixed(1)}% < 85%${report}`);
});

test('negatives never answer', () => {
  const bad: string[] = [];
  for (const c of negatives) {
    const r = askQuestion(c.q, ctx);
    if (r.kind === 'answer') bad.push(`  ‼ ${c.q} answered with ${r.answer.intentId}`);
    else if (c.expect === 'declined' && r.kind !== 'declined') bad.push(`  ✗ ${c.q} was ${r.kind}, wanted declined`);
  }
  assert.deepEqual(bad, []);
});
