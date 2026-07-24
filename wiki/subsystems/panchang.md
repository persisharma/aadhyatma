---
title: Panchang, Muhurat & Jyotish
type: subsystem
sources: [mobile/src/panchang/engine.ts, mobile/src/panchang/festivalEngine.ts, mobile/src/panchang/muhurat.ts, mobile/src/panchang/muhuratFormat.ts, mobile/src/panchang/useMuhurat.ts, mobile/src/panchang/kundali.ts, mobile/src/panchang/useKundali.ts, mobile/src/screens/PanchangScreen.tsx, mobile/src/screens/MuhuratDetailScreen.tsx, mobile/src/screens/KundaliScreen.tsx, mobile/src/screens/RashifalScreen.tsx, mobile/src/components/MuhuratGlanceCard.tsx, mobile/src/components/MuhuratCardBody.tsx, mobile/src/components/NorthIndianChart.tsx, mobile/src/components/KundaliOverview.tsx, mobile/src/navigation/PanchangStackNavigator.tsx, docs/roadmap/prds/14-daily-muhurat.md, docs/roadmap/trds/14-daily-muhurat.trd.md]
last_verified_date: 2026-07-24
confidence: high
status: current
---

## Summary

The Panchang tab provides a Hindu-calendar almanac: date picker, festival/vrat observances, a katha library, Daily Muhurat, and — as of PRD-C — Kundali plus deterministic Daily Rashifal. Panchang's top selector now has three peer modes: `Panchang | Vrat & Parv | Jyotish`. The Kundali/Rashifal engine extends the existing astronomy primitives; it is pure, offline, Lahiri sidereal, and India/IST-only in v1.

## Details

**Navigation** (`PanchangStackNavigator.tsx`): tab 3 root is `PanchangScreen`; `MuhuratDetail`, `Kundali`, and `Rashifal` are routes in the same native stack. `PanchangHome` accepts `initialTab`, allowing Home's permanent Kundali launcher to land directly on Jyotish without making the calendar root unreachable.

**PanchangScreen** (`screens/PanchangScreen.tsx`): date picker + month calendar + observance list + katha section + a `MuhuratGlanceCard` row. Its Jyotish landing presents Create Kundali, Daily Rashifal, and the existing Navagraha Stotram together. Tapping the glance card navigates to `MuhuratDetail`.

**Kundali engine** (`panchang/kundali.ts`): pure calculations from an explicit UTC instant and bundled Indian city coordinates.
- Reuses `engine.ts`'s Lahiri ayanamsa; Sun/Moon/classical planets come from `astronomy-engine`, Rahu is the mean ascending node, and Ketu is exactly opposite.
- `computeLagna` solves the eastern ecliptic/horizon intersection and converts it to the sidereal ascendant.
- Houses are whole-sign from the Lagna sign. Each of nine grahas includes sidereal longitude, rashi, degree, nakshatra, pada, house, and retrograde state.
- `computeVimshottariDasha` uses the Moon's nakshatra, canonical nine-lord order, birth balance, and contiguous Mahadasha/Antardasha periods over the 120-year cycle.
- `buildKundaliInsights` explains Lagna, Moon, and current Dasha structurally for newcomers; it does not diagnose personality or promise events.
- `computeRashifal` anchors the India civil day at 06:00 IST, evaluates deterministic transit-house support for any Moon-sign index, and returns Favour/Pause/Practice/Reflection copy plus one allow-listed existing reader id. No random, AI, network, or luck-score path exists.

**Kundali hook/UI**:
- `useKundali.ts` owns the on-device profile `{ name?, date, time, cityId }`, strict input parsing, IST→UTC conversion, and AsyncStorage hydration. Birth city is independent of `PanchangLocationContext`.
- `KundaliScreen` is input first when no profile exists; saved profiles open the result. Results lead with `Overview`, followed by `Chart | Grahas | Dasha`.
- `NorthIndianChart` renders the fixed-house diamond with SVG and exposes all twelve houses/occupants in one accessibility label; the Grahas table is the equivalent textual representation.
- `RashifalScreen` defaults to the saved chart's Moon rashi or allows manual selection across all twelve signs. The traditional-guidance disclaimer is always visible, and practice buttons route through the existing reader dispatcher.

**Muhurat engine** (`panchang/muhurat.ts`): pure arithmetic — no React, no astronomy, no `Date.now()`.
- Inputs: `sunrise: Date, sunset: Date, nextSunrise: Date, weekday: number`.
- Output `MuhuratDay`:
  - `dayChoghadiya[8]` + `nightChoghadiya[8]` — equal eighths of day/night; the 7-key WHEEL cycles from a weekday-specific start index (day) and `+5` offset (night). Convention: DrikPanchang.
  - `rahu`, `gulika`, `yamaganda` — fixed weekday-indexed eighths of the daytime (`RAHU_SEG`, `GULIKA_SEG`, `YAMAGANDA_SEG` tables).
  - `abhijit` — the 8th of 15 equal day-muhurtas (≈ solar noon); `null` if the day duration collapses.
- `classifyNow(md, at)` — point query returning current choghadiya + kaal for a given timestamp.

**Display helpers** (`panchang/muhuratFormat.ts`): `formatClock(d)` → 12-hour AM/PM string; `formatRange(a, b)` → range string; `formatRangeCompact(a, b)` → range with a shared meridiem written once (`3:37 – 5:13 PM`, full form across noon/midnight — the Home Today strip's chips); `formatEndInstant` → end clock with a short-date suffix on day-crossing. All pure.

**Hook** (`panchang/useMuhurat.ts`): bridges the engine with the live clock.
- Defers both `computePanchangForDate` calls (today + tomorrow) via `setTimeout(0)` to avoid synchronous render stutters — returns `null` while the solve is in flight.
- `useMinuteTick()` drives the live "now" recalc without re-solving the astronomy.
- Pre-dawn correction: when `isToday` and the clock is before today's sunrise, yesterday's night choghadiya window is prepended to `nowPeriods` so the active choghadiya resolves correctly.
- Returns `{ muhurat, panchang, isToday, nowChoghadiya, nowKaal }`.

**UI components**:
- `MuhuratGlanceCard` — inline summary on PanchangScreen (today's/selected Rahu Kaal + current choghadiya quality pill).
- `MuhuratCardBody` — shared body rendering the full 8+8 choghadiya table + three kaal rows; used by both glance card and detail screen.
- `MuhuratDetailScreen` — full-page view; sharing via `expo-sharing` + `react-native-view-shot` (captures a `View` ref). `busy` flag prevents double-taps.

**Testing** (run via `npm run test:engine` — tsx, not Jest):
- `muhurat.engine.test.ts` — units for `computeMuhuratDay` / `classifyNow`.
- `muhurat.drikfixture.test.ts` — golden values against DrikPanchang reference data.
- `muhurat.external.test.ts` — cross-check against an external reference.
- `muhurat.twoYear.test.ts` — two-year sweep for invariants (8+8 choghadiya always present, abhijit within day span).
- `kundali.engine.test.ts` — three independent Swiss Ephemeris 2.10.03/Lahiri golden fixtures (Ujjain 1992, Delhi 2000, Bengaluru 2024), angular tolerances, whole-sign/node/Dasha invariants, novice-copy framing, all-sign Rashifal determinism, and a static purity guard.
- Targeted Jest covers the accessible North Indian chart, novice-first result tabs, Rashifal framing/Moon-sign selection, and strict profile IST conversion. `.maestro/kundali-smoke.yaml` covers Home → Jyotish → birth profile → Overview/Chart/Grahas/Dasha → Rashifal.

**Anga model — sunrise anga + kshaya capture** (`panchang/engine.ts`): a civil day's tithi/nakshatra is the one current **at local sunrise** (udaya-vyapini convention), with `endTime` bisected forward from sunrise — end times only, no start times (an anga's start is the previous anga's end, usually the previous day; same convention as DrikPanchang). A tithi lasts 19h59m–26h47m, so between consecutive sunrises the index advances by 1 (normal), 0 (**vriddhi** — same anga at two sunrises), or 2 (**kshaya** — the anga begins and ends strictly inside the day, touching no sunrise; kshaya tithis occur roughly monthly, kshaya nakshatras similarly). `computePanchangForDate` detects the +2 jump against the next day's sunrise (memoised in `sunriseCache`, shared with all solvers) and fills `PanchangData.kshayaTithi` / `kshayaNakshatra`; UI shows them as a second row on the Tithi/Nakshatra tiles and as `क्षय` rows on the Muhurat card, with `formatEndInstant` (muhuratFormat.ts) adding a short-date suffix for past-midnight ends. Reference cases: Bengaluru 10 Jul 2026 — Dashami till 8:16 AM, kshaya Ekadashi till 5:22 AM on 11 Jul; Ujjain 29 Jan 2026 — Rohini, kshaya Mrigashira till 5:28 AM on 30 Jan.

**Festival kshaya fallback + vriddhi dedupe** (`festivalEngine.ts` `matchesLunarTithiRuleOnDate`): lunar-tithi observances match the sunrise tithi; when the target tithi is kshaya it matches the day the tithi prevails (sunrise tithi = target−1 today, target+1 tomorrow — DrikPanchang convention; Yogini Ekadashi 2026 = 10 Jul). Month is taken from the kshaya day's own sunrise, EXCEPT a skipped month-opening pratipada (shukla 1 amanta / krishna 1 purnimant), which belongs to the next day's month — using tomorrow's month for any other kshaya tithi misplaces festivals (it once put Holi 2027 on Magha Purnima); the day-month adhik guard must not pre-empt that branch (the pratipada's preceding amavasya can close an adhik lunation). On **vriddhi** (same tithi at two sunrises) the rule fires only on the FIRST day — its evening/night always falls inside the tithi — so monthly vrats no longer duplicate on adjacent days (removed 74 duplicate dates 2024–2031). The look-ahead/behind reuses the per-day `computeTithiAndMonth` cache; the chunked scanner warms one day past both year edges for it. The kshaya fallback recovered ~170 observances across 2024–2031 that previously vanished (incl. Holi 2028, Vasant Panchami 2025, Karwa Chauth 2024).

## Dependencies

- [[overview]] — Panchang tab (tab 3); `PanchangLocationContext` supplies the city lat/lon.
- `panchang/engine.ts` (`computePanchangForDate`) — astronomy-engine wrapper giving sunrise/sunset; `useMuhurat` calls it twice per date (today + tomorrow).
- `panchang/engine.ts` (`getAyanamsa`) — shared Lahiri primitive used by both Panchang and Kundali; do not fork it.
- `panchang/locations.ts` — the same bundled city coordinates are reused for birth-city selection, while persistence remains separate from current Panchang location.
- `utils/useMinuteTick.ts` — minute-tick utility that drives the live "now" choghadiya refresh.

## Gotchas

- **Regenerate the precomputed observance table after any matching change** — `TZ=Asia/Kolkata npx tsx scripts/gen-precomputed-observances.mts` (from `mobile/`); the app reads `precomputedObservances.ts` for Ujjain, so an engine fix that isn't regenerated never reaches users for 2024–2031.
- **Bump `CACHE_VERSION` in `observanceCache.ts` with every such change** — non-Ujjain cities persist their scans to AsyncStorage keyed by version; without the bump, previously-scanned devices hydrate the old dates forever and never re-run the scan (the fix ships only to Ujjain and fresh installs).

- **Engine is pure; hook is not** — all astronomy and clock calls live in `useMuhurat.ts`. Never add `Date.now()` or astronomy imports to `muhurat.ts`.
- **Kundali engine is pure; UI supplies time** — `kundali.ts` takes explicit dates and coordinates. AsyncStorage, `new Date()` for “today”, and React belong in hooks/screens. The source-purity test pins this boundary.
- **Golden fixtures are independent** — values in `kundali-swiss-ephemeris.json` are Swiss Ephemeris/Lahiri references, not captured outputs from this engine. Do not “fix” a failing accuracy test by copying current output into the fixture.
- **Birth city is not current location** — never bind Kundali input to `PanchangLocationContext`; a user's birth place and present Panchang city are separate domain values.
- **Rashifal is guidance** — do not add deterministic predictions, random/AI copy, remote feeds, professional directives, or devotional content ids outside the allow-list without an explicit product/content review.
- **Two astronomy solves per view** — both today and tomorrow are computed to get `nextSunrise`. Both run in `setTimeout(0)`; the screen shows a skeleton/`null` until they complete.
- **Pre-dawn correction is `isToday`-only** — the yesterday-night prepend only happens when `isToday` is true; when browsing past/future dates `nowPeriods` = today's windows only, so `nowChoghadiya`/`nowKaal` return null for non-today views.
- **Polar-latitude guard** — if `sunset ≤ sunrise` or `nextSunrise ≤ sunset`, `useMuhurat` returns `null` silently; the UI shows a skeleton indefinitely. Unlikely in practice given the location list is curated.
- **Char choghadiya = auspicious** — DrikPanchang marks "Char" as auspicious (movable/good for travel). Some sources mark it neutral. The engine follows DrikPanchang explicitly.
