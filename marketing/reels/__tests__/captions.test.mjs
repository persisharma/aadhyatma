import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captionCues } from '../captions.mjs';
import { computeTimeline } from '../timeline.mjs';

test('captionCues: one cue per beat, caption > narration fallback, times from timeline', () => {
  const reel = {
    beats: [
      { action: [{ tap: 'X' }], narration: { en: 'NARR1', hi: 'न1' }, caption: { en: 'CAP1', hi: 'क1' } },
      { action: [], narration: { en: 'NARR2', hi: 'न2' } }, // no caption → narration
    ],
  };
  const tl = computeTimeline(reel, { hook: 1000, cta: 1000, beats: [1500, 1500] });

  const en = captionCues(tl, reel, 'en');
  assert.equal(en.length, 2);
  assert.equal(en[0].text, 'CAP1');
  assert.equal(en[1].text, 'NARR2');
  assert.equal(en[0].startMs, tl.beats[0].captionStart);
  assert.equal(en[0].endMs, tl.beats[0].captionEnd);
  assert.ok(en[1].startMs > en[0].startMs);

  const hi = captionCues(tl, reel, 'hi');
  assert.equal(hi[0].text, 'क1');
  assert.equal(hi[1].text, 'न2');
});
