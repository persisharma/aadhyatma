import { test } from 'node:test';
import assert from 'node:assert/strict';

// flow.mjs reads REEL_APP_ID at import time; set it before importing so IS_NATIVE is true. (node
// --test runs each file in its own process, so this doesn't leak into the other test files.)
process.env.REEL_APP_ID = 'com.test.vedansh';
const { generateBeatFlow, writeFlows } = await import('../flow.mjs');
const { computeTimeline } = await import('../timeline.mjs');

const reel = {
  slug: 'x',
  readingLang: 'hi',
  hook: { hi: 'H', en: 'H' },
  beats: [
    { action: [{ tapId: 'tab-panchang' }, { tapPoint: '50%,33%' }], narration: { hi: 'n0', en: 'n0' } },
    {
      action: [{ tap: 'Reminders for.*' }],
      holdSwipe: { start: '50%, 56%', end: '50%, 55%' },
      narration: { hi: 'n1', en: 'n1' },
    },
  ],
  cta: { hi: 'C', en: 'C' },
};
const tl = computeTimeline(reel, { hook: 1000, cta: 1000, beats: [1500, 1500] });

test('generateBeatFlow: beat 0 resumes + asserts Home; later beats resume WITHOUT re-asserting Home', () => {
  const b0 = generateBeatFlow(reel, 'hi', tl, 0);
  const b1 = generateBeatFlow(reel, 'hi', tl, 1);
  // both foreground without a cold restart (preserve navigation state across the separate records)
  assert.match(b0, /launchApp:\n    stopApp: false/);
  assert.match(b1, /launchApp:\n    stopApp: false/);
  // only beat 0 (which prep leaves on Home) asserts the Home-ready anchor
  assert.match(b0, /visible: "\(\?i\)categories"/);
  assert.doesNotMatch(b1, /categories/);
});

test('generateBeatFlow: renders each action kind, incl. coordinate taps', () => {
  const b0 = generateBeatFlow(reel, 'hi', tl, 0);
  assert.match(b0, /id: "tab-panchang"/);
  assert.match(b0, /point: "50%,33%"/); // tapPoint → coordinate tap
});

test('generateBeatFlow: holdSwipe overrides the default dwell-hold location', () => {
  const b0 = generateBeatFlow(reel, 'hi', tl, 0);
  const b1 = generateBeatFlow(reel, 'hi', tl, 1);
  assert.match(b0, /start: 50%, 8%/); // default top-band hold
  assert.match(b1, /start: 50%, 56%\n    end: 50%, 55%/); // sheet override, dragging up
});

test('writeFlows: prep + one recorded flow per beat', () => {
  const dir = `${process.env.TMPDIR || '/tmp'}/reel-flow-test-${reel.slug}`;
  const { prep, beats } = writeFlows(reel, 'hi', tl, dir);
  assert.ok(prep.endsWith('x.hi.prep.yaml'));
  assert.equal(beats.length, reel.beats.length);
  assert.ok(beats[0].endsWith('x.hi.beat0.yaml'));
  assert.ok(beats[1].endsWith('x.hi.beat1.yaml'));
});
