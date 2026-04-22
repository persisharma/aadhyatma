# /ship Learnings — deliver phase

Learnings are auto-captured after each /ship run. Read before starting the phase.

### gh auth switch when multiple GitHub accounts are keyring-attached and the active one isn't the repo owner

**Seen:** 1x — 2026-04-22
**Category:** tooling
**Example:** `gh pr create` failed with "GraphQL: must be a collaborator" on the first attempt because `gh auth status` showed two keyring accounts (prashantsharma-kc = active, persisharma = inactive). Fix: `gh auth switch -u persisharma`, then retry.
**Resolution pattern:** Before `gh pr create`, run `gh auth status` and confirm the **active** account matches the owner of the `origin` remote. If not, `gh auth switch -u <owner>` before any write operations (PR create, release, issue comment).

