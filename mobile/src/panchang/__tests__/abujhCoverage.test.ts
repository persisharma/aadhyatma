import test from 'node:test';
import assert from 'node:assert/strict';

import { computePanchangForDate, UJJAIN_GEO } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import { ABUJH_RULE_IDS, pushyaYogaFor } from '../abujhMuhurat';
import { computeAstaFlags, evaluateDay, getEventRule, EVENT_RULES } from '../eventMuhurat';
import {
  abujhFestivalKeys,
  isAbujhDay,
  scanAbujhDays,
  FIRST_AFTER_MAX_DAYS,
} from '../muhuratFinderScan';
import { dateKeyFor, __resetPanchangDayStore } from '../panchangDayStore';

/**
 * अबूझ coverage and the abujh↔finder contract (PRD-16 §4.2, RULEBOOK §17).
 *
 * Two defects shipped in Phase 1 and are pinned here so they cannot return:
 *
 * 1. `scanAbujhDays` passed a COUNT of 60 to `getUpcomingObservances`, which
 *    applies `.slice(0, count)` AFTER its date filter. Sixty observances from
 *    mid-August 2026 run out in late October, so a 260-day scan silently
 *    stopped ~73 days in and FIVE of the six abujh rules — Akshaya Tritiya,
 *    Vasant Panchami, Dhanteras, Akshaya Navami, Dev Uthani Ekadashi — never
 *    reached the screen. Only Dussehra and the computed Pushya days survived.
 *
 * 2. The finder ran the full dosha stack on those days, so the app called a
 *    day "auspicious in its entirety, no shuddhi required" on the Abujh screen
 *    and excluded it on the finder. Abujh days now lift the SEASONAL bars
 *    (chaturmas, guru/shukra asta) while per-day doshas still apply.
 *
 * Ujjain, the engine default — same convention as the other engine suites.
 */

const OPTS = {
  calendarSystem: 'purnimant' as const,
  location: { ...UJJAIN_GEO, cityId: 'ujjain' },
};

// A window wide enough to contain every abujh rule at least once: the six
// festival-anchored ones spread across a full Hindu year.
const WIDE_START = new Date(2026, 7, 14);
const WIDE_DAYS = 400;

function verdictFor(occasionId: string, date: Date, abujh: boolean) {
  const p = computePanchangForDate(date, { location: OPTS.location });
  const next = computePanchangForDate(
    new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    { location: OPTS.location }
  );
  const m = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay());
  const noon = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  return evaluateDay(
    getEventRule(occasionId as never),
    date.getTime(),
    date.getDay(),
    p,
    m,
    computeAstaFlags(noon),
    { abujh }
  );
}

// ── 1. coverage: the count cap must not truncate by observance count ─────────

test('every festival-anchored ABUJH_RULE_ID resolves inside a full-year window', () => {
  // The assertion that would have caught the truncation. Before the fix only
  // `dussehra` was present.
  const keys = abujhFestivalKeys(WIDE_START, WIDE_DAYS, OPTS);
  assert.ok(keys.size >= ABUJH_RULE_IDS.length, `only ${keys.size} abujh festival days in ${WIDE_DAYS} days`);
});

test('Dev Uthani Ekadashi and Akshaya Tritiya both reach the abujh scan', async () => {
  __resetPanchangDayStore();
  const days = await scanAbujhDays(WIDE_START, WIDE_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const names = days.map((d) => d.nameEn.toLowerCase());
  assert.ok(
    names.some((n) => n.includes('uthani')),
    `Dev Uthani missing from: ${[...new Set(names)].join(', ')}`
  );
  assert.ok(
    names.some((n) => n.includes('akshaya tritiya')),
    `Akshaya Tritiya missing from: ${[...new Set(names)].join(', ')}`
  );
});

test('the production 260-day scan reaches well past its 60th observance', async () => {
  __resetPanchangDayStore();
  const days = await scanAbujhDays(WIDE_START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const festival = days.filter((d) => d.source === 'festival');
  // The truncated version returned exactly one (Dussehra, 21 Oct 2026) because
  // the 60th observance fell on 26 Oct.
  assert.ok(festival.length >= 3, `only ${festival.length} festival abujh days in the shipped horizon`);
  const last = new Date(days[days.length - 1].dateMs);
  assert.ok(
    last.getTime() > new Date(2026, 10, 1).getTime(),
    `scan stopped at ${last.toDateString()} — looks truncated again`
  );
});

test('abujh days are unique and sorted', async () => {
  __resetPanchangDayStore();
  const days = await scanAbujhDays(WIDE_START, WIDE_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const keys = days.map((d) => `${d.dateMs}:${d.nameEn}`);
  assert.equal(new Set(keys).size, keys.length, 'duplicate abujh entries');
  for (let i = 1; i < days.length; i += 1) {
    assert.ok(days[i].dateMs >= days[i - 1].dateMs, 'abujh days out of order');
  }
});

// ── 2. the abujh ↔ finder contract ──────────────────────────────────────────

test('isAbujhDay agrees with the scan on every day it lists', async () => {
  __resetPanchangDayStore();
  const days = await scanAbujhDays(WIDE_START, WIDE_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  for (const d of days) {
    const date = new Date(d.dateMs);
    const p = computePanchangForDate(date, { location: OPTS.location });
    assert.ok(isAbujhDay(date, p, OPTS), `${date.toDateString()} (${d.nameEn}) not seen as abujh`);
  }
});

test('an abujh day lifts the SEASONAL bars — chaturmas and asta', () => {
  // Ravi Pushya, 1 Nov 2026: inside Chaturmas, and Griha Pravesh carries the
  // chaturmas dosha. Before the fix this was excluded while the Abujh screen
  // called the same day auspicious in its entirety.
  const date = new Date(2026, 10, 1);
  const p = computePanchangForDate(date, { location: OPTS.location });
  assert.ok(pushyaYogaFor(p, date.getDay()), 'expected Ravi Pushya on 1 Nov 2026');

  const without = verdictFor('griha-pravesh', date, false);
  assert.ok(without.doshas.includes('chaturmas'));
  assert.equal(without.tier, 'excluded');

  const withAbujh = verdictFor('griha-pravesh', date, true);
  assert.ok(!withAbujh.doshas.includes('chaturmas'), 'chaturmas should yield to an abujh day');
  assert.ok(!withAbujh.doshas.includes('guru-asta'));
  assert.ok(!withAbujh.doshas.includes('shukra-asta'));
});

test('an abujh day does NOT lift the per-day doshas', () => {
  // Guru Pushya, 15 Apr 2027, falls on a Navami — a rikta tithi. The narrow
  // reading keeps that bar (RULEBOOK §17.8: this line is an interpolation and
  // the §10 review may move it).
  const date = new Date(2027, 3, 15);
  const p = computePanchangForDate(date, { location: OPTS.location });
  assert.ok(pushyaYogaFor(p, date.getDay()), 'expected Guru Pushya on 15 Apr 2027');

  const v = verdictFor('griha-pravesh', date, true);
  assert.ok(v.doshas.includes('rikta'), 'rikta must survive an abujh day');
  assert.equal(v.tier, 'excluded');
});

test('the abujh exemption never makes a NON-abujh day better', () => {
  // Guards the flag against leaking: a plain day grades identically either way.
  const date = new Date(2026, 10, 12); // ordinary Chaturmas day, no yoga
  const p = computePanchangForDate(date, { location: OPTS.location });
  assert.equal(pushyaYogaFor(p, date.getDay()), null);
  assert.ok(!isAbujhDay(date, p, OPTS));
  for (const rule of EVENT_RULES) {
    const plain = verdictFor(rule.id, date, false);
    assert.equal(plain.tier, verdictFor(rule.id, date, isAbujhDay(date, p, OPTS)).tier);
  }
});

test('abujhFestivalKeys is date-keyed consistently with the day store', () => {
  const keys = abujhFestivalKeys(WIDE_START, WIDE_DAYS, OPTS);
  for (const k of keys) {
    assert.match(k, /^\d{4}-\d{2}-\d{2}$/);
    const [y, m, d] = k.split('-').map(Number);
    assert.equal(dateKeyFor(new Date(y, m - 1, d)), k);
  }
});
