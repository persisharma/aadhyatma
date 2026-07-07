---
title: Daily Routine (Nitya Sadhana)
type: subsystem
sources: [mobile/src/data/routine/types.ts, mobile/src/data/routine/units.ts, mobile/src/data/routine/useRoutineToday.ts, mobile/src/data/routine/vaar.ts, mobile/src/data/sadhana/progress.ts, mobile/src/data/sadhana/useSadhanaToday.ts, mobile/src/contexts/RoutineContext.tsx, mobile/src/contexts/RoutineSheetProvider.tsx, mobile/src/components/RoutineBanner.tsx, mobile/src/components/SankalpTodayCard.tsx, mobile/src/components/routineBannerView.ts, mobile/src/components/AddToRoutineButton.tsx, mobile/src/components/RoutineCelebration.tsx, docs/roadmap/prds/07-daily-routine-sadhana.md, docs/roadmap/prds/11-sadhana-programs.md]
last_verified_date: 2026-07-06
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
The catalog has **three standing entry points** (July 2026 review — it used to hang solely off the
create-routine chooser, unreachable in practice once a routine existed): the `CreateRoutineScreen`
'choose' fork, ghost "तैयार संकल्प चुनें / Browse sankalps" buttons on `RoutineToday` + `RoutineList`,
and a संकल्प Home DISCOVER spotlight card — pinned by `screens/__tests__/SankalpTouchpoints.test.tsx`.
`RoutineList` cards and the wizard's `ModeCard`s now wear the warm §8 gradient card language too.

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
  only shows the manual completion CTA for `active` days.
- **Indic typography traps (app-wide, caught here first):** `scriptBodyFont`/`scriptTitleFont` return
  the *fallback* for `hi` — passing a Cormorant token (`cardLatin` etc.) silently drops Hindi to the OS
  system face; and any `letterSpacing` on Devanagari splits the shirorekha ("शि व"). Use the `meaning`
  face for Hindi prose captions, `scriptBodyFont`+`cardMeta` for meta lines, `pillTextStyle()` for
  pills/labels, and lineHeight ≥1.5× fontSize (matras clip below ~1.45×). Guarded by
  `utils/__tests__/typographySafety.test.ts`.
- Tests: `contexts/__tests__/RoutineContext.test.tsx`, `screens/__tests__/RoutineCompletion.test.tsx`,
  `screens/__tests__/SankalpTouchpoints.test.tsx` (catalog entry points),
  `components/__tests__/routineBannerView.test.ts` + `RoutineBanner`/`RoutineCelebration` tests;
  Maestro `routine-smoke.yaml` (daily lifecycle) and `routine-weekday-smoke.yaml`
  (weekday chip, un-mark, open-into-reader, remove-item).
