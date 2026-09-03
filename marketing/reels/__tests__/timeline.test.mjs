import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeTimeline, beatCaptureDwell, TIMING } from '../timeline.mjs';

const reel = {
  slug: 't',
  hook: { en: 'hook', hi: 'हुक' },
  beats: [
    { action: [{ tap: 'X' }], narration: { en: 'a', hi: 'अ' } },
    { action: [], narration: { en: 'b', hi: 'ब' } },
    { action: [{ swipe: 'LEFT' }], narration: { en: 'c', hi: 'स' } },
  ],
};

test('beatCaptureDwell: floor vs vo+gap', () => {
  assert.equal(beatCaptureDwell(500), TIMING.MIN_CAPTURE_DWELL_MS); // 500+gap < floor
  assert.equal(beatCaptureDwell(5000), 5000 + TIMING.GAP_MS);
});

test('cold-open: no intro card, hook at 0, continuous beats', () => {
  const durations = { hook: 2000, cta: 1800, beats: [1500, 2000, 1200] };
  const tl = computeTimeline(reel, durations);
  const G = TIMING.GAP_MS;

  assert.equal(tl.introDur, 0); // cold open — no intro card
  assert.equal(tl.hook.voStart, 0);
  assert.equal(tl.hook.voDur, 2000);

  // beat 0 starts right after the hook line (+ one gap)
  assert.equal(tl.beats[0].voStart, 2000 + G);
  // continuous: each line follows the previous by exactly its duration + one gap
  for (let i = 1; i < tl.beats.length; i++) {
    assert.equal(tl.beats[i].voStart, tl.beats[i - 1].voStart + tl.beats[i - 1].voDur + G);
  }
  // captions ride the line exactly
  assert.equal(tl.beats[0].captionStart, tl.beats[0].voStart);
  assert.equal(tl.beats[0].captionEnd, tl.beats[0].voStart + tl.beats[0].voDur);

  // appVideoDur = hook+gap + sum(vo+gap); everything overlays this one region
  const expectApp = 2000 + G + (1500 + G) + (2000 + G) + (1200 + G);
  assert.equal(tl.appVideoDur, expectApp);

  // CTA card floors + sits at the end
  assert.equal(tl.ctaDur, Math.max(TIMING.MIN_CTA_MS, 1800 + TIMING.CTA_LEAD_MS));
  assert.equal(tl.cta.voStart, tl.appVideoDur);
  assert.equal(tl.total, tl.appVideoDur + tl.ctaDur);

  // capture-hold floor is independent of the (short) cut
  assert.equal(tl.beats[2].dwell, TIMING.MIN_CAPTURE_DWELL_MS); // 1200+gap < floor
});

test('computeTimeline: rejects mismatched durations', () => {
  assert.throws(() => computeTimeline(reel, { hook: 1, cta: 1, beats: [1, 2] }), /entries/);
  assert.throws(() => computeTimeline(reel, { hook: 1, cta: 1 }), /beats/);
});
