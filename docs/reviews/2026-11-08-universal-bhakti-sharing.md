# Universal Daily Bhakti verse sharing — acceptance and handover

User request: any shloka from any section can be shared using either its current card or the Daily Bhakti card.

- Branch: `codex/universal-bhakti-sharing`.
- Base: `8bbcb48c2f30c02740b9690fc1ffbbc5d1ade33f` (`origin/main` at start).
- Approved behavior: current user request; reuse existing card designs, typography, published artwork and share provider.
- Tested implementation head: `88bf48754c5a8167c58447fd0efb07d833534194` (production code is unchanged from `82492391605510374bfdd35ad260429cf44520bc`; the newer commit repairs only three existing test harnesses). The following commit updates this evidence document only.
- Remote head / PR: **PENDING**. Automatic approval review rejected `git push -u origin codex/universal-bhakti-sharing`: external publication was not explicitly requested and the destination was not verified as trusted. No alternate publication route was attempted. A subsequent read-only GitHub connector check verified repository `persisharma/aadhyatma`, id `1217856963`, public visibility, default `main`, matching HTTPS clone URL and account push/admin access. Explicit user authorization to push and open a draft PR is still required.

## Implemented behavior and scope

Tap an existing verse Share button → choose Current card or Daily Bhakti card → inspect the measured preview → choose a card language and destination or Send as text. Both directions preserve the full reader payload. Each new opening resets to that entry point's default; Daily Bhakti starts illustrated, all other verses start classic. No new stored preference, migration, permission, package, artwork or release.

Integrated surfaces: all 21 existing verse reader screens (chaptered, flat and Gita Saar), Daily Bhakti, Japa, and existing verse-shaped Daan principles / public Vidhi mantras through the shared provider. Category/search/saved/resume/routine routes reuse those readers. Prose/listing/self-drawn cards keep their existing renderers; private no-share surfaces retain their existing policy.

All reader payloads include their actual zero-based source position. This preserves artwork exceptions such as Ratri verse 2 → Shiva and Vidyarambha verse 1 → Ganesh. Gita Saar uses Krishna while retaining its theme, Saar and closing line. Sloka Japa uses its canonical source. Unknown sources use the approved neutral prayer master. No scripture is rewritten and no random-pool replacement is consulted.

Only the selected style is mounted in preview and capture. The devotional builder is deferred until requested; it prepares one verse's four language variants, never the random corpus. A new capture snapshots its payload and waits for its own measured native height, decoded slices and brand; Instagram reframing waits for the remounted artwork. Preview/stale callbacks cannot unlock capture. Failure refuses an incomplete image, releases the lock and permits retry. The classic export retains its geometry; Daily Bhakti system exports grow at 1080px width and its Instagram exports fit the complete card into 1080×1350 / 1080×1920. Captions, source attribution, hashtags, download links and rating signals remain.

## Acceptance evidence

| Check | Result | Evidence / next action |
| --- | --- | --- |
| U1 source of truth | PASS | Root AGENTS, checklist, CLAUDE/rules, share/readers wiki, RULEBOOK, design §39, PRD-05/45; current main and related open share PRs inspected. |
| U2 acceptance and routes | PASS | Behavior and affected surfaces above; no new preference or asset dependency. |
| U3 native design fidelity | PENDING | Reuses approved renderers; installed iOS/Android comparison is still required. |
| U4 languages and layout | PASS (automated) / PENDING (native) | Four-language style controls and complete four-script corpus tests. Native Standard/Large, compact width and enlarged-system-text matrix remains. Rows grow intrinsically and Cancel stays outside the scrolling body. |
| U5 complete journey | PASS (component integration) / PENDING (native) | Actual Daily Bhakti button → real provider/sheet → style switch → Cancel → same verse; provider tests cover both defaults, language retention and reopen reset. Execute authored native journeys from reader, search/saved and Bhakti. |
| U6 lifecycle/failure/cancellation | PASS (automated, scoped) / PENDING (native) | Cancel never dispatches; failed paint refuses capture; retry releases lock; stale preview cannot unlock; repeated requests do not replace an in-flight share. Native OS background/return, cold restart and cached/uncached offline remain. |
| U7 content/assets | PASS (existing integration) | Exact payload, source labels, native meaning overrides and long explanations retained. Existing published hashed masters/cache only; no manifest or source art changed. Live CDN/native paint verification remains pending. |
| U8 sibling surfaces | PASS | Provider-level options cover every existing verse caller; source positions added across 21 readers and canonical Sloka Japa source retained. Prose/self-drawn shares unchanged. |
| U9 automated/native gates | PASS (automated) / PENDING (native) | All 374 Jest suites / 3,854 tests; widgets 46, engine 830, data 223 and Ask 49 pass. Final results and harness repair details below. `npm run test:e2e:flow -- .maestro/verse-card-style-smoke.yaml` exits 127: `maestro: not found`; no Android emulator/adb or iOS xcrun is installed. YAML parses only. |
| U10 startup/performance/data | PASS (structural/automated) / PENDING (device) | Deferred single-verse builder, existing persistent cache, one preview and one sequential capture. Existing IDs/preferences untouched. Startup graph gate and production export results recorded below. Low-end Android release profiling and actual PNG memory/ANR acceptance remain required. |
| U10.1 freezes/ANRs | PENDING (device) | No new animation or background jobs. Single-verse preparation, existing bounded cache and capture/measurement path inspected. Low-end Android release profiling, frame/memory measurements and actual ANR telemetry are unavailable; no ANR-free claim. |
| U11 integration/docs | PASS (local) / PENDING (remote) | Built against current-main base. design, RULEBOOK and wiki updated in the same change. Related #650 shares the rating boundary but does not alter style/capture; #652's mantra additions retain source-art mappings. Final remote conflict/CI check waits for publication. |
| U12 preservation | PASS (local commit) / PENDING (remote) | Implementation, tests, Maestro and docs retained locally; push rejected by automatic approval review. Do not clean up this branch/worktree before approved remote preservation. |

Applicable conditional checks: C1 (preserve full reader text/source), C3 (reuse correct existing mapped artwork), C4 (share/capture), C9 (shared controls/accessibility). Their automated evidence is included above; actual native image exports and platform handoff remain pending. C2/C5/C6/C7/C8/C10 are N/A: no story, calendar, reminder, saved-data/navigation, audio or release behavior changes.

## Validation and environment repairs

- Focused final share suites: **4 suites, 52 tests PASS** (provider/style/capture, actual Daily Bhakti, share destinations, four-language controls).
- Existing Daily Bhakti builder test: every pool entry × all four languages retains its complete verse/meaning, passes.
- Typecheck: PASS. Changed production-file ESLint: zero errors/warnings. Including the existing read-aloud contract harness yields zero errors and 58 pre-existing import-order warnings; the new mock does not reorder or remove its imports. `git diff --check` and instruction policy verification: PASS.
- Initial `npm test` stopped at the existing tsx CLI's optional IPC socket (`listen EPERM /tmp/tsx-0/...pipe`). Identical Node-test script arguments are run with `node --import tsx` instead; no assertions, timeouts, coverage or test files are skipped.
- Initial full gates exposed sparse-checkout omissions (review JSON/markdown, translation provenance and browser artwork fixtures), not changed application behavior. Restored tracked fixtures. The reused dependency install also lacked the repository's committed expo-speech patch. Copied only that package into an isolated local dependency facade and applied the existing patch; other worktrees' dependencies were not changed.
- Three existing reader contract suites (`readerReadAloud`, `readerProgressBar`, `ChalisaReaderScreen`) failed before assertions while parsing the native WebView dependency. Scoped WebView/focus-hook stubs preserve the real reader and docked-player logic and all assertions. The three suites now pass all 148 cases; no product code, timeout or coverage was weakened.
- Reader shards were run independently so a first-shard failure cannot hide the later shards. Shard 1: 125 suites / 1,296 tests PASS at the implementation tree. Final shards 2 and 3: 125 / 1,396 and 124 / 1,162 PASS at `88bf487`. Their only intervening source changes are test boundary mocks within those two shards.
- Full Node gates with the same script arguments and `node --import tsx`: widgets 46/46, engine 830/830, data 223/223 (including static startup graph/budget), Ask 49/49 PASS.
- Production export: `node node_modules/expo/bin/cli export --platform ios --platform android --output-dir /tmp/vedansh-bhakti-export` PASS; both Hermes bundles generated. This is bundle verification, not an installed native build, image capture or platform handoff.
- Affected Maestro YAML parses; native execution remains blocked by the missing runner. Instruction-entry policy and whitespace checks pass. New task files are committed; the sole untracked item is the dependency symlink, which is not an app deliverable.
- `verify:observances`: PASS across the default 2024–2031 sweep, exit 0; all required gate processes completed successfully.
- Native evidence: **PENDING**, no successful native execution, PNG export or OS share handoff claimed.

## Native acceptance runbook

Execute `.maestro/share-target-smoke.yaml` and `.maestro/verse-card-style-smoke.yaml` on the tested head. Repeat in Hindi/English/Gujarati/Kannada at Standard and Large, 320dp and a regular phone, plus enlarged system text. Check complete Indic marks, wrapping style labels, full previews, scrolling target rows and always-reachable Cancel. The existing Daily Bhakti art-share/full-master/compression smokes now scroll explicitly past style controls and preview.

On iOS and Android, inspect actual classic and Daily Bhakti PNGs for short and longest real content (including a non-daily-selection Valmiki verse, a chaupai, Gita Saar's final page and native gu/kn meanings). Verify system tall-image width, Instagram dimensions and complete borders/branding/download line. Use Ratri and Vidyarambha exceptions, Gita Saar and Sloka Japa to verify subject identity. Hand off to WhatsApp/Instagram/text and return to the same reader/page. Check cached offline success, first-use offline refusal, cancellation during loading, retry, rapid actions, language/style changes and background/foreground.

Profile a mid-range/low-end Android release build while entering the sheet, switching styles and capturing a long card. Record slow/frozen frames, longest JS/UI blocks, native decode/allocation memory and tap responsiveness. Inspect any real capture failure or ANR before readiness. Unit tests and production bundles cannot establish an ANR-free app.

## Delivery state

Implemented and integrated locally. Automated validation results are recorded above. Native verification, remote checkpoint, PR/CI, merge and release are pending. No OTA, native binary build, version bump, store submission or release occurred. After authorization, push the retained branch and open a draft PR; keep it draft while required native acceptance is pending.

## Approved card-first revision

The user approved the interactive two-card preview and asked to build it. This supersedes the earlier in-sheet radio selector above. Opening any verse share now starts with two labelled, real card previews. One tap chooses the style and opens destination/language controls directly; no Continue button or intermediate confirmation. Targets show a compact selected-card thumbnail/name and Change card. Change card preserves the chosen language; each new opening restarts the card-choice step. Android Back from destinations returns to styles, then exits on the next Back. Cancel exits immediately. Prose/self-drawn cards do not gain this step.

Both thumbnails fit the complete measured card within 180dp without cropping; full exported text and capture geometry remain unchanged. The two preview tiles stack above 1.3 system font scale. Preview preparation loads only when the user opens Share, and selected style is explicitly checked again before choosing its capture spec, so preparing both thumbnails cannot accidentally export the Daily Bhakti style for a Current-card choice.

Focused verification: 4 suites / 53 tests PASS, including real Daily Bhakti entry/cancellation and a new assertion that destinations are hidden until one card tap, appear immediately afterwards and disappear again on Change card. Fresh capture/paint, source identity, language and text-share regressions remain green. Typecheck and production-file ESLint PASS. Final full-suite and Node gate results are recorded in the next evidence update. Native visuals/OS handoff/performance remain PENDING for the reasons above. The approved preview is a design reference, not native evidence. No push, PR or release is claimed; the earlier publication block remains in force pending explicit authorization.


Final card-first verification source: `5ea7bf53915106b0b9e7be9a97116b9d56cf1c84`. TypeScript, changed production ESLint, policy and YAML/whitespace checks pass. Final focused sharing matrix: 53 tests PASS; the final scroll-step remount is additionally verified by 26 component/real-entry tests. Widgets 46, engine 830, data 223 and Ask 49 all pass unchanged gate arguments. iOS/Android production exports pass at `/tmp/vedansh-card-first-export`; no native-device fidelity is implied. Metro initially could not resolve the external symlinked dependency facade; a local copy of the same installed dependency tree plus the repository's existing expo-speech patch fixes that environment issue, without changing dependencies or another worktree.

Full reader shards 1 and 2 pass 125/1,296 and 125/1,397. The initial third-shard run raced dependency replacement and was discarded. A rerun exposed one unchanged 5-second long-prose timeout while production bundling ran concurrently; no assertion or timeout was weakened. The final shard-3 run without concurrent bundling passes below. The only test-flow correction is explicitly choosing Current card before destinations in the existing verse/series regression. Native visual, actual PNG/OS handoff, Android performance and remote publication remain pending.

Final shard 3: **124 suites / 1,162 tests PASS**, exit 0, 55.4s. Combined final reader/component gates: **374 suites / 3,855 tests PASS**. All requested implementation work is committed locally; native/remote/release statuses remain as documented.

## Authorized PR publication and recovery

The user explicitly approved raising the PR. Workspace maintenance removed the shared Git metadata; all 44 feature files remained and were recovered byte for byte. A fresh feature commit is based on current main `f68fe5ba5f4ec670e470420f20f67e348fedd5b2`. A three-way tree merge retained all newer main changes without conflicts. The final diff is restricted to the same 44 sharing feature/test/documentation files; no Panchang, engagement, mantra catalogue or Japa cadence changes are part of this PR. The earlier commit identifiers/test results above are historical validation before recovery; CI on the recovered main-based head and native acceptance remain pending. The previous publication block is superseded by explicit user authorization; the first recovered push was rejected for apparent scope, so this head is narrowed and verified against current main.
