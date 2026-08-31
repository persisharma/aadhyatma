import assert from 'node:assert/strict';
import { test } from 'node:test';

import { matchesLunarTithiRuleOnDate, resolveObservancesForYear } from '../festivalEngine';
import { getRuleById } from '../vratCatalog';

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

// ─── Chandrodaya (moonrise-vyapini) day selection ────────────────────────────
// Sankashti Chaturthi and Karwa Chauth are fixed by the tithi running at
// MOONRISE, not at sunrise: the vrat ends with the moon sighting and arghya.
// Krishna Chaturthi typically opens mid-morning and closes before the next
// mid-morning, so udaya matching named the day AFTER the night the moon is
// worshipped — Bhadrapada 2026 resolved to 1 Sep, whose 9:22 PM moonrise falls
// in Panchami, instead of 31 Aug, whose 8:39 PM moonrise falls in Chaturthi.
// These are published civil dates (Ujjain/IST), NOT engine output.
const SANKASHTI_2025 = [
  '2025-01-17', '2025-02-16', '2025-03-17', '2025-04-16', '2025-05-16', '2025-06-14',
  '2025-07-14', '2025-08-12', '2025-09-10', '2025-10-10', '2025-11-08', '2025-12-07',
];

function engineDates(id: string, year: number): string[] {
  return resolveObservancesForYear(year, 'purnimant')
    .filter((x) => x.rule.id === id)
    .map((x) => iso(x.date));
}

test('Sankashti Chaturthi lands on the moonrise day for every lunation of 2025', () => {
  assert.deepEqual(engineDates('sankashti-chaturthi-vrat', 2025), SANKASHTI_2025);
});

test('Sankashti Chaturthi is on 31 Aug 2026, the night Chaturthi covers moonrise', () => {
  // The reported case: Chaturthi runs 31 Aug 8:51 AM → 1 Sep 7:42 AM, so only
  // the 31st has a moon to break the fast by.
  const dates = engineDates('sankashti-chaturthi-vrat', 2026);
  assert.ok(dates.includes('2026-08-31'), `expected 2026-08-31 in ${dates.join(' ')}`);
  assert.ok(!dates.includes('2026-09-01'), `2026-09-01 has no Chaturthi moonrise: ${dates.join(' ')}`);
});

test('every lunation keeps exactly one Sankashti Chaturthi', () => {
  // Guards both chandrodaya edges: the "first of two" dedupe when the tithi
  // spans two moonrises (Mar 2025, Jun 2026) must not emit twice, and the udaya
  // fallback when no moonrise falls inside it (Kartik 2025) must not drop one.
  for (const year of [2024, 2025, 2026, 2027, 2028]) {
    const dates = engineDates('sankashti-chaturthi-vrat', year);
    assert.ok(dates.length >= 12 && dates.length <= 13, `${year}: got ${dates.length} Sankashtis`);
    assert.equal(new Set(dates).size, dates.length, `${year}: duplicate Sankashti dates`);
    for (let i = 1; i < dates.length; i += 1) {
      const gap = dayDiff(dates[i - 1], dates[i]);
      assert.ok(gap >= 28 && gap <= 31, `${year}: ${dates[i - 1]} → ${dates[i]} is ${gap} days apart`);
    }
  }
});

test('Karwa Chauth falls on its month’s Sankashti Chaturthi', () => {
  // Both are Kartik Krishna Chaturthi under the same moonrise convention; a day
  // apart would put the same tithi's vrats on different nights.
  for (const year of [2024, 2025, 2026, 2027, 2028]) {
    const [karwa] = engineDates('karwa-chauth', year);
    assert.ok(karwa, `${year}: Karwa Chauth must resolve`);
    assert.ok(
      engineDates('sankashti-chaturthi-vrat', year).includes(karwa),
      `${year}: Karwa Chauth ${karwa} is not a Sankashti date`
    );
  }
});

test('Karwa Chauth matches its published dates', () => {
  assert.equal(engineDates('karwa-chauth', 2024)[0], '2024-10-20');
  assert.equal(engineDates('karwa-chauth', 2025)[0], '2025-10-10');
  assert.equal(engineDates('karwa-chauth', 2026)[0], '2026-10-29');
});

test('the live matcher agrees with the shipped table on the reported dates', () => {
  // resolveObservancesForYear reads precomputedObservances.ts; this pins the
  // MATCHER itself, so a regression is caught even without regenerating, and a
  // stale table is caught when it is regenerated but the matcher moved.
  const rule = getRuleById('sankashti-chaturthi-vrat');
  assert.ok(rule, 'sankashti-chaturthi-vrat must exist');
  assert.equal(matchesLunarTithiRuleOnDate(rule!, new Date(2026, 7, 31, 12), 'purnimant'), true);
  assert.equal(matchesLunarTithiRuleOnDate(rule!, new Date(2026, 8, 1, 12), 'purnimant'), false);
  // Kartik 2025: no moonrise falls inside Chaturthi, so the udaya day stands.
  assert.equal(matchesLunarTithiRuleOnDate(rule!, new Date(2025, 9, 10, 12), 'purnimant'), true);
  assert.equal(matchesLunarTithiRuleOnDate(rule!, new Date(2025, 9, 9, 12), 'purnimant'), false);
});

// ─── Teej family ──────────────────────────────────────────────────────────────
// The catalog carried only Hartalika Teej (Bhadrapada SHUKLA 3); Hariyali Teej
// (Shravana Shukla 3) and Kajari/Badi Teej (Bhadrapada Krishna 3) were missing
// entirely, so the biggest women's vrat days rendered "no vrat or festival"
// (Aug 2026 report — 31 Aug 2026 is Kajari Teej AND Sankashti Chaturthi).
// Published civil dates (drikpanchang/prokerala, udaya tithi), NOT engine output.
test('Hariyali and Kajari Teej match their published dates', () => {
  assert.equal(engineDates('hariyali-teej', 2024)[0], '2024-08-07');
  assert.equal(engineDates('hariyali-teej', 2025)[0], '2025-07-27');
  assert.equal(engineDates('hariyali-teej', 2026)[0], '2026-08-15');
  assert.equal(engineDates('kajari-teej', 2024)[0], '2024-08-22');
  assert.equal(engineDates('kajari-teej', 2025)[0], '2025-08-12');
  assert.equal(engineDates('kajari-teej', 2026)[0], '2026-08-31');
});

test('the three Teej land in order: Hariyali, then Kajari, then Hartalika', () => {
  // Shukla 3 → next Krishna 3 → next Shukla 3: ~15 days apart each. A month
  // mix-up (the amanta/purnimant trap Janmashtami once fell into) breaks this.
  for (const year of [2024, 2025, 2026, 2027, 2028]) {
    const [hariyali] = engineDates('hariyali-teej', year);
    const [kajari] = engineDates('kajari-teej', year);
    const [hartalika] = engineDates('hartalika-teej', year);
    assert.ok(hariyali && kajari && hartalika, `${year}: all three Teej must resolve`);
    const gap1 = dayDiff(hariyali, kajari);
    const gap2 = dayDiff(kajari, hartalika);
    assert.ok(new Date(hariyali) < new Date(kajari) && new Date(kajari) < new Date(hartalika), `${year}: order broke (${hariyali}, ${kajari}, ${hartalika})`);
    assert.ok(gap1 >= 13 && gap1 <= 17, `${year}: Hariyali → Kajari gap ${gap1}`);
    assert.ok(gap2 >= 13 && gap2 <= 17, `${year}: Kajari → Hartalika gap ${gap2}`);
  }
});

// ─── Bahula Chaturthi / Bol Choth ─────────────────────────────────────────────
// The named women's vrat for children on Bhadrapada Krishna Chaturthi — the
// generic monthly Sankashti card alone did not convey it (Aug 2026 report,
// "Chauth too"). Chandrodaya like its Sankashti sibling: the fast concludes
// after the evening Godhuli puja and moonrise. Published dates, NOT engine output.
test('Bahula Chaturthi matches its published dates and rides the Sankashti day', () => {
  assert.equal(engineDates('bahula-chaturthi', 2025)[0], '2025-08-12');
  assert.equal(engineDates('bahula-chaturthi', 2026)[0], '2026-08-31');
  for (const year of [2024, 2025, 2026, 2027, 2028]) {
    const dates = engineDates('bahula-chaturthi', year);
    assert.equal(dates.length, 1, `${year}: exactly one Bahula Chaturthi, got ${dates.join(' ')}`);
    assert.ok(
      engineDates('sankashti-chaturthi-vrat', year).includes(dates[0]),
      `${year}: Bahula Chaturthi ${dates[0]} is not that month's Sankashti day (RULEBOOK §23.4)`
    );
  }
});
