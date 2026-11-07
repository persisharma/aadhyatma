# Review → social follow prompts and owner resets

Base: `dd8b1f9` (main). Branch: `codex/review-social-prompts`.

## Acceptance and scope

- Keep existing rating entry/actions, first-use OR thresholds, dismissal cadence and low-star feedback/store access.
- A successful store URL dispatch advances to social following on the next completed share/save/practice action. It does not prove a submitted review. Both failed store routes retain rating eligibility.
- Same provider/action bridge and 1200ms settle delay. Preserve hydration, shared launch selection/ownership, brand, Explore, share-interaction, foreground and cancellation guards.
- Independent Instagram and Facebook links/explicit confirmations, retry and scrollable four-language modal. A page opening does not prove a follow. No automatic posting/following.
- Stable independent campaign IDs re-arm social/review eligibility after bundle delivery; never clear unrelated app data or force immediate display. Initial rollout preserves old decline and low-star state. Existing store handoffs migrate to social.
- Facebook's exact page is absent from repository and was not supplied. Its implementation is covered with a synthetic test URL; production `facebookUrl` stays null/hidden until verified.

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
| U7 Content/assets | N/A publication | No artwork/content/CDN addition. Existing Instagram URL reused; Facebook URL pending owner input |
| U8 Siblings | PASS | Same rating bridge covers every share/bookmark/routine/mala action; direct Instagram More row remains available |
| U9 Tests | PASS full automated / PENDING native | Commands/results below; authored social Maestro journey, no native execution |
| U10 / U10.1 Performance/ANR | PASS static / PENDING device | Only constant-size state (two pages/seven trigger counters), serial async writes, two bounded URL parses and existing settle/deadline timers. No fetch, image decode, per-frame state or new native module. Lower-end Android release frame/memory/ANR and iOS hang evidence unavailable |
| U11 Integration | PASS docs / PENDING final CI | design/RULEBOOK/wiki updated; final branch checks recorded below |
| U12 Preservation | PENDING checkpoint | Remote tree and PR verification recorded below before completion |

Applicable conditional checks: C6 (shared prompt priority), C9 (modal accessibility). C1–C5, C7–C8 and C10 are N/A: no devotional content/calendar/navigation/audio/release change.

Commands: focused Jest integration/component/gate suites; `npm test`; `tsc --noEmit`; changed-file ESLint; `verify-agent-instructions`; affected Maestro YAML parse and attempted `npm run test:e2e:flow -- .maestro/social-follow-smoke.yaml`.

The direct `npm test` attempt stopped at tsx's optional IPC listener (`listen EPERM /tmp/tsx-0/*.pipe`). A shell compatibility runner substitutes `node --import tsx` with identical test arguments, without editing repository scripts or skipping assertions. Native attempt reports `maestro: not found`; no SDK/emulator is installed. The social native flow requires a returning test fixture with an available shared opportunity; first-run setup intentionally owns the install day.

Implementation is integrated into the app provider/sheet; native verification, final CI, merge and release are separate states.


Final automated evidence for local implementation checkpoint `0526112` (later edits are documentation only):

- Affected tests: **8 suites / 149 tests PASS** (gates, campaign migration, action provider, both prompt modes, More/routine/mala callers). The hydration failure regression is included.
- Full unchanged `npm test` gates via the no-IPC shell: typecheck PASS; widgets **46**; reader shards **1,277 + 1,359 + 1,048 = 3,684** tests / **370** suites; engine **822**; data **223** (including launch import budget); Ask **49**. Exit status recorded after process completion.
- Changed-file ESLint PASS (0 output). Agent instruction entry-point verification PASS. Affected Maestro YAML files parse. Installed native execution remains PENDING (`maestro: not found`); no SDK/emulator is present.
