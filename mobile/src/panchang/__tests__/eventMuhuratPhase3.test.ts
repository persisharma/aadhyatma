/**
 * PRD-16 Phase 3 (PRD-16/P3): split-and-grade windows at lagna + anga
 * boundaries, the 24-minute minimum-segment rule, the lagna factor
 * (empty-DRAFT tables → inert grading, pinned), hora as evidence/tie-break
 * only, late-onset Vishti, and यात्रा with दिशा शूल.
 *
 * Every date is REAL engine output (locations stated). The lagna-preference
 * grading pins use SYNTHETIC rules (the shipped tables are empty DRAFT by
 * design — RULEBOOK §17), exactly as the Phase-2 masa mechanism was pinned
 * before its tables landed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { computePanchangForDate, sunriseForDate, UJJAIN_GEO } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import { lagnaSpansForDay, lagnaAt } from '../lagnaSweep';
import { BENEFIC_HORA } from '../hora';
import {
  DISHA_SHOOL_BY_VARA,
  EVENT_RULES,
  MIN_SEGMENT_MINUTES,
  computeAstaFlags,
  evaluateDay,
  getEventRule,
  type EventRule,
} from '../eventMuhurat';

const UJJAIN = { ...UJJAIN_GEO, cityId: 'ujjain' };
const BLR = { latitude: 12.9716, longitude: 77.5946, elevation: 920, cityId: 'bengaluru' };

function day(y: number, m1: number, d: number): Date {
  return new Date(y, m1 - 1, d);
}

function solved(date: Date, location = UJJAIN) {
  const opts = { location };
  const p = computePanchangForDate(date, opts);
  const nextSunrise = sunriseForDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), opts);
  const next = computePanchangForDate(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1), opts);
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay());
  const asta = computeAstaFlags(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const lagnas = lagnaSpansForDay(p.sunrise, nextSunrise, location.latitude, location.longitude);
  return { p, m, asta, lagnas };
}

function verdictWithLagnas(occasionId: Parameters<typeof getEventRule>[0], date: Date, location = UJJAIN) {
  const { p, m, asta, lagnas } = solved(date, location);
  return evaluateDay(getEventRule(occasionId), date.getTime(), date.getDay(), p, m, asta, { lagnas });
}

// ── split at lagna boundaries ───────────────────────────────────────────────

test('19 Aug 2026 Vahan: every offered segment sits inside exactly ONE lagna span', () => {
  const { lagnas } = solved(day(2026, 8, 19));
  const v = verdictWithLagnas('vahan', day(2026, 8, 19));
  assert.ok(v.windows.length >= 3);
  for (const w of v.windows) {
    assert.notEqual(w.lagnaRashiIndex, null, 'spans were supplied — the index must be set');
    assert.equal(w.lagnaRashiIndex, lagnaAt(lagnas, w.start), 'index matches the span at the segment start');
    // The span covering the start must also cover the end — that is what
    // splitting guarantees (the lagna row can say "prevails over the whole
    // window" truthfully).
    const span = lagnas.find((s) => s.rashiIndex === w.lagnaRashiIndex && s.start.getTime() <= w.start.getTime());
    assert.ok(span && w.end.getTime() <= span.end.getTime(), `${w.nameEn} crosses out of its span`);
  }
});

test('17 Aug 2026 Vahan: the leading sub-24-min sliver is dropped — the window starts AT the boundary', () => {
  // The raw morning Amrit opens 6:03:53; the Mesha→Vrishabha lagna boundary
  // falls at 6:07:57. The 4-minute lead falls under the floor and is dropped,
  // so the offered segment begins exactly at the boundary (§13: the rule is
  // length, not distance — no hysteresis).
  const { lagnas } = solved(day(2026, 8, 17));
  const v = verdictWithLagnas('vahan', day(2026, 8, 17));
  const amrit = v.windows.filter((w) => w.nameEn === 'Amrit');
  assert.ok(amrit.length >= 1);
  const morning = amrit.find((w) => w.start.getHours() < 12)!;
  const boundary = lagnas.find((s) => s.rashiIndex === morning.lagnaRashiIndex)!;
  assert.equal(morning.start.getTime(), boundary.start.getTime(), 'segment starts at the lagna boundary');
  assert.equal(morning.splitFrom, 'choghadiya', 'a split part names its parent kind');
  for (const w of v.windows) {
    assert.ok(w.end.getTime() - w.start.getTime() >= MIN_SEGMENT_MINUTES * 60_000, `${w.nameEn} under the floor`);
  }
});

// ── split at anga boundaries, kshaya day included ───────────────────────────

test('10 Jul 2026 Bengaluru (kshaya day): windows split at the nakshatra end and step through the SKIPPED tithi', () => {
  const { p } = solved(day(2026, 7, 10), BLR);
  assert.ok(p.kshayaTithi, 'the reference kshaya day');
  const v = verdictWithLagnas('vahan', day(2026, 7, 10), BLR);
  assert.notEqual(v.tier, 'excluded');
  // Everything after the 8:16 AM Dashami end grades on the SKIPPED Ekadashi
  // (index 25) — never Dashami+1 = 25? No: (24+1)%30 = 25 happens to
  // coincide here, so pin the segment count instead: the nakshatra ends
  // 1:13:59 PM inside the Shubh window, which must yield two sibling
  // segments meeting exactly at that instant.
  const shubh = v.windows.filter((w) => w.nameEn === 'Shubh').sort((a, b) => a.start.getTime() - b.start.getTime());
  assert.equal(shubh.length, 2, 'Shubh must split at the nakshatra changeover');
  assert.equal(shubh[0].end.getTime(), p.nakshatra.endTime!.getTime());
  assert.equal(shubh[1].start.getTime(), p.nakshatra.endTime!.getTime());
  assert.equal(shubh[0].splitFrom, 'choghadiya');
  // Post-changeover segments grade on the kshaya tithi (angaAt's kshaya path).
  for (const w of v.windows.filter((x) => x.start.getTime() >= p.tithi.endTime!.getTime())) {
    assert.equal(w.angaAtWindow?.tithiIndex, p.kshayaTithi!.index, `${w.nameEn} must sit on the kshaya tithi`);
  }
});

// ── lagna grading: inert while empty, demote when barred ────────────────────

test('every shipped lagna table is EMPTY (DRAFT) — grading inert, chips only (RULEBOOK §17)', () => {
  for (const r of EVENT_RULES) {
    assert.equal(r.lagna.preferred.length, 0, `${r.id} must not prefer lagnas before §10 fills its table`);
    assert.equal(r.lagna.barred.length, 0, `${r.id} must not bar lagnas before §10 fills its table`);
  }
});

test('with empty lagna tables the day tier is unchanged by supplying spans (back-compat)', () => {
  for (let i = 0; i < 30; i += 1) {
    const d = day(2026, 9, 1 + i);
    const { p, m, asta, lagnas } = solved(d);
    const rule = getEventRule('vahan');
    const withSpans = evaluateDay(rule, d.getTime(), d.getDay(), p, m, asta, { lagnas });
    const without = evaluateDay(rule, d.getTime(), d.getDay(), p, m, asta);
    assert.equal(withSpans.tier, without.tier, d.toDateString());
  }
});

test('a BARRED lagna demotes a three-factor segment to madhyam; it never excludes the day', () => {
  const d = day(2026, 8, 17); // shreshtha Vahan day, morning Amrit in Vrishabha (1)
  const { p, m, asta, lagnas } = solved(d);
  const base = getEventRule('vahan');
  const allBarred: EventRule = { ...base, lagna: { preferred: [], barred: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] } };
  const v = evaluateDay(allBarred, d.getTime(), d.getDay(), p, m, asta, { lagnas });
  assert.notEqual(v.tier, 'excluded', 'a barred lagna never excludes by itself');
  assert.equal(v.tier, 'madhyam', 'every three-factor segment demotes to madhyam');
  for (const w of v.windows) assert.equal(w.tier, 'madhyam');
});

test('a PREFERRED lagna sets the factor and wins the within-tier tie-break', () => {
  const d = day(2026, 8, 17);
  const { p, m, asta, lagnas } = solved(d);
  const base = getEventRule('vahan');
  const plain = evaluateDay(base, d.getTime(), d.getDay(), p, m, asta, { lagnas });
  // Prefer the lagna of the LAST shreshtha segment in the plain ordering, so
  // the tie-break has something to move.
  const shreshtha = plain.windows.filter((w) => w.tier === 'shreshtha');
  assert.ok(shreshtha.length >= 2, 'need at least two equal-tier segments');
  const target = shreshtha[shreshtha.length - 1].lagnaRashiIndex!;
  const prefers: EventRule = { ...base, lagna: { preferred: [target], barred: [] } };
  const v = evaluateDay(prefers, d.getTime(), d.getDay(), p, m, asta, { lagnas });
  assert.equal(v.windows[0].lagnaRashiIndex, target, 'the preferred-lagna segment must lead');
  assert.equal(v.windows[0].factors.lagna, true);
  assert.equal(v.windows[0].tier, shreshtha[0].tier, 'the tie-break must not move a tier');
});

// ── hora: evidence and tie-break only ───────────────────────────────────────

test('hora is a TIE-break only: sort keys run tier → lagna → window priority → hora', () => {
  const priority = (w: { nameEn: string; kind: string }) =>
    w.nameEn === 'Amrit' ? 0 : w.kind === 'abhijit' ? 1 : w.nameEn === 'Shubh' ? 2 : 3;
  for (const dt of [day(2026, 8, 17), day(2026, 8, 19), day(2026, 9, 14)]) {
    const v = verdictWithLagnas('vahan', dt);
    if (v.tier === 'excluded') continue;
    for (const w of v.windows) assert.ok(w.horaRuler, 'every offered segment carries its hora');
    const keys = v.windows.map((w) => [
      w.tier === 'shreshtha' ? 0 : 1,
      w.factors.lagna ? 0 : 1,
      priority(w),
      BENEFIC_HORA.has(w.horaRuler!) ? 0 : 1,
    ]);
    for (let i = 1; i < keys.length; i += 1) {
      const cmp = keys[i - 1].map((k, j) => k - keys[i][j]).find((x) => x !== 0) ?? 0;
      assert.ok(cmp <= 0, `${dt.toDateString()}: window ${i} outranks its predecessor`);
    }
    // Hora cannot outrank priority: an Amrit window may never trail a
    // same-tier non-Amrit window on hora alone. (17 Aug 2026: the morning
    // Amrit in Chandra hora still leads the Venus-hora Abhijit.)
    if (dt.getTime() === day(2026, 8, 17).getTime()) {
      assert.equal(v.windows[0].nameEn, 'Amrit');
      assert.ok(v.windows[0].start.getHours() < 12, 'the morning Amrit leads');
    }
  }
});

// ── late-onset Vishti (§0.3 prerequisite) ───────────────────────────────────

test('a late-onset Vishti interval sits exactly on 6° elongation boundaries and drops covered windows', () => {
  // 27 Aug 2026: Vanija at sunrise, Vishti (first half of Purnima) from
  // 9:09 AM — the eve-of-Raksha-Bandhan Bhadra. Its start must equal the
  // sunrise karana's end, and every window inside it is dropped
  // (re-pinned end-to-end in eventMuhuratPhase2.test.ts).
  const { p } = solved(day(2026, 8, 27));
  assert.ok(p.lateVishti);
  assert.equal(p.lateVishti!.start.getTime(), p.karana.endTime!.getTime());
  assert.ok(p.lateVishti!.end.getTime() - p.lateVishti!.start.getTime() > 9 * 3600_000, 'a karana lasts ~10-13.4h');
});

test('a sunrise-Vishti day never carries lateVishti (adjacent Vishti karanas are impossible)', () => {
  const { p } = solved(day(2026, 8, 20));
  assert.equal(p.karana.index, 6);
  assert.equal(p.lateVishti, null);
});

// ── यात्रा + दिशा शूल ───────────────────────────────────────────────────────

test('यात्रा is the 13th occasion, DRAFT, carrying the disha-shool dosha', () => {
  const yatra = getEventRule('yatra');
  assert.equal(yatra.group, 'arambh');
  assert.equal(yatra.source.verified, false);
  assert.ok(yatra.doshas.includes('disha-shool'));
  // No other occasion is direction-gated.
  for (const r of EVENT_RULES) {
    if (r.id !== 'yatra') assert.ok(!r.doshas.includes('disha-shool'), r.id);
  }
});

test('the chosen direction excludes exactly its shool weekdays, naming the dosha', () => {
  // 17 Aug 2026 is a Monday — the shool direction is पूर्व (east).
  const d = day(2026, 8, 17);
  assert.equal(d.getDay(), 1);
  assert.equal(DISHA_SHOOL_BY_VARA[1], 'east');
  const { p, m, asta, lagnas } = solved(d);
  const yatra = getEventRule('yatra');

  const east = evaluateDay(yatra, d.getTime(), d.getDay(), p, m, asta, { lagnas, direction: 'east' });
  assert.equal(east.tier, 'excluded');
  assert.deepEqual(east.doshas, ['disha-shool']);

  const west = evaluateDay(yatra, d.getTime(), d.getDay(), p, m, asta, { lagnas, direction: 'west' });
  assert.ok(!west.doshas.includes('disha-shool'), 'a non-shool direction must not exclude');

  const none = evaluateDay(yatra, d.getTime(), d.getDay(), p, m, asta, { lagnas });
  assert.ok(!none.doshas.includes('disha-shool'), 'no direction chosen → no shool exclusion');
});

test('intercardinal directions carry no shool in v1 (recorded variant choice)', () => {
  const d = day(2026, 8, 17); // Monday
  const { p, m, asta, lagnas } = solved(d);
  const yatra = getEventRule('yatra');
  for (const direction of ['northeast', 'southeast', 'southwest', 'northwest'] as const) {
    const v = evaluateDay(yatra, d.getTime(), d.getDay(), p, m, asta, { lagnas, direction });
    assert.ok(!v.doshas.includes('disha-shool'), direction);
  }
});
