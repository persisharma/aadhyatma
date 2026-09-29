# Panchang engine verification vs drikpanchang.com

**Reference:** drikpanchang.com *Day Panchang*, location **Ujjain, Madhya Pradesh**
(`geoname-id=1253914`) — the same location the engine is hard-coded to
(`engine.ts`, `UJJAIN_LAT/LNG/ELEV`).

**Method:** the engine was run standalone (`scripts/verify-panchang-vs-drik.mts`) for
every day and diffed field-by-field against drik for **both Amanta and Purnimanta**.
Drik values were captured to a fixture (`__tests__/fixtures/drikpanchang-ujjain.json`)
and the comparison is encoded as an e2e test (`panchangVsDrikpanchang.e2e.test.ts`).
Three representative days were additionally confirmed in a real browser against drik's
rendered page (2026-06-01 adhik, 2026-06-30 spike, 2026-03-10 Vikram Samvat).

**Coverage:** 131 contiguous days, **2026-03-01 → 2026-07-10** (a few months back, this
month, and into the next year). Full 365-day live coverage is gated by drikpanchang's
anti-bot reCAPTCHA — only ~131 rapid requests were served before it engaged, and
CAPTCHAs are not solved. The three defects below are **systematic** (they recur every
adhik maas / every lunar month / every year), so this window is sufficient to establish
them. The engine's own full-year dump (Jun 2026 → Jun 2027) shows the same spike pattern
recurring and no adhik maas detected after 2026-06-15.

## Result summary (131 days)

| Field | Result |
|---|---|
| Vaara (weekday) | OK 131/131 |
| Paksha | OK 131/131 |
| Tithi (name) | OK 131/131 |
| Nakshatra | OK 131/131 |
| Yoga | OK 131/131 |
| Karana | OK 131/131 |
| Sunrise (<=3 min) | OK 131/131 |
| Sunset (<=3 min) | OK 131/131 |
| Purnimanta month | WARN 128/131 — month-spike bug |
| Amanta month | WARN 113/131 — adhik maas + spikes |
| Adhik Maas flag | FAIL 101/131 — not modelled |
| Vikram Samvat | WARN 116/131 — new-year ~2 weeks early |

The five core panchang elements (tithi, nakshatra, yoga, karana, vaara), sunrise and
sunset are **correct**. All defects are in the **lunar-month / samvat labelling**.

## Defects

### 1. Adhik Maas (leap month) not modelled — HIGH
`lunarMonth.isAdhik` is hard-coded `false` (`engine.ts`); `computePurnimantLunarMonth`
returns `{ isAdhik: false }` unconditionally. drik shows **Adhik (Purushottam) Jyeshtha
= 2026-05-17 -> 2026-06-15** (happening now). During it the engine shows a plain month
and, in Amanta, the **wrong month** (e.g. 2026-06-01 engine `Vaishakha` vs drik
`Jyeshtha (Adhik)`). Recurs every ~32-33 months.

### 2. Month-spike bug — MEDIUM
On the day before some amavasyas, `findNextPurnimaBoundary` / `computePurnimantLunarMonth`
resolve the wrong full moon, producing a month several positions off for that single day:
`2026-03-04` (`Jyeshtha` vs `Chaitra`), `2026-05-02` (`Shravana` vs `Jyeshtha`),
`2026-06-30` (`Ashwin` vs `Ashadha`). Roughly one bad day per lunar month.

### 3. Vikram Samvat rolls over ~2 weeks early — MEDIUM
`computeVikramSamvat` keys the year purely off the (Purnimanta) month index and ignores
paksha, so it bumps 2082->2083 at the start of Purnimanta Chaitra (which includes the
preceding Krishna paksha) instead of at **Chaitra Shukla Pratipada**. drik flips on
**2026-03-19**; the engine flips on **2026-03-04** (wrong for 2026-03-04 .. 03-18).

## Location note (location-aware, Ujjain default)
`computePanchangForDate`/`computeTithiAndMonth` accept `options.location` (lat/lng/
elevation + `cityId`); omitted ⇒ Ujjain, so every fixture in this document and the
precomputed observance tables remain Ujjain-referenced. The app threads the user's
location (GPS snapped to the nearest bundled city in `locations.ts`, or a manual pick)
through `PanchangLocationContext`. Sunrise/sunset/moonrise/Brahma Muhurta shift fully
with location; tithi/nakshatra day values shift only where the local sunrise crosses a
boundary. Non-Ujjain festival dates are scanned once on-device (chunked) and persisted
via `observanceCache.ts`; until that lands the UI shows the Ujjain dates with an
"updating…" hint. Location tests: `__tests__/location.test.ts` (Delhi/Guwahati vs drik).

## Observance resolution & Adhik Maas

Annual festivals/vrats tied to a **named** lunar month (e.g. Nirjala Ekadashi in
Jyeshtha Shukla) are observed in the **nija (true)** month and skip the **adhik
(leap)** month that repeats it — `matchesLunarTithiRuleOnDate` rejects days whose
lunation `isAdhik` for month-specific rules (`festivalEngine.ts`). Monthly vrats
(Pradosh, Sankashti, Purnima, etc.) have no fixed month and still recur inside the
adhik maas. Worked example: 2026 has Adhik Jyeshtha (05-17 → 06-15), so Nirjala
Ekadashi is **2026-06-25** (nija), not the adhik Shukla Ekadashi on 2026-05-26.
Regenerate `precomputedObservances.ts` after any rule/engine change:
`TZ=Asia/Kolkata npx tsx scripts/gen-precomputed-observances.mts`.

**Known gap — kshaya (lost) Ekadashi:** the matcher pins a tithi to the day it is
current *at sunrise*. When an Ekadashi tithi is skipped at sunrise (kshaya) it is
not surfaced — e.g. Yogini Ekadashi 2026 (nija Jyeshtha Krishna Ekadashi, kshaya
on 2026-07-10/11) is currently dropped rather than assigned to its observance day.
This is a pre-existing sunrise-matching limitation (several years already surface
<24 Ekadashis), independent of the Adhik Maas handling above.

## Observance (festival/vrat) date verification

The panchang *fields* above were verified against drik, but festival *dates* were not — a
gap that hid a **one-lunar-month** error: three krishna-paksha festivals stored their
*amanta* month instead of the **purnimant** month the resolver expects, resolving a month
early. Fixed (`festivals.ts`): Janmashtami Shravana(5)→**Bhadrapada(6)**, Maha Shivaratri
Magha(11)→**Phalguna(12)**, Narada Jayanti Vaishakha(2)→**Jyeshtha(3)**. Janmashtami 2026
is now correctly **Fri 4 Sep 2026**.

`scripts/verify-observances.mts` (`npm run verify:observances`, also a CI step) re-derives
each major festival's correct civil day **independently** — its own tithi-interval search on
astronomy-engine, then the rule's muhurta (udaya · purvahna · madhyahna · aparahna · sunset ·
pradosh · nishita, with the first/last-of-two and fallback variants below) — checks it against
published anchors, and **fails on any disagreement, including a single day**. It also fails
when its own muhurta table disagrees with a published anchor, so the independent check cannot
quietly stop checking anything. `__tests__/observanceDates.test.ts` is the fast exact-date
guard inside `test:engine`.

**Class B (±1-day muhurta shift) — CLOSED, Sept 2026.** The script used to report a day
shift as a warning and print PASS. That let Dussehra (2024, 2026–2028), Diwali (2024–2026,
2028–2029), Dhanteras and Maha Shivaratri (every year 2024–2030) sit a day late while CI was
green; the user-facing report was Dussehra 2026 showing 21 Oct against Drik's 20 Oct.
Every lunar rule was then re-derived under each convention for 2024–2031, and each
disagreement was settled against a published date (Drik for New Delhi unless noted):

| dayRule | Convention | Rules | Published cases that decided it |
|---|---|---|---|
| `aparahna` | afternoon, first of two | Dussehra (+ darsha amavasya, 4 avatar jayantis) | 12 Oct 2024, 20 Oct 2026, 9 Oct 2027, 27 Sep 2028 |
| `pradosh` | evening (sunset + 0.1 night), first of two | Diwali, Dhanteras, Ahoi Ashtami, Parashurama & Dattatreya Jayanti, Bachh Baras, both Pradosh vrats, Purnima vrat | Diwali 31 Oct 2024 / 8 Nov 2026 / 17 Oct 2028; Pradosh 30 Jan, 28 Apr 2026; Purnima vrat 2 Jan, 2 Mar, 28 Jul 2026 |
| `nishita` | midnight, first of two | Maha & Masik Shivaratri, Sharad Purnima, Kojagara | 15 Feb 2026, 11 Feb 2029; Masik 17 Mar, 9 Sep 2026; Sharad 16 Oct 2024 |
| `ratri` | pradosh, else nishita | Masik Kalashtami, Kaal Bhairav Jayanti | all 13 Kalashtamis of 2026 (10 Apr vs 5 Aug decide the order); KBJ 22 Nov 2024, 20 Nov 2027 |
| `madhyahna` | midday | + Sita Navami, Ganga Saptami, Vat Savitri, Satyanarayan, **Maha Navami** (new rule) | 5 May, 3 May, 26 May 2025; Satyanarayan 2026 list; Maha Navami 11 Oct 2024 → 15 Oct 2029 (six years) |
| `sunset` | at sunset, first of two | Skanda Sashti | 22 Feb, 19 Jun, 17 Aug 2026 |
| `sunset-last` | at sunset, LATER of two | Narasimha Jayanti | 21 May 2024, 11 May 2025, 30 Apr 2026, 18 May 2027 |
| `purvahna` | 3 muhurtas past sunrise, later of two; else the opening day | Akshaya Tritiya | 19 Apr 2026 vs 9 May 2027 |
| `pradosh-next` | the day after the pradosh day | Holi (Rangwali) | 22 Mar 2027, 11 Mar 2028, 1 Mar 2029 |

Checked and deliberately left on `udaya` because a published date contradicts every other
convention: Bhai Dooj (11 Nov 2026), Radha Ashtami (19 Sep 2026, 8 Sep 2027), Janmashtami
(25 Aug 2027), Narak Chaturdashi, Shani Jayanti (27 May 2025 — a day after Vat Savitri),
Masik Durgashtami (all of 2026). Regenerating the table moved **417 Ujjain rows 2024–2031**;
`CACHE_VERSION` went to 9 so every other city re-scans.

**The one known divergence** is `KNOWN_DIVERGENCES['holi:2026']`: bhadra covered the 2 Mar
pradosh, so Drik lit Holika Dahan on 3 Mar and Holi was 4 Mar; the engine does not model
bhadra and says 3 Mar. The entry is excused only while the engine keeps giving exactly that
date. **Location caveat:** the table is Ujjain; Drik's lists are New Delhi, and a tithi that
opens between the two cities' sunsets legitimately differs (Skanda Sashti 23 vs 24 Mar 2026).

**Mutation check** (run once, Sept 2026): the new script against the pre-audit table fails
with 68 wrong dates, Dussehra 2026 among them.

**Forward sweep.** `verify:observances` now sweeps 2024–2031 by default (the whole
precomputed table). It depends on skipping adhik months — 2026 Jyeshtha, 2029 Chaitra and
2031 Bhadrapada each carry one — and the month is read at the tithi's own sunrise day, not
at the day the search starts from (2029's Chaitra Navratri is 14 Apr, in the nija month).

**Class A fixed, Sept 2026 — every sankranti was a day late.** Not a muhurta shift but a
plain off-by-one in `findSolarFestivalDate`: the loop compared each day's midnight with the
**previous** day's, so it returned the civil day whose midnight *followed* the ingress
instant rather than the day *containing* it. Makar Sankranti 2026 resolved to 15 Jan against
a published 14 Jan (ingress 14 Jan 3:13 PM IST); Kanya Sankranti to 18 Sep against 17 Sep
(ingress 7:58 AM IST). All twelve carried the same +1 shift, and it had never been caught
because `verify-observances.mts`'s `ANNUAL` table is keyed by lunar month/paksha/tithi and so
contains no sankranti row. It surfaced only when `vishwakarma-puja` — fixed to Kanya
Sankranti, and published on 17 September in almost every year — inherited it.

The loop now compares each day's midnight with the **next** day's and returns that day. All
twelve shipped dates move one day earlier, onto their published dates. Guards added:
`observanceDates.test.ts` pins Makar/Mesha/Kanya against published almanac dates for
2025–2027 and asserts all twelve still resolve once a year in ascending-longitude order, and
`CACHE_VERSION` went to 6 so a city that already scanned re-scans instead of hydrating the
old dates. The regenerated precomputed table was diffed by rule id: 16 ids added, 0 removed,
and exactly the 12 sankrantis moved.

That diff also caught a regression this change introduced and would otherwise have shipped:
`varalakshmi-vrat` moved, because `findRelativeRuleDates` builds its anchor by spreading the
rule and the new lunar-tithi `weekday` constraint then demanded that Shravana Purnima itself
be a Friday. The anchor now strips `weekday`. **Diff the table by rule id — the byte diff is
unreadable and this is what it is for.**

## Reproduce
```
cd mobile
npm run verify:observances   # festival-date check — fails on ANY day disagreement
npm run test:engine          # includes panchangVsDrikpanchang.e2e.test.ts + observanceDates
# regenerate / extend the fixture (throttle to avoid drik's reCAPTCHA):
EMIT_FIXTURE=1 START=2026-03-01 END=2027-06-15 POOL=1 DELAY=3000 \
  npx tsx scripts/verify-panchang-vs-drik.mts
```
