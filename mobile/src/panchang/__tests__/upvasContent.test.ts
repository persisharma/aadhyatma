/**
 * Data-shape + content-correctness suite for the upvas/fasting registry
 * (PRD-09 Phase 4 §10). Runs under `tsx --test` — the registry is RN-free by
 * construction.
 */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { UPVAS_CONTENT, getUpvasInfo, isUpvasEntryExposed } from '../upvasContent';
import { EKADASHI_RULES, OBSERVANCE_RULES } from '../festivals';
import { findDevanagariDefects, describeDevanagariDefect } from '../../data/devanagariWellFormed';
import type { UpvasInfoEntry } from '../types';

test('entry ids are unique', () => {
  const seen = new Set<string>();
  for (const entry of UPVAS_CONTENT) {
    assert.ok(!seen.has(entry.id), `duplicate id ${entry.id}`);
    seen.add(entry.id);
  }
});

test('the v1 starter set is exactly the eight §6.1 entries', () => {
  assert.deepEqual(
    [...UPVAS_CONTENT.map((e) => e.id)].sort(),
    [
      'ekadashi-upvas',
      'janmashtami-upvas',
      'karwa-chauth-upvas',
      'maha-shivaratri-upvas',
      'nirjala-ekadashi-upvas',
      'pradosh-upvas',
      'purnima-satyanarayan-upvas',
      'sankashti-chaturthi-upvas',
    ]
  );
});

test('every rendered hi/en pair is non-empty and bilingual', () => {
  for (const entry of UPVAS_CONTENT) {
    const pairs: [string, string | undefined, string | undefined][] = [
      ['fastTypeNote', entry.fastTypeNoteHi, entry.fastTypeNoteEn],
      ['window.text', entry.window.textHi, entry.window.textEn],
      ['strictness', entry.strictnessHi, entry.strictnessEn],
    ];
    if (entry.parana) pairs.push(['parana.text', entry.parana.textHi, entry.parana.textEn]);
    for (const [field, hi, en] of pairs) {
      assert.ok(hi?.trim(), `${entry.id}: empty ${field}Hi`);
      assert.ok(en?.trim(), `${entry.id}: empty ${field}En`);
    }
    assert.equal(
      Boolean(entry.whoObservesHi?.trim()),
      Boolean(entry.whoObservesEn?.trim()),
      `${entry.id}: one-sided whoObserves`
    );
  }
});

test('every entry carries ≥2 reference URLs and a verification note', () => {
  for (const entry of UPVAS_CONTENT) {
    assert.ok(entry.source.referenceUrls.length >= 2, `${entry.id}: needs ≥2 reference URLs`);
    for (const url of entry.source.referenceUrls) {
      assert.match(url, /^https:\/\//, `${entry.id}: non-https reference URL ${url}`);
    }
    assert.ok(entry.source.verificationNote.trim(), `${entry.id}: empty verificationNote`);
  }
});

test('boundTithi is present iff the parana kind is tithi-bound, and within 1–15', () => {
  for (const entry of UPVAS_CONTENT) {
    if (!entry.parana) continue;
    if (entry.parana.kind === 'next-day-sunrise-tithi-bound') {
      assert.ok(
        entry.parana.boundTithi !== undefined &&
          entry.parana.boundTithi >= 1 &&
          entry.parana.boundTithi <= 15,
        `${entry.id}: tithi-bound parana needs boundTithi in 1–15`
      );
    } else {
      assert.equal(entry.parana.boundTithi, undefined, `${entry.id}: boundTithi on a non-tithi-bound parana`);
    }
  }
});

test('every upvasId in festivals.ts resolves to an entry, and every entry is attached to ≥1 rule', () => {
  const entryIds = new Set(UPVAS_CONTENT.map((e) => e.id));
  const referenced = new Set<string>();
  for (const rule of OBSERVANCE_RULES) {
    if (!rule.upvasId) continue;
    assert.ok(entryIds.has(rule.upvasId), `${rule.id}: upvasId '${rule.upvasId}' has no entry`);
    referenced.add(rule.upvasId);
  }
  for (const entry of UPVAS_CONTENT) {
    assert.ok(referenced.has(entry.id), `${entry.id}: attached to no observance rule`);
  }
});

test('§6.1 attached-rule sets are pinned literally', () => {
  const rulesFor = (upvasId: string) =>
    OBSERVANCE_RULES.filter((r) => r.upvasId === upvasId)
      .map((r) => r.id)
      .sort();

  // The Ekadashi family shares one entry; निर्जला alone carries the stricter one.
  const ekadashiIds = EKADASHI_RULES.map((r) => r.id);
  assert.ok(ekadashiIds.includes('nirjala-ekadashi'), 'nirjala-ekadashi is an EKADASHI_RULES id');
  assert.deepEqual(
    rulesFor('ekadashi-upvas'),
    ekadashiIds.filter((id) => id !== 'nirjala-ekadashi').sort()
  );
  assert.deepEqual(rulesFor('nirjala-ekadashi-upvas'), ['nirjala-ekadashi']);
  assert.deepEqual(rulesFor('purnima-satyanarayan-upvas'), ['purnima-vrat', 'shree-satyanarayan-vrat']);
  assert.deepEqual(rulesFor('pradosh-upvas'), ['pradosh-vrat-krishna', 'pradosh-vrat-shukla']);
  assert.deepEqual(rulesFor('sankashti-chaturthi-upvas'), ['sankashti-chaturthi-vrat']);
  assert.deepEqual(rulesFor('karwa-chauth-upvas'), ['karwa-chauth']);
  assert.deepEqual(rulesFor('maha-shivaratri-upvas'), ['maha-shivaratri', 'masik-shivaratri'].sort());
  assert.deepEqual(rulesFor('janmashtami-upvas'), ['janmashtami', 'masik-krishna-janmashtami'].sort());
});

test('content-correctness pins — facts asserted literally so refactors cannot swap rules', () => {
  const byId = new Map(UPVAS_CONTENT.map((e) => [e.id, e] as const));
  const ekadashi = byId.get('ekadashi-upvas')!;
  assert.equal(ekadashi.parana?.kind, 'next-day-sunrise-tithi-bound');
  assert.equal(ekadashi.parana?.boundTithi, 12);
  const nirjala = byId.get('nirjala-ekadashi-upvas')!;
  assert.equal(nirjala.fastType, 'nirjala');
  assert.equal(nirjala.parana?.boundTithi, 12);
  assert.equal(nirjala.window.kind, 'sunrise-to-next-sunrise');
  const karwa = byId.get('karwa-chauth-upvas')!;
  assert.equal(karwa.fastType, 'nirjala');
  assert.equal(karwa.parana?.kind, 'same-day-after-moonrise');
  assert.equal(byId.get('sankashti-chaturthi-upvas')!.parana?.kind, 'same-day-after-moonrise');
  assert.equal(byId.get('maha-shivaratri-upvas')!.fastType, 'night-vigil');
  assert.equal(byId.get('maha-shivaratri-upvas')!.parana?.kind, 'text-only');
  assert.equal(byId.get('purnima-satyanarayan-upvas')!.parana?.kind, 'text-only');
  assert.equal(byId.get('pradosh-upvas')!.parana?.kind, 'text-only');
  assert.equal(byId.get('janmashtami-upvas')!.parana?.kind, 'text-only');
});

test('draft entries are not exposed by getUpvasInfo — proven non-vacuously', () => {
  // A fixture draft entry proves the filter regardless of the shipped
  // entries' current statuses (they will flip to verified over time).
  const fixtureDraft: UpvasInfoEntry = {
    id: 'fixture-draft',
    fastType: 'phalahar',
    fastTypeNoteHi: 'क', fastTypeNoteEn: 'a',
    window: { kind: 'sunrise-to-parana', textHi: 'क', textEn: 'a' },
    strictnessHi: 'क', strictnessEn: 'a',
    status: 'draft',
    source: { referenceUrls: ['https://a', 'https://b'], verificationNote: 'fixture' },
  };
  assert.equal(isUpvasEntryExposed(fixtureDraft), false);
  assert.equal(isUpvasEntryExposed({ ...fixtureDraft, status: 'verified' }), true);

  // The registry path itself: every draft in the shipped set resolves to null,
  // and every exposed id round-trips.
  for (const entry of UPVAS_CONTENT) {
    const resolved = getUpvasInfo(entry.id);
    if (entry.status === 'verified') assert.equal(resolved, entry);
    else assert.equal(resolved, null, `${entry.id} is draft and must be hidden`);
  }
  assert.equal(getUpvasInfo('no-such-entry'), null);
});

test('customer-rendered fields carry no draft/review/status language', () => {
  const banned = /\b(draft|verified|unverified|review|pending)\b|समीक्षा|प्रारूप|सत्यापित/iu;
  for (const entry of UPVAS_CONTENT) {
    const rendered = [
      entry.fastTypeNoteHi, entry.fastTypeNoteEn,
      entry.window.textHi, entry.window.textEn,
      entry.parana?.textHi ?? '', entry.parana?.textEn ?? '',
      entry.strictnessHi, entry.strictnessEn,
      entry.whoObservesHi ?? '', entry.whoObservesEn ?? '',
    ];
    for (const text of rendered) {
      assert.ok(!banned.test(text), `${entry.id}: status language in rendered copy: "${text}"`);
    }
  }
});

test('all Hindi fields are well-formed Devanagari (the #243 gate)', () => {
  for (const entry of UPVAS_CONTENT) {
    const hiFields = [
      entry.fastTypeNoteHi,
      entry.window.textHi,
      entry.parana?.textHi ?? '',
      entry.strictnessHi,
      entry.whoObservesHi ?? '',
    ];
    for (const text of hiFields) {
      const defects = findDevanagariDefects(text);
      assert.deepEqual(
        defects.map(describeDevanagariDefect),
        [],
        `${entry.id}: malformed Devanagari in "${text}"`
      );
    }
  }
});
