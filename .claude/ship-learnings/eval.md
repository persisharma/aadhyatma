# /ship Learnings — eval phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### For pure-scaffolding tasks, acceptance criteria should be verification commands, not feature behaviors

**Seen:** 1x — 2026-04-22
**Category:** eval-scope
**Example:** Sanatan scaffold plan listed six verification commands (npm install, expo-doctor, tsc, eslint, expo export, git log) as acceptance criteria instead of behavioral checks. Each is deterministic and fully verifiable with exit codes — the model-based grader was unnecessary. Result: 6/6 criteria satisfied, one skipped (simulator boot) with explicit user approval.
**Resolution pattern:** For scaffolding / bootstrap tasks, evals should be shell commands with expected exit codes. Save model-based graders for feature tasks where behavior is the thing being verified.

