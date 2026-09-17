/**
 * vastu.myhome (PRD-24 Phase 2 §C5/US-15): answers are RECALL of the user's
 * own living-home record read with the verified convention — परंपरा line,
 * आपके घर में line(s), the finding class (tone avoid only for forbidden) — and
 * the abstain shape without a saved home is `none` with the generic
 * vastu.direction example as the did-you-mean chip. The declined register is
 * untouched: dosh/phal framings never reach the intent.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { askQuestion, warmAsk } from '../engine';
import { testContext } from './_ctx';
import type { VastuHomeSummary } from '../types';

warmAsk();

const vastuHome: VastuHomeSummary = {
  homeId: 'home-test',
  label: 'हमारा घर',
  facing: 'east',
  rooms: [
    { roomId: 'main-door', ordinal: 1, zone: 'east' },
    { roomId: 'kitchen', ordinal: 1, zone: 'southeast' },
    { roomId: 'toilet', ordinal: 1, zone: 'northeast' },
    { roomId: 'toilet', ordinal: 2, zone: 'northwest' },
    { roomId: 'puja-room', ordinal: 1, zone: null },
  ],
};

const ctx = testContext({ vastuHome });

test('an in-keeping room answers with परंपरा + आपके घर में + the class', () => {
  const r = askQuestion('मेरी रसोई किस दिशा में है', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  assert.equal(r.answer.intentId, 'vastu.myhome');
  assert.equal(r.answer.sub?.hi, 'हमारा घर');
  const labels = r.answer.lines.map((line) => line.label.hi);
  assert.ok(labels.includes('परंपरा'));
  assert.ok(labels.some((label) => label.startsWith('आपके घर में')));
  const inHome = r.answer.lines.find((line) => line.label.hi.startsWith('आपके घर में'))!;
  assert.match(inHome.value.hi, /आग्नेय/);
  assert.notEqual(inHome.tone, 'avoid');
  // The weight word travels with the convention line.
  const convention = r.answer.lines.find((line) => line.label.hi === 'परंपरा')!;
  assert.match(convention.value.hi, /विधान|श्रेयस्/);
});

test('a forbidden placement carries tone avoid; multiple ordinals each get a line', () => {
  const r = askQuestion('hamare ghar me toilet kis disha me hai', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  const inHome = r.answer.lines.filter((line) => line.label.hi.startsWith('आपके घर में'));
  assert.equal(inHome.length, 2); // toilet 1 (ईशान) and toilet 2 (वायव्य)
  assert.equal(inHome[0]!.tone, 'avoid'); // ईशान toilet is निषिद्ध
  assert.notEqual(inHome[1]!.tone, 'avoid'); // वायव्य is the stated direction
});

test('an unmeasured room answers honestly, never inventing a zone', () => {
  const r = askQuestion('mera mandir kis disha me hai', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  const inHome = r.answer.lines.find((line) => line.label.hi.startsWith('आपके घर में'))!;
  assert.match(inHome.value.hi, /अभी मापा नहीं/);
});

test('the action opens the saved home', () => {
  const r = askQuestion('मेरी रसोई किस दिशा में है', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  assert.deepEqual(r.answer.actions[0]!.target, {
    tab: 'more',
    screen: 'GharVastu',
    params: { homeId: 'home-test' },
  });
});

test('no saved living home → none, with the generic vastu example as did-you-mean', () => {
  const r = askQuestion('मेरी रसोई किस दिशा में है', testContext());
  assert.equal(r.kind, 'none');
  if (r.kind !== 'none') return;
  assert.ok(
    r.suggestions.some((s) => s.question.hi.includes('दिशा')),
    'expected a vastu direction did-you-mean chip'
  );
});

test('a room this home never listed abstains rather than answering from nothing', () => {
  const home: VastuHomeSummary = { ...vastuHome, rooms: vastuHome.rooms.filter((room) => room.roomId !== 'kitchen') };
  const r = askQuestion('मेरी रसोई किस दिशा में है', testContext({ vastuHome: home }));
  assert.equal(r.kind, 'none');
});

test('the non-possessive question still gets the generic convention answer', () => {
  const r = askQuestion('रसोई किस दिशा में', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  assert.equal(r.answer.intentId, 'vastu.direction');
});

test('the declined register is untouched — a dosh framing never reaches the record', () => {
  const r = askQuestion('mere ghar me dosh hai kya', ctx);
  assert.equal(r.kind, 'declined');
});

test('no score, percent or remedy in any line of a myhome answer', () => {
  const r = askQuestion('hamare ghar me toilet kis disha me hai', ctx);
  assert.equal(r.kind, 'answer');
  if (r.kind !== 'answer') return;
  const text = JSON.stringify(r.answer);
  assert.doesNotMatch(text, /\d+\s?%/);
  assert.doesNotMatch(text, /score|rating/i);
  assert.doesNotMatch(text, /उपाय|यंत्र/);
});
