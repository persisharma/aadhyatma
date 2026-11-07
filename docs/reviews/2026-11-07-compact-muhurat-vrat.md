# Compact Panchang muhurats / illustrated Vrat cards

Base: `626b821649226c5f00cb5043e587779a6f77c462` (main after #646), retaining #641's Panchang responsiveness fix. Initial implementation: https://github.com/persisharma/aadhyatma/pull/647 (merged while final review was still running). This follow-up completes script-date typography, action leading, native flow coverage and synchronized documentation. Approved reference: first “Festive compact” proposal in `compact-muhurat-approved-reference.html`; user: “Yes works build”. Other proposals in the reference are unselected. Implementation is app code, not the HTML preview.

## Acceptance and integration

- One compact parchment card in Panchang, all calculated occasion windows without a row cap. Native-wrapping complete titles, 36dp existing painted motifs, delicate floral corners and distinct timing hierarchy. Stack at compact/large/system text and across dates.
- The full illustrated cards live in Vrat. The summary action carries the selected civil date and catalog mode; a fresh dated entry clears an old search and scrolls to the cards. Detail uses the occurrence's own date and Back retains Vrat. Search/category/reminder/katha routes remain available.
- Preserve selected city/calendar/lenses and source conventions, previous-day Nishita and next-day labels. Guidance-only occasions never invent clocks. No new timing recipes, content IDs, images, dependencies or migrations.
- Full/focused sharing still uses the existing payload/readiness pipeline. Full Panchang share waits for complete timing data; painting download does not gate screen actions. Failure Retry, empty days and guidance-only days remain reachable.
- Sibling surfaces inspected: `MuhuratDetailScreen`, `ObservanceDetailScreen` retain illustrated cards. `TabNavigator` mounts independent Panchang and Vrat instances; `PanchangHome` already accepts `dateMs` and `initialTab`.

## Automated evidence

Focused initial checkpoint: 34 tests PASS. Covers hi/en/gu/kn × Standard/Large × 320/390dp, simulated system scale 1.3 on compact, complete times/names, overnight dates, every prahar, no fabricated guidance clocks, empty/error/retry, summary-to-dated-Vrat/detail/share payload separation and module lazy evaluation. These are rendered-style/interaction tests, not native pixel evidence.

Final local evidence (same production code as this follow-up):

| Check | Result | Evidence / limitation |
| --- | --- | --- |
| Typecheck | PASS | `npm run typecheck`, exit 0 |
| Widget gate | PASS | 46 tests, part of full `npm test` attempt |
| Engine | PASS | 822 tests, including bounded/yielding occasion lookup |
| Data | PASS | 223 tests after bringing required tracked provenance fixtures into the checkout |
| Ask | PASS | 49 tests |
| Affected components / routes / exports | PASS | 54 tests; six suites, all four scripts and both reading sizes, compact/system scale, per-item share and overnight detail date |
| Reader shard 1 | PASS | 123 suites / 1,270 tests |
| Reader shards 2 / 3 | FAIL locally | 3 / 7 suites failed: missing unrelated art/review fixtures or font files and WebView ESM parsing in this reused dependency installation. No assertions weakened or failed checks labelled PASS. Initial #647 hosted reader gate passed with a full checkout/fresh install. Follow-up CI required. |
| Agent entry-point policy | PASS | `node scripts/verify-agent-instructions.mjs` |
| Native flow syntax | PASS | Both changed Maestro YAML files parsed; source clock expectations preserved |
| Native visual / actual OS share / ANR profiling | PENDING | No native runtime tooling available; see matrix below |

The plain `npm test` run was attempted; it stopped at reader failures. The remaining independent gates and reader shard 3 were run separately. A temporary external npm shell adapter replaces only the `tsx` launcher with `node --import tsx` to avoid this container's IPC socket restriction; it does not alter source, tests or assertions. No claim that the complete local npm suite passed.

## Performance trace and remaining native gates

The summary imports only the existing bundled ritual atlas/corners, theme/type/localization helpers and the pure formatter. `OccasionSection` dynamically requires the illustrated module only in the Vrat view; its regression proves summary mounting does not evaluate that module. The calendar hook cancels occurrence tasks when unfocused or in Jyotish. The existing measured-frame/deferred-art mechanism, bounded two-request image queue, timeout and cancellation remain unchanged.

No CPU solves were added to render; flatten/map is bounded by the day's returned windows. The #641 yielding day matcher and async selected-day inputs are retained. This change does not make timers or InteractionManager into worker threads. It does not establish that all remaining Panchang work is free of stalls.

PENDING before readiness: installed iOS/Android hi/en/gu/kn Standard/Large, 320dp/enlarged system text, complete matras/long labels, repeated same-date handoff after search, tab/Back taps while cold timing work is pending, date/city/calendar changes, offline/error/retry, background/foreground, full/focused actual native PNG + OS share sheet and lower-configuration Android release-mode responsiveness/frame/memory/logcat/ANR evidence. No adb/emulator/Maestro/Xcode available in this environment; authored YAML is not executed native verification. Keep this follow-up PR draft until required checks pass. #647 was observed merged; no OTA/store release was performed here.
