import assert from 'node:assert/strict';
import { test } from 'node:test';

import { OBSERVANCE_RULES } from '../festivals';
import { getKathaContent } from '../kathaContent';

// Regression guard for the "in-story narrative, not commentary" requirement.
// Every un-hidden (default-visible) katha must TELL its story, never describe it
// with meta-framing like "The second chapter tells of…" / "इस अध्याय में वर्णन आता है".
const EN_MARKERS: RegExp[] = [
  /\bthe (first|second|third|fourth|fifth|sixth|seventh|eighth|next|final|last) (chapter|adhyay|section)\b/i,
  /\bchapter \d+\b/i,
  /\bthis (chapter|section|story|katha) (tells|introduces|describes|narrates|recounts|explains)\b/i,
  /\bthe (chapter|story|katha|legend) (tells|introduces|describes|narrates|recounts|explains)\b/i,
  /\btells of\b/i,
  /\bthe story (does not|teaches|shows|reminds|reduces)\b/i,
  /\bin this (chapter|section|episode)\b/i,
];
const HI_MARKERS: RegExp[] = [
  /अध्याय में/,
  /वर्णन आता है/,
  /प्रसंग आता है/,
  /कथा यह (नहीं )?कहती/,
  /इस (अध्याय|कथा|प्रसंग) में/,
  /का वर्णन है/,
  /यह कथा (बताती|सिखाती|कहती) है/,
];

test('default-visible kathas read as in-story narrative, not commentary', () => {
  const visibleKathaIds = new Set(
    OBSERVANCE_RULES
      .filter((rule) => rule.visibility === 'default' && rule.kathaId)
      .map((rule) => rule.kathaId as string)
  );
  assert.ok(visibleKathaIds.size > 0, 'expected default-visible kathas');

  for (const id of visibleKathaIds) {
    const item = getKathaContent(id);
    assert.ok(item, `${id} missing katha content`);
    for (const section of item.sections) {
      for (const paragraph of section.bodyEn) {
        for (const marker of EN_MARKERS) {
          assert.equal(marker.test(paragraph), false, `${id}/${section.id} uses commentary phrasing: ${marker} -> "${paragraph.slice(0, 80)}"`);
        }
      }
      for (const paragraph of section.bodyHi) {
        for (const marker of HI_MARKERS) {
          assert.equal(marker.test(paragraph), false, `${id}/${section.id} uses commentary phrasing (Hi): ${marker} -> "${paragraph.slice(0, 80)}"`);
        }
      }
    }
  }
});
