# PR #564 — Sanatan customs integration, 8 November 2026

## Intended result and entry routes

Home → Sanatan Parichay → प्रथा और मान्यता / ऐसा क्यों?. Sanatan search also
opens exact verified customs; Tulasi overview and its final page hand off to K6.
No separate Home Discover or More door. Vrat observance questions and Panchang
month cards retain local Pratha/reader routes and Back. All 208 records/305
stories, their evidence and 19 verified/189 draft states are preserved. No data
migration, new artwork, source re-verification, store release or OTA.

Base main: `62d9b6d725e58b93c42cdb239468a647c155af1c`.
Original preserved PR head: `c0095331c50d457bcc8e053e60bcc1e08770d493`.
Branch: `claude/pratha-manyata-prd`; PR: https://github.com/persisharma/aadhyatma/pull/564.
The adaptation is a merge of main plus focused changes, preserving both histories.

## Evidence and acceptance

| Check | State | Evidence or next action |
|---|---|---|
| U1/U2 scope and acceptance | PASS | Current AGENTS/checklist/RULEBOOK/design/wiki and PRD read; current Sanatan/customs source compared. |
| U3 native design | PENDING | Shared listing/prose/header/reading tokens used; inspect installed compact iOS/Android screens. |
| U4 language/size | PENDING | Renderer tests exercise hi/en/gu/kn × M/L; native compact/enlarged-system-text matrix remains required. |
| U5 routes/Back/saved | PENDING | Sanatan door/search/Tulasi, local route registration and saved-filter exclusion covered in automated tests; execute native Back journeys. Existing Sanatan storage keys/IDs remain unchanged. |
| U6 lifecycle/error/empty | PENDING | Draft/unknown IDs, empty search, sparse/adhik month boundaries covered; native lifecycle/playback paths remain required. |
| U7 content/asset integration | PASS for records | Eight canonical axis files are byte-for-byte unchanged from original PR; publication state and provenance gates remain. No new assets. Native visibility pending. |
| U8 sibling surfaces | PASS | Home/More promotion removed; Sanatan hub/reader/search, Vrat detail, Panchang, shared Katha page and sharing audited. |
| U9 automated/native tests | PASS automated / PENDING native | Regression tests reproduced missing Sanatan door/Tulasi hand-off; all configured automated gates passed. Native runtime is unavailable locally. Results below. |
| U10 performance/compatibility | PENDING | Lazy registry/routes retained, list window bounded, page counter uses settled paging, playback controls wrap. Release Android profile/logcat/vitals and iOS playback/export checks still required; no ANR-free claim. |
| U11 integration | PASS integration / PENDING CI | Main `62d9b6d7` merged with both histories preserved; GitHub confirms mergeable=true on `738fc0ed`. Native/CI jobs are running and not counted as passed. |
| U12 durability | PASS | Remote PR head `738fc0ed61ea0ad34793405237196dead78624dc` and Git tree `61fd0bff2574a3747196ec3f2e3273f5e2dffa65` read back; exact match to local code checkpoint `aa3c13f4`. All required code/content/docs are remote. This evidence-only follow-up changes no runtime source. |
| C1/C4/C7/C8/C9 | PENDING | Projection retains complete narrative and folk/regional context, no research footer, genuine reader links, stable IDs. Native prose export/share, audio/auto-slide, accessibility and Back remain separate gates. |
| C2/C3/C5/C6/C10 | N/A to changes | No new illustrated story/artwork, calendar rule, consent/reminder or release work. Existing calendar selection drives contextual cards. |

## Executed commands

- Before implementation: focused Sanatan regression tests failed exactly on the
  absent `sanatan-pratha` and `pratha-related-K6` controls.
- `npm run test:e2e:flow -- .maestro/pratha-smoke.yaml`: blocked with
  `maestro: not found`. No `adb`/`xcrun` executable was found. Native tests did not run.
- `bash -n mobile/scripts/native-sanatan-matrix.sh`: PASS.
- js-yaml parsed `pratha-smoke.yaml`, `_sanatan-language-size.yaml` and native
  Sanatan workflow: PASS. This is syntax evidence only.
- Current native CI now includes customs entry/search/Tulasi/Back/Vrat journeys
  and customs screens in the existing four-script × two-size matrix. Seasonal
  blocks count only when actually executed. Review screenshots and device logs.

## Final validation

| Automated gate | Result |
|---|---|
| Typecheck | PASS, exit 0 on final code checkpoint |
| Reader/UI Jest, all three configured shards | PASS: 379 suites / 4,233 tests; no failed or skipped tests |
| Widgets | PASS: 46/46 |
| Panchang engine | PASS: 830/830 |
| Data/content/navigation/launch graph | PASS: 223/223 |
| Ask | PASS: 49/49 |
| Focused Sanatan/customs/reader/provenance/navigation checks | PASS: 441/441 before the final two initial-route test cases; final navigation suite 4/4 after the route-attribute fix |
| YAML / shell syntax | PASS, syntax only |
| Original content preservation | PASS: `git diff --quiet c0095331 HEAD -- mobile/src/data/pratha/{masa,nitya,prakriti,pujaNiyam,sanskar,tirth,vaar,bodh}.ts`, exit 0 |
| Change whitespace | PASS: `git diff --check 62d9b6d7 HEAD` |

Commands are the installed package.json gates: `typecheck`, `test:widgets`,
`test:readers:1`, `test:readers:2`, `test:readers:3`, `test:engine`, `test:data`,
`test:ask`. `npm test` initially reached the sandbox's Unix-socket rejection in
the tsx CLI (`EPERM ... /tmp/tsx-0/*.pipe`). The same Node-test arguments were
then run with `node --import tsx --test`; all three unchanged Jest shard commands
ran with the normal local-bin PATH. No assertion, timeout or test was skipped,
weakened or removed. The final typecheck and navigation suite were rerun after
removing a duplicate JSX initial-route attribute found during integration.

GitHub read-back confirmed the remote code checkpoint and both parents (original
PR `c0095331` and main `62d9b6d7`), exact tree equality and mergeable=true. Nine
CI/native jobs were queued or running when checked; none is reported as passed.
The final evidence commit changes this review file only. Remaining local task
source is committed; the temporary dependency symlink is removed without changing
its shared target. No worktree or source content is deleted.

Required native screenshots at all four scripts × two sizes, compact/enlarged
system text, actual share/export, lifecycle/playback, Android release profiling/
logcat/vitals and iOS hang checks remain PENDING. The PR stays draft. No merge,
OTA or store release was performed.
