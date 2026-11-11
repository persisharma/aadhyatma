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

What an OTA carries after this change, to a store build that embeds the parts: the 26.6 MB bundle and no corpus. `expo-updates` records embedded assets and treats an update's asset with the same key as already present (`EX_UPDATES_COPY_EMBEDDED_ASSETS` is off by default, so they are referenced in place, not copied).

### 2.2 Fonts (finding 6) — **counted**, behaviour read from source

Fifteen files, 5,555,316 bytes. Today each is registered at runtime behind the launch gate; on a fresh install each is first copied out of the binary. Embedded under `assets/fonts/`, `expo-font` reports all fifteen families as loaded at startup, so the existing `useFonts` call is `true` on its first render and loads nothing (`FontLoaderModule.queryCustomNativeFonts`, `Font.isLoaded`, `FontHooks.useRuntimeFonts`). No JS changed, so the same code on an older binary behaves as it does today.

`expo prebuild --platform android` output: 15 files in `android/app/src/main/assets/fonts`, named exactly as the `useFonts` keys.

### 2.3 R8 and resource shrinking (finding 7) — **not measured**

`expo prebuild` output: `android.enableMinifyInReleaseBuilds=true` and `android.enableShrinkResourcesInReleaseBuilds=true` in `gradle.properties` (the two names the Expo template's `app/build.gradle` reads), and keep rules for the app package and the two local Expo modules appended to `app/proguard-rules.pro`. The size and start-up effect can only be read from a real release build.

## 3. How the corpus is delivered

- `mobile/scripts/build-valmiki-assets.mjs` writes `mobile/assets/valmiki-ramayan/k<N>_p<MM>.txt` (JSON arrays of verses in reading order), `src/data/valmiki-ramayan/parts.ts` (asset handles and verse ranges) and `sarga-starts.json`. `--check` fails if any of them is stale.
- The `chapter-0N.json` masters stay in place: provenance, the corpus tests and `scripts/build-valmiki-ramayan.py` still use them. No app module may import one.
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
| **Embedded fonts render identically; launch gate is skipped** | **PENDING** | Needs a release build: every script, Standard and Large |
| **R8 / resource shrinking: the app starts and every native path works** | **PENDING** | Needs a release build: alarms (schedule, ring, snooze, reboot), widgets, notifications tap, share, read-aloud, audio, location, Meta events |
| Lower-configuration device profile | **PENDING** | Build checklist U10.1 |

## 5. Release order — read before merging

An OTA published to a runtime whose store binary does not contain the corpus parts makes that update download all of them once — 27.3 MB in 73 files — before it can apply. The files are downloaded one by one and kept, so an interrupted attempt does not start over, but it is more than the 16 MB bundle that runtime downloads today. Whether the update CDN compresses `.txt` assets in transit was not verified.

So: merge this with the store build that embeds the assets, and publish OTAs from a tree containing it only to that runtime or later. `push.sh` and the `ota-push.yml` workflow publish to whichever `runtime_version` is entered; nothing in code enforces this.

## 6. Deliberately not done

- **Pincode tables (4.2 MB) and the Gītā (6.3 MB) stay in the bundle.** Both are read through synchronous accessors used across location, Kundali, search, Daily Bhakti and the readers. Moving them is a wider change than the corpus above and should be its own piece of work; the pincode tables are the better candidate.
- **Fonts are not embedded on iOS.** An embedded iOS font is addressed by its PostScript name, not its file name, so it would not satisfy the same `useFonts` map.
- **R8 is on by default in this PR, not behind a flag.** To back it out, remove `./plugins/withAndroidReleaseShrink.js` from `app.json`.
