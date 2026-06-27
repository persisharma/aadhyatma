# Enrichment Loop — Scope & Tiers

Defines **what each loop run is allowed to do** and how it picks. The goal of the
loop is to **move the product forward** — close competitive gaps, enhance
features, ship features — not to grind small chores. Hardening is the floor, not
the point.

Read alongside `backlog.md` (the value-ranked queue) and the command files
(`.claude/commands/enrich.md`, `enrich-auto.md`).

## The tier ladder

Every run picks the single highest-value item from `backlog.md` and classifies it:

| Tier | Kind of work | Examples (this app) |
|---|---|---|
| **T0 — Harden** | tests, types, perf, a11y, refactor | reader smoke tests, tsc gaps |
| **T1 — Enhance** | improve an existing feature | font-size control, better resume sheet, empty states, search ranking |
| **T2 — Feature slice** | one thin vertical of a roadmap feature | dark-mode toggle behind a setting, sleep timer, a search filter |
| **T3 — New feature** | a net-new capability rivals have | verse audio for chalisas, global search (net-new), backup export/import |

T1/T2 are the **target altitude** for most runs. T0 is the fallback when nothing
higher-value is ready. T3 is the ambition — gated (see Routing).

## Routing — "plan big, build small"

How a run acts depends on tier **and** who's driving:

- **Autonomous runs (`/enrich-auto`, cron):**
  - **T0–T2** → build and ship directly (TDD, tests+tsc gate, push to branch).
  - **T3** → do NOT build blind. Write a reviewable implementation plan to
    `docs/enrichment-loop/plans/<slug>.plan.md` (problem, slices, files, risks,
    open product decisions), commit that, and stop. A human approves, then a
    later run (or `/enrich`) builds the first slice.
- **Approval-gated runs (`/enrich`):** may build **any** tier — the human
  approves the slice at the Phase 2 gate, so T3 features are fair game.

This is the resolution of "run hands-off every few hours" + "build real
features": small/medium real work ships unattended; net-new features always get
a human plan-review before code lands.

## Value-ranking rubric (how to pick THE one)

Score candidates; highest wins. Ties break toward smaller.

1. **User impact** — does it close a competitive gap or unblock a habit loop?
   (Roadmap §2 themes: daily-habit > discovery > reliability.)
2. **Leverage** — does shipping it unblock other queued work?
3. **Readiness** — is it specified enough to build now without a product decision?
   (If not, and it's T3, it becomes a plan; if T1/T2 and ambiguous, defer + log.)
4. **Effort** — prefer the thinnest slice that delivers standalone value.

**Current focus order (set by the user): quick wins first.** Lead with
low-effort, high-visibility T1/T2 enhancements (font scale, dark-mode toggle,
sleep timer) before the heavy T3 features (audio, net-new search).

## PR follow-through (part of the loop's job)

Shipping a slice isn't done when the commit lands — it's done when the PR is
green and mergeable. The loop owns its PRs end to end:

- When a loop PR is open, **watch it** (subscribe to its CI + review activity).
- **CI red → re-diagnose and fix** the same way the slice was built: reproduce,
  patch, re-run `test:readers` + `tsc`, push. Never leave a loop PR red.
- **Review comments** → address unambiguous ones directly; for anything that
  needs a product/design call, surface it to a human instead of guessing.
- Keep the PR rebased on `main` (the Phase 0 sync) so it stays mergeable.
- A loop PR is "done" only when **merged or closed** — keep following until then,
  then unsubscribe.

This makes the loop responsible for the whole path to merge, not just the push.

## Hard constraints (unchanged, never violated)

- **Bundle-only**: no backend, CDN, cloud sync, streaming, server analytics, remote flags.
- **No new content sections** beyond data fixes — use `/add-section`.
- **Light theme stays the default**; dark mode only behind a setting, default "system."
- Respect the +60 MB quarter binary budget (audio dominates it).
- One enrichment (or one plan) per run. Autonomous runs never push red, never
  touch `main`, never open a PR.

## Keeping the backlog honest

The May roadmap is partly stale — verify against source before enqueuing. Already
shipped since: notifications (`NotificationPreferencesContext`, `ReminderSettingsScreen`),
verse share card (`ShareCard.tsx`). Don't re-queue shipped work; the Shipped log
in `backlog.md` is the source of truth.
