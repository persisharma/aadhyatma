import assert from 'node:assert/strict';
import { test } from 'node:test';

import { resolveObservancesForYear } from '../festivalEngine';
import {
  deriveTithiRuleFromDate,
  entryMatchesDate,
  isValidTithiRule,
  nextObservanceForEntry,
  nextSarvapitriAmavasya,
  pakshaShraddhaDay,
  pitruPakshaWindow,
  pitruPakshaObservanceForDate,
  primePitruPakshaWindow,
  solveNextOccurrence,
  tithiRuleLabel,
  __resetPitruPakshaWindowCacheForTests,
} from '../pitruSmaran';

// PRD-17 Phase 1 — the pitru-smaran solvers must agree with the festival engine's
// conventions (sunrise anga, purnimant rules, kshaya fallback, vriddhi dedupe,
// adhik-maas nija guard) AND with independently published civil dates.
//
// External fixture verification (retrieved 2026-08-12; run under TZ=Asia/Kolkata,
// Ujjain default location — same basis as observanceDates.test.ts):
//   NOTE: drikpanchang.com is blocked by this environment's network egress proxy,
//   so direct WebFetch of DrikPanchang pages was impossible; each anchor below was
//   verified 2026-08-12 through web-search results that quote the DrikPanchang
//   pages named here, cross-checked against ≥2 independent published calendars.
//   • Pitru Paksha 2026: Purnima Shraddha Sat 26 Sep 2026; Pratipada 27 Sep;
//     "Chaturthi & Panchami" both listed 30 Sep (Panchami kshaya-adjacent);
//     Ashtami Shraddha Sat 3 Oct; Sarva Pitru Amavasya Sat 10 Oct 2026.
//     https://mahakaldarshan.co.in/blog/pitru-paksha-2026-calendar,
//     https://www.anytimeastro.com/blog/trending/sarva-pitru-amavasya/,
//     https://www.smartpuja.com/blog/pitru-paksha-2026-dates-shradh-rituals-tithi/
//   • Pitru Paksha 2025: Purnima Shraddha Sun 7 Sep 2025; window 8–21 Sep;
//     Sarvapitri Amavasya Sun 21 Sep 2025.
//     https://www.deccanherald.com/features/spirituality-and-wellness/pitru-paksha-2025-start-and-end-dates-guide-to-rituals-and-all-you-need-to-know-about-this-shradh-period-3718750
//   • Magha Krishna Ashtami (Masik Kalashtami) 2027: Fri 29 Jan 2027, tithi
//     04:02 AM 29 Jan → 04:57 AM 30 Jan (sunrise tithi = Ashtami on 29 Jan).
//     https://www.drikpanchang.com/vrats/masik-kalashtami-dates.html?year=2027
//     (via https://www.astroved.com/astropedia/en/festivals/krishna-paksha-ashtami?y=2027&m=01)
//   • Yogini Ekadashi 2026 (kshaya case): Fri 10 Jul 2026 — tithi 8:16 AM 10 Jul
//     → 5:23 AM 11 Jul, touching NO sunrise; observed the day it prevails.
//     https://www.drikpanchang.com/ekadashis/yogini/yogini-ekadashi-date-time.html?year=2026
//     (via https://www.prokerala.com/astrology/yogini-ekadashi-10-july-2026-timings.htm)
//   • Nirjala Ekadashi 2026 (adhik-maas case): Thu 25 Jun 2026, in the NIJA
//     Jyeshtha — 2026 carries an Adhik Jyeshtha (≈17 May–15 Jun), and Jyeshtha
//     vrats shift past it. https://www.prokerala.com/astrology/nirjala-ekadashi-25-june-2026-timings.htm,
//     https://amitray.com/nirjala-ekadashi-2026-date-time-rituals-mantras-significance/
//   • Janmashtami 2026 = Fri 4 Sep 2026 — already pinned as a DrikPanchang anchor
//     in observanceDates.test.ts.

const iso = (d: Date | null): string | null =>
  d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null;

const JANMASHTAMI_RULE = { lunarMonth: 6, paksha: 'krishna', tithi: 8 } as const;

test('deriveTithiRuleFromDate reads the sunrise tithi in purnimant convention', () => {
  // Janmashtami 2026 (4 Sep) is Bhadrapada Krishna Ashtami at sunrise.
  const rule = deriveTithiRuleFromDate(new Date(2026, 8, 4));
  assert.deepEqual(rule, { lunarMonth: 6, paksha: 'krishna', tithi: 8 });
  assert.equal(tithiRuleLabel(rule, 'hi'), 'भाद्रपद कृष्ण अष्टमी');
  assert.equal(tithiRuleLabel(rule, 'en'), 'Bhadrapada Krishna Ashtami');
});

test('derive → solve round-trips: solving the derived rule from the same date returns that date', () => {
  // Includes an amavasya (Sarvapitri 2026), a shukla ekadashi in a nija month
  // following an adhik maas, and an ordinary mid-paksha day.
  for (const d of [new Date(2026, 9, 10), new Date(2026, 5, 25), new Date(2026, 7, 12)]) {
    const rule = deriveTithiRuleFromDate(d);
    assert.ok(isValidTithiRule(rule), `derived rule must be valid for ${iso(d)}`);
    assert.equal(iso(solveNextOccurrence(rule, d)), iso(d), `round-trip failed for ${iso(d)}`);
  }
});

test('solveNextOccurrence agrees with the festival engine for the same rule (convention parity)', () => {
  // Janmashtami's catalog rule is the exact shape a personal rule takes
  // (lunarMonth 6 + krishna + tithi 8). The two solvers must give one date.
  const engineDate = resolveObservancesForYear(2026, 'purnimant')
    .find((o) => o.rule.id === 'janmashtami')?.date;
  assert.ok(engineDate, 'janmashtami must resolve in 2026');
  assert.equal(iso(solveNextOccurrence(JANMASHTAMI_RULE, new Date(2026, 0, 1))), iso(engineDate!));
  assert.equal(iso(engineDate!), '2026-09-04'); // the published anchor
});

test('normal year: Magha Krishna Ashtami next occurrence from Aug 2026 is 29 Jan 2027', () => {
  const next = solveNextOccurrence({ lunarMonth: 11, paksha: 'krishna', tithi: 8 }, new Date(2026, 7, 12));
  assert.equal(iso(next), '2027-01-29');
});

test('solveNextOccurrence is fromDate-inclusive (an occurrence today is "today", not next year)', () => {
  const next = solveNextOccurrence(JANMASHTAMI_RULE, new Date(2026, 8, 4));
  assert.equal(iso(next), '2026-09-04');
  const after = solveNextOccurrence(JANMASHTAMI_RULE, new Date(2026, 8, 5));
  assert.equal(after?.getFullYear(), 2027);
});

test('kshaya tithi: Ashadha Krishna Ekadashi 2026 resolves to 10 Jul, the day the tithi prevails', () => {
  // The Ekadashi tithi (8:16 AM 10 Jul → 5:23 AM 11 Jul IST) touches no sunrise —
  // the sunrise-tithi index jumps Dashami → Dwadashi. Without the shared kshaya
  // fallback this rule would silently vanish for the year.
  const next = solveNextOccurrence({ lunarMonth: 4, paksha: 'krishna', tithi: 11 }, new Date(2026, 0, 1));
  assert.equal(iso(next), '2026-07-10');
});

test('adhik maas: Jyeshtha rules skip Adhik Jyeshtha 2026 and land in the nija month', () => {
  // Nirjala Ekadashi (Jyeshtha Shukla 11) 2026 = 25 Jun, after the adhik lunation.
  const fromJan = solveNextOccurrence({ lunarMonth: 3, paksha: 'shukla', tithi: 11 }, new Date(2026, 0, 1));
  assert.equal(iso(fromJan), '2026-06-25');
  // Even starting inside the adhik month itself, the solve must not fire there.
  const fromMay = solveNextOccurrence({ lunarMonth: 3, paksha: 'shukla', tithi: 11 }, new Date(2026, 4, 20));
  assert.equal(iso(fromMay), '2026-06-25');
});

test('pitruPakshaWindow 2026: purnima 26 Sep, Pratipada Shraddha 27 Sep, Sarvapitri Amavasya 10 Oct', () => {
  __resetPitruPakshaWindowCacheForTests();
  const w = pitruPakshaWindow(2026);
  assert.ok(w, 'window must resolve for 2026');
  assert.equal(iso(w!.purnima), '2026-09-26');
  assert.equal(iso(w!.start), '2026-09-27');
  assert.equal(iso(w!.end), '2026-10-10');
});

test('pitruPakshaWindow 2025: purnima 7 Sep, window 8–21 Sep', () => {
  const w = pitruPakshaWindow(2025);
  assert.ok(w, 'window must resolve for 2025');
  assert.equal(iso(w!.purnima), '2025-09-07');
  assert.equal(iso(w!.start), '2025-09-08');
  assert.equal(iso(w!.end), '2025-09-21');
});

// The persistence layer (`pitruSmaranSolves.ts`) reads a window off disk and hands
// it back here, so a cold launch skips the ~40 ms Bhadrapada-Purnima scan. What it
// seeds must be what every solver downstream then sees — `pakshaShraddhaDay` and
// `entryMatchesDate` reach the memo directly, not through the persistence layer.
test('primePitruPakshaWindow seeds the memo, and downstream solvers use the seeded value', () => {
  const ASHTAMI = { lunarMonth: 11, paksha: 'krishna', tithi: 8 } as const;
  __resetPitruPakshaWindowCacheForTests();
  const real = pitruPakshaWindow(2026);
  assert.ok(real);
  const freshShraddha = iso(pakshaShraddhaDay(ASHTAMI, 2026));

  __resetPitruPakshaWindowCacheForTests();
  primePitruPakshaWindow(2026, real!);
  assert.deepEqual(pitruPakshaWindow(2026), real);
  // A rule mapped into the fortnight must resolve identically off a seeded
  // window — seeded == fresh is the whole contract, whatever the date is.
  assert.equal(iso(pakshaShraddhaDay(ASHTAMI, 2026)), freshShraddha);
});

test('primePitruPakshaWindow never overwrites a year this session already solved', () => {
  __resetPitruPakshaWindowCacheForTests();
  const real = pitruPakshaWindow(2026);
  assert.ok(real);
  // A bogus seed arriving after the real solve must be ignored — other callers
  // may already hold the `Date` instances the memo handed out.
  primePitruPakshaWindow(2026, {
    purnima: new Date(1990, 0, 1),
    start: new Date(1990, 0, 2),
    end: new Date(1990, 0, 15),
  });
  assert.equal(iso(pitruPakshaWindow(2026)!.purnima), '2026-09-26');
});

test('pakshaShraddhaDay maps a tithi into the fortnight (2026 anchors)', () => {
  // The person's own month/paksha is irrelevant — only the tithi maps in.
  assert.equal(iso(pakshaShraddhaDay({ lunarMonth: 11, paksha: 'krishna', tithi: 8 }, 2026)), '2026-10-03'); // Ashtami Shraddha
  assert.equal(iso(pakshaShraddhaDay({ lunarMonth: 1, paksha: 'shukla', tithi: 4 }, 2026)), '2026-09-30'); // Chaturthi Shraddha
  // Panchami 2026: published aparahna-based lists combine "Chaturthi & Panchami"
  // on 30 Sep; under the app-wide sunrise-anga convention Panchami's day is 1 Oct
  // (the documented ±1 sunrise-vs-muhurta limitation, VERIFICATION.md). Pinned to
  // the engine's own convention so drift is visible.
  assert.equal(iso(pakshaShraddhaDay({ lunarMonth: 2, paksha: 'krishna', tithi: 5 }, 2026)), '2026-10-01');
  // Purnima-tithi persons observe Purnima Shraddha on Bhadrapada Purnima itself.
  assert.equal(iso(pakshaShraddhaDay({ lunarMonth: 8, paksha: 'shukla', tithi: 15 }, 2026)), '2026-09-26');
  // Amavasya-tithi persons and unknown tithis collect on Sarvapitri Amavasya.
  assert.equal(iso(pakshaShraddhaDay({ lunarMonth: 8, paksha: 'krishna', tithi: 15 }, 2026)), '2026-10-10');
  assert.equal(iso(pakshaShraddhaDay('sarvapitri', 2026)), '2026-10-10');
});

test('nextSarvapitriAmavasya rolls across the year boundary', () => {
  assert.equal(iso(nextSarvapitriAmavasya(new Date(2026, 7, 12))), '2026-10-10');
  assert.equal(iso(nextSarvapitriAmavasya(new Date(2026, 9, 10))), '2026-10-10'); // inclusive
  const next = nextSarvapitriAmavasya(new Date(2026, 9, 11));
  assert.ok(next && next.getFullYear() === 2027, `after 2026's amavasya the next must be in 2027, got ${iso(next)}`);
});

test('nextObservanceForEntry: tithi entries solve annually, sarvapitri entries land on the amavasya', () => {
  assert.equal(
    iso(nextObservanceForEntry({ tithiRule: JANMASHTAMI_RULE }, new Date(2026, 0, 1))),
    '2026-09-04'
  );
  assert.equal(
    iso(nextObservanceForEntry({ tithiRule: 'sarvapitri' }, new Date(2026, 0, 1))),
    '2026-10-10'
  );
});

test('entryMatchesDate: fires only on the observance day (the Panchang day chip predicate)', () => {
  const entry = { tithiRule: JANMASHTAMI_RULE };
  assert.equal(entryMatchesDate(entry, new Date(2026, 8, 4)), true);
  assert.equal(entryMatchesDate(entry, new Date(2026, 8, 3)), false);
  assert.equal(entryMatchesDate(entry, new Date(2026, 8, 5)), false);
  // The same private chip also joins the person's mapped day inside Pitru Paksha.
  assert.equal(entryMatchesDate(entry, new Date(2026, 9, 3)), true);
  const unknown = { tithiRule: 'sarvapitri' as const };
  assert.equal(entryMatchesDate(unknown, new Date(2026, 9, 10)), true);
  assert.equal(entryMatchesDate(unknown, new Date(2026, 9, 9)), false);
});

test('pitruPakshaObservanceForDate exposes the public daily label only within the fortnight', () => {
  assert.equal(pitruPakshaObservanceForDate(new Date(2026, 8, 25)), null);
  assert.equal(pitruPakshaObservanceForDate(new Date(2026, 8, 26))?.labelEn, 'Pitru Paksha — Purnima Shraddha');
  assert.equal(pitruPakshaObservanceForDate(new Date(2026, 9, 3))?.labelHi, 'पितृ पक्ष — सप्तमी व अष्टमी श्राद्ध');
  assert.equal(pitruPakshaObservanceForDate(new Date(2026, 9, 10))?.labelEn, 'Pitru Paksha — Sarvapitri Amavasya');
  assert.equal(pitruPakshaObservanceForDate(new Date(2026, 9, 11)), null);
});

test('kshaya day matches entryMatchesDate too (chip shows on the prevailing day)', () => {
  const entry = { tithiRule: { lunarMonth: 4, paksha: 'krishna', tithi: 11 } as const };
  assert.equal(entryMatchesDate(entry, new Date(2026, 6, 10)), true);
  assert.equal(entryMatchesDate(entry, new Date(2026, 6, 11)), false);
});

test('invalid rules are rejected, never solved', () => {
  assert.equal(isValidTithiRule({ lunarMonth: 0, paksha: 'shukla', tithi: 1 }), false);
  assert.equal(isValidTithiRule({ lunarMonth: 13, paksha: 'shukla', tithi: 1 }), false);
  assert.equal(isValidTithiRule({ lunarMonth: 1, paksha: 'shukla', tithi: 0 }), false);
  assert.equal(isValidTithiRule({ lunarMonth: 1, paksha: 'shukla', tithi: 16 }), false);
  assert.equal(solveNextOccurrence({ lunarMonth: 0, paksha: 'shukla', tithi: 1 }, new Date(2026, 0, 1)), null);
  assert.equal(entryMatchesDate({ tithiRule: { lunarMonth: 1, paksha: 'shukla', tithi: 16 } }, new Date(2026, 0, 1)), false);
});

test('tithiRuleLabel renders sarvapitri and edge tithi names', () => {
  assert.equal(tithiRuleLabel('sarvapitri', 'hi'), 'सर्वपितृ अमावस्या');
  assert.equal(tithiRuleLabel({ lunarMonth: 11, paksha: 'krishna', tithi: 8 }, 'hi'), 'माघ कृष्ण अष्टमी');
  assert.equal(tithiRuleLabel({ lunarMonth: 6, paksha: 'shukla', tithi: 15 }, 'hi'), 'भाद्रपद शुक्ल पूर्णिमा');
  assert.equal(tithiRuleLabel({ lunarMonth: 7, paksha: 'krishna', tithi: 15 }, 'en'), 'Ashwin Krishna Amavasya');
});
