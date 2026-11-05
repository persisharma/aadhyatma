# Selected devotional dohas — integration review

Base: 38d70305a46f32648440f9d3b132acc2d48aedb5 (main, checked 5 November 2026).
Branch: codex/bhakti-dohe-kabir-rahim.

## Intended behavior

Home → Sacred Books/Granth → Kabir Devotional Dohas or Rahim Devotional Dohas. Two selections, four complete couplets each. Shared StutiReader is the internal flat-reader route; public classification is Granth and no deity tags are invented. Search, saved bookmarks, resume, routine completion and Daily Bhakti use the same stable source IDs and exact verse positions. The original poem stays distinct from editorial meanings. Existing published neutral manuscript art/cache is reused.

## Source comparison

Each verse's source metadata names both consulted publications, date, complete chosen edition and variant readings. Kabir: remembrance in joy/sorrow, sufficient provision and hospitality, inner change beyond rosary motion, calm/compassion after letting go of ego. Rahim: ego and Hari, humility of the giver, freedom from craving, Rama as refuge. The collections explicitly declare a selection, not a complete dohavali. No new poem lines, fictional anecdotes or external source-link UI are added. The original texts are traditional public-domain couplets; meanings and ASCII romanization are editorial.

## Acceptance record

| Check | Status | Evidence / remaining work |
| --- | --- | --- |
| U1 | PASS | Current AGENTS/checklist, CLAUDE/rules, RULEBOOK/design, reader wiki and main inspected; no existing doha collection or open doha PR found. |
| U2 | PASS | Intended routes/states and success criteria above; C1/C4/C7/C8/C9 apply. |
| U3 | PENDING | Existing reader and neutral artwork reused; installed native comparison not available. |
| U4 | PENDING | Pure four-language content checks PASS; Standard/Large, compact/enlarged-system-text visual cells unexecuted on both platforms. Gujarati/Kannada are re-scripted Hindi, not native translations. |
| U5 | PENDING | Registry dispatch/pool lookup PASS; category/search/bookmark/resume route regressions added. Full native journeys and Back remain unexecuted. |
| U6 | PENDING | Existing persistence/lifecycle behavior reused; cold reload, offline/background, failed share and cancellation need native exercise. |
| U7 | PASS/PENDING | Eight complete sourced couplets integrated through lazy registry/counts/pool; existing neutral art mapping used, no new publication. Native visibility remains pending. |
| U8 | PASS | Inspected shared entry routing, search branch, generic VersePage/share payload, routine units/chapters, read coverage and pool integration. |
| U9 | PENDING | Focused pure tests: 14/14 PASS (11 doha/script/pool plus 3 generated-count checks). Full repository npm test, shared native-renderer tests and Maestro not executed here; CI pending. |
| U10 | PASS/PENDING | Doha payloads remain behind require thunks; pool additions append after old segments; earlier IDs unchanged. Native performance/accessibility unmeasured. |
| U11 | PASS/PENDING | Main checked, matching design §87/RULEBOOK §32/wiki updated; final CI/integration pending. |
| U12 | PASS | Implementation/tests/source notes/docs are preserved on draft PR #618; the branch head was read back from GitHub. No cleanup performed. |

C1: per-verse two-publication comparison/variants recorded; no independent scholarly certification claimed. C4: sharing reuses full source title/verse/meaning, but actual PNG/system/WhatsApp handoff unexecuted. C7: shared stable IDs and exact resume positions; device persistence unexecuted. C8: inherited read-aloud/auto-slide shell; native playback unexecuted. C9: no shared layout changes; native script/size/a11y acceptance remains pending. C2/C3/C5/C6/C10: N/A (no new illustration/CDN asset, calendar math, reminders/onboarding or release work).

## Executed checks

- Existing generator source compiled without changing its logic and run with Node: 54 counts generated, including both real four-verse payloads. Existing generated values remain unchanged.
- esbuild-bundled doha.jest.test.ts with standalone node-environment Jest: 11 passed. Covers full sourced couplets, unique IDs, two source hosts per verse, Unicode cluster validity, clean romanization, correct poet dispatch, last-verse pool/meaning lookup, no out-of-range result and all four language transformations.
- Official verse-count integrity test logic compiled and executed with Node: 3/3 PASS, including exact exported symbols and no eager corpus import in texts.ts.
- No Maestro, adb or xcrun available in this environment. No device/emulator flow, native screenshot, installed share export, full mobile suite or release was performed.

## Remaining gate

Run full npm test and lint in the complete repository and confirm final-head CI; execute mobile/.maestro/doha-smoke.yaml plus search/bookmark/resume on iOS and Android. Review first/middle/last pages in Hindi/English/Gujarati/Kannada × Standard/Large and compact/system text; verify re-entry, offline reading and actual shared images/handoff with poet title and complete meaning. Keep the PR draft until required evidence is recorded. No merge, native build, version bump or OTA is authorized by this task.

Remote handover: https://github.com/persisharma/aadhyatma/pull/618, branch codex/bhakti-dohe-kabir-rahim. All required task sources, source/variant records, tests and docs are committed. The existing library order and Daily Bhakti offsets are preserved. No new artwork files or other untracked task deliverables are required. Full CI is running; native platform/language/size/export gates remain unexecuted.
