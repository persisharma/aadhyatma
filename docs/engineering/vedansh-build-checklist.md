# Vedansh build checklist and reusable prompt
Version 1.0 • 1 November 2026
Repository: persisharma/aadhyatma

## Purpose
Prevent the recurring problems found in the audit of PR titles #1–#581 and our build discussions. This is the shared acceptance checklist for Vedansh implementation work. AGENTS.md, CLAUDE.md and the assistant-specific entry points below route to this document.

## Use
Attach the prompt in Part D to a future task. Apply every universal check, select relevant conditional checks before implementation, and report evidence using Part C. The current repository rules and explicit task instructions remain authoritative; resolve contradictions rather than silently choosing a stale document.


## Loading this policy in another assistant

| Surface | Entry point |
| --- | --- |
| Codex and agents supporting AGENTS.md | Root AGENTS.md links here before implementation. |
| Claude Code | Root CLAUDE.md imports AGENTS.md; the unscoped .claude/rules/vedansh-build-guardrails.md also routes here. |
| GitHub Copilot supporting repository instructions | .github/copilot-instructions.md routes here. |
| ChatGPT/Codex with the personal skill installed | vedansh-build-guardrails retrieves the current repository policy for relevant Vedansh development tasks. |
| Ordinary GPT or Claude chat without repository/skill context | Attach this document or put the bootstrap below in the project's instructions. Repository files cannot change unrelated chat settings. |

After this PR is merged, use an updated checkout. Existing sessions or stale worktrees may still have older instructions. For a task on an older branch, retrieve the current policy explicitly rather than assuming its checkout contains it.

### Bootstrap for a chat/project with repository access

> For Vedansh work in persisharma/aadhyatma, read AGENTS.md and docs/engineering/vedansh-build-checklist.md from the current repository branch before implementation. Apply the universal checks and relevant feature checks, preserve coherent work remotely before cleanup, and report PASS/FAIL/PENDING/N/A with evidence. If you cannot access the policy, say so and request that context rather than claiming it was applied.

Instruction discovery is not proof of compliance. Run `node scripts/verify-agent-instructions.mjs` to check repository entry points, and use the completion report to establish actual verification. No script can establish native visual QA from prose alone.

## Part A: mandatory checks for every implementation

### U1. Establish current scope and source of truth.

- [ ] Verified with evidence.
Read applicable AGENTS.md, CLAUDE.md, .claude/rules, wiki, RULEBOOK.md, design.md and the feature PRD. Inspect current main and related open PRs. Record the base commit, approved reference, intended behaviour, affected surfaces and what must be preserved. Do not duplicate existing work or rely on an old prototype or document as current app behaviour.

### U2. Define acceptance before editing.

- [ ] Verified with evidence.
List affected routes and states, data/asset dependencies, relevant conditional checks and observable success criteria. Include existing behaviour that must survive the change. Resolve a real ambiguity that changes behaviour; make routine choices autonomously within the task.

### U3. Match the approved design in the running app.

- [ ] Verified with evidence.
Reuse the existing typography, artwork registries, cards, reader shells, sheets and interaction helpers. Compare the actual installed screen with the approved reference for hierarchy, proportions, spacing, colour, icons, artwork, copy and motion. Explain any required deviation. A generated mockup or browser reconstruction does not prove native fidelity.

### U4. Verify language, typography and responsive layout.

- [ ] Verified with evidence.
For changed UI, check Hindi, English, Gujarati and Kannada at Standard and Large reading sizes, plus a compact viewport and enlarged system text. Use current script/font helpers. Include long real labels and content. Confirm complete matras, reph, anusvara, conjuncts and diacritics. Text must grow or scroll appropriately; primary actions stay reachable. Do not solve overflow by silently removing content, disabling accessibility scaling in interactive UI or shrinking readable text. Fixed image exports follow their separate output contract.

### U5. Verify the complete reachable journey.

- [ ] Verified with evidence.
Walk from each applicable entry point to the feature, perform its primary action, and return with Back. Include Home, section listings, saved items, resume, search, notifications, widgets and contextual cards where supported. Preserve expected stack, selected item, query and reading position. Check fresh/empty and saved/populated states.

### U6. Verify lifecycle, failure and cancellation.

- [ ] Verified with evidence.
Exercise relevant loading, empty, offline, error/retry and cancellation states; background/foreground, interrupted setup and cold restart. Await persistence hydration before writing defaults. Prevent stale results, duplicate actions, lost updates and work running after unmount. Derived state and completion counts must agree across affected screens.

### U7. Complete content and asset integration.

- [ ] Verified with evidence.
Trace every new item from authored source through registry/manifest and publication/cache to the actual screen. Check required variants, correct subject, image bounds, intended focal point and offline fallback. Assets being present in Git or generated in a folder is insufficient. Confirm the manifest is populated and published objects are available before enabling dependent UI.

### U8. Fix the whole recurring class.

- [ ] Verified with evidence.
Search sibling screens and callers for the same pattern. Prefer an existing shared helper, or introduce a shared solution when appropriate. Record which related surfaces were checked. Keep the change focused; do not silently turn a task into an unrelated redesign.

### U9. Prove behaviour with appropriate tests and native evidence.

- [ ] Verified with evidence.
Follow the repository's unit, integration and E2E gates. Bug regressions should fail before the fix and pass after. Cover real provider/state/route boundaries, not only mocked component shapes. Run the required full mobile suite and affected Maestro journeys. YAML parsing, typechecking and bundle exports are separate evidence from executed native flows and visual QA. Keep coverage intact; distinguish a broken test harness from a product defect using evidence.

### U10. Check performance, compatibility and existing data.

- [ ] Verified with evidence.
Protect startup import and asset budgets; defer expensive calculations and share-only modules. Verify responsive taps, bounded work, cancellation and cache invalidation. Preserve stable content IDs, saved data and explicit preferences. Inspect iOS/Android differences relevant to the change, including image sizing, gestures, permissions and native APIs.

#### U10.1. Prevent freezes and Android ANRs.

- [ ] Record PASS / FAIL / PENDING / N/A with evidence for every change. For documentation-only changes, runtime profiling may be N/A; reviewing a runtime feature still requires its own evidence.
- Trace changed work on the JS and native UI threads: synchronous parsing/serialization, layout/measurement, image decoding, large lists, native calls, timers and animation callbacks. Bound loops and queues; defer heavy work and lazy-load offscreen assets. An asynchronous storage/network API does not make its preceding JSON serialization or data preparation asynchronous.
- Keep frame-by-frame animation off React state and JS timers where the native driver supports it. Reuse animation/layout graphs across count updates. Stop timers, listeners and animations on their owning screen's blur/background/unmount as appropriate; stale callbacks must not restart work, duplicate counts or retain obsolete screens. Explicitly document intentionally supported background work.
- For changes to startup, continuous motion/audio, image-heavy screens or shared hot paths, compare a release-mode build against the previous version on a representative lower-configuration Android device. Record device/RAM, Android/build versions, dataset, duration and responsiveness/frame-time/memory observations. Exercise cold entry, repeated taps, scrolling, Back/reopen, offline/error paths and background/foreground; include longest content, large text and a realistic large saved history. Run continuous features for at least 20 minutes and repeat with audio and Reduced Motion where applicable.
- Inspect Android ANR traces/logcat and available Android vitals or crash telemetry for the tested build; check iOS hangs separately when its runtime changes. Any observed ANR, frozen primary action, runaway background work or unexplained sustained memory growth is FAIL and must be investigated before readiness.
- Unit tests, synthetic loop tests, typechecking, mockups and an absence of reported crashes do not prove an ANR-free app. If device profiling or telemetry is unavailable, mark that evidence PENDING, state the limitation and keep required acceptance pending; never claim “no performance/ANR issues” from automated tests alone.

### U11. Integrate against the current branch state.

- [ ] Verified with evidence.
Check overlapping PRs, dependencies, merge order and superseded work. Resolve behavioural conflicts as well as textual conflicts. Validate the final tested tree after rebasing or conflict resolution; rerun affected checks for changed behaviour and satisfy required CI on the final head. Update the matching design, integration rules and wiki in the same PR.

### U12. Preserve work remotely and deliver precise status.

- [ ] Verified with evidence.
The user's reason for requesting an early PR is durability: worktree cleanup must not erase work done by GPT. Commit and push coherent implementation checkpoints early, including required code, tests, documentation, artwork and reproducible asset/provenance records. When a PR is requested, create it promptly and return its real URL; keep it as a draft while verification continues. Do not leave the only copy of task work in a local worktree. Verify that the remote branch contains the latest checkpoint and that the PR points to that branch. Before cleanup, reconcile all task changes, including untracked assets, and confirm every required item is remotely preserved or saved in an explicitly recorded durable location. Never clean up the sole copy of unfinished work. Record the branch, remote commit, PR URL and remaining steps for handover. Report implemented, integrated, tested, native-verified, merged and released as separate facts. A required pending check prevents a ready-for-merge claim. Do not treat feature implementation as automatic authorisation for native builds, version bumps, store submission or OTA publication; follow the explicit request and current repository rules.

## Part B: conditional checks

Apply the relevant groups. Mark an irrelevant group N/A with a short reason; never invent a successful result.

### C1. Readers and devotional text
- Verify complete canonical text, stanza order, meanings, counts, source attribution and Unicode correctness under the module's editorial/source rules.
- Distinguish sourced scripture, translation, app-written retelling and regional tradition. Do not fill gaps from memory or boilerplate.
- Preserve IDs/bookmarks/progress while correcting text.
- Check reader-shell parity: language, share, bookmark, read-aloud, auto-slide, coverage and chapter transitions where required.
- Inspect the longest real content in each supported language and size.
Historical examples: #76, #98, #399, #485.

### C2. Illustrated stories and comics
- Review the entire causal arc and every transition: introduction, motive, action, response, consequence and ending.
- Check character continuity, identities, clothing, hands, props, deity attributes and scene/text agreement.
- Preserve explicit approved scene constraints, including the recorded Govardhan composition and Karni Mata depiction where applicable.
- Review every image and its individual crop/bounds; do not crop faces, crowns or meaningful scene content.
- Walk the full native reading sequence at Standard/Large. Check each authored narrative, not just opening pages.
Historical examples: #429, #473, #492; current AGENTS.md story rules.

### C3. Artwork, icons and R2/CDN
- Use current approved app branding and typed subject mappings; avoid wrong-deity or silent generic fallbacks.
- Explicitly frame native images rather than relying on intrinsic source size.
- Retain required prompt/provenance, masters, hashes and export metadata.
- Verify registry/manifest completeness, published object availability and hashes, cache reuse, cold decode, offline fallback and byte budgets.
- Keep CDN artwork out of bundles where the architecture requires remote delivery.
Historical examples: #410, #450, #525, #581.

### C4. Sharing and exports
- Test the actual exported file and platform handoff, not only its in-app preview.
- Await the final mounted card's layout, fonts and decoded artwork; protect against content/language changes during capture.
- Preserve complete verse, meaning and required names, footer, branding and current download link.
- Verify required dimensions/aspect ratios, long/short content, fixed image font-scaling policy and WhatsApp/system/Instagram/text paths.
- Keep interactive accessibility behaviour separate from fixed-image rendering.
Historical examples: #177–#180, #503, #531, #568, #573.

### C5. Panchang, Vrat and Jyotish
- Test the exact rule for each observance: sunrise, moonrise, sunset, aparahna, midnight or another documented convention.
- Cover location, regional calendar, adhik/kshaya/vriddhi cases, midnight and lunar rise/set boundaries where applicable.
- Use one explicit timezone/date-key policy per meaning; display current versus sunrise tithi deliberately.
- Ensure labels, date ranges, progress bars and exported explanations describe the same calculated period.
- Check known published reference dates and fail genuine mismatches rather than reporting them as passing warnings.
Historical examples: #192, #297, #308, #394, #404, #413.

### C6. Reminders, onboarding, widgets and launch sheets
- Test never-asked, allowed, denied, permanently denied, explicitly Off and Settings-return permission states on both platforms.
- Check chosen times, multiple schedules, deduplication, next-day continuation and cancellation.
- Keep Daily Bhakti, Vrat and alarm preferences separate except for genuinely shared OS permission.
- Test competing launch prompts together, priority, one-per-local-day policy, snooze/rest dates, interrupted setup and targeted cold starts.
- Do not equate initiating widget setup with confirmed widget placement.
Historical examples: #56, #58, #75, #240, #244, #557, #577, #578.

### C7. Navigation, saved items, routine and Sankalp
- Check all supported entry routes and expected Back stacks, exact target item/chapter and retained query/scroll.
- Verify hydration, stable IDs, resume/start-over, per-chapter reset and cold-start persistence.
- Compare Home, list and detail counters after completion; distinguish previews, waiting days and completable units.
Historical examples: #21, #38, #108, #181, #277, #512.

### C8. Audio, video, read-aloud and Japam
- Check load-before-play, error/retry, pause/resume, seek, repeat, speed changes, end-of-track and multiple loops.
- Confirm actual native playback matches buttons, counter and page state; handle backgrounding and competing playback.
- Use verified cue sheets when synchronising verses; do not assume text position is proportional to video duration.
- Validate voice availability/language and native alarm file/channel requirements.
Historical examples: #166, #197, #207, #456, #458, #464.

### C9. Shared UI, gestures and accessibility
- Audit every affected caller after changing a shared card, font, frame or control.
- Verify first tap, drag suppression, horizontal versus vertical scroll and independent save/open/reminder hit targets.
- Check overlays, keyboard, safe areas, focus, screen-reader labels and reachable dismiss/primary controls.
- Include fractional-density Android widths and native iOS font/image behaviour where layout changes.
Historical examples: #109, #219, #221, #249, #320, #565.

### C10. Release or store work — only when explicitly in scope
- Follow current release approval and versioning rules; verify target channel/runtime and native compatibility.
- Test upgrade of existing installed data as well as fresh install.
- Preserve repository constraints on Google Play Automatic protection and investigate configuration failures before rebuilding.
- Record actual build/release results separately from PR readiness.
Historical examples: #432, #552; RULEBOOK §§0.3–0.4.

## Part C: required completion report

Task / intended behaviour:
PR URL / branch / base commit / tested head / remotely preserved head:
Applicable checks: U1–U12 and C[...]
Result per check: PASS / FAIL / PENDING / N/A
Evidence per result: command and outcome, flow/device/platform, screenshot/export path or PR/CI URL.
For N/A: why it does not apply.
For FAIL/PENDING: what remains, why, and the next concrete action.

## Summary:
1. What changed and which existing behaviour was preserved.
2. Where it is reachable in the app and which fresh/saved states were verified.
3. Visual comparison: approved reference, actual native evidence, and deviations.
4. Language/size/platform matrix: distinguish executed cells from untested cells.
5. Assets/content: authored, published, mapped, cached and visible.
6. Validation: test commands/results, CI for the final head, native journeys and actual exports.
7. Related surfaces checked and how the recurring class is prevented.
8. Dependencies, conflicts, documentation updates and remaining checks.
9. Durability: remote checkpoint verified, required assets preserved, untracked work reconciled, and handover recorded before cleanup.
10. Delivery status: implemented / integrated / PR created / native verified / ready for merge / merged / released.

## Evidence rules:
- PASS requires an executed check with relevant evidence.
- PENDING means not executed or not established; explain the limitation.
- FAIL means the check ran and did not meet acceptance.
- N/A requires a scoped reason.
- Tests written, YAML parsed, bundle built, screenshot generated and native flow passed are distinct claims.
- Record the tested head. After changes, reassess invalidated evidence.
- Existing unrelated failures are named and scoped; do not silently count the full gate as passed.
- An asset sheet cannot establish installed-screen appearance.
- Required pending/failed checks keep the PR draft and prevent an unqualified completion claim.

## Part D: copy-ready additional prompt

Apply these Vedansh acceptance rules to this task in persisharma/aadhyatma.

Before editing, read the applicable repository instructions, current RULEBOOK.md/design.md, feature wiki/PRD and approved reference. Inspect latest main and related open PRs. Define the affected routes, states, dependencies and observable acceptance criteria. Preserve existing behaviour unless this task changes it.

1. Match the approved design using Vedansh's shared components, typography and artwork. Verify proportions, spacing, icons, subject identity and framing in the actual app. Explain any deviation.
2. Check changed UI in Hindi, English, Gujarati and Kannada at Standard/Large, on compact screens and with enlarged system text. Preserve complete Indic marks and readable content. Reflow or scroll; do not hide content or shrink it merely to fit.
3. Complete integration: entry point → screen → action → persistence → Back. Exercise fresh/empty and saved/populated states, plus applicable offline/error/retry, cancellation, backgrounding and cold restart. Verify other supported entry routes.
4. Trace content/artwork through sources, registries, populated manifests, published assets, cache and rendered UI. Verify actual visibility, correct subjects/crops and offline fallback. Files generated or committed do not establish completion.
5. Apply the relevant feature checks: sourced complete scripture; full story/character continuity; location/timezone/calendar boundaries; permission and reminder timing; shared launch-prompt priority; playback/counter/cue synchronisation; complete exported images and actual share handoff.
6. Search sibling surfaces for the same defect and use shared fixes where appropriate. Preserve saved IDs/preferences, platform accessibility and startup/performance budgets.
7. Follow repository unit/integration/E2E requirements. Add meaningful regression coverage, run required suites and affected native journeys, and inspect actual screens/exports. Do not weaken checks to obtain green results. YAML parsing, bundle exports and mockups do not establish native verification.
8. Resolve related PR dependencies and behavioural conflicts, update matching docs, and validate the final tested head after integration changes.

Preserve work before worktree cleanup can erase it. Commit and push coherent checkpoints early, including required implementation, tests, docs and reproducible assets. When a PR is requested, open it promptly as a draft if checks remain, return its real link, and continue verification. Verify the remote branch contains the latest work; reconcile untracked task files and record the branch, commit, PR and remaining steps before cleanup. Never discard the only copy of unfinished work. Proceed autonomously within the authorised task and follow explicit build/release instructions and repository approval rules.

Finish with a compact evidence report: what changed; where it is reachable; checks marked PASS/FAIL/PENDING/N/A with evidence; language/size/platform coverage; asset publication/integration; final commit/CI; related surfaces checked; and remaining work. Do not call required unexecuted checks passed or claim merge/release without evidence.
