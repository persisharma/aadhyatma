import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { GRAHA_REFERENCE } from '../grahaReference';
import { GRAHA_ORDER } from '../kundali';

test('every graha has a complete, bilingual reference entry', () => {
  for (const graha of GRAHA_ORDER) {
    const entry = GRAHA_REFERENCE[graha];
    assert.ok(entry, `${graha} has a reference entry`);
    for (const [key, value] of Object.entries(entry)) {
      assert.ok(value.trim().length > 0, `${graha}.${key} is empty`);
      assert.doesNotMatch(value, /TODO|TBD|placeholder/i, `${graha}.${key} has a placeholder`);
    }
  }
  assert.equal(Object.keys(GRAHA_REFERENCE).length, GRAHA_ORDER.length, 'no extra or missing grahas');
});

test('authored reference copy obeys the §14.3.5 bans', () => {
  const banned = [
    /will happen/i, /guaranteed/i, /certainly/i, /अवश्य होगा/, /निश्चित रूप से/,
    /दुर्भाग्य/, /संकट/, /खतरा/, /\bdoom\b/i, /misfortune/i, /\bcurse\b/i, /\bdanger\b/i, /दोष/,
    /मृत्यु/, /\bdeath\b/i, /lifespan/i, /longevity/i, /आयु/, /divorce/i, /तलाक/, /widow/i,
    /\bdisease\b/i, /\bcure\b/i, /रोग/, /बीमारी/, /\bmedicine\b/i, /illness/i,
    /gemstone/i, /रत्न/, /yantra/i, /यंत्र(?!ण)/, /\bbuy\b/i, /खरीदें/,
    /\bluck\b/i, /\bscore\b/i, /किस्मत/,
  ];
  const source = readFileSync('src/panchang/grahaReference.ts', 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  for (const pattern of banned) assert.doesNotMatch(source, pattern, `banned vocabulary ${pattern}`);
});
