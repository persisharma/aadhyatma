---
title: Daily Routine (Nitya Sadhana)
type: subsystem
sources: [mobile/src/data/routine/types.ts, mobile/src/data/routine/units.ts, mobile/src/data/routine/useRoutineToday.ts, mobile/src/data/routine/vaar.ts, mobile/src/contexts/RoutineContext.tsx, mobile/src/contexts/RoutineSheetProvider.tsx, mobile/src/components/RoutineBanner.tsx, mobile/src/components/routineBannerView.ts, mobile/src/components/AddToRoutineButton.tsx, mobile/src/components/RoutineCelebration.tsx, docs/roadmap/prds/07-daily-routine-sadhana.md]
last_verified_date: 2026-06-13
confidence: high
status: current
---

## Summary

PRD-07 (#87; fixes #109; home chip #110). Users build named routines of reciting units —
whole sections, single chapters/stotras, or japam round-targets — scheduled `daily` or
per-`weekday` (with a vaar deity-of-the-day suggestion). "Today's practice" is computed live:
completion is **derived from genuine reading/japa activity today**, with a manual check-off
fallback. All state lives in AsyncStorage; no backend.

## Details

**Data model** (`src/data/routine/types.ts`): `Routine { id, nameHi, nameEn, mode, items,
createdAt }`; `RoutineItem { kind: 'section' | 'chapter' | 'japam', sourceId, chapter?,
targetRounds?, weekdays? }`. Item granularity is a complete reciting unit — never a single
stotram verse (that is Daily Bhakti's job). `routineItemKey(routineId, itemId)` is the
completion-tracking key.

**Scheduling** (`vaar.ts`): in `weekday` mode each item carries weekday numbers (0=Sun…6=Sat).
`VAAR_DEITY` maps weekday → a deity that **must exist in the catalog** (drives the SUGGESTED
content chip); `WEEKDAY_DEITY_LABEL` is the bilingual *display* name and may name a deity we
don't ship — Saturday is "शनि देव · हनुमान" but surfaces hanuman content.

**Storage** (`RoutineContext.tsx`): three AsyncStorage keys — `@vedansh/routines` (the
array), `@vedansh/routine-done` (`{date, keys}`; manual marks, discarded on load when date ≠
today), `@vedansh/routine-celebrated` (plain date key; staleness checked at read time).
API: `createRoutine(nameHi, nameEn, mode)` / `deleteRoutine` / `addItem` / `removeItem` /
`markManualDone` / `unmarkManualDone` / `celebratedToday` / `markCelebratedToday`.

**Completion** (`units.ts` + `useRoutineToday.ts`): an item is auto-complete when persisted
ReadingProgress reached the unit's **last verse-page today** (per-chapter last positions are
memoised from the verse pool — `__resetUnitsCache()` is the test seam) or, for japam, when
UserActivity day totals show `rounds ≥ targetRounds`. `useRoutineToday()` composes
Routine + ReadingProgress + UserActivity into `{entries, doneCount, total, hasRoutine}`;
`doneMode` is `'manual' | 'auto' | null` (manual wins).

**UI surfaces:** a docked `RoutineBanner` on Home above the tab bar (pure view-model in
`routineBannerView.ts`; single-line chip since #110); `RoutineCelebration` (pushpa-varsha)
plays once per day when everything is done; five native-stack routes — `RoutineToday`,
`RoutineList`, `RoutineCreate`, `RoutineDetail`, `RoutineAddItems`; every reader's toggle row
hosts an `AddToRoutineButton` (chaptered readers pass the current chapter) which opens
`AddToRoutineSheet` via `RoutineSheetProvider`.

## Dependencies

- [[overview]] — provider nesting: `RoutineProvider` + `RoutineSheetProvider` sit between
  JapamCounter and NotificationPreferences in `App.tsx`.
- [[readers]] — `AddToRoutineButton` sits beside `LanguageToggle` in each reader's toggle row.
- `ReadingProgressContext` / `UserActivityContext` — the auto-completion sources.

## Gotchas

- **Completion is derived, not stored** — only manual marks and the celebration date persist;
  auto-completion recomputes from progress whose `updatedAt` date-key must equal **today**.
- **Done-marks reset daily** purely by date comparison on load/persist — there is no scheduler.
- **`useRoutines()` throws outside `<RoutineProvider>`** — App.tsx wiring is mandatory.
- **Bilingual fields are hardcoded hi/en pairs** (`nameHi`/`nameEn`, `subHi`/`subEn`,
  `{hi, en}` label maps) — the app-wide pattern; any new-language work must touch these.
- **Search FAB vs banner z-order** — the search ⌕ FAB had to be lifted above the docked
  banner (it was swallowing the tap; caught by `search-smoke.yaml`).
- Tests: `contexts/__tests__/RoutineContext.test.tsx`, `screens/__tests__/RoutineCompletion.test.tsx`,
  `components/__tests__/routineBannerView.test.ts` + `RoutineBanner`/`RoutineCelebration` tests;
  Maestro `routine-smoke.yaml` (daily lifecycle) and `routine-weekday-smoke.yaml`
  (weekday chip, un-mark, open-into-reader, remove-item).
