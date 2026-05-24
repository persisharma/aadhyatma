# /ship Learnings — eval phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### For pure-scaffolding tasks, acceptance criteria should be verification commands, not feature behaviors

**Seen:** 1x — 2026-04-22
**Category:** eval-scope
**Example:** Sanatan scaffold plan listed six verification commands (npm install, expo-doctor, tsc, eslint, expo export, git log) as acceptance criteria instead of behavioral checks. Each is deterministic and fully verifiable with exit codes — the model-based grader was unnecessary. Result: 6/6 criteria satisfied, one skipped (simulator boot) with explicit user approval.
**Resolution pattern:** For scaffolding / bootstrap tasks, evals should be shell commands with expected exit codes. Save model-based graders for feature tasks where behavior is the thing being verified.

### Content correctness tasks need invariant assertions updated alongside data changes

**Seen:** 1x — 2026-05-24
**Category:** regression-chain
**Example:** Fixing Durga Stotram chapter-02 (removing duplicate verses, 12→10) cascaded through 3 files: chapters-manifest.json verseCount, index.ts hardcoded invariant (23→21), and chapteredTotals.test.ts expectedTotal. Similarly Durga Chalisa rewrite (43→41) broke its index.ts invariant. Both caught by test suite but required 3 fix rounds.
**Resolution pattern:** When changing verse counts in any content JSON, immediately grep for the old count across: manifest files, index.ts invariant assertions, and test files with expectedTotal. Update all three atomically.

### Content-section additions can eval entirely via tsc + invariant assertions + background coverage IIFE

**Seen:** 1x — 2026-05-24
**Category:** eval-scope
**Example:** Krishna Stotram (stotram addition) acceptance criteria were: tsc passes, invariant IIFE validates 9 verses with correct fields, backgrounds.ts IIFE asserts source coverage for all active entries, route types compile cleanly. All deterministic — no model-based grader needed. The data-layer invariants serve as built-in evals.
**Resolution pattern:** When adding a new content section that follows an existing pattern (same verse shape, same screen pattern), the module-load-time invariant checks ARE the eval. tsc + the IIFE assertions cover structure, completeness, and type safety without additional grader code.

