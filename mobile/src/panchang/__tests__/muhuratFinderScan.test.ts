/**
 * Unit coverage for the abujh scan core (PRD-16 Phase 1). These pin the three
 * fixes that made the "Special days" card feel stuck on a real device:
 *   1. it always resolves (a single bad day-solve is skipped, never strands),
 *   2. it paints the cheap festival days first (progressive), and
 *   3. it reads/writes the SHARED day-input store the finder + warmup fill,
 *      so re-entry and an already-warmed picker make it near-instant — keyed by
 *      ABSOLUTE date, so a second scan starting on a different day still hits.
 * Real engine on a pinned 2026 date (Ujjain default) — no engine mocks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { UJJAIN_GEO } from '../engine';
import { dateKeyFor, dayStoreFor, scopeKeyFor } from '../panchangDayStore';
import {
  scanAbujhDays,
  dayAt,
  FIRST_AFTER_MAX_DAYS,
  type AbujhDay,
} from '../muhuratFinderScan';

const START = new Date(2026, 7, 12); // 12 Aug 2026
const LOC = { ...UJJAIN_GEO, cityId: 'ujjain' };
const OPTS = { calendarSystem: 'purnimant' as const, location: LOC };

test('scanAbujhDays resolves with festival + pushya days and never hangs', async () => {
  const days = await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  assert.ok(days.length >= 1, 'returns at least one abujh day');
  assert.ok(days.some((d) => d.nameEn === 'Dussehra'), 'includes the festival abujh day (Dussehra)');
  assert.ok(days.some((d) => d.source === 'pushya'), 'includes a computed pushya day');
  // Sorted ascending by date.
  for (let i = 1; i < days.length; i += 1) assert.ok(days[i].dateMs >= days[i - 1].dateMs);
});

test('paints festival days progressively — first onProgress arrives before the full scan', async () => {
  const emissions: AbujhDay[][] = [];
  await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: (d) => emissions.push(d),
  });
  assert.ok(emissions.length >= 1, 'onProgress fired at least once during the scan');
  // The very first paint already carries the (cheap, precomputed) festival day —
  // the user sees content immediately instead of a bare spinner.
  assert.ok(
    emissions[0].some((d) => d.source === 'festival'),
    'first emission contains the festival day'
  );
});

test('writes solved days into the SHARED day store, keyed by absolute date', async () => {
  const scope = scopeKeyFor(LOC, 'purnimant');
  dayStoreFor(scope).clear();
  await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const cache = dayStoreFor(scope);
  assert.ok(cache.size > 0, 'the scan populated the shared store the finder reads');
  // A Thursday/Sunday day within the horizon must be present (pushya path), and
  // it must be stored under its own civil date — not an index off `start`, which
  // would miss the moment a later scan starts on a different day.
  const firstThursday = (() => {
    for (let i = 0; i < FIRST_AFTER_MAX_DAYS; i += 1) {
      const d = dayAt(START, i);
      if (d.getDay() === 4) return d;
    }
    throw new Error('no Thursday in horizon');
  })();
  assert.ok(cache.has(dateKeyFor(firstThursday)), 'cached a Thu solve under its absolute date key');
});

test('a second scan starting a day later reuses the first scan’s solves', async () => {
  const scope = scopeKeyFor(LOC, 'purnimant');
  dayStoreFor(scope).clear();
  await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const solved = new Map(dayStoreFor(scope));
  // Tomorrow's scan covers the same calendar days minus one; every day it needs
  // was already solved yesterday, so nothing may be recomputed for them — the
  // whole point of absolute-date keying (a midnight rollover used to re-solve all).
  await scanAbujhDays(dayAt(START, 1), FIRST_AFTER_MAX_DAYS - 1, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const after = dayStoreFor(scope);
  for (const [key, inputs] of solved) {
    assert.equal(after.get(key), inputs, `day ${key} was re-solved instead of reused`);
  }
});

test('a single bad day-solve is skipped, not fatal — the scan still resolves', async () => {
  const scope = scopeKeyFor(LOC, 'purnimant');
  const cache = dayStoreFor(scope);
  cache.clear();
  // Poison the first Thursday with a malformed panchang so pushyaYogaFor throws
  // when the scan reads it. The per-day guard must swallow it.
  let poisoned = START;
  for (let i = 0; i < FIRST_AFTER_MAX_DAYS; i += 1) {
    const d = dayAt(START, i);
    if (d.getDay() === 4) { poisoned = d; break; }
  }
  cache.set(dateKeyFor(poisoned), { p: {} as never, asta: {} as never, lagnas: [] });
  const days = await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  assert.ok(days.some((d) => d.nameEn === 'Dussehra'), 'still returns the festival day despite the bad solve');
});

test('respects cancellation — stops and returns what it has', async () => {
  const days = await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => true, // cancelled before any pushya work
    onProgress: () => {},
  });
  assert.ok(Array.isArray(days), 'returns an array even when cancelled immediately');
});
