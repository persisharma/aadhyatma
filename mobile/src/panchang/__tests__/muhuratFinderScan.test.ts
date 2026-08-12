/**
 * Unit coverage for the abujh scan core (PRD-16 Phase 1). These pin the three
 * fixes that made the "Special days" card feel stuck on a real device:
 *   1. it always resolves (a single bad day-solve is skipped, never strands),
 *   2. it paints the cheap festival days first (progressive), and
 *   3. it reads/writes the SHARED day-input cache the finder + warmup fill,
 *      so re-entry and an already-warmed picker make it near-instant.
 * Real engine on a pinned 2026 date (Ujjain default) — no engine mocks.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { UJJAIN_GEO } from '../engine';
import {
  scanAbujhDays,
  dayInputsFor,
  scanKeyFor,
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

test('writes solved days into the SHARED day-input cache (finder/warmup reuse)', async () => {
  const key = scanKeyFor(LOC, 'purnimant', START);
  dayInputsFor(key).clear();
  await scanAbujhDays(START, FIRST_AFTER_MAX_DAYS, OPTS, {
    isCancelled: () => false,
    onProgress: () => {},
  });
  const cache = dayInputsFor(key);
  assert.ok(cache.size > 0, 'the scan populated the shared cache the finder reads');
  // A Thursday/Sunday index within the horizon must be present (pushya path).
  const hasWeekendIndex = [...cache.keys()].some((i) => {
    const wd = new Date(START.getFullYear(), START.getMonth(), START.getDate() + i).getDay();
    return wd === 0 || wd === 4;
  });
  assert.ok(hasWeekendIndex, 'cached a Thu/Sun solve for later reuse');
});

test('a single bad day-solve is skipped, not fatal — the scan still resolves', async () => {
  const key = scanKeyFor(LOC, 'purnimant', START);
  const cache = dayInputsFor(key);
  cache.clear();
  // Poison the first Thursday index with a malformed panchang so pushyaYogaFor
  // throws when the scan reads it. The per-day guard must swallow it.
  let poisoned = -1;
  for (let i = 0; i < FIRST_AFTER_MAX_DAYS; i += 1) {
    const wd = new Date(START.getFullYear(), START.getMonth(), START.getDate() + i).getDay();
    if (wd === 4) { poisoned = i; break; }
  }
  cache.set(poisoned, { p: {} as never, asta: {} as never });
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
