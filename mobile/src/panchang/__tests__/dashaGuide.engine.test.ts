import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

import { DAAN_VAAR_ENTRIES } from '../../data/daan/vaar';
import { buildDashaGuide, dashaGuideOffered, formatDashaSpan, GUIDE_PURPOSE_MIN_AGE } from '../dashaGuide';
import { DASHA_GUIDE_COPY, DASHA_LORD_LESSONS } from '../dashaGuideContent';
import { buildDashaPractice } from '../dashaPractice';
import { DASHA_LORD_KEYWORDS_EN, DASHA_LORD_KEYWORDS_HI } from '../dashaReading';
import { buildGrahaReadings } from '../grahaReading';
import { GRAHA_UPAY } from '../grahaReadingContent';
import { narrativeCell } from '../grahaReadingNarrative';
import { computeKundali, DASHA_ORDER, getCurrentDasha, type KundaliChart } from '../kundali';
import { PRASHNA_PURPOSES } from '../prashnaPurposes';

const YEAR = 365.2425 * 86_400_000;
const chart = computeKundali({
  date: new Date('1992-08-14T00:12:00Z'),
  latitude: 23.1765,
  longitude: 75.7885,
  timezone: 'Asia/Kolkata',
});
const AT = new Date('2026-11-19T06:30:00Z');

/** Twelve births through one day — every Lagna, so every lord lands in many houses. */
const SWEEP: readonly KundaliChart[] = Array.from({ length: 12 }, (_, index) =>
  computeKundali({
    date: new Date(Date.UTC(1990, 4, 3, index * 2, 7)),
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
  })
);

test('dasha guide engine stays pure and has no wall-clock fallback', () => {
  for (const file of ['src/panchang/dashaGuide.ts', 'src/panchang/dashaGuideContent.ts']) {
    const source = readFileSync(file, 'utf8');
    assert.doesNotMatch(source, /react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/, file);
  }
});

test('offered only to an adult, and only for the running or an upcoming Mahadasha', () => {
  const birth = chart.input.date.getTime();
  for (const period of chart.vimshottari) {
    const ended = period.end.getTime() <= AT.getTime();
    assert.equal(dashaGuideOffered(chart, period, AT), !ended, period.lord);
    assert.equal(buildDashaGuide(chart, period.lord, AT) === null, ended, period.lord);
  }
  const running = chart.vimshottari.find((period) => period.start.getTime() <= birth + 10 * YEAR && period.end.getTime() > birth + 10 * YEAR)!;
  assert.equal(buildDashaGuide(chart, running.lord, new Date(birth + 10 * YEAR)), null, 'child');
  assert.equal(buildDashaGuide(chart, running.lord, new Date(birth + 16 * YEAR)) === null, true, 'adolescent');
});

test('the running period is "current" with progress; later ones are "upcoming" with a start', () => {
  const current = getCurrentDasha(chart, AT)!;
  for (const period of chart.vimshottari) {
    const guide = buildDashaGuide(chart, period.lord, AT);
    if (!guide) continue;
    const isCurrent = period === current.maha;
    assert.equal(guide.status, isCurrent ? 'current' : 'upcoming', period.lord);
    assert.equal(guide.progress !== null, isCurrent);
    assert.equal(guide.begins !== null, !isCurrent);
    assert.equal(guide.antars.length, isCurrent ? 9 : 0);
    if (isCurrent) assert.equal(guide.antars.filter((antar) => antar.isNow).length, 1);
    assert.equal(guide.cycle.length, 9);
    assert.equal(guide.cycle.filter((turn) => turn.isThis).length, 1);
    assert.equal(guide.cycle.find((turn) => turn.isThis)!.lord, period.lord);
    assert.equal(guide.cycle.filter((turn) => turn.isNow).length, 1);
    assert.equal(guide.cycle.reduce((sum, turn) => sum + turn.years, 0), 120);
  }
});

test('the practice on the guide is the lord’s GRAHA_UPAY row, through buildDashaPractice', () => {
  for (const sample of [chart, ...SWEEP]) {
    for (const period of sample.vimshottari) {
      const guide = buildDashaGuide(sample, period.lord, AT);
      if (!guide) continue;
      assert.deepEqual(guide.upay, buildDashaPractice(sample, period, AT)!.upay);
      const row = GRAHA_UPAY[period.lord];
      assert.equal(guide.weekday, row.weekday);
      // Every daan chip and seva bullet is a piece of the table's own line.
      for (const item of guide.daanItems.en) assert.ok(row.daanEn.includes(item), `${period.lord} daan ${item}`);
      for (const item of guide.daanItems.hi) assert.ok(row.daanHi.includes(item), `${period.lord} daan ${item}`);
      for (const item of guide.sevaItems.en) assert.ok(row.sevaEn.toLowerCase().includes(item.toLowerCase()), `${period.lord} seva ${item}`);
      for (const item of guide.sevaItems.hi) assert.ok(row.sevaHi.includes(item), `${period.lord} seva ${item}`);
      // The causes are the vaar table's own, never invented.
      const vaar = DAAN_VAAR_ENTRIES.find((entry) => entry.weekday === row.weekday)!;
      assert.deepEqual(guide.daanCauses.map((cause) => cause.id), [...(vaar.causes ?? [])]);
    }
  }
});

test('the chart step reads THIS chart through the reviewed card and narrative cell', () => {
  for (const sample of [chart, ...SWEEP]) {
    const cards = buildGrahaReadings(sample);
    for (const period of sample.vimshottari) {
      const guide = buildDashaGuide(sample, period.lord, AT);
      if (!guide) continue;
      const card = cards.find((entry) => entry.graha === period.lord)!;
      assert.equal(guide.house, card.house);
      assert.ok(guide.reading.en.length >= 1 && guide.reading.hi.length >= 1, period.lord);
      assert.equal(guide.reading.en.join(' '), card.narrative!.leadEn);
      assert.equal(guide.reading.hi.join(' '), card.narrative!.leadHi);
      const node = card.basis.find((entry) => entry.kind === 'graha') as unknown as {
        dignity: Parameters<typeof narrativeCell>[2];
        signRelation?: 'friend' | 'enemy';
      };
      const cell = narrativeCell(period.lord, card.house, node.dignity, node.signRelation ?? null)!;
      assert.equal(guide.chartQuestion.quote.en, cell.leadEn);
      assert.equal(guide.chartQuestion.quote.hi, cell.leadHi);
      assert.ok(card.narrative!.leadEn.startsWith(cell.leadEn), 'the cell leads the composed narrative');
      assert.ok(guide.basis.some((entry) => entry.kind === 'dasha'), 'dasha basis');
      assert.ok(guide.basis.some((entry) => entry.kind === 'graha'), 'graha basis');
    }
  }
});

test('the Prashna door opens only a primary-bhava purpose the subject is old enough for', () => {
  const protectedIds = new Set(['swasthya', 'man', 'santan']);
  for (const [id, minAge] of Object.entries(GUIDE_PURPOSE_MIN_AGE)) {
    const purpose = PRASHNA_PURPOSES.find((entry) => entry.id === id)!;
    assert.equal(minAge, purpose.minAge, `${id} min age mirrors PRASHNA_PURPOSES`);
    assert.ok(!protectedIds.has(id), `${id} is not a safety-limited topic`);
  }
  for (const sample of SWEEP) {
    for (const period of sample.vimshottari) {
      const guide = buildDashaGuide(sample, period.lord, AT);
      const purposeId = guide?.chartQuestion.prashnaPurpose;
      if (!guide || !purposeId) continue;
      const purpose = PRASHNA_PURPOSES.find((entry) => entry.id === purposeId)!;
      assert.equal(purpose.bhavas[0], guide.house, `${purposeId} is primary for house ${guide.house}`);
    }
  }
  // A 19-year-old's 7th-house period opens no marriage reading (vivah is 21+).
  const young = SWEEP.find((sample) => buildGrahaReadings(sample).some((card) => card.house === 7));
  if (young) {
    const card = buildGrahaReadings(young).find((entry) => entry.house === 7)!;
    const lord = card.graha as (typeof DASHA_ORDER)[number];
    const at19 = new Date(young.input.date.getTime() + 19.5 * YEAR);
    const guide = buildDashaGuide(young, lord, at19);
    if (guide) assert.equal(guide.chartQuestion.prashnaPurpose, null);
  }
});

test('lessons: three plain lines per lord, aligned with the reviewed keywords', () => {
  for (const lord of DASHA_ORDER) {
    assert.equal(DASHA_LORD_KEYWORDS_HI[lord].split(', ').length, 3, lord);
    assert.equal(DASHA_LORD_KEYWORDS_EN[lord].split(', ').length, 3, lord);
    assert.equal(DASHA_LORD_LESSONS[lord].length, 3, lord);
    for (const line of DASHA_LORD_LESSONS[lord]) {
      assert.ok(line.hi.endsWith('।'), `${lord} hi ends with a danda`);
      assert.ok(line.en.endsWith('.'), `${lord} en ends with a full stop`);
      assert.ok(line.hi.length <= 70 && line.en.length <= 70, `${lord} lesson stays one short line`);
    }
  }
  for (const value of Object.values(DASHA_GUIDE_COPY)) assert.ok(value.hi.length > 0 && value.en.length > 0);
});

test('§14.3.7 scans: no absolute claims, fatality, fear, medical directive or commerce in guide copy', () => {
  const banned = [
    /will happen/i, /guaranteed?\b(?! —| or)/i, /certainly/i, /अवश्य होगा/, /निश्चित रूप से/,
    /lifespan/i, /\bdeath\b/i, /मृत्यु/, /आयु भर/,
    /दुर्भाग्य/, /संकट/, /खतरा/, /\bdoom\b/i, /misfortune/i, /\bdanger\b/i, /\bcurse\b/i,
    /\bcure/i, /\bheal/i, /\bdiagnos/i, /\binvest\b/i,
    /gemstone/i, /रत्न/, /consult an astrologer/i, /उपाय खरीदें/, /\bdosha\b/i, /दोष/,
  ];
  for (const file of ['src/panchang/dashaGuide.ts', 'src/panchang/dashaGuideContent.ts']) {
    const source = readFileSync(file, 'utf8');
    for (const pattern of banned) assert.doesNotMatch(source, pattern, `${file}: ${pattern}`);
  }
});

test('formatDashaSpan is the Dasha tab’s span format', () => {
  const month = YEAR / 12;
  assert.equal(formatDashaSpan(14 * YEAR + 9 * month + 1000), '14 y 9 m');
  assert.equal(formatDashaSpan(2 * YEAR), '2 y');
  assert.equal(formatDashaSpan(5 * month), '5 m');
  assert.equal(formatDashaSpan(20 * 86_400_000), '20 d');
  assert.equal(formatDashaSpan(1 * month + 1, true), '2 m');
  assert.equal(formatDashaSpan(-5), '0 d');
});

test('every lord in every house of the sweep composes complete bilingual copy', () => {
  for (const sample of SWEEP) {
    for (const period of sample.vimshottari) {
      const guide = buildDashaGuide(sample, period.lord, AT);
      if (!guide) continue;
      const texts = [
        guide.title, guide.turn, guide.meaning, guide.nature, guide.theme, guide.lessonsTitle, guide.houseHelp,
        guide.houseTile.value, guide.houseTile.sub, guide.signTile.value, guide.signTile.sub, guide.tend,
        guide.dayHelp, guide.malaHelp, guide.note, guide.chartQuestion.q, guide.chartQuestion.a,
        guide.chartQuestion.quote, guide.chartQuestion.caveat, ...guide.why.flatMap((item) => [item.q, item.a]),
        ...guide.lessons.flatMap((lesson) => [lesson.word, lesson.plain]),
      ];
      for (const text of texts) {
        assert.ok(text.hi.trim().length > 0, `${period.lord} hi empty`);
        assert.ok(text.en.trim().length > 0, `${period.lord} en empty`);
        assert.doesNotMatch(text.en, /undefined|NaN|\$\{/, `${period.lord}: ${text.en}`);
        assert.doesNotMatch(text.hi, /undefined|NaN|\$\{/, `${period.lord}: ${text.hi}`);
      }
      assert.equal(guide.why.length, 4);
      assert.ok(guide.daanItems.en.length >= 1 && guide.sevaItems.en.length >= 1);
    }
  }
});
