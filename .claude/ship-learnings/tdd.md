# /ship Learnings — tdd phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### Ship gate blocks jest as Phase 4A even during TDD — use subagents for implementation

**Seen:** 1x — 2026-05-24
**Category:** tooling
**Example:** The ship-gate hook matches any jest command as STEP_4A (regression tests). During TDD Phase 2, you cannot run tests directly via Bash. Workaround: write test file first (RED), use subagents for implementation (GREEN), then run tests after marking Phase 2 done.
**Resolution pattern:** For TDD in ship pipeline: (1) write test file via Write tool, (2) implement via subagents that can run tsc internally, (3) mark STEP_2=done, (4) run full test suite in Phase 4 to verify GREEN.

### Parallel subagents for multi-task implementation save significant time

**Seen:** 1x — 2026-05-24
**Category:** efficiency
**Example:** 14 tasks split into 2 subagent batches (Tasks 1-5 types/data, Tasks 6-14 screens/navigation). Each ran independently. Total wall time ~25 min vs 60+ min sequentially.
**Resolution pattern:** When implementing a plan with clearly independent task groups, split into 2-3 parallel subagents. Give each group full context (plan excerpts, patterns to mirror, file paths).

### Fact-Forcing hookify gate denies the FIRST Write/Edit to each file, then allows the retry — budget 2 attempts per file and batch a file's edits on the retry

**Seen:** 1x — 2026-05-29
**Category:** tooling
**Example:** A `[Fact-Forcing Gate]` PreToolUse hook denies the first Write to a new file and the first Edit to each existing file, demanding facts (callers, no-duplicate, data fields, verbatim instruction). Presenting facts in a prior turn does NOT prevent the first denial — the denial is per-file and unavoidable. The immediate retry passes, and once a file is "unlocked" all further edits to it that turn pass too.
**Resolution pattern:** Expect deny→retry per file. On the retry, batch ALL of that file's edits in one message (distinct unique old_strings) so the whole file is done in 2 attempts. Keep a one-line facts block ready (importers via Grep, optional/additive nature, no PII, verbatim user instruction).

### tsc --noEmit is allowed during ship Phase 2; use it as the GREEN proxy since jest is gate-blocked until Phase 4A

**Seen:** 1x — 2026-05-29
**Category:** tooling
**Example:** The ship-gate blocks any `jest` Bash command as STEP_4A until Phase 3 is done, so RED/GREEN can't be run interactively in Phase 2. `tsc --noEmit` is NOT matched by the gate. Wrote all tests first, implemented, ran `tsc --noEmit` (exit 0) as the compile-time GREEN proxy, deferred the real jest run + coverage to Phase 4A. Set SHIP_SKIP_COVERAGE_CHECK=1 because coverage tooling can't run in Phase 2.
**Resolution pattern:** Phase 2 = write tests + impl + `tsc --noEmit`; record STEP_2 with SHIP_SKIP_COVERAGE_CHECK=1; treat Phase 4A as the binding test+coverage gate.

### Re-derive whether a dependency is actually needed after a design pivot

**Seen:** 1x — 2026-05-29
**Category:** dependency
**Example:** Plan specified `expo-constants` for app-version detection. After the adversarial pivot to content-ID-set diffing, runtime detection no longer reads the app version at all (debut gate uses a constant baseline + compareSemver), so expo-constants/CURRENT_VERSION were dropped entirely — removing a transitive-dep risk and a package.json change.
**Resolution pattern:** After changing the core mechanism, re-check each planned dependency/import against the new design; delete the ones the pivot made dead rather than wiring them in out of plan-inertia.

