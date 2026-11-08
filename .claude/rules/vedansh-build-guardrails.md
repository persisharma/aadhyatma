# Vedansh implementation guardrails

For Vedansh implementation, fixes, UI/content/artwork changes, reviews and PR follow-up, read the repository's AGENTS.md and [shared build checklist](../../docs/engineering/vedansh-build-checklist.md). This rule is unscoped so it also covers docs, data and asset work.

Apply U1–U12 and relevant C1–C10. Check the approved design, four languages and Standard/Large, actual integration, fresh/saved and failure/lifecycle states, expected entry routes and Back behaviour. Inspect sibling surfaces before treating a local fix as complete.

Commit and push coherent checkpoints early. A requested draft PR is a durable recovery point; continue verification after opening it. Verify the remote branch contains required code, tests, docs and assets, reconcile untracked work, and record handover before worktree cleanup. Never delete the only copy of unfinished work.

Report PASS / FAIL / PENDING / N/A with evidence and tested/remote commits. Native checks that were not executed remain pending. Keep required pending checks in draft status and follow existing build/release rules. Read-only review tasks do not authorise code edits.
