# Proposal 08 — individual occasion text-share date

## Result and scope

Base: `34dc11ba09673dc255f51c79b8e1eb8d7009669a` (main verified remotely).
Implementation/tested source commit: `1b25f2126773912bebd20188c3dc57c7a69b4c1e`.
Local branch: `codex/occasion-share-civil-date`.

Original November 7 proposal and Library mockup `libfile_da139e1c9038819183c9ea27aaecf0e4` specify an added date/year line, without a new interaction or image redesign. The Library text extraction was inspected; no native screenshot comparison is claimed. The implementation uses the existing localized short-month formatter (`8 Nov 2026` rather than the mockup's `8 November 2026`).

The real OccasionTimingsCard share payload passes `dated` to the text formatter. The date is the exact same `occasionCardReference` already passed to its image. Preserve city, ceremony, all windows, notes, provider-added download links and picker language separation. Adjacent Holika/Holi and next-day parana retain current reference-date semantics. Undated catalog guidance gets no invented date. Cross-year individual text windows explicitly label endpoint years. Full Panchang's formatter default remains date-heading-free; image formatting and solver instants do not change.

Current main and all 13 open PRs were checked before editing; none covered this change. Related merged work #639/#647/#649 supplies the individual cards, catalog journey and compact formatting. This change uses that existing contract. Root AGENTS, shared build checklist, CLAUDE/rules, relevant RULEBOOK/design and share/Panchang/wiki/e2e guidance were consulted. The separately requested generic software-engineering skill was not present in the available cloud or environment catalogs; repository engineering instructions and the Vedansh build-guardrails skill were used.

## Evidence

- Regression before fix: OccasionTimings suite **4 failed, 10 passed**, the date missing in all four languages.
- After fix: **14/14** OccasionTimings tests and **15/15** real-provider integration tests pass. Tests exercise actual ShareProvider and OccasionTimingsCard; the native Share boundary and visual picker are mocked. This is not a device test.
- Full reader shards: **400/401 suites passed; 4,258/4,259 tests passed** (1,465 + 1,446 + 1,347 passing). One SuvicharScreen label mismatch fails on unchanged main too: expected `राम लला · अयोध्या`, actual `श्री राम लला`.
- TypeScript: **PASS** (`npm run typecheck`, as the first npm-test gate).
- Widgets **49/49**, engine **842/842**, Ask **49/49** pass.
- Data **241/242** pass. `contentCorrectness.test.ts` fails because `suvicharPortraitManifest.json` has no declared source provenance; separately reproduced on unchanged main.
- `npm test` itself stops at the tsx CLI's blocked Unix socket (`EPERM`). The exact package-script pure-test file lists were rerun with `node --import tsx --test`; reader shards use the original npm scripts. No failed gate is claimed green.
- Focused ESLint: **0 errors**, four pre-existing warnings in the original card/test (duplicate import and deferred requires).
- Instruction verifier, diff whitespace check and edited Maestro flow YAML parse: **PASS**.
- Observance verification: **PASS**, full default 2024–2031 sweep; failures=0, known divergences=0, anchor/rule-table drift=0.

## Acceptance and remaining verification

| Check | Status | Evidence / limit |
| --- | --- | --- |
| U1/U2 scope and acceptance | PASS | Pinned main, original proposal, current caller/reference semantics, PR overlap check. |
| U3/U4 design and localization | PASS automated / PENDING native | Date line is localized hi/en/gu/kn; image source/layout unchanged. Existing Large/fixed-export test passes. Native Standard/Large, compact and enlarged-system-text picker/share app not exercised. |
| U5/U6 journey and cancellation | PASS automated / PENDING native | Real card → provider → text Share payload; chooser/card language separation; Holika, parana, guidance and year boundary; mocked iOS/Android dismissal and picker Back/reopen. No storage migration or persisted state change. |
| U7 assets/content | N/A new assets | No new artwork/content registry/CDN files or downloads; notes and links retained. |
| U8 sibling surfaces | PASS | Full Panchang default stays unchanged; all individual timing-card entry points share the changed caller. |
| U9 tests | PARTIAL | Focused and most full tests pass; two unchanged-main failures above. Native E2E pending. |
| U10/U10.1 performance | PASS code inspection / PENDING native | On-demand bounded string formatting over the same windows, no new startup import, astronomy, timer or asset work. No device profiling or ANR-free claim. |
| U11 integration/docs | PASS local / PENDING remote CI | Clean pinned-base implementation; design, RULEBOOK, wiki and existing Maestro flow updated. |
| U12 preservation | PASS local / BLOCKED remote | Local source commit retained. Remote tree created and equals tested local tree `7970824005eb64a429afc4319e449ba2fc86313f`; no confirmed remote commit/branch/PR. |

C4 sharing and C5 date boundaries apply: automated payload tests pass, actual native handoff remains pending. C7/C9 cancellation/Back follow existing provider behavior, exercised automatically. C1–C3 and C6/C8/C10 introduce no new content, assets, reminders, playback or release behavior.

## Native checklist (pending)

No Maestro runner, Android adb/emulator or iOS simulator is available here. Do not mark ready for merge on the basis of this report.

1. On installed iOS and Android, open the dated Vrat catalog from Panchang, then the occasion's share picker. Run `occasion-timings-smoke.yaml` and verify Cancel/Back retains date and catalog position.
2. Send as text, inspect/copy the OS payload without messaging anyone. Verify city, ceremony date/year, every window/note and download link. Dismiss and reopen; no success prompt for a text dismissal.
3. Repeat hi/en/gu/kn, Standard/Large and compact/enlarged system text. Export language may differ from chooser language.
4. Check adjacent Holika/Holi, next-day parana on both days, a December/January window, dated guidance and undated catalog guidance. No invented dates on the latter.
5. Compare existing image output and a full Panchang text share: no image redesign and no duplicate date heading in the full share. Verify actual WhatsApp/system cancellation and return to the originating app screen.

## Publication blocker and handover

The first combined local-commit/push command was rejected by automatic approval review over potentially private source egress and unverified destination ownership. Read-only GitHub checks then verified this is the connected `persisharma` user's public repository with admin/push access. The permitted retry created the local commit, but shell push failed because Git credentials are absent.

Connected GitHub created a tree matching the local source tree. Remote commit creation was rejected by automatic approval review: it requires explicit user approval of this exact public publication. No remote branch or PR is confirmed (the branch lookup returned no match); do not bypass the denial with another tool. Ask the user to approve publishing Proposal 08's code/tests/docs to public `persisharma/aadhyatma`, branch `codex/occasion-share-civil-date`, and opening a draft PR. The initial commit-call response was not retained by the orchestration helper; its outcome is uncertain, but no branch was created and no matching indexed commit was found. Do not claim a public PR exists.

No merge, deploy, OTA, native build or release was performed. Keep this checkout and the complete patch until remote preservation is confirmed. The untracked `mobile/node_modules` is only a symlink to existing local dependencies; it is not a deliverable and must not be committed.
