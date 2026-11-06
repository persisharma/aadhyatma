# Vrat title mark clipping — 6 November 2026

## Problem and acceptance

The supplied iPhone screenshot shows clipped upper marks on धनतेरस, कृष्ण प्रदोष
व्रत and कृष्ण द्वादशी व्रत in the Vrat landing's illustrated Today cards.
`ObservanceTodaySummary` overrode a shared token with 17pt text / 24pt leading
(1.41em), below the shipped Indic faces' approximately 1.53em mark-plus-descent
extent. The repository already documented the same 17/24 failure in design §3.0.
Its current Today specification already calls for 18/28 and 13/21.

Acceptance: complete first-line marks within each Text's bounds, full wrapping
titles, readable expandable descriptions, enabled OS scaling and intrinsically
growing cards. Retain artwork, event IDs/dates, save/reminder and reading actions,
navigation and the two in-app reading-size presets.

## Implementation and sibling audit

- Today uses catalogTitle 18/28, catalogMeta 12/20 and catalogBody 13/21 directly.
  No local tight-leading override, negative margin, auto-fit or scale disabling.
- ListingCard's Indic title/eyebrow/body/section tokens now reserve >=1.55em.
  Bilingual secondary captions use catalogBody; ObservancePreviewCard's row/tile
  dates and countdowns use catalogMeta. These slots can also render Indic text.
- Audited ListingCard's story/comic/Garud, Katha, My Vrat, category/search and
  followed-muhurat callers. Shared token consumers in KidsStoryDeityScreen and
  SuvicharEntryCard/PresetPicker inherit the slightly taller line boxes.
- ObservanceDetailHero uses natural leading and no fixed title height. The
  noncompact Panchang observance title also uses natural leading. No changes to
  their titles, calculations or route/state behavior are required for this defect.
- design §82, RULEBOOK's listing contract and Panchang wiki record the invariant.

## Evidence

Base: `aba14c15a329bfb565ac62f6331a81a82987f5af`.
Branch: `codex/vrat-title-mark-clipping`. Tested runtime/source head:
`fb266877855a935ee10c83670bb7d1a8bae4020a`. A later documentation-only
checkpoint records the final results below. Publication and draft PR creation
were explicitly authorized on 6 November 2026. The PR records its exact remote
head, readback and CI status; native visual acceptance remains pending.

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| U1 current source | PASS | Current main, AGENTS/checklist, CLAUDE/rules, RULEBOOK/design, language/Panchang wiki; no open overlapping Vrat typography PR found. |
| U2 acceptance | PASS | Concrete screenshot titles, first-line containment, expansion and full wrapping criteria above. |
| U3 native design fidelity | PENDING | Tokens match the existing 18/28 and 13/21 design; installed native screen not available. |
| U4 languages and sizes | PASS source / PENDING native | 48 rendered-style combinations: hi/en/gu/kn × M/L × 320/390 logical width × system scale 1/1.3/2; plus all three reported titles. Renderer asserts actual styles and retained scaling/wrapping, not glyph shaping or native layout. |
| U5 journey | PASS focused / PENDING native | Existing sibling save/open/edit and expansion tests pass; parameterized Maestro adds landing → expand → search → detail → Back. Installed execution remains pending. |
| U6 lifecycle/state | N/A runtime changes | No storage, async work, network or lifecycle mutation. Existing app suites exercise these boundaries separately. Native route/state acceptance is still pending under U5. |
| U7 assets/content | N/A changes | No asset/content/registry/CDN/date changes; existing artwork is retained. |
| U8 recurring class | PASS source | Shared listing tokens and bilingual/date sibling slots audited and protected by token and rendered-style tests. |
| U9 regression/full suites | PASS automated / PENDING native | Before production edits all 51 CatalogTypography cases failed on unsafe lines/17/24 overrides; after edits all 51 pass. Four focused suites pass 79 tests. All 346 Jest suites / 3,380 tests plus widget/engine/data/Ask pass. |
| U10 performance/data | PASS source / PENDING native layout | No new runtime import, asset or persisted ID; no calculation changes. Native compact/system-text reflow remains pending. |
| U11 integration/docs | PASS source / PENDING CI | Based on main above; design/RULEBOOK/wiki updated. Remote integration/CI status is recorded in the PR. |
| U12 durability | PASS local / remote evidence in PR | Source, tests and docs committed; branch readback and PR head are recorded in the PR. Local dependency link is excluded; no required untracked asset. |

Conditional: C9 applies (shared typography and native accessibility). C1–C8 and
C10 add no content, calculation, playback, reminder, sharing or release behavior;
relevant catalog route checks are included under U5. No build, OTA or merge.

### Commands and limits

- Focused Jest: CatalogTypography, ListingCard, ObservancePreviewCard and
  CatalogLandingPanels: **4 suites / 79 tests pass**.
- `npm test`: typecheck passed, then the tsx CLI's optional Unix socket failed
  with `EPERM` before widget tests. Unchanged widget/engine/data/Ask commands are
  re-executed with `node --import tsx --test` over exactly the same test files,
  avoiding that CLI socket. No test/gate is skipped or weakened.
- Widget: **46/46 pass**; engine: **630/630 pass**; data: **218/218 pass**;
  Ask: **49/49 pass**. `npm run test:readers`: all **346 suites / 3,380 tests pass**
  across three shards (1,204 + 1,260 + 916), including the new token guard and
  rendered-style suite. Total automated assertions across these groups: **4,323**.
  Final `npm run typecheck`: PASS, exit 0. No tests skipped.
- `node scripts/verify-agent-instructions.mjs`: PASS.
- Maestro document parses as two YAML documents: PASS (syntax only).
- `npm run test:e2e:flow -- .maestro/vrat-title-clipping.yaml`: could not start;
  `maestro: not found`. No iOS simulator/Android emulator or native captures.

## Required native matrix / handover

Run `maestro test -e LANGUAGE=Hindi -e READING_SIZE=Standard
.maestro/vrat-title-clipping.yaml` on a development build connected to this
worktree's Metro, repeating for English/Gujarati/Kannada and Large. Repeat on
compact iOS/Android phones with enlarged OS text, then inspect every captured
first line and independent action. Today is date-dependent: the flow conditionally
captures an available Today card, and the landing capture explicitly permits
reviewers to identify a missing Today fixture. To match all three reported cards,
use the reported 6 November 2026 date/location in the test device. Do not treat
accessibility-tree visibility, YAML parsing or rendered-style tests as pixel QA.
Keep the PR draft until required CI/native evidence is complete. No merge or
release is authorized.


## Integration with current main

Main advanced to `1b77c101594991b41b683fcf0cbba69d93acd61f` while PR #625 was
being published. Integrated that Doha change, preserving both sets of documentation
and resolving the append-only wiki log. No Vrat runtime/test file overlaps main.
The 4,323-test full result above belongs to the original base/tested head. Focused
card/typography and Doha integration regressions plus typecheck are rerun after
integration; the PR records their final outcome and exact remote head. Full CI and
native visual acceptance remain pending. The branch stays draft.
