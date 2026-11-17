# Remaining non-audio content — consolidated implementation

Base: main 46cac7c00435fa51914a5c76b8d76245d361acb8 (B1 #700 merged).
One PR explicitly requested by Prashant on 17 November 2026; this supersedes the old one-WP-per-PR dispatch policy. No merge, release, version bump or audio authorization.

## Scope ledger
| Item | Planned outcome / status |
|---|---|
| A6 Kubera Chalisa | #701 was merged externally as documentation only; exact-composition provenance remains unresolved, not active. |
| B2 Kali Aarti | Excluded pending independent full witness and exact-composition rights evidence; see source-exclusions.md. |
| C1 Aditya Hridayam | Link into existing Valmiki 6.107, no duplicated corpus or migrated IDs. |
| C2 Shri Suktam | Declared recension with phalashruti and explicit svara policy; integrated; data and reader validation recorded below. |
| C3 Kanakadhara | Complete sourced edition, original meanings; integrated; data and reader validation recorded below. |
| C4 Hanuman Bahuk | Complete 44 chhands, original meanings and checked pronunciation integrated; long-page native checks pending. |
| C5 Kalabhairav Ashtakam | Shiva-form association, precise title; no new deity ID or unverified art. |
| C6 Ganesh Atharvashirsha | Link to Ganesh Stotram chapter 2; canonical progress and source remain unchanged. |
| E1 Katha discovery | Reuse existing KathaLibrary from Home and search; no duplicated stories. |
| E2 Deity-day links | Reuse weekday metadata and Home styling; no eager katha payload on launch. |
| G1 Vishnu Sahasranama | Complete 107-verse core + protection, 158 total units with selected ancillary sections; existing positions preserved. |
| G2 Saptashati core | Full Kavach version replaces mixed legacy selection in browse, old saved refs preserved; Argala/Kilak integrated, all 104 chapter-1 units integrated. |
| G3 Sai | Evidence-based decision memo only, no new deity. |
| G4 Marathi | Translation/surface feasibility memo only, no new language activation. |

Audio D1–D4/H1–H4 deferred by user. F1 streak grace is engagement, outside content scope. Prior A1–A5 and B1 are merged and preserved.

## Acceptance
Complete two-source collation and provenance; original meanings and checked pronunciation; append-only aarti positions; lazy corpus/loading; all relevant catalog/search/route/discovery paths; stable saved IDs; four scripts and both sizes; actual-component visuals; native iOS/Android journeys and performance checks reported separately. Native checks remain PENDING until executed. No mockup/test is native evidence.

## Decisions from current-code inspection
C1 uses the existing 30-record Yuddha sarga 107, beginning at canonical index 4653; no standalone copy or claim that differing editions have identical numbering. C6 opens canonical Ganesh chapter 2. Both are found in Hymns and Search, while bookmarks/progress continue under the parent source. E1 reuses the already shipped Katha browser; a Home door and searchable title are the missing entry points. The generic weekday-vrat entry is an introduction, not seven complete weekday narratives, so E2 labels that link "Weekday vrat guide". Existing content is not relabelled complete.

## Verification and delivery
- Full data/route/content/launch suite: **247 passed, 0 failed** (`node --import tsx --test` with the `test:data` file list; the tsx launcher itself cannot create its IPC socket here).
- Production reader component suites: **94 tests / 5 suites passed**, including new first/last pages in four scripts. Related recommendation/Janma Tithi/Kundali screens: **23 tests / 3 suites passed**.
- TypeScript: passed. Targeted lint: no errors; repository-style warnings remain. `git diff --check`: passed.
- Actual-component web preview build: passed; sources in `mobile/visual/remaining-content`. Screenshot capture failed because Chromium socket creation is prohibited. The cloud browser cannot reach that local server. No screenshot or native acceptance is claimed.
- Native iOS/Android route/back, bookmark/routine restore, share/export, offline failures, accessibility, compact/large-font layout and performance: **PENDING**. Long Bahuk pages particularly require real-device review.
- Eight new payloads contain 292 units; Vishnu gains 79 units (158 total across its four sections). All use lazy corpus loaders. Original meanings are newly written; source and variant decisions are in adjacent reports.
- The PR remains draft. A6/B2 are explicit source-blocked exclusions, detailed in `source-exclusions.md`; no audio, release, merge or native dependency change.

## Conflict resolution
B1 #700 was already merged, so implementation started from its main commit. A6 #701 later added only its research document; it is incorporated without rewriting or duplicating it. Durga's old mixed selection cannot safely map all saved positions to the complete witness, so it remains loadable under its original ID, hidden from new discovery, with a new stable ID for the full text. Canonical C1/C6 links avoid duplicate scripture/progress. No aarti positional registry changes were needed.
