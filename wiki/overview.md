---
title: Overview
type: overview
sources: [README.md, mobile/package.json, mobile/app.json, mobile/jest.config.js, mobile/App.tsx, mobile/src/navigation/, mobile/src/data/texts.ts, mobile/src/data/routine/, mobile/src/panchang/, mobile/src/notifications/japamAlarms.ts, RULEBOOK.md, design.md, scripts/, push.sh]
last_verified_date: 2026-07-06
confidence: medium
status: current
---

## Summary

Aadhyatma is an umbrella repo housing **Vedansh**, an offline-first Hindu devotional-text
reader built with Expo / React Native. It bundles bilingual (Hindi/English) content — Bhagavad
Gita, chalisas, Sundarkand, stotrams, aartis, sanskar — and layers on a Panchang (Hindu
calendar) engine, a japam counter, daily-bhakti notifications, verse sharing, and a Daily
Routine (नित्य साधना) planner. All content ships inside the app bundle; there is no content
backend.

## Stack
- **Language:** TypeScript ~5.9.2 (strict). Path aliases `@/*` → `src/*`, `@assets/*` → `assets/*`.
- **Framework:** Expo SDK ~54.0.33 · React Native 0.81.5 · React 19.1.0 (New Architecture **enabled** — flipped on to fix an iOS 26 legacy-bridge launch crash; legacy arch must stay off).
- **Navigation:** React Navigation 7 — `native-stack` + `bottom-tabs`. **Not** expo-router.
- **State:** React Context only (no Redux/Zustand). `@react-native-async-storage/async-storage` 2.2.0 for persistence.
- **OTA:** `expo-updates` ~29.0.17, `runtimeVersion` policy `appVersion`.
- **Audio:** `expo-audio` (japam playback). **Notifications:** `expo-notifications`. **Calendar math:** `astronomy-engine` ~2.1.19.
- **Fonts:** Noto Serif Devanagari (Devanagari), Cormorant Garamond (Latin), Noto Serif Gujarati + Noto Serif Kannada (the gu/kn reading languages).
- **Reading languages:** `hi · en · gu · kn` (one shared `useGitaLanguage()` pref). gu/kn carry no authored content — derived at runtime by transliterating the Devanagari. See [[languages]].
- **App version:** 1.4.3 (`mobile/app.json`).
- **Entry Point:** `mobile/index.ts` → `registerRootComponent(App)` → `mobile/App.tsx`.

## Request Shape

`App.tsx` wraps the tree in `GestureHandlerRootView` + `SafeAreaProvider`, then nests ~14
context providers (Theme, GitaLanguage, Bookmarks, UserActivity, NewContent, ReadingProgress,
JapamCounter, Routine, RoutineSheet, NotificationPreferences, Share) around a
`NavigationContainer` → `RootNavigator` → a **5-tab bottom navigator**:

1. **Home** → `HomeStackNavigator` (native-stack, 30+ reader screens: Gita, chalisas,
   Sundarkand, stotrams, sanskar, japam, search — plus 5 Daily-Routine screens:
   RoutineToday/List/Create/Detail/AddItems). HomeScreen shows the ॐ वेदांश़ ॐ `HomeWordmark`
   (replaced `Crest`, #110) and a docked `RoutineBanner` above the tab bar.
2. **DailyBhakti** → `DailyBhaktiScreen`.
3. **Panchang** → `PanchangStackNavigator` (PanchangScreen, observances, katha library, vrat).
4. **Audio ("Bhajan")** → `AudioStackNavigator` (audio library, Now Playing).
5. **More** → `MoreStackNavigator` (MoreHome, Wishlist, Profile, Reminders).

Deep links and notification taps route through `navigationRef`, exported from
`mobile/src/notifications/deepLink.ts`; route mapping lives in `mobile/src/navigation/entryRoutes.ts`.

## Module Map

| Module | Purpose | Key Paths |
|---|---|---|
| `mobile/src/screens/` | Reader & feature screens (one per text/variant) | `GitaReaderScreen`, `ChalisaReaderScreen`, `DailyBhaktiScreen`, `PanchangScreen`, `MuhuratDetailScreen`, `JapamAlarmsScreen` |
| `mobile/src/components/` | Reusable UI | `GitaVersePage`, `LibraryCard`, `UpdateReadyModal`, `ReminderOptInModal`, `LanguageToggle`, `RoutineBanner`, `AddToRoutineButton`, `HomeWordmark`, `MuhuratGlanceCard`, `MuhuratCardBody` |
| `mobile/src/navigation/` | Nav graph + types | `RootNavigator`, `TabNavigator`, `HomeStackNavigator`, `MoreStackNavigator`, `PanchangStackNavigator`, `types.ts`, `entryRoutes.ts` |
| `mobile/src/contexts/` | App state | `BookmarksContext`, `JapamCounterContext`, `JapamAlarmsContext`, `ReadingProgressContext`, `UserActivityContext`, `NewContentContext`, `NotificationPreferencesContext`, `RoutineContext`, `RoutineSheetProvider` |
| `mobile/src/data/` | Bundled content + registries | `texts.ts` (library index), `searchIndex.ts`, `deities.ts`, `categories.ts`, `gita/chapter-01..18.json`, `chalisa/`, `sundarkand/`, stotram dirs, `sourceIdMigration.ts`, `routine/` (types, units, vaar, useRoutineToday — see [[routine]]) |
| `mobile/src/panchang/` | Hindu-calendar engine | `festivals.ts` + astronomy-engine; `muhurat.ts` (Choghadiya/Kaal/Abhijit engine — pure), `muhuratFormat.ts`, `useMuhurat.ts` (see [[panchang]]) |
| `mobile/src/theme/` | Design tokens (light-only) | `ThemeContext.tsx`, `colors.ts`, `typography.ts`, `spacing.ts` |
| `mobile/src/utils/` | Helpers | `shareVerse.tsx`, `semverCompare.ts`, `titleByLanguage.ts`, `useMinuteTick.ts` |

## Data Layer

All content is **bundled JSON**, not fetched. The canonical source is markdown at the repo
root; `scripts/*.mjs` (Node ESM) transform it into per-text JSON under `mobile/src/data/`,
which the reader screens consume. `texts.ts` is the library index (`LibraryEntry`: id, names,
category, deities, verseCount, `addedInVersion` for the NEW badge). `searchIndex.ts` is the
full-text search index. `sourceIdMigration.ts` keeps bookmarks/progress stable across content
ID changes. User language preference, routines (`@vedansh/routines`) and daily done-marks
(`@vedansh/routine-done`) are persisted in AsyncStorage.

## Content Pipeline

1. **Canonical markdown** at repo root: `BhagwadGita/` (18 chapter files), `HanumanChalisa/`,
   `Sundarkand/`, and the master `bhagavad-gita-complete-hi-en.md`.
2. **`scripts/*.mjs`** (Node ESM, run manually — **not** a build step): `parse-gita`,
   `split-sundarkand`, `transliterate-shloka`, and `fix-*` repair tools → write JSON into `mobile/src/data/`.
3. The app reads only the JSON. `RULEBOOK.md` is the integration contract for adding a new
   section; `design.md` is the visual-system spec; `push.sh` wraps `eas update` for OTA publishing.

## Testing

- **Jest 29** (react-native preset) for screens/utils/contexts/components/theme — `npm run test:readers` (`--runInBand`).
- **tsx + `node:assert`** for the Panchang engine — `npm run test:engine`; and for `src/data` /
  `src/notifications` suites, which are **deliberately excluded from Jest** (see the comment in
  `mobile/jest.config.js`). Run those via `tsx --test`.
- **Maestro** E2E — 18+ flows in `mobile/.maestro/` (`npm run test:e2e`): per-category smokes,
  NEW-badge ×3, routine ×2, sadhana-sankalp, japam-alarms, search, wishlist, reminders, more-hub,
  resume-reading, deity-browse, gita-reader, language-smoke. The README table lists behaviours
  **deliberately covered by unit tests instead** (chapter auto-advance, OTA modal, notification
  deep-link, share card, japam reset).
- `contentCorrectness.test.ts` pins RULEBOOK content rules; `readerTypeScale`, `colors.contrast`,
  `semverCompare`, and `entryRoutes` tests gate the rest.

## Reference Docs (linked in place — not copied into the wiki)

- `RULEBOOK.md` — integration contract for adding a content section (file list, content shape, design rules, verification checklist).
- `design.md` — visual system spec (color/type tokens, type scale, romanization rules by source language).
- `docs/roadmap/` — Q3 2026 roadmap and PRDs 01–07 (07 = Daily Routine).
- `docs/superpowers/` — deity-icon plan + design spec.

## Gotchas

- **OTA + `runtimeVersion: appVersion`** — an OTA update reaches only users on a matching store
  build. Publish at the *live store runtime*, not blindly at `app.json`'s version (store builds
  have historically run ahead of `app.json`).
- **Light theme only** — `ThemeMode` allows `dark`, but the app is hardcoded to light (`userInterfaceStyle: "light"`).
- **Not expo-router** — navigation is hand-wired React Navigation stacks; there is no file-based routing.
- **Content is bundled** — OTA ships the JS bundle, **not** new festival data or audio; those require a store release.
- **Two test runners** — never add `src/data` tests to Jest; they run via `tsx --test` and Jest's `testMatch` excludes them.
- **Romanization is by source language, not module** — Sanskrit = IAST; Awadhi/Hindi = pronunciation ASCII (design.md §3.1).
- **Scripts are manual** — `scripts/*.mjs` are one-time transform/repair tools, not part of the build.

> Personal identifiers (owner email, bundle IDs, EAS project id/URL) live in `mobile/app.json`
> and `mobile/eas.json` and are intentionally **not** reproduced here — see those files directly.
