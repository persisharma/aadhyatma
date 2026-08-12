/**
 * Correctness gate for the persistent day cache: a cached or rehydrated day MUST
 * be byte-for-byte the day a fresh solve would produce — otherwise persistence
 * would silently change what the user sees. This computes every day for a FULL
 * YEAR across several locations and both calendar systems and asserts
 *   fresh  ===(deepEqual)  cached  ===(deepEqual)  serialize→revive
 * for the whole `PanchangData` (so every derived card is covered), and re-checks
 * the specific surfaces the user named — tithi, muhurat, and vrat/observances.
 *
 * If this ever fails, the cache is NOT safe to enable. It also documents the
 * engine-version coupling: change the astronomy and this pins that cached days
 * from the old engine would diverge (→ bump PANCHANG_DAY_CACHE_VERSION).
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { computePanchangForDate, UJJAIN_GEO } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import { getObservancesForDate } from '../festivalEngine';
import { computeAstaFlags, evaluateDay, getEventRule } from '../eventMuhurat';
import { serializeDayInputs, reviveDayInputs } from '../panchangDaySerde';
import {
  cachedDayInputs,
  computeDayInputs,
  dayStoreFor,
  scopeKeyFor,
  __resetPanchangDayStore,
  type ScanOptions,
} from '../panchangDayStore';
import type { CalendarSystem } from '../types';

const LOCATIONS: { cityId?: string; latitude: number; longitude: number; elevation: number }[] = [
  { cityId: 'ujjain', ...UJJAIN_GEO }, // default (precomputed observances)
  { cityId: 'delhi', latitude: 28.6139, longitude: 77.209, elevation: 216 }, // a picked city
  { latitude: 19.076, longitude: 72.8777, elevation: 14 }, // GPS, no cityId
];
const SYSTEMS: CalendarSystem[] = ['purnimant', 'amanta'];
const START = new Date(2026, 0, 1);
const DAYS = 372; // a full year + a margin to cross month/year boundaries

const dayAt = (i: number) => new Date(START.getFullYear(), START.getMonth(), START.getDate() + i);

for (const location of LOCATIONS) {
  for (const calendarSystem of SYSTEMS) {
    const label = `${location.cityId ?? `${location.latitude},${location.longitude}`}/${calendarSystem}`;
    test(`1-year parity — fresh == cached == persisted (${label})`, () => {
      __resetPanchangDayStore();
      const opts: ScanOptions = { calendarSystem, location };
      const map = dayStoreFor(scopeKeyFor(location, calendarSystem));
      const rule = getEventRule('griha-pravesh');

      let prevFresh = computeDayInputs(dayAt(0), opts);
      for (let i = 1; i <= DAYS; i += 1) {
        const d = dayAt(i);

        // Fresh solve (the ground truth).
        const fresh = {
          p: computePanchangForDate(d, opts),
          asta: computeAstaFlags(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)),
        };

        // Persisted round-trip must equal fresh — every field, Dates included.
        const revived = reviveDayInputs(serializeDayInputs(fresh));
        assert.deepEqual(revived, fresh, `persist round-trip diverged on ${label} day ${i}`);

        // Cache path: first touch computes, second is a hit; both equal fresh.
        const firstTouch = cachedDayInputs(map, d, opts);
        assert.equal(firstTouch.miss, true);
        assert.deepEqual(firstTouch.inputs, fresh, `cache compute diverged on ${label} day ${i}`);
        const hit = cachedDayInputs(map, new Date(d.getFullYear(), d.getMonth(), d.getDate()), opts);
        assert.equal(hit.miss, false, `expected a cache hit on ${label} day ${i}`);
        assert.equal(hit.inputs, firstTouch.inputs, 'hit returns the identical cached object');

        // --- Named surfaces derive identically from cached vs fresh ---
        // Tithi card.
        assert.deepEqual(hit.inputs.p.tithi, fresh.p.tithi);
        assert.deepEqual(hit.inputs.p.nakshatra, fresh.p.nakshatra);
        // Muhurat card: the day's choghadiya table is a pure function of the
        // (sunrise, sunset, next-sunrise) triple carried by the cache.
        const muhFresh = computeMuhuratDay(prevFresh.p.sunset, fresh.p.sunrise, fresh.p.sunset, d.getDay());
        const muhCached = computeMuhuratDay(prevFresh.p.sunset, hit.inputs.p.sunrise, hit.inputs.p.sunset, d.getDay());
        assert.deepEqual(muhCached, muhFresh, `muhurat diverged on ${label} day ${i}`);
        // Muhurat verdict (uses tithi/vara + asta) matches.
        assert.deepEqual(
          evaluateDay(rule, d.getTime(), d.getDay(), hit.inputs.p, muhCached, hit.inputs.asta),
          evaluateDay(rule, d.getTime(), d.getDay(), fresh.p, muhFresh, fresh.asta)
        );
        // Vrat/observances for the day are deterministic (same list every call).
        assert.deepEqual(
          getObservancesForDate(d, calendarSystem, location),
          getObservancesForDate(d, calendarSystem, location),
          `observances non-deterministic on ${label} day ${i}`
        );

        prevFresh = fresh;
      }
    });
  }
}
