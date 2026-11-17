# A4 — Kali Chalisa

## Scope and acceptance

Base: `414ed58365e300c317dada0f96c0994074c09730` (current main, A3 merged). Isolated `feat/kali-chalisa` worktree. Only A4, deity `kali`, category `chalisa`, addedInVersion 1.5.7. No new artwork, audio, reader interaction, merge, release, OTA or next task. No other implementation is active in this worktree.

Read current AGENTS, build checklist, applicable RULEBOOK/design, repository instruction rules and reader/language wiki. The old checklist in `competitor-analysis/2026-10-19/claude-code-plan.md` is unavailable; under the authorized A2/A3 approach, current policy and the merged Chalisa pattern replace it. The Library plan was read in full. No open Kali PR found before edits.

Acceptance: the complete intended composition must render distinctly from other Chalisas in all four scripts; catalog/Kali deity/search/saved routes must select A4; correct existing Kali art, full text and honest counts; no public provenance UI. Actual-component visual is required as a deliverable but does not substitute for native tests.

## Complete-source collation

1. Drik Panchang: https://www.drikpanchang.com/lyrics/chalisa/kali-mata/kali-mata-chalisa.html — full traditional prayer read through web retrieval on 2026-11-16. Direct HTTP request and `?lang=hi` retrieval returned 403. Chosen edition.
2. Aaj Tak: https://www.aajtak.in/religion/chalisa/maa-kali-chalisa-2688359 — HTTP 200; complete traditional prayer read through web and direct retrieval. A secondary confirmation, not the sole authority.
3. Manifest candidate https://pavitragranth.com/chalisa/maa-kali-chalisa and alternative `/chalisa/shree-kali-chalisa` returned 403. Search snippets were not counted as a full read or used to construct text.

Both complete publications share two opening dohas, **54** body couplets in the same order, and one closing doha. The generic Drik introduction says forty, but the actual complete prayer is 57 reader units. Preserve it intact; do not import a different Mahakali composition or drop the final fourteen couplets. These are distinct publications, not evidence of independent manuscript lineages or universal consensus.

The selected composition opens जय काली जगदम्ब जय, हरनि ओघ अघ पुंज and ends शरणागत भक्त है, रहहु सदा अनुकूल. Source punctuation is retained, splitting body couplets at their danda into two lines.

| Unit | Drik retained | Aaj Tak comparison |
| --- | --- | --- |
| Body 15 | सहस्राक्षि | सहस्त्राक्षि |
| Body 23 | तिनमहँ | तिनमहं |
| Body 32,49 | दुःख | दु:ख |
| Body 37–39,42–43,46–47,53 | जहाँ/कहूँ/कहँ/माँ/हुँकारी/कतहुँ | corresponding anusvara spellings |
| Closing | straight quotes around भक्त | curly quotes and extra space |

Other units align in wording and order. Retain the complete Drik edition under the authorized chosen-edition approach; do not manufacture a majority. Obscure shared forms including हला, दाक्षाणायिनी, महातमा, अग जग, तब, भुजामल and किंकण remain unchanged. Glosses avoid invented etymologies. Meanings and ASCII pronunciation are original editorial work; modern publisher explanations are not copied. The fifty-two Peethas and eighteen arms are attributed to this hymn rather than asserted universally; battle imagery is not an instruction and benefits are devotional beliefs, not guarantees.

Full-text SHA-256: `36bc77cb73d3004083677b257d1e59c378cde39b418aa2d863554f170db6a6cc`, calculated by joining each unit's lines with spaces and units with newline. The content test pins the complete sequence.

## Integration and evidence

Existing `ChalisaReaderScreen` and `VersePage` production code are unchanged. Append-only additions to the registry, library, flat-reader route and search list, count generator and source validation. Existing `deity_kali` background and first-page illustration derive from the Kali deity tag. No new CDN publication is needed. `bestDays` is empty; no unsupported weekday prescription is introduced.

- U1/U2 PASS: source, scope, current policy, no overlap and acceptance established.
- U3/U4 PENDING native: actual-component browser render tracked separately below.
- U5/U6: listing/resume/bookmark/search and reader dispatch automated coverage; native persistence, Back, cold restart, offline and lifecycle pending.
- U7/C1/C3: full-source payload and existing semantic artwork mapping; actual-device delivery pending.
- U8 PASS scope review: A1/A2/A3 and Lakshmi patterns checked, no shared-reader behavior changed.
- U9: executed results recorded below; extended `chalisa-smoke.yaml` must run on both platforms.
- U10/U10.1: bounded 57-unit payload, no added launch-path corpus import or changed saved IDs; physical-device responsiveness/ANR and telemetry evidence pending.
- U11/U12: final rebase and remote checkpoint recorded below.
- C4/C7/C8/C9: existing sharing, saved routes, assistive playback and accessibility retained; native handoff/playback checks pending.
- C2/C5/C6/C10 N/A: no stories, calendar, reminders or release.

Native matrix: hi/en/gu/kn × Standard/Large × iOS/Android all PENDING. This Linux host has no Maestro/adb/iOS simulator. Required native checks keep the PR draft.

## Executed validation and visual

Implementation tested at local `83d5e241`; subsequent edits add only capture tooling and this evidence.

- PASS `npm run typecheck`.
- PASS focused `ChalisaReaderScreen.test.tsx`: 53 tests, including 20 A4 opening/second-opening/middle/last-body/closing cases across hi/en/gu/kn.
- PASS widgets 51; engine 842; data 242; Ask 49.
- Reader shards: 4,433 passed, 6 failed across 411 suites. All six failures are `YouTubeReadyPlayback.test.tsx`, reproduced separately on unchanged base `414ed583` (6/6 fail). No YouTube files changed by A4. Do not claim the full suite passes.
- PASS lint: zero errors, 480 existing warnings. PASS `git diff --check` and instruction-entrypoint verifier.
- `npm test` itself stops in the tsx launcher because Unix IPC socket creation is denied. All constituent suites were then executed independently with `node --import tsx --test` or the Jest CLI, preserving logs under `/workspace/scratch/60871f9ef02f/a4-*.log`. An initial overbroad copied alias test was corrected before the full data suite passed.
- PASS build of `mobile/visual/kali-chalisa/build.mjs`: actual production reader and data bundled with explicit web adapters.
- PENDING screenshots: local Chromium exits at `process_singleton_posix.cc` because `socket()` is denied; cloud browser could not reach the local preview. The reproducible capture script and A4 PR workflow are included, but were not executed successfully. No mockup is represented as an actual capture.
- PENDING Maestro/native, all languages/sizes/platforms, device artwork/cache/export/playback/lifecycle/ANR evidence.

## Publication blocker and preservation

Local branch `feat/kali-chalisa`, isolated worktree `/workspace/scratch/60871f9ef02f/vedansh-wt-a4`. Git push failed because no HTTPS credential is available. Connected GitHub publication was rejected by automatic approval review for `persisharma/aadhyatma`, saying repository/payload disclosure authorization could not be verified. The original user task and attached plan were reread and the denied blob creation was retried once; the reviewer rejected it again. No workaround or further publishing attempt was made. Branch lookup found no remote A4 branch or PR. The earlier tree-call outcome is unconfirmed (it was interrupted before returning); no commit or ref was created by this session.

Required follow-up: obtain approval accepted by the publication reviewer for the A4 code, tests, docs and capture workflow to public `persisharma/aadhyatma`, then publish a draft PR; execute the component-capture workflow and inspect its output; complete native gates before readiness. No merge, release, OTA or next task was started. Dependency symlinks are untracked tooling only; task source, tests, docs and reproducible captures are committed. A format-patch artifact preserves the complete task for continuation.
