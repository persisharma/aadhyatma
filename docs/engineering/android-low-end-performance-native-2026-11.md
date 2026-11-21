# Android on low-end phones and slow networks — store-build half (November 2026)

**Trigger.** The same review as `android-low-end-performance-2026-11.md` (the OTA half). These three changes need a new store binary: they add bundled assets, native font files and Gradle settings.
**Scope.** Nothing here has been compiled into an Android app or run on a device. The bundle figures are from real `expo export` runs; the generated Android project was inspected after `expo prebuild`. No Gradle build, no APK, no phone. Everything that needs one is listed as pending in §4.

## 1. What changed

| # | Finding | Change |
|---|---|---|
| 2 | The JS bundle carries 43 MB of JSON; every OTA re-downloads all of it. | The Valmiki Ramayan corpus (27 MB, the largest part) ships as bundled asset files and is loaded on demand. |
| 6 | Fifteen fonts load at runtime behind the launch gate. | Android builds embed all fifteen. |
| 7 | No R8 / resource shrinking. | Both enabled for Android release builds. |

## 2. The numbers

### 2.1 Bundle weight (finding 2) — **built**

`npx expo export --platform android`, `main` at `729a96e` against this branch:

| | Before | After | Change |
|---|---|---|---|
| Hermes bundle (Android) | 51,709,334 bytes (51.7 MB) | 26,619,208 bytes (26.6 MB) | −48.5% |
| The same, gzipped (what an OTA transfers at best) | 16.3 MB | 9.3 MB | −42.9% |
| Hermes bundle (iOS) | not built | 26.6 MB | — |
| Bundled assets in the update | 318 | 391 (+73 corpus parts, 27.3 MB) | |
| Largest synchronous corpus load when a kāṇḍa opens | one `require` of 6.4 MB | none; parts of ≈390 KB, one per turn of the event loop | |

Checked on the built bundles: four verse ids that are not in the Daily Bhakti selection are present in the `main` bundle and absent from this one, and the export's asset map lists all 73 parts.

These figures are for a bundle built for a runtime that embeds the parts (app version 1.5.7 and newer); a bundle built for an older runtime is unchanged at 51.7 MB (§5). What an OTA carries after this change, to a store build that embeds the parts: the 26.6 MB bundle and no corpus. `expo-updates` records embedded assets and treats an update's asset with the same key as already present (`EX_UPDATES_COPY_EMBEDDED_ASSETS` is off by default, so they are referenced in place, not copied).

### 2.2 Fonts (finding 6) — **counted**, behaviour read from source

Fifteen files, 5,555,316 bytes. Today each is registered at runtime behind the launch gate; on a fresh install each is first copied out of the binary. Embedded under `assets/fonts/`, `expo-font` reports all fifteen families as loaded at startup, so the existing `useFonts` call is `true` on its first render and loads nothing (`FontLoaderModule.queryCustomNativeFonts`, `Font.isLoaded`, `FontHooks.useRuntimeFonts`). No JS changed, so the same code on an older binary behaves as it does today.

`expo prebuild --platform android` output: 15 files in `android/app/src/main/assets/fonts`, named exactly as the `useFonts` keys.

### 2.3 R8 and resource shrinking (finding 7) — **not measured**

`expo prebuild` output: `android.enableMinifyInReleaseBuilds=true` and `android.enableShrinkResourcesInReleaseBuilds=true` in `gradle.properties` (the two names the Expo template's `app/build.gradle` reads), and keep rules for the app package and the two local Expo modules appended to `app/proguard-rules.pro`. The size and start-up effect can only be read from a real release build.

## 3. How the corpus is delivered

- `mobile/scripts/build-valmiki-assets.mjs` writes `mobile/assets/valmiki-ramayan/k<N>_p<MM>.txt` (JSON arrays of verses in reading order), `src/data/valmiki-ramayan/parts.ts` (asset handles and verse ranges) and `sargaStarts.ts`. `--check` fails if any of them is stale.
- The `chapter-0N.json` masters stay in place: provenance, the corpus tests and `scripts/build-valmiki-ramayan.py` still use them. No app module may import one, except `corpusSource.inbundle.ts` — the delivery for runtimes that predate the parts (§5).
- `loadValmikiRamayanChapter(n)` reads a kāṇḍa through `expo-asset` (`partReader.ts`), validates each verse as its part arrives with the same invariants as before, applies the same meaning fallback, and caches the kāṇḍa for the life of the process. A failed load is forgotten, so a retry is a real retry.
- `ValmikiRamayanReaderScreen` is a loader around the unchanged reader. The reader mounts only with its kāṇḍa in memory, so its opening verse and the resume position it writes are initialised from real data. A kāṇḍa already loaded in this process opens on the first frame.
- Following a `kāṇḍa.sarga` reference from Gita Saar reads the generated table; it no longer loads a kāṇḍa to find a verse.

## 4. Verification

| Check | Result | Evidence |
|---|---|---|
| Typecheck, lint, full mobile suite | See the PR for the tested head | `npm run typecheck`, `lint`, `test:readers:1..3`, `test:widgets`, `test:engine`, `test:data`, `test:ask` |
| Corpus is out of the bundle and in the asset set | PASS | Android and iOS `expo export --dump-assetmap` exit 0; byte search of both bundles |
| Parts equal the masters, in order | PASS | `valmikiAssets.test.ts` (generator `--check`, verse-id order per kāṇḍa, resource-name collisions, sarga table) |
| No app module imports a master | PASS | Same test; adding an import to `index.ts` or to a screen fails it |
| Reader: loading, failure, retry, bad chapter, already-loaded, resume position, in-place re-target | PASS (unit) | `ValmikiRamayanReaderScreen.test.tsx`, reading the real parts from disk |
| Launch path unchanged | PASS | `launchGraph.test.ts` — `parts.ts` and `partReader.ts` are forbidden on it |
| Generated Android project | PASS (inspection) | `expo prebuild --platform android`: fonts, Gradle properties, keep rules |
| **Reading a kāṇḍa from embedded assets on a real Android build** | **PENDING** | Needs a release build. `expo-asset` resolves a raw resource by name and copies it to the cache; that is the same path runtime fonts use today, but it has not been run for these files |
| **The same on iOS, and from an OTA update** | **PENDING** | Needs a build and a published update on a test channel |
| An OTA from this tree to an older store build | PASS (export, unit) / **PENDING** (device) | §5: real exports for runtime 1.5.6 on both platforms carry the corpus in the bundle and no part files; `ValmikiCorpusDelivery.test.ts`, `valmikiBundleDelivery.jest.test.ts` (every kāṇḍa, byte for byte against the asset delivery), `ota-push.test.mjs`. Not published to a real 1.5.6 build |
| **Embedded fonts render identically; launch gate is skipped** | **PENDING** | Needs a release build: every script, Standard and Large |
| **R8 / resource shrinking: the app starts and every native path works** | **PENDING** | Needs a release build: alarms (schedule, ring, snooze, reboot), widgets, notifications tap, share, read-aloud, audio, location, Meta events |
| Lower-configuration device profile | **PENDING** | Build checklist U10.1 |

## 5. Older store builds: the delivery follows the runtime

OTAs are published from the latest branch to whichever store runtime is live (`ota-push.yml` → `runtime_version`). A build that predates this work does not embed the corpus parts. Sent an update that expects them, it would have to download all 73 (27.3 MB) before the update applied, and would then read them through `expo-asset` in a way no shipped build has ever run. That was first recorded here as a release-order rule nobody could enforce. It is now mechanical.

**The delivery is chosen when the app is bundled, from the app version it is bundled for** (`mobile/corpusDelivery.js`, applied in `mobile/metro.config.js`). That version is the runtime: `runtimeVersion` is `appVersion`, a store build is bundled with its own version, and the OTA workflow rewrites `expo.version` to the target runtime before `eas update`. So a store build and every OTA published to it always get the same answer.

| Bundled for | Corpus | `./corpusSource` resolves to |
|---|---|---|
| 1.5.6 and older (builds exist without the parts) | In the JS bundle, from the masters, as before this work | `corpusSource.inbundle.ts` |
| 1.5.7 and newer (`VALMIKI_ASSETS_SINCE_VERSION`) | The 73 asset parts | `corpusSource.ts` |

Everything else — the loader, the validation, the meaning fallback, the cache, the reader's loading and retry states — is shared code in `index.ts` and the screen, so the reader behaves the same either way.

**Built, both ways** (`npx expo export --dump-assetmap`, this branch; the second row with `app.json`'s version rewritten exactly as the workflow does it):

| Export | Hermes bundle | Gzipped | Assets in the update | Corpus parts | Verse ids outside the daily selection found in the bundle |
|---|---|---|---|---|---|
| Android, runtime 1.5.6 | 51,738,109 bytes | 16.30 MB | 318 | 0 | 4 of 4 |
| Android, runtime 1.5.7 | 26,633,601 bytes | 9.31 MB | 391 | 73 (27,301,933 bytes) | 0 of 4 |
| iOS, runtime 1.5.6 | 51,716,661 bytes | 16.30 MB | 318 | 0 | 4 of 4 |

`main` before this work exported 51,709,334 bytes and 318 assets for Android. An update to an older build therefore has the shape it has always had: nothing new to download, and no new native path.

What else in the low-end work an older build depends on: nothing. The fonts are embedded natively and the `useFonts` map is unchanged, so an older binary still loads them at runtime. R8 and resource shrinking are build settings. The OTA half (#678) and the review fixes are plain JavaScript over APIs those builds already ship; the only native-backed import added anywhere is `expo-asset`, and only the asset source uses it.

Rules that follow:

- **Never lower `VALMIKI_ASSETS_SINCE_VERSION` past a version that has shipped.** Raise it if the first build to embed the parts turns out to be a later one.
- A version that cannot be read gets the in-bundle delivery, because it works on every binary.
- `push.sh` prints the delivery before publishing. `VALMIKI_CORPUS_DELIVERY=assets|bundle` forces one for a single run — for example to try the asset delivery against an older build on the preview channel; a mistyped value stops the publish.
- The saving in §2.1 starts with the first store build at or above the threshold, and that build must pass the checks in §4 before it is released. Until then nobody runs the asset path.

## 6. Deliberately not done

- **Pincode tables (4.2 MB) and the Gītā (6.3 MB) stay in the bundle.** Both are read through synchronous accessors used across location, Kundali, search, Daily Bhakti and the readers. Moving them is a wider change than the corpus above and should be its own piece of work; the pincode tables are the better candidate.
- **Fonts are not embedded on iOS.** An embedded iOS font is addressed by its PostScript name, not its file name, so it would not satisfy the same `useFonts` map.
- **R8 is on by default in this PR, not behind a flag.** To back it out, remove `./plugins/withAndroidReleaseShrink.js` from `app.json`.

## 7. Post-merge review (11 November 2026)

Both halves were merged to `main` (`d4a5a8b`) with the pending checks in §4 still pending. An independent review of the merged diff then found the following in this half. Each fix has a test that fails on `d4a5a8b`.

| Finding | Effect on a store build | Status |
|---|---|---|
| Resource shrinking was on, but the three Japam alarm sounds are raw resources found only by `getIdentifier(<mantra id>, "raw", …)` (`JapamAlarmReceiver.kt`); Expo's `keep.xml` lists Metro assets, not these. | The shrinker would empty or drop them: the alarm rings silent, or falls back to the system tone. No crash, so a launch test would not show it. | **Fixed.** The plugin writes `res/raw/vedansh_release_keep.xml` (`tools:keep="@raw/*"`). A guard test fails when app-owned native code looks up any resource type by name that has no keep entry. Still **PENDING** on a real build: an alarm ringing with its own sound. |
| Auto-slide's 3 s hand-off is claimed by the reader, which now mounts only after the kāṇḍa has loaded. | Hands-free reading stopped at a kāṇḍa boundary whenever the next kāṇḍa took longer than the window to load (preload missed, or play started on the last pages of a large kāṇḍa on a slow phone). | **Fixed.** A hand-off that is live when the screen opens is renewed when the text is ready; a lapsed one is not revived and a failed load drops it. |
| The fifteen fonts are in the Android binary twice: embedded under `assets/fonts`, and still bundled as Metro assets because the `useFonts` map is unchanged. | 5,555,316 bytes carried twice before compression. The effect on download and install size has not been measured. | **Not changed — a decision.** The unchanged map is what lets the same JS run on a binary without embedded fonts. Dropping the Metro copies on Android (a platform-split font map) removes the duplicate, and from then on an OTA of that tree to an older Android binary would render in fallback fonts. Take it together with the release-order rule in §5, after an APK has been measured. |

Not changed: `_useValmikiChapter.validChapter` repeats the range check in the data module (a duplicate, not a defect).

