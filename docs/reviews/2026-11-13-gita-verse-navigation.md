# Proposal 06 — direct Gita verse navigation

Base: `34dc11ba09673dc255f51c79b8e1eb8d7009669a` (main at checkout).
Branch: `codex/gita-verse-navigation`.
Approved reference: Library `libfile_a93dede356e881918c545b798a4fc614`, 4 November 2026, inspected visually before implementation.

## Implemented

Counter → localized chapter/verse dialog → explicit Open → exact bundled verse.
Manifest-only selection; actual chapter loaded and verse number resolved on Open.
Replace in the same stack, including same-chapter jumps. No skipped-page traversal.
Cancel/backdrop/system Back/accessibility escape discard draft. Pause coverage while
choosing and stop both playback controls. Existing swipes, bookmark/share actions,
first-page illustration and Back destination remain. Delayed chapter transitions
are cancelled on reader unmount. Invalid input disables Open; failed chapter load
keeps the draft for retry. Latin, Devanagari, Gujarati and Kannada numeral input.

The original proposal and PR #561 were reviewed; existing citation navigation is
separate. Current open PR search found no overlapping verse-navigation work.
Sibling chapter readers retain their counters because the approved scope is Gita.
No corpus, routine schema, dependency, release configuration or artwork changes.

## Verification checkpoint

- PASS: TypeScript after integration-test harness corrections.
- PASS: 28 tests in picker, reader integration and existing Gita auto-advance suites.
- Integration uses actual chapter data, React Navigation StackRouter, AsyncStorage,
  ReadingProgressProvider and coverage store; only native playback is a boundary spy.
- PASS: component assertions for hi/en/gu/kn × Standard/Large, script font selection,
  enabled system scaling, target sizes, input bounds, every chapter count, retry.
- Full npm suite and focused ESLint: running at this checkpoint; final result below.
- Native smoke: `mobile/.maestro/gita-verse-jump.yaml` authored, execution PENDING.
- Actual-component browser harness: `mobile/visual/gita-jump` builds successfully.
  It adapts native APIs rather than reimplementing the picker. Browser connection
  to both local preview servers was refused, so no rendered visual pass is claimed.
- iOS/Android simulator, emulator, Maestro and physical device unavailable here.

## Acceptance matrix

U1/U2 PASS: current source, prototype and scope inspected.
U3 PENDING: native reference comparison (hierarchy, grid, keyboard, full controls).
U4 PENDING: automated four-language/two-size checks pass; native glyphs, compact
and enlarged system text and assistive focus not verified.
U5/U6 PENDING: integrated route/storage/coverage/cancel/retry tests pass; native
entry paths, restart, backgrounding and playback checks remain.
U7 N/A: no content/artwork/publication change; real bundled chapter data reused.
U8 PASS: Gita-only scope; adjacent readers and citation route reviewed.
U9 PENDING: full gate pending at checkpoint, native flow not executed.
U10 PENDING: one manifest (18 chapters), one bounded grid (at most 78 verses),
one chosen lazy payload; no animations added. Device frame-time/ANR and iOS hang
evidence unavailable. No claim of device performance or native safety from tests.
U11 PASS for local docs/integration; final remote/CI status pending.
U12 PENDING until remote checkpoint is verified; retain all local files.
C1/C7/C8/C9 apply; native evidence pending. C2–C6/C10 N/A: no story, art, sharing,
calendar, reminder, widget, onboarding or release changes (existing share preserved).

## Remaining native checks

Run gita-verse-jump.yaml on isolated iOS and Android installations, then inspect
all four scripts at Standard/Large, compact screens and enlarged system text.
Exercise all reader doors (chapters/search/saved/resume/citation/routine), invalid
input, last verse of chapter 18, long chapter selector, keyboard, screen-reader
focus/escape, Back and restart. Start speech/auto-slide before opening; verify they
stop and do not resume themselves. Check selected/deselected grid contrast and
first-verse artwork only at verse 1. Confirm persistence/coverage and routine state.
Keep any PR draft while these required checks remain. Do not merge or deploy.

## Final verification and publication record

The full-gate run at implementation checkpoint `fdb3de77dc21c85ad3c0a6a000f127a5af3694da`
executed every package-script test list, using `node --import tsx --test` instead
of the tsx CLI (its IPC socket fails with EPERM here). No package/test-list changes.
- Reader shards: 401/402 suites passed; 4,265 tests passed, 1 failed.
- Widgets: 49 PASS; engine: 842 PASS; Ask: 49 PASS.
- Data: 241 PASS, 1 FAIL.
- FAIL, inherited: SuvicharScreen expects `राम लला · अयोध्या`, actual `श्री राम लला`.
- FAIL, inherited: contentCorrectness requires source provenance in
  `suvicharPortraitManifest.json`. Both failures reproduced on an independent,
  unchanged export of base `34dc11ba` with the same dependency tree.

Subsequent changes bring the selected grid item into view and strengthen bookmark
and stale-pager regression checks; no unrelated runtime changed. Final focused
coverage totals 31 tests (four suites); TypeScript, changed-file ESLint and
`git diff --check` pass. Actual-component preview build and Maestro YAML parsing
pass, but neither is executed native evidence. The browser could not connect to
the preview servers; direct local-file navigation was also rejected by its URL
policy. No screenshot or visual pass is claimed. Required native U3/U4/U5/U6/U9/U10
acceptance remains PENDING. No ANR/performance claim, merge, deploy or release.

Initial git push failed for missing HTTPS credentials. The first connector tree
publication was rejected because its catalog changed after preparation, with no
remote branch or PR created. The user then explicitly requested “Raise PR”; a
fresh publication attempt is authorized. Final branch/PR status is reported in
the session and PR rather than assuming success here.
