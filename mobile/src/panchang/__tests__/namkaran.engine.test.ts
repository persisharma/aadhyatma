import assert from 'node:assert/strict';
import test from 'node:test';

import { computeGrahaPositions, DASHA_ORDER, PADA_SPAN } from '../kundali';
import {
  calculateNamkaran,
  candidateFromLongitude,
  charanaOf,
  charanaSetForDay,
  rashiCharanaEntries,
  rashiSyllables,
} from '../namkaran';
import {
  CHARANA_TABLE,
  NAKSHATRA_ATTRS,
  NAMAKSHAR_SOURCE,
} from '../namkaranConvention';

test('the draft convention has exactly 108 charanas and 27 consistent attributes', () => {
  assert.equal(CHARANA_TABLE.length, 108);
  assert.equal(NAKSHATRA_ATTRS.length, 27);
  assert.equal(NAMAKSHAR_SOURCE.verified, false);
  CHARANA_TABLE.forEach((entry, index) => {
    assert.equal(entry.charanaIndex, index);
    assert.equal(entry.nakshatraIndex, Math.floor(index / 4));
    assert.equal(entry.pada, (index % 4) + 1);
    assert.ok(entry.syllables.length > 0);
  });
  NAKSHATRA_ATTRS.forEach((entry, index) => {
    assert.equal(entry.lord, DASHA_ORDER[index % 9]);
  });
});

test('all 108 half-open boundaries resolve below, at, and above without drift', () => {
  const epsilon = 1e-9;
  for (let boundary = 0; boundary < 108; boundary += 1) {
    const longitude = boundary * PADA_SPAN;
    assert.equal(charanaOf(longitude), boundary);
    assert.equal(charanaOf(longitude + epsilon), boundary);
    assert.equal(charanaOf(longitude - epsilon), (boundary + 107) % 108);
  }
  assert.equal(charanaOf(360), 0);
  assert.equal(charanaOf(-PADA_SPAN), 107);
});

test('Namkaran classification agrees with Kundali Moon classification', () => {
  const dates = [
    new Date('2026-08-13T07:30:00.000Z'),
    new Date('2001-01-01T00:00:00.000Z'),
    new Date('1992-08-14T00:12:00.000Z'),
  ];
  for (const date of dates) {
    const moon = computeGrahaPositions({
      date,
      latitude: 28.6139,
      longitude: 77.209,
      timezone: 'Asia/Kolkata',
    }, 0).find((position) => position.graha === 'moon')!;
    const namkaran = candidateFromLongitude(moon.siderealLongitude);
    assert.equal(namkaran.entry.nakshatraIndex, moon.nakshatraIndex);
    assert.equal(namkaran.entry.pada, moon.pada);
    assert.equal(namkaran.rashiIndex, moon.rashiIndex);
  }
});

test('unknown time uses bisection windows and handles the 360 to zero wrap', () => {
  const start = Date.parse('2026-08-12T18:30:00.000Z');
  const resolver = (date: Date) => (358 + ((date.getTime() - start) / 86_400_000) * 15) % 360;
  const candidates = charanaSetForDay('2026-08-13', resolver);
  assert.deepEqual(candidates.map((value) => value.entry.charanaIndex), [107, 0, 1, 2, 3]);
  assert.equal(candidates[0].window?.startMs, start);
  assert.equal(candidates.at(-1)?.window?.endMs, start + 86_400_000 - 1);
  candidates.forEach((candidate, index) => {
    assert.ok(candidate.window);
    if (index > 0) {
      assert.equal(candidate.window!.startMs, candidates[index - 1].window!.endMs + 1);
    }
  });
});

test('a stable injected day still returns a range with one honest window', () => {
  const result = calculateNamkaran(
    { kind: 'dayIST', civilDate: '2026-08-13' },
    () => 12.5
  );
  assert.equal(result.kind, 'range');
  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].entry.charanaIndex, 3);
});

test('rashi sets are derived as twelve disjoint groups of nine charanas', () => {
  const all = [];
  for (let rashi = 0; rashi < 12; rashi += 1) {
    const entries = rashiCharanaEntries(rashi);
    assert.equal(entries.length, 9);
    assert.equal(rashiSyllables(rashi).length, entries.flatMap((entry) => entry.syllables).length);
    all.push(...entries.map((entry) => entry.charanaIndex));
  }
  assert.deepEqual(all, Array.from({ length: 108 }, (_, index) => index));
});
