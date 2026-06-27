# Feature-Enrichment Loop

A small, repeatable loop that — **on every run** — picks **one feature** and
**one enrichment**, asks you to **approve** it, then **builds** that one slice.
Stateful: it never repeats what it already shipped.

## Parts

| File | Role |
|---|---|
| `.claude/commands/enrich.md` | The `/enrich` command — approval-gated, can build any tier. |
| `.claude/commands/enrich-auto.md` | The `/enrich-auto` command — autonomous (cron), builds T0–T2, plans T3. |
| `docs/enrichment-loop/scope.md` | **What each run may do** — the tier ladder, routing, value rubric. |
| `docs/enrichment-loop/backlog.md` | The value-ranked queue + shipped log + autorun log. |
| `docs/enrichment-loop/plans/` | T3 feature plans written by autonomous runs for human approval. |
| `docs/enrichment-loop/README.md` | This guide. |

## What a run does (scope)

The loop moves the product forward — closing competitive gaps and shipping/
enhancing features — not just hardening. Each run picks the highest-value item and
routes it by tier (**T0** harden · **T1** enhance · **T2** feature slice · **T3**
new feature). See `scope.md` for the full ladder and the **"plan big, build
small"** rule: autonomous runs ship T0–T2 directly and write a review-first plan
for T3; the approval-gated `/enrich` can build any tier. Current focus: **quick
wins first**.

## One cycle (`/enrich`)

```
Phase 0  Load ledger + wiki + roadmap, confirm feature branch
Phase 1  Select ONE (feature, enrichment) by roadmap priority; slice thin
Phase 2  AskUserQuestion → Approve / Pick different / Skip   ← approval gate
Phase 3  Build only on approval: TDD → implement → verify
Phase 4  Move item to Shipped log, commit, summarize next pick
```

The Phase 2 gate means **nothing is built without your approval**. Pick
"Pick a different one" to steer, or "Skip this run" to do nothing.

## Run it once

```
/enrich
```

Bias the pick toward a specific PRD or feature:

```
/enrich PRD-03          # bias toward search
/enrich notifications   # bias toward the daily-notifications feature
```

## Run it on a loop

Drive `/enrich` on a recurring interval with the `loop` skill:

```
/loop 30m /enrich       # every 30 minutes, run one enrichment cycle
/loop /enrich           # default interval (10m)
```

How it behaves unattended: each tick runs one cycle and **stops at the Phase 2
approval prompt** until you answer. So the loop paces the work but never builds
anything you didn't approve. One tick → at most one enrichment. Stop the loop
anytime by telling Claude to stop the loop (or end the session).

> Because each tick waits on your approval, treat this as a *paced, supervised*
> loop, not a fire-and-forget autopilot. If you want a tick to need no human,
> change the Phase 2 gate in `enrich.md` to auto-approve — but that removes the
> "take approval" guarantee you asked for, so it's off by default.

## Adding / reprioritizing candidates

Edit `docs/enrichment-loop/backlog.md`:
- Add a `- [ ]` slice under the right feature to enqueue it.
- Reorder features/slices to change what the next run picks.
- The **Shipped log** is the source of truth for "don't repeat" — don't delete entries.

## Guardrails (inherited from the roadmap)

- **Bundle-only**: no backend, CDN, cloud sync, streaming, server analytics, remote flags.
- **No new content sections** beyond data fixes — use `/add-section` for those.
- **Light theme default**; dark mode only behind a setting.
- Respect the +60 MB quarter binary budget.
- One enrichment per run; one PR per enrichment. Re-slice anything that reads as size L.
