---
title: Panchang & Muhurat
type: subsystem
sources: [mobile/src/panchang/muhurat.ts, mobile/src/panchang/muhuratFormat.ts, mobile/src/panchang/useMuhurat.ts, mobile/src/screens/PanchangScreen.tsx, mobile/src/screens/MuhuratDetailScreen.tsx, mobile/src/components/MuhuratGlanceCard.tsx, mobile/src/components/MuhuratCardBody.tsx, mobile/src/navigation/PanchangStackNavigator.tsx, docs/roadmap/prds/14-daily-muhurat.md, docs/roadmap/trds/14-daily-muhurat.trd.md]
last_verified_date: 2026-07-06
confidence: high
status: current
---

## Summary

The Panchang tab provides a Hindu-calendar almanac: date picker, festival/vrat observances, a katha library, and — as of PRD-14 — a Daily Muhurat glance card and full detail screen. The muhurat engine (Choghadiya, Rahu/Gulika/Yamaganda Kaal, Abhijit) is pure arithmetic from sunrise/sunset timestamps and the weekday; no astronomy inside the engine itself.

## Details

**Navigation** (`PanchangStackNavigator.tsx`): tab 3 root is `PanchangScreen`; a `MuhuratDetail` route was added to the same native stack.

**PanchangScreen** (`screens/PanchangScreen.tsx`): date picker + month calendar + observance list + katha section + a `MuhuratGlanceCard` row. Tapping the glance card navigates to `MuhuratDetail`.

**Muhurat engine** (`panchang/muhurat.ts`): pure arithmetic — no React, no astronomy, no `Date.now()`.
- Inputs: `sunrise: Date, sunset: Date, nextSunrise: Date, weekday: number`.
- Output `MuhuratDay`:
  - `dayChoghadiya[8]` + `nightChoghadiya[8]` — equal eighths of day/night; the 7-key WHEEL cycles from a weekday-specific start index (day) and `+5` offset (night). Convention: DrikPanchang.
  - `rahu`, `gulika`, `yamaganda` — fixed weekday-indexed eighths of the daytime (`RAHU_SEG`, `GULIKA_SEG`, `YAMAGANDA_SEG` tables).
  - `abhijit` — the 8th of 15 equal day-muhurtas (≈ solar noon); `null` if the day duration collapses.
- `classifyNow(md, at)` — point query returning current choghadiya + kaal for a given timestamp.

**Display helpers** (`panchang/muhuratFormat.ts`): `formatClock(d)` → 12-hour AM/PM string; `formatRange(a, b)` → range string. Both pure.

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

## Dependencies

- [[overview]] — Panchang tab (tab 3); `PanchangLocationContext` supplies the city lat/lon.
- `panchang/engine.ts` (`computePanchangForDate`) — astronomy-engine wrapper giving sunrise/sunset; `useMuhurat` calls it twice per date (today + tomorrow).
- `utils/useMinuteTick.ts` — minute-tick utility that drives the live "now" choghadiya refresh.

## Gotchas

- **Engine is pure; hook is not** — all astronomy and clock calls live in `useMuhurat.ts`. Never add `Date.now()` or astronomy imports to `muhurat.ts`.
- **Two astronomy solves per view** — both today and tomorrow are computed to get `nextSunrise`. Both run in `setTimeout(0)`; the screen shows a skeleton/`null` until they complete.
- **Pre-dawn correction is `isToday`-only** — the yesterday-night prepend only happens when `isToday` is true; when browsing past/future dates `nowPeriods` = today's windows only, so `nowChoghadiya`/`nowKaal` return null for non-today views.
- **Polar-latitude guard** — if `sunset ≤ sunrise` or `nextSunrise ≤ sunset`, `useMuhurat` returns `null` silently; the UI shows a skeleton indefinitely. Unlikely in practice given the location list is curated.
- **Char choghadiya = auspicious** — DrikPanchang marks "Char" as auspicious (movable/good for travel). Some sources mark it neutral. The engine follows DrikPanchang explicitly.
