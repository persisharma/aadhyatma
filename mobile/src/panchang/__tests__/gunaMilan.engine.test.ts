import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  aggregateGunaMilanPossibilities,
  calculateGunaMilanFromLongitudes,
  classifyMoonLongitude,
  enumerateMoonClassificationsForIstDate,
  normalizeLongitude,
  parseIstMoment,
  type KootaId,
} from '../gunaMilan';
import { KOOTA_MAX } from '../gunaMilanConvention';

const EPSILON = 1e-8;

test('longitude normalization is stable at the 0/360 seam', () => {
  assert.equal(normalizeLongitude(360), 0);
  assert.equal(normalizeLongitude(-1), 359);
  assert.equal(normalizeLongitude(721), 1);
  assert.throws(() => normalizeLongitude(Number.NaN), /finite/);
});

test('every pada/nakshatra/rashi boundary classifies below, at, and above', () => {
  const boundaries = new Set<number>();
  for (let index = 1; index < 108; index += 1) boundaries.add(index * 360 / 108);
  for (let index = 1; index < 12; index += 1) boundaries.add(index * 30);

  for (const boundary of boundaries) {
    const below = classifyMoonLongitude(boundary - EPSILON);
    const at = classifyMoonLongitude(boundary);
    const above = classifyMoonLongitude(boundary + EPSILON);
    assert.deepEqual(
      [at.nakshatraIndex, at.padaIndex, at.rashiIndex],
      [above.nakshatraIndex, above.padaIndex, above.rashiIndex],
      `at ${boundary}° belongs to the interval beginning there`
    );
    assert.notDeepEqual(
      [below.nakshatraIndex, below.padaIndex, below.rashiIndex],
      [above.nakshatraIndex, above.padaIndex, above.rashiIndex],
      `classification changes across ${boundary}°`
    );
  }
});

test('Vashya uses exact Sagittarius and Capricorn 15-degree splits', () => {
  assert.equal(classifyMoonLongitude(255 - EPSILON).vashya, 'manava');
  assert.equal(classifyMoonLongitude(255).vashya, 'chatushpada');
  assert.equal(classifyMoonLongitude(285 - EPSILON).vashya, 'chatushpada');
  assert.equal(classifyMoonLongitude(285).vashya, 'jalachara');
});

test('all 108×108 pada combinations remain bounded and sum exactly', () => {
  const seenScores = new Map<KootaId, Set<number>>(
    (Object.keys(KOOTA_MAX) as KootaId[]).map((id) => [id, new Set()])
  );
  for (let groomPada = 0; groomPada < 108; groomPada += 1) {
    for (let bridePada = 0; bridePada < 108; bridePada += 1) {
      const result = calculateGunaMilanFromLongitudes(
        (groomPada + 0.5) * 360 / 108,
        (bridePada + 0.5) * 360 / 108
      );
      const sum = result.kootas.reduce((value, koota) => value + koota.score, 0);
      assert.equal(result.total, sum);
      assert.ok(result.total >= 0 && result.total <= 36);
      for (const koota of result.kootas) {
        assert.ok(koota.score >= 0 && koota.score <= koota.max, koota.id);
        seenScores.get(koota.id)!.add(koota.score);
      }
    }
  }
  // Pin the complete set of score values each koota can actually produce across
  // every nakshatra/rashi pair. This exercises every reachable matrix cell path
  // and fails loudly if a table cell is edited out of range or a classification
  // mapping goes degenerate. tara has no 0: the two inclusive counts sum to 29
  // (≡ 2 mod 9), which no pair of unfavorable remainders {3,5,7} can reach, so
  // both directions can never be unfavorable at once.
  const sorted = (id: KootaId) => [...seenScores.get(id)!].sort((a, b) => a - b);
  assert.deepEqual(sorted('varna'), [0, 1]);
  assert.deepEqual(sorted('vashya'), [0, 0.5, 1, 2]);
  assert.deepEqual(sorted('tara'), [1.5, 3]);
  assert.deepEqual(sorted('yoni'), [0, 1, 2, 3, 4]);
  assert.deepEqual(sorted('grahaMaitri'), [0, 0.5, 1, 3, 4, 5]);
  assert.deepEqual(sorted('gana'), [0, 1, 5, 6]);
  assert.deepEqual(sorted('bhakoot'), [0, 7]);
  assert.deepEqual(sorted('nadi'), [0, 8]);
});

test('directional rules are explicit', () => {
  const forward = calculateGunaMilanFromLongitudes(126, 90.1);
  const reverse = calculateGunaMilanFromLongitudes(90.1, 126);
  const byId = (id: KootaId, result: typeof forward) => result.kootas.find((row) => row.id === id)!.score;

  assert.notEqual(byId('varna', forward), byId('varna', reverse));
  assert.notEqual(byId('gana', forward), byId('gana', reverse));
  for (const id of ['tara', 'grahaMaitri', 'bhakoot', 'nadi'] as KootaId[]) {
    assert.equal(byId(id, forward), byId(id, reverse), id);
  }
});

test('B. V. Raman Yoni table preserves its asymmetric orientations', () => {
  const yoniScore = (groomNakshatra: number, brideNakshatra: number): number => {
    const result = calculateGunaMilanFromLongitudes(
      (groomNakshatra + 0.5) * 360 / 27,
      (brideNakshatra + 0.5) * 360 / 27
    );
    return result.kootas.find((row) => row.id === 'yoni')!.score;
  };

  // Row is bride and column is groom: Horse row → Deer column is 3,
  // while the reversed Deer row → Horse column remains 1.
  assert.equal(yoniScore(16, 0), 3);
  assert.equal(yoniScore(0, 16), 1);
  // Lion row → Buffalo column is 2; the reverse is 1.
  assert.equal(yoniScore(12, 22), 2);
  assert.equal(yoniScore(22, 12), 1);
});

test('unknown-time aggregation returns exact only when every checked state agrees', () => {
  const groom = classifyMoonLongitude(1);
  const bride = classifyMoonLongitude(20);
  const stable = aggregateGunaMilanPossibilities([groom, { ...groom, longitude: 2 }], [bride]);
  assert.equal(stable.kind, 'exact');
  assert.equal(stable.allTimesChecked, true);
  assert.deepEqual(stable.unknownTimeRoles, ['groom']);
  assert.deepEqual(stable.groomNakshatraIndices, [0]);

  const changing = aggregateGunaMilanPossibilities(
    [classifyMoonLongitude(12), classifyMoonLongitude(14)],
    [bride]
  );
  assert.equal(changing.kind, 'range');
  if (changing.kind === 'range') {
    assert.ok(changing.maxTotal > changing.minTotal);
    assert.ok(changing.varyingKootas.length > 0);
    assert.equal(changing.possibilityCount, 2);
    assert.deepEqual(changing.unknownTimeRoles, ['groom']);
  }
});

test('IST parsing does not depend on the device timezone and rejects fabricated noon', () => {
  assert.equal(parseIstMoment('2000-01-01', '00:00').toISOString(), '1999-12-31T18:30:00.000Z');
  assert.equal(parseIstMoment('2000-01-01', '23:59').toISOString(), '2000-01-01T18:29:00.000Z');
  assert.throws(() => parseIstMoment('2026-02-30', '12:00'), /valid/);
  assert.throws(() => parseIstMoment('2026-02-01', ''), /24-hour/);
});

test('IST day enumeration visits each classification interval, including a degree split', () => {
  const dayStart = parseIstMoment('2026-01-01', '00:00').getTime();
  const resolver = (date: Date) => 254 + (date.getTime() - dayStart) / 86_400_000 * 4;
  const values = enumerateMoonClassificationsForIstDate('2026-01-01', resolver);
  assert.ok(values.some((value) => value.vashya === 'manava'));
  assert.ok(values.some((value) => value.vashya === 'chatushpada'));
  assert.ok(new Set(values.map((value) => value.padaIndex)).size >= 2);
});

test('engine source stays pure and uses the real Moon API', () => {
  const sourcePath = resolve(dirname(fileURLToPath(import.meta.url)), '../gunaMilan.ts');
  const source = readFileSync(sourcePath, 'utf8');
  assert.match(source, /getSiderealPlanetLongitude\('moon', date\)/);
  assert.doesNotMatch(source, /Date\.now\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /\bfetch\s*\(/);
  assert.doesNotMatch(source, /AsyncStorage|react-native|from ['"]react['"]/);
});
