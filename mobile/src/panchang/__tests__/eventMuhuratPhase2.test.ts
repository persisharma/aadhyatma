import test from 'node:test';
import assert from 'node:assert/strict';

import { computePanchangForDate, getSiderealSunLng, getSiderealMoonLng, UJJAIN_GEO } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import {
  EVENT_RULES,
  GROUP_ORDER,
  angaAt,
  auspiciousWindows,
  bhadraInterval,
  computeAstaFlags,
  evaluateDay,
  getEventRule,
  windowsOutsideBhadra,
  normalisedPurnimantMonth,
  type EventRule,
} from '../eventMuhurat';

/**
 * PRD-16 Phase 2 (TRD-16/P2): window-time anga evaluation, Bhadra as an
 * interval, masa shuddhi, and the twelve-occasion roster.
 *
 * Every date below is a REAL engine output pinned during the Phase-2 design
 * pass (Ujjain unless stated): the bhadra end instants were cross-validated
 * against an independent 6°-elongation bisection, and the three verdict-flip
 * days are the ones the TRD publishes. Golden external validation lives in
 * eventMuhurat.drikfixture.test.ts (§10).
 *
 * Phase 3 updates (PRD-16/P3): the 27 Aug flip is re-pinned — the late-onset
 * Vishti solver now sees the afternoon Bhadra Phase 2 was blind to, and the
 * split-and-grade window pass may emit MORE windows per day (segments) than
 * Phase 2 did; the assertions below were kept where they still hold and
 * re-pinned where Phase 3 corrects Phase 2.
 */

const LOC = { ...UJJAIN_GEO, cityId: 'ujjain' };

function day(y: number, m1: number, d: number): Date {
  return new Date(y, m1 - 1, d);
}

function solved(date: Date) {
  const p = computePanchangForDate(date, { location: LOC });
  const next = computePanchangForDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    { location: LOC }
  );
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay());
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  return { p, m, asta: computeAstaFlags(noon) };
}

function verdict(occasionId: Parameters<typeof getEventRule>[0], date: Date) {
  const { p, m, asta } = solved(date);
  return evaluateDay(getEventRule(occasionId), date.getTime(), date.getDay(), p, m, asta);
}

// ── karana.endTime: the one new engine solve ────────────────────────────────

test('karana.endTime is solved, and sits exactly on a 6° elongation boundary', () => {
  const { p } = solved(day(2026, 8, 20));
  assert.ok(p.karana.endTime, 'karana.endTime must no longer be null');
  const end = p.karana.endTime!;
  // Just before the end the elongation is below a 6° boundary; just after, at
  // or above it — the same invariant the tithi solver holds at 12°.
  const y = end.getFullYear();
  const elong = (t: Date) => (getSiderealMoonLng(t, y) - getSiderealSunLng(t, y) + 360) % 360;
  const before = elong(new Date(end.getTime() - 5 * 60_000)) / 6;
  const after = elong(new Date(end.getTime() + 5 * 60_000)) / 6;
  assert.ok(Math.floor(after) === Math.floor(before) + 1, `no 6° crossing at ${end.toISOString()}`);
});

test('when Vishti is the SECOND half of its tithi, karana end equals tithi end', () => {
  // 31 Aug and 15 Sep 2026: the 6° and 12° boundaries coincide — a strong
  // internal consistency check between the two solvers.
  for (const [m1, d] of [[8, 31], [9, 15]] as const) {
    const { p } = solved(day(2026, m1, d));
    assert.equal(p.karana.index, 6, `expected Vishti on 2026-${m1}-${d}`);
    assert.ok(p.karana.endTime && p.tithi.endTime);
    assert.ok(
      Math.abs(p.karana.endTime!.getTime() - p.tithi.endTime!.getTime()) < 3 * 60_000,
      `karana end ${p.karana.endTime} should coincide with tithi end ${p.tithi.endTime}`
    );
  }
});

test('validated 2026 bhadra ends: 20 Aug ~8:16, 3 Sep ~15:28, 26 Sep ~10:47 IST', () => {
  const expected: [number, number, number, number][] = [
    [8, 20, 8, 16],
    [9, 3, 15, 28],
    [9, 26, 10, 47],
  ];
  for (const [m1, d, hh, mm] of expected) {
    const { p } = solved(day(2026, m1, d));
    assert.equal(p.karana.index, 6);
    const end = p.karana.endTime!;
    const target = new Date(2026, m1 - 1, d, hh, mm).getTime();
    assert.ok(Math.abs(end.getTime() - target) < 3 * 60_000, `2026-${m1}-${d}: got ${end}`);
  }
});

// ── angaAt: window-time anga, kshaya-aware ──────────────────────────────────

test('angaAt steps the tithi after its end, and not before', () => {
  const { p } = solved(day(2026, 8, 27)); // Chaturdashi ends mid-day
  const end = p.tithi.endTime!;
  assert.equal(angaAt(p.tithi, p.kshayaTithi, new Date(end.getTime() - 60_000), 30), p.tithi.index);
  assert.equal(angaAt(p.tithi, p.kshayaTithi, new Date(end.getTime() + 60_000), 30), (p.tithi.index + 1) % 30);
});

test('angaAt is KSHAYA-aware: the skipped anga comes first, then ITS successor', () => {
  // The reference kshaya case (wiki/panchang): Bengaluru 10 Jul 2026 —
  // Dashami till 8:16 AM, kshaya Ekadashi till 5:22 AM on 11 Jul.
  const BLR = { latitude: 12.9716, longitude: 77.5946, elevation: 920, cityId: 'bengaluru' };
  const p = computePanchangForDate(day(2026, 7, 10), { location: BLR });
  assert.ok(p.kshayaTithi, 'expected a kshaya tithi on 10 Jul 2026 (Bengaluru)');
  const mainEnd = p.tithi.endTime!;
  const kshayaEnd = p.kshayaTithi!.endTime!;
  // During the main tithi.
  assert.equal(angaAt(p.tithi, p.kshayaTithi, new Date(mainEnd.getTime() - 60_000), 30), p.tithi.index);
  // Inside the kshaya interval: the SKIPPED index, not index+1 of the main.
  assert.equal(angaAt(p.tithi, p.kshayaTithi, new Date(mainEnd.getTime() + 60_000), 30), p.kshayaTithi!.index);
  // Past the kshaya end: the kshaya's successor.
  assert.equal(
    angaAt(p.tithi, p.kshayaTithi, new Date(kshayaEnd.getTime() + 60_000), 30),
    (p.kshayaTithi!.index + 1) % 30
  );
});

test('a vriddhi-style anga (endTime beyond the day) never steps', () => {
  const { p } = solved(day(2026, 8, 20)); // Ashtami runs past sunset (ends 9:18 PM)
  assert.equal(angaAt(p.tithi, p.kshayaTithi, p.sunset, 30), p.tithi.index);
});

// ── bhadra as a window filter ───────────────────────────────────────────────

test('20 Aug 2026: bhadra 6:04–8:16 AM removes NO windows — the day is usable again', () => {
  // Phase 1 threw this whole day away. Every auspicious window opens after the
  // bhadra ends, so all of them survive and the day grades.
  const { p, m } = solved(day(2026, 8, 20));
  const bhadra = bhadraInterval(p)!;
  assert.ok(bhadra.end && bhadra.end < p.sunset);
  const all = auspiciousWindows(m);
  const outside = windowsOutsideBhadra(all, bhadra);
  assert.equal(outside.length, all.length, 'no window overlaps the early bhadra');

  const v = verdict('vahan', day(2026, 8, 20));
  assert.notEqual(v.tier, 'excluded', 'Phase 2 must offer 20 Aug for Vahan');
  assert.ok(v.bhadra, 'the interval rides the verdict for the struck-through row');
  assert.ok(v.windows.every((w) => w.start.getTime() >= bhadra.end!.getTime()));
});

test('3 Sep 2026: bhadra to 3:28 PM eats every midday window; only the evening survives', () => {
  // The blanket-allow guard: a naive "bhadra ended, day is fine" would offer a
  // midday muhurat squarely inside Bhadra.
  const { p, m } = solved(day(2026, 9, 3));
  const bhadra = bhadraInterval(p)!;
  const survivors = windowsOutsideBhadra(auspiciousWindows(m), bhadra);
  assert.ok(survivors.length >= 1 && survivors.length < auspiciousWindows(m).length);
  for (const w of survivors) assert.ok(w.start.getTime() >= bhadra.end!.getTime());
});

test('a day whose bhadra covers every window stays excluded and NAMES bhadra', () => {
  // Scan forward for a Vishti day whose karana outlasts the last window.
  let pinned = false;
  for (let i = 0; i < 200 && !pinned; i += 1) {
    const d = new Date(2026, 7, 14 + i);
    const { p, m } = solved(d);
    if (p.karana.index !== 6) continue;
    const bhadra = bhadraInterval(p)!;
    if (windowsOutsideBhadra(auspiciousWindows(m), bhadra).length > 0) continue;
    if (p.yoga.index === 16 || p.yoga.index === 26 || p.lunarMonth.isAdhik) continue;
    const v = verdict('vahan', d);
    assert.equal(v.tier, 'excluded', d.toDateString());
    assert.ok(v.doshas.includes('bhadra'), `${d.toDateString()} must name bhadra`);
    pinned = true;
  }
  assert.ok(pinned, 'no whole-day bhadra found in 200 days — implausible');
});

test('a non-Vishti day carries no bhadra interval', () => {
  const { p } = solved(day(2026, 8, 17));
  assert.equal(bhadraInterval(p), null);
});

// ── the three published verdict flips (TRD-16/P2 §1.1) ──────────────────────

test('27 Aug 2026 Vahan: the late-onset Vishti (Phase 3) re-excludes what Phase 2 offered', () => {
  // Phase 2's pinned flip offered this day via its Purnima windows — but the
  // first half of Purnima IS Vishti, beginning 9:09 AM when the sunrise
  // (Vanija) karana ends: the afternoon Bhadra Phase 2 could not see
  // (PRD-16/P3 §0.3, the eve-of-Raksha-Bandhan Bhadra). Every auspicious
  // window sits inside it, so the day is honestly excluded and names बद्रा.
  const { p } = solved(day(2026, 8, 27));
  assert.equal(p.karana.index, 5, 'sunrise karana is Vanija, not Vishti');
  assert.ok(p.lateVishti, 'the following karana (first half of Purnima) is Vishti');
  const target = new Date(2026, 7, 27, 9, 9).getTime();
  assert.ok(Math.abs(p.lateVishti!.start.getTime() - target) < 3 * 60_000, `bhadra starts ${p.lateVishti!.start}`);
  assert.ok(p.lateVishti!.end.getTime() > p.sunset.getTime(), 'this bhadra outlasts the day');

  const v = verdict('vahan', day(2026, 8, 27));
  assert.equal(v.tier, 'excluded');
  assert.ok(v.doshas.includes('bhadra'), 'the reason must name बद्रा');
  assert.ok(v.bhadra, 'the interval rides the verdict for the struck-through row');
  assert.equal(v.sunriseAnga.tithiIndex, 13); // Chaturdashi at sunrise, kept for the almanac line
});

test('26 Aug 2026 Vahan: only the pre-Chaturdashi window survives; nothing on the rikta tithi is offered', () => {
  // Trayodashi ends 7:59 AM and every later window sits on Chaturdashi (rikta).
  // Phase 1 offered the WHOLE day on the sunrise tithi; a single-instant
  // window-time reading (the TRD's measurement) excluded the whole day. The
  // shipped per-window model is finer than both: the 6:07 AM Labh — genuinely
  // on Trayodashi — is offered, and every rikta-tithi window is dropped.
  const v = verdict('vahan', day(2026, 8, 26));
  const { p } = solved(day(2026, 8, 26));
  assert.notEqual(v.tier, 'excluded');
  assert.ok(v.windows.length >= 1);
  for (const w of v.windows) {
    assert.ok(w.start.getTime() < p.tithi.endTime!.getTime(), `${w.nameEn} sits on the rikta Chaturdashi`);
    assert.ok(!w.angaAtWindow || w.angaAtWindow.tithiIndex === p.tithi.index);
  }
});

test('19 Aug 2026 Vahan: the Swati window is shreshtha; every post-changeover Vishakha window demotes', () => {
  // Swati ends 6:45 AM. The 6:04 AM Labh keeps all three factors; Abhijit and
  // the afternoon windows sit on Vishakha (not in the Vahan tables) and carry
  // madhyam — the per-window form of the TRD's "shreshtha → madhyam" flip.
  const v = verdict('vahan', day(2026, 8, 19));
  const { p } = solved(day(2026, 8, 19));
  assert.equal(v.tier, 'shreshtha');
  const best = v.windows[0];
  assert.equal(best.tier, 'shreshtha');
  assert.ok(best.start.getTime() < p.nakshatra.endTime!.getTime(), 'the shreshtha window must be on Swati');
  const later = v.windows.filter((w) => w.angaAtWindow);
  assert.ok(later.length >= 2, 'the Vishakha windows should still be offered');
  for (const w of later) assert.equal(w.tier, 'madhyam');
});

// ── per-window tiers ────────────────────────────────────────────────────────

test('every offered window carries its own tier and factors, shreshtha windows first', () => {
  const v = verdict('vahan', day(2026, 8, 17));
  assert.ok(v.windows.length > 1);
  for (const w of v.windows) {
    assert.ok(w.tier === 'shreshtha' || w.tier === 'madhyam');
    assert.equal(typeof w.factors.nakshatra, 'boolean');
  }
  const ranks = v.windows.map((w) => (w.tier === 'shreshtha' ? 0 : 1));
  assert.deepEqual(ranks, [...ranks].sort((a, b) => a - b), 'shreshtha windows must lead');
  assert.equal(v.tier, v.windows[0].tier, "the day's tier is the best window's");
});

// ── masa shuddhi ────────────────────────────────────────────────────────────

test('a barred month excludes the day with the masa dosha; abujh lifts it', () => {
  const base = getEventRule('vahan');
  const { p, m, asta } = solved(day(2026, 8, 17)); // Shravana (purnimant month 5)
  assert.equal(normalisedPurnimantMonth(p), 5);
  const barred: EventRule = { ...base, masa: { preferred: [], barred: [5] } };

  const v = evaluateDay(barred, day(2026, 8, 17).getTime(), 1, p, m, asta);
  assert.equal(v.tier, 'excluded');
  assert.deepEqual(v.doshas, ['masa']);

  const lifted = evaluateDay(barred, day(2026, 8, 17).getTime(), 1, p, m, asta, { abujh: true });
  assert.ok(!lifted.doshas.includes('masa'), 'masa is seasonal — an abujh day lifts it');
});

test('masa normalisation is calendar-system invariant', () => {
  // A krishna-paksha day: amanta names the PREVIOUS month; the normalised
  // purnimant index must not move.
  const dt = day(2026, 9, 3);
  const pur = computePanchangForDate(dt, { location: LOC, calendarSystem: 'purnimant' });
  const ama = computePanchangForDate(dt, { location: LOC, calendarSystem: 'amanta' });
  assert.equal(pur.tithi.paksha, 'krishna');
  assert.equal(normalisedPurnimantMonth(pur), normalisedPurnimantMonth(ama));
});

test('upanayana is the one occasion with a populated masa bar (DRAFT)', () => {
  for (const r of EVENT_RULES) {
    if (r.id === 'upanayana') assert.ok(r.masa.barred.length > 0);
    else assert.equal(r.masa.barred.length, 0, `${r.id} must not bar months before §10 fills its table`);
  }
});

// ── the twelve-occasion roster ──────────────────────────────────────────────

test('thirteen occasions (यात्रा joined in Phase 3), each in exactly one picker group, all DRAFT', () => {
  assert.equal(EVENT_RULES.length, 13);
  const ids = new Set(EVENT_RULES.map((r) => r.id));
  assert.equal(ids.size, 13);
  for (const r of EVENT_RULES) {
    assert.ok(GROUP_ORDER.includes(r.group), `${r.id} has an unknown group`);
    assert.equal(r.source.verified, false, `${r.id} must stay DRAFT until §10`);
    assert.ok(r.source.referenceUrls.length >= 1);
    assert.ok(r.nakshatras.length > 0 && r.tithis.length > 0 && r.varas.length > 0);
    assert.match(r.nameHi, /[ऀ-ॿ]/);
  }
  // Upanayana carries the strict (Griha Pravesh-class) dosha set per the PRD.
  const up = getEventRule('upanayana');
  assert.ok(up.doshas.includes('chaturmas') && up.doshas.includes('guru-asta'));
});

test('a Phase-2 occasion grades end-to-end (mundan on the validated 17 Aug 2026)', () => {
  const v = verdict('mundan', day(2026, 8, 17));
  // Panchami + Chitra + Monday: all three in mundan's draft tables.
  assert.equal(v.tier, 'shreshtha');
  assert.ok(v.windows.length > 0);
});
