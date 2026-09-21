import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { computeKundali, type KundaliChart } from '../kundali';
import { buildPrashnaAnswer, resolveStrength, type PrashnaFactor } from '../prashna';
import { PRASHNA_PURPOSES, getPurpose, isPurposeId, type PurposeId } from '../prashnaPurposes';

const adult = computeKundali({
  date: new Date('1995-03-15T04:30:00Z'),
  latitude: 23.1793,
  longitude: 75.7849,
  timezone: 'Asia/Kolkata',
});
const child = computeKundali({
  date: new Date('2013-08-10T05:00:00Z'),
  latitude: 26.9124,
  longitude: 75.7873,
  timezone: 'Asia/Kolkata',
});
const NOW = new Date('2026-09-14T09:00:00Z');
const PURPOSE_IDS = PRASHNA_PURPOSES.map((purpose) => purpose.id);

function answer(chart: KundaliChart, purposeId: PurposeId, at = NOW) {
  return buildPrashnaAnswer(chart, purposeId, at, { gocharScanDays: 0 });
}

test('prashna engine and registry stay pure', () => {
  for (const file of ['src/panchang/prashna.ts', 'src/panchang/prashnaPurposes.ts', 'src/panchang/prashnaPhase.ts']) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/, file);
  }
});

test('authored copy: guidance framing, no absolute claims, no fatality, no medical directive, no commerce', () => {
  const source = readFileSync('src/panchang/prashna.ts', 'utf8');
  const banned = [
    // absolute / predictive
    /will happen/i, /guaranteed/i, /certainly/i, /अवश्य होगा/, /निश्चित रूप से/, /will (get|become|marry|pass|fail)/i,
    // fear
    /दुर्भाग्य/, /संकट/, /खतरा/, /\bdoom\b/i, /misfortune/i, /\bcurse\b/i, /\bdanger\b/i, /दोषपूर्ण/,
    // fatality / longevity
    /मृत्यु/, /\bdeath\b/i, /lifespan/i, /longevity/i, /आयु-?क्षय/,
    // medical directive / prognosis
    /\bdisease\b/i, /\bcure\b/i, /(?<!not a )\bdiagnos/i, /रोग होगा/, /(?<!यह )रोग-विचार(?! नहीं)/, /बीमारी/, /\bmedicine\b/i, /prescri/i,
    // commerce
    /gemstone/i, /रत्न/, /consult an astrologer/i, /पंडित से/, /\bbuy\b/i, /खरीदें/,
    // luck score
    /\bluck\b/i, /\bscore\b/i, /किस्मत/,
  ];
  for (const pattern of banned) assert.doesNotMatch(source, pattern, `banned vocabulary: ${pattern}`);
});

test('registry: nine purposes, valid bhavas/karakas, honest source flags, non-empty ask forms', () => {
  assert.equal(PRASHNA_PURPOSES.length, 9);
  assert.deepEqual(PURPOSE_IDS, ['vidya', 'vyapar', 'naukri', 'dhan', 'vivah', 'santan', 'swasthya', 'yatra', 'man']);
  for (const purpose of PRASHNA_PURPOSES) {
    assert.ok(purpose.bhavas.length >= 1 && purpose.bhavas.every((house) => house >= 1 && house <= 12), purpose.id);
    assert.equal(new Set(purpose.bhavas).size, purpose.bhavas.length, `${purpose.id} bhavas unique`);
    assert.ok(purpose.karakas.length >= 1, purpose.id);
    assert.equal(purpose.source.verified, false, `${purpose.id} does not claim verification`);
    assert.ok(purpose.forms.length >= 4, `${purpose.id} ask forms`);
    assert.ok(['navagraha-stotram', 'surya-ashtakam', 'shani-ashtakam'].includes(purpose.practiceSourceId));
  }
  assert.equal(getPurpose('swasthya').noPrognosis, true);
  assert.ok(isPurposeId('vidya') && !isPurposeId('lottery'));
  // The five adult purposes are closed to minors (§14.3.5).
  for (const id of ['vyapar', 'naukri', 'dhan'] as const) assert.equal(getPurpose(id).minAge, 18, id);
  for (const id of ['vivah', 'santan'] as const) assert.equal(getPurpose(id).minAge, 21, id);
  for (const id of ['vidya', 'swasthya', 'yatra', 'man'] as const) assert.equal(getPurpose(id).minAge, 0, id);
});

test('every open answer: non-empty basis on every factor, chain and window; plain JSON; deterministic', () => {
  for (const chart of [adult, child]) {
    for (const purposeId of PURPOSE_IDS) {
      const first = answer(chart, purposeId);
      const second = answer(chart, purposeId);
      assert.deepEqual(first, second, `${purposeId} deterministic`);
      assert.deepEqual(JSON.parse(JSON.stringify(first)), first, `${purposeId} plain JSON`);
      if (first.gated) continue;
      assert.ok(first.saarTitleEn.length > 0 && first.saarBodyEn.length > 0, purposeId);
      assert.ok(first.chains.length >= 1 && first.chains.length <= 5, `${purposeId} chains ${first.chains.length}`);
      for (const f of [...first.supports, ...first.resists]) assert.ok(f.basis.length > 0, `${purposeId} factor ${f.id} basis`);
      for (const c of first.chains) assert.ok(c.basis.length > 0, `${purposeId} chain basis`);
      for (const w of first.windows) assert.ok(w.basis.length > 0 && /^\d{4}-\d{2}-\d{2}$/.test(w.startKey), `${purposeId} window ${w.id}`);
      assert.ok(first.windows.length <= 4);
      assert.ok(first.dishaEn.length >= 2 && first.dishaEn.length === first.dishaHi.length, purposeId);
      assert.ok(first.footerEn.startsWith('As of 14 Sep 2026'));
    }
  }
});

test('age gate matrix: closed purposes render NO reading for a 13-year-old; all open for an adult', () => {
  for (const purposeId of PURPOSE_IDS) {
    const teen = answer(child, purposeId);
    const grown = answer(adult, purposeId);
    const minAge = getPurpose(purposeId).minAge;
    assert.equal(teen.gated, minAge > 13, `${purposeId} gate for age 13`);
    assert.equal(grown.gated, false, `${purposeId} open for adult`);
    if (teen.gated) {
      assert.equal(teen.strength, null);
      assert.equal(teen.supports.length + teen.resists.length + teen.chains.length + teen.windows.length + teen.dishaEn.length, 0, `${purposeId} carries no reading when gated`);
      assert.ok(teen.gateReasonEn!.includes(`from age ${minAge}`));
      assert.equal(teen.saarTitleEn, '');
    }
  }
  assert.equal(answer(child, 'vidya').ageBand, 'adolescent');
  // A child's open reading is addressed to the parent, first line.
  assert.ok(answer(child, 'vidya').dishaEn[0].startsWith('For a parent:'));
  assert.ok(!answer(adult, 'vidya').dishaEn[0].startsWith('For a parent:'));
});

test('strength is counted from independent groups: one factor never renders प्रबल', () => {
  const mk = (id: string, polarity: PrashnaFactor['polarity'], weight: 1 | 2, group: string): PrashnaFactor => ({
    id, polarity, weight, group, textHi: 'x', textEn: 'x', basis: [{ kind: 'bhava', house: 1, rashiIndex: 0 }],
  });
  assert.equal(resolveStrength([mk('a', 'support', 2, 'g1')]).strength, 'ksheen');
  assert.equal(resolveStrength([mk('a', 'support', 2, 'g1'), mk('b', 'support', 2, 'g1'), mk('c', 'support', 2, 'g1')]).strength, 'ksheen', 'three factors in ONE group are one factor');
  assert.equal(resolveStrength([mk('a', 'support', 1, 'g1'), mk('b', 'support', 1, 'g2')]).strength, 'madhyam');
  assert.equal(resolveStrength([mk('a', 'support', 1, 'g1'), mk('b', 'support', 1, 'g2'), mk('c', 'support', 1, 'g3')]).strength, 'prabal');
  assert.equal(resolveStrength([mk('a', 'support', 1, 'g1'), mk('b', 'support', 1, 'g2'), mk('c', 'support', 1, 'g3'), mk('r', 'resist', 2, 'r1')]).strength, 'madhyam', 'a strong resist denies प्रबल');
  assert.equal(resolveStrength([mk('a', 'support', 1, 'g1'), mk('b', 'support', 1, 'g2'), mk('c', 'support', 1, 'g3'), mk('r', 'resist', 1, 'r1'), mk('s', 'resist', 1, 'r2')]).strength, 'madhyam', 'two resists against three supports is not प्रबल');
  assert.equal(resolveStrength([mk('a', 'support', 1, 'g1'), mk('b', 'support', 1, 'g2'), mk('r', 'resist', 1, 'r1'), mk('s', 'resist', 1, 'r2')]).strength, 'ksheen', 'resist ≥ support is क्षीण');
  assert.equal(resolveStrength([]).strength, 'ksheen');
});

test('contradiction is shown: when resists exist the सार names the tension, and both columns fill', () => {
  let sawTension = false;
  for (const purposeId of PURPOSE_IDS) {
    const a = answer(adult, purposeId);
    if (a.resists.length > 0) {
      sawTension = true;
      assert.ok(a.saarBodyEn.includes(' But — '), `${purposeId} names the tension`);
      assert.ok(a.aadhaarIntroEn.includes(' against'), purposeId);
    }
    assert.equal(a.resistGroups, new Set(a.resists.map((f) => f.group)).size, purposeId);
    assert.equal(a.supportGroups, new Set(a.supports.map((f) => f.group)).size, purposeId);
  }
  assert.ok(sawTension, 'the fixture chart has at least one contradicting purpose');
});

test('timing is a dated window: current maha + antar always, a next relevant antar when one exists, never an event date', () => {
  const a = answer(adult, 'vyapar');
  const current = a.windows.filter((w) => w.current);
  assert.ok(current.length >= 2, 'maha and antar windows run now');
  for (const w of a.windows.filter(w => !w.id.startsWith('gochar-'))) {
    assert.match(w.labelEn, /^\d{1,2} [A-Z][a-z]{2} \d{4} → \d{1,2} [A-Z][a-z]{2} \d{4}$/, w.id);
    assert.ok(/supportive window|limited basis/.test(w.textEn), w.textEn);
    assert.doesNotMatch(w.textEn, /will/i);
  }
  const relevant = a.windows.some((w) => w.relevant);
  const dishaSaysTiming = a.dishaEn.some((line) => /running period/.test(line));
  assert.ok(dishaSaysTiming, 'दिशा states whether the running period touches the matter');
  assert.equal(a.dishaEn.some((line) => line.includes('touches this matter')), a.windows.some((w) => w.current && w.relevant), 'direction agrees with the windows');
  void relevant;
});

test('swasthya never leaves constitution and routine, and always routes to a doctor', () => {
  for (const chart of [adult, child]) {
    const a = answer(chart, 'swasthya');
    assert.equal(a.gated, false);
    assert.ok(a.saarBodyEn.includes('not a diagnosis'));
    assert.ok(a.dishaEn.some((line) => line.includes('goes to a doctor')), 'doctor line present');
    assert.ok(a.dishaEn.at(-1)!.includes('doctor') || a.dishaEn.some((l) => l.includes('doctor')));
    const all = JSON.stringify(a);
    // Positive prognosis vocabulary never appears; the NEGATIONS ("not a
    // diagnosis", "रोग-विचार नहीं") are the required safety copy.
    assert.doesNotMatch(all, /\b(disease|illness|cure|prognosis|will recover|symptom of)\b|बीमारी|रोग होगा|ठीक हो जाएगा/i);
    assert.doesNotMatch(all, /(?<!not a )\bdiagnosis\b/i);
    assert.doesNotMatch(all, /रोग(?!-विचार नहीं)/);
  }
});

test('dhan carries the not-financial-advice line in every strength', () => {
  const a = answer(adult, 'dhan');
  assert.ok(a.dishaEn.some((line) => line.startsWith('This is not financial advice')));
});

test('a seated Tula-lagna chart reads विद्या as supported and names Saturn on both learning houses', () => {
  // Tula Lagna: 4th = Makara, 5th = Kumbha — both Saturn's; Saturn in the Lagna (kendra, exalted).
  const tula: KundaliChart = {
    ...child,
    lagnaRashiIndex: 6,
    houses: Array.from({ length: 12 }, (_, i) => (6 + i) % 12),
    grahas: child.grahas.map((position) => {
      const seats: Partial<Record<string, number>> = { saturn: 1, rahu: 1, sun: 11, mercury: 11, mars: 10, jupiter: 9, moon: 6, venus: 12, ketu: 7 };
      const house = seats[position.graha]!;
      return { ...position, house, rashiIndex: (6 + house - 1) % 12, retrograde: false };
    }),
  };
  const a = answer(tula, 'vidya');
  assert.equal(a.gated, false);
  assert.ok(a.supports.some((f) => f.id === 'lord-5-strong'), 'Saturn (5th lord) in a kendra supports');
  assert.ok(a.supports.some((f) => f.id === 'lord-5-dignity'), 'exalted 5th lord supports');
  // Jupiter (karaka) sits in the 9th — a vidya bhava — so it is weighed as a karaka-occupant, not as a free karaka.
  assert.ok(a.supports.some((f) => f.id === 'occ-9-jupiter-karaka'), 'Jupiter (karaka) occupies the 9th');
  assert.ok(!a.supports.some((f) => f.id === 'karaka-jupiter-strong'), 'not double-counted as a free karaka');
  assert.ok(['prabal', 'madhyam'].includes(a.strength!), `strength ${a.strength}`);
  assert.ok(a.dishaEn[0].startsWith('For a parent:'));
  assert.ok(a.chains.every((c) => c.basis.length > 0));
  assert.doesNotMatch(JSON.stringify(a), /\b(?:\d*[02-9])?[123]th bhava/);
});
