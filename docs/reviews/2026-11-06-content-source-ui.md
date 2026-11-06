# Content research UI audit — 6 November 2026

Initial base: `782aa84890c4c38d2df00866a522900f864a7949`. Integrated current main
`4778027cd08abd22f2dffb2bada959dbfceae262` after occasion correction PR #635 merged
during this task; all fourteen non-overlapping changed files match that remote
commit byte-for-byte, and both policy documents retain its additions. User supplied
Sanatan source/collection/hub screenshots and clarified that research sources
should not be presented as a product feature. This audit covers production
screens, components, Ask intents and share builders, including sibling surfaces.

## Findings and changes

| Surface | Found | Correction |
|---|---|---|
| Sanatan collections/readers | Source buttons/modal, large raw English publisher/edition/location cards; bibliography appended to shares | Remove both entry points, modal/helper and share bibliography. Preserve all 13×3 bilingual pages and internal source graph. |
| Sanatan layout | Prose typography in outline controls; repeated title panel around the main action; nested resume button; 44pt filters | Listing typography and growing labels, direct primary action, one resume target and 48pt filters. |
| Garud Puran | Expandable source/context disclosure with publisher comparison and Sanskrit reference list | Remove the disclosure; preserve full authored paragraphs and selected-reading identity. |
| Theerth details | Source/publisher footer | Remove footer; preserve complete temple narratives and reading actions. |
| Gita Saar stories | Bibliography section mixing research-only works and real reader links | Retain only real in-app scripture passages under a related-readings heading. No publisher/URL row. Preserve complete stories and actual Gita/Valmiki hand-offs. |
| Kids stories | Internal source/variant/editorial notes in final-page reading, auto-slide budgets and exported closing cards | Keep every scene, narration, dialogue, takeaway and app link. Remove only review notes; retain original four-language provenance in data. |
| Ask Vedansh | Four source-verified/PRD badges and a Katha answer containing copyright/research boilerplate | Remove badges; Katha answers show the actual reading's section count and reader action. Useful contextual/tradition notes remain. |
| Daan/Pitru Katha | A “Source:” prefix around a canonical work/passage | Keep the work/passage as teaching context without source-feature chrome; preserve in-app reader hand-offs. |

The scan also examined Daily Bhakti/Suvichar attribution, Daan's directory,
Pitru's verse-spine links, Vidhi/observance source boundaries, reading/share
components and canonical chapter/verse labels. Poet names, original-reflection
identity, scripture references and approved app-functional links are intentional;
no external bibliography is added. Image/audio `source` props, saved content
`sourceId` and release-hidden engine diagnostics are not research UI.

No scripture, editorial narrative, original artwork, source evidence, stable
content ID or saved/progress schema was removed. Research records remain available
to editorial review. This is a source-display audit, not a new factual verification
of every passage in the app.

## Prevention

RULEBOOK §11.16 now expressly prohibits public research features, including plain
non-clickable ones. Earlier “plain credits allowed” wording did not encode the
user's desired boundary. It is superseded, with corresponding design §76/77/81/87/89,
feature scope and wiki updates.

`contentSourceUiPolicy.test.ts` invokes `scripts/content-source-ui-policy.cjs`
through the existing full Jest/reader gate. The AST scan covers 379 public
modules, rejects known source disclosure labels, publisher footers, research-field
accesses, verification badges and PRD copy. Seven defect fixtures and a positive
canonical-identity/reader-link fixture exercise the guard. Running the same guard
against the original main versions reproduces **36 findings in eight files**;
current production modules pass. This finite detector complements actual render
and payload checks; it is not a guarantee against every future semantic variant.

Rendered/payload tests cover all thirteen Sanatan collections in Hindi, English,
Gujarati and Kannada at both app reading factors, exact page-door navigation,
source-free current-page/whole-lesson sharing, all kids-story narratives and
four-language share series, temple detail routes, Garud reading content, Gita
in-app hand-offs and Pitru/Daan teaching. These are component/logic checks, not
native visual acceptance.

## Evidence and limitations

Current integrated baseline: `d6fff46da437a97090729b55fcb1e92e756fd512` (#632),
including its catalogue fixes and reproducible native acceptance tooling. The
source smoke flow retains its offscreen-resume scroll fix while removing the
source-modal steps. The earlier calendar changes from #635 remain intact.

- PASS: final TypeScript check (`tsc --noEmit`), instruction entry-point check and
  `git diff --check`.
- PASS: widgets 46, engine 820, data 223 and Ask 49 tests, using each package
  script's exact test arguments through `node --import tsx --test` with
  `TZ=Asia/Kolkata`. No tests are skipped or weakened.
- PASS: fifteen native-tooling unit tests from current main. These test device
  selection, bounded diagnostics and capture collection, not a running app.
- PASS: focused rendered/payload suites; the 379-module source guard; 104
  collection/script/reading-factor combinations with exact page-door navigation;
  all kids-story narrative/share-series checks and retained scripture hand-offs.
- PASS: final full reader Jest suite, **356 suites / 3,511 tests**. Earlier runs
  reproduced three inherited Jest and three data-scope failures; integrating main
  #632 fixes them. The final run includes that exact catalogue fix.
- Literal `npm test` stops at tsx's IPC listener (`EPERM`) after typecheck in this
  environment. The script-equivalent Node invocations avoid only that CLI listener.
- Five task-modified Maestro flows parse. Native flow execution, iOS/Android
  screenshots, four scripts × Standard/Large, compact/system-text review, real
  share captures and playback acceptance remain PENDING. This Linux environment
  exposes no `maestro`, `adb` or `xcrun`; no installed-app visual acceptance is claimed.
- Observance verifier: IN PROGRESS on the integrated baseline.

The PR remains draft until required native checks pass. No merge, build, release,
version change, store submission or OTA is performed.
