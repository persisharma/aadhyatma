/**
 * A year outside the baked observance table (2024–2035) must not freeze the app.
 *
 * `resolveObservancesForYear` used to answer such a year with the live scan — a
 * full year of per-day astronomy in one unyielded call, ~0.6 s on a desktop and
 * several seconds on a phone — and it is reached from render paths: paging the
 * Panchang calendar past the table stalled the screen. The year is now scanned
 * in time-sliced chunks in the background and published through the observance
 * store, which is what the hooks already re-resolve on.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { isObservanceDataReady, resolveObservancesForYear, resolveObservancesForYearLive } from '../festivalEngine';
import { subscribeObservanceStore } from '../observanceStore';
import type { ResolvedObservance } from '../types';

const flat = (list: ResolvedObservance[]) =>
  list.map((o) => `${o.rule.id}@${o.date.getFullYear()}-${o.date.getMonth() + 1}-${o.date.getDate()}`).sort();

test('a baked year still answers synchronously', () => {
  assert.equal(isObservanceDataReady(2026, 'purnimant'), true);
  assert.ok(resolveObservancesForYear(2026, 'purnimant').length > 100);
});

test('a year outside the table returns at once and lands from a background scan', async () => {
  const YEAR = 2041;
  assert.equal(isObservanceDataReady(YEAR, 'purnimant'), false, 'not ready before the scan');

  const landed = new Promise<void>((resolve) => {
    const off = subscribeObservanceStore(() => {
      off();
      resolve();
    });
  });

  const started = Date.now();
  const first = resolveObservancesForYear(YEAR, 'purnimant');
  const elapsed = Date.now() - started;
  assert.deepEqual(first, [], 'empty until the scan lands');
  // The live scan alone is several hundred ms even on a fast machine.
  assert.ok(elapsed < 250, `returned in ${elapsed} ms — the year scan ran on the calling path`);
  // Asking again while it runs neither blocks nor returns a half-scanned year.
  assert.deepEqual(resolveObservancesForYear(YEAR, 'purnimant'), []);

  await landed;
  assert.equal(isObservanceDataReady(YEAR, 'purnimant'), true);
  assert.deepEqual(
    flat(resolveObservancesForYear(YEAR, 'purnimant')),
    flat(resolveObservancesForYearLive(YEAR, 'purnimant')),
    'the background scan produces exactly the live year'
  );
});
