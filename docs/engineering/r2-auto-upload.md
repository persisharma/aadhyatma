# Automatic R2 asset uploads

`.github/workflows/r2-upload.yml` runs after relevant changes reach `main`
(including merge, squash and rebase merges). Pull requests run the publication
tests and a credential-free, network-free source/manifest dry run. Publication
is restricted to `main`; neither PRs nor manually selected feature branches upload.
This replaces the branch-specific festival-art-publication workflow.

## One-time setup

Add repository Actions secrets in Settings → Secrets and variables → Actions:

| Name | Value |
| --- | --- |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | R2 S3 access key ID |
| `R2_SECRET_ACCESS_KEY` | R2 S3 secret access key |
| `R2_BUCKET` | Optional bucket name; defaults to `vedansh` |

Create an R2 **Object Read & Write** token scoped to the destination bucket.
The production custom domain `https://cdn.vedansh.app` must serve that same bucket.
Do not paste keys into workflow inputs, source files, manifests or chat.

Until all three required secrets are present, the publication step skips
successfully and lists missing secret **names** in the run summary. Invalid
credentials, failed uploads and CDN mismatches fail the run once configured.
Adding a secret does **not** generate a GitHub workflow event: after setup, use
Actions → R2 Upload → Run workflow → **main**, mode **publish**, collection **all**
to catch up immediately, or wait for the next relevant merge. There is no further
enable flag or code change. A manually selected **dry-run** never uploads.

## Publication contract

`scripts/r2-collections.json` maps the ten current runtime manifests to bounded
source folders: Kids Stories, audio, reading backgrounds, reader illustrations,
Suvichar, Daily Bhakti, Vidhi, festival heroes and both comic editions. The Vidhi
collection also reuses reader-illustration sources. Ayodhya sources live in its
preview assets directory; its edition directory has metadata, not image bytes.

`scripts/publish-r2-assets.mjs` validates **all selected collections before any
remote write**. A merged manifest is the publication allowlist: source files
without a matching manifest hash are not uploaded. Missing/stale source bytes,
invalid entries, unsafe paths and hash collisions abort. A source-only edit must
also include its reviewed candidate manifest; the script never regenerates one
from an arbitrary directory. Existing review/provenance and native gates remain.

Uploads retain `<prefix>/<first-16-SHA256>.<ext>` keys, deduplicate aliases and
skip PUT for existing objects. Both the legacy uploader and the workflow share
`scripts/r2-client.mjs`; only HEAD 404 permits PUT, auth/server failures abort,
requests have a 30-second timeout, and new objects have immutable cache headers.
Every public CDN object, including HEAD-skipped objects, is then GET-verified
against the **full source SHA-256** and content type. A failure leaves immutable
uploads available for an idempotent rerun, with partial evidence in the report.
Main publication runs are serialized and never cancel an in-flight publication.

Each relevant merge rechecks all registered collections, so assets skipped before
secrets were configured are caught up as well. The current source plan contains
567 unique object keys (some manifests have aliases), about 604 MiB of source
bytes. No app dependency install or native build is required by this workflow.

The job uploads source-plan and CDN-proof JSON artifacts, including the checked
commit, exact source paths/hashes and verification outcomes. It has only
`contents: read`: it does not write commits, change activation flags, merge PRs,
or publish OTA/native releases. A successful R2 run alone does not activate
hidden Parshuram/festival selections. Review the proof and integrate the verified
manifest/activation using the feature's existing publisher and release process.
Publication-pending manifest entries can upload without changing their state;
draft source files absent from a registered manifest remain excluded.

## Adding a collection or changing sources

Update the catalog, the manual collection choices, and the workflow's push/PR
path filters together. Keep source/review metadata and candidate hashes in the
same review. Run:

```sh
node --test scripts/tests/r2-*.test.mjs
node scripts/publish-r2-assets.mjs --dry-run
```

Use a selected collection for a bounded manual retry. Do not delete existing R2
objects: older installed runtimes may still reference their immutable keys.

## Validation evidence

PASS: publication tests exercise source planning, aliases/draft exclusion,
missing-secret skip, signed upload → public GET → idempotent rerun, auth/server
failures, stale/unsafe sources, CDN failures and full byte verification.
PASS: a dry run against the current repository resolves all ten collections.
PENDING: a credentialed GitHub publication and live CDN proof, intentionally
deferred until the user configures secrets. Language/size/native journeys are
N/A for this script/workflow change; no app UI or runtime data is changed.
