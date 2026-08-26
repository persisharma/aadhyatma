import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { NAMKARAN_CORPUS, NAMKARAN_SHARD_COUNT } from '../namkaran';
import type { NameRecord, NamkaranShard } from '../namkaran/types';
import { deities } from '../deities';
import { CHARANA_TABLE } from '../../panchang/namkaranConvention';

const DIR = join('src', 'data', 'namkaran');

/** PRD-17 §11.2 depth, raised from 6+6 by the reviewed corpus-depth decision. */
const MIN_PER_GENDER = 12;
/**
 * The two budgets that replaced the single 512 KB file cap (RULEBOOK §18.4a).
 * Per-shard is the one that protects the user: a screen reads at most two shards.
 * Total is the bundle ceiling.
 */
const MAX_SHARD_BYTES = 64 * 1024;
const MAX_TOTAL_BYTES = 1024 * 1024;

const shardFiles = readdirSync(DIR)
  .filter((file) => file.startsWith('names.') && file.endsWith('.json'))
  .sort();

const shards = shardFiles.map(
  (file) => JSON.parse(readFileSync(join(DIR, file), 'utf8')) as NamkaranShard
);

/** Every authored record once, de-duplicated across shards by id. */
const allNames = [...new Map(shards.flatMap((shard) => shard.names).map((name) => [name.id, name])).values()];

/** Runtime filter semantics: an `any` name shows under both gender filters. */
function genderTally(names: readonly NameRecord[]): { boy: number; girl: number } {
  return {
    boy: names.filter((name) => name.gender === 'boy' || name.gender === 'any').length,
    girl: names.filter((name) => name.gender === 'girl' || name.gender === 'any').length,
  };
}

function namesForCharana(charanaIndex: number): readonly NameRecord[] {
  return allNames.filter((name) => name.charanas.includes(charanaIndex));
}

function namesForNakshatra(nakshatraIndex: number): readonly NameRecord[] {
  const start = nakshatraIndex * 4;
  return allNames.filter((name) => name.charanas.some((value) => value >= start && value < start + 4));
}

/**
 * Charanas that do not yet meet the floor. A thin charana is covered by its
 * nakshatra-level fallback instead, which must itself clear the floor —
 * otherwise the fallback is a promise the corpus cannot keep.
 */
function coverageGaps(): string[] {
  const gaps: string[] = [];
  for (const entry of CHARANA_TABLE) {
    const scope = entry.thin ? namesForNakshatra(entry.nakshatraIndex) : namesForCharana(entry.charanaIndex);
    const { boy, girl } = genderTally(scope);
    if (boy < MIN_PER_GENDER || girl < MIN_PER_GENDER) {
      gaps.push(
        `c${entry.charanaIndex}${entry.thin ? ` (thin → nakshatra ${entry.nakshatraIndex})` : ''}: `
        + `boy ${boy}/${MIN_PER_GENDER}, girl ${girl}/${MIN_PER_GENDER}`
      );
    }
  }
  return gaps;
}

test('the development corpus is explicitly blocked from release', () => {
  assert.equal(NAMKARAN_CORPUS.verified, false);
  assert.equal(NAMKARAN_CORPUS.releaseEligible, false);
});

test('the shard set is exactly one file per nakshatra, correctly self-labelled', () => {
  assert.equal(shardFiles.length, 27);
  assert.equal(NAMKARAN_SHARD_COUNT, 27);
  shards.forEach((shard, index) => {
    assert.equal(shard.nakshatraIndex, index, `${shardFiles[index]}: wrong nakshatraIndex`);
    assert.ok(shard.nakshatra.trim(), `${shardFiles[index]}: missing nakshatra name`);
    assert.ok(Array.isArray(shard.names), `${shardFiles[index]}: missing names array`);
  });
});

test('every name is stored in the shard of each nakshatra its charanas touch', () => {
  for (const [index, shard] of shards.entries()) {
    for (const name of shard.names) {
      const nakshatras = new Set(name.charanas.map((charana) => Math.floor(charana / 4)));
      assert.ok(
        nakshatras.has(index),
        `${name.id} sits in shard ${index} but its charanas belong to ${[...nakshatras].join(', ')}`
      );
      // A cross-nakshatra name is duplicated rather than cross-referenced, so
      // the copies must agree — the loader de-duplicates by id and would
      // otherwise surface whichever shard happened to load first.
      for (const nakshatraIndex of nakshatras) {
        const twin = shards[nakshatraIndex].names.find((candidate) => candidate.id === name.id);
        assert.ok(twin, `${name.id} is missing from shard ${nakshatraIndex}`);
        assert.deepEqual(twin, name, `${name.id} differs between shards ${index} and ${nakshatraIndex}`);
      }
    }
  }
});

test('authored names have unique ids, bilingual meanings, matching initials, and resolving deities', () => {
  const deityIds = new Set(deities.map((deity) => deity.id));
  const seen = new Set<string>();
  for (const shard of shards) {
    for (const name of shard.names) {
      if (seen.has(name.id)) continue;
      seen.add(name.id);
      assert.ok(name.hi.trim(), `${name.id}: missing Devanagari name`);
      assert.ok(name.latin.trim(), `${name.id}: missing pronunciation aid`);
      assert.ok(name.meaningHi.trim(), `${name.id}: missing Hindi meaning`);
      assert.ok(name.meaningEn.trim(), `${name.id}: missing English meaning`);
      assert.ok([2, 3, 4].includes(name.syllableCount), `${name.id}: bad syllableCount`);
      assert.ok(name.charanas.length > 0, `${name.id}: no charana assigned`);
      for (const charanaIndex of name.charanas) {
        const syllables = CHARANA_TABLE[charanaIndex].syllables;
        assert.ok(
          syllables.some((syllable) => name.hi.startsWith(syllable.hi)),
          `${name.id}: initial does not match charana ${charanaIndex}`
        );
      }
      if (name.deityId) assert.ok(deityIds.has(name.deityId), `${name.id}: missing deity ${name.deityId}`);
    }
  }
  assert.equal(seen.size, allNames.length);
});

test('the generated count index matches the shards', () => {
  const committed = JSON.parse(readFileSync(join(DIR, 'counts.json'), 'utf8')) as {
    version: number;
    charana: Record<string, number>;
  };
  assert.equal(committed.version, 1);
  // Re-derived here rather than imported from the generator, so a bug in the
  // generator cannot certify its own output.
  const expected: Record<string, number> = {};
  for (let charanaIndex = 0; charanaIndex < 108; charanaIndex += 1) {
    const total = namesForCharana(charanaIndex).length;
    if (total) expected[String(charanaIndex)] = total;
  }
  assert.deepEqual(
    committed.charana,
    expected,
    'counts.json is stale — regenerate with `npx tsx scripts/namkaran-build-index.mts`'
  );
});

test('each shard and the corpus as a whole stay within the reviewed byte budgets', () => {
  let total = 0;
  for (const file of shardFiles) {
    const bytes = statSync(join(DIR, file)).size;
    total += bytes;
    assert.ok(bytes <= MAX_SHARD_BYTES, `${file}: ${bytes} bytes exceeds the ${MAX_SHARD_BYTES} per-shard budget`);
  }
  total += statSync(join(DIR, 'counts.json')).size;
  assert.ok(total <= MAX_TOTAL_BYTES, `${total} bytes exceeds the ${MAX_TOTAL_BYTES} total budget`);
});

test('the 12+12 coverage floor gates release eligibility', () => {
  const gaps = coverageGaps();
  if (NAMKARAN_CORPUS.releaseEligible) {
    assert.deepEqual(gaps, [], `corpus claims release eligibility with ${gaps.length} charanas short`);
    return;
  }
  // Still authoring. The floor is not yet met by design, so failing here would
  // keep CI red for the whole content push. What this does assert is that the
  // flag and the corpus cannot silently disagree: once every charana clears
  // 12+12, this fails until someone flips `releaseEligible`.
  assert.ok(
    gaps.length > 0,
    'every charana now meets the 12+12 floor — set NAMKARAN_CORPUS.releaseEligible to true'
  );
});
