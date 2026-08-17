import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTimeline, beatActionMs, TIMING } from '../timeline.mjs';

const reel = {
  slug: 't',
  beats: [
    { action: [{ tap: 'X' }], narration: { en: 'a', hi: 'अ' }, minHoldMs: 2800 },
    { action: [], narration: { en: 'b', hi: 'ब' }, minHoldMs: 3200 }, // hold beat
    { action: [{ swipe: 'LEFT' }], narration: { en: 'c', hi: 'स' } },
  ],
};

test('beatActionMs: action vs hold', () => {
  assert.equal(beatActionMs(reel.beats[0]), TIMING.EST_ACTION_MS);
  assert.equal(beatActionMs(reel.beats[1]), TIMING.EST_HOLD_MS);
});

test('computeTimeline: floors, monotonic offsets, total is consistent', () => {
  const durations = { hook: 2500, cta: 2000, beats: [1500, 2000, 1200] };
  const tl = computeTimeline(reel, durations);

  // intro floor: hook(2500)+TAIL(700)=3200 > MIN_INTRO(1800)
  assert.equal(tl.introDur, 3200);
  // cta floor: cta(2000)+TAIL(700)=2700 > MIN_CTA(2600)
  assert.equal(tl.ctaDur, 2700);

  // beats start at introDur and are strictly increasing
  assert.equal(tl.beats[0].segStart, tl.introDur);
  for (let i = 1; i < tl.beats.length; i++) {
    assert.ok(tl.beats[i].segStart === tl.beats[i - 1].segEnd, 'segments are contiguous');
    assert.ok(tl.beats[i].voStart > tl.beats[i - 1].voStart, 'VO offsets increase');
  }

  // VO always starts after the action and ends within the beat segment
  for (const b of tl.beats) {
    assert.ok(b.voStart >= b.segStart + b.action);
    assert.ok(b.captionEnd <= b.segEnd + 1);
  }

  // dwell honours the max(minHold, vo+tail) rule
  assert.equal(tl.beats[0].dwell, 2800); // minHold 2800 > 1500+700=2200
  assert.equal(tl.beats[2].dwell, 1200 + TIMING.TAIL_MS); // no minHold → vo+tail

  // total == intro + appVideo + cta, and appVideo == sum of (action+dwell)
  const appSum = tl.beats.reduce((s, b) => s + b.action + b.dwell, 0);
  assert.equal(tl.appVideoDur, appSum);
  assert.equal(tl.total, tl.introDur + tl.appVideoDur + tl.ctaDur);
  assert.equal(tl.cta.start, tl.introDur + tl.appVideoDur);
});

test('computeTimeline: rejects mismatched durations', () => {
  assert.throws(() => computeTimeline(reel, { hook: 1, cta: 1, beats: [1, 2] }), /entries/);
  assert.throws(() => computeTimeline(reel, { hook: 1, cta: 1 }), /beats/);
});

test('computeTimeline: single-beat + zero-duration edge case', () => {
  const one = { beats: [{ action: [], narration: { en: 'x', hi: 'x' } }] };
  const tl = computeTimeline(one, { hook: 0, cta: 0, beats: [0] });
  assert.equal(tl.introDur, TIMING.MIN_INTRO_MS);
  assert.equal(tl.ctaDur, TIMING.MIN_CTA_MS);
  assert.equal(tl.beats[0].dwell, TIMING.TAIL_MS); // 0 vo + tail
  assert.ok(tl.total > 0);
});
