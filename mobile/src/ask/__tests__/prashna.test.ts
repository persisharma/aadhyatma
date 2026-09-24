/**
 * prashna.purpose — the one intent that may answer a question the stance
 * guard would otherwise decline, and ONLY with a saved chart (PRD-43;
 * RULEBOOK §25.7). Pins: no chart → declined exactly as before; chart + purpose
 * → dated windows, never a date of an event; a minor's chart → the gate reason,
 * no reading; the answer's working IS its आधार chain.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { KundaliInput } from '@/panchang/kundali';
import { askQuestion, warmAsk } from '../engine';
import { testContext } from './_ctx';

warmAsk();
// Birth INPUTS, not charts: the intent computes the chart itself so `useAsk`
// never drags astronomy onto the launch path (launchGraph budget).
const adult: KundaliInput = { date: new Date('1995-03-15T04:30:00Z'), latitude: 23.1793, longitude: 75.7849, timezone: 'Asia/Kolkata' };
const child: KundaliInput = { date: new Date('2013-08-10T05:00:00Z'), latitude: 26.9124, longitude: 75.7873, timezone: 'Asia/Kolkata' };

test('without a saved chart the stance guard declines exactly as before', () => {
  const r = askQuestion('kya mujhe naukri milegi', testContext());
  assert.equal(r.kind, 'declined');
  assert.equal(askQuestion('padhai kaisi rahegi', testContext()).kind, 'none', 'non-predictive phrasing abstains, does not decline');
});

test('with a saved adult chart a purpose-shaped predictive question becomes a dated-window answer', () => {
  const r = askQuestion('kya mujhe naukri milegi', testContext({ kundali: { input: adult, name: 'Aarav' } }));
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  assert.equal(r.answer.intentId, 'prashna.purpose');
  assert.equal(r.answer.family, 'jyotish');
  assert.ok(r.answer.lines.some(line => line.label.en === 'Direction now'));
  assert.ok(!r.answer.lines.some(line => line.label.en === 'Supports'));
  assert.doesNotMatch(r.answer.headline.en, /will (get|become)/i);
  const window = r.answer.lines.find((line) => line.label.en === 'Running period');
  assert.ok(window, 'a dated window line is present');
  assert.match(window!.value.en, /Mahadasha.*Antardasha.*until \d{1,2} [A-Z][a-z]{2} \d{4}/);
  assert.ok(r.answer.working.length >= 2 && r.answer.working[1].includes('→'), 'working carries the basis chain');
  assert.deepEqual(r.answer.actions[0].target, { tab: 'panchang', screen: 'Prashna', params: { purposeId: 'naukri' } });
});

test('Ask sends an explicit job-change question to the same decision and selected screen question', () => {
  const ctx = testContext({ kundali: { input: adult, name: 'Aarav' } });
  for (const q of ['naukri badalni chahiye kya', 'नौकरी बदलनी चाहिए क्या', 'should I change my job?']) {
    const r = askQuestion(q, ctx);
    assert.equal(r.kind, 'answer', q);
    if (r.kind !== 'answer') continue;
    assert.ok(r.answer.lines.some(line => line.label.en === 'In favour'));
    assert.ok(r.answer.lines.some(line => line.label.en === 'Reasons to pause'));
    assert.ok(r.answer.lines.some(line => line.label.en === 'What to do now'));
    assert.deepEqual(r.answer.actions[0].target, { tab: 'panchang', screen: 'Prashna', params: { purposeId: 'naukri', questionId: 'job-switch' } });
  }
});

test('predictive framing with no readable purpose stays declined even with a chart', () => {
  const ctx = testContext({ kundali: { input: adult, name: null } });
  for (const q of ['mera bhavishya kya hai', 'meri kismat kaisi hai', 'kal lottery lagegi kya', 'kya mere kundali me dosh hai kya']) {
    assert.equal(askQuestion(q, ctx).kind, 'declined', q);
  }
});

test("a minor's chart returns the gate reason and no reading for a closed purpose", () => {
  const r = askQuestion('meri shadi kab hogi', testContext({ kundali: { input: child, name: 'Aaradhya' } }));
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  assert.ok(r.answer.headline.en.includes('read only from age 21'));
  assert.equal(r.answer.lines.length, 0);
  assert.deepEqual(r.answer.working, [], 'the age explanation needs no internal gate trace');
  // An open purpose answers normally for the same chart.
  const study = askQuestion('padhai kaisi rahegi', testContext({ kundali: { input: child, name: 'Aaradhya' } }));
  assert.equal(study.kind, 'answer');
});

test('the muhurat hand-off rides business, travel and marriage answers only', () => {
  const ctx = testContext({ kundali: { input: adult, name: null } });
  const biz = askQuestion('should i start a business', ctx);
  const study = askQuestion('padhai kaisi rahegi', ctx);
  assert.equal(biz.kind, 'answer');
  assert.equal(study.kind, 'answer');
  if (biz.kind !== 'answer' || study.kind !== 'answer') return;
  assert.ok(biz.answer.actions.some((a) => a.target.screen === 'MuhuratFinder'));
  assert.ok(!study.answer.actions.some((a) => a.target.screen === 'MuhuratFinder'));
});
