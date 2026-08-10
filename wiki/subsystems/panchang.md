---
title: Panchang, Muhurat & Jyotish
type: subsystem
sources: [mobile/src/panchang/engine.ts, mobile/src/panchang/eventMuhurat.ts, mobile/src/panchang/abujhMuhurat.ts, mobile/src/panchang/useMuhuratFinder.ts, mobile/src/screens/MuhuratFinderScreen.tsx, mobile/src/screens/MuhuratResultsScreen.tsx, mobile/src/screens/MuhuratDayDetailScreen.tsx, mobile/src/screens/AbujhDaysScreen.tsx, mobile/src/components/MuhuratFinderDoor.tsx, mobile/src/panchang/festivalEngine.ts, mobile/src/panchang/muhurat.ts, mobile/src/panchang/muhuratFormat.ts, mobile/src/panchang/useMuhurat.ts, mobile/src/panchang/usePanchang.ts, mobile/src/panchang/kundali.ts, mobile/src/panchang/useKundali.ts, mobile/src/screens/HomeScreen.tsx, mobile/src/screens/PanchangScreen.tsx, mobile/src/screens/MuhuratDetailScreen.tsx, mobile/src/screens/KundaliScreen.tsx, mobile/src/screens/RashifalScreen.tsx, mobile/src/components/TodayStrip.tsx, mobile/src/components/MuhuratGlanceCard.tsx, mobile/src/components/MuhuratCardBody.tsx, mobile/src/components/NorthIndianChart.tsx, mobile/src/components/KundaliOverview.tsx, mobile/src/components/JyotishGuidanceRows.tsx, mobile/src/components/JyotishPracticeCard.tsx, mobile/src/components/JyotishShareCard.tsx, mobile/src/components/JyotishShareSheet.tsx, mobile/src/components/JyotishStateCard.tsx, mobile/src/navigation/TabNavigator.tsx, mobile/src/navigation/PanchangStackNavigator.tsx, mobile/.maestro/kundali-smoke.yaml, docs/roadmap/prds/14-daily-muhurat.md, docs/roadmap/trds/14-daily-muhurat.trd.md]
last_verified_date: 2026-08-09
confidence: high
status: current
---

## Summary

The Panchang tab provides a Hindu-calendar almanac: date picker, festival/vrat observances, a katha library, Daily Muhurat, and Kundali plus deterministic Daily Rashifal. Panchang's top selector has three peer modes: `Panchang | Vrat & Parv | Jyotish`. The Kundali/Rashifal engine extends the existing astronomy primitives; it is pure, offline, Lahiri sidereal, and currently accepts the bundled Indian birth-city catalog with local IST input.

## Details

**Navigation** (`TabNavigator.tsx`, `PanchangStackNavigator.tsx`): tab 3 root is `PanchangScreen`; `MuhuratDetail`, `Kundali`, and `Rashifal` are routes in the same native stack. `PanchangHome` accepts `initialTab`, allowing Home's permanent Kundali launcher to land directly on Jyotish without making the calendar root unreachable. `TabNavigator` loads this stack through `React.lazy` + `Suspense`, so evaluating Panchang/Kundali/Rashifal modules cannot delay Home's first interactive frame.

**PanchangScreen** (`screens/PanchangScreen.tsx`): the three-way mode selector is the fixed first control, so switching to Jyotish cannot move it; the location/calendar-system/My Vrat row follows only in Panchang and Vrat modes. The screen then provides date picker + month calendar + observance list + katha section + a `MuhuratGlanceCard` row. The Jyotish branch is stateful: guests get Create Kundali, Daily Rashifal, and one Navagraha practice card; saved profiles get a daily-first landing with all three guidance rows, a compact Kundali reference, then the same one practice treatment. Focus refresh after save prevents a stale guest landing. Tapping the glance card navigates to `MuhuratDetail`.

**Kundali engine** (`panchang/kundali.ts`): pure calculations from an explicit UTC instant and bundled Indian city coordinates.
- Reuses `engine.ts`'s Lahiri ayanamsa; Sun/Moon/classical planets come from `astronomy-engine`, Rahu is the mean ascending node, and Ketu is exactly opposite.
- `computeLagna` solves the eastern ecliptic/horizon intersection and converts it to the sidereal ascendant.
- Houses are whole-sign from the Lagna sign. Each of nine grahas includes sidereal longitude, rashi, degree, nakshatra, pada, house, and retrograde state.
- `computeVimshottariDasha` uses the Moon's nakshatra, canonical nine-lord order, birth balance, and contiguous Mahadasha/Antardasha periods over the 120-year cycle.
- `buildKundaliInsights` explains Lagna, Moon, and current Dasha structurally for newcomers; it does not diagnose personality or promise events.
- `computeRashifal` anchors the India civil day at 06:00 IST, evaluates deterministic transit-house support for any Moon-sign index, and returns Favour/Pause/Practice/Reflection copy plus one allow-listed existing reader id. No random, AI, network, or luck-score path exists.

**Kundali hook/UI**:
- `useKundali.ts` owns the on-device profile `{ name?, date, time, cityId }`, strict input parsing, IST→UTC conversion, AsyncStorage hydration, and explicit loading/guest/saved/error states. Empty and corrupt storage are distinct; save/remove failures propagate to visible recovery UI. Birth city is independent of `PanchangLocationContext`.
- `KundaliScreen` starts with a blank city instead of a default profile. Saved profiles open the result; Edit is the only place removal appears. Results lead with `Overview`, followed by `Chart | Grahas | Dasha`, and every tab change resets the scroll position.
- Overview's Lagna, Moon, and Dasha cards are actionable. Traditional rashi labels are paired with plain-English equivalents, while the requested Lagna/Moon explanation copy avoids personality verdicts.
- `NorthIndianChart` renders the fixed-house diamond with SVG and exposes all twelve houses/occupants in one accessibility label; the Grahas table is the equivalent textual representation.
- The Dasha tab leads with current Mahadasha/Antardasha dates, progress, elapsed/remaining time and a current chip, followed by a connected nine-period timeline. The timing summary is accessible.
- `RashifalScreen` defaults to the saved chart's Moon rashi or allows manual selection across all twelve traditional/plain-English sign pairs. It renders Favour/Pause/Reflect with graha/bhava context, keeps the traditional-guidance disclaimer visible, and routes one suggested practice through the existing reader dispatcher.
- `JyotishGuidanceRows` and `JyotishPracticeCard` keep landing/detail treatments consistent. `JyotishShareSheet` captures a 4:5/1080×1350 `JyotishShareCard`: Kundali warns that name/date/time/city are present, while Rashifal explicitly excludes personal birth details.

**Muhurat engine** (`panchang/muhurat.ts`): pure arithmetic — no React, no astronomy, no `Date.now()`.
- Inputs: `sunrise: Date, sunset: Date, nextSunrise: Date, weekday: number`.
- Output `MuhuratDay`:
  - `dayChoghadiya[8]` + `nightChoghadiya[8]` — equal eighths of day/night; the 7-key WHEEL cycles from a weekday-specific start index (day) and `+5` offset (night). Convention: DrikPanchang.
  - `rahu`, `gulika`, `yamaganda` — fixed weekday-indexed eighths of the daytime (`RAHU_SEG`, `GULIKA_SEG`, `YAMAGANDA_SEG` tables).
  - `abhijit` — the 8th of 15 equal day-muhurtas (≈ solar noon); `null` if the day duration collapses.
- `classifyNow(md, at)` — point query returning current choghadiya + kaal for a given timestamp.

**Display helpers** (`panchang/muhuratFormat.ts`): `formatClock(d)` → 12-hour AM/PM string; `formatRange(a, b)` → range string; `formatRangeCompact(a, b)` → range with a shared meridiem written once (`3:37 – 5:13 PM`, full form across noon/midnight — the Home Today strip's chips); `formatEndInstant` → end clock with a short-date suffix on day-crossing. All pure.

**Hook** (`panchang/useMuhurat.ts`): bridges the engine with the live clock.
- Defers both `computePanchangForDate` calls (today + tomorrow) until `InteractionManager.runAfterInteractions`, then yields once more via `setTimeout(0)` — Home remains responsive while an initial scroll/tap is in progress and the hook returns `null` until the solve finishes. `useObservancesForDate` follows the same interaction-aware scheduling boundary.
- `useMinuteTick()` drives the live "now" recalc without re-solving the astronomy.
- Pre-dawn correction: when `isToday` and the clock is before today's sunrise, yesterday's night choghadiya window is prepended to `nowPeriods` so the active choghadiya resolves correctly.
- Returns `{ muhurat, panchang, isToday, nowChoghadiya, nowKaal }`.

**UI components**:
- `TodayStrip` — Home's lightweight Panchang glance. Its chip ScrollView always reserves the solved-row height, including while data is `null`, so deferred observance/muhurat results cannot move the category grid under a finger.
- `MuhuratGlanceCard` — inline summary on PanchangScreen (today's/selected Rahu Kaal + current choghadiya quality pill).
- `MuhuratCardBody` — shared body rendering the full 8+8 choghadiya table + three kaal rows; used by both glance card and detail screen.
- `MuhuratDetailScreen` — full-page view; sharing via `expo-sharing` + `react-native-view-shot` (captures a `View` ref). `busy` flag prevents double-taps.

**Testing** (run via `npm run test:engine` — tsx, not Jest):
- `muhurat.engine.test.ts` — units for `computeMuhuratDay` / `classifyNow`.
- `muhurat.drikfixture.test.ts` — golden values against DrikPanchang reference data.
- `muhurat.external.test.ts` — cross-check against an external reference.
- `muhurat.twoYear.test.ts` — two-year sweep for invariants (8+8 choghadiya always present, abhijit within day span).
- `kundali.engine.test.ts` — three hand-picked independent Swiss Ephemeris 2.10.03/Lahiri goldens plus whole-sign/node/Dasha invariants, novice-copy framing, all-sign Rashifal determinism, and a static purity guard.
- `kundali.swiss-corpus.test.ts` — a generated but committed 15-city × 10-instant Swiss Ephemeris matrix: 150 charts / 1,350 placements across 1950–2026. It pins official ephemeris file hashes and verifies strict angular bounds plus exact Lagna-rashi, rashi, nakshatra, pada, whole-sign-house, retrograde, first-Mahadasha-lord, and birth-Antardasha agreement. Method and measured maxima are in `panchang/KUNDALI_VERIFICATION.md`.
- Targeted Jest covers the accessible North Indian chart, novice-first result tabs, Rashifal framing/Moon-sign selection, strict profile IST conversion, and shared practice routing. The native-build `.maestro/kundali-smoke.yaml` clears app state and covers Home → guest Jyotish → no-default-city input → clickable Overview/Chart/Grahas/Dasha → Dasha progress/full timeline → privacy-aware Kundali share → saved daily-first landing → privacy-aware Rashifal share → all twelve translated sign choices.

**Event Muhurat Finder** (PRD-16 Phase 1; design.md §53, RULEBOOK §14): `eventMuhurat.ts` is pure (kundali-style boundary, source-purity test) — `EVENT_RULES` (6 occasions, **DRAFT pending §10**, `source.verified:false` pinned by test), factor match (nakshatra/tithi/vara) + dosha stack (rikta · amavasya · bhadra[sunrise karana] · panchak · adhik · vyatipata · vaidhriti · chaturmas · guru/shukra asta). `isChaturmasDay` reads the sunrise anga (Devshayani → Dev Uthani), is kshaya-safe (2026: Kartik Shukla Ekadashi touches no sunrise; bar lifts 21 Nov) and **purnimant-normalises** the month so the amanta setting can't move the season. Asta = elongation of Venus/Jupiter at local noon (orbs 10°/11°, validated: Guru 15 Jul–13 Aug 2026, Shukra 18–30 Oct 2026). `abujhMuhurat.ts` re-projects `ABUJH_RULE_IDS` through the **festival engine** (never re-match tithis — vriddhi dedupe lives there) + computed Guru/Ravi Pushya. `useMuhuratFinder` scans ~92 days (extends to ~260 for "first dates after" when empty), one solve per day, chunked behind `InteractionManager`. Screens: `MuhuratFinder` (occasion list) → `MuhuratResults` (ranked, **empty-with-reason**) → `MuhuratDayDetail` (answer→action→evidence, links `MuhuratDetail {dateMs}`); `AbujhDays`. Entries: Home **मुहूर्त** tile after कुंडली (grid now 16; नित्य साधना renders full-width closer) + `MuhuratFinderDoor` between the glance card and anga grid. Two tiers only (श्रेष्ठ/मध्यम), provenance on-surface (`· दृक्पंचांग पद्धति`). **Share**: `MuhuratFinderShareCard` captured off-screen from the day detail (non-excluded days only; no personal data), same view-shot pipeline as `MuhuratDetailScreen`. **Month-view overlay**: results → कैलेंडर में देखें → `PanchangHome { muhuratOverlay }`; the shipped month grid rings the days (a11y label appends "Muhurat day"), auto-expands, dismissable chip clears via `setParams`. Follow/remind is the next slice.

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
- **Golden fixtures are independent** — values in both Kundali Swiss fixtures are Swiss Ephemeris/Lahiri references, not captured outputs from this engine. Regenerate the 150-case corpus only with `scripts/generate-kundali-swiss-corpus.py` and its pinned official files; do not “fix” a failure by copying current app output or widening a tolerance.
- **Birth city is not current location** — never bind Kundali input to `PanchangLocationContext`; a user's birth place and present Panchang city are separate domain values.
- **No implicit profile/city** — an empty store must remain a guest state with no preselected rashi or city. Do not hide AsyncStorage failures by rendering a successful result.
- **Saved landing is daily-first** — Daily Rashifal precedes the compact Kundali because the chart is reference material while Rashifal is the repeat-daily action. Keep all three guidance rows on the landing.
- **Sharing has different privacy boundaries** — Kundali includes personal birth fields and must warn; Rashifal must never include them. Neither share card may introduce colours outside the existing theme language.
- **Rashifal is guidance** — do not add deterministic predictions, random/AI copy, remote feeds, professional directives, or devotional content ids outside the allow-list without an explicit product/content review.
- **Two astronomy solves per view** — both today and tomorrow are computed to get `nextSunrise`. Both wait for active interactions and then run in `setTimeout(0)`; the screen shows a skeleton/`null` until they complete. Do not move Home's Today-strip solves back onto the render path.
- **Pre-dawn correction is `isToday`-only** — the yesterday-night prepend only happens when `isToday` is true; when browsing past/future dates `nowPeriods` = today's windows only, so `nowChoghadiya`/`nowKaal` return null for non-today views.
- **Polar-latitude guard** — if `sunset ≤ sunrise` or `nextSunrise ≤ sunset`, `useMuhurat` returns `null` silently; the UI shows a skeleton indefinitely. Unlikely in practice given the location list is curated.
- **Char choghadiya = auspicious** — DrikPanchang marks "Char" as auspicious (movable/good for travel). Some sources mark it neutral. The engine follows DrikPanchang explicitly.
