import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveObservancesForYear } from '../festivalEngine';

// CI guard for the "Janmashtami one lunar month early" class of bug. The full cross-check
// (engine vs independently muhurta-recomputed dates for every major festival, 2025-2027)
// lives in scripts/verify-observances.mts (`npm run verify:observances`) — too heavy for a
// unit run. Here we assert, fast, against authoritative anchor dates (drikpanchang/Uj/IST)
// that no anchored festival is in the wrong lunar month. ±1 day is tolerated: that is the
// separate, pre-existing sunrise-vs-muhurta (Nishita/Madhyahna/Pradosh) limitation
// documented in VERIFICATION.md, not the month bug.
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
function engineDate(id: string, year: number): string | null {
  const o = resolveObservancesForYear(year, 'purnimant').find((x) => x.rule.id === id);
  return o ? iso(o.date) : null;
}
const dayDiff = (a: string, b: string) => Math.abs((new Date(a).getTime() - new Date(b).getTime()) / 86400000);

// Real published civil dates (Ujjain/IST). Source of truth — NOT engine output.
const ANCHORS: Record<string, string> = {
  'janmashtami:2025': '2025-08-16', 'janmashtami:2026': '2026-09-04',
  'maha-shivaratri:2025': '2025-02-26', 'maha-shivaratri:2026': '2026-02-15', 'maha-shivaratri:2027': '2027-03-06',
  'ganesh-chaturthi:2025': '2025-08-27', 'ganesh-chaturthi:2026': '2026-09-14',
  'diwali:2025': '2025-10-20', 'ram-navami:2025': '2025-04-06', 'narada-jayanti:2025': '2025-05-13',
  'holi:2025': '2025-03-14', 'dussehra:2025': '2025-10-02', 'navratri-start:2025': '2025-09-22',
};

test('no anchored festival drifts a whole lunar month (Janmashtami-class regression guard)', () => {
  for (const [key, expected] of Object.entries(ANCHORS)) {
    const [id, yearStr] = key.split(':');
    const got = engineDate(id, Number(yearStr));
    assert.ok(got, `${key}: festival must resolve (got nothing)`);
    assert.ok(
      dayDiff(got!, expected) <= 1,
      `${key}: resolved ${got} but real date is ${expected} (off by >1 day → wrong lunar month)`
    );
  }
});

test('Janmashtami resolves exactly to its real civil date', () => {
  assert.equal(engineDate('janmashtami', 2025), '2025-08-16');
  assert.equal(engineDate('janmashtami', 2026), '2026-09-04'); // Friday
});

test('Maha Shivaratri is in February (Phalguna), never January (Magha)', () => {
  for (const year of [2025, 2026]) {
    const got = engineDate('maha-shivaratri', year);
    assert.ok(got, `Maha Shivaratri ${year} must resolve`);
    assert.equal(new Date(got!).getMonth(), 1, `Maha Shivaratri ${year} must be February, got ${got}`);
  }
});
