import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { DAAN_VAAR_ENTRIES } from '../../data/daan/vaar';
import {
  buildGrahaReadings,
  combustionSeparation,
  friendsLine,
  grahaInSentenceEn,
  houseFactor,
  lordshipFactor,
  resolveGrahaTone,
  type GrahaFactor,
} from '../grahaReading';
import {
  BHAVA_PLAIN,
  GRAHA_BHAVA_READINGS,
  GRAHA_PLAIN,
  GRAHA_READING_REVIEW,
  GRAHA_UPAY,
  SIGN_STRENGTH,
  grahaReadingsApproved,
} from '../grahaReadingContent';
import { renderGrahaReviewSheet, signContextFor } from '../grahaReviewSheet';
import {
  computeKundali,
  GRAHA_ORDER,
  NAKSHATRA_SPAN,
  RASHI_NAMES_EN,
  type Graha,
  type GrahaPosition,
  type KundaliChart,
} from '../kundali';
import { COMBUSTION_ORB_DEG, dignityOf, housesRuledBy, maitriRow, signLordOf, signRelationOf } from '../kundaliBasis';
import { RASHI_LORD } from '../kundaliReport';

/** Two-hour steps through one day rotate the ascendant through all twelve signs. */
function sweepCharts(): KundaliChart[] {
  return Array.from({ length: 24 }, (_, step) =>
    computeKundali({
      date: new Date(Date.UTC(1995, 2, 15, step, 0, 0)),
      latitude: 23.1793,
      longitude: 75.7849,
      timezone: 'Asia/Kolkata',
    })
  );
}

function position(graha: Graha, siderealLongitude: number, house = 1): GrahaPosition {
  const longitude = ((siderealLongitude % 360) + 360) % 360;
  return {
    graha,
    siderealLongitude: longitude,
    rashiIndex: Math.floor(longitude / 30),
    degreeInRashi: longitude % 30,
    nakshatraIndex: Math.floor(longitude / NAKSHATRA_SPAN),
    pada: 1,
    house,
    retrograde: false,
  };
}

function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
}

test('engine, content and sheet renderer stay pure', () => {
  for (const file of ['src/panchang/grahaReading.ts', 'src/panchang/grahaReadingContent.ts', 'src/panchang/grahaReviewSheet.ts']) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/, file);
  }
});

test('sign lords come from the dignity table and equal RASHI_LORD', () => {
  for (let rashi = 0; rashi < 12; rashi += 1) {
    assert.equal(signLordOf(rashi), RASHI_LORD[rashi], RASHI_NAMES_EN[rashi]);
  }
});

test('mitra / shatru rashi: dignity speaks first and the nodes never vote', () => {
  assert.equal(signRelationOf('venus', 4), 'enemy', 'Venus in Simha regards the Sun as an enemy');
  assert.equal(signRelationOf('mars', 4), 'friend', 'Mars in Simha regards the Sun as a friend');
  assert.equal(signRelationOf('mercury', 3), 'enemy', 'Mercury in Karka regards the Moon as an enemy');
  assert.equal(signRelationOf('saturn', 2), 'friend', 'Saturn in Mithuna regards Mercury as a friend');
  assert.equal(signRelationOf('jupiter', 2), 'enemy', 'Jupiter in Mithuna regards Mercury as an enemy');
  assert.equal(signRelationOf('moon', 0), 'neutral', 'the Moon has no enemies; Mars is neutral to it');
  assert.equal(signRelationOf('jupiter', 3), null, 'exalted — dignity speaks');
  assert.equal(signRelationOf('moon', 3), null, 'own sign — dignity speaks');
  assert.equal(signRelationOf('saturn', 0), null, 'debilitated — dignity speaks');
  assert.equal(signRelationOf('rahu', 4), null);
  assert.equal(signRelationOf('ketu', 10), null);
});

test('lordship follows the functional rules — Mesha worked through, and every yogakaraka', () => {
  const mesha = 0;
  assert.deepEqual(housesRuledBy('mars', mesha), [1, 8]);
  assert.deepEqual(housesRuledBy('jupiter', mesha), [9, 12]);
  assert.deepEqual(housesRuledBy('rahu', mesha), []);
  assert.equal(lordshipFactor(housesRuledBy('mars', mesha))?.id, 'lord-lagna', 'the 8th lord that is also the Lagna lord supports');
  assert.equal(lordshipFactor(housesRuledBy('sun', mesha))?.id, 'lord-trikona');
  assert.equal(lordshipFactor(housesRuledBy('jupiter', mesha))?.id, 'lord-trikona');
  assert.deepEqual(lordshipFactor(housesRuledBy('jupiter', mesha))?.houses, [9], 'only the trikona it rules casts the vote');
  assert.equal(lordshipFactor(housesRuledBy('mercury', mesha))?.id, 'lord-demanding', 'rules the 3rd and 6th');
  assert.equal(lordshipFactor(housesRuledBy('saturn', mesha))?.id, 'lord-demanding', 'rules the 10th and 11th');
  assert.equal(lordshipFactor(housesRuledBy('venus', mesha)), null, 'rules the 2nd and 7th — no vote');
  assert.equal(lordshipFactor(housesRuledBy('moon', mesha)), null, 'rules the 4th — no vote');
  assert.equal(lordshipFactor([]), null);
  const yogakarakas: readonly (readonly [Graha, number])[] = [
    ['saturn', 1],
    ['saturn', 6],
    ['mars', 3],
    ['mars', 4],
    ['venus', 9],
    ['venus', 10],
  ];
  for (const [graha, lagna] of yogakarakas) {
    assert.equal(lordshipFactor(housesRuledBy(graha, lagna))?.id, 'lord-yogakaraka', `${graha} for ${RASHI_NAMES_EN[lagna]}`);
  }
});

test('house votes: dig-bala first, every graha in the 11th, benefics in kendra/trikona, malefics in growth houses', () => {
  assert.equal(houseFactor('jupiter', 1)?.id, 'house-digbala');
  assert.equal(houseFactor('saturn', 7)?.id, 'house-digbala');
  assert.equal(houseFactor('sun', 10)?.id, 'house-digbala');
  assert.equal(houseFactor('rahu', 11)?.id, 'house-gains');
  assert.equal(houseFactor('jupiter', 4)?.id, 'house-benefic-strong');
  assert.equal(houseFactor('venus', 9)?.id, 'house-benefic-strong');
  assert.equal(houseFactor('mars', 6)?.id, 'house-malefic-growth');
  assert.equal(houseFactor('ketu', 3)?.id, 'house-malefic-growth');
  assert.equal(houseFactor('venus', 6)?.vote, 'cautions');
  assert.equal(houseFactor('moon', 12)?.vote, 'cautions');
  assert.equal(houseFactor('saturn', 8)?.vote, 'cautions');
  assert.equal(houseFactor('moon', 2), null);
  assert.equal(houseFactor('mercury', 3), null);
  assert.equal(houseFactor('sun', 5), null);
  assert.equal(houseFactor('saturn', 1), null);
});

test('combustion uses flat orbs that agree with the muhurat engine, across the 0° seam', () => {
  const muhurat = readFileSync('src/panchang/eventMuhurat.ts', 'utf8');
  assert.match(muhurat, new RegExp(`VENUS_ORB_DEG = ${COMBUSTION_ORB_DEG.venus};`));
  assert.match(muhurat, new RegExp(`JUPITER_ORB_DEG = ${COMBUSTION_ORB_DEG.jupiter};`));
  const sun = position('sun', 100);
  assert.equal(combustionSeparation(position('mercury', 110), sun), 10);
  assert.equal(combustionSeparation(position('mercury', 115), sun), null, '15° is outside Mercury’s 14°');
  assert.equal(Math.round(combustionSeparation(position('venus', 355), position('sun', 2)) ?? -1), 7);
  assert.equal(combustionSeparation(position('rahu', 101), sun), null, 'the nodes are never combust');
  assert.equal(combustionSeparation(sun, sun), null, 'the Sun is never combust');
});

test('strength lines name the sign, its lord and the relation — "an unfriendly sign" never stands alone', () => {
  const enemy = SIGN_STRENGTH.enemy(signContextFor('venus', 4));
  assert.equal(enemy.en, 'Simha (Leo) is ruled by the Sun, whom Venus counts as an enemy (shatru rashi)');
  assert.equal(enemy.hi, 'सिंह के स्वामी सूर्य हैं, जिन्हें शुक्र शत्रु मानता है (शत्रु राशि)');
  const friend = SIGN_STRENGTH.friend(signContextFor('mars', 4));
  assert.equal(friend.en, 'Simha (Leo) is ruled by the Sun, whom Mars counts as a friend (mitra rashi)');
  assert.equal(SIGN_STRENGTH.exalted(signContextFor('jupiter', 3)).en, 'Karka (Cancer) is where Jupiter is strongest — exalted (uchcha)');
  assert.equal(friendsLine('jupiter', false), 'Friends: Sun, Moon, Mars · Neutral: Saturn · Enemies: Mercury, Venus');
  assert.equal(friendsLine('moon', false), 'Friends: Sun, Mercury · Neutral: Mars, Jupiter, Venus, Saturn · Enemies: none');
  assert.equal(friendsLine('rahu', true), null);
  for (const graha of GRAHA_ORDER) {
    const row = maitriRow(graha);
    if (!row) continue;
    assert.equal(row.friends.length + row.neutral.length + row.enemies.length, 6, `${graha} regards all six other planets`);
  }
});

test('every house names its karaka', () => {
  BHAVA_PLAIN.forEach((house, index) => assert.ok(house.karakas.length > 0, `house ${index + 1}`));
  assert.deepEqual(BHAVA_PLAIN[1].karakas, ['jupiter'], 'the 2nd house is looked after by Jupiter');
  assert.deepEqual(BHAVA_PLAIN[6].karakas, ['venus']);
});

test('the label is counted: all one way → that way; any disagreement, or no vote → mixed', () => {
  const supports = (group: GrahaFactor['group']): GrahaFactor => ({ id: 'sign-own', group, vote: 'supports' });
  const cautions = (group: GrahaFactor['group']): GrahaFactor => ({ id: 'sign-enemy', group, vote: 'cautions' });
  assert.equal(resolveGrahaTone([]), 'mixed');
  assert.equal(resolveGrahaTone([supports('sign')]), 'supportive');
  assert.equal(resolveGrahaTone([supports('sign'), supports('house'), supports('lordship')]), 'supportive');
  assert.equal(resolveGrahaTone([cautions('sign')]), 'care');
  assert.equal(resolveGrahaTone([cautions('house'), cautions('combustion')]), 'care');
  assert.equal(resolveGrahaTone([supports('sign'), supports('house'), cautions('combustion')]), 'mixed');
});

test('nine cards for every lagna: order, closed labels, own basis, every line filled, plain ordinals', () => {
  const lagnas = new Set<number>();
  for (const chart of sweepCharts()) {
    lagnas.add(chart.lagnaRashiIndex);
    const cards = buildGrahaReadings(chart);
    assert.deepEqual(cards.map((card) => card.graha), GRAHA_ORDER);
    assert.deepEqual(buildGrahaReadings(chart), cards, 'deterministic');
    assert.deepEqual(JSON.parse(JSON.stringify(cards)), cards, 'plain JSON');
    for (const card of cards) {
      const label = `${card.graha} in lagna ${RASHI_NAMES_EN[chart.lagnaRashiIndex]}`;
      assert.ok(['supportive', 'mixed', 'care'].includes(card.tone), label);
      assert.equal(card.tone, resolveGrahaTone(card.reasons.map((reason) => ({ id: 'sign-own', group: 'sign', vote: reason.vote }))), `${label}: label agrees with its reasons`);
      assert.ok(card.basis.length > 0, `${label}: basis`);
      assert.equal(card.basis[0].kind, 'graha', `${label}: the placement leads the chain`);
      const ruled = housesRuledBy(card.graha, chart.lagnaRashiIndex);
      assert.equal(card.basis.filter((node) => node.kind === 'lord').length, ruled.length, `${label}: one lord node per ruled house`);
      assert.equal(card.rulesEn === null, ruled.length === 0, `${label}: the rules line follows lordship`);
      for (const key of ['nameHi', 'nameEn', 'meaningHi', 'meaningEn', 'placeHi', 'placeEn', 'strengthHi', 'strengthEn', 'givesHi', 'givesEn', 'careHi', 'careEn', 'toneLabelHi', 'toneLabelEn', 'toneLineHi', 'toneLineEn'] as const) {
        assert.ok(card[key].length > 0, `${label}: ${key}`);
      }
      const english = [card.placeEn, card.strengthEn, card.rulesEn ?? '', ...card.reasons.map((reason) => reason.textEn)].join(' ');
      assert.doesNotMatch(english, /\b(?:\d*[02-9])?[123]th (?:house|bhava)/, `${label}: ordinal grammar`);
      assert.doesNotMatch([card.placeHi, card.rulesHi ?? '', ...card.reasons.map((reason) => reason.textHi)].join(' '), /\d भाव/, `${label}: no bare digit before भाव`);
      assert.doesNotMatch(english, /[ऀ-ॿ]/, `${label}: no Devanagari in English lines`);
      // Review note (2 Oct 2026): a strength line always says whose sign it is.
      const node = card.graha === 'rahu' || card.graha === 'ketu';
      if (node || dignityOf(card.graha, card.rashiIndex) === 'neutral') {
        assert.ok(card.strengthEn.includes(`is ruled by ${grahaInSentenceEn(signLordOf(card.rashiIndex))}`), `${label}: names the sign lord`);
      }
      assert.equal(card.friendsEn === null, node, `${label}: friends line for the seven planets only`);
      assert.ok(card.karakaEn.startsWith('This house’s karaka (natural guardian): '), `${label}: karaka line`);
    }
  }
  assert.equal(lagnas.size, 12, 'fixtures covered every lagna');
});

test('content tables are complete and bilingual', () => {
  assert.equal(BHAVA_PLAIN.length, 12);
  for (const graha of GRAHA_ORDER) {
    const plain = GRAHA_PLAIN[graha];
    assert.ok(plain.nameHi && plain.nameEn && plain.meaningHi && plain.meaningEn, graha);
    const rows = GRAHA_BHAVA_READINGS[graha];
    assert.equal(rows.length, 12, `${graha}: twelve houses`);
    assert.equal(new Set(rows.map((row) => row.givesEn)).size, 12, `${graha}: no repeated gives line`);
    rows.forEach((row, index) => {
      for (const text of [row.givesHi, row.careHi]) assert.match(text, /[ऀ-ॿ]/, `${graha} house ${index + 1}: Hindi`);
      for (const text of [row.givesEn, row.careEn]) {
        assert.ok(text.length > 20, `${graha} house ${index + 1}: English`);
        assert.doesNotMatch(text, /[ऀ-ॿ]/, `${graha} house ${index + 1}: no Devanagari in English`);
      }
    });
    const upay = GRAHA_UPAY[graha];
    for (const value of [upay.vaarHi, upay.vaarEn, upay.daanHi, upay.daanEn, upay.sevaHi, upay.sevaEn, upay.mantraHi, upay.mantraEn]) {
      assert.ok(value.length > 0, `${graha}: upay field`);
    }
    assert.match(upay.mantraHi, /^ॐ .+ नमः$/, `${graha}: beej mantra`);
    assert.match(upay.mantraEn, /^Om .+ Namah$/, `${graha}: transliteration`);
  }
});

test('upay: nine distinct active paaths, weekday daan from the shared vaar table, nodes by शनिवत् राहु · कुजवत् केतु', () => {
  const texts = readFileSync('src/data/texts.ts', 'utf8');
  const rulebook = readFileSync('../RULEBOOK.md', 'utf8');
  for (const graha of GRAHA_ORDER) {
    const id = GRAHA_UPAY[graha].practiceSourceId;
    const at = texts.indexOf(`id: '${id}',`);
    assert.ok(at >= 0, `${id} is a library entry`);
    assert.equal(texts.slice(at).match(/status: '(\w+)'/)?.[1], 'active', `${id} is active`);
    assert.ok(rulebook.includes(`\`${id}\``), `${id} is on the RULEBOOK §14.3.5 allow-list`);
  }
  assert.equal(new Set(GRAHA_ORDER.map((graha) => GRAHA_UPAY[graha].practiceSourceId)).size, 9);
  const weekdayGrahas: readonly (readonly [Graha, number])[] = [
    ['sun', 0],
    ['moon', 1],
    ['mars', 2],
    ['mercury', 3],
    ['jupiter', 4],
    ['venus', 5],
    ['saturn', 6],
  ];
  for (const [graha, weekday] of weekdayGrahas) {
    const row = DAAN_VAAR_ENTRIES.find((entry) => entry.weekday === weekday)!;
    assert.equal(GRAHA_UPAY[graha].weekday, weekday, graha);
    assert.equal(GRAHA_UPAY[graha].daanEn, row.itemsEn, `${graha}: daan is the vaar table's`);
    assert.equal(GRAHA_UPAY[graha].daanHi, row.itemsHi, `${graha}: daan is the vaar table's`);
  }
  assert.match(GRAHA_UPAY.mercury.sevaEn, /green fodder to a cow/, 'gau-gras rides Budh on Wednesday');
  assert.equal(GRAHA_UPAY.rahu.weekday, 6);
  assert.equal(GRAHA_UPAY.ketu.weekday, 2);
});

test('authored copy: no absolute claims, fatality, medical directive, commerce, fear, or the old hedge', () => {
  const banned = [
    // absolute / predictive
    /will happen/i, /guaranteed/i, /certainly/i, /अवश्य होगा/, /निश्चित रूप से/, /will (get|become|marry|pass|fail)/i,
    // fear
    /दुर्भाग्य/, /संकट/, /खतरा/, /\bdoom\b/i, /misfortune/i, /\bcurse\b/i, /\bdanger\b/i, /दोषपूर्ण/, /accident/i, /दुर्घटना/, /\bdosha\b/i, /दोष/,
    // fatality / longevity, and another person's misfortune
    /मृत्यु/, /\bdeath\b/i, /lifespan/i, /longevity/i, /आयु/, /divorce/i, /तलाक/, /widow/i,
    // medical directive / prognosis
    /\bdisease\b/i, /\bcure\b/i, /\bdiagnos/i, /रोग/, /बीमारी/, /\bmedicine\b/i, /prescri/i, /illness/i,
    // commerce
    /gemstone/i, /रत्न/, /yantra/i, /यंत्र(?!ण)/, // not नियंत्रण (control)
    /consult an astrologer/i, /पंडित से/, /\bbuy\b/i, /खरीदें/,
    // luck score, verdicts
    /\bluck\b/i, /\bscore\b/i, /किस्मत/, /\bbad graha\b/i, /malefic for you/i,
    // the hedge the plain register replaces
    /tradition links/i,
  ];
  for (const file of ['src/panchang/grahaReadingContent.ts', 'src/panchang/grahaReading.ts', 'src/components/GrahaReadingList.tsx']) {
    const source = withoutComments(readFileSync(file, 'utf8'));
    for (const pattern of banned) assert.doesNotMatch(source, pattern, `${file}: banned vocabulary ${pattern}`);
  }
});

test('the review record stays draft until a dated jyotishi sign-off is recorded', () => {
  assert.equal(GRAHA_READING_REVIEW.status, 'draft');
  assert.equal(GRAHA_READING_REVIEW.signOffRef, null);
  assert.equal(GRAHA_READING_REVIEW.reviewedOn, null);
  assert.equal(grahaReadingsApproved(), false);
  assert.equal(grahaReadingsApproved({ ...GRAHA_READING_REVIEW, status: 'approved' }), false, 'approval needs a sign-off reference and a date');
  assert.equal(grahaReadingsApproved({ status: 'approved', signOffRef: 'review-artifact', reviewedOn: '2026-10-10', scope: '' }), true);
});

test('the committed jyotishi review sheet matches the tables (npm run export:graha-review)', () => {
  const committed = readFileSync('../docs/reviews/graha-readings-jyotishi-review.md', 'utf8');
  assert.equal(committed, renderGrahaReviewSheet());
});
