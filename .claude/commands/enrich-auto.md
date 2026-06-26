---
description: Autonomous (no-approval) variant of /enrich for unattended/cron runs — picks one feature + one enrichment, builds it, only commits if tests pass.
argument-hint: "[optional: feature id or PRD number to bias selection]"
---

# /enrich-auto — one enrichment per run, unattended

Autonomous sibling of `/enrich`. Same intent — **one feature, one enrichment per
run** — but **no human approval gate**, because the user pre-authorized hands-off
runs. The approval is replaced by **hard safety rails**: an unattended run may
only ship a small, low-risk, fully-verified slice, or it does nothing.

Read `.claude/commands/enrich.md` Phases 0, 1, 3, 4 — they apply verbatim except
where overridden below. Read `docs/enrichment-loop/README.md` for context.

## Phase 0 — Load state (same as /enrich)

Load the ledger, wiki, roadmap/PRDs. Confirm the working branch is the
designated feature branch, NOT `main`. **If on `main`, abort and log — never
auto-commit to main.**

## Phase 1 — Select ONE (same as /enrich)

Pick the single highest-value pair by roadmap priority. Never re-propose a
Shipped-log item. Honor `$ARGUMENTS` bias if present.

## Phase 2 — Auto-gate (REPLACES the approval prompt)

No `AskUserQuestion`. Instead, the selected slice must pass ALL of these to
proceed. If any fails, **do nothing this run** and write a one-line note to the
ledger's "Autorun log" explaining why (then go to Phase 4 record-only):

- **Size is S or M.** Anything that reads L is too big for an unattended run.
- **Low-risk surface.** Prefer additive work (a new test file, a new pure util,
  a new isolated component) over edits to shared/critical paths
  (navigation graph, App.tsx provider tree, context internals, data migrations).
  If the only available slice touches a critical path, defer it and log.
- **No product decision required.** If the slice needs a choice from the roadmap's
  "Open decisions" (app name, audio licensing, Android scope, size ceiling) or any
  ambiguous design call, defer it and log — those are for a human.
- **Honors all hard constraints** (bundle-only, no new content sections, light
  default, +60 MB budget).

## Phase 3 — Build & verify (same as /enrich, with a strict gate)

TDD → implement by copying existing patterns → **run the targeted tests**.

**Hard rule:** if tests do not pass, or `tsc --noEmit` fails, **revert the
working-tree changes** (`git restore` / `git checkout --`), commit NOTHING, and
log the failure to the Autorun log. Never push red. Never leave the tree dirty.

## Phase 4 — Record, commit, push

If a slice shipped green:
1. Move it to the ledger Shipped log (date · feature · enrichment · "autorun").
2. Commit on the feature branch with a clear message.
3. Push with `git push -u origin <branch>` (retry on network error, backoff 2/4/8/16s).
4. **Do NOT open a PR.**

If nothing shipped (auto-gate deferred, or build failed and was reverted):
- Append a dated line to the ledger "Autorun log" with the reason.
- Commit just the ledger note (so the next run sees the history) and push.

Always end with a short status line: shipped / deferred / failed-and-reverted,
plus what the next run will likely attempt.

## Autorun safety summary

- One enrichment max per run. Small, additive, verified, or nothing.
- Never push red, never commit to main, never leave a dirty tree, never open a PR.
- Anything needing a human decision is deferred and logged, not guessed.
