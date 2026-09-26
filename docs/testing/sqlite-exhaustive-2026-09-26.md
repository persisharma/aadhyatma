# SQLite exhaustive verification — 26 September 2026

This follow-up expands [the migration verification](sqlite-migration-2026-09-26.md)
from representative reader journeys to the entire authored scripture corpus and
all standalone Maestro feature flows. It tests existing content; Mahabharata and
Upanishads have not been added.

## Results

The native corpus audit passed: **114 documents, 25,395 verses and 101,580 native
renders**, covering all four languages, with **zero failures**. It ran from
02:56:17 to 03:53:38 UTC (57 minutes 22 seconds). Every document's checked count
and every language's rendered count equal its source verse count. No diagnostic
subset configuration was active.

All **76 standalone Maestro feature flows have a passing final JUnit result**:
73 on Release and three development-only upgrade-fixture flows on Debug. There
are zero missing flows and zero unresolved failures in the checked-in inventory.
This result combines the broad run with corrected reruns; it is not a claim that
the initial run passed uninterrupted. The table below records each final verdict.

The complete host test command (`npm test`) passed **2,697 tests**: widgets 33,
Jest 1,942 across 208 suites, Panchang engine 543, data/integration 125,
Ask engine 49, and SQLite parity 5. Typecheck and deterministic database
regeneration passed. The Release iOS rebuild succeeded; dependency/compiler
warnings remain in the build log.

## Defect found and repaired

The first exhaustive native pass crashed on **Gita 13.9 in Kannada**. Its long
commentary became an 8,887-character native Text block. The iOS crash log recorded
`_NSGlyphTreeInsertGlyphs` / `glyph index issue 1`. Opening the same verse through
Search in the ordinary Release app reproduced the crash, so this was not solely
a test-harness failure.

`readingParagraphs` now divides long Gita commentary paragraphs at sentence or
whitespace boundaries before native layout. It preserves all text and never
splits a word merely to enforce the preferred 1,200-character size. Authored
paragraph grouping is retained. Tests compare every Gita commentary paragraph
in all four languages before/after concatenation.

An isolated native retest of all chapter 13 verses passed **35 verses / 140
renders**. The rebuilt ordinary app passed `gita-kannada-regression`: search/open
13.9, page forward/back, switch English/Kannada, and use Large reading size.

## Exhaustive corpus audit

The separate test entry in `mobile/e2e/library-audit/` uses the real Expo SQLite
native adapter, production verse components, fonts, language provider, localization
helpers, and speech-script builder. An independently generated oracle comes from
the authoring JSON, not from the database under test.

For every source record, it checks paged and single-row database reads, source ID
and serialized-record fingerprints, localized reading text, bounded nonempty speech
chunks, and native component mounting in Hindi, English, Gujarati and Kannada.
Each update waits for native measurement and two animation-frame callbacks.
Per-document and per-language counters must match exactly; diagnostic subsets
cannot pass the full-run acceptance check. Host SQLite tests separately compare
all fields with exact deep equality and check every search-index destination.

This is exhaustive native **component/data integration** coverage. It is not a
separate Maestro navigation journey, visual inspection, or audible TTS assessment
for each of the 25,395 verses. Standard reading size is used across the corpus;
Large is additionally exercised for the Kannada crash regression.

## Production UI journeys

The Maestro inventory covers content categories and deity discovery, scripture
readers, search, saved verses and resume, read-aloud controls, sharing, languages,
reading preferences, onboarding, daily Bhakti, bhajan audio, Japam and alarms,
routines and Sankalp, Panchang/calendar/location, Ask, Muhurat, Kundali/Rashifal,
Gochar, Guna Milan, Namkaran, Prashna, Vastu, family traditions, Pitru, regional
observances, pilgrimage, Vrat, and puja Vidhi.

The additional `sqlite-chapter-boundaries` journey passed all **18 Gita chapters
and 7 Valmiki Ramayan kandas**, opening their last verses through normal Search,
checking forward/backward transitions, and checking the final book edges.

Initial failures and corrected reruns are retained in the evidence. Several flows
had stale labels or tried to tap More settings below the viewport; those checks
were reconciled against captured native accessibility trees and current source.
Feature assertions remain present rather than accepting failed runs as passes.

Some completed long-running Maestro processes then hit `DebugLogStore.finalizeRun`
/ `NoSuchFileException` while archiving their own logs and remained alive. Their
JUnit verdicts and command records were already saved; only those completed
processes were stopped before device reuse. A separate connection failure was
rerun after rebooting its dedicated simulator. These are runner incidents, not
app passes or product crashes. The initial SQLite warm-relaunch assertion also
ran before XCTest considered the app ready; system logs showed the app alive.
Adding a startup wait yielded a complete passing persistence flow.

## Environment and limits

Dedicated iPhone 17 Pro simulators run iOS 26.4. Of the 76 standalone flows, 73
use embedded Release bundles without Metro. The three `requires-dev` new-content
upgrade-fixture flows use Debug with this worktree’s Metro on port 8084. Broad feature shards use the SQLite Release built
before the commentary repair; reader/language/crash and repaired-flow reruns use
the rebuilt Release. The database SHA-256 is unchanged:
`84f06a3e21400817b2695b1279fa59b614fdb753eef6e377f10c1794ec2726ef`.

The corpus audit temporarily installs a separate test bundle on its own simulator.
Expo Updates is disabled only in that copied audit app, and its data is cleared
before installation to prevent reuse of an earlier cached test bundle. The normal
Release app retains its normal Updates configuration.

Android and physical-device execution are outside this run. Network isolation,
background notification delivery, actual external share publication, audible voice
quality, and a visual review of every page are not certified by these results.
No commit, PR, OTA, or store release was created.

## Reproduce

From `mobile/`, with the generated DB and a Release iOS app already built:

```sh
npm test
npm run typecheck
npm run verify:library
node scripts/generate-library-boundaries.mjs
maestro --device <UI_SIMULATOR_UDID> test --exclude-tags requires-dev .maestro/
# Separately install Debug and start this worktree's Metro on port 8084:
maestro --device <DEBUG_SIMULATOR_UDID> test --include-tags requires-dev .maestro/
./e2e/library-audit/run-ios.sh <SEPARATE_AUDIT_SIMULATOR_UDID> <Release-Vedansh.app>
```

Do not run Maestro on the simulator while its corpus audit is active. The audit
replaces that dedicated simulator's installed app; reinstall the normal Release
app afterwards to return it to ordinary use.

## Evidence and final flow inventory

The [saved evidence folder](/Users/prashant/.codex/visualizations/2026/09/25/01a0da06-a6a5-7340-9b04-ee2745bfd529/sqlite-migration/exhaustive) contains the full-corpus JSON, final Release
artifact hashes, host-test logs, original and rerun JUnit files, CLI logs, and
selected detailed command records. [Machine-readable coverage](/Users/prashant/.codex/visualizations/2026/09/25/01a0da06-a6a5-7340-9b04-ee2745bfd529/sqlite-migration/exhaustive/feature-coverage.json) retains all
attempts and links each final result to its durable JUnit evidence.

| Flow | Latest verdict | Seconds |
|---|---|---:|
| `aarti-smoke` | PASS | 114.0 |
| `ashtakam-smoke` | PASS | 127.0 |
| `ask-abstain-smoke` | PASS | 137.0 |
| `ask-answer-smoke` | PASS | 124.0 |
| `ask-briefing-smoke` | PASS | 140.0 |
| `background-art-smoke` | PASS | 107.0 |
| `bhajan-audio-smoke` | PASS | 85.0 |
| `chalisa-smoke` | PASS | 96.0 |
| `daan-punya-smoke` | PASS | 107.0 |
| `daily-bhakti-smoke` | PASS | 103.0 |
| `deity-browse-smoke` | PASS | 99.0 |
| `deity-expansion-smoke` | PASS | 122.0 |
| `discovery-purpose-smoke` | PASS | 112.0 |
| `feature-tour-e2e` | PASS | 167.0 |
| `ghar-vastu-compare-smoke` | PASS | 222.0 |
| `ghar-vastu-setup-smoke` | PASS | 138.0 |
| `gita-kannada-regression` | PASS | 132.0 |
| `gita-smoke` | PASS | 157.0 |
| `gochar-smoke` | PASS | 192.0 |
| `granth-smoke` | PASS | 126.0 |
| `guna-milan-smoke` | PASS | 224.0 |
| `home-today-smoke` | PASS | 146.0 |
| `home-widgets-smoke` | PASS | 171.0 |
| `japam-alarms-e2e` | PASS | 150.0 |
| `japam-smoke` | PASS | 98.0 |
| `kavacham-smoke` | PASS | 100.0 |
| `kul-parampara-smoke` | PASS | 145.0 |
| `kundali-report-smoke` | PASS | 239.0 |
| `kundali-smoke` | PASS | 286.0 |
| `language-smoke` | PASS | 148.0 |
| `more-smoke` | PASS | 172.0 |
| `muhurat-finder-smoke` | PASS | 125.0 |
| `muhurat-follow-smoke` | PASS | 130.0 |
| `muhurat-phase2-smoke` | PASS | 104.0 |
| `muhurat-phase3-smoke` | PASS | 119.0 |
| `muhurat-phase4-smoke` | PASS | 157.0 |
| `multi-profile-jyotish-smoke` | PASS | 192.0 |
| `namkaran-smoke` | PASS | 134.0 |
| `new-content-badge-deity-smoke` | PASS | 226.0 |
| `new-content-badge-home-smoke` | PASS | 201.0 |
| `new-content-badge-smoke` | PASS | 236.0 |
| `panchang-day-cache-smoke` | PASS | 213.0 |
| `panchang-location-smoke` | PASS | 142.0 |
| `panchang-smoke` | PASS | 164.0 |
| `parv-arc-smoke` | PASS | 156.0 |
| `pitru-paksha-smoke` | PASS | 254.0 |
| `pitru-smaran` | PASS | 225.0 |
| `prashna-smoke` | PASS | 258.0 |
| `rating-prompt-smoke` | PASS | 118.0 |
| `read-aloud-smoke` | PASS | 167.0 |
| `regional-lens-smoke` | PASS | 135.0 |
| `regional-parv-smoke` | PASS | 140.0 |
| `reminders-smoke` | PASS | 116.0 |
| `resume-reading-smoke` | PASS | 149.0 |
| `routine-reminder-smoke` | PASS | 187.0 |
| `routine-smoke` | PASS | 240.0 |
| `routine-weekday-smoke` | PASS | 292.0 |
| `sadhana-calendar-preview-smoke` | PASS | 166.0 |
| `sadhana-sankalp-smoke` | PASS | 165.0 |
| `sanskar-smoke` | PASS | 262.0 |
| `search-smoke` | PASS | 149.0 |
| `share-target-smoke` | PASS | 124.0 |
| `shubh-yoga-smoke` | PASS | 98.0 |
| `single-chapter-open-smoke` | PASS | 164.0 |
| `sqlite-chapter-boundaries` | PASS | 600.0 |
| `sqlite-library` | PASS | 225.0 |
| `stotram-smoke` | PASS | 134.0 |
| `stuti-smoke` | PASS | 118.0 |
| `suktam-smoke` | PASS | 118.0 |
| `theerth-enrichment-smoke` | PASS | 168.0 |
| `theerth-smoke` | PASS | 125.0 |
| `vastu-disha-smoke` | PASS | 145.0 |
| `vidhi-smoke` | PASS | 223.0 |
| `vrat-catalog-smoke` | PASS | 149.0 |
| `vrat-follow-smoke` | PASS | 143.0 |
| `wishlist-smoke` | PASS | 160.0 |

## Android follow-up

[Android verification](sqlite-android-2026-09-26.md) passed all 76 feature flows
and the same 114-document / 25,395-verse / four-language native audit. The Android
work strengthened Namkaran, Muhurat Phase 2 and Ask briefing navigation assertions;
all three stronger complete journeys also passed again on iOS.
