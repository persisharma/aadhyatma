# Exhaustive native scripture audit

This **test-only entry** runs separately from the production app. It uses the real
Expo SQLite implementation, the production verse-page components, fonts, language
provider, localization helpers and speech-script builder. It does not change the
production entry or introduce a diagnostic route into shipped builds.

## iOS

Run after `npm run build:library` and building the Release iOS simulator app:

```sh
./e2e/library-audit/run-ios.sh <dedicated-simulator-UDID> <path-to-Release-Vedansh.app>
```

Use a dedicated simulator: this installs the audit bundle under the app's normal
identifier and clears that audit app's existing data to avoid Expo Updates reusing
a previous embedded test bundle. The supplied Release app is copied to a temporary directory before
its bundle is replaced. Expo Updates is disabled only in that temporary audit copy
so a cached or remote bundle cannot replace the test entry. Reinstall the ordinary Release app to restore normal UI.

## Android

Use JDK 17 and a generated Android project (`npx expo prebuild --platform android
--no-install`). After `npm run build:library`, build and save the normal Release
APK first. The audit build reuses Gradle's Release output path.

```sh
export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools
node e2e/library-audit/build-android.mjs /tmp/verse-audit.apk
python3 e2e/library-audit/run-android.py emulator-5564 /tmp/verse-audit.apk /tmp/android-audit
```

Use a dedicated root-capable Google APIs emulator. `run-android.py` installs the
test APK, clears its data, disables Wi-Fi/mobile data, and collects the internal
`files/library-audit.json` report. Root is used to read the Release app's private
report; the app runs under its normal UID. Do not run Maestro on this emulator
during the audit. The collector saves incremental progress and rejects missing
language counts, failures, incomplete documents and subset configurations.

`build-android.mjs` temporarily sets the test entry and disables Expo Updates in
generated native configuration, then restores both files in `finally`. Do not run
another Gradle build concurrently. Reinstall the saved normal APK afterwards.

## Coverage

The oracle is generated from **authoring JSON**, independently of the DB:

- 114 documents / 25,395 records, preserving each source ID and ordinal.
- Every 24-row page and single-row read compared against two rolling fingerprints
  and serialized length. These are test fingerprints, not cryptographic hashes;
  `npm run test:library` separately performs exact deep equality on every field.
- Every record mounted through its actual verse-page component in Hindi, English,
  Gujarati and Kannada: **101,580 native page updates**.
- Every update waits for native measurement and two animation-frame callbacks;
  empty layout, React exceptions and a 30-second timeout fail the audit.
- Every language produces nonempty reading text and valid bounded speech chunks.
- Per-document counts and failures are written to `Documents/library-audit.json`;
  `library-audit-current.json` records the current verse/language for native crashes.

This is exhaustive native **component/data integration coverage**. The separate
Maestro flows test the ordinary production navigation, gestures, search, bookmark
persistence, share sheet and read-aloud controls. This audit does not drive the
reader's FlatList for every verse, listen to TTS, certify glyph appearance or
clipping, or send a share to another app. A native mount is not a visual review.

`node scripts/generate-library-boundaries.mjs` creates the additional Maestro
flow covering every Gita and Ramayan chapter's last verse, forward/backward
chapter transitions and the final book boundary through the normal Search UI.
