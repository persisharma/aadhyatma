# Approved original Suvichar reflections

Base: `9a131208590858e96ac28e18cb59d2075d9c834e`.
Branch: `codex/suvichar-daily-reflections`.

## Acceptance

The approved conversation's daily-life, deity-specific and humility messages become actual daily shareable thoughts rather than only scripture summaries. Preserve all 74 numbered Hindi messages, plus the two distinct earlier examples; three exact repeated earlier examples occur only once (76 unique messages). English is an editorial translation. Gujarati/Kannada use existing runtime Hindi re-scripting rather than claiming new native translations.

General messages work with every deity. Explicit subject arrays apply Hanuman/Salasar, Ram/Ram Darbar, Krishna/Radha-Krishna, Shiva/Mahakaal aliases and separately restrict Khatu Shyam, Sanwariya Seth, Jagannath and Tirupati messages. Daily and weekday cards use eligible originals; Browse/Another thought also retain all 621 existing referenced entries. Existing favorites, sender, frame, custom messages, share provider, measured card growth and decode gates survive. Originals show Vedansh authorship, never an invented scripture reference. Edits remove attribution. There are no new assets, CDN objects, permissions, routes, version bumps, native builds or OTA releases.

## Evidence and handover

| Check | Result | Evidence / remaining work |
| --- | --- | --- |
| U1/U2 current scope and acceptance | PASS | Current main, related open Suvichar PR search, AGENTS, CLAUDE/rules, checklist, RULEBOOK, design §82, Suvichar wiki and share PRD reviewed. Acceptance above. |
| U3/U4 visual and language sizing | PENDING | Copy uses existing script-aware card/picker and measured growth. Four-script automated lookup is covered; compact, Standard/Large, enlarged system text and native iOS/Android visual review remain unexecuted. |
| U5/U6 journey, saved state, lifecycle | PASS / PENDING | Provider-boundary tests cover selection, share handoff, edited attribution, persisted IDs/favorites and cold remount. Existing weekday/lifecycle suites retained. Native entry/Back/offline/background flow pending. |
| U7 content integration | PASS | 76 unique bilingual originals are imported by runtime picker, daily/weekday templates and legacy message detection. All 621 original sourced entries remain intact; no asset publication needed. |
| U8/U10 sibling scope and compatibility | PASS / PENDING | Explicit shrine eligibility and per-deity caches prevent shared-family leakage. All 18 catalog subjects are covered; `SV-`/`APP-` IDs survive. Installed performance/export checks remain pending. |
| U9 automated and native testing | PASS / PENDING | New regression suite against old runtime: 38 failing / 1 passing, confirming missing integration. Initial six affected suites: 102 passing. Final focused/full-suite results recorded in the PR. Maestro flow authored and YAML parsed; no native runner is available. |
| U11 docs/integration | PASS / PENDING | Design §82, RULEBOOK Suvichar contract and wiki updated. Final remote CI remains to be checked. |
| U12 preservation | PASS | Draft PR #603 preserves the implementation. Initial remote commit `208c825069b8238306717b2ce01a063ab36c28f0` and local tree `0dc9538239511490b74b745478c1d0807287ec15` match exactly. Follow-up validation fixes and final tree are recorded in the PR. No worktree cleanup. |

Applicable conditional checks: C1 (content/attribution), C4 (sharing), C7 (favorite persistence), C9 (existing growing native text). C2/C3/C5/C6/C8/C10 are N/A: no illustrated story/artwork/calendar/onboarding/playback/release changes. Existing weekday text composition is covered under U5, without changing scheduling or permissions.

Required remaining native checks: Bhakti → Suvichar → custom deity → Browse → original selection → favorite/edit/restore → Back; existing referenced favorite restoration; all four scripts at Standard/Large on compact phones; full-length preview/export, actual WhatsApp/Instagram/text handoff and offline cached-art behavior. No recipient is selected or message sent by the authored flow. Required unexecuted native checks keep the PR draft.

## Executed verification

- PASS: final focused seven Jest suites, 113 tests; the new data assertions add no fabricated references. The source-authorship contract now explicitly handles this exact original-prose file instead of demanding scripture URLs. All other sourced JSON retain the two-reference gate.
- PASS: TypeScript; agent-instruction policy; `git diff --check`; Maestro YAML parsing. Parsing is not native execution.
- PASS: widget suite 46 tests, engine suite 630 tests, Ask suite 49 tests. The `tsx` CLI cannot create its IPC socket under this sandbox (`EPERM`), so identical script arguments run through `node --import tsx` instead. No sandbox escalation or test weakening.
- PASS: original-file content correctness after fixing the discovered provenance shape. Data suite's remaining local failure is the missing pre-existing `docs/content-parity/puja-visual-guide/step-review.json` fixture, also absent/failing on an unchanged base checkout.
- BROADER GATE INCOMPLETE: reader shard 1 initially has seven failures in five unrelated suites: missing comic approval fixture; existing app-tour `1.5.5` versus binary `1.5.6` mismatch; a Panchang rollover assertion and four Wishlist/Muhurat timeouts under concurrent load. Unchanged-base five-suite comparison reproduces the missing comic fixture and version mismatch; timing-sensitive tests pass there. Shards 2/3 and the final affected failure recheck are recorded in the PR. Do not present this as a full green gate.
- PASS: reader shard 2, 110 suites / 1,166 tests; reader shard 3, 110 suites / 853 tests. Final five-suite recheck matches the base: three pass, comic fixture and tour version suites fail, 46 passing / two failing tests. The initial Panchang assertion and Wishlist/Muhurat timeouts do not reproduce on recheck.
- PASS: scoped ESLint has zero errors (five pre-existing warnings in the screen test). Original-file content correctness passes after the original-prose provenance update; TypeScript passes on the final production/test tree.
- PENDING: native iOS/Android four-script Standard/Large/compact and enlarged system text, installed performance/offline/navigation and actual WhatsApp/Instagram/text exports. This Linux session has no Maestro or native simulator/emulator runner.
