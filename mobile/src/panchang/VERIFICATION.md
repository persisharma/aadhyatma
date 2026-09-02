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
each major festival's correct civil day **independently** from astronomy-engine using its
proper muhurta rule (udaya/madhyahna/nishita/pradosh), anchors known drik dates, and fails
on any **wrong-month** regression. `__tests__/observanceDates.test.ts` is the fast anchor
guard inside `test:engine`.

Two **pre-existing** issues it surfaces (NOT the month bug, not yet fixed) — both downstream
of the sunrise-only matcher:
- **±1-day muhurta shift (Class B):** festivals fixed by a non-sunrise muhurta resolve one
  day late when their tithi starts after sunrise — remaining: Maha Shivaratri (Nishita) and
  Diwali/Dhanteras (Pradosh). e.g. Diwali 2025 engine 21 Oct vs real 20 Oct; Maha Shivaratri
  2026 engine 16 Feb vs real 15 Feb.
  **The moonrise (chandrodaya) members of this class are FIXED** (Aug 2026): `ObservanceRule.dayRule`
  now carries the per-rule vyapini convention, and `sankashti-chaturthi-vrat` + `karwa-chauth` + `bahula-chaturthi` + `bhadwa-chauth`
  match at moonrise (`tithiAtMoonrise` in `engine.ts`; RULEBOOK §23). Sankashti was wrong in
  6 of 12 lunations in 2025 and 5 of 13 in 2026 — Bhadrapada 2026 resolved to 1 Sep, whose
  9:22 PM moonrise falls in Panchami, instead of 31 Aug's 8:39 PM moonrise inside Chaturthi.
  Karwa Chauth moved only in 2027 and 2031 (2024–2026 already agreed).
  **The madhyahna members are FIXED too** (Aug 2026): `ganesh-chaturthi`, `ram-navami` and the
  monthly `vinayaka-chaturthi-vrat` match at the sunrise–sunset midpoint (`tithiAtMadhyahna`).
  Ganesh Chaturthi 2026 moved 15 Sep → 14 Sep, Ram Navami 2026 27 Mar → 26 Mar (and 2028
  4 Apr → 3 Apr); the monthly Vinayaka dates shifted in ~20 of 100 lunations 2024–2031 and now
  always coincide with Ganesh Chaturthi in Bhadrapada.
- **kshaya-tithi drop:** a festival whose tithi is skipped at sunrise is dropped entirely —
  e.g. Vasant Panchami 2025, Dev Uthani Ekadashi 2026, **Navratri start 2027**. (Since fixed:
  the matcher carries a kshaya fallback, and `verify:observances` reports `missing(kshaya)=0`.)

Closing the rest of Class B is the same three-part job the chandrodaya case took: a `dayRule`
value, its case in the matcher, and published-date tests across several years.

## Reproduce
```
cd mobile
npm run verify:observances   # festival-date check (independent muhurta re-derivation)
npm run test:engine          # includes panchangVsDrikpanchang.e2e.test.ts + observanceDates
# regenerate / extend the fixture (throttle to avoid drik's reCAPTCHA):
EMIT_FIXTURE=1 START=2026-03-01 END=2027-06-15 POOL=1 DELAY=3000 \
  npx tsx scripts/verify-panchang-vs-drik.mts
```
