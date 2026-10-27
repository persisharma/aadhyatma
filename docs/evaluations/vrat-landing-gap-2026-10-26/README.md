# Vrat landing-page gap review

Reviewed main `5944bb87f38546c4beb2249c6fa923b4755d9e36` against the approved main landing-page concept. PR #542 has merged; its functional lists, real subject portraits and cache integration are retained. Earlier iOS captures in `../vrat-deity-artwork-2026-10-26/` are evidence of that earlier version, not this layout completion.

| Area | Main at review | Completion |
| --- | --- | --- |
| Today | 76pt square portrait, description and actions beneath | Split hero with 36%-width painting, text/actions alongside, independent description expansion |
| Upcoming | Fixed 184pt tiles with an 80pt portrait | Adaptive 144–184pt tiles, full-width 1.5:1 artwork panels, wrapping dates/countdowns |
| Catalog selection | Shared saffron-tinted selected pill | Scoped maroon catalog selection; calendar/Jyotish sky remains unchanged |
| Browse tiles | 42pt subjects, compact layouts | 60pt paintings (44pt on narrow phones), chevrons and script-safe metadata |
| Search | Plain field and Latin default face | Magnifier and script-aware search face |
| Existing behavior | Stars, filters, linked readings, dates and portrait identities landed | Preserved; no calendar-rule, portrait source, manifest or global-icon replacement |

`ObservanceArtwork` keeps its square default geometry. Rectangular panels retain every subject in a composite and the reviewed focal crop for branded masters such as Ahoi. Single reader scenes use edge-clamped focal framing; this matters for off-centre subjects such as Vishnu, which a plain centered cover would cut out of the tall hero.

Validation results are recorded in the pull request. New tests cover reading/description action separation, panel source identity, off-centre framing, Ahoi framing, all named composite panes, default list geometry, four-language category destinations and contrast on the new surfaces. The existing Maestro flow now includes expansion/collapse when a Today card is available.

Fresh native visual acceptance is pending: this environment has no iOS/Android simulator or Maestro. A browser component preview was attempted, but no browser executable is installed and the browser download failed; no new screenshot is presented as native proof. Review Standard/Large and enlarged OS text on both platforms before marking the PR ready. Preserve the existing portrait acceptance rather than claiming pixel-identical reuse of the generative mockup's different paintings. No release build or OTA was started.

## Validation outcome

- TypeScript, changed-component ESLint and diff checks pass.
- Six focused suites pass, 63 tests, covering the landing/list interactions, source/portrait framing, four-language destinations, contrast and doc/token sync.
- Pure suites pass: 37 widget, 621 engine, 218 data and 49 Ask tests (invoked through `node --import tsx` because the CLI IPC socket is unavailable here).
- Broader Jest runs pass 2,706 test cases after restoring the existing sparse-checkout review fixtures. Three reader suites cannot load `react-native-webview` ESM (`readerReadAloud`, `readerProgressBar`, `ChalisaReaderScreen`). The same three failures reproduce in an unmodified checkout of main `5944bb8`; they are not introduced by the landing changes.
- Standard/Large native and enlarged OS-text walkthroughs remain pending. No fresh native screenshot or release-readiness claim is made.


## Reference and shared-card correction

The user supplied the two original illustrated references and requested reuse of the Kids Stories listing treatment. The follow-up in `docs/evaluations/vrat-reference-rebuild-2026-10-26/` supersedes the earlier rectangular-wrapper geometry: Vrat now renders `ListingCard`, with explicit event-scene overrides and fresh native evidence. Header/search improvements from this draft remain. Refer to the newer QA report for current validation and limitations.
