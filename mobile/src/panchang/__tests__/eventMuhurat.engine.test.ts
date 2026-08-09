import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computePanchangForDate } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import {
  EVENT_RULES,
  getEventRule,
  isChaturmasDay,
  computeAstaFlags,
  auspiciousWindows,
  evaluateDay,
  summarize,
  type DayVerdict,
} from '../eventMuhurat';
import { ABUJH_RULE_IDS, pushyaYogaFor } from '../abujhMuhurat';
import { FESTIVAL_RULES, EKADASHI_RULES, MONTHLY_VRAT_RULES, ADVANCED_OBSERVANCE_RULES } from '../festivals';

// All fixtures are Ujjain (the engine default), same convention as the other
// engine suites. Boundary dates below were externally validated against
// published muhurat lists / Chaturmas dates in Aug 2026 (PRD-16 §"External
// validation"): Devshayani Ekadashi 25 Jul 2026, Dev Uthani resolving through
// a KSHAYA Kartik Shukla Ekadashi (touches no sunrise; sunrise tithi jumps
// Dashami 20 Nov → Dwadashi 21 Nov).

function day(y: number, m1: number, d: number): Date {
  return new Date(y, m1 - 1, d);
}

function verdictFor(ruleId: Parameters<typeof getEventRule>[0], d: Date): DayVerdict {
  const p = computePanchangForDate(d);
  const next = computePanchangForDate(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
  const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
  return evaluateDay(getEventRule(ruleId), d.getTime(), d.getDay(), p, m, computeAstaFlags(noon));
}

test('chaturmas span: Devshayani 25 Jul 2026 through the kshaya Dev Uthani boundary', () => {
  const expectations: Array<[Date, boolean]> = [
    [day(2026, 7, 24), false], // Ashadha Shukla Dashami — eve of Devshayani
    [day(2026, 7, 25), true], // Devshayani Ekadashi
    [day(2026, 9, 15), true], // deep inside (Bhadrapada)
    [day(2026, 11, 19), true], // Kartik Shukla Navami
    [day(2026, 11, 20), true], // sunrise Dashami; Ekadashi is kshaya this day
    [day(2026, 11, 21), false], // sunrise Dwadashi — the bar has lifted
    [day(2026, 11, 26), false],
  ];
  for (const [d, expected] of expectations) {
    assert.equal(isChaturmasDay(computePanchangForDate(d)), expected, d.toDateString());
  }
});

test('chaturmas is calendar-system invariant (amanta month names must not move the season)', () => {
  for (const d of [day(2026, 10, 26), day(2026, 11, 26), day(2026, 8, 8)]) {
    const purnimant = computePanchangForDate(d, { calendarSystem: 'purnimant' });
    const amanta = computePanchangForDate(d, { calendarSystem: 'amanta' });
    assert.equal(isChaturmasDay(amanta), isChaturmasDay(purnimant), d.toDateString());
  }
});

test('asta flags match the validated 2026 combustion windows', () => {
  const at = (y: number, m1: number, d: number) => new Date(y, m1 - 1, d, 12);
  assert.equal(computeAstaFlags(at(2026, 7, 20)).guruAsta, true); // Guru asta 15 Jul – 13 Aug
  assert.equal(computeAstaFlags(at(2026, 8, 20)).guruAsta, false);
  assert.equal(computeAstaFlags(at(2026, 10, 24)).shukraAsta, true); // inferior conjunction day
  assert.equal(computeAstaFlags(at(2026, 11, 5)).shukraAsta, false);
  const clear = computeAstaFlags(at(2026, 8, 17));
  assert.equal(clear.guruAsta, false);
  assert.equal(clear.shukraAsta, false);
});

test('17 Aug 2026 is a shreshtha Vehicle Purchase day with kaal-free windows', () => {
  const v = verdictFor('vahan', day(2026, 8, 17));
  assert.equal(v.tier, 'shreshtha');
  assert.deepEqual(v.factors, { nakshatra: true, tithi: true, vara: true });
  assert.ok(v.windows.length >= 3);
  // No usable window may share a slot with Rahu/Gulika/Yamaganda.
  const p = computePanchangForDate(day(2026, 8, 17));
  const next = computePanchangForDate(day(2026, 8, 18));
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, 1);
  const kaalStarts = new Set([m.rahu.start.getTime(), m.gulika.start.getTime(), m.yamaganda.start.getTime()]);
  for (const w of v.windows.filter((x) => x.kind === 'choghadiya')) {
    assert.ok(!kaalStarts.has(w.start.getTime()), `${w.nameEn} overlaps a kaal slot`);
  }
});

test('8 Aug 2026 (Vishti at sunrise) is excluded for every occasion carrying the bhadra dosha', () => {
  const v = verdictFor('vahan', day(2026, 8, 8));
  assert.equal(v.tier, 'excluded');
  assert.ok(v.doshas.includes('bhadra'));
  assert.equal(v.windows.length, 0);
});

test('26 Nov 2026 is the validated first shreshtha Griha Pravesh day after Chaturmas', () => {
  const v = verdictFor('griha-pravesh', day(2026, 11, 26));
  assert.equal(v.tier, 'shreshtha');
  assert.deepEqual(v.doshas, []);
  assert.ok(v.windows.length > 0);
});

test('90-day Griha Pravesh scan from 7 Aug 2026 yields zero results, dominated by Chaturmas', () => {
  const rule = getEventRule('griha-pravesh');
  const verdicts: DayVerdict[] = [];
  let p = computePanchangForDate(day(2026, 8, 7));
  for (let i = 0; i < 90; i += 1) {
    const d = new Date(2026, 7, 7 + i);
    const next = computePanchangForDate(new Date(2026, 7, 8 + i));
    const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, d.getDay());
    const noon = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
    verdicts.push(evaluateDay(rule, d.getTime(), d.getDay(), p, m, computeAstaFlags(noon)));
    p = next; // one panchang solve per day — the same reuse the finder hook does
  }
  const s = summarize(verdicts);
  assert.equal(s.shreshtha.length, 0);
  assert.equal(s.madhyam.length, 0);
  assert.ok((s.doshaDays.chaturmas ?? 0) >= 80, `chaturmas days: ${s.doshaDays.chaturmas}`);
  assert.ok((s.doshaDays['guru-asta'] ?? 0) >= 5); // 7–13 Aug tail of the combustion
});

test('auspicious windows are best-first: Amrit, then Abhijit', () => {
  const p = computePanchangForDate(day(2026, 8, 17));
  const next = computePanchangForDate(day(2026, 8, 18));
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, 1);
  const w = auspiciousWindows(m);
  assert.equal(w[0].nameEn, 'Amrit');
  // 17 Aug carries TWO Amrit windows (morning + evening); Abhijit follows the
  // Amrit group but precedes every Shubh/Char window.
  const abhijitAt = w.findIndex((x) => x.kind === 'abhijit');
  const firstLower = w.findIndex((x) => x.nameEn === 'Shubh' || x.nameEn === 'Char' || x.nameEn === 'Labh');
  assert.ok(abhijitAt > 0 && abhijitAt < firstLower, `abhijit=${abhijitAt} firstLower=${firstLower}`);
});

test('every abujh rule id resolves to a shipped observance rule', () => {
  const shipped = new Set(
    [...FESTIVAL_RULES, ...EKADASHI_RULES, ...MONTHLY_VRAT_RULES, ...ADVANCED_OBSERVANCE_RULES].map((r) => r.id)
  );
  for (const id of ABUJH_RULE_IDS) assert.ok(shipped.has(id), `missing observance rule: ${id}`);
});

test('Pushya yoga days: Ravi Pushya on 1 Nov 2026, none on adjacent days', () => {
  const nov1 = day(2026, 11, 1);
  const yoga = pushyaYogaFor(computePanchangForDate(nov1), nov1.getDay());
  assert.equal(yoga?.kind, 'ravi-pushya');
  const nov2 = day(2026, 11, 2);
  assert.equal(pushyaYogaFor(computePanchangForDate(nov2), nov2.getDay()), null);
});

test('every rule table is explicitly marked draft until §10 review lands (RULEBOOK §14)', () => {
  for (const r of EVENT_RULES) {
    assert.equal(r.source.verified, false, `${r.id} must not claim verification before §10 review`);
    assert.ok(r.source.referenceUrls.length >= 1);
  }
});

test('finder sources stay pure: no wall clock, randomness, network, storage, or React', () => {
  for (const rel of ['../eventMuhurat.ts', '../abujhMuhurat.ts']) {
    const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), rel), 'utf8');
    assert.doesNotMatch(source, /Date\.now\s*\(/);
    assert.doesNotMatch(source, /Math\.random\s*\(/);
    assert.doesNotMatch(source, /\bfetch\s*\(/);
    assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
  }
});
