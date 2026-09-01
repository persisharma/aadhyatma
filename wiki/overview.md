---
title: Overview
type: overview
sources: [README.md, mobile/package.json, mobile/app.json, mobile/jest.config.js, mobile/App.tsx, mobile/src/navigation/, mobile/src/data/texts.ts, mobile/src/data/backgrounds.ts, mobile/src/data/routine/, mobile/src/panchang/, mobile/src/notifications/japamAlarms.ts, mobile/assets/backgrounds/, RULEBOOK.md, design.md, scripts/, push.sh, mobile/eslint.config.js, mobile/src/theme/, mobile/src/components/ReaderHeader.tsx, mobile/src/components/TextField.tsx]
last_verified_date: 2026-08-30
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
- **Audio:** `expo-audio` (japam + the bhajan library). **Speech:** `expo-speech` ~14.0.8 — on-device TTS read-aloud on the Gita and chalisa readers (see [[audio]]). **Notifications:** `expo-notifications`. **Calendar math:** `astronomy-engine` ~2.1.19.
- **Fonts:** Noto Serif Devanagari (Devanagari), Cormorant Garamond (Latin), Noto Serif Gujarati + Noto Serif Kannada (the gu/kn reading languages).
- **Reading languages:** `hi · en · gu · kn` (one shared `useGitaLanguage()` pref). gu/kn carry no authored content — derived at runtime by transliterating the Devanagari. See [[languages]].
- **App version:** 1.4.6, iOS build 46 (`mobile/app.json`).
- **Entry Point:** `mobile/index.ts` → `registerRootComponent(App)` → `mobile/App.tsx`.

## Request Shape

`App.tsx` wraps the tree in `GestureHandlerRootView` + `SafeAreaProvider`, then nests ~14
context providers (Theme, GitaLanguage, Bookmarks, UserActivity, NewContent, ReadingProgress,
JapamCounter, Routine, RoutineSheet, NotificationPreferences, Share) around a
`NavigationContainer` → `RootNavigator` → a **5-tab bottom navigator**:

The native splash stays visible until fonts plus the persisted font-size and reading-language
preferences have hydrated. Those preferences alter Home geometry, so this gate makes the first
visible Home frame stable instead of moving the launcher grid immediately after landing.

1. **Home** → `HomeStackNavigator` (native-stack, 30+ reader screens: Gita, chalisas,
   Sundarkand, stotrams, sanskar, japam, search — plus 5 Daily-Routine screens:
   RoutineToday/List/Create/Detail/AddItems). HomeScreen shows the ॐ वेदांश़ ॐ `HomeWordmark`
   (replaced `Crest`, #110), the Panchang-backed Today strip, and an inline `RoutineBanner`.
2. **DailyBhakti** → `DailyBhaktiScreen`.
3. **Panchang** → lazy `PanchangStackNavigator` (PanchangScreen, observances, katha library,
   vrat, Kundali, Rashifal). Its modules are evaluated only when the tab/launcher first opens,
   keeping Home startup independent of the heavier calendar/Jyotish graph.
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
| `mobile/src/theme/` | Design tokens (light-only) | `ThemeContext.tsx`, `colors.ts`, `typography.ts`, `spacing.ts` (spacing + radii), `elevation.ts`, `fontScale.ts` |
| `mobile/src/readAloud/` | Pure read-aloud layer (no React) | `verseAdapter.ts`, `verseScript.ts`, `voices.ts`, `pronounce.ts`, `prefs.ts` — see [[audio]] |
| `mobile/src/audio/` | Audio session + cross-source arbitration | `audioSession.ts`, `playbackArbiter.ts` |
| `mobile/src/utils/` | Helpers | `shareVerse.tsx`, `semverCompare.ts`, `titleByLanguage.ts`, `useMinuteTick.ts` |

## Data Layer

All content is **bundled JSON**, not fetched. The canonical source is markdown at the repo
root; `scripts/*.mjs` (Node ESM) transform it into per-text JSON under `mobile/src/data/`,
which the reader screens consume. `texts.ts` is the library index (`LibraryEntry`: id, names,
category, deities, verseCount, `addedInVersion` for the NEW badge). `searchIndex.ts` is the
full-text search index. `sourceIdMigration.ts` keeps bookmarks/progress stable across content
ID changes. User language preference, routines (`@vedansh/routines`) and daily done-marks
(`@vedansh/routine-done`) are persisted in AsyncStorage.

Background artwork is also bundled offline. `mobile/assets/backgrounds/index.ts` is the typed
static-require registry, while `mobile/src/data/backgrounds.ts` deterministically maps category,
deity, source/reader and Theerth surfaces to those assets. Deities use distinct semantic plates;
Theerth normally inherits the presiding deity and may override by temple id. Production sketches
are 1024×1024 WebP files; `backgrounds.coverage.jest.test.ts` pins both coverage and commissioned
asset identity so a future placeholder reuse fails explicitly.

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
- **Content is bundled** — OTA ships the JS bundle, **not** new festival data or audio; those require a store release. **Native modules too**: read-aloud (`expo-speech`) shipped as a store release, and that version bump drags `APP_TOUR_VERSION` + a `whatsNew` entry with it.
- **Two test runners** — never add `src/data` tests to Jest; they run via `tsx --test` and Jest's `testMatch` excludes them.
- **Jest suites that render a FlatList/VirtualizedList must unmount their trees** (`afterEach` + `act`). VirtualizedList schedules cell-batch `setTimeout`s; a timer that outlives its suite fires after teardown and Jest converts the late console.error into "Cannot log after tests are done" — **the run exits 1 under a fully green summary** (all suites PASS, exit code 1). Diagnosed Aug 2026 via `LocationPickerModal.test.tsx`; note the summary line alone can't be trusted — check `$?`, and don't pipe Jest through `tail`/`grep` when you need its exit code.
- **Romanization is by source language, not module** — Sanskrit = IAST; Awadhi/Hindi = pronunciation ASCII (design.md §3.1).
- **Scripts are manual** — `scripts/*.mjs` are one-time transform/repair tools, not part of the build.
- **Notification permission goes through `src/notifications/permissionState.ts`** — on Android, expo's raw `getPermissionsAsync()` reports a never-requested `POST_NOTIFICATIONS` as `denied`, so "never asked" and "user refused" are indistinguishable from `status` alone. The module resolves an effective status from `canAskAgain` + a persisted app-wide "we asked" flag, and both reminder features (daily verse, japam alarms) read it. See [[japam-alarms]].
- **Three design-token rules are lint-enforced, because all three fail silently in RN** —
  `mobile/eslint.config.js` (`no-restricted-syntax`) rejects a font-family **string literal**, a
  hex on **`shadowColor`**, and a **`fontSize` below 10** anywhere in `src/` outside `src/theme/`.
  An unloaded/misspelled font family renders in the system font with no warning — that is how four
  call sites shipped naming `NotoSansDevanagari_600SemiBold`, a family the app never installed.
  `npm run lint` must report **0 errors** (RULEBOOK §4 step 3).
- **Shared UI contracts to reuse, not re-implement** — `ReaderHeader.tsx` is the only reader/
  chapters top bar (`variant="reader"` 16pt / `"index"` 22-20pt), and `TextField.tsx` is the only
  text-input spec (`variant="search"` 44/Cormorant for content search, `"form"` 48/Inter for data
  entry). Both were extracted in July 2026 from ~32 and 3 divergent copies respectively;
  hand-rolling either is a RULEBOOK §3 hard reject.

> Personal identifiers (owner email, bundle IDs, EAS project id/URL) live in `mobile/app.json`
> and `mobile/eas.json` and are intentionally **not** reproduced here — see those files directly.
