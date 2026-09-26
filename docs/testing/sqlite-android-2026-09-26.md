# Android SQLite verification — 26 September 2026

This continues the [iOS exhaustive verification](sqlite-exhaustive-2026-09-26.md)
against Android native code. It tests the existing content; Mahabharata and
Upanishads are not added.

## Current status

The full Android native corpus audit **passed**: 114 unique documents, 25,395
checked verses and 101,580 measured native renders, with every document complete
in hi/en/gu/kn, zero failures and no diagnostic subset configuration.

The Android feature suite passed **76/76**: 73 embedded Release flows and three
Debug upgrade fixtures. Every final verdict was independently checked against
one matching JUnit case, with no failure, error or skipped result. Earlier failed
and interrupted attempts remain in the evidence and do not count as passes.
The stronger Namkaran, Muhurat Phase 2 and Ask briefing journeys also passed on
iOS. No production app source changed during this Android follow-up.

## Environment and artifacts

Dedicated Pixel 7 emulators use Android 16 / API 36, arm64-v8a, a 1080×2400 screen
at density 420. The app is version/runtime 1.4.9, versionCode 11, with Hermes and
the new React Native architecture. Ordinary flows use the embedded Release APK
with Wi-Fi and mobile data disabled. The three `requires-dev` upgrade fixtures
use Debug compiled with `-PreactNativeDevServerPort=8084` and this worktree's Metro.
The iOS `RCT_jsLocation` argument does not set the Android development server.

The normal Release APK was saved before building the audit entry:

- APK: 104,019,187 bytes; SHA-256
  `631f4cda80d7dc4019f6d27be9fd8e4ce0d040bac9edfdc732a0d7fb15d119f6`.
- Embedded Hermes bundle SHA-256:
  `0ec4128d9ece8556521c7b6973c27a687dc4cd5090266fcfe2e58ebfa7091d66`.
- Bundled DB: `res/ny.db`, 111,759,360 bytes; SHA-256
  `84f06a3e21400817b2695b1279fa59b614fdb753eef6e377f10c1794ec2726ef`.

The DB bytes match the iOS-tested DB exactly. The APK uses the local debug signing
key for emulator verification; it is not a Play Store publication artifact.
Release and Debug native builds succeeded, with dependency/compiler warnings
retained in their logs.

After the audit, the default Gradle Release output was rebuilt with the normal
production entry. Its APK SHA-256 is
`7726ff1e1262c135a17e0844257b6054030d12ae30e49c765e9a2986524206f5`.
An archive-entry comparison found identical code, native resources, fonts, assets
and DB bytes; only the generated Expo manifest `id` and `commitTime` differ.
The saved original APK above remains the main feature-suite artifact. A further
complete `sqlite-library` run also passed against the restored APK, verifying
first import, reading/search, restart persistence, sharing and read-aloud controls.

## Test methods

The 76 standalone Maestro flows cover the same inventory as the iOS run: 73
ordinary Release flows and three Debug upgrade fixtures. The SQLite flow checks
first import, late Ramayan navigation, search, paging, bookmarks/progress across
a restart, sharing, Gita language/read-aloud controls, and short-text bookmarks.
The generated boundary flow covers all 18 Gita chapters and 7 Ramayan kandas.

`mobile/e2e/library-audit/build-android.mjs` builds a separate Release audit APK
with the real SQLite adapter, production verse components/fonts/language
provider, and a source-derived oracle. It temporarily changes only generated,
gitignored Android configuration, then restores it in `finally`. Expo Updates is
disabled in that test APK so the embedded test entry cannot be replaced.
The normal app's configuration and saved APK retain their normal Updates setting.

`run-android.py` installs that APK on a separate root-capable Google APIs emulator,
clears its app data, disables network access, and collects its internal JSON
report. Root access is used to read the Release app's report; the app itself still
runs under its normal application UID. Full acceptance requires 114 documents,
25,395 checked verses, 101,580 native renders across hi/en/gu/kn, zero failures,
and no diagnostic subset configuration.

This is exhaustive native **component/data integration** coverage, rather than
an individual Maestro navigation or visual review of every verse. Audible voice
quality, physical-device execution, and background alarm/notification delivery
and real GPS acquisition require separate evidence. The location smoke uses the deterministic city-picker path.

## Native launcher widgets

Supplemental Pixel Launcher tests pinned both supported Android providers through
real system Add to home screen confirmations. The Verse widget displayed
Sundarkand doha 43 and its source; tapping it opened that exact Daily Verse.
The Panchang widget displayed 26 September, Purnima ending 10:18 PM and sunrise
6:16 AM; tapping it opened Panchang for 26 September 2026 with the matching tithi
and end time. Saved launcher/destination accessibility trees and system widget
state establish content and tap behavior. This checks the default 4×2 Verse and
2×2 Panchang instances, not every resize/theme or midnight refresh. Android has
no native Japam provider; its in-app preview/deep-link flow was covered separately.

## Issues observed during the run

- The first SQLite attempt lost its emulator connection before app execution.
- The initial software-graphics emulator showed `System UI isn't responding` over
  the app. Its diagnostic was retained, and its feature queue was restarted with
  hardware graphics. The complete SQLite flow subsequently passed, including
  actual speak/pause assertions; the Gita Kannada regression also passed.
- Android exposes a Jyotish tile's accessibility label plus `accessibilityValue`
  as `label, value`, while the iOS flow selected the label alone. Selectors now
  accept that optional comma/value suffix, preserving their exact action prefix
  and the separate content assertions. The default-enabled Smaran switch likewise
  includes `, On` on Android; its selector accepts that explicit value.
- Today's Home chip row includes Pitru Paksha and two Purnima observances before
  Rahu Kaal. The cache flow initially treated an off-screen horizontal chip as a
  missing solve. Its Home assertion now requires the filled weekday/tithi label;
  the Panchang windows and persisted finder results remain separately required.
- Gochar retained iOS-only year-list fling counts. Android stopped around 2000,
  leaving `Year 1992` outside the viewport. Gochar, Guna Milan, and Muhurat Phase 4
  now use platform branches, preserving the same exact fixture dates and result
  assertions. Complete Android reruns passed.
- The first Sanskar attempt opened a different reader during a scroll gesture
  on the software-graphics emulator. The complete, unchanged Sanskar flow passed
  on the hardware-graphics emulator, including English reading, paging and the
  Surya Namaskar restart path. This did not reproduce as an app defect.
- Android's smaller viewport shows only the first row of the saved-chart tool
  grid. The Kundali flow now scrolls to Guna Milan and Namkaran before asserting
  them. Pilgrimage flows wait for Home's visible Panchang canary, then scroll to
  Pilgrimage, instead of waiting for the lower tile before scrolling.
- The widget flow scrolled to the instructions, then asserted add controls that
  were above Android's viewport. It now scrolls to each control before asserting
  it; native deep-link assertions remain required.
- Namkaran's flow attempted a Jyotish launcher action after opening Muhurat
  results. It now requires the actual Naming Ceremony/results destination and
  returns through the existing back controls before testing the peer browse path.
  Share-preview dismissal and footer taps wait for animations and center the
  target. The stricter flow is also cross-checked on iOS.
- Muhurat Phase 2 tapped the noninteractive Rahu Kaal tile. The flow now taps
  the real All timings & choghadiya control, then checks Karana on its destination.
  The stronger journey passed on both Android and iOS.
- Ask briefing used a title shared by the briefing and Search empty-state tile.
  It now requires actual briefing content after the first Back and the original
  Search input/door after the second. Complete Android and iOS reruns passed.
  One iOS follow-up stalled in Maestro startup before executing the flow; its
  runner was stopped and only the dedicated simulator restarted before retrying.
- Maestro completed the personalized Muhurat and Home Today flows and wrote
  passing JUnit cases, but its CLI did not exit during teardown. The completed runner was
  terminated after 25 seconds; this is recorded as `teardownTerminated: true`,
  not silently presented as a normal zero-exit invocation.
- Emulator logcat includes repeated crashes in
  `com.google.android.gms.persistent` (CrisisAlertsPersistentService). These are
  system-service failures, distinct from the Vedansh process; logs are retained.
  Google Play Services was not disabled, because app location features use it.

## Reproduce

Generate the DB before a direct Gradle build and preserve the normal APK before
building the audit, because Gradle's Release output path is reused:

```sh
cd mobile
npm run build:library
npx expo prebuild --platform android --no-install
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
(cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a)
cp android/app/build/outputs/apk/release/app-release.apk /tmp/vedansh-release.apk
adb -s <UI_EMULATOR> install -r /tmp/vedansh-release.apk
adb -s <UI_EMULATOR> shell svc wifi disable
adb -s <UI_EMULATOR> shell svc data disable
maestro --device <UI_EMULATOR> test --exclude-tags requires-dev .maestro/

# Dedicated audit emulator; do not run Maestro on it during the audit:
node e2e/library-audit/build-android.mjs /tmp/verse-audit.apk
python3 e2e/library-audit/run-android.py <AUDIT_EMULATOR> /tmp/verse-audit.apk /tmp/verse-audit-results

# Debug fixture build, with this worktree's Metro running on 8084:
(cd android && ./gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a -PreactNativeDevServerPort=8084)
adb -s <DEBUG_EMULATOR> install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s <DEBUG_EMULATOR> reverse tcp:8084 tcp:8084
# Run CI=1 npx expo start --port 8084 -c in a separate terminal beforehand.
maestro --device <DEBUG_EMULATOR> test --include-tags requires-dev .maestro/
```

Reinstall the saved normal Release APK on the audit emulator afterwards to return
it to ordinary use. Debug fixtures need local Metro connectivity rather than the
network-disabled Release setup.

## Evidence and per-feature verdicts

Durable evidence directory:
`/Users/prashant/.codex/visualizations/2026/09/25/01a0da06-a6a5-7340-9b04-ee2745bfd529/sqlite-migration/android`.

- `feature-coverage.json`: exact 76-flow inventory, latest verdicts and all attempts.
- `feature-coverage.md`: the table below, independently derived from saved JUnit.
- `flows/` and `reruns/`: JUnit, commands, console and per-attempt logcat.
- `audit/library-audit-final.json` and `audit-validation.json`: full corpus and
  independent unique-document/per-language/count validation.
- `release-artifact.json`, `restored-release-parity.json` and build logs: exact
  APK/bundle/DB identity and normal-entry restoration.
- `ios-crosscheck/`: strengthened navigation follow-ups and retained first attempts.
- `native-widgets/`: pin-flow JUnit, launcher/destination XML, provider state and
  independent matching-content/tap validations.

| Flow | Latest verdict | Build | Seconds |
|---|---|---|---:|
| `aarti-smoke` | PASS | Release | 94.64 |
| `ashtakam-smoke` | PASS | Release | 138.49 |
| `ask-abstain-smoke` | PASS | Release | 150.9 |
| `ask-answer-smoke` | PASS | Release | 164.59 |
| `ask-briefing-smoke` | PASS | Release | 112.46 |
| `background-art-smoke` | PASS | Release | 167.12 |
| `bhajan-audio-smoke` | PASS | Release | 208.75 |
| `chalisa-smoke` | PASS | Release | 108.6 |
| `daan-punya-smoke` | PASS | Release | 94.45 |
| `daily-bhakti-smoke` | PASS | Release | 139.62 |
| `deity-browse-smoke` | PASS | Release | 149.33 |
| `deity-expansion-smoke` | PASS | Release | 136.58 |
| `discovery-purpose-smoke` | PASS | Release | 114.8 |
| `feature-tour-e2e` | PASS | Release | 203.07 |
| `ghar-vastu-compare-smoke` | PASS | Release | 213.2 |
| `ghar-vastu-setup-smoke` | PASS | Release | 142.57 |
| `gita-kannada-regression` | PASS | Release | 153.47 |
| `gita-smoke` | PASS | Release | 150.51 |
| `gochar-smoke` | PASS | Release | 310.98 |
| `granth-smoke` | PASS | Release | 138.52 |
| `guna-milan-smoke` | PASS | Release | 531.71 |
| `home-today-smoke` | PASS | Release | 204.73 |
| `home-widgets-smoke` | PASS | Release | 132.57 |
| `japam-alarms-e2e` | PASS | Release | 148.57 |
| `japam-smoke` | PASS | Release | 165.27 |
| `kavacham-smoke` | PASS | Release | 98.53 |
| `kul-parampara-smoke` | PASS | Release | 146.68 |
| `kundali-report-smoke` | PASS | Release | 343.01 |
| `kundali-smoke` | PASS | Release | 373.06 |
| `language-smoke` | PASS | Release | 136.59 |
| `more-smoke` | PASS | Release | 120.42 |
| `muhurat-finder-smoke` | PASS | Release | 132.54 |
| `muhurat-follow-smoke` | PASS | Release | 200.71 |
| `muhurat-phase2-smoke` | PASS | Release | 142.85 |
| `muhurat-phase3-smoke` | PASS | Release | 217.13 |
| `muhurat-phase4-smoke` | PASS | Release | 359.54 |
| `multi-profile-jyotish-smoke` | PASS | Release | 334.2 |
| `namkaran-smoke` | PASS | Release | 164.73 |
| `new-content-badge-deity-smoke` | PASS | Debug | 246.98 |
| `new-content-badge-home-smoke` | PASS | Debug | 351.06 |
| `new-content-badge-smoke` | PASS | Debug | 440.05 |
| `panchang-day-cache-smoke` | PASS | Release | 142.46 |
| `panchang-location-smoke` | PASS | Release | 120.66 |
| `panchang-smoke` | PASS | Release | 176.74 |
| `parv-arc-smoke` | PASS | Release | 132.49 |
| `pitru-paksha-smoke` | PASS | Release | 184.83 |
| `pitru-smaran` | PASS | Release | 252.81 |
| `prashna-smoke` | PASS | Release | 387.69 |
| `rating-prompt-smoke` | PASS | Release | 94.52 |
| `read-aloud-smoke` | PASS | Release | 180.55 |
| `regional-lens-smoke` | PASS | Release | 130.5 |
| `regional-parv-smoke` | PASS | Release | 156.56 |
| `reminders-smoke` | PASS | Release | 98.84 |
| `resume-reading-smoke` | PASS | Release | 162.93 |
| `routine-reminder-smoke` | PASS | Release | 154.53 |
| `routine-smoke` | PASS | Release | 186.88 |
| `routine-weekday-smoke` | PASS | Release | 254.53 |
| `sadhana-calendar-preview-smoke` | PASS | Release | 120.66 |
| `sadhana-sankalp-smoke` | PASS | Release | 116.45 |
| `sanskar-smoke` | PASS | Release | 240.76 |
| `search-smoke` | PASS | Release | 132.99 |
| `share-target-smoke` | PASS | Release | 90.41 |
| `shubh-yoga-smoke` | PASS | Release | 106.44 |
| `single-chapter-open-smoke` | PASS | Release | 122.57 |
| `sqlite-chapter-boundaries` | PASS | Release | 710.35 |
| `sqlite-library` | PASS | Release | 172.62 |
| `stotram-smoke` | PASS | Release | 136.7 |
| `stuti-smoke` | PASS | Release | 94.47 |
| `suktam-smoke` | PASS | Release | 94.38 |
| `theerth-enrichment-smoke` | PASS | Release | 146.67 |
| `theerth-smoke` | PASS | Release | 122.05 |
| `vastu-disha-smoke` | PASS | Release | 134.91 |
| `vidhi-smoke` | PASS | Release | 162.55 |
| `vrat-catalog-smoke` | PASS | Release | 134.53 |
| `vrat-follow-smoke` | PASS | Release | 132.61 |
| `wishlist-smoke` | PASS | Release | 142.61 |
