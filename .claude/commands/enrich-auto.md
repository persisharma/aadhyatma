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

## Phase 0 — Load state + sync with main (same as /enrich, plus sync)

Load the ledger, wiki, roadmap/PRDs. Confirm the working branch is the
designated feature branch, NOT `main`. **If on `main`, abort and log — never
auto-commit to main.**

**Sync with main BEFORE doing any work** (so future PRs stay clean after you've
merged earlier loop commits — see `.claude/ship-learnings/deliver.md` on
squash-merge noise):

1. `git fetch origin main`
2. `git rebase origin/main` — replays loop commits onto latest main. Commits
   whose content is already in main (merged/squashed) apply empty and are
   auto-dropped, leaving only unmerged work.
3. If the rebase hits a conflict (rare — the loop only adds isolated files),
   **abort it** (`git rebase --abort`), do NOT build this run, and log
   "deferred: rebase conflict with main, needs human" to the Autorun log.

The actual push (with `--force-with-lease` when history diverged) happens in Phase 4.

## Phase 1 — Select ONE (per scope.md)

Read `docs/enrichment-loop/scope.md`. Pick the **topmost ready item** from
`docs/enrichment-loop/backlog.md` by the value rubric, honoring the current focus
(**quick wins first**). Classify its tier. Aim for **T1/T2** real product work;
T0 is the fallback. Never re-pick a Shipped-log item. Honor `$ARGUMENTS` bias.
Verify against source (the May roadmap is partly stale).

## Phase 2 — Tier routing + auto-gate (REPLACES the approval prompt)

No `AskUserQuestion`. Route by tier (per scope.md "plan big, build small"):

- **T3 (net-new feature):** do NOT build. Write an implementation plan to
  `docs/enrichment-loop/plans/<slug>.plan.md` (problem · slices · files · risks ·
  open product decisions), commit just that plan, and stop. Log "planned: <slug>"
  to the Autorun log. A human approves; a later `/enrich` run builds slice 1.
- **T0–T2:** build directly **only if** the slice passes ALL gates below.
  If any fails, do nothing this run and write a one-line "deferred: …" note to the
  Autorun log (then Phase 4 record-only):
  - **Size is S or M.** Anything L is too big for an unattended run — re-slice
    thinner or defer.
  - **Low-risk / additive-leaning.** A new context/util/component/test, or a
    contained edit, is fine (T1/T2 enhancements are expected to touch existing
    code). But defer edits that rewrite a critical shared path wholesale
    (navigation graph rewrite, App.tsx provider reorder, data migrations).
  - **No product decision required.** If it needs a roadmap "Open decision"
    (app name, audio licensing, Android scope, size ceiling) or an ambiguous
    design call, defer + log — those are for a human.
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
3. Push: try `git push -u origin <branch>` first; if it's rejected as non-fast-forward
   (because Phase 0 rebased over a squash/rebase merge), push with
   `git push --force-with-lease origin <branch>` (safe — refuses to clobber other pushes).
   Retry on network error, backoff 2/4/8/16s.
4. **Do NOT open a PR.**

If nothing shipped (auto-gate deferred, or build failed and was reverted):
- Append a dated line to the ledger "Autorun log" with the reason.
- Commit just the ledger note (so the next run sees the history) and push.

Always end with a short status line: shipped / deferred / failed-and-reverted,
plus what the next run will likely attempt.

## PR follow-through

If a loop PR is open (see `scope.md` "PR follow-through"), the loop owns it to
merge: watch CI + reviews, fix red builds (re-run `test:readers` + `tsc`, push),
address unambiguous review comments, surface anything needing a human decision,
keep it rebased on `main`. Follow until merged/closed, then unsubscribe.

## Autorun safety summary

- One enrichment max per run. Small, additive, verified, or nothing.
- Never push red, never commit to main, never leave a dirty tree, never open a PR.
- Anything needing a human decision is deferred and logged, not guessed.
