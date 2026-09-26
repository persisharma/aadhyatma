# SQLite migration verification — 26 September 2026

Follow-up: [exhaustive corpus and feature verification](sqlite-exhaustive-2026-09-26.md)
adds every-verse native rendering, the full Maestro inventory, and a Kannada
commentary crash regression. The counts below record the earlier migration pass.

The existing native scripture library now uses a generated, bundled SQLite database.
Gita and Valmiki Ramayan fetch nearby verses asynchronously; native search uses a prebuilt
index covering the complete Ramayan. Existing source fields and verse positions are preserved.
Mahabharata and Upanishads are not included in this migration.

## Build

- Expo SDK 54, `expo-sqlite` 16.0.10, app/runtime version 1.4.9.
- iOS **Release** build succeeded with 0 errors and 0 warnings on the final incremental build.
- Installed in **Vedansh-SQLite-QA**, iPhone 17 Pro simulator, iOS 26.4.
- Simulator UDID: `4C3E2A57-7F16-4D65-9377-8E3B196A25DF`.
- Release app contains `assets/assets/library/library.db`; its SHA-256 matches generated output:
  `84f06a3e21400817b2695b1279fa59b614fdb753eef6e377f10c1794ec2726ef`.
- Content version: `565cff5f647042f865065e0d5c7730baacebdfa1e05ab283d1ecd1ed4c8436ef`.
- Tested the embedded application bundle; no Metro server was started for these tests.

## Automated checks

`npm test` passed:

| Group | Passed |
|---|---:|
| Widgets | 33 |
| Jest component/native adapter tests | 1,939 across 207 suites |
| Panchang engine | 543 |
| Data and integration scripts | 125 |
| Ask engine | 49 |
| SQLite content/search parity | 3 |
| **Total reported tests** | **2,692** |

Typecheck, deterministic database regeneration (`verify:library`), Maestro YAML parsing, and
`git diff --check` passed. Targeted ESLint reported no errors and eight warnings for deliberate
lazy `require` calls and Jest mock/import order. Final query changes also passed the SQLite
parity suite and typecheck.

Parity compares all **114 scripture documents / 25,395 verses** with source, including metadata,
IDs, order, meanings, and transliteration. Search comparisons cover exact/prefix/substring
ranking, Unicode normalization, short queries, stable ordering, caps, and injection-shaped input.
Native-adapter tests cover first import, warm reuse, damaged-copy recovery, retries, bounded
paging, stale responses, and single-row speech access.

## Simulator end-to-end

`mobile/.maestro/sqlite-library.yaml` passed against the Release build:

- Fresh launch and database initialization.
- Open Valmiki Ramayan → Uttara Kanda; read and swipe from 7.1.1 to 7.1.2.
- Add a bookmark; open and dismiss the share destination picker.
- Terminate and relaunch without clearing data; resume at 7.1.2 with its bookmark intact.
- Search for **7.50.1**, outside the old 28-row selection; open the correct verse and swipe to 7.50.2.
- Jump from the late verse back to the beginning.
- Open Gita chapter 1; swipe, switch Hindi/English, and jump to the beginning.
- Start read-aloud and observe the pause state; pause it and leave the reader.
- Open Hanuman Chalisa; add and remove a bookmark.

A separate device recovery check forced a version mismatch in the dedicated simulator's
content database. On relaunch, native initialization restored the exact bundled DB checksum;
Maestro then found and opened 7.50.1 successfully. User storage was not modified by the
fault injection.

## Size and scope

The generated database is **111,759,360 bytes** uncompressed and **26,596,597 bytes** in a
ZIP using DEFLATE level 6. This includes the full search index. These are content figures,
not measured App Store download sizes. Installed storage includes both the packaged asset
and the imported content copy.

Android and physical-device validation were not run. Network access was not disabled during
the simulator run; local asset inclusion, local database creation and reading, and embedded
Release execution were verified. No OTA, store upload, commit, or PR was created.

## Reproduce

From `mobile/`, using Node >=22.13:

```sh
npm ci
npm run build:library
npm test
npm run verify:library
npx expo run:ios --device <SIMULATOR_UDID> --configuration Release --no-bundler
maestro --device <SIMULATOR_UDID> test .maestro/sqlite-library.yaml
```

The generated DB is gitignored. The npm start/ios/android/pretest and EAS post-install hooks
build it; direct `npx expo` invocations require the explicit build step above.
