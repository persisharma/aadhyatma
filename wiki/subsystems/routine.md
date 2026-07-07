---
title: Daily Routine (Nitya Sadhana)
type: subsystem
sources: [mobile/src/data/routine/types.ts, mobile/src/data/routine/units.ts, mobile/src/data/routine/useRoutineToday.ts, mobile/src/data/routine/vaar.ts, mobile/src/data/sadhana/progress.ts, mobile/src/data/sadhana/useSadhanaToday.ts, mobile/src/contexts/RoutineContext.tsx, mobile/src/contexts/RoutineSheetProvider.tsx, mobile/src/components/RoutineBanner.tsx, mobile/src/components/SankalpTodayCard.tsx, mobile/src/components/routineBannerView.ts, mobile/src/components/AddToRoutineButton.tsx, mobile/src/components/RoutineCelebration.tsx, docs/roadmap/prds/07-daily-routine-sadhana.md, docs/roadmap/prds/11-sadhana-programs.md]
last_verified_date: 2026-07-03
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

**Sadhana Programs / prebuilt sankalps** (`data/sadhana/*`, `SankalpTodayCard.tsx`):
prebuilt programs share the Today's Practice surface. Active program days show their selected
unit and can auto/manual-complete. Calendar-gated programs (`weekday`, `festival-window`) keep
their waiting/resting copy when the gate is closed, but still expose the next selected unit as a
tap-to-read preview so enrolling in an upcoming sankalp does not land on an empty dead end.
The catalog (`SadhanaProgramListScreen`) + detail follow the app card language (design.md §46):
`RoutineShell` gained an optional `background` prop → the catalog sits on `getRandomDeityBackground()`
(By-Deity convention) and the detail on `getDeityBackground(program.deity)`; cards are warm
`LibraryCard`-style (gradient thumb from `program.thumb`, both languages via `orderTitlesByLanguage`,
status pill, `›`). The `SankalpTodayCard` stays flat to match the Today's Practice ledger.

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
- **Waiting sankalps are previews, not completions** — `waiting.items` powers the visible
  preselected content row, but `useSadhanaToday()` only computes completion and `SankalpTodayCard`
  only shows the completion checkbox for `active` days (the waiting-preview row has no check
  circle — a rest-day read can't advance the vow, so an empty circle would falsely promise it).
- **Sankalp day-completion is committed, not derived** — unlike a routine item (whose `done` is
  recomputed live in `useRoutineToday`), a sankalp day only advances when `SadhanaCompletionOverlay`
  (mounted once at the App root) sees an `active` card with `allItemsDoneToday` and calls
  `commitDay`, persisting `completedDays[dayIndex]`. This is why "routine completed but sankalp
  didn't" can happen if the overlay isn't mounted/reached. The `SankalpTodayCard` eyebrow shows
  `completedDayCount(enrollment) / N` (NOT `status.dayIndex`) so it ticks 0→1 on the commit and
  agrees with the List/Detail pills. Guarded by `SadhanaCompletion.integration.test.tsx`.
- Tests: `contexts/__tests__/RoutineContext.test.tsx`, `screens/__tests__/RoutineCompletion.test.tsx`,
  `components/__tests__/routineBannerView.test.ts` + `RoutineBanner`/`RoutineCelebration` tests;
  Maestro `routine-smoke.yaml` (daily lifecycle), `routine-weekday-smoke.yaml`
  (weekday chip, un-mark, open-into-reader, remove-item), and `sadhana-sankalp-smoke.yaml`
  (enroll → practise → set-aside lifecycle for the consecutive Hanuman Chalisa 41-day program).
