# Review → social follow prompts and owner resets

Original base: `dd8b1f9`; integrated current main `fdb304a` (#649). Branch: `codex/review-social-prompts`.

## Acceptance and scope

- Keep existing rating entry/actions, first-use OR thresholds, dismissal cadence and low-star feedback/store access.
- A successful store URL dispatch advances to social following on the next completed share/save/practice action. It does not prove a submitted review. Both failed store routes retain rating eligibility.
- Same provider/action bridge and 1200ms settle delay. Preserve hydration, shared launch selection/ownership, brand, Explore, share-interaction, foreground and cancellation guards.
- Independent Instagram and Facebook links/explicit confirmations, retry and scrollable four-language modal. A page opening does not prove a follow. No automatic posting/following.
- Stable independent campaign IDs re-arm social/review eligibility after bundle delivery; never clear unrelated app data or force immediate display. Initial rollout preserves old decline and low-star state. Existing store handoffs migrate to social.
- The owner supplied the Facebook share URL on 8 Nov 2026. It is now configured verbatim and tested through the real follow action; OS/app/browser return remains native acceptance.

## Owner operation

Edit `mobile/src/data/engagementPrompts.ts`:

| Change | Result when the updated bundle loads |
| --- | --- |
| New `socialCampaignId` | Reset follow confirmations/count/date once; preserve review state |
| New `reviewCampaignId` | Restart rating eligibility once, including old suppression; preserve social state |
| Change both | Restart both stages |
| `socialEnabled = false` | Suppress automatic follow asks |
| Set verified `facebookUrl` | Enable the independent Facebook row; existing Instagram confirmation survives |

Do not use app versions/current time as IDs. Keep the same ID after answering, or users would reset on every release. These are bundle controls, not an instant remote dashboard. No release/OTA is performed here.

## Evidence

| Check | Status | Evidence / limitation |
| --- | --- | --- |
| U1 Current source | PASS | Current AGENTS/checklist, CLAUDE/rules, design §54, RULEBOOK §0/6.2, wiki overview/languages/E2E; open PRs inspected (no overlapping rating work) |
| U2 Acceptance | PASS | Criteria above, campaign/reset runbook and failure semantics |
| U3 Native design | PENDING | Existing parchment/fonts, brand glyphs, wrapping controls, bounded scrolling implemented; installed screenshot review needed |
| U4 Language/size | PASS component / PENDING native | hi/en/gu/kn at M/L component coverage; compact/enlarged-system native review not established |
| U5 Entry/journey | PASS provider / PENDING native | Actual bookmark provider order, completed/cancelled share paths, manual rating, store → social, independent confirmations and cold reload tested |
| U6 Failure/lifecycle | PASS automated / PENDING native | Both failed store routes, failed social link/retry, read failure suppression, background, delayed overlap and unmount cleanup; native app/browser return still needed |
| U7 Content/assets | N/A publication | No artwork/content/CDN addition. Existing Instagram URL reused; owner-supplied Facebook URL configured; native hand-off pending |
| U8 Siblings | PASS | Same rating bridge covers every share/bookmark/routine/mala action; direct Instagram More row remains available |
| U9 Tests | PASS full automated / PENDING native | Commands/results below; authored social Maestro journey, no native execution |
| U10 / U10.1 Performance/ANR | PASS static / PENDING device | Only constant-size state (two pages/seven trigger counters), serial async writes, two bounded URL parses and existing settle/deadline timers. No fetch, image decode, per-frame state or new native module. Lower-end Android release frame/memory/ANR and iOS hang evidence unavailable |
| U11 Integration | PASS merged tree / PENDING final CI | Current main #649 merged cleanly; design/RULEBOOK/wiki updated; final checks below |
| U12 Preservation | PASS checkpoint | PR #650 is draft; remote `2ff0810642f5bad2ead87d08cce06a46c6164969` exactly matches tested local tree `a2b5144427b23bda36d159a3dfd3ccf762fb6010`. Subsequent main-sync/evidence commit verified in PR metadata |

Applicable conditional checks: C6 (shared prompt priority), C9 (modal accessibility). C1–C5, C7–C8 and C10 are N/A: no devotional content/calendar/navigation/audio/release change.

Commands: focused Jest integration/component/gate suites; `npm test`; `tsc --noEmit`; changed-file ESLint; `verify-agent-instructions`; affected Maestro YAML parse and attempted `npm run test:e2e:flow -- .maestro/social-follow-smoke.yaml`.

The direct `npm test` attempt stopped at tsx's optional IPC listener (`listen EPERM /tmp/tsx-0/*.pipe`). A shell compatibility runner substitutes `node --import tsx` with identical test arguments, without editing repository scripts or skipping assertions. Native attempt reports `maestro: not found`; no SDK/emulator is installed. The social native flow requires a returning test fixture with an available shared opportunity; first-run setup intentionally owns the install day.

Implementation is integrated into the app provider/sheet; native verification, final CI, merge and release are separate states.


Final automated evidence for local implementation checkpoint `0526112` (later edits are documentation only):

- Affected tests: **8 suites / 149 tests PASS** (gates, campaign migration, action provider, both prompt modes, More/routine/mala callers). The hydration failure regression is included.
- Full unchanged `npm test` gates via the no-IPC shell: typecheck PASS; widgets **46**; reader shards **1,277 + 1,359 + 1,048 = 3,684** tests / **370** suites; engine **822**; data **223** (including launch import budget); Ask **49**. Exit 0.
- Changed-file ESLint PASS (0 output). Agent instruction entry-point verification PASS. Affected Maestro YAML files parse. Installed native execution remains PENDING (`maestro: not found`); no SDK/emulator is present.

- Full lint PASS: **0 errors**, 447 existing warnings. No code/test assertion was weakened.
- PR: https://github.com/persisharma/aadhyatma/pull/650 (draft). Current main advanced only with the compact-muhurat #649 work; merged without conflicts. Required final CI/native evidence remains distinct from local results.
- Remote preservation uses the connected GitHub app because this checkout has no CLI push credential. The first document write was auto-review rejected as an unverified disclosure; source/destination verification proved the existing RULEBOOK/design blob hashes belonged to the same repository, and the write then succeeded. Required implementation, tests, docs and flow are preserved; the local dependency symlink is excluded from commits. No worktree cleanup performed.

## 8 November follow-up — Facebook enabled

Owner target: https://www.facebook.com/share/18wwA4vHG4/?mibextid=wwXIfr

Both social rows are configured. Regression coverage checks the real Facebook link dispatch, independent confirmations, and preservation of an existing Instagram confirmation. Explicit single-page test fixtures retain missing-target coverage. The native smoke requires both rows instead of making Facebook optional. Actual store/Facebook app or browser return and the native language/size/performance matrix remain pending.

The previous complete CI for `49d70d7` passed, including all reader shards, widgets/engine/data/Ask, observance verification and both production exports. Current main `8bbcb48` (Japa controls and long-text/+500ms fixes) merged cleanly; existing mala action reporting is preserved. This update does not merge the PR or publish an OTA/store release.

Follow-up validation: all 8 focused suites / 152 tests, TypeScript, changed-file ESLint, Maestro YAML parsing and diff whitespace checks pass. Native/device acceptance remains pending.
