// Rerunnable observance-date verification harness.
//
// WHY: the panchang ENGINE (tithi/nakshatra/sunrise) is verified against drikpanchang
// (see VERIFICATION.md, 131/131), but festival/vrat DATES were never cross-checked — that
// gap hid the "Janmashtami one lunar month early" bug. This harness verifies the resolved
// observance DATES, independently of the festival-resolver, by recomputing each festival's
// correct civil day straight from astronomy-engine using its proper muhurta rule
// (udaya/sunrise, madhyahna/midday, nishita/midnight, pradosh/evening).
//
// It is independent of memory and of the web: the "expected" date is derived from the same
// drik-verified astronomy the engine uses, but with the CORRECT day-selection muhurta.
//
// Run:  TZ=Asia/Kolkata npx tsx scripts/verify-observances.mts
// Exit: non-zero on ANY disagreement — a whole lunar month, a single day, or a festival that
//       does not resolve. ±1-day shifts used to be warnings ("Class B"); that let Dussehra,
//       Diwali, Dhanteras and Maha Shivaratri sit a day late for years while CI printed PASS
//       (Sept 2026 audit). A date the app cannot yet get right goes in KNOWN_DIVERGENCES with
//       its published date and the reason — never into a warning bucket.

import { createRequire } from 'node:module';
import { computePanchangForDate } from '../src/panchang/engine';
import { resolveObservancesForYear } from '../src/panchang/festivalEngine';

// CI runs this .mts verifier directly through tsx on Linux. In that path,
// astronomy-engine can resolve through its CommonJS entrypoint, where strict ESM
// named imports are not always synthesized. Load the package via createRequire so
// the verifier uses the same stable CJS exports that astronomy-engine publishes.
const require = createRequire(import.meta.url);
const { SunPosition, EclipticGeoMoon, MakeTime } =
  require('astronomy-engine') as typeof import('astronomy-engine');

// Mirrors ObservanceDayRule (types.ts) minus chandrodaya, which needs a moonrise solve this
// script does not do — those rules are pinned by observanceDates.test.ts instead.
type Muhurta =
  | 'udaya' | 'madhyahna' | 'aparahna' | 'nishita' | 'pradosh'
  | 'ratri' | 'pradosh-next' | 'sunset' | 'sunset-last' | 'purvahna';
export interface AnnualFestival {
  id: string;
  month: number; // purnimant lunar month, 1-based (Chaitra=1 … Phalguna=12)
  paksha: 'shukla' | 'krishna';
  tithi: number; // 1..15
  muhurta: Muhurta;
}

// Major annual festivals with their authoritative day-selection muhurta.
export const ANNUAL: AnnualFestival[] = [
  { id: 'vasant-panchami', month: 11, paksha: 'shukla', tithi: 5, muhurta: 'udaya' },
  { id: 'maha-shivaratri', month: 12, paksha: 'krishna', tithi: 14, muhurta: 'nishita' },
  { id: 'holi', month: 12, paksha: 'shukla', tithi: 15, muhurta: 'pradosh-next' }, // Rangwali: the morning after Holika Dahan
  { id: 'ram-navami', month: 1, paksha: 'shukla', tithi: 9, muhurta: 'madhyahna' },
  { id: 'hanuman-jayanti', month: 1, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'akshaya-tritiya', month: 2, paksha: 'shukla', tithi: 3, muhurta: 'purvahna' },
  { id: 'parashurama-jayanti', month: 2, paksha: 'shukla', tithi: 3, muhurta: 'pradosh' },
  { id: 'ganga-saptami', month: 2, paksha: 'shukla', tithi: 7, muhurta: 'madhyahna' },
  { id: 'sita-navami', month: 2, paksha: 'shukla', tithi: 9, muhurta: 'madhyahna' },
  { id: 'narasimha-jayanti', month: 2, paksha: 'shukla', tithi: 14, muhurta: 'sunset-last' },
  { id: 'vat-savitri-vrat', month: 3, paksha: 'krishna', tithi: 15, muhurta: 'madhyahna' },
  { id: 'narada-jayanti', month: 3, paksha: 'krishna', tithi: 1, muhurta: 'udaya' },
  { id: 'guru-purnima', month: 4, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'raksha-bandhan', month: 5, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  // Janmashtami's formal rule is Nishita, but its civil day has matched the udaya (sunrise)
  // Ashtami for every year here; anchors below pin the truth. Treated as udaya to avoid
  // false day-shift flags from a crude Nishita approximation.
  { id: 'janmashtami', month: 6, paksha: 'krishna', tithi: 8, muhurta: 'udaya' },
  { id: 'ganesh-chaturthi', month: 6, paksha: 'shukla', tithi: 4, muhurta: 'madhyahna' },
  { id: 'navratri-start', month: 7, paksha: 'shukla', tithi: 1, muhurta: 'udaya' },
  { id: 'dussehra', month: 7, paksha: 'shukla', tithi: 10, muhurta: 'aparahna' },
  { id: 'maha-navami', month: 7, paksha: 'shukla', tithi: 9, muhurta: 'madhyahna' },
  { id: 'sharad-purnima', month: 7, paksha: 'shukla', tithi: 15, muhurta: 'nishita' },
  { id: 'kojagara-puja', month: 7, paksha: 'shukla', tithi: 15, muhurta: 'nishita' },
  // Karwa Chauth is chandrodaya in the engine; pradosh is this script's stand-in for the
  // evening moon, and the two agree for every year swept here.
  { id: 'karwa-chauth', month: 8, paksha: 'krishna', tithi: 4, muhurta: 'pradosh' },
  { id: 'ahoi-ashtami', month: 8, paksha: 'krishna', tithi: 8, muhurta: 'pradosh' },
  { id: 'dhanteras', month: 8, paksha: 'krishna', tithi: 13, muhurta: 'pradosh' },
  { id: 'diwali', month: 8, paksha: 'krishna', tithi: 15, muhurta: 'pradosh' }, // Lakshmi Puja (Amavasya at Pradosh)
  { id: 'govardhan-puja', month: 8, paksha: 'shukla', tithi: 1, muhurta: 'udaya' },
  { id: 'bhai-dooj', month: 8, paksha: 'shukla', tithi: 2, muhurta: 'udaya' },
  { id: 'dev-uthani-ekadashi', month: 8, paksha: 'shukla', tithi: 11, muhurta: 'udaya' },

  // Regional wave 1 (Sept 2026) — Rajasthani, Bihari/Maithil and Jain observances.
  // `sakat-chauth` is deliberately absent: it is chandrodaya-matched and this script
  // has no moonrise muhurta; `observanceDates.test.ts` pins it against the Sankashti
  // series instead. `bachh-baras` IS here with its real (pradosh) muhurta, so the
  // known Class B shift it carries is reported every run rather than forgotten.
  { id: 'shitala-saptami', month: 1, paksha: 'krishna', tithi: 7, muhurta: 'udaya' },
  { id: 'shitala-ashtami', month: 1, paksha: 'krishna', tithi: 8, muhurta: 'udaya' },
  { id: 'dasha-mata-vrat', month: 1, paksha: 'krishna', tithi: 10, muhurta: 'udaya' },
  { id: 'chaitra-navratri-start', month: 1, paksha: 'shukla', tithi: 1, muhurta: 'udaya' },
  { id: 'gangaur', month: 1, paksha: 'shukla', tithi: 3, muhurta: 'udaya' },
  { id: 'chaiti-chhath', month: 1, paksha: 'shukla', tithi: 6, muhurta: 'udaya' },
  { id: 'mahavir-jayanti', month: 1, paksha: 'shukla', tithi: 13, muhurta: 'udaya' },
  { id: 'asha-dashami', month: 4, paksha: 'shukla', tithi: 10, muhurta: 'udaya' },
  { id: 'madhushravani', month: 5, paksha: 'shukla', tithi: 3, muhurta: 'udaya' },
  { id: 'goga-navami', month: 6, paksha: 'krishna', tithi: 9, muhurta: 'udaya' },
  { id: 'bachh-baras', month: 6, paksha: 'krishna', tithi: 12, muhurta: 'pradosh' },
  { id: 'ramdev-jayanti', month: 6, paksha: 'shukla', tithi: 2, muhurta: 'udaya' },
  { id: 'teja-dashami', month: 6, paksha: 'shukla', tithi: 10, muhurta: 'udaya' },
  { id: 'chitragupta-puja', month: 8, paksha: 'shukla', tithi: 2, muhurta: 'udaya' },
  { id: 'sama-chakeva', month: 8, paksha: 'shukla', tithi: 7, muhurta: 'udaya' },
  { id: 'kartik-purnima', month: 8, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },

  // Universal gaps + Tamil wave (Sept 2026). Only the plain lunar-tithi rules can
  // appear here: this table is keyed by month/paksha/tithi, so `vishwakarma-puja`
  // (solar), the four nakshatra-in-solar-month rules, and the two solarMonth-
  // constrained rules (`chitra-pournami`, `karkidaka-vavu`) have no row and are
  // pinned to their published dates by observanceDates.test.ts instead.
  { id: 'ratha-saptami', month: 11, paksha: 'shukla', tithi: 7, muhurta: 'udaya' },
  { id: 'rang-panchami', month: 1, paksha: 'krishna', tithi: 5, muhurta: 'udaya' },
  { id: 'shani-jayanti', month: 3, paksha: 'krishna', tithi: 15, muhurta: 'udaya' },
  { id: 'avani-avittam', month: 5, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'radha-ashtami', month: 6, paksha: 'shukla', tithi: 8, muhurta: 'udaya' },
  // The rite is the pre-dawn abhyanga snan, but the published day has tracked the
  // udaya Chaturdashi for every year checked, so udaya is its real day rule.
  { id: 'hanuman-jayanti-kartik', month: 8, paksha: 'krishna', tithi: 14, muhurta: 'udaya' },
  { id: 'gopashtami', month: 8, paksha: 'shukla', tithi: 8, muhurta: 'udaya' },
  { id: 'champa-shashthi', month: 9, paksha: 'shukla', tithi: 6, muhurta: 'udaya' },
  // Section A — pan-India jayantis and named days (Sept 2026). The four Vishnu-avatar
  // jayantis Drik fixes by an afternoon window are re-derived at aparahna — the
  // shift that matters (Varaha 13 vs sunrise 14 Sep 2026) is exactly what they encode.
  { id: 'matsya-jayanti', month: 1, paksha: 'shukla', tithi: 3, muhurta: 'aparahna' },
  { id: 'varaha-jayanti', month: 6, paksha: 'shukla', tithi: 3, muhurta: 'aparahna' },
  { id: 'kalki-jayanti', month: 5, paksha: 'shukla', tithi: 6, muhurta: 'aparahna' },
  { id: 'hayagriva-jayanti', month: 5, paksha: 'shukla', tithi: 15, muhurta: 'aparahna' },
  { id: 'vamana-jayanti', month: 6, paksha: 'shukla', tithi: 12, muhurta: 'udaya' },
  { id: 'hal-shashthi', month: 6, paksha: 'krishna', tithi: 6, muhurta: 'udaya' },
  { id: 'surdas-jayanti', month: 2, paksha: 'shukla', tithi: 5, muhurta: 'udaya' },
  { id: 'shankaracharya-jayanti', month: 2, paksha: 'shukla', tithi: 5, muhurta: 'udaya' },
  { id: 'tulsidas-jayanti', month: 5, paksha: 'shukla', tithi: 7, muhurta: 'udaya' },
  { id: 'valmiki-jayanti', month: 7, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'vallabhacharya-jayanti', month: 2, paksha: 'krishna', tithi: 11, muhurta: 'udaya' },
  { id: 'kabir-jayanti', month: 3, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'baglamukhi-jayanti', month: 2, paksha: 'shukla', tithi: 8, muhurta: 'udaya' },
  { id: 'dhumavati-jayanti', month: 3, paksha: 'shukla', tithi: 8, muhurta: 'udaya' },
  { id: 'mahesh-navami', month: 3, paksha: 'shukla', tithi: 9, muhurta: 'udaya' },
  { id: 'annapurna-jayanti', month: 9, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'narmada-jayanti', month: 11, paksha: 'shukla', tithi: 7, muhurta: 'udaya' },
  { id: 'janaki-jayanti', month: 12, paksha: 'krishna', tithi: 8, muhurta: 'udaya' },
  { id: 'phulera-dooj', month: 12, paksha: 'shukla', tithi: 2, muhurta: 'udaya' },
  { id: 'narak-chaturdashi', month: 8, paksha: 'krishna', tithi: 14, muhurta: 'udaya' },
  { id: 'kaal-bhairav-jayanti', month: 9, paksha: 'krishna', tithi: 8, muhurta: 'ratri' },
  { id: 'dattatreya-jayanti', month: 9, paksha: 'shukla', tithi: 15, muhurta: 'pradosh' },
  { id: 'mauni-amavasya', month: 11, paksha: 'krishna', tithi: 15, muhurta: 'udaya' },
  { id: 'ganesh-jayanti', month: 11, paksha: 'shukla', tithi: 4, muhurta: 'madhyahna' },
  { id: 'bhishma-ashtami', month: 11, paksha: 'shukla', tithi: 8, muhurta: 'madhyahna' },
  { id: 'magha-purnima', month: 11, paksha: 'shukla', tithi: 15, muhurta: 'udaya' },
  { id: 'ashadha-gupt-navratri', month: 4, paksha: 'shukla', tithi: 1, muhurta: 'udaya' },
  { id: 'magha-gupt-navratri', month: 11, paksha: 'shukla', tithi: 1, muhurta: 'udaya' },
];

// Known-good anchors (drikpanchang/established, Ujjain/IST) — authoritative truth. When an
// anchor exists it overrides the muhurta approximation. Catches month-level regressions and
// pins the festivals whose exact day the crude muhurta calc can't nail (e.g. Janmashtami).
export const ANCHORS: Record<string, string> = {
  'janmashtami:2025': '2025-08-16', 'janmashtami:2026': '2026-09-04',
  'maha-shivaratri:2025': '2025-02-26', 'maha-shivaratri:2026': '2026-02-15', 'maha-shivaratri:2027': '2027-03-06',
  'ganesh-chaturthi:2025': '2025-08-27', 'ganesh-chaturthi:2026': '2026-09-14',
  'diwali:2025': '2025-10-20', 'ram-navami:2025': '2025-04-06', 'narada-jayanti:2025': '2025-05-13',
  'holi:2025': '2025-03-14', 'dussehra:2025': '2025-10-02', 'navratri-start:2025': '2025-09-22',
  // Regional wave 1 — published civil dates gathered with the rules (see festivals.ts
  // per-rule source comments).
  'bachh-baras:2026': '2026-09-07',
  'gangaur:2025': '2025-03-31', 'gangaur:2026': '2026-03-21',
  'goga-navami:2025': '2025-08-17', 'goga-navami:2026': '2026-09-05',
  'teja-dashami:2025': '2025-09-02', 'teja-dashami:2026': '2026-09-21',
  'shitala-ashtami:2026': '2026-03-11', 'shitala-saptami:2026': '2026-03-10',
  'dasha-mata-vrat:2026': '2026-03-13', 'asha-dashami:2026': '2026-07-24',
  'chaiti-chhath:2026': '2026-03-24', 'madhushravani:2026': '2026-08-15',
  'chitragupta-puja:2026': '2026-11-11',
  'kartik-purnima:2025': '2025-11-05', 'kartik-purnima:2026': '2026-11-24',
  'chaitra-navratri-start:2025': '2025-03-30', 'chaitra-navratri-start:2026': '2026-03-19',
  'mahavir-jayanti:2025': '2025-04-10', 'mahavir-jayanti:2026': '2026-03-31',
  // Section A (Sept 2026) — published dates, see festivals.ts per-rule comments.
  'surdas-jayanti:2025': '2025-05-02', 'shankaracharya-jayanti:2025': '2025-05-02',
  'annapurna-jayanti:2025': '2025-12-04', 'kaal-bhairav-jayanti:2025': '2025-11-12',
  'kaal-bhairav-jayanti:2026': '2026-12-01', 'narak-chaturdashi:2026': '2026-11-08',
  'ganesh-jayanti:2026': '2026-01-22', 'bhishma-ashtami:2026': '2026-01-26',
  // 2026 carries an adhik Jyeshtha (17 May – 15 Jun). This script's month finder
  // lands Jyeshtha Shukla rules in the ADHIK month; every published almanac keeps
  // them in the nija month, as the engine does — so these three are anchored.
  'kabir-jayanti:2026': '2026-06-29', 'dhumavati-jayanti:2026': '2026-06-22',
  'mahesh-navami:2026': '2026-06-23',
  'hal-shashthi:2026': '2026-09-02', 'annapurna-jayanti:2026': '2026-12-23',
  // Day-rule audit (Sept 2026) — dates READ from Drik/published almanacs while each rule's
  // convention was retagged; mirrored by observanceDates.test.ts DAY_RULE_PUBLISHED.
  'dussehra:2024': '2024-10-12', 'dussehra:2026': '2026-10-20', 'dussehra:2027': '2027-10-09',
  'dussehra:2028': '2028-09-27', 'dussehra:2029': '2029-10-16',
  'diwali:2024': '2024-10-31', 'diwali:2026': '2026-11-08', 'diwali:2028': '2028-10-17',
  'diwali:2029': '2029-11-05', 'diwali:2030': '2030-10-26',
  'maha-shivaratri:2028': '2028-02-23', 'maha-shivaratri:2029': '2029-02-11',
  'holi:2027': '2027-03-22', 'holi:2028': '2028-03-11', 'holi:2029': '2029-03-01',
  'akshaya-tritiya:2026': '2026-04-19', 'akshaya-tritiya:2027': '2027-05-09', 'akshaya-tritiya:2028': '2028-04-27',
  'parashurama-jayanti:2025': '2025-04-29', 'sita-navami:2025': '2025-05-05', 'ganga-saptami:2025': '2025-05-03',
  'narasimha-jayanti:2024': '2024-05-21', 'narasimha-jayanti:2025': '2025-05-11',
  'narasimha-jayanti:2026': '2026-04-30', 'narasimha-jayanti:2027': '2027-05-18',
  'vat-savitri-vrat:2025': '2025-05-26', 'vat-savitri-vrat:2026': '2026-05-16',
  'sharad-purnima:2024': '2024-10-16', 'sharad-purnima:2026': '2026-10-25',
  'kojagara-puja:2024': '2024-10-16', 'kojagara-puja:2026': '2026-10-25',
  'ahoi-ashtami:2026': '2026-11-01', 'dattatreya-jayanti:2024': '2024-12-14',
  'kaal-bhairav-jayanti:2024': '2024-11-22', 'kaal-bhairav-jayanti:2027': '2027-11-20',
  'bhai-dooj:2026': '2026-11-11', 'radha-ashtami:2026': '2026-09-19', 'radha-ashtami:2027': '2027-09-08',
  'janmashtami:2027': '2027-08-25',
  'maha-navami:2024': '2024-10-11', 'maha-navami:2025': '2025-10-01', 'maha-navami:2026': '2026-10-19',
  'maha-navami:2027': '2027-10-08', 'maha-navami:2028': '2028-09-26', 'maha-navami:2029': '2029-10-15',
};

// Published dates the engine is KNOWN to miss, with the reason. Reported every run and
// excused from the gate — but only while the engine still gives exactly `engine`; if it
// moves (fixed, or broken differently) the run fails so the entry gets revisited.
export const KNOWN_DIVERGENCES: Record<string, { published: string; engine: string; reason: string }> = {
  'holi:2026': {
    published: '2026-03-04',
    engine: '2026-03-03',
    reason: 'bhadra covered the 2 Mar pradosh, so Drik moved Holika Dahan to 3 Mar; bhadra is not modelled',
  },
};

const ayan = (y: number) => 23.853 + 0.01396 * (y - 2000);
function tithiAt(t: Date): number {
  const y = t.getFullYear();
  const sun = (SunPosition(MakeTime(t)).elon - ayan(y) + 360) % 360;
  const moon = (EclipticGeoMoon(MakeTime(t)).lon - ayan(y) + 360) % 360;
  return Math.floor(((moon - sun + 360) % 360) / 12);
}
const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const at = (a: Date, b: Date, f: number) => new Date(a.getTime() + f * (b.getTime() - a.getTime()));

// The target tithi's [start, end) interval, found by stepping then bisecting on this
// script's own tithi function — independent of the engine's end-time solver.
function tithiInterval(target: number, near: Date): [Date, Date] {
  let t = new Date(near.getTime() - 36 * 3600e3);
  while (tithiAt(t) !== target) t = new Date(t.getTime() + 30 * 60e3);
  const edge = (inside: Date, dir: 1 | -1) => {
    let lo = inside.getTime();
    let hi = lo + dir * 30 * 3600e3;
    for (let i = 0; i < 40; i++) {
      const mid = (lo + hi) / 2;
      if (tithiAt(new Date(mid)) === target) lo = mid; else hi = mid;
    }
    return new Date(lo);
  };
  return [edge(t, -1), edge(t, 1)];
}

type Day = { date: Date; sunrise: Date; sunset: Date; nextSunrise: Date };
function dayOf(date: Date): Day {
  const pan = computePanchangForDate(date, { calendarSystem: 'purnimant' });
  const next = computePanchangForDate(addDays(date, 1), { calendarSystem: 'purnimant' });
  return { date, sunrise: pan.sunrise, sunset: pan.sunset, nextSunrise: next.sunrise };
}
const INSTANT: Record<string, (d: Day) => Date> = {
  udaya: (d) => d.sunrise,
  purvahna: (d) => at(d.sunrise, d.sunset, 0.2),
  madhyahna: (d) => at(d.sunrise, d.sunset, 0.5),
  aparahna: (d) => at(d.sunrise, d.sunset, 0.7),
  sunset: (d) => d.sunset,
  pradosh: (d) => at(d.sunset, d.nextSunrise, 0.1),
  nishita: (d) => at(d.sunset, d.nextSunrise, 0.5),
};

// Independently compute the correct civil date for a festival in a given year: locate the
// target tithi in the NIJA month, then pick among the civil days around it by the rule's
// muhurta — first covering day, last covering day, or its documented fallback.
export function expectedDate(f: AnnualFestival, year: number): string | null {
  const target = f.paksha === 'shukla' ? f.tithi - 1 : f.tithi + 14;
  // Position inside a purnimant month, which opens at Krishna Pratipada (index 15).
  const pos = (t: number) => (t - 15 + 30) % 30;
  const nija = (d: Date) => {
    const pan = computePanchangForDate(d, { calendarSystem: 'purnimant' });
    return pan.lunarMonth.index === f.month && !pan.lunarMonth.isAdhik;
  };
  for (let d = new Date(year, 0, 1); d.getFullYear() === year; d = addDays(d, 1)) {
    let pan;
    try { pan = computePanchangForDate(d, { calendarSystem: 'purnimant' }); } catch { continue; }
    if (pan.lunarMonth.index !== f.month || pan.lunarMonth.isAdhik) continue;
    if (pos(tithiAt(pan.sunrise)) < pos(target) - 1) continue;
    const [start, end] = tithiInterval(target, d);
    const days = [-1, 0, 1, 2].map((n) => dayOf(addDays(d, n)));
    const within = (t: Date) => t >= start && t < end;
    // Sunrise day: the first day whose sunrise the tithi covers, else (kshaya) the day
    // it lies wholly inside.
    const udayaDay = days.find((x) => within(x.sunrise)) ?? days.find((x) => x.sunrise < start && end <= x.nextSunrise)!;
    // Festivals are kept in the NIJA month; an adhik (leap) month repeats the name and
    // must be skipped, exactly as the engine does (2026 Jyeshtha, 2029 Chaitra, 2031
    // Bhadrapada all carry one). A kshaya month-opening pratipada takes the next day's
    // month, as the engine does.
    const monthDay = !within(udayaDay.sunrise) && pos(target) === 0 ? addDays(udayaDay.date, 1) : udayaDay.date;
    if (!nija(monthDay)) { d = addDays(end, 0); continue; }
    return pickDay(f.muhurta, days, udayaDay, within);
  }
  return null;
}

function pickDay(muhurta: Muhurta, days: Day[], udayaDay: Day, within: (t: Date) => boolean): string {
  const covering = (m: string) => days.filter((d) => within(INSTANT[m](d)));
  const first = (m: string) => covering(m)[0] ?? udayaDay;
  switch (muhurta) {
    case 'udaya':
      return iso(udayaDay.date);
    case 'ratri':
      return iso((covering('pradosh')[0] ?? covering('nishita')[0] ?? udayaDay).date);
    case 'pradosh-next':
      return iso(addDays(first('pradosh').date, 1));
    case 'sunset-last':
      return iso((covering('sunset').at(-1) ?? udayaDay).date);
    case 'purvahna': {
      const last = covering('purvahna').at(-1);
      if (last) return iso(last.date);
      const eve = days[days.indexOf(udayaDay) - 1];
      return iso((within(udayaDay.sunrise) && eve && within(eve.sunset) ? eve : udayaDay).date);
    }
    default:
      return iso(first(muhurta).date);
  }
}

export type Status = 'OK' | 'DAY_SHIFT' | 'MONTH_OFF' | 'MISSING' | 'KNOWN';
export function classify(engine: string | null, expected: string | null): Status {
  if (!engine || !expected) return 'MISSING';
  if (engine === expected) return 'OK';
  const diff = Math.abs((new Date(engine).getTime() - new Date(expected).getTime()) / 86400000);
  return diff <= 2 ? 'DAY_SHIFT' : 'MONTH_OFF';
}

export function engineDate(id: string, year: number): string | null {
  const o = resolveObservancesForYear(year, 'purnimant').find((x) => x.rule.id === id);
  return o ? iso(o.date) : null;
}

// Authoritative expected date: a published anchor when we have one, else the muhurta estimate.
export function expectedFor(f: AnnualFestival, year: number): { date: string | null; source: 'anchor' | 'muhurta' | 'known' } {
  const known = KNOWN_DIVERGENCES[`${f.id}:${year}`];
  if (known) return { date: known.published, source: 'known' };
  const anchor = ANCHORS[`${f.id}:${year}`];
  if (anchor) return { date: anchor, source: 'anchor' };
  return { date: expectedDate(f, year), source: 'muhurta' };
}

// ---- run as a script ----
if (process.argv[1] && process.argv[1].endsWith('verify-observances.mts')) {
  // VERIFY_YEARS=2025-2031 widens the sweep; the default covers the precomputed table.
  const range = /^(\d{4})-(\d{4})$/.exec(process.env.VERIFY_YEARS ?? '');
  const YEARS = range
    ? Array.from({ length: Number(range[2]) - Number(range[1]) + 1 }, (_, i) => Number(range[1]) + i)
    : [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031];
  const failures: string[] = [];
  const known: string[] = [];
  // An anchor the muhurta re-derivation disagrees with means THIS script's rule table is
  // wrong for that festival — the independent check would be checking nothing.
  const tableDrift: string[] = [];

  console.log('Observance date verification — app engine vs authoritative date\n');
  for (const year of YEARS) {
    console.log(`=== ${year} ===`);
    for (const f of ANNUAL) {
      const eng = engineDate(f.id, year);
      const { date: exp, source } = expectedFor(f, year);
      const tag = `${f.id}:${year}`;
      let st = classify(eng, exp);
      if (source === 'known') {
        const entry = KNOWN_DIVERGENCES[tag];
        if (eng === entry.engine) { st = 'KNOWN'; known.push(`${tag} engine=${eng} published=${exp} — ${entry.reason}`); }
        else failures.push(`${tag} engine=${eng} moved off its known divergence (${entry.engine}); published=${exp} — revisit KNOWN_DIVERGENCES`);
      } else if (st !== 'OK') {
        failures.push(`${tag} engine=${eng ?? '—'} expected=${exp ?? '—'} [${source}, ${f.muhurta}] ${st}`);
      }
      if (source === 'anchor') {
        const derived = expectedDate(f, year);
        if (derived !== exp) tableDrift.push(`${tag} anchor=${exp} muhurta(${f.muhurta})=${derived}`);
      }
      const flag = st === 'OK' ? 'ok' : st === 'KNOWN' ? 'known divergence' : `*** ${st}`;
      console.log(`  ${f.id.padEnd(24)} engine=${(eng ?? '—').padEnd(12)} expected=${(exp ?? '—').padEnd(12)} [${source}] ${flag}`);
    }
    console.log('');
  }

  console.log('=== structural checks (counts; informational) ===');
  for (const year of YEARS) {
    const obs = resolveObservancesForYear(year, 'purnimant');
    const ekadashi = obs.filter((o) => o.rule.tithi === 11 && o.rule.category === 'vrat');
    console.log(`  ${year}: ekadashis=${ekadashi.length} (some years <24 due to kshaya)  total observances=${obs.length}`);
  }

  console.log(`\nSUMMARY: failures=${failures.length}  known-divergences=${known.length}  anchor/rule-table drift=${tableDrift.length}`);
  for (const k of known) console.log(`  known: ${k}`);
  if (failures.length || tableDrift.length) {
    if (failures.length) {
      console.log('\nFAIL — festival date(s) disagree with the published/derived date:');
      for (const m of failures) console.log(`  ${m}`);
    }
    if (tableDrift.length) {
      console.log('\nFAIL — ANNUAL muhurta disagrees with a published anchor (fix the rule table):');
      for (const m of tableDrift) console.log(`  ${m}`);
    }
    process.exit(1);
  }
  console.log('\nPASS — every festival lands on its published or muhurta-derived day.');
}
