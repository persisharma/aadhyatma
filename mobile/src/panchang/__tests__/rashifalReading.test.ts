import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { computeDetailedRashifal, readingTone } from '../rashifalReading';
import { computeKundali, computeRashiTransits, indiaDayAnchor } from '../kundali';

const chart = computeKundali({ date: new Date('1992-08-14T00:12:00Z'), latitude: 23.1765, longitude: 75.7885, timezone: 'Asia/Kolkata' });
const moon = chart.grahas.find((p) => p.graha === 'moon')!;
const date = new Date('2026-09-07T10:00:00Z');

test('all twelve signs and houses have complete readings grounded in the shared transit table', () => {
  const headlines = new Set<string>();
  const bodies = new Set<string>();
  for (let month = 0; month < 12; month++) {
    for (let sign = 0; sign < 12; sign++) {
      const day = new Date(Date.UTC(2026, month, 7, 10));
      const result = computeDetailedRashifal(day, sign);
      const transits = computeRashiTransits(day, sign);
      assert.equal(result.areas.length, 6);
      assert.equal(new Set(result.areas.map((a) => a.id)).size, 6);
      assert.equal(result.isPersonal, false);
      headlines.add(result.headline.en);
      bodies.add(result.areas[0].body.en);
      for (const area of result.areas) {
        for (const copy of [area.title, area.body, area.step]) {
          assert.ok(copy.hi.length > 5 && copy.en.length > 5);
        }
        assert.ok(area.evidence.length > 0);
        assert.equal(area.personalNote, null);
        for (const evidence of area.evidence) {
          const transit = transits.find((t) => t.graha === evidence.graha)!;
          assert.equal(evidence.houseFromMoon, transit.house);
          assert.equal(evidence.supportive, transit.supportive);
          assert.equal(evidence.houseFromLagna, null);
        }
      }
    }
  }
  assert.ok(headlines.size >= 6, 'the Moon house changes the headline theme');
  assert.ok(bodies.size >= 12, 'readings vary with placements, not just a date label');
});

test('mixed signals remain mixed rather than choosing the first observation', () => {
  assert.equal(readingTone([{ supportive: true }, { supportive: false }]), 'mixed');
  assert.equal(readingTone([{ supportive: false }, { supportive: true }]), 'mixed');
  assert.equal(readingTone([{ supportive: true }]), 'supportive');
  assert.equal(readingTone([{ supportive: false }]), 'reflective');
});

test('personal context is a strict layer and never leaks into another selected sign', () => {
  const personal = computeDetailedRashifal(date, moon.rashiIndex, chart);
  const general = computeDetailedRashifal(date, moon.rashiIndex);
  assert.equal(personal.isPersonal, true);
  personal.areas.forEach((area, i) => {
    assert.deepEqual(area.body, general.areas[i].body);
    assert.deepEqual(area.step, general.areas[i].step);
    assert.equal(area.tone, general.areas[i].tone);
    assert.ok(area.evidence.every((e) => e.houseFromLagna !== null));
  });
  const other = (moon.rashiIndex + 1) % 12;
  assert.deepEqual(computeDetailedRashifal(date, other, chart), computeDetailedRashifal(date, other));
  assert.ok(personal.areas.some((a) => a.personalNote !== null), 'current dasha context is interpreted');
});

test('same India civil day has one deterministic reading; midnight, month and year boundaries are explicit', () => {
  const snapshot = JSON.stringify(chart);
  for (const instant of ['2026-09-06T18:30:00Z', '2026-09-07T18:29:59Z']) {
    assert.deepEqual(computeDetailedRashifal(new Date(instant), moon.rashiIndex, chart),
      computeDetailedRashifal(date, moon.rashiIndex, chart));
  }
  for (const [instant, key] of [['2026-09-30T18:30:00Z', '2026-10-01'], ['2026-12-31T18:30:00Z', '2027-01-01']]) {
    assert.equal(computeDetailedRashifal(new Date(instant), 0).dateKey, key);
  }
  assert.deepEqual(computeDetailedRashifal(date, 0), computeDetailedRashifal(indiaDayAnchor(date), 0));
  assert.equal(JSON.stringify(chart), snapshot, 'input chart is not modified');
  assert.throws(() => computeDetailedRashifal(new Date('invalid'), 0));
  for (const sign of [-1, 12, 1.5, NaN]) assert.throws(() => computeDetailedRashifal(date, sign));
});

test('detailed reading stays pure, serializable and within guidance vocabulary', () => {
  const source = readFileSync('src/panchang/rashifalReading.ts', 'utf8');
  assert.doesNotMatch(source, /from ['"]react|AsyncStorage|Date\.now\s*\(|new Date\s*\(\s*\)|Math\.random|fetch\s*\(/);
  const result = computeDetailedRashifal(date, moon.rashiIndex, chart);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), result);
  assert.doesNotMatch(source, /will happen|guaranteed|certainly|अवश्य होगा|निश्चित रूप से|दुर्भाग्य|संकट|खतरा|\bdoom\b|misfortune|\bcurse\b/i);
});
