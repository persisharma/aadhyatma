# Android ANR audit — November 2026 (fresh, evidence-based)

**Trigger.** Play Console on 7 Nov 2026 shows an ANR rate of 0.67% as a 28-day average and 1.60% on 5 Nov. The bad-behaviour threshold is 0.47%.
**Scope.** This is a static audit. No Play ANR stack traces were available, and no Android device or emulator was available. Confidence tags: **[Certain]** read directly in code or records; **[Likely]** strong inference from platform behaviour; **[Guessing]** plausible but unconfirmed.

## 1. When did it start? There is no observable regression onset

- **[Certain]** Play production 1.5.0 (versionCode 12) was submitted on 11 Oct as a full first listing: release, descriptions, graphics, screenshots and Data Safety (`wiki/runbooks/store-submission.md`). The Q3 roadmap records "no Play Store release" before Q4. Play's release markers on the ANR chart fall on 11, 26 and 27 Oct, which match 1.5.0, 1.5.4 and 1.5.5.
- **[Likely]** The first daily point is 19 Oct at 2.7%. The 28-day average starts at that same value and then falls, with nothing before it, not even 0% days. That pattern means the first day with enough users to report, not a healthy app that regressed.
- **Conclusion.** ANRs are most likely present in the base Android app from its first production build. No later change can be shown to have introduced them. The particle reveal (2 Nov) is the only change whose timing coincides with spikes (2 Nov 1.5%, 5 Nov 1.6%). It is disabled and stays disabled by owner decision.

## 2. Method

1. Generated the real native project with `expo prebuild --platform android`, using production Meta settings and a placeholder token. Read the generated `MainApplication`, `MainActivity` and merged app manifest: receivers, services, providers and expo-updates settings (`CHECK_ON_LAUNCH=ALWAYS`, `LAUNCH_WAIT_MS=0`).
2. Swept 21 autolinked native libraries for main-thread blocking: `runBlocking`, latches, waits, sync IO, `commit()`, `Queues.MAIN`, main→JS waits. Each hit was classified by the thread it actually runs on, with file:line evidence.
3. Reviewed the app-owned native code (Japam alarm receivers, widget providers, Meta module) and the JS that triggers native main-thread work at launch.

Only input-dispatch timeouts count as user-perceived ANRs. Those need either 5 s with input pending and the main thread busy, or a key event while no window is focused.

## 3. Ranked root-cause candidates

| # | Mechanism | Present since | Frequency | Confidence | Play stack signature |
|---|---|---|---|---|---|
| 1 | **Text-to-speech voice probe at launch.** `ReadAloudProvider` (app root) calls `Speech.getAvailableVoicesAsync()` on mount (`ReadAloudContext.tsx:217`). expo-speech lazily constructs `TextToSpeech`, which binds to the system TTS engine. Its init callback resolves the queued probe with `getVoices()`, which is `textToSpeech.voices`: a synchronous binder call into the engine (`SpeechModule.kt:79-100, 139-180`). On current Android the init callback runs on the main thread. The JS-side 4 s timeout does not stop the native call. | #230, 11 Aug (every Android production build) | Every cold start, including for users who never use read-aloud | Probe and thread [Certain]/[Likely]. Duration: depends on the engine; a seconds-long tail on low-end devices is [Guessing] | `android.speech.tts.TextToSpeech.getVoices`, `expo.modules.speech` on `main` |
| 2 | **Undrawn launch window.** expo-splash-screen vetoes the activity's first draw (`OnPreDrawListener` returns false) until JS calls `hideAsync`. No window is focused, so a Back press that waits more than 5 s is an ANR. The hold covers process start, expo-updates delay-load, bundle evaluation, **16 fonts / 5.3 MB** loaded at runtime (the 696 KB Tiro font arrived on 19 Oct), the start-target race (≤1 s) and two AsyncStorage reads. | `preventAutoHideAsync` since #2 (Apr); hydration hold #219 (25 Jul) | Every cold start; only slow devices exceed 5 s | Mechanism [Certain]; frequency [Guessing] | `Input dispatching timed out … does not have a focused window` |
| 3 | **First WebView in a process starts Chromium on the main thread** (`RNCWebViewManagerImpl.kt:62-67`). The particle reveal did this on every cold start from 2–7 Nov and is now disabled. The YouTube player (`DockedYouTubePlayer`) still does it when the player is opened. | Particles 2 Nov (disabled); YouTube native in the 26/27 Oct binaries | Particles: every cold start (stopped). YouTube: on demand | Thread [Certain]; multi-second on low-end devices [Likely] | `WebViewFactory.getProvider`, `WebViewChromiumAwInit` |
| 4 | **expo-updates delay-load worst case.** If launching from disk fails, or an asset is missing, it falls back to network fetches with 10 s timeouts before React mounts. This lengthens #2. | Always | Rare | Control flow [Certain]; frequency [Guessing] | Same as #2 |
| 5 | **ExoPlayer on the main thread.** The global player is created eagerly at the app root (`AudioPlayerContext.tsx:71`), tens of ms. Release blocks up to 500 ms (Media3 default) when the japam player unmounts. | 1 Jul (#158) | Every launch / each japam exit | Thread [Certain]; release timeout [Likely] | `androidx.media3…release`, `expo.modules.audio` |
| 6 | **Bounded main-thread waits.** WebView `shouldOverrideUrlLoading` waits on JS for up to 250 ms. WebView cookie `flush()`. `QueuedWork.waitToFinish` on `onStop` after notification-store `apply()` writes. expo `DataPersistor.commit()`. | Various | Per event | [Certain] threads, small durations | Various |

Not user-perceived (these count only in the overall ANR rate): widget providers and Japam receivers rendering or scheduling on main in broadcasts, and the expo-notifications service work (goAsync and a thread).

**Checked and cleared:** no unbounded main↔JS deadlock. expo-audio `runBlocking` blocks the JS thread, not main. expo-updates `launchAssetFile` runs on IO or a React Native background executor. react-native-view-shot captures on an executor. safe-area-context `waitForReactLayout` cannot run in bridgeless mode. Firebase init does nothing without a google-services file. The full coverage list is in the session audit notes.

## 4. Status of changes

- **Fixed (candidate #1):** the voice check now runs on first need instead of at app start. `ReadAloudProvider` no longer probes on mount. `ensureVoices()` probes once, and is called by `useReaderReadAloud` on a cleared 500 ms timer after the reader mounts and by the voice sheet when it opens. `refreshVoices()` still forces a re-probe. In the next store build, `patches/expo-speech+14.0.8.patch` removes the remaining main-thread call. Android delivers `onInit` on main; the patch moves the queued `getVoices()` and `speakOut()` drain to the serial AsyncFunction queue and flips the ready flag there, which keeps queued work in order. It also stops activity destroy from constructing an engine only to shut it down.
  - **Verification:** the patched file was compiled with kotlinc 2.1.20 against Android/Expo stand-ins (no Android SDK available). A JVM harness then queued a speak and a probe, fired `onInit` from a thread named `main`, and followed with a later speak. Patched: `getVoices` ran on `expo.modules.AsyncFunctionQueue`, and the speaks ran in order on that queue. Original: `getVoices` and the queued speak ran on `main`. A real Gradle build and on-device run are still PENDING. Until that store build ships, the OTA-able reader-open change is the mitigation.
- **Kept:** `BRAND_LAUNCH_REVEAL_ENABLED = false`. The particle reveal is disabled on all platforms (candidate #3; its timing matches the spikes).
- **Reverted by owner direction:** the Android first-frame splash release and the font-error fail-open (they addressed #2).
- **Not touched:** Meta SDK. It shipped in the first production build, so it cannot be dated against the onset.

## 5. What would make this a confirmed root cause

Android vitals → ANRs → clusters. Match the signatures in the table above. Any candidate whose signature appears is confirmed. If none appears, the cause is outside this audit's scope: React Native core or the Meta SDK internals.

## 6. Play clusters (8 Nov 2026) — candidate #2 confirmed

**Evidence.** Android vitals → Crashes and ANRs, read from truncated issue titles (no full stacks were shared). Every listed ANR cluster except one is titled **"Input dispatching timed out (No focused window …)"**. The remaining one ("Native method - android.os.MessageQueue.nativePollOnce") is titled plain "Input dispatching timed out". The main-thread frames differ between clusters:

| Main-thread frame (truncated) | Versions shown | Reading |
|---|---|---|
| `android.os.MessageQueue.nativePollOnce` | — | Main thread **idle**. Input still waited, so no app code was blocking it **[Certain]** |
| `com.facebook.react.common.assets.ReactFontManager…`, `com.facebook.react.views.text.ReactTextView…` | — | Main mounting text under the undrawn window **[Likely]** |
| `com.swmansion.rnscreens.ScreenContainer…`, `android.view.ViewRootImpl.updateShowC…` | — | First mount/layout **[Likely]** |
| `expo.modules.kotlin.types.JSTypeConverter…` (×2) | — | expo-audio converts status events on main (`AudioPlayer.kt` `sendPlayerUpdate` → `withContext(Dispatchers.Main)` → `SharedObject.emit`). The root player was created at every launch (candidate #5) **[Likely]** |
| `[libglslcompiler.so] GLSLCompileToUnifle…`, `[libart.so] art::ConditionVariable::WaitHol…` ("Unresponsive GPU") | 1.5.0 | GPU driver / runtime wait — device-side **[Likely]** |
| `com.pairip.licensecheck.LicenseClient…` | — | Play **automatic protection**-injected licence check, not repo code (no `pairip` in the repo) **[Certain]** |
| `unavailable - com.facebook.react.bridge…` | **1.5.5 (live)** | Unidentified — needs the full stack |

**Conclusion.** A "No focused window" ANR means a key event waited 5 s for a window that could take focus. Varied main-thread frames, including an idle one, are what you see when focus is the problem rather than any one blocking call. That fits candidate #2: expo-splash-screen's `OnPreDrawListener` returns `false` until JS hides the splash (`SplashScreenManager.kt`), so the activity window is never drawn and never focused. **[Likely]**; confirm with device traces showing `keepSplashScreenOnScreen` set during the input timeout.

**Changes (supersedes the "Reverted by owner direction" line in §4):**
- **JS / OTA-able:** `LaunchCover` (`#FFF1D5`) replaces the pre-Home parchment placeholders. On Android it calls `SplashScreen.hideAsync()` on its first layout. The undrawn span therefore no longer includes 15 runtime fonts, the start-target race or font-size/language hydration. Font load errors fail open. iOS is unchanged.
- **Native / next store build:** `plugins/withAndroidLaunchWindow.js` calls `SplashScreenManager.hide()` in `MainActivity.onCreate` before the first draw, and sets `AppTheme`'s window background to `#FFF1D5`. The window becomes focusable on its first traversal, and pre-React frames stay splash ivory. Verified in an `expo prebuild` output only; a Gradle build and device run are **PENDING**.
- **JS / OTA-able (candidate #5):** `AudioPlayerProvider` now creates its native player on first use instead of at launch. Sessions that never play recorded audio construct no ExoPlayer and emit no main-thread status.
- **Not code:** the PairIP cluster goes away only if Play Console → Test and release → App integrity → **Automatic protection** is turned off (owner decision). GPU-driver clusters are device-side.
- **Still open:** the live 1.5.5 `com.facebook.react.bridge…` cluster. Its full stack is needed before any change.

## 7. Play Vitals 3–10 Nov 2026 (1.5.5 / versionCode 15) — crashes and the box-shadow ANR

Confidence tags as above. No Android SDK or device was available in this session, so every native result is **PENDING** until a Gradle release build and device run.

| Issue | Users / events | Decision |
|---|---|---|
| Crash: `NotificationForwarderActivity.onCreate` → `createNotificationResponseBroadcastIntent`, `IllegalArgumentException: notification (null) and action (null) should not be null` (Android 12, Samsung M11/M31) | 2 / 2 | **Fixed by backport.** See §7.1 |
| Crash: `SurfaceControl.checkNotReleased` NPE in `ActivityThread.syncTransferSplashscreenViewTransaction` (Android 12L, Jio tablet) | 1 / 1 | **Guarded on API 31–32.** See §7.2 |
| ANR: main thread in `Paint.<init>` ← `OutsetBoxShadowDrawable` ← `BaseViewManager.setBoxShadow` (Android 12, OPPO) | 1 / 1 | **Not changed. Needs a design decision.** See §7.3 |
| ANRs in GPU/driver/OEM frames: `DrawFrameTask`, `nNotifyFramePending`, `WaitHoldingLocks`, `updateShowChinBar`; also `ReactTextView.<init>` (no focused window) | 1 each | Ignored. No app frames. The no-focused-window ANR is §6's candidate #2, already addressed |

### 7.1 Notification-tap crash

- **[Certain]** `expo-notifications` 0.32.17 is the newest release on the SDK 54 line (`npm view expo-notifications dist-tags`: `sdk-54 → 0.32.17`). Its `NotificationForwarderActivity` throws whenever the activity's `Notification`/`NotificationAction` Parcelable extras read back as null. On API 31+ every tap that opens the app goes through this activity.
- **[Certain]** Upstream fixed this in expo/expo#43203 (merged 17 Feb 2026, SDK 55; issues #38908 and #24451). The fix stores a byte-array copy of both objects in the tap `PendingIntent`, falls back to that copy, and if recovery still fails it opens the app instead of throwing. Upgrading would mean an SDK bump, so `patches/expo-notifications+0.32.17.patch` backports only the `NotificationForwarderActivity` and `NotificationsService` hunks, verbatim. The unrelated `ExpoHandlingDelegate` and Firebase changes in that release are not included.
- **[Likely]** Cause: Parcelable extras lost between the PendingIntent and the activity, concentrated on Samsung Android 11/12 according to the upstream reports. Relaunch with empty extras is also caught by the same `catch`. The forwarder is `exported=false`, `excludeFromRecents`, `noHistory` in the library manifest. The app overrides none of these (no `tools:replace` in `plugins/`). Checking the merged manifest needs a prebuild + Gradle build and is **PENDING**.
- **Why not a bare `finish()`:** the user's tap would then do nothing. The backport recovers the full response from the bytes when possible, and otherwise opens the app at its normal launch.
- **Residual:** notifications already queued by 1.5.5 carry no byte copy. If their extras are lost, the tap opens the app at Home without the deep link, but it does not crash.
- **Payload audit [Certain]:** all 12 `scheduleNotificationAsync` call sites in `src/notifications/` set typed `data` (the japam slots via `buildContent`). The default action identifier is supplied by the library. The crash happens before any payload is read, so payload shape is not a factor. The remote-push path (`pushToken.ts`) only registers tokens.
- **Guard:** `src/notifications/__tests__/expoNotificationsPatch.jest.test.ts` pins the patch file to the installed version and checks the patched source.

### 7.2 Android 12/12L splash-transfer crash

- **[Certain]** `expo-splash-screen` 31.0.13 `SplashScreenManager.registerOnActivity` always registers `setOnExitAnimationListener` (a 400 ms fade). **[Likely]** On API 31+ a registered exit listener is what makes the platform transfer the `SplashScreenView` into the app. That transfer path is the crashing frame, and it is a framework bug on 12/12L.
- `patches/expo-splash-screen+31.0.13.patch` skips the listener on `S`/`S_V2` only, so the system dismisses its own splash. Both the splash and `LaunchCover` are blank `#FFF1D5`, so the missing fade cannot be seen. API ≤30 and ≥33 are unchanged. Guarded by `src/components/__tests__/expoSplashScreenPatch.test.ts`.

### 7.3 Box-shadow ANR: evidence too thin for an app-wide visual change

- **[Certain]** No component writes `boxShadow` directly. All 9 occurrences go through `androidBoxShadow()` in `src/theme/elevation.ts`. That covers 5 token tiers used at about 90 call sites in 56 files, plus the routine banner and the mini-player. The token deliberately avoids integer `elevation` because Android draws it as a grey box on all four sides (design.md §4).
- **[Certain]** In RN 0.81.5, `OutsetBoxShadowDrawable` paints with a `BlurMaskFilter` and allocates new `Path`s on every draw. **[Likely]** This is real CPU/GPU cost per shadowed card on low-end GPUs, and it overlaps with the GPU-wait ANRs listed above. **[Guessing]** It caused this ANR: the sample was one main-thread snapshot in a `Paint` constructor, which is cheap on its own.
- Replacing list-item shadows with `elevation` changes the look of about 56 screens and components on Android, and it needs native visual QA at Standard and Large sizes. One event does not justify that. **Revisit if** the cluster reaches ≥3 users in a 28-day window, or if GPU-wait ANRs rise after 1.5.6. The cheapest next step would then be flattening the `subtle`/`card` tiers in list rows to a warm hairline border on Android, after design sign-off.
