import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captionCues } from '../captions.mjs';
import { computeTimeline } from '../timeline.mjs';

test('captionCues: hook first (over live footage), then beats; caption > narration fallback', () => {
  const reel = {
    hook: { en: 'HOOK', hi: 'हुक' },
    beats: [
      { action: [{ tap: 'X' }], narration: { en: 'NARR1', hi: 'न1' }, caption: { en: 'CAP1', hi: 'क1' } },
      { action: [], narration: { en: 'NARR2', hi: 'न2' } }, // no caption → narration
    ],
  };
  const tl = computeTimeline(reel, { hook: 1000, cta: 1000, beats: [1500, 1500] });

  const en = captionCues(tl, reel, 'en');
  assert.equal(en.length, 3); // hook + 2 beats
  assert.equal(en[0].text, 'HOOK');
  assert.equal(en[0].startMs, 0); // cold open — hook shows from frame 0
  assert.equal(en[0].hook, true);
  assert.equal(en[1].text, 'CAP1'); // caption preferred
  assert.equal(en[2].text, 'NARR2'); // fallback to narration
  assert.ok(en[1].startMs >= en[0].endMs); // ordered

  const hi = captionCues(tl, reel, 'hi');
  assert.equal(hi[0].text, 'हुक');
  assert.equal(hi[1].text, 'क1');
});
