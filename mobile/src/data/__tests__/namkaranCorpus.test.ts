import assert from 'node:assert/strict';
import { statSync } from 'node:fs';
import test from 'node:test';

import shard from '../namkaran/names.01.json';
import { NAMKARAN_CORPUS } from '../namkaran';
import { deities } from '../deities';
import { CHARANA_TABLE } from '../../panchang/namkaranConvention';

test('the development corpus is explicitly blocked from release', () => {
  assert.equal(NAMKARAN_CORPUS.verified, false);
  assert.equal(NAMKARAN_CORPUS.releaseEligible, false);
});

test('development names have unique ids, bilingual meanings, and matching initials', () => {
  const names = shard.names;
  const ids = new Set<string>();
  const deityIds = new Set(deities.map((deity) => deity.id));
  for (const name of names) {
    assert.ok(!ids.has(name.id), `duplicate id ${name.id}`);
    ids.add(name.id);
    assert.ok(name.meaningHi.trim(), `${name.id}: missing Hindi meaning`);
    assert.ok(name.meaningEn.trim(), `${name.id}: missing English meaning`);
    for (const charanaIndex of name.charanas) {
      const syllables = CHARANA_TABLE[charanaIndex].syllables;
      assert.ok(syllables.some((syllable) => name.hi.startsWith(syllable.hi)), `${name.id}: initial does not match charana ${charanaIndex}`);
    }
    if ('deityId' in name && name.deityId) assert.ok(deityIds.has(name.deityId as any), `${name.id}: missing deity ${name.deityId}`);
  }
});

test('Namkaran JSON stays within the 512 KB raw budget', () => {
  const bytes = statSync('src/data/namkaran/names.01.json').size;
  assert.ok(bytes <= 512 * 1024, `${bytes} bytes exceeds the 512 KB budget`);
});
