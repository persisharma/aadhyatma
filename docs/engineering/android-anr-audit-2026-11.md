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

- **Fixed (candidate #1):** the voice check now runs on first need instead of at app start. `ReadAloudProvider` no longer probes on mount. `ensureVoices()` probes once, and is called by `useReaderReadAloud` after the reader's interactions settle and by the voice sheet when it opens. `refreshVoices()` still forces a re-probe. Remaining exposure: one `getVoices()` main-thread call per session, for users who open a read-aloud reader, after its transition.
- **Kept:** `BRAND_LAUNCH_REVEAL_ENABLED = false`. The particle reveal is disabled on all platforms (candidate #3; its timing matches the spikes).
- **Reverted by owner direction:** the Android first-frame splash release and the font-error fail-open (they addressed #2).
- **Not touched:** Meta SDK. It shipped in the first production build, so it cannot be dated against the onset.

## 5. What would make this a confirmed root cause

Android vitals → ANRs → clusters. Match the signatures in the table above. Any candidate whose signature appears is confirmed. If none appears, the cause is outside this audit's scope: React Native core or the Meta SDK internals.
