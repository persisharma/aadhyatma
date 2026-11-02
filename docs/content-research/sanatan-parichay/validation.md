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
| U11 Branch integration | PENDING | Final remote docs-only diff and PR status must be checked after commit. |
| U12 Preservation | PENDING | Initial research checkpoint was preserved remotely; final research commit/readback must be verified. |

Conditional C1/C2 content and illustration concerns are addressed as research notes; publication collation, artwork and actual reader checks remain pending. Other runtime conditional groups are N/A for this documentation-only pass.

## Source and editorial verification

Two independent authoritative publications, Sanskrit collation, complete-story review and language/rights review remain required for shipped content under RULEBOOK §11. No source-count or JSON-check result substitutes for these gates. See [remaining checks](13-editorial-decisions-and-gaps.md).

## Remote record

- Repository: persisharma/aadhyatma.
- Branch: codex/sanatan-parichay-draft.
- PR: [#605](https://github.com/persisharma/aadhyatma/pull/605), draft.
- Scope checkpoint: ae12c6e4925550e303d02fd366ddc5e0c76f7b1d.
- Early research checkpoint: 1e1547185f80ea7e2bb012176f25370091a6b747.
- The final research commit is reported in the PR's handover after verification; a document cannot embed its own Git commit SHA without changing that SHA.

design.md and RULEBOOK have no new UI/integration contract to document in this pass; the repository's design-doc-sync rule exempts docs-only changes.
