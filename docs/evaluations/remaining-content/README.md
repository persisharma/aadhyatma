# Remaining non-audio content — consolidated implementation

Base: main 46cac7c00435fa51914a5c76b8d76245d361acb8 (B1 #700 merged).
One PR explicitly requested by Prashant on 17 November 2026; this supersedes the old one-WP-per-PR dispatch policy. No merge, release, version bump or audio authorization.

## Scope ledger
| Item | Planned outcome / status |
|---|---|
| A6 Kubera Chalisa | Reconcile #701 research; only include a rights-supported complete edition. Unresolved; not active. |
| B2 Kali Aarti | Complete sourced composition, append positional registry after B1. Research underway. |
| C1 Aditya Hridayam | Link into existing Valmiki 6.107, no duplicated corpus or migrated IDs. |
| C2 Shri Suktam | Declared recension with phalashruti and explicit svara policy; collation underway. |
| C3 Kanakadhara | Complete sourced edition, original meanings; collation underway. |
| C4 Hanuman Bahuk | Complete 44 chhands with original meanings and long-page checks. Research underway. |
| C5 Kalabhairav Ashtakam | Shiva-form association, precise title; no new deity ID or unverified art. |
| C6 Ganesh Atharvashirsha | Link to Ganesh Stotram chapter 2; canonical progress and source remain unchanged. |
| E1 Katha discovery | Reuse existing KathaLibrary from Home and search; no duplicated stories. |
| E2 Deity-day links | Reuse weekday metadata and Home styling; no eager katha payload on launch. |
| G1 Vishnu Sahasranama | Complete existing chapter while preserving old verse IDs; collation underway. |
| G2 Saptashati core | Canonical Kavach reused, Argala/Kilak/chapter 1 separately sourced; structure under review. |
| G3 Sai | Evidence-based decision memo only, no new deity. |
| G4 Marathi | Translation/surface feasibility memo only, no new language activation. |

Audio D1–D4/H1–H4 deferred by user. F1 streak grace is engagement, outside content scope. Prior A1–A5 and B1 are merged and preserved.

## Acceptance
Complete two-source collation and provenance; original meanings and checked pronunciation; append-only aarti positions; lazy corpus/loading; all relevant catalog/search/route/discovery paths; stable saved IDs; four scripts and both sizes; actual-component visuals; native iOS/Android journeys and performance checks reported separately. Native checks remain PENDING until executed. No mockup/test is native evidence.

## Decisions from current-code inspection
C1 uses the existing 30-record Yuddha sarga 107, beginning at canonical index 4653; no standalone copy or claim that differing editions have identical numbering. C6 opens canonical Ganesh chapter 2. Both are found in Hymns and Search, while bookmarks/progress continue under the parent source. E1 reuses the already shipped Katha browser; a Home door and searchable title are the missing entry points. The generic weekday-vrat entry is an introduction, not seven complete weekday narratives, so E2 labels that link "Weekday vrat guide". Existing content is not relabelled complete.
