# Garud Puran selected readings — integration review

Prepared 2026-10-12. The user approved the final Style 3 banners and requested integration, reconciliation with main, verification and a PR. No production release, OTA or R2 upload is part of this change.

## Delivered scope

Twelve selected readings, 28 prose pages, with newly written simple Hindi and English explanations (2,335 Hindi words and 2,193 English words). These are editorial summaries and reflections, not a complete Purana or a verse-by-verse translation. The selection is editorially useful; it is not a measured ranking of popularity or universal ritual practice.

| Reading | Subject | Pages | Artwork |
| --- | --- | ---: | --- |
| 1 | Karma and its consequences | 2 | Vishnu–Garuda dialogue |
| 2 | Giving | 2 | Giving with respect |
| 3 | Human life | 2 | Vishnu–Garuda dialogue |
| 4 | Discernment, good company and liberation | 2 | Vishnu–Garuda dialogue |
| 5 | Babhruvahana and Sudeva | 3 | King listening to Sudeva |
| 6 | Santaptaka and five pretas | 3 | Brahmin and exactly five spirits |
| 7 | King Viravahana | 3 | King seeking Vasishtha’s guidance |
| 8 | Sita and the ancestors | 3 | Pushkar episode |
| 9 | Introduction to shraddha | 2 | Remembrance still life |
| 10 | Rites after death | 2 | Remembrance still life |
| 11 | Yama and karma | 2 | Yama |
| 12 | Vaitarani | 2 | Symbolic river and cow |

## Source verification

Each reading was compared against SanskritDocuments/GRETIL Sanskrit and the independently published Gita Press Hindi abridgement hosted by BharatKosha. SanskritDocuments and GRETIL are counted as one source family, not two independent witnesses. Exact passages, Hindi page fragments, source hashes, claims checked and edition boundaries are in [selected-readings-review.json](selected-readings-review.json). The full collected corpus remains separate and is not certified by this selection review.

`verified` records this assistant's textual comparison; it does not claim a Sanskrit scholar's certification. The reader openly labels the content as an editorial explanation and exposes source links. Contemporary reflections are labelled separately from the narrative. Regional rites and differing textual details are not presented as a universal checklist. No modern source translation was copied into the reader.

Corrections preserved include Sita's Pushkar setting, Santaptaka's name, the wider-Purana/Saroddhara variant in Babhruvahana's story, and Vasishtha/Mathura/vrishotsarga in Viravahana's story. Vaitarani artwork is identified as symbolic. Original Sanskrit has deliberately not been invented to fill this prose format.

## App behavior

Sacred Books → Garud Puran → grouped reading index → illustrated bilingual prose reader. Uses existing reader chrome for bookmarks, sharing, page progress/resume, page jumping, read-aloud, cross-reading advancement and routines. All 28 pages are searchable. Data is lazy-loaded from a small manifest; unpublished/unverified chapters cannot enter the reader. Compatibility fields called `verses` and `verseIndex` represent prose pages here, never Sanskrit verse counts.

The nine approved Style 3 bundled 960×480 WebP illustrations total 1,433,814 bytes (~1.43 MB). Both Garud screens reuse the app’s shared parchment, and `ReadingArtwork` supplies the standard reader banner and divider. No CDN or network image dependency. The asset brief, generation prompts, source PNG paths and hashes are under [artwork](artwork/README.md). Images are interpretive and visually reviewed, not archaeological reconstructions. This addition uses device read-aloud, not a newly recorded audio library.

## Preview

Run `python3 scripts/preview-garud-puran.py` to regenerate [preview.html](preview.html) from canonical app JSON, then serve the repository root with `python3 -m http.server 8108 --bind 127.0.0.1`.

Open <http://127.0.0.1:8108/docs/content/garud-puran/preview.html>. The interactive content/art preview includes all 12 readings, both languages, source details and nine illustrations. It is separate from actual native screenshots in [screenshots](screenshots/).

## Earlier verification (before main reconciliation)

- TypeScript: passed.
- Focused content, reader, automatic page advance and read-aloud suites: 153 tests passed. After the final manifest-neighbor and language-font adjustments, typecheck and 25 affected reader tests passed again.
- Broad Jest run: 213 suites / 2,003 tests passed before the added dedicated suites. Widgets: 33 passed. Engine: 555 passed. Ask suite run separately: 49 passed.
- Data validation: 127 passed, one existing failure for missing source provenance in `kidsStories/krishna-janma.json`; confirmed present in the baseline. This unrelated religious provenance was not fabricated or silently waived.
- Full lint: existing `react/display-name` error in `KidsStoryReaderScreen.test.tsx` and existing warnings. Focused lint of the new integration files passed.
- Selected reference existence and source hashes: 12/12 passed. `git diff --check` passed.
- The one-line `URL` import in the existing kids-story data test fixes Node 26 test-environment compatibility only.

Native build and device-preview evidence follows below. Automated source comparison and simulator/emulator evidence do not substitute for physical-device or scholarly review.

## Native build evidence

Both native projects were freshly generated and compiled from this checkout. Android `app:assembleDebug` passed (402 tasks, arm64, JDK 17); iOS `expo run:ios` passed with zero errors and two warnings. The artifacts were installed on the dedicated Garud Puran iOS simulator (iPhone 17 Pro / iOS 26.5) and Android QA emulator, both loading this checkout's Metro on port 8107. Earlier Expo Go/copied-binary attempts were rejected as evidence.

The standard `garud-puran-smoke.yaml` follows the repository's `_launch.yaml` Metro convention (8084). For an isolated port, launch the correct native bundle first, navigate to the Garud Puran index, then run `_garud-puran-reader.yaml` with `APP_ID=com.prashantsharma.vedansh` and an absolute `SHOT_PREFIX`. iOS debug launch can pin `-RCT_jsLocation 127.0.0.1:8107`; Android needs adb reverse and its debug-server host set to the same port.

The visual pass caught and fixed the optional chapter thumbnail's image sizing. Final source typecheck and focused ESLint passed after this correction. Actual native Hindi/English screenshots, alongside the browser art gallery, are stored in `screenshots/`.

Native reader smoke passed on iOS and Android: library entry, Hindi/English index and story, swiping pages, source disclosure with both source links, persisted page-2 resume and automatic transition into reading 6. iOS also passed adding/removing a bookmark. Read-aloud integration is covered by automated reader tests; audible physical-device playback was not certified. No physical-device, store-release or OTA validation is claimed.

Local detailed logs are under ignored `tmp/garud-puran/`: `native-ios-reader.log`, `native-android-reader.log`, `native-final-preview.log`, `ios-build.log`, `android-build.log`, `final-focused-tests.log`, `post-fix-tests.log`, `final-typecheck.log` and `final-lint.log`.

## Visual correction after user review

The initial portrait design was rejected as inconsistent with the recently merged reader improvements. The revised layout and nine landscape scenes follow PR #449 / current-main storybook references; no full-main merge is implied. See [design-review/README.md](design-review/README.md) for the cause, exact design contract and fresh native evidence. The earlier screenshots under `screenshots/` record the first version and are superseded for design approval.

## Approved integration after main reconciliation — 12 October 2026

Merged current `origin/main`, preserving the lazy screen registry, cooperative search indexing, generated navigation graph, source-count optimization and all existing reader features. Garud adds two lazy routes and yields after each indexed reading. The current shared artwork and parchment components render the approved banners. Continuation pages contain no reserved artwork area. Saved progress says Reading / Page, and the shared prose export keeps the full bilingual explanation with source context.

Final checks and native evidence are recorded below after verification. Historical screenshots above remain evidence of earlier revisions; the current asset hashes are in `artwork/manifest.json` and match `design-review/style3-final/manifest.json`.
