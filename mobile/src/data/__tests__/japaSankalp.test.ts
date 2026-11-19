/**
 * Japa sankalp model (design.md §35.2). Runs under `tsx --test` via `npm run test:data`.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  addSankalpJapa,
  formatIndianNumber,
  malaBreakdown,
  normalizeSankalpAmount,
  parseJapaSankalps,
  parseSankalpInput,
  sankalpProgress,
  sankalpTarget,
  SANKALP_MALA_BEADS,
  SANKALP_MAX,
  SANKALP_PRESETS,
  takeJapaSankalp,
  type JapaSankalp,
} from '../japam/sankalp';
import { JAPAM_BEADS_PER_ROUND } from '../japam';

test('a mala is the counter’s 108 beads', () => {
  assert.equal(SANKALP_MALA_BEADS, JAPAM_BEADS_PER_ROUND);
});

test('targets are counted in japa whatever the unit', () => {
  assert.equal(sankalpTarget({ unit: 'mala', amount: 11 }), 1188);
  assert.equal(sankalpTarget({ unit: 'japa', amount: 1_25_000 }), 125000);
});

test('amounts must be whole numbers within the unit range', () => {
  assert.equal(normalizeSankalpAmount('mala', 0), null);
  assert.equal(normalizeSankalpAmount('mala', 21.9), 21);
  assert.equal(normalizeSankalpAmount('mala', SANKALP_MAX.mala + 1), null);
  assert.equal(normalizeSankalpAmount('japa', SANKALP_MAX.japa), SANKALP_MAX.japa);
  assert.equal(normalizeSankalpAmount('japa', Number.NaN), null);
  for (const unit of ['mala', 'japa'] as const) {
    for (const n of SANKALP_PRESETS[unit]) assert.equal(normalizeSankalpAmount(unit, n), n, `${unit} preset ${n}`);
  }
});

test('typed input accepts grouping and Indic digits, rejects anything else', () => {
  assert.equal(parseSankalpInput('1,25,000'), 125000);
  assert.equal(parseSankalpInput(' 108 '), 108);
  assert.equal(parseSankalpInput('१०८'), 108);
  assert.equal(parseSankalpInput('૧૧'), 11);
  assert.equal(parseSankalpInput('೨೧'), 21);
  assert.equal(parseSankalpInput(''), null);
  assert.equal(parseSankalpInput('12a'), null);
  assert.equal(parseSankalpInput('-5'), null);
  assert.equal(parseSankalpInput('1.5'), null);
});

test('taking a sankalp starts from zero; retargeting keeps progress and start', () => {
  const s = takeJapaSankalp(null, 'mala', 11, 1000)!;
  assert.deepEqual(s, { unit: 'mala', amount: 11, done: 0, startedAt: 1000, updatedAt: 1000 });
  const progressed = addSankalpJapa(s, 300, 2000);
  const raised = takeJapaSankalp(progressed, 'mala', 21, 3000)!;
  assert.equal(raised.done, 300);
  assert.equal(raised.startedAt, 1000);
  assert.equal(raised.completedAt, undefined);
  const asJapa = takeJapaSankalp(raised, 'japa', 5000, 4000)!;
  assert.equal(asJapa.done, 300);
  assert.equal(asJapa.unit, 'japa');
  assert.equal(takeJapaSankalp(raised, 'mala', 0, 5000), null);
});

test('a target lowered to the japa already offered completes the vow', () => {
  const s = addSankalpJapa(takeJapaSankalp(null, 'japa', 1000, 1)!, 400, 2);
  const lowered = takeJapaSankalp(s, 'japa', 300, 3)!;
  assert.equal(lowered.done, 300);
  assert.equal(lowered.completedAt, 3);
});

test('a completed vow is replaced by a fresh one, not extended', () => {
  const done = addSankalpJapa(takeJapaSankalp(null, 'mala', 1, 1)!, 108, 2);
  assert.equal(done.completedAt, 2);
  const fresh = takeJapaSankalp(done, 'mala', 11, 3)!;
  assert.equal(fresh.done, 0);
  assert.equal(fresh.startedAt, 3);
  assert.equal(fresh.completedAt, undefined);
});

test('counted japa accrues, caps at the target and stops after completion', () => {
  let s: JapaSankalp = takeJapaSankalp(null, 'mala', 1, 0)!;
  s = addSankalpJapa(s, 107, 1);
  assert.equal(s.done, 107);
  assert.equal(s.completedAt, undefined);
  s = addSankalpJapa(s, 5, 2);
  assert.equal(s.done, 108);
  assert.equal(s.completedAt, 2);
  assert.equal(addSankalpJapa(s, 10, 3), s);
  assert.equal(addSankalpJapa(takeJapaSankalp(null, 'japa', 10, 0)!, 0, 1).done, 0);
});

test('progress reports whole malas and the fraction of the target', () => {
  const s = addSankalpJapa(takeJapaSankalp(null, 'mala', 21, 0)!, 12 * 108 + 40, 1);
  const p = sankalpProgress(s);
  assert.equal(p.malasDone, 12);
  assert.equal(p.target, 21 * 108);
  assert.equal(p.done, 12 * 108 + 40);
  assert.ok(Math.abs(p.fraction - (12 * 108 + 40) / (21 * 108)) < 1e-9);
  assert.equal(p.complete, false);
});

test('Indian digit grouping and mala breakdown', () => {
  assert.equal(formatIndianNumber(0), '0');
  assert.equal(formatIndianNumber(108), '108');
  assert.equal(formatIndianNumber(1008), '1,008');
  assert.equal(formatIndianNumber(125000), '1,25,000');
  assert.equal(formatIndianNumber(1080000), '10,80,000');
  assert.deepEqual(malaBreakdown(11000), { malas: 101, rest: 92 });
  assert.deepEqual(malaBreakdown(1188), { malas: 11, rest: 0 });
});

test('stored vows are validated record by record', () => {
  const good = { unit: 'mala', amount: 11, done: 50, startedAt: 1, updatedAt: 2 };
  const parsed = parseJapaSankalps({
    'om-namah-shivaya': good,
    'bad-unit': { ...good, unit: 'days' },
    'bad-amount': { ...good, amount: 0 },
    'fraction-amount': { ...good, amount: 1.5 },
    'bad-done': { ...good, done: -1 },
    'bad-complete': { ...good, completedAt: 'yes' },
    'over-target': { unit: 'japa', amount: 100, done: 250, startedAt: 1, updatedAt: 9 },
    'not-object': 7,
  });
  assert.deepEqual(Object.keys(parsed).sort(), ['om-namah-shivaya', 'over-target']);
  assert.deepEqual(parsed['om-namah-shivaya'], good);
  assert.equal(parsed['over-target'].done, 100);
  assert.equal(parsed['over-target'].completedAt, 9);
  assert.deepEqual(parseJapaSankalps(null), {});
  assert.deepEqual(parseJapaSankalps([good]), {});
});
