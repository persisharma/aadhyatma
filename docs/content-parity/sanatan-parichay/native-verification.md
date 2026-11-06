# Native implementation acceptance — PR #622

Date: 2026-11-05. Branch: `codex/sanatan-parichay-native`.
Approved Site reference: `e4a01fe0fac7b9637fa71e536d76612fa0c39c1c`.
Integrated main: `3eb009b9c3748d21de9a0b1a737c50b10f23f75a`.
Tested runtime blob set: `c9aebf9f1bb77477fe5131305300db39413a9ed1` (39 task files
matched the remote Git blob hashes). The final documentation-only head is recorded
in the PR.
Delivery: implemented/integrated, draft PR created; not native-verified, ready for
merge, merged or released.

## Automated evidence

- `node scripts/verify-agent-instructions.mjs`: PASS.
- `mobile/node_modules/.bin/tsc --noEmit` from `mobile/`: PASS after integration.
- Reader Jest shards: PASS — 114 suites/1,186 tests; 114 suites/1,243 tests;
  113 suites/865 tests. The third shard was rerun with JSON output because the
  combined command exited without a complete third-shard summary. The rerun
  reports `success: true`. Total: 341 suites/3,294 tests. Latest focused feature,
  Search, launch and store rerun: 4 suites/54 tests PASS. The new Finish regression
  was added after the full run and is included in that focused result.
- Script-equivalent `test:widgets`, `test:engine`, `test:data`, `test:ask`: PASS
  using `node --import tsx --test` with each package script's exact test arguments
  and timezone. Results: widgets 46, engine 630, data 218, Ask 49 tests.
- Direct `npm test` stopped in this environment at tsx's IPC listener (`EPERM` on
  `/tmp/tsx-0/...pipe`), before widget tests. Running the same scripts through
  Node's tsx import avoids that CLI IPC requirement. This is not an unqualified
  claim that the literal `npm test` command passed.
- The shared corpus gate initially rejected the missing authorship declaration;
  fixed with an original-editorial-prose declaration and source-graph checks.
  No new scripture is exempted from collation.
- The existing Search preparation test caught a native-Jest dynamic import error;
  fixed while retaining lazy loading and unchanged preparing/no-results states.
- Main's new BrandLaunchGate test needed a boolean-event overload annotation for
  TypeScript; its runtime assertions remain unchanged and were rerun.
- All thirteen WebP files: hash, byte count, 960×640 dimensions PASS against
  `artwork.json`; total 3,043,518 bytes. Exports are byte-identical to the approved
  Site assets. All collection IDs map to the same approved artwork family.
- All three new Maestro YAML files parsed: PASS; not executed.
- `git diff --check` on task-owned tracked edits: PASS. Existing repository
  snapshot has unrelated absent assets; only explicit task files are published.

## Shared checklist

| Check | Status | Evidence or remaining action |
|---|---|---|
| U1 scope/source | PASS | Current policies, prototype approval, research #605, current main and overlapping PRs checked. |
| U2 acceptance | PASS | `native-scope.md`; 13 introductions, 39 paragraphs, exact IDs/routes and persistence contract. |
| U3 approved design | PENDING | Approved paintings/hierarchy implemented; compare installed iOS/Android screenshots with the approved Site. |
| U4 language/size | PENDING | Four-script prose tests pass. Native Standard/Large, compact widths and enlarged system text still required. |
| U5 journeys | PENDING | Automated search, page position, invalid ID, save/restart and Finish tests pass; execute native Home/Search/Back/resume flows. |
| U6 lifecycle/failure | PENDING | Storage failure/hydration serialization tests pass; native background/foreground and playback interruption remain. |
| U7 content/assets | PASS | 13 approved intros, 25 plain source records, 13 mapped paintings; unfinished research excluded. Native visibility remains U3. |
| U8 recurring class | PASS | One Painting primitive/crop; one store; plain SourceCredits; shared reader/playback/share components. |
| U9 test/native proof | PENDING | Automated results above and in PR; native E2E and exports not executed. |
| U10 compatibility/performance | PENDING | Existing stores untouched; launch-graph budget test passes; device startup/memory/gesture QA remains. |
| U11 current branch | PENDING | Current main included, documentation synced; final-head CI and reviewer/native acceptance still required. |
| U12 durability | PASS | Draft #622 and explicit source/artwork commits; final remote blob verification recorded in PR. No worktree cleanup. |
| C1 readers | PENDING | Shared pagination/prose/progress; native long-script and fractional-width QA required. |
| C2 illustrated content | PENDING | Authored prose/scene mapping checked; installed painting proportions and text/art relationship require review. |
| C3 artwork | PENDING | Bundled approved WebP hashes/dimensions checked. No CDN publication claim; native decode/render QA remains. |
| C4 sharing | PENDING | Shared branded prose flow, page/whole-introduction scopes and credits integrated; capture real exports on both platforms. |
| C5 Panchang/Jyotish | PENDING | Introductory tithi/node explanations only; existing calculations untouched. Review diagram labels on device. |
| C6 reminders/launch/widgets | N/A | No new notification, widget, onboarding or automatic launch feature; current main's launch fixes retained. |
| C7 saved/navigation | PENDING | Serialized store and exact target tests pass; native cold restart and retained scroll/query required. |
| C8 playback | PENDING | Existing reader controller reused; actual voices, pause/resume, auto-slide, interruption and competition require devices. |
| C9 UI/accessibility | PENDING | 48pt actions, wrapping controls, SVG text equivalents, shared fonts; VoiceOver/TalkBack/native gesture checks remain. |
| C10 release | N/A | No native build, version bump, store submission, OTA, merge or release requested/performed. |

## Native matrix and next concrete checks

Every cell below is **PENDING** on both iOS and Android. Component tests establish
text selection, not actual glyph rendering, clipping, image appearance or touch.

| Reading script | Standard | Large |
|---|---|---|
| Hindi | PENDING | PENDING |
| English | PENDING | PENDING |
| Gujarati | PENDING | PENDING |
| Kannada | PENDING | PENDING |

Run `.maestro/sanatan-parichay-smoke.yaml` and
`.maestro/sanatan-parichay-language-size.yaml` against the exact branch bundle
(set `METRO_PORT`). The smoke flow covers question search, collection, save,
second-page grouping, in-app source credits, Back/query and a cold resume without
clearing state. Review all 13 paintings and every schematic, including above/below
directions and the two Dashavatara selections. Add compact/fractional Android
widths and enlarged system text. Verify empty saved/search, offline, storage
failure alerts, hardware Back/modal dismissal and first-tap/drag behaviour.

Then test live read-aloud/auto-slide, leaving the reader, opening credits, competing
audio and background/foreground. Export current-page and whole-introduction share
cards; inspect every paragraph, citation and final line in all four scripts.
Record device/OS, screenshots and actual exports before marking ready.

This Linux environment exposes no `adb`, `maestro` or iOS simulator, so none of
those device checks has been claimed. Written/parsed flows are distinct from
executed native E2E. Required pending checks keep the PR draft.
