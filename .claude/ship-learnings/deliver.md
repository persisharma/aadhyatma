# /ship Learnings — deliver phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### gh auth switch when multiple GitHub accounts are keyring-attached and the active one isn't the repo owner

**Seen:** 1x — 2026-04-22
**Category:** tooling
**Example:** `gh pr create` failed with "GraphQL: must be a collaborator" on the first attempt because `gh auth status` showed two keyring accounts (prashantsharma-kc = active, persisharma = inactive). Fix: `gh auth switch -u persisharma`, then retry.
**Resolution pattern:** Before `gh pr create`, run `gh auth status` and confirm the **active** account matches the owner of the `origin` remote. If not, `gh auth switch -u <owner>` before any write operations (PR create, release, issue comment).

### A branch whose earlier work was squash-merged to main produces a NOISY PR — check 2-dot vs 3-dot diff before creating

**Seen:** 1x — 2026-05-29
**Category:** branch-hygiene
**Example:** Shipped the NEW-chip on `sanskar-kids-habits-prd`, whose Sanskar work was already squash-merged to main as #83. `git diff origin/main HEAD` was EMPTY (the branch tree already matches main), yet `git diff origin/main...HEAD` (what a GitHub PR shows = merge-base diff) listed 43 already-merged Sanskar files. A PR from this branch would redundantly display the whole Sanskar diff alongside the new feature.
**Resolution pattern:** Before creating a PR, compare `git diff origin/main HEAD --stat` (tip-to-tip) with `git diff origin/main...HEAD --stat` (merge-base). If they differ, the branch has squash-merged history → branch fresh off `origin/main` and cherry-pick the feature commit (or rebase onto origin/main) so the PR shows only the new diff. Confirm branch strategy with the user before pushing — it's outward-facing.

