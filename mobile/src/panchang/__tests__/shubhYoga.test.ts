/**
 * शुभ योग engine (PRD-27, RULEBOOK §23): the five v1 tables row-for-row against
 * docs/roadmap/conventions/shubh-yoga-v1.md, the window mechanics (segment
 * cuts, kshaya insertion, merge, the next-sunrise bound), the annotate-only
 * dependency guard, and a full-2026 Ujjain sweep of structural invariants.
 *
 * The expected tables below are TRANSCRIBED from the convention doc (the
 * calculation contract), not from engine output — change the doc and the code
 * together, with a new convention id.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { computePanchangForDate } from '../engine';
import { angaAt } from '../eventMuhurat';
import { getSiderealPlanetLongitude, NAKSHATRA_SPAN } from '../kundali';
import {
  AMRITA_SIDDHI_BY_VARA,
  DWIPUSHKAR_NAKSHATRAS,
  PUSHKAR_VARAS,
  RAVI_YOGA_COUNTS,
  SARVARTHA_SIDDHI_BY_VARA,
  SHUBH_YOGA_LABELS,
  SHUBH_YOGA_ORDER,
  SHUBH_YOGA_SOURCE,
  TRIPUSHKAR_NAKSHATRAS,
  computeShubhYogas,
  isPushkarTithi,
  sunToMoonCount,
  type ShubhYogaKey,
  type ShubhYogaWindow,
} from '../shubhYoga';
import type { PanchangData, PanchangElement } from '../types';

// ── shubh-yoga-v1.md tables, verbatim (0-based indexes) ─────────────────────

const DOC_SARVARTHA: readonly (readonly number[])[] = [
  [0, 7, 11, 12, 18, 20, 25], // Sun
  [3, 4, 7, 16, 21], // Mon
  [0, 2, 8, 25], // Tue
  [2, 3, 4, 12, 16], // Wed
  [0, 6, 7, 16, 26], // Thu
  [0, 6, 16, 21, 26], // Fri
  [3, 14, 21], // Sat
];
const DOC_AMRITA: readonly number[] = [12, 4, 0, 16, 7, 26, 3];
const DOC_RAVI_COUNTS = [4, 6, 9, 10, 13, 20];
const DOC_DWIPUSHKAR = [4, 13, 22];
const DOC_TRIPUSHKAR = [2, 6, 11, 15, 20, 24];

test('सर्वार्थ सिद्धि and अमृत सिद्धि tables match shubh-yoga-v1.md row-for-row', () => {
  assert.deepEqual(
    SARVARTHA_SIDDHI_BY_VARA.map((row) => [...row]),
    DOC_SARVARTHA.map((row) => [...row])
  );
  assert.deepEqual([...AMRITA_SIDDHI_BY_VARA], [...DOC_AMRITA]);
});

test('every अमृत सिद्धि pair is also a सर्वार्थ सिद्धि row (doc invariant)', () => {
  for (let vara = 0; vara < 7; vara += 1) {
    assert.ok(
      SARVARTHA_SIDDHI_BY_VARA[vara].includes(AMRITA_SIDDHI_BY_VARA[vara]),
      `vara ${vara}`
    );
  }
});

test('रवि योग counts and the पुष्कर factor sets match the doc', () => {
  assert.deepEqual([...RAVI_YOGA_COUNTS].sort((a, b) => a - b), DOC_RAVI_COUNTS);
  assert.deepEqual([...DWIPUSHKAR_NAKSHATRAS].sort((a, b) => a - b), DOC_DWIPUSHKAR);
  assert.deepEqual([...TRIPUSHKAR_NAKSHATRAS].sort((a, b) => a - b), DOC_TRIPUSHKAR);
  assert.deepEqual([...PUSHKAR_VARAS].sort((a, b) => a - b), [0, 2, 6]);
  const pushkarTithis = Array.from({ length: 30 }, (_, i) => i).filter(isPushkarTithi);
  assert.deepEqual(pushkarTithis, [1, 6, 11, 16, 21, 26]); // द्वितीया/सप्तमी/द्वादशी, both pakshas
});

test('sunToMoonCount is the inclusive 27-cycle count, wrap included', () => {
  assert.equal(sunToMoonCount(0, 0), 1); // same nakshatra counts as 1
  assert.equal(sunToMoonCount(0, 3), 4);
  assert.equal(sunToMoonCount(25, 1), 4); // wraps 25→26→0→1
  assert.equal(sunToMoonCount(3, 2), 27);
});

test('labels: every yoga name ends in योग / Yoga (the naming-collision rule, RULEBOOK §23)', () => {
  for (const key of SHUBH_YOGA_ORDER) {
    assert.ok(SHUBH_YOGA_LABELS[key].hi.endsWith(' योग'), key);
    assert.ok(SHUBH_YOGA_LABELS[key].en.endsWith(' Yoga'), key);
  }
});

test('tables are explicitly draft until the §10 review lands (release gate)', () => {
  assert.equal(SHUBH_YOGA_SOURCE.verified, false);
  assert.ok(SHUBH_YOGA_SOURCE.referenceUrls.length >= 2);
});

// ── window mechanics on synthetic days ───────────────────────────────────────

function el(index: number, endTime: Date | null): PanchangElement {
  return { index, nameHi: `n${index}`, nameEn: `n${index}`, endTime };
}

/** Minimal-but-complete PanchangData for the fields computeShubhYogas reads. */
function syntheticDay(opts: {
  sunrise: Date;
  varaIndex: number;
  tithi: PanchangElement;
  nakshatra: PanchangElement;
  kshayaTithi?: PanchangElement | null;
  kshayaNakshatra?: PanchangElement | null;
}): PanchangData {
  return {
    date: opts.sunrise,
    calendarSystem: 'purnimant',
    vara: { index: opts.varaIndex, nameHi: '', nameEn: '' },
    tithi: { ...opts.tithi, paksha: 'shukla' },
    kshayaTithi: opts.kshayaTithi ? { ...opts.kshayaTithi, paksha: 'shukla' } : null,
    kshayaNakshatra: opts.kshayaNakshatra ?? null,
    nakshatra: opts.nakshatra,
    yoga: el(0, null),
    karana: el(0, null),
    lateVishti: null,
    sunrise: opts.sunrise,
    sunset: new Date(opts.sunrise.getTime() + 12 * 3_600_000),
    moonrise: null,
    brahmaMuhurta: { start: opts.sunrise, end: opts.sunrise },
    vikramSamvat: 2083,
    lunarMonth: { nameHi: '', nameEn: '', index: 1, isAdhik: false },
  };
}

const at = (base: Date, hours: number) => new Date(base.getTime() + hours * 3_600_000);
const only = (windows: ShubhYogaWindow[], key: ShubhYogaKey) => windows.filter((w) => w.key === key);

test('a sunrise-nakshatra match runs sunrise → nakshatra end, fromSunrise set', () => {
  const sunrise = new Date(2026, 9, 14, 6, 30);
  const nextSunrise = at(sunrise, 24);
  const nakEnd = at(sunrise, 20); // ends 2:30 AM next civil day
  const p = syntheticDay({
    sunrise,
    varaIndex: 3, // बुधवार
    tithi: el(4, null),
    nakshatra: el(12, nakEnd), // हस्त — a Wednesday सर्वार्थ row; successor चित्रा is not
  });
  const w = only(computeShubhYogas(p, nextSunrise), 'sarvartha-siddhi');
  assert.equal(w.length, 1);
  assert.equal(w[0].start.getTime(), sunrise.getTime());
  assert.equal(w[0].end.getTime(), nakEnd.getTime());
  assert.equal(w[0].fromSunrise, true);
});

test('a mid-day onset starts at the changeover, and a table nakshatra outlasting the day is bounded at next sunrise', () => {
  const sunrise = new Date(2026, 9, 14, 6, 30);
  const nextSunrise = at(sunrise, 24);
  const changeover = at(sunrise, 9);
  const p = syntheticDay({
    sunrise,
    varaIndex: 3, // बुधवार
    tithi: el(4, null),
    nakshatra: el(5, changeover), // आर्द्रा → पुनर्वसु — neither is a Wednesday row
  });
  const p2 = syntheticDay({
    sunrise,
    varaIndex: 3,
    tithi: el(4, null),
    nakshatra: el(1, changeover), // भरणी → कृत्तिका (2) after the changeover, in the Wednesday row
  });
  assert.equal(only(computeShubhYogas(p, nextSunrise), 'sarvartha-siddhi').length, 0);
  const w = only(computeShubhYogas(p2, nextSunrise), 'sarvartha-siddhi');
  assert.equal(w.length, 1);
  assert.equal(w[0].start.getTime(), changeover.getTime());
  assert.equal(w[0].end.getTime(), nextSunrise.getTime()); // never crosses the vāra boundary
  assert.equal(w[0].fromSunrise, false);
});

test('kshaya nakshatra inserts its own segment (never index+1 across a kshaya)', () => {
  const sunrise = new Date(2026, 0, 29, 7, 0);
  const nextSunrise = at(sunrise, 24);
  const mainEnd = at(sunrise, 8);
  const kshayaEnd = at(sunrise, 22.5); // ends before next sunrise
  const p = syntheticDay({
    sunrise,
    varaIndex: 1, // सोमवार
    tithi: el(9, null),
    nakshatra: el(2, mainEnd), // कृत्तिका at sunrise (not a Monday row)
    kshayaNakshatra: el(3, kshayaEnd), // kshaya रोहिणी — a Monday row AND the Monday...
  });
  // रोहिणी (3) and its successor मृगशिरा (4) are BOTH Monday सर्वार्थ rows, so
  // the window opens at the kshaya's start and merges through to next sunrise.
  const yogas = computeShubhYogas(p, nextSunrise);
  const sarvartha = only(yogas, 'sarvartha-siddhi');
  assert.equal(sarvartha.length, 1);
  assert.equal(sarvartha[0].start.getTime(), mainEnd.getTime());
  assert.equal(sarvartha[0].end.getTime(), nextSunrise.getTime());
  assert.equal(sarvartha[0].fromSunrise, false);
  // After the kshaya ends, the successor is kshaya.index + 1 = मृगशिरा (4) —
  // Monday's अमृत सिद्धि nakshatra — so the tail segment carries BOTH names.
  const amrita = only(yogas, 'amrita-siddhi');
  assert.equal(amrita.length, 1);
  assert.equal(amrita[0].start.getTime(), kshayaEnd.getTime());
  assert.equal(amrita[0].end.getTime(), nextSunrise.getTime());
});

test('adjacent table nakshatras merge into one continuous window', () => {
  const sunrise = new Date(2026, 9, 14, 6, 30);
  const nextSunrise = at(sunrise, 24);
  const changeover = at(sunrise, 10);
  const p = syntheticDay({
    sunrise,
    varaIndex: 3, // बुधवार: rows 2,3,4 are consecutive nakshatras
    tithi: el(4, null),
    nakshatra: el(2, changeover), // कृत्तिका → रोहिणी at the changeover; both in the row
  });
  const w = only(computeShubhYogas(p, nextSunrise), 'sarvartha-siddhi');
  assert.equal(w.length, 1, 'contiguous segments must merge');
  assert.equal(w[0].start.getTime(), sunrise.getTime());
  assert.equal(w[0].end.getTime(), nextSunrise.getTime());
});

test('पुष्कर needs all three factors, and the window also ends when the TITHI leaves the भद्रा set', () => {
  const sunrise = new Date(2026, 9, 14, 6, 30);
  const nextSunrise = at(sunrise, 24);
  const tithiEnd = at(sunrise, 7);
  const base = {
    sunrise,
    tithi: el(6, tithiEnd), // सप्तमी, ends mid-day → अष्टमी
    nakshatra: el(13, null), // चित्रा all day — द्विपुष्कर nakshatra
  };
  const onPushkarVara = syntheticDay({ ...base, varaIndex: 6 }); // शनिवार
  const offVara = syntheticDay({ ...base, varaIndex: 1 }); // सोमवार
  const dwi = only(computeShubhYogas(onPushkarVara, nextSunrise), 'dwipushkar');
  assert.equal(dwi.length, 1);
  assert.equal(dwi[0].start.getTime(), sunrise.getTime());
  assert.equal(dwi[0].end.getTime(), tithiEnd.getTime(), 'ends when the tithi factor lapses');
  assert.equal(only(computeShubhYogas(offVara, nextSunrise), 'dwipushkar').length, 0);
  // त्रिपुष्कर and द्विपुष्कर sets are disjoint, so चित्रा never doubles as त्रिपुष्कर.
  assert.equal(only(computeShubhYogas(onPushkarVara, nextSunrise), 'tripushkar').length, 0);
});

test('degenerate spans return no windows', () => {
  const sunrise = new Date(2026, 9, 14, 6, 30);
  const p = syntheticDay({ sunrise, varaIndex: 3, tithi: el(4, null), nakshatra: el(3, null) });
  assert.deepEqual(computeShubhYogas(p, sunrise), []);
  assert.deepEqual(computeShubhYogas(p, at(sunrise, -1)), []);
});

// ── full-2026 Ujjain sweep: structural invariants over real engine days ─────

test('2026 sweep: every window sits inside its vāra-day and matches its table at the window start', () => {
  const found: Record<ShubhYogaKey, number> = {
    'amrita-siddhi': 0,
    'sarvartha-siddhi': 0,
    tripushkar: 0,
    dwipushkar: 0,
    ravi: 0,
  };
  for (let d = new Date(2026, 0, 1); d.getFullYear() === 2026; d = new Date(2026, d.getMonth(), d.getDate() + 1)) {
    const p = computePanchangForDate(d);
    const next = computePanchangForDate(new Date(2026, d.getMonth(), d.getDate() + 1));
    const yogas = computeShubhYogas(p, next.sunrise);
    for (const w of yogas) {
      found[w.key] += 1;
      assert.ok(w.start.getTime() >= p.sunrise.getTime(), `${d.toDateString()} start before sunrise`);
      assert.ok(w.end.getTime() <= next.sunrise.getTime(), `${d.toDateString()} end past next sunrise`);
      assert.ok(w.end.getTime() > w.start.getTime(), `${d.toDateString()} inverted window`);
      assert.equal(w.fromSunrise, w.start.getTime() === p.sunrise.getTime());
      const nak = angaAt(p.nakshatra, p.kshayaNakshatra, w.start, 27);
      const tithi = angaAt(p.tithi, p.kshayaTithi, w.start, 30);
      const vara = p.vara.index;
      if (w.key === 'sarvartha-siddhi') assert.ok(SARVARTHA_SIDDHI_BY_VARA[vara].includes(nak));
      if (w.key === 'amrita-siddhi') assert.equal(AMRITA_SIDDHI_BY_VARA[vara], nak);
      if (w.key === 'dwipushkar' || w.key === 'tripushkar') {
        assert.ok(isPushkarTithi(tithi) && PUSHKAR_VARAS.has(vara));
        assert.ok((w.key === 'dwipushkar' ? DWIPUSHKAR_NAKSHATRAS : TRIPUSHKAR_NAKSHATRAS).has(nak));
      }
      if (w.key === 'ravi') {
        const sun = Math.floor(getSiderealPlanetLongitude('sun', w.start) / NAKSHATRA_SPAN) % 27;
        assert.ok(RAVI_YOGA_COUNTS.has(sunToMoonCount(sun, nak)));
      }
    }
    // An अमृत window is always covered by a सर्वार्थ window (subset rows).
    for (const a of only(yogas, 'amrita-siddhi')) {
      assert.ok(
        only(yogas, 'sarvartha-siddhi').some(
          (s) => s.start.getTime() <= a.start.getTime() && s.end.getTime() >= a.end.getTime()
        ),
        `${d.toDateString()} अमृत without covering सर्वार्थ`
      );
    }
  }
  // Non-vacuity: the year genuinely carries each family (पुष्कर pair combined).
  assert.ok(found['sarvartha-siddhi'] > 20, `sarvartha ${found['sarvartha-siddhi']}`);
  assert.ok(found['amrita-siddhi'] > 5, `amrita ${found['amrita-siddhi']}`);
  assert.ok(found.ravi > 20, `ravi ${found.ravi}`);
  assert.ok(found.dwipushkar + found.tripushkar >= 1, 'no पुष्कर window all year');
});

// ── boundaries: purity and the annotate-only dependency direction ───────────

test('shubhYoga stays pure: no wall clock, randomness, network, storage, or React', () => {
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../shubhYoga.ts'), 'utf8');
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
});

test('annotate-only is structural: eventMuhurat must never import shubhYoga (RULEBOOK §23)', () => {
  const source = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../eventMuhurat.ts'), 'utf8');
  assert.doesNotMatch(source, /shubhYoga/);
});
