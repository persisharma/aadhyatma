import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { computeKundali, GRAHA_ORDER } from '../kundali';
import {
  ageBandAt,
  basisLabelEn,
  basisLabelHi,
  dignityOf,
  maitriOf,
  type BasisNode,
} from '../kundaliBasis';

test('basis module stays pure', () => {
  const source = readFileSync('src/panchang/kundaliBasis.ts', 'utf8');
  assert.doesNotMatch(source, /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/);
});

test('dignity: exaltation, debilitation (opposite sign) and own signs from the classical table', () => {
  assert.equal(dignityOf('sun', 0), 'exalted');
  assert.equal(dignityOf('sun', 6), 'debilitated');
  assert.equal(dignityOf('sun', 4), 'own');
  assert.equal(dignityOf('saturn', 6), 'exalted');
  assert.equal(dignityOf('saturn', 0), 'debilitated');
  assert.equal(dignityOf('saturn', 9), 'own');
  assert.equal(dignityOf('saturn', 10), 'own');
  // Mercury: Kanya is both exalted and own — exaltation wins.
  assert.equal(dignityOf('mercury', 5), 'exalted');
  assert.equal(dignityOf('mercury', 2), 'own');
  assert.equal(dignityOf('mercury', 11), 'debilitated');
  assert.equal(dignityOf('moon', 1), 'exalted');
  assert.equal(dignityOf('moon', 7), 'debilitated');
  // Nodes are never graded.
  for (let rashi = 0; rashi < 12; rashi += 1) {
    assert.equal(dignityOf('rahu', rashi), 'neutral');
    assert.equal(dignityOf('ketu', rashi), 'neutral');
  }
});

test('naisargika maitri: the BPHS rows, asymmetric, self is friend', () => {
  assert.equal(maitriOf('sun', 'saturn'), 'enemy');
  assert.equal(maitriOf('saturn', 'sun'), 'enemy');
  assert.equal(maitriOf('sun', 'mercury'), 'neutral');
  assert.equal(maitriOf('mercury', 'sun'), 'friend');
  assert.equal(maitriOf('moon', 'saturn'), 'neutral');
  assert.equal(maitriOf('saturn', 'moon'), 'enemy');
  assert.equal(maitriOf('jupiter', 'venus'), 'enemy');
  assert.equal(maitriOf('venus', 'jupiter'), 'neutral');
  assert.equal(maitriOf('saturn', 'rahu'), 'neutral');
  assert.equal(maitriOf('rahu', 'saturn'), 'friend');
  for (const graha of GRAHA_ORDER) assert.equal(maitriOf(graha, graha), 'friend');
});

test('age band derives from the chart birth instant and the read instant', () => {
  const chart = computeKundali({
    date: new Date('2013-08-10T05:00:00Z'),
    latitude: 23.1793,
    longitude: 75.7849,
    timezone: 'Asia/Kolkata',
  });
  assert.equal(ageBandAt(chart, new Date('2020-01-01T00:00:00Z')), 'child');
  assert.equal(ageBandAt(chart, new Date('2026-09-14T00:00:00Z')), 'adolescent');
  assert.equal(ageBandAt(chart, new Date('2031-08-10T00:00:00Z')), 'adult');
});

test('every basis node kind renders a non-empty label in both languages', () => {
  const nodes: BasisNode[] = [
    { kind: 'bhava', house: 5, rashiIndex: 10 },
    { kind: 'lord', graha: 'saturn', ofHouse: 5, inHouse: 1 },
    { kind: 'graha', graha: 'sun', house: 11, dignity: 'own', retrograde: false },
    { kind: 'graha', graha: 'saturn', house: 1, dignity: 'exalted', retrograde: true },
    { kind: 'yoga', yogaId: 'budhaditya' },
    { kind: 'dasha', level: 'maha', lord: 'saturn', startKey: '2010-09-01', endKey: '2029-07-04' },
    { kind: 'gochar', graha: 'saturn', fromMoonHouse: 1, asOfKey: '2026-09-14' },
    { kind: 'relation', from: 'saturn', to: 'rahu', relation: 'neutral' },
  ];
  for (const node of nodes) {
    assert.ok(basisLabelHi(node).length > 3, node.kind);
    assert.ok(basisLabelEn(node).length > 3, node.kind);
  }
  assert.equal(basisLabelEn(nodes[1]), 'lord of 5th bhava Saturn · in 1st bhava');
  assert.equal(basisLabelHi(nodes[0]), 'पंचम भाव = कुम्भ');
  assert.ok(basisLabelEn(nodes[5]).includes('1 Sep 2010 → 4 Jul 2029'));
  assert.ok(basisLabelEn(nodes[3]).includes('retrograde'));
});
