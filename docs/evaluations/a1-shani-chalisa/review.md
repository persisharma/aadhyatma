# A1 — Shani Chalisa

## Scope and decision

Base: `199e05b3` (merged A2). Only A1, `shani-chalisa`, 1.5.7 content metadata; no app version bump, new screen/deity/art/audio, merge, build or OTA. A3 remains separate.

On 2026-11-16 Prashant requested A1's own implementation/PR and instructed that its blockers be resolved as in the other cases. That authorizes a documented editorial selection and use of current repository rules plus the merged A2 pattern instead of the missing `competitor-analysis/2026-10-19/claude-code-plan.md` §4a. It does not establish source consensus. The current `docs/engineering/vedansh-build-checklist.md` was available and read.

The chosen complete edition is **Drik Panchang's main Shani Chalisa**: two opening dohas, forty chaupais, one closing doha (43 units). The plan's former `/other/` link is a different composition, opening `श्री शनिश्चर देवजी`; it must not be mixed with this `जयति जयति शनिदेव दयाला` composition. The closing's `विमल` reading is corroborated by a complete HinduApp edition and INDIF's complete Roman reading; HinduNidhi uses `भक्त`. SanskritDocuments contains encoding corruption around Vimal and adds a Lalita closing, neither imported here. No manuscript independence, definitive historical author identity, or unanimous reading is claimed.

All words/punctuation of the chosen Drik edition are retained; only visual line wrapping changes. The all-43-unit comparison is [source-comparison.md](source-comparison.md). The full source-text digest is `882ba37b12d70349b60dbaafa3d87b60e95ab22b3560619e6c86909e96ffd4e7`, pinned by the content regression test. Unusual spellings such as `चाँजी`, `दिग्ज`, `नशि बलि` and `कृष्णों` are documented rather than silently repaired. Meanings are original editorial prose, presenting the hymn's narrative and devotional associations rather than confirmed historical causes or personal predictions. Textual criticism/provenance remains internal, not in the reader/share UI.

## Sources actually read

| Source | Access on 2026-11-16 | Role |
|---|---|---|
| [Drik main](https://www.drikpanchang.com/lyrics/chalisa/lord-shani/shani-dev-chalisa.html?lang=hi) | Full web-tool reading; direct HTTP 403 | Complete chosen base |
| [HinduNidhi](https://hindunidhi.com/shanidev-chalisa-hindi/) | Direct HTTP 200 and full reading | All 43 units compared; different closing |
| [HinduApp](https://www.hinduapp.in/library/chalisa/shani-chalisa) | Direct HTTP 200 and full reading | All 43 units compared; Vimal corroboration, several transcription errors not imported |
| [SanskritDocuments](https://sanskritdocuments.org/doc_z_otherlang_hindi/shani40.html) | Full web-tool reading; direct HTTP 403 | Prior blocker rechecked; corrupt closing and extra doha excluded |
| [Drik other composition](https://www.drikpanchang.com/lyrics/chalisa/lord-shani/other/shani-dev-chalisa.html?lang=hi) | Full web-tool reading; direct HTTP 403 | Identity mismatch, excluded |
| [INDIF Roman edition](https://www.indif.com/nri/chalisas/shanichalisa/shanichalisa_eng.asp) | Full web-tool reading | Additional Vimal corroboration, not transcription base |

Pavitra Granth returned HTTP 403 and was not counted as read. Multiple domains do not establish independent textual lineage. The source disagreement is resolved through one documented complete-edition choice under the user's instruction, not a majority mashup.

## Integration

Append-only Chalisa ID/verse unions, registry, library category entry, search ID, entry routes, discovery metadata and existing Shani background mapping. Verse counts regenerated with the existing script. No existing stable ID or positional Aarti entry changed. The existing deity-based opening illustration resolver supplies Shani artwork; no asset publication is introduced.

New tests pin the complete source digest and counts, existing deity mapping, unique stable verse IDs, meanings/romanization parity, all 43 search results, unique-body query, canonical saved IDs, direct/resume/bookmark navigation and actual reader dispatch. The real reader is mounted at opening/body/closing in all four languages, distinct from Hanuman. Maestro extends the existing category flow to open A1, toggle language, reach the closing, and go Back. These authored native steps are not execution evidence.

## Acceptance matrix

Applicable: U1–U12 and C1/C3/C4/C7/C8/C9. C2/C5/C6/C10 N/A: no illustrated stories, calendar calculations, reminders or release changes.

| Check | Result / evidence |
|---|---|
| U1–U2 scope, source, acceptance | PASS: latest main, plan, current rules, complete-edition selection and unit comparison; parent checked no open overlapping PR |
| C1 complete text | PASS: 43-unit digest, source comparison, unique IDs, original meanings and clean ASCII pronunciation text |
| U7 content integration | PASS automated: real registry, search, counts, routes, existing Shani art; native/CDN-cache experience PENDING |
| U8 sibling consistency | PASS: existing A2/Surya/Shani Aarti/Ashtakam patterns inspected; no shared reader redesign |
| U3–U6/U9/C3/C4/C7/C8/C9 native behaviour | PENDING: iOS/Android installed app, all four languages × Standard/Large, compact/system text, artwork/cache offline, saved/resume/cold start, native exports/audio/lifecycle/accessibility |
| U10 startup/compatibility | PASS automated launch graph; new corpus stays behind existing lazy-reader/search boundary. Lower-end Android responsiveness and ANR/device telemetry PENDING; no ANR-free claim |
| U11 integration | PASS: fetched main again before commit; still `199e05b3`, no rebase required; final gate summary below |
| U12 preservation | Local checkpoint committed; connector publication used because shell git push has no credentials. Remote head/PR recorded in final handover. |

No Maestro, adb/emulator or iOS simulator is available in this Linux environment. No native build was requested or started. Keep PR draft until required native checks pass.

## Built-component visual

`mobile/visual/shani-chalisa/` imports the actual production `ChalisaReaderScreen`, registry/payload, theme, typography, language toggle, VersePage and artwork resolver. Native storage/audio/sharing/navigation/lifecycle services are explicit web adapters. This is not a fictional mockup and not native acceptance. Reproduce with the README. Local Chromium capture failed at startup with `socket() failed: Operation not permitted`, including the escalated attempt; visual delivery is tracked separately from the successful bundle build.

## Automated verification

Focused typecheck, content/count/search/routes/source-ID tests and 25 real-reader tests passed. Full `npm test` encounters the host's blocked tsx IPC socket; its unchanged constituent scripts are run with `node --import tsx` substituted for that launcher, retaining all tests. Lint passed: zero errors, 480 warnings (including duplicated preview-adapter warnings). Final full-group results and remote commit are recorded below when complete.

Baseline distinction: reader shard 1 fails six `YouTubeReadyPlayback.test.tsx` expectations (iframe readiness/stop calls). The same six failures reproduce when running that suite on unchanged base `199e05b3` in the A3 worktree. No video/playback code changed in A1; the full test gate is still reported FAIL, not silently green.

### Final local checks

- TypeScript PASS; focused real-reader tests 25/25 PASS; launch graph, source integrity, Unicode, routes and count/search integration pass in data gate.
- Widgets 51/51 PASS; engine 842/842 PASS; data 242/242 PASS; Ask 49/49 PASS.
- Reader shard 1: 1449 PASS, 6 FAIL (YouTubeReadyPlayback, all six reproduced on unchanged `199e05b3`). Reader shard 2: 1559 PASS. Reader shard 3: 1397 PASS. The suite is not claimed green.
- Lint PASS: 0 errors / 480 warnings. `git diff --check` and agent-instruction entry-point verification PASS.
- Fetched main before checkpoint: unchanged `199e05b3`.
- Built actual-component web adapter successfully. Local Chromium fails to start due to EPERM; cloud browser cannot reach this workspace's localhost and prohibits file URLs. Therefore rendered screenshot and all native acceptance remain PENDING; the reproducible harness is preserved in the PR. No fictional visual substituted.
- No release, merge, OTA, app version bump or A3 implementation performed.

A scoped PR-only GitHub Actions workflow now captures the actual web-adapted reader on a Linux runner (24 language/size/page cells), with pinned Playwright and uploaded artifacts. This does not build or release a native binary. Its run/artifact is PENDING until observed; local capture failure is not bypassed or mislabeled as native success.
