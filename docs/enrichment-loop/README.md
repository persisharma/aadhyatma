# Feature-Enrichment Loop

A small, repeatable loop that — **on every run** — picks **one feature** and
**one enrichment**, asks you to **approve** it, then **builds** that one slice.
Stateful: it never repeats what it already shipped.

## Parts

| File | Role |
|---|---|
| `.claude/commands/enrich.md` | The `/enrich` slash command — one full cycle per invocation. |
| `docs/enrichment-loop/backlog.md` | The ledger: pending candidates + shipped log. Read & written each run. |
| `docs/enrichment-loop/README.md` | This guide. |

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
