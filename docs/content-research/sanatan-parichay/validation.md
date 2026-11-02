# Validation and handover

Research state: draft. Documentation-only change. No app integration, native build, merge or release.

## Reproduce structural checks

Run from any checkout:

```sh
python3 docs/content-research/sanatan-parichay/validate.py
```

The checker validates source/topic IDs, required metadata, 13 collections, 201 topics, evidence statuses, existing-deity coverage, FAQ count, rosters, arithmetic, Markdown targets/anchors and basic text hygiene. It does not validate religious truth, source independence, translation quality, rights or artwork.

Executed successfully: **PASS, 2,324 structural checks, zero errors**. Counts: 107 source records, 201 topics, 13 collections and 44 FAQ entries. These checks establish document consistency only.

## Engineering evidence

| Check | State | Evidence |
| --- | --- | --- |
| U1 Scope/source of truth | PASS | PRD, current policies and three existing data files consulted; religious references recorded individually. |
| U2 Acceptance | PASS | Every PRD collection has a dossier; units have explicit evidence status and publication gaps. |
| U3–U6 Native design/language/journey/lifecycle | N/A | No runtime or UI changes. |
| U7 Content integration | N/A | Research remains outside app payloads. Publication verification remains pending. |
| U8 Related surfaces | PASS | Existing deity registry, eight essays and generic graha reference audited for reuse. |
| U9 Unit/integration/E2E/native | PENDING | App suites and native journeys not executed; RULEBOOK §0 evidence not claimed. Draft PR remains draft. |
| U10 Performance/saved data | N/A | No production data, imports, assets or persisted identities changed. |
| U11 Branch integration | PASS | Remote comparison of c03866f against the current PR base reports 22 documentation paths only; PR is mergeable and remains draft. Branch is one base commit behind main; no rebase or merge performed. |
| U12 Preservation | PASS | Full research commit c03866f721d039542dce066ef70e02abb4929387 verified remotely; all 21 authored files matched the intended content exactly. This final handover edit is a separate documentation checkpoint. |

Conditional C1/C2 content and illustration concerns are addressed as research notes; publication collation, artwork and actual reader checks remain pending. Other runtime conditional groups are N/A for this documentation-only pass.

## Source and editorial verification

Two independent authoritative publications, Sanskrit collation, complete-story review and language/rights review remain required for shipped content under RULEBOOK §11. No source-count or JSON-check result substitutes for these gates. See [remaining checks](13-editorial-decisions-and-gaps.md).

## Remote record

- Repository: persisharma/aadhyatma.
- Branch: codex/sanatan-parichay-draft.
- PR: [#605](https://github.com/persisharma/aadhyatma/pull/605), draft.
- Scope checkpoint: ae12c6e4925550e303d02fd366ddc5e0c76f7b1d.
- Early research checkpoint: 1e1547185f80ea7e2bb012176f25370091a6b747.
- Full research checkpoint: [c03866f721d039542dce066ef70e02abb4929387](https://github.com/persisharma/aadhyatma/commit/c03866f721d039542dce066ef70e02abb4929387), verified with 21/21 exact file readbacks.
- PR at that checkpoint: draft, mergeable, 22 documentation-only changed paths. No pull-request workflow runs were listed.
- The final handover commit is reported in the PR after verification; this document records the verified full research checkpoint without attempting to embed its own SHA.

design.md and RULEBOOK have no new UI/integration contract to document in this pass; the repository's design-doc-sync rule exempts docs-only changes.
