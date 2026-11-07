# Android ANR review — November 2026

**Trigger.** Play Console, 7 Nov 2026: ANR rate 0.67% (28-day average), 1.60% on 5 Nov. Play's
bad-behaviour threshold for user-perceived ANRs is 0.47%. The daily series is noisy (several days
without data), which suggests a small daily-user base where one ANR moves the rate.

**Evidence limit.** No Play ANR stack clusters were available for this review. Every finding below
comes from source and dependency inspection, not from production stacks. Confidence tags:
**[Certain]** = read directly in code; **[Likely]** = strong inference from documented platform
behaviour; **[Guessing]** = plausible, unconfirmed.

## How to confirm against Play

Android vitals → ANRs → group by cluster and match the signature:

| Play signature | Finding |
|---|---|
| `Input dispatching timed out (… does not have a focused window)` | F1, F2, F4 |
| `WebViewFactory.getProvider`, `WebViewChromiumAwInit.startChromiumLocked` | F3 |
| `kotlinx.coroutines.runBlocking`, `expo.modules.audio` | F5 |
| `com.facebook.*` on `main` | F6 |
| `Broadcast of Intent`, `QueuedWork.waitToFinish`, `SharedPreferencesImpl` | F7 |

## Findings

### F1 — Android splash hold left the window undrawn and unfocused · FIXED

- **[Certain]** `expo-splash-screen` holds the splash by returning `false` from the activity's
  `OnPreDrawListener` (`node_modules/expo-splash-screen/android/.../SplashScreenManager.kt`). The
  activity window is not drawn until `hideAsync()`, so it cannot take input focus.
- **[Certain]** Before this fix, `hideAsync()` ran only after bundle evaluation, 15 font
  registrations, the cold-start target race (≤1 s), two AsyncStorage reads, the particle
  WebView's Chromium start, a 170 KB document parse and particle readiness. Only the 7,000 ms
  `BRAND_REVEAL_TIMEOUT_MS` watchdog bounded the hold (`BrandLaunchReveal.tsx`).
- **[Likely]** A key event (Back gesture/button) during a hold longer than 5 s is a user-perceived
  ANR. Budget Android phones are the slow tail where this happens.
- **[Likely]** Timing: the particle launch merged on 2 Nov (#587, #601, #602), adding WebView start
  to every cold start's hold. The 1.60% day was 5 Nov.
- **Fix.** `mobile/src/components/LaunchCover.tsx`. On Android, the native splash is released when the
  first JS frame (a `#FFF1D5` cover, the native splash colour) lays out. Home remains hidden behind
  that cover and then the reveal's own ivory surface, under the same hydration and
  canvas-readiness conditions. iOS is unchanged. This is JS-only, so an OTA update to the live
  Android runtime can deliver it.
- **Visual note.** Binaries built before the transparent `splash-blank.png` (#601) still show the
  old static emblem. On those binaries the launch now runs emblem → blank ivory → particles. Before,
  the emblem stayed until the particles were ready.

### F2 — A font registration failure held launch forever · FIXED

- **[Certain]** `App.tsx` read only `useFonts(...)[0]`. Any failed family left `fontsReady` false
  permanently, so the app stayed on the splash or cover. On Android that also meant a permanent
  unfocused window and an ANR on every key press.
- **Fix.** `fontsReady = fontsLoaded || fontError != null`. A failed family falls back to platform glyphs.

### F3 — Chromium starts on the main thread on every cold start · MITIGATED (reveal disabled on all platforms, 7 Nov)

- **Decision (7 Nov).** `BRAND_LAUNCH_REVEAL_ENABLED = false`. Every launch takes the gate's bypass path,
  so no WebView is created at launch. Re-enable only with ANR evidence; option (a) below is the safe route back.

- **[Certain]** `BrandParticleWebView` mounts a `react-native-webview` on every non-targeted cold
  start. Before 2 Nov, only YouTube surfaces created a WebView.
- **[Likely]** The first WebView in a process loads the WebView provider and initialises Chromium on
  the UI thread. This usually takes 100 ms to 1 s, and several seconds on low-RAM devices or while
  Play is updating WebView. After F1, the window is focused during this start-up, so a tap during
  a start longer than 5 s becomes an input-dispatch ANR instead of a no-focused-window ANR. This
  is rarer, but it remains possible.
- **Options.** (a) Render the approved particles natively, with no WebView (needs design approval
  and a new binary). (b) Skip the reveal on `ActivityManager.isLowRamDevice()` or after a previous
  watchdog timeout on this device. That is a fail-open path the gate already supports. Choose
  using the Play cluster data.

### F4 — The window is still undrawn before the first JS frame · OPEN (native)

- **[Certain]** `SplashScreen.preventAutoHideAsync()` runs at module scope, so bundle load and the App
  static-graph evaluation still happen under an undrawn window. `launchGraph.test.ts` keeps that
  graph lean, but no native ceiling exists.
- **Recommendation (new binary).** Patch `expo-splash-screen` to stop holding after about 4 s. Also set
  the app theme's `android:windowBackground` to `#FFF1D5`, so a forced early draw shows ivory
  instead of the default white.

### F5 — expo-audio blocks the JS thread on the main thread; a global player is built at launch · OPEN

- **[Certain]** expo-audio 1.1.1 runs its constructor, `play`, `pause` and every status property
  through `runOnMain = runBlocking(mainQueue)` (`AudioModule.kt`). `AudioPlayerContext.tsx` calls
  `createAudioPlayer(null)` when the provider first renders, so an ExoPlayer is built on the main
  thread during every launch, even when nothing ever plays.
- **[Guessing]** Any path where the main thread waits on the JS thread while JS is inside
  `runBlocking` would deadlock and therefore ANR. No such path was confirmed in RN 0.81.
- **Recommendation.** Create the global player lazily on the first `playTrack`. Watch upstream
  expo-audio for removal of `runBlocking`.

### F6 — Meta SDK work on the main thread · OPEN (low) — deliberately untouched

- **Decision (7 Nov).** Leave it unchanged unless the dates align. It shipped in 1.5.0 (Play release marker
  11 Oct), but Play has no ANR data before 19 Oct, so its release cannot be shown to align with the ANR onset.
  Revisit if a longer Play range or per-version ANR rate shows the rate starting with 1.5.0.

- **[Certain]** `MetaAppEventsModule.activate` is `.runOnQueue(Queues.MAIN)`. It creates
  `AppEventsLogger` (SharedPreferences reads) after interactions settle. The SDK's init provider
  also runs on the main thread in every process start, including widget, alarm and boot broadcast
  cold starts. This SDK shipped in the 7–12 Oct build window.
- **Recommendation (new binary).** Drop `.runOnQueue(Queues.MAIN)`. The calls used here are documented
  as thread-safe, and `activateApp`'s lifecycle tracker is deliberately not used.

### F7 — Broadcast-path work (counts in overall ANR rate, not user-perceived) · OPEN (low)

- **[Certain]** `VedanshWidgetProvider` decodes the 14-day payload and builds `RemoteViews` on the
  main thread. This happens for `onUpdate` (every 30 min) and for each tithi or day-boundary alarm.
  Each one can cold-start the full RN/Expo/Meta `Application`.
- **[Certain]** expo-notifications sends every schedule and cancel as a manifest broadcast
  (`goAsync` + thread). The store's `apply()` writes defer each `PendingResult.finish()` until disk
  flush. Ten reminder families re-arm at launch, which makes a long serial broadcast queue.
- **[Certain]** The Japam receivers do small SharedPreferences, NotificationManager and AlarmManager
  work on the main thread. Acceptable.
- **Recommendation.** Use `goAsync()` with a worker thread in the widget provider. Keep the reminder
  re-arm in diff-only form, without cancel-all-then-schedule.

### Checked and cleared

- `react-native-view-shot` 4.0.3 captures and compresses on a background executor, not the UI thread.
- No `useNativeDriver: false` animations. The only interval polls are a 1 s YouTube progress poll, a
  250 ms japam bead clock in JS, and minute ticks.
- `FontScaleContext` and `GitaLanguageProvider` fail open on AsyncStorage errors (`finally` →
  `isLoading=false`).

## Verification status (tested head: see the PR)

| Check | Result | Evidence / next action |
|---|---|---|
| Unit: Android release once, retry on failure, iOS unchanged, cover colour | PASS | `jest src/components/__tests__/LaunchCover.test.tsx` |
| Existing launch-gate and native-handoff contracts | PASS | `BrandLaunchGate.test.tsx`, `BrandNativeHandoff.test.ts` |
| Launch graph budget, widget startup contract | PASS | `tsx --test launchGraph.test.ts`, `npm run test:widgets` |
| Typecheck, lint on changed files | PASS | `tsc --noEmit`, `eslint` |
| Native Android cold start: no visible handoff, Back during launch exits cleanly | PENDING | Needs a device run. Low-end Android plus a debug build with a delayed WebView |
| iOS launch unchanged | PENDING | Device or simulator run |
| Play ANR rate after rollout | PENDING | Needs an OTA to the live Android runtime (not published by this change) and then 28-day Play data |
