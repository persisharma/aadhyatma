import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

import {
  NARRATIVE_GRAHAS,
  composeNarrative,
  dignityBucket,
  type DignityBucket,
  type NarrativeInput,
} from '../grahaReadingNarrative';
import { GRAHA_NARRATIVE_REVIEW, narrativeReadingsApproved } from '../grahaReadingContent';
import { GRAHA_ORDER, type Graha } from '../kundali';
import type { Dignity, Maitri } from '../kundaliBasis';

const NODES: readonly Graha[] = ['rahu', 'ketu'];
const TARAS = GRAHA_ORDER.filter((graha) => !NODES.includes(graha));

/** The engine inputs that land a placement in each authoring bucket. */
const BUCKET_FACTORS: Readonly<Record<DignityBucket, { dignity: Dignity; relation: Maitri | null }>> = {
  strong: { dignity: 'own', relation: null },
  friendly: { dignity: 'neutral', relation: 'friend' },
  neutral: { dignity: 'neutral', relation: 'neutral' },
  weak: { dignity: 'debilitated', relation: null },
};

function input(graha: Graha, partial: Partial<NarrativeInput> = {}): NarrativeInput {
  return {
    graha,
    house: 10,
    dignity: 'own',
    relation: null,
    ruledHouses: [1, 2],
    combust: false,
    retrograde: false,
    ...partial,
  };
}

test('dignity buckets: strength first, then debilitation, then the sign relation', () => {
  assert.equal(dignityBucket('exalted', null), 'strong');
  assert.equal(dignityBucket('own', null), 'strong');
  assert.equal(dignityBucket('debilitated', null), 'weak');
  assert.equal(dignityBucket('neutral', 'friend'), 'friendly');
  assert.equal(dignityBucket('neutral', 'enemy'), 'weak');
  assert.equal(dignityBucket('neutral', 'neutral'), 'neutral');
  assert.equal(dignityBucket('neutral', null), 'neutral');
});

test('all nine grahas now have a narrative table', () => {
  for (const graha of GRAHA_ORDER) {
    assert.ok(NARRATIVE_GRAHAS.has(graha), `${graha} is in the narrative set`);
    assert.notEqual(composeNarrative(input(graha)), null, `${graha} composes`);
  }
});

test('an out-of-range house returns no narrative rather than crashing', () => {
  assert.equal(composeNarrative(input('saturn', { house: 0 })), null);
  assert.equal(composeNarrative(input('saturn', { house: 13 })), null);
});

test('depth: a strong and a weak placement in the SAME house read differently (every tara, every house)', () => {
  for (const graha of TARAS) {
    for (let house = 1; house <= 12; house += 1) {
      const strong = composeNarrative(input(graha, { house, ...BUCKET_FACTORS.strong, ruledHouses: [] }))!;
      const weak = composeNarrative(input(graha, { house, ...BUCKET_FACTORS.weak, ruledHouses: [] }))!;
      assert.notEqual(strong.leadHi, weak.leadHi, `${graha} house ${house}: strong≠weak (hi)`);
      assert.notEqual(strong.leadEn, weak.leadEn, `${graha} house ${house}: strong≠weak (en)`);
    }
  }
});

test('every graha is complete: 12 houses × 4 buckets, both languages, nothing empty', () => {
  for (const graha of GRAHA_ORDER) {
    for (let house = 1; house <= 12; house += 1) {
      for (const bucket of Object.keys(BUCKET_FACTORS) as DignityBucket[]) {
        const out = composeNarrative(input(graha, { house, ...BUCKET_FACTORS[bucket], ruledHouses: [] }))!;
        for (const [key, value] of Object.entries(out)) {
          assert.ok(value.trim().length > 0, `${graha} house ${house} ${bucket}: ${key} is empty`);
          assert.doesNotMatch(value, /TODO|TBD|placeholder|xxx/i, `${graha} house ${house} ${bucket}: ${key} placeholder`);
        }
      }
    }
  }
});

test('the lordship modifier fires for one ruled house (Sun/Moon) and two (the rest), grammatical in both', () => {
  // two houses — never "your you yourself"
  const two = composeNarrative(input('saturn', { ruledHouses: [1, 2] }))!;
  assert.match(two.leadEn, /also rules your 1st and 2nd houses/);
  assert.match(two.leadHi, /प्रथम और द्वितीय भाव का भी स्वामी/);
  assert.doesNotMatch(two.leadEn, /your you yourself/);
  // one house (the Sun rules a single sign)
  const one = composeNarrative(input('sun', { house: 10, ruledHouses: [5] }))!;
  assert.match(one.leadEn, /also rules your 5th house\b/);
  assert.match(one.leadHi, /पंचम भाव का भी स्वामी/);
  assert.doesNotMatch(one.leadEn, /5th houses/);
});

test('the modifier layer appends only the chart-specific facts that are present', () => {
  const plain = composeNarrative(input('mars', { ruledHouses: [], combust: false, retrograde: false }))!;
  assert.doesNotMatch(plain.leadEn, /also rules your/);
  assert.doesNotMatch(plain.leadEn, /retrograde/i);
  const full = composeNarrative(input('mars', { ruledHouses: [1, 6], combust: true, retrograde: true }))!;
  assert.match(full.leadEn, /also rules your 1st and 6th houses/);
  assert.match(full.leadEn, /retrograde/i);
  assert.ok(full.leadEn.length > plain.leadEn.length);
});

test('nodes have no dignity: every bucket reads the same, and they carry no modifiers', () => {
  for (const node of NODES) {
    const strong = composeNarrative(input(node, { house: 4, ...BUCKET_FACTORS.strong, ruledHouses: [], combust: true, retrograde: true }))!;
    const weak = composeNarrative(input(node, { house: 4, ...BUCKET_FACTORS.weak, ruledHouses: [], combust: true, retrograde: true }))!;
    assert.equal(strong.leadEn, weak.leadEn, `${node} reads the same across buckets`);
    // even with every factor flag on, a node appends nothing (no lordship/combust/retrograde clauses)
    const bare = composeNarrative(input(node, { house: 4, ruledHouses: [], combust: false, retrograde: false }))!;
    assert.equal(strong.leadEn, bare.leadEn, `${node} ignores modifier flags`);
  }
});

test('authored narrative copy: no absolute claims, fatality, medical, commerce, fear, or the old hedge', () => {
  const banned = [
    /will happen/i, /guaranteed/i, /certainly/i, /अवश्य होगा/, /निश्चित रूप से/, /will (get|become|marry|pass|fail)/i,
    /दुर्भाग्य/, /संकट/, /खतरा/, /\bdoom\b/i, /misfortune/i, /\bcurse\b/i, /\bdanger\b/i, /दोषपूर्ण/, /accident/i, /दुर्घटना/, /\bdosha\b/i, /दोष/,
    /मृत्यु/, /\bdeath\b/i, /lifespan/i, /longevity/i, /आयु/, /divorce/i, /तलाक/, /widow/i,
    /\bdisease\b/i, /\bcure\b/i, /\bdiagnos/i, /रोग/, /बीमारी/, /\bmedicine\b/i, /prescri/i, /illness/i,
    /gemstone/i, /रत्न/, /yantra/i, /यंत्र(?!ण)/, /consult an astrologer/i, /पंडित से/, /\bbuy\b/i, /खरीदें/,
    /\bluck\b/i, /\bscore\b/i, /किस्मत/, /\bbad graha\b/i, /malefic for you/i, /tradition links/i,
  ];
  const dir = 'src/panchang/narrative';
  const files = readdirSync(dir).filter((name) => name.endsWith('.ts'));
  assert.ok(files.length >= 9, 'a module per graha plus types');
  for (const file of files) {
    const source = readFileSync(`${dir}/${file}`, 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const pattern of banned) assert.doesNotMatch(source, pattern, `${file}: banned vocabulary ${pattern}`);
  }
});

test('the narrative review is its own gate: draft hides it in store builds, dev always previews', () => {
  assert.equal(GRAHA_NARRATIVE_REVIEW.status, 'draft');
  assert.equal(narrativeReadingsApproved(), false);
  assert.equal(
    narrativeReadingsApproved({ ...GRAHA_NARRATIVE_REVIEW, status: 'approved', signOffRef: 'ref', reviewedOn: '2026-10-09' }),
    true,
  );
});
