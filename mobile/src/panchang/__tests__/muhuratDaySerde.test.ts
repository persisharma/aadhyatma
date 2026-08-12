/**
 * The persisted muhurat day-cache stores full `PanchangData` (which carries ~6
 * Date fields plus Date-bearing angas). Persistence is worthless if a rehydrated
 * day differs from a freshly computed one, so these pin an exact Date-preserving
 * round-trip and graceful handling of corrupt storage.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { computePanchangForDate, UJJAIN_GEO } from '../engine';
import { computeAstaFlags } from '../eventMuhurat';
import { serializeDayInputs, reviveDayInputs, type DayInputs } from '../muhuratDaySerde';

const opts = { calendarSystem: 'purnimant' as const, location: { ...UJJAIN_GEO, cityId: 'ujjain' } };
const makeDay = (d: Date): DayInputs => ({
  p: computePanchangForDate(d, opts),
  asta: computeAstaFlags(new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)),
});

test('serialize → revive reproduces the day exactly, Dates included', () => {
  const di = makeDay(new Date(2026, 7, 13));
  const back = reviveDayInputs(serializeDayInputs(di));
  assert.ok(back, 'revives to a value');
  assert.deepEqual(back, di, 'round-trips identically');
  // Spot-check the Date fields specifically (deepEqual compares Dates by value).
  assert.ok(back!.p.sunrise instanceof Date && back!.p.sunrise.getTime() === di.p.sunrise.getTime());
  assert.ok(back!.p.date instanceof Date);
  assert.ok(back!.p.brahmaMuhurta.start instanceof Date);
});

test('a kshaya day (null angas + Date endTimes) also round-trips', () => {
  // Scan a stretch for a day whose next-sunrise anga is skipped, to cover the
  // null-kshaya and PanchangElement.endTime Date paths.
  let kshaya: DayInputs | null = null;
  for (let i = 0; i < 120 && !kshaya; i += 1) {
    const day = makeDay(new Date(2026, 7, 1 + i));
    if (day.p.kshayaTithi || day.p.kshayaNakshatra) kshaya = day;
  }
  if (!kshaya) return; // no kshaya day in range — nothing to assert
  const back = reviveDayInputs(serializeDayInputs(kshaya));
  assert.deepEqual(back, kshaya);
});

test('corrupt / non-JSON storage revives to null, never throws', () => {
  assert.equal(reviveDayInputs('not json'), null);
  assert.equal(reviveDayInputs(''), null);
});
