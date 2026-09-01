/** PRD-23 source, mapping, language, and release-gate contract. */
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { BHOG_CONTENT, getBhogContent, getBhogForVidhi, isBhogEntryExposed } from '../bhogContent';
import { OBSERVANCE_RULES } from '../festivals';
import type { BhogContentEntry } from '../types';
import { VIDHI_BY_ID } from '../../data/vidhi';
import { describeDevanagariDefect, findDevanagariDefects } from '../../data/devanagariWellFormed';

test('the registry preserves v1 and publishes all phase 2/3 profiles', () => {
  assert.deepEqual(BHOG_CONTENT.slice(0, 10).map((entry) => entry.id), [
    'ekadashi-food',
    'nirjala-ekadashi-food',
    'ganesha-bhog',
    'maha-shivaratri-bhog',
    'janmashtami-bhog',
    'navratri-bhog',
    'karwa-chauth-bhog',
    'diwali-lakshmi-bhog',
    'satyanarayan-bhog',
    'hanuman-jayanti-bhog',
  ]);
  assert.equal(BHOG_CONTENT.length, 43);
  assert.deepEqual(BHOG_CONTENT.slice(10).map((entry) => entry.id), [
    'hartalika-teej-bhog',
    'hariyali-teej-bhog',
    'kajari-teej-bhog',
    'bahula-chaturthi-bhog',
    'bhadwa-chauth-bhog',
    'rishi-panchami-bhog',
    'durva-ashtami-bhog',
    'anant-chaturdashi-bhog',
    'kojagara-bhog',
    'ahoi-ashtami-bhog',
    'chhath-bhog',
    'akshaya-navami-bhog',
    'pradosh-bhog',
    'dwadashi-bhog',
    'recurring-shiva-bhog',
    'pitru-offering',
    'skanda-sashti-bhog',
    'devi-vrat-bhog',
    'kalashtami-bhog',
    'krishna-monthly-bhog',
    'mangala-gauri-bhog',
    'varalakshmi-bhog',
    'vat-savitri-bhog',
    'jivitputrika-bhog',
    'mahalakshmi-vrat-bhog',
    'purushottam-maas-bhog',
    'chaturmasa-bhog',
    'weekday-vrat-bhog',
    'dashavatara-bhog',
    'gangaur-bhog',
    'jayaparvati-bhog',
    'shitala-bhog',
    'bachh-baras-bhog',
  ]);
});

test('every profile carries bilingual guidance and independent published sources', () => {
  const seen = new Set<string>();
  for (const entry of BHOG_CONTENT) {
    assert.ok(!seen.has(entry.id), `duplicate id ${entry.id}`);
    seen.add(entry.id);
    assert.ok(entry.titleHi.trim() && entry.titleEn.trim(), `${entry.id}: missing title`);
    assert.ok(entry.offerings.length > 0, `${entry.id}: no offerings`);
    assert.ok(entry.traditionNoteHi.trim() && entry.traditionNoteEn.trim(), `${entry.id}: missing tradition note`);
    assert.equal(Boolean(entry.paranaMealHi), Boolean(entry.paranaMealEn), `${entry.id}: one-sided parana meal`);

    const guidance = [
      ...entry.offerings,
      ...(entry.permittedDuringFast ?? []),
      ...(entry.abstainedDuringFast ?? []),
      ...(entry.doNotOffer ?? []),
    ];
    for (const row of guidance) {
      assert.ok(row.textHi.trim() && row.textEn.trim(), `${entry.id}/${row.id}: empty bilingual row`);
    }
    for (const row of entry.shoppingItems) {
      assert.ok(row.itemHi.trim() && row.itemEn.trim(), `${entry.id}/${row.id}: empty grocery`);
    }

    assert.ok(entry.source.referenceUrls.length >= 2, `${entry.id}: needs >=2 source URLs`);
    const hosts = new Set(entry.source.referenceUrls.map((url) => new URL(url).hostname.replace(/^www\./, '')));
    assert.ok(hosts.size >= 2, `${entry.id}: sources are not independent domains`);
    assert.match(entry.source.verificationNote, /\b\d{4}-\d{2}-\d{2}\b/u, `${entry.id}: verification is not dated`);
  }
});

test('every genuine vrat and upavas rule has verified food or offering guidance', () => {
  const eligible = OBSERVANCE_RULES.filter((rule) => rule.category === 'vrat' || rule.category === 'upavas');
  assert.equal(eligible.length, 72);
  assert.deepEqual(
    eligible.filter((rule) => !rule.bhogId).map((rule) => rule.id),
    []
  );
  for (const rule of eligible) {
    assert.ok(getBhogContent(rule.bhogId!)?.id, `${rule.id}: bhog is not verified/exposed`);
  }

  assert.equal(OBSERVANCE_RULES.find((rule) => rule.id === 'chandra-darshan')?.category, 'festival');
  assert.equal(OBSERVANCE_RULES.find((rule) => rule.id === 'ishti-anvadhan')?.category, 'festival');
  assert.equal(OBSERVANCE_RULES.find((rule) => rule.id === 'shraddha-dates')?.category, 'festival');
});

test('rule and vidhi hooks round-trip through verified-only accessors', () => {
  const ruleIds = new Set(OBSERVANCE_RULES.map((rule) => rule.id));
  for (const rule of OBSERVANCE_RULES) {
    if (!rule.bhogId) continue;
    assert.equal(getBhogContent(rule.bhogId)?.id, rule.bhogId, `${rule.id}: dead bhogId '${rule.bhogId}'`);
  }
  for (const entry of BHOG_CONTENT) {
    for (const ruleId of entry.observanceIds) {
      assert.ok(ruleIds.has(ruleId), `${entry.id}: unknown observance '${ruleId}'`);
      assert.ok(
        OBSERVANCE_RULES.some((rule) => rule.id === ruleId && rule.bhogId === entry.id),
        `${entry.id}: observance '${ruleId}' does not carry the profile hook`
      );
    }
    for (const vidhiId of entry.vidhiIds) {
      assert.ok(VIDHI_BY_ID.has(vidhiId), `${entry.id}: unknown vidhi '${vidhiId}'`);
      assert.equal(getBhogForVidhi(vidhiId)?.id, entry.id, `${entry.id}: vidhi lookup mismatch`);
    }
  }
  assert.equal(getBhogContent('not-real'), null);
  assert.equal(getBhogForVidhi('not-real'), null);
});

test('draft profiles remain invisible non-vacuously', () => {
  const fixture: BhogContentEntry = {
    id: 'fixture',
    titleHi: 'भोग',
    titleEn: 'Bhog',
    observanceIds: ['fixture'],
    vidhiIds: [],
    offerings: [{ id: 'fruit', textHi: 'फल', textEn: 'Fruit' }],
    traditionNoteHi: 'परम्परा अनुसार।',
    traditionNoteEn: 'Follow tradition.',
    shoppingItems: [],
    status: 'draft',
    source: { referenceUrls: ['https://a.example', 'https://b.example'], verificationNote: 'fixture' },
  };
  assert.equal(isBhogEntryExposed(fixture), false);
  assert.equal(isBhogEntryExposed({ ...fixture, status: 'verified' }), true);
});

test('eating, offering, and abhisheka claims stay distinct', () => {
  const shiva = getBhogContent('maha-shivaratri-bhog')!;
  assert.ok(shiva.offerings.some((row) => row.id === 'bilva'));
  assert.ok(shiva.permittedDuringFast?.some((row) => row.id === 'fruit-milk'));
  assert.ok(!shiva.offerings.some((row) => /पंचामृत|panchamrit/iu.test(`${row.textHi} ${row.textEn}`)));
  assert.match(shiva.traditionNoteEn, /abhisheka materials/);

  const ganesha = getBhogContent('ganesha-bhog')!;
  assert.ok(ganesha.doNotOffer?.some((row) => row.id === 'tulsi'));
  assert.match(ganesha.traditionNoteEn, /exception/);

  const ekadashi = getBhogContent('ekadashi-food')!;
  assert.match(ekadashi.traditionNoteEn, /disputed/);
  assert.doesNotMatch(
    `${ekadashi.offerings.map((row) => row.textEn).join(' ')} ${ekadashi.traditionNoteEn}`,
    /Tulsi.*not.*pluck.*Ekadashi/iu
  );
});

test('customer-rendered copy carries no editorial status or health claims', () => {
  const bannedStatus = /\b(draft|verified|unverified|review|pending)\b|समीक्षा|प्रारूप|सत्यापित/iu;
  const bannedWellness = /detox|cure|treats? disease|weight loss|विषहरण|रोग ठीक/iu;
  for (const entry of BHOG_CONTENT) {
    const rendered = JSON.stringify({
      titleHi: entry.titleHi,
      titleEn: entry.titleEn,
      offerings: entry.offerings,
      permittedDuringFast: entry.permittedDuringFast,
      abstainedDuringFast: entry.abstainedDuringFast,
      doNotOffer: entry.doNotOffer,
      paranaMealHi: entry.paranaMealHi,
      paranaMealEn: entry.paranaMealEn,
      traditionNoteHi: entry.traditionNoteHi,
      traditionNoteEn: entry.traditionNoteEn,
      shoppingItems: entry.shoppingItems,
    });
    assert.ok(!bannedStatus.test(rendered), `${entry.id}: editorial status leaked`);
    assert.ok(!bannedWellness.test(rendered), `${entry.id}: wellness claim leaked`);
  }
});

test('all rendered Hindi copy is well-formed Devanagari', () => {
  for (const entry of BHOG_CONTENT) {
    const hindi = [
      entry.titleHi,
      ...entry.offerings.map((row) => row.textHi),
      ...(entry.permittedDuringFast ?? []).map((row) => row.textHi),
      ...(entry.abstainedDuringFast ?? []).map((row) => row.textHi),
      ...(entry.doNotOffer ?? []).map((row) => row.textHi),
      entry.paranaMealHi ?? '',
      entry.traditionNoteHi,
      ...entry.shoppingItems.map((row) => row.itemHi),
    ];
    for (const text of hindi) {
      assert.deepEqual(
        findDevanagariDefects(text).map(describeDevanagariDefect),
        [],
        `${entry.id}: malformed Devanagari in '${text}'`
      );
    }
  }
});
