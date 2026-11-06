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
| U5 | PENDING | Registry dispatch/pool lookup and full entryRoutes regression PASS; native category/search/bookmark/resume journeys unexecuted. Full native journeys and Back remain unexecuted. |
| U6 | PENDING | Existing persistence/lifecycle behavior reused; cold reload, offline/background, failed share and cancellation need native exercise. |
| U7 | PASS/PENDING | Eight complete sourced couplets integrated through lazy registry/counts/pool; existing neutral art mapping used, no new publication. Native visibility remains pending. |
| U8 | PASS | Inspected shared entry routing, search, VersePage/share, routine and coverage. A failing real route regression exposed missing bookmark dispatch for registry-backed flat readers; buildBookmarkTarget now reuses buildProgressTarget for Stuti/doha, Ashtakam, Suktam and Kavacham. Whole existing route regression passes after the fix. |
| U9 | PENDING | Focused pure tests: 16/16 PASS (13 doha/script/pool plus 3 generated-count checks). Full repository npm test, shared native-renderer tests and Maestro not executed here; CI pending. |
| U10 | PASS/PENDING | Doha payloads remain behind require thunks; pool additions append after old segments; earlier IDs unchanged. Native performance/accessibility unmeasured. |
| U11 | PASS/PENDING | Main checked, matching design §87/RULEBOOK §32/wiki updated; final CI/integration pending. |
| U12 | PASS | Implementation/tests/source notes/docs are preserved on draft PR #618; the branch head was read back from GitHub. No cleanup performed. |

C1: per-verse two-publication comparison/variants recorded; no independent scholarly certification claimed. C4: sharing reuses full source title/verse/meaning, but actual PNG/system/WhatsApp handoff unexecuted. C7: shared stable IDs and exact resume positions; device persistence unexecuted. C8: inherited read-aloud/auto-slide shell; native playback unexecuted. C9: no shared layout changes; native script/size/a11y acceptance remains pending. C2/C3/C5/C6/C10: N/A (no new illustration/CDN asset, calendar math, reminders/onboarding or release work).

## Executed checks

- Existing generator source compiled without changing its logic and run with Node: 54 counts generated, including both real four-verse payloads. Existing generated values remain unchanged.
- esbuild-bundled doha.jest.test.ts with standalone node-environment Jest: 13 passed. Covers full sourced couplets, unique IDs, two source hosts per verse, Unicode cluster validity, clean romanization, correct poet dispatch, last-verse pool/meaning lookup, no out-of-range result and all four language transformations.
- Official verse-count integrity test logic compiled and executed with Node: 3/3 PASS, including exact exported symbols and no eager corpus import in texts.ts.
- No Maestro, adb or xcrun available in this environment. No device/emulator flow, native screenshot, installed share export, full mobile suite or release was performed.

## Remaining gate

Run full npm test and lint in the complete repository and confirm final-head CI; execute mobile/.maestro/doha-smoke.yaml plus search/bookmark/resume on iOS and Android. Review first/middle/last pages in Hindi/English/Gujarati/Kannada × Standard/Large and compact/system text; verify re-entry, offline reading and actual shared images/handoff with poet title and complete meaning. Keep the PR draft until required evidence is recorded. No merge, native build, version bump or OTA is authorized by this task.

Remote handover: https://github.com/persisharma/aadhyatma/pull/618, branch codex/bhakti-dohe-kabir-rahim. All required task sources, source/variant records, tests and docs are committed. The existing library order and Daily Bhakti offsets are preserved. No new artwork files or other untracked task deliverables are required. Full CI is running; native platform/language/size/export gates remain unexecuted.

Follow-up validation: the full compiled `entryRoutes.test.ts` assertion suite passes, including both doha start/resume/bookmark routes and four existing flat-reader sibling bookmark targets. The new doha bookmark assertion failed before the shared dispatch fix (returned null), then passed after. CI caught an excess updatedAt property in the new progress-target fixture; it was removed without loosening the helper type.

Sharing follow-up: both collections explicitly register the existing neutral prayer master in devotionalSourceArt. Two additional focused tests exercise all eight real pooled dohas through dailyBhaktiShareable in all four languages (32 prepared cards): one complete page, exact full verse and meaning, correct poet titles, neutral art. All 13 focused doha tests and 3 count tests pass; real native image capture and handoff are still pending.


## Theme-only selection refinement — 6 November 2026

User scope: add bhaktimay or Suvichar-themed dohas only. Every one of the eight currently integrated verses has explicit `themes` and `themeReasonHi`. A pure validator permits only nonempty, unique `bhakti`/`suvichar` labels; registry-wide tests require labels and a meaningful editorial rationale for every authored verse. Unrelated author works do not qualify. Devotional longing is included; unrelated secular romance, ridicule and partisan verse is excluded. Both listing subtitles now say devotion and reflection. Original poem text, meanings, counts, IDs, saved positions and artwork remain unchanged. The 60-item conversation list is a research shortlist; this refinement does not falsely activate uncollated content.

PASS: 16 doha/content/script/pool/prepared-share/curation checks and 3 generated-count checks. PENDING: CI on this refinement and installed iOS/Android language/Standard-Large/compact/system-text/native share validation. The inherited onboarding CI failures documented above remain distinct from this task. No build, merge or release performed.


### Daily Bhakti and Suvichar eligibility — 6 November 2026

The eight verified canonical dohas participate in Daily Bhakti and Suvichar. Daily Bhakti retains the appended flat-source segments, complete verses/meanings and neutral prayer sharing artwork. Suvichar projects the same reader payloads through `data/doha/suvichar.ts`: six subject-neutral dohas suit all eighteen deity choices; the Hari doha is limited to the nine explicit Vishnu/Ram/Krishna choices, and the Ram-sharan doha to Rama/Ram Darbar. New poems require explicit artwork eligibility before exposure. No text, source or stable reader index is rewritten.

Daily/weekday Suvichar cards rotate eligible originals followed by eligible dohas. Browse and Another thought order specific originals, general originals, eligible dohas, then existing referenced meanings. The unchanged 84 originals and 621 referenced messages remain available; the full catalogue now has 713 messages. Stable `DH-<canonical-verse-id>` IDs persist in preferences and favorites. Full Hindi and pronunciation-based English romanization are projected, with Gujarati/Kannada using the existing Hindi re-scripting policy. Poet and original-doha/romanization credit appears through the existing source label and share caption; edits remove attribution. Do not label these poems as Vedansh originals or as words spoken by the depicted deity. The 60-item research shortlist remains unintegrated.

Validation: five focused Node integration tests execute the production pool, content, localization, templates and preference parsers; all pass using Node 24 TypeScript stripping with temporary module-resolution hooks. The committed test joins `npm run test:data`. Existing Suvichar Jest rotation assertions now include eligible dohas; native Maestro browsing/edit coverage is authored. Full npm/typecheck/Jest and native iOS/Android four-script, Standard/Large, compact/system-text, capture and sharing acceptance remain pending for this revision. Earlier CI evidence identifies three inherited QuietCompanion onboarding failures also present on main (run 42057469290); no claim that this revision's CI is green. No merge, build or release performed.

Documentation limitation: automatic approval review rejected uploading the complete existing wiki/log.md as a broad document transfer. That file remains unchanged; this scoped review records the work instead.
