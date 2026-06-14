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

## Location note (engine is always Ujjain)
The engine ignores device location and always computes for Ujjain. Tithi/nakshatra/yoga/
karana/masa are effectively location-independent, but **sunrise, sunset, moonrise and the
derived muhurta windows (Brahma Muhurta, Rahu Kala, etc.) are location-specific** and will
be off for users far from Ujjain (e.g. ~13 min in Vadodara). `computePanchangForDate`
already builds an `Observer`; parameterising lat/long would enable accurate local timings.

## Reproduce
```
cd mobile
npm run test:engine          # includes panchangVsDrikpanchang.e2e.test.ts
# regenerate / extend the fixture (throttle to avoid drik's reCAPTCHA):
EMIT_FIXTURE=1 START=2026-03-01 END=2027-06-15 POOL=1 DELAY=3000 \
  npx tsx scripts/verify-panchang-vs-drik.mts
```
