---
title: Scripture storage
type: subsystem
sources: [mobile/src/storage, mobile/scripts/build-library.mts, mobile/metro.config.js, mobile/src/screens/GitaReaderScreen.tsx, mobile/src/screens/ValmikiRamayanReaderScreen.tsx, mobile/src/screens/SearchScreen.tsx]
last_verified_date: 2026-09-26
confidence: high
status: current
---

## Summary

Android and iOS scripture payloads use a bundled, immutable SQLite database through
`expo-sqlite` (SDK 54). JSON/Markdown remain the reviewed authoring sources. Small
catalog manifests and the Daily Bhakti Ramayan selection remain lightweight projections.
Web and source-based component tests use the generated JSON adapter.

## Build and startup

1. `npm run build:library` (Node >=22.13) compiles all 114 JSON documents with a
   `verses` array into `documents` and `verses`, retaining every field, ID, and position.
   It also builds the search entries and a contentless FTS5 trigram index. No competitor
   content is included. Mahabharata and Upanishads are not added by this migration.
2. `assets/library/library.db` is generated and gitignored. `npm start`, `npm run ios`,
   `npm run android`, `npm test`, and EAS post-install generate it. For direct `npx expo`
   commands, generate first. `npm run verify:library` detects stale output.
3. Metro resolves `content.native.ts` instead of the authoring adapter, so the 114 source
   payloads do not ship as JavaScript modules alongside the database. It registers `.db`
   as an asset. `LibraryBootstrap.native.tsx` opens the DB before evaluating App's graph.
4. Startup copies the bundled asset to a temporary file, then renames it to a filename
   containing the content hash. It validates the schema/version and runs `quick_check`
   on a new copy, then enables `query_only`. Failed imports can be retried; a bad local
   copy is closed and restored once. Older *owned* content copies are removed after success.
5. Bookmarks, reading progress, routines, and preferences retain their existing AsyncStorage
   keys and IDs. The content database has no user tables. Runtime version is 1.4.9; the
   initial SQLite dependency requires a new native binary, not an OTA to 1.4.8.

## Reading and search

- Short-text registries use a synchronous compatibility adapter against SQLite. Their
  API and existing invariant checks are preserved; they are not all asynchronous readers.
- Gita and Valmiki Ramayan use chapter metadata plus an async window of at most 72 verses
  (24-row pages, with neighboring rows). FlatList keeps lightweight placeholders outside
  the window. Loading/error/retry states handle pending pages. A request from an old chapter
  cannot overwrite the new chapter. Speech can fetch one indexed row when prefetch is pending.
- Daily Bhakti's Gita lookup also fetches one verse, not a whole chapter.
- Native Search runs async SQL over a prebuilt index, including all 23,289 Ramayan verses.
  Three-character trigrams narrow candidates; `json_each`/`instr` preserves existing
  exact/prefix/substring ranking and stable ordering. One- and two-character queries scan
  asynchronously. Return at most 50 verse hits, with an extra row to detect truncation.
  User queries are parameterized, debounced, and stale results ignored.

## Size and limitations

The current generated DB is 111,759,360 bytes including full-corpus search; ZIP DEFLATE
level 6 produces 26,596,597 bytes. These are content measurements, not App Store download
sizes. The installed app can retain the packaged asset plus the imported database copy.
Full-corpus search adds storage compared with a reader-only database. Small registries
still hydrate eagerly; the large readers and search avoid loading whole books into JS.

## Verification

`test:library` compares all 25,395 migrated verses and document metadata with source and
checks SQLite search ranking against the JS reference across Unicode, short, punctuation,
and injection-shaped queries. Dedicated Jest tests cover native import/retry/recovery,
warm reuse, bounded paging, and stale responses. The existing reader, transition, speech,
widget, engine, data, and Ask suites remain required. `sqlite-library.yaml` covers native
first import, late-corpus navigation, bookmark/progress restart persistence, sharing, and
full-corpus search, Gita language/read-aloud controls, and short-text bookmarks. The iOS 26.4
Release flow passed on 2026-09-26, as did a separate forced-version-mismatch recovery check.
The follow-up native audit passed all 114 documents / 25,395 verses in Hindi, English,
Gujarati and Kannada (101,580 native component renders). The ordinary Release chapter-edge
flow passed all 18 Gita chapters and 7 Ramayan kandas. Host verification passed 2,697 tests.
This is exhaustive native data/component coverage, not a separate UI navigation or visual
inspection of each verse. Details and per-feature evidence: `docs/testing/sqlite-exhaustive-2026-09-26.md`;
initial migration/recovery checks: `docs/testing/sqlite-migration-2026-09-26.md`.
Android 16/API 36 independently passed the same full native audit, all 76 feature
flows (73 Release and three Debug upgrade fixtures), and all Gita/Ramayan chapter
edges. The normal Release APK and restored production-entry APK passed the SQLite
journey. Verse/Panchang launcher widgets were pinned and tapped to matching content.
Stronger Namkaran, Muhurat Phase 2 and Ask briefing navigation assertions passed on
both platforms. Android report: `docs/testing/sqlite-android-2026-09-26.md`.
These are emulator results; physical-device, audible-quality and background-delivery
certification remain separate. See [[e2e-verification]] for simulator setup.

## Dependencies

- [[readers]]
- [[overview]]
- [[e2e-verification]]
