---
description: Run ONE feature-enrichment cycle — pick one feature + one enrichment, get approval, build it. Designed to be driven on a loop.
argument-hint: "[optional: feature id or PRD number to bias selection, e.g. PRD-03 or search]"
---

# /enrich — one feature, one enrichment, per run

You are running **a single iteration** of the Vedansh feature-enrichment loop.
Each invocation does exactly one thing: surface **one feature** and **one
concrete enrichment** for it, get the user's **approval**, then **build that one
enrichment** — nothing more. The loop's value comes from being small and
repeatable, not from doing a lot per run. Resist scope creep.

> **Wiki-first.** Before reading source, read `wiki/index.md` and the relevant
> pages (`.claude/rules/wiki-first-lookup.md`). Then `docs/roadmap/` and
> `RULEBOOK.md` / `design.md` are canonical for what to build and how.

`$ARGUMENTS` (optional) biases selection toward a feature id or PRD number.
Treat it as a hint, not a contract.

---

## Phase 0 — Load state

1. Read `docs/enrichment-loop/backlog.md` — the **ledger**. It has two parts:
   - **Candidate registry**: features + their pending enrichments.
   - **Shipped log**: enrichments already delivered (with date + commit/PR).
2. Read `wiki/index.md` + relevant wiki pages, then `docs/roadmap/2026-Q3-roadmap.md`
   and the PRD(s) under `docs/roadmap/prds/` for the candidates in play.
3. Confirm the working branch is the designated feature branch (not `main`).

Never re-propose anything already in the **Shipped log**.

---

## Phase 1 — Select ONE (feature, enrichment) pair

Read `docs/enrichment-loop/scope.md` (the tier ladder + value rubric) and pick
the **topmost ready item** from `docs/enrichment-loop/backlog.md`. Classify its
tier (T0 harden · T1 enhance · T2 feature slice · T3 new feature).

Aim for **T1/T2 real product work** — the loop exists to move the product
forward, not to grind T0 chores. T0 is the fallback when nothing higher is ready.
Because this is the **approval-gated** command, you MAY propose any tier including
**T3** net-new features — the user approves the slice at Phase 2.

Rank by the rubric in `scope.md` (user impact → leverage → readiness → effort),
honoring the **current focus: quick wins first**. Then:

1. **Smallest shippable increment** — fits in **one run, one PR**. Slice a big
   feature into the next thin vertical (one screen, one toggle, one util), not the whole PRD.
2. `$ARGUMENTS` bias if present and not already in the Shipped log.

Verify the item against source before building — the May roadmap is partly stale
(notifications + share card already shipped; see backlog "Already shipped upstream").

Hard constraints (from the roadmap — do not violate):
- **Bundle-only.** No backend, CDN, cloud sync, streaming, server analytics, or
  remote flags. On-device equivalents only.
- **No new content sections** beyond data corrections (use `/add-section` for those).
- **Light theme stays default**; dark mode only behind a setting, defaults to "system."
- Respect the +60 MB quarter binary budget (audio is the dominant consumer).

Define the pair precisely:
- **Feature**: the PRD / capability it belongs to.
- **Enrichment**: one concrete, testable increment.
- **Scope**: files you expect to touch, the acceptance criterion, the test that
  proves it (RULEBOOK §4.10 requires a `<Pascal>ReaderScreen.test.tsx` for reader
  work; engine work uses `tsx --test`).
- **Out of scope**: name what you are deliberately NOT doing this run.

---

## Phase 2 — Propose & get approval (MANDATORY gate)

Call **`AskUserQuestion`** with one decision. Put enough context in the question
that the user can decide without scrolling. Present:

- The chosen feature + enrichment (one line each).
- Scope: files, acceptance criterion, the test.
- Why this one now (the priority rationale from Phase 1).
- Est. size (S/M — if it reads L, you sliced too big; re-slice).

Options:
1. **Approve & build** (Recommended) — proceed to Phase 3.
2. **Pick a different one** — return to Phase 1 with their steer; re-propose.
3. **Skip this run** — record nothing, end the cycle cleanly.

**Do not write any code before approval.** If the user picked option 2 or 3,
honor it and stop (option 3) or re-select (option 2).

---

## Phase 3 — Build the one enrichment

Only after explicit approval. Follow the repo's ship discipline
(`.claude/ship-learnings/` — read the relevant phase notes first):

1. **TDD** — write the failing test first (RULEBOOK §4.10 / the right runner).
2. **Implement** by copying existing patterns, not inventing new ones. Match
   surrounding code's naming, response shape, logging, and `useTheme()` usage.
3. **Verify** — run the targeted tests (`npm run test:readers` / `test:engine` /
   the file you added). Don't claim green without running.
4. Keep the diff to the approved scope. If you discover the slice was wrong,
   stop and re-confirm via `AskUserQuestion` rather than expanding silently.

---

## Phase 4 — Record & commit

1. Update `docs/enrichment-loop/backlog.md`:
   - Move the delivered enrichment from the registry to the **Shipped log** with
     today's date and a one-line summary.
   - If the build surfaced an obvious next enrichment, add it to the registry.
2. Commit on the feature branch with a clear message describing the one enrichment.
   Push only when the user asks; **do not open a PR** unless explicitly requested.
3. End the run with a 3-line summary: what shipped, test status, and what the
   next run would likely pick (so the loop has continuity).

---

## Notes for loop mode

When invoked via `/loop` (see `docs/enrichment-loop/README.md`), this whole
command is one tick. The `AskUserQuestion` gate in Phase 2 blocks until you
answer, so an unattended loop simply waits at the approval prompt — it never
builds without you. One tick = at most one enrichment.
