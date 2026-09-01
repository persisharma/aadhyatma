/**
 * Event-muhurat goldens against PUBLISHED lists (PRD-16 §7, RULEBOOK §17.10 —
 * the validation harness owed since Phase 1).
 *
 * Golden rows live in fixtures/drikpanchang-event-muhurat.json and were
 * transcribed from DrikPanchang's published Griha Pravesh list (see the
 * fixture's `source` block for the exact provenance chain). Two row kinds:
 *
 *  - `offered`: the published list carries the date and the finder must not
 *    exclude it.
 *  - `documented-divergence`: the published list carries the date but a
 *    RECORDED convention decision (currently only the tithi-span Chaturmas
 *    reading, PRD-16 §9.1 / TRD-16/P2 §4.3) makes the engine exclude it —
 *    asserted AS a divergence, naming the exact dosha, so the disagreement is
 *    pinned in the open instead of hidden. If the convention decision changes,
 *    this test fails loudly and the row flips to `offered`.
 *
 * Standing gotcha: NEVER "fix" a failure here by copying engine output into
 * the fixture or by widening what `offered` means. Extend the fixture only
 * from published lists.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { computePanchangForDate, sunriseForDate, UJJAIN_GEO } from '../engine';
import { computeMuhuratDay } from '../muhurat';
import { lagnaSpansForDay } from '../lagnaSweep';
import {
  computeAstaFlags,
  evaluateDay,
  getEventRule,
  type DoshaKey,
  type OccasionId,
} from '../eventMuhurat';

type GoldenRow = {
  occasionId: OccasionId;
  date: string;
  publishedListed: boolean;
  expected: 'offered' | 'documented-divergence';
  divergenceDosha?: DoshaKey;
  note?: string;
};
const fixture = JSON.parse(
  readFileSync(join(import.meta.dirname, 'fixtures/drikpanchang-event-muhurat.json'), 'utf8')
) as { source: { locationCityId: string }; rows: GoldenRow[] };

const LOC = { ...UJJAIN_GEO, cityId: 'ujjain' };

function verdictFor(row: GoldenRow) {
  const [y, m, d] = row.date.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const opts = { location: LOC };
  const p = computePanchangForDate(date, opts);
  const next = computePanchangForDate(new Date(y, m - 1, d + 1), opts);
  const muhurat = computeMuhuratDay(p.sunrise, p.sunset, next.sunrise, date.getDay());
  const asta = computeAstaFlags(new Date(y, m - 1, d, 12));
  const lagnas = lagnaSpansForDay(
    p.sunrise,
    sunriseForDate(new Date(y, m - 1, d + 1), opts),
    LOC.latitude,
    LOC.longitude
  );
  return evaluateDay(getEventRule(row.occasionId), date.getTime(), date.getDay(), p, muhurat, asta, { lagnas });
}

test('the fixture is non-trivial and every row cites a published listing', () => {
  assert.ok(fixture.rows.length >= 4, 'the golden set must not shrink');
  for (const row of fixture.rows) {
    assert.equal(row.publishedListed, true, `${row.date}: goldens come from published lists only`);
    assert.ok(row.expected === 'offered' || row.expected === 'documented-divergence');
    if (row.expected === 'documented-divergence') {
      assert.ok(row.divergenceDosha, `${row.date}: a divergence must name its dosha`);
      assert.ok(row.note, `${row.date}: a divergence must cite the recorded decision`);
    }
  }
});

for (const row of fixture.rows) {
  test(`${row.occasionId} ${row.date}: published-list golden (${row.expected})`, () => {
    const v = verdictFor(row);
    if (row.expected === 'offered') {
      assert.notEqual(v.tier, 'excluded', `published list offers ${row.date}; engine excluded it (${v.doshas.join(',')})`);
      assert.ok(v.windows.length > 0, `${row.date}: an offered day must carry at least one window`);
    } else {
      assert.equal(v.tier, 'excluded', `${row.date}: the recorded divergence has closed — flip this row to 'offered'`);
      assert.ok(
        v.doshas.includes(row.divergenceDosha!),
        `${row.date}: exclusion must name ${row.divergenceDosha}, got [${v.doshas.join(',')}]`
      );
    }
  });
}
