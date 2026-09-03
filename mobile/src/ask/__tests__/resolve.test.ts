/**
 * Resolver behaviour, one test per rule the PRD pins (§3.2, §3.4, §13.3).
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { askQuestion, looksLikeQuestion, warmAsk } from '../engine';
import { getAskLexicon } from '../lexicon';
import { tagEntities } from '../resolve';
import { testContext } from './_ctx';
import { fold } from '../fold';

warmAsk();
const ctx = testContext();
const tag = (q: string) => tagEntities(fold(q), getAskLexicon());

test('§13.3 class vs instance: bare "ekadashi" is the class, a qualifier picks the instance', () => {
  assert.equal(tag('ekadashi kab hai').observance?.id, 'class:ekadashi');
  assert.equal(tag('एकादशी कब है').observance?.id, 'class:ekadashi');
  assert.equal(tag('nirjala ekadashi kab hai').observance?.id, 'nirjala-ekadashi');
  assert.equal(tag('निर्जला एकादशी कब है').observance?.id, 'nirjala-ekadashi');
});

test('§13.3 specificity floor: generic tokens never establish an entity', () => {
  assert.equal(tag('राहु काल कब है').deity, undefined); // काल must not become kali
  assert.equal(tag('rahu kaal').deity, undefined);
  assert.equal(tag('vrat me kya khaye').observance, undefined); // bare "vrat" picks no vrat
  assert.equal(tag('aaj puja kaise kare').vidhi, undefined);
});

test('deity stem matching: श्री गणेश ≡ ganesha ≡ ganesh ≡ ganeshji ≡ ganpati', () => {
  for (const q of ['गणेश जी को क्या चढ़ाएँ', 'ganesha ko kya chadhaye', 'ganesh ji ko kya chadhaye', 'ganeshji ko kya chadhana', 'ganpati ko bhog']) {
    assert.equal(tag(q).deity?.id, 'ganesha', q);
  }
  assert.equal(tag('hanumanji ka bhog').deity?.id, 'hanuman');
  assert.equal(tag('bajrangbali ko kya chadhaye').deity?.id, 'hanuman');
});

test('relative day: कल is tomorrow, but "rahu kal" is a Kaal', () => {
  assert.equal(tag('कल एकादशी है क्या').dayOffset, 1);
  assert.equal(tag('kal kya tithi hai').dayOffset, 1);
  assert.equal(tag('parso kya hai').dayOffset, 2);
  assert.equal(tag('rahu kal kab hai').dayOffset, undefined);
});

test('§3.2 answer-or-abstain: an intent with a missing required slot is ineligible, not low-confidence', () => {
  const r = askQuestion('muhurat kab hai', ctx); // occasion required, none given
  assert.notEqual(r.kind, 'answer');
  assert.ok(!r.trace.scored.some((s) => s.intentId === 'muhurat.event'));
});

test('§3.4 stance guard: predictive and personal framing is declined, not answered', () => {
  for (const q of ['kya mujhe naukri milegi', 'meri shadi kab hogi', 'mera bhavishya kya hai', 'will i get the job', 'kya mere kundali me dosh hai kya']) {
    assert.equal(askQuestion(q, ctx).kind, 'declined', q);
  }
});

test('philosophy is a content search, not an answer', () => {
  const r = askQuestion('what is karma', ctx);
  assert.equal(r.kind, 'none');
  assert.equal(askQuestion('karma kya hai', ctx).kind, 'none');
});

test('answers carry working, actions and the verified-only provenance where content-backed', () => {
  const r = askQuestion('गणेश जी को क्या चढ़ाएँ', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  assert.equal(r.answer.intentId, 'bhog.offer');
  assert.ok(r.answer.working.length > 0);
  assert.ok(r.answer.actions.length > 0);
  assert.ok(r.answer.provenance);
  assert.ok(r.answer.lines.some((l) => l.tone === 'avoid'), 'the निषेध half is present');
});

test('bhog.avoid beats bhog.offer on "kya nahi chadhaye"', () => {
  const r = askQuestion('ganesh ji ko kya nahi chadhana chahiye', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind === 'answer') assert.equal(r.answer.intentId, 'bhog.avoid');
});

test('the class resolves to the NEXT occurrence, and "kal X hai kya" answers yes/no about that day', () => {
  const next = askQuestion('ekadashi kab hai', ctx);
  assert.equal(next.kind, 'answer');
  if (next.kind === 'answer') {
    assert.equal(next.answer.intentId, 'observance.next');
    assert.ok(next.answer.working.some((w) => w.startsWith('class class:ekadashi')));
  }
  const yn = askQuestion('कल एकादशी है क्या', ctx);
  assert.equal(yn.kind, 'answer');
  if (yn.kind === 'answer') assert.match(yn.answer.headline.hi, /^(हाँ|नहीं)/);
});

test('did-you-mean suggestions follow the entities that WERE found', () => {
  const r = askQuestion('ganesh ji ke bare me kuch', ctx); // deity found, no trigger
  assert.equal(r.kind, 'none');
  if (r.kind === 'none') assert.ok(r.suggestions.length > 0);
});

test('looksLikeQuestion keeps plain library queries out of the abstain state (§3.6)', () => {
  assert.equal(looksLikeQuestion('hanuman chalisa'), false);
  assert.equal(looksLikeQuestion('कर्मण्येवाधिकारस्ते'), false);
  assert.equal(looksLikeQuestion('ekadashi kab hai'), true);
  assert.equal(looksLikeQuestion('mandir kis disha me'), true);
  assert.equal(looksLikeQuestion('shiv chalisa?'), true);
});

test('determinism: the same question resolves identically twice', () => {
  const a = JSON.stringify(askQuestion('राहु काल कब है', ctx));
  const b = JSON.stringify(askQuestion('राहु काल कब है', ctx));
  assert.equal(a, b);
});

test('ask-from-context seed fills a missing slot', () => {
  const r = askQuestion('iska bhog kya hai', testContext({ seed: { type: 'deity', id: 'shiva' } }));
  assert.equal(r.kind, 'answer');
  if (r.kind === 'answer') assert.equal(r.answer.intentId, 'bhog.offer');
});
