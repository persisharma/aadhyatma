# Proposal 09 — Daan removal confirmation

Date: 2026-11-13
PR: https://github.com/persisharma/aadhyatma/pull/683
Branch: codex/daan-delete-confirmation
Base: 34dc11ba09673dc255f51c79b8e1eb8d7009669a
Tested implementation head: 57e01e8167c56d844dd28f0f49bbd7caa5826287
Verified remote/local implementation tree: dee20e075bc5c17e172fbff5067403e6bbd1b733
Reference: Library libfile_8ff3038ad2708191ae44704220393c06, SHA256 943c9b9aaa6baa14be1367a4585d458d4c9ec71ffc0d300dd0380fe1a2321838.

## Behavior and routes

DaanLedgerScreen is shared by Home, More and Panchang stacks; DaanPunya opens the same register. The only ledger removeEntry caller now requires confirmation. Ordinary identity uses category, original ISO date and optional complete note; amount is omitted. Gupt identity uses only localized Gupt daan and date, not tithi/category/note/amount/occasion. Cancel, backdrop, Android modal Back, accessibility escape and route blur discard the pending ID without storage writes. Confirm consumes a ref synchronously and rejects stale callbacks, deleting one stable ID once. Pending selection is not persisted.

Existing entry creation, sorting/month groups, timestamps, tithi and CSV implementation are unchanged. Successful mocked storage deletion survives provider remount; a failed write is demonstrably optimistic and can reappear after restart. No Undo or durable-deletion claim is added. Backup PR #411 remains separate. Wishlist's confirmation and other removeEntry callers were inspected; unrelated stores were not changed.

## Design review

The reference was downloaded from Library and visually inspected. Implementation uses the existing Saved Verses parchment/modal/saffron idiom, title → record → optional note → explanation → Remove → Cancel. The original ISO date matches the existing register rather than the concept's formatted date. Note/explanation use reading typography tokens, script fonts and a bounded scroll area; buttons remain outside it. Text remains complete and system scaling is enabled. Larger 44dp row-remove targets and 48dp dialog targets improve reachability.

No installed native screenshot or native visual pass is claimed. No adb, Maestro or iOS simulator is available here. The requested separate software-engineering skill was not present in the available cloud/environment/repository skill catalogs; current repository AGENTS, CLAUDE, RULEBOOK, design, wiki and build policy were followed instead.

## Executed validation

- PASS: regression suite initially failed 10/10 on original immediate-delete behavior; fixed suite now passes 21/21 screen + real-provider integration cases, plus 4 existing provider tests.
- PASS: cancellation/no writes, exact ID, duplicate/stale taps, route blur, successful storage remount, restart while pending, failed storage behavior, final entry/empty state, long notes, export and add navigation.
- PASS component coverage: hi/en/gu/kn × Standard/Large; Gupt identity in all four languages. This does not establish native typography, screen-reader focus or clipping.
- PASS: TypeScript; ESLint on screen and tests; git diff --check; node scripts/verify-agent-instructions.mjs.
- PASS: extended daan-punya-smoke.yaml parses with js-yaml. Execution PENDING.
- Full npm test initially stopped at tsx IPC EPERM. Same package-script test lists ran using node --import tsx --test, without assertion/time-limit changes.
- Reader suites: 400 passed / 1 failed; 4260 tests passed / 1 failed. SuvicharScreen expects “राम लला · अयोध्या” but current caption is “श्री राम लला”. Reproduced on unchanged base files (26 passed / 1 failed).
- Widgets: 49 passed. Engine: 842 passed. Ask: 49 passed.
- Data: 241 passed / 1 failed file: contentCorrectness.test.ts asserts suvicharPortraitManifest.json source provenance. Same assertion reproduced on unchanged base. Full gate is FAIL, not counted as green.
- Initial PR CI: https://github.com/persisharma/aadhyatma/actions/runs/43419057549 was in progress; policy run passed. Final CI remains PENDING.

## Acceptance status

| Check | Status / evidence |
| --- | --- |
| U1/U2 | PASS: current main, original proposal/reference, all open PR descriptions and relevant Daan work inspected; acceptance defined |
| U3 | PENDING: native comparison; code/reference hierarchy reviewed |
| U4 | PASS automated matrix / PENDING native four-language Standard/Large, compact and enlarged system text |
| U5/U6 | PASS provider/screen integration / PENDING all native entry routes, Back, interruptions and restart |
| U7 | N/A: no app artwork/content registry or publication change |
| U8 | PASS: shared register covers three stacks; Wishlist idiom reused; unrelated stores retained |
| U9 | FAIL broader inherited checks; Daan regressions PASS; native E2E PENDING |
| U10/U10.1 | PASS stable schema/IDs and bounded new work; PENDING device responsiveness/ANR/hang evidence |
| U11 | PASS docs and base integration; final CI PENDING |
| U12 | PASS implementation remotely preserved and tree verified; no cleanup |

Applicable conditional groups: C7 and C9. C4 is regression-only (CSV code unchanged; payload tested, native handoff pending). C1–C3/C5/C6/C8/C10 N/A: no devotional source, artwork, calendar calculation, reminder, playback or release change.

## Native follow-up / handover

Keep draft. On iOS/Android, follow More → Daan → register and repeat through Home and Panchang routes. Create ordinary and Gupt entries, inspect both dialogs at all language/size combinations, compact/enlarged system text and long notes. Check screen-reader focus, labels, escape, reachable actions and background accessibility. Exercise Cancel, outside tap, Android Back, repeated taps, blur, kill/restart while pending, final deletion, cold reload, unchanged CSV handoff and entry creation. Run the extended Maestro flow and capture real dialog screenshots. Check responsiveness with a large saved register and available Android ANR/iOS hang diagnostics. Resolve inherited Suvichar failures before claiming a green full gate.

No merge, native build, deployment or OTA was performed. Library reference remains durable; local dependency symlink is intentionally excluded from Git. Implementation/test/docs/flow are preserved in the PR.

