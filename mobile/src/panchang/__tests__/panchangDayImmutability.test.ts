/**
 * The precondition for sharing one day-store across every panchang surface: the
 * cache hands out the SAME `PanchangData` instance to every reader, so a consumer
 * that mutates it in place would corrupt the other readers — and, once the day is
 * persisted, the copy on disk too. A grep proved no consumer mutates today; this
 * makes it a standing invariant instead of a point-in-time observation.
 *
 * Method: snapshot a real solved day by value, drive every derivation the app
 * performs on it, then assert the day is byte-identical afterwards. The snapshot
 * is `serializeDayInputs`, so it covers the `Date`s inside the day too — those are
 * mutable objects, and `setHours` on a shared `sunrise` is the most likely way this
 * breaks. We do not have to guess which field a consumer might touch.
 *
 * Why not just `Object.freeze` the fixture: the tsx runner transpiles to CommonJS,
 * which is NOT strict mode, so a frozen-object write silently no-ops instead of
 * throwing — a freeze-only guard would pass while the mutation went undetected.
 * Freezing is kept as a second, louder net for strict-mode callers, but the
 * value comparison is what actually holds the line. `detectsMutation` below proves
 * the harness is not vacuous.
 *
 * If this fails after you add a feature: make the consumer read-only, or clone
 * before mutating. Do not relax the assertion.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { computePanchangForDate, UJJAIN_GEO } from '../engine';
import { classifyNow, computeMuhuratDay } from '../muhurat';
import { auspiciousWindows, computeAstaFlags, evaluateDay, getEventRule, isChaturmasDay, summarize } from '../eventMuhurat';
import { pushyaYogaFor } from '../abujhMuhurat';
import { formatClock, formatEndInstant, formatRange, formatRangeCompact } from '../muhuratFormat';
import { serializeDayInputs, reviveDayInputs } from '../panchangDaySerde';
import { cachedDayInputs, dayStoreFor, scopeKeyFor, __resetPanchangDayStore } from '../panchangDayStore';
import type { DayInputs } from '../panchangDayStore';

const LOC = { ...UJJAIN_GEO, cityId: 'ujjain' };
const OPTS = { calendarSystem: 'purnimant' as const, location: LOC };
const DAY = new Date(2026, 7, 20); // Thursday — exercises the pushya branch too
const NEXT = new Date(2026, 7, 21);

/** Freeze objects, arrays and Dates recursively. */
function deepFreeze<T>(value: T, seen = new Set<unknown>()): T {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value;
  seen.add(value);
  Object.freeze(value);
  // A frozen Date still answers getTime()/getFullYear() (internal slots), but
  // setHours()/setDate() now throw — which is exactly the mutation we're hunting.
  if (!(value instanceof Date)) {
    Object.values(value as Record<string, unknown>).forEach((v) => deepFreeze(v, seen));
  }
  return value;
}

const computeDay = (d: Date): DayInputs => ({
  p: computePanchangForDate(d, OPTS),
  asta: computeAstaFlags(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)),
});
const frozenDay = (d: Date): DayInputs => deepFreeze(computeDay(d));

/**
 * Run `derive` against a frozen day and assert the day is unchanged by value.
 * Returns nothing — the assertion IS the test.
 */
function assertNoMutation(label: string, derive: (today: DayInputs, next: DayInputs) => void): void {
  const today = frozenDay(DAY);
  const next = frozenDay(NEXT);
  const before = serializeDayInputs(today);
  derive(today, next);
  assert.equal(serializeDayInputs(today), before, `${label} mutated the shared day`);
}

test('the guard detects a mutation (the harness is not vacuous)', () => {
  // An unfrozen day, mutated the way a careless consumer would: the snapshot
  // comparison must notice, or every assertion below is worthless.
  const day = computeDay(DAY);
  const before = serializeDayInputs(day);
  day.p.sunrise.setHours(3); // silent under CJS non-strict mode — still a real corruption
  assert.notEqual(serializeDayInputs(day), before, 'snapshot comparison must catch a Date mutation');

  const other = computeDay(DAY);
  const otherBefore = serializeDayInputs(other);
  (other.p as { vikramSamvat: number }).vikramSamvat = 0;
  assert.notEqual(serializeDayInputs(other), otherBefore, 'and a plain field mutation');
});

test('the muhurat engine never mutates the day it is given', () => {
  assertNoMutation('computeMuhuratDay/classifyNow', (today, next) => {
    const md = computeMuhuratDay(today.p.sunrise, today.p.sunset, next.p.sunrise, DAY.getDay());
    assert.equal(md.dayChoghadiya.length, 8);
    assert.equal(md.nightChoghadiya.length, 8);
    // The live "now" read, at an instant inside the day.
    classifyNow(md, new Date(today.p.sunrise.getTime() + 3_600_000));
    // The windows must be derived from, not aliases of, the day's own Dates —
    // an alias would let a later mutation of a window reach the cached day.
    assert.notEqual(md.dayChoghadiya[0].start, today.p.sunrise);
  });
});

test('the finder verdict path never mutates the day', () => {
  assertNoMutation('evaluateDay/summarize/pushya/chaturmas', (today, next) => {
    const md = computeMuhuratDay(today.p.sunrise, today.p.sunset, next.p.sunrise, DAY.getDay());
    // Every shipped occasion — a dosha check that cached onto `p` would show here.
    const verdicts = (['griha-pravesh', 'vahan', 'namkaran', 'vidyarambh', 'bhumi-pujan', 'vyapar'] as const).map(
      (id) => evaluateDay(getEventRule(id), DAY.getTime(), DAY.getDay(), today.p, md, today.asta)
    );
    summarize(verdicts);
    pushyaYogaFor(today.p, DAY.getDay());
    isChaturmasDay(today.p);
    auspiciousWindows(md);
  });
});

test('the display formatters never mutate the day', () => {
  assertNoMutation('formatters', (today) => {
    formatClock(today.p.sunrise);
    formatClock(today.p.moonrise);
    formatRange(today.p.sunrise, today.p.sunset);
    formatRangeCompact(today.p.brahmaMuhurta.start, today.p.brahmaMuhurta.end);
    // Day-crossing end instants are where a formatter would be tempted to
    // normalise a Date in place.
    formatEndInstant(new Date(today.p.sunset.getTime() + 8 * 3_600_000), today.p.date, 'hi');
    if (today.p.tithi.endTime) formatEndInstant(today.p.tithi.endTime, today.p.date, 'en');
    if (today.p.kshayaTithi?.endTime) formatEndInstant(today.p.kshayaTithi.endTime, today.p.date, 'hi');
  });
});

test('serialization never mutates the day, and a revived day is a fresh instance', () => {
  const today = frozenDay(DAY);
  const revived = reviveDayInputs(serializeDayInputs(today));
  assert.ok(revived);
  assert.deepEqual(revived, today, 'round-trip must be value-identical');
  // …but NOT the same object, so a mutation of one can never reach the other.
  assert.notEqual(revived, today);
  assert.notEqual(revived!.p.sunrise, today.p.sunrise);
  assert.ok(!Object.isFrozen(revived!.p), 'a revived day is an ordinary mutable object');
});

test('the store hands the SAME instance to every reader — the reason this matters', () => {
  __resetPanchangDayStore();
  const map = dayStoreFor(scopeKeyFor(LOC, 'purnimant'));
  const first = cachedDayInputs(map, DAY, OPTS);
  const second = cachedDayInputs(map, new Date(2026, 7, 20), OPTS);
  assert.equal(second.inputs, first.inputs, 'two readers share one object');
  assert.equal(second.inputs.p, first.inputs.p, 'including the PanchangData itself');
});
