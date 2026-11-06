# Optional store update: native acceptance

Requested 6 November 2026 for PR #611. Automation is not a native PASS until the run and screenshots have been reviewed.

## Isolated fixtures

`native-store-update.yml` compiles unsigned iOS Simulator and local Android Emulator Release fixtures from the exact branch. `native-store-update-config.cjs` changes only that ephemeral checkout's app/native runtime version to 1.5.3, then 1.5.4. Expo updates stays enabled, with automatic fetching NEVER; no EAS command, signing credential, submission or OTA publication is used. Production version/configuration files are not committed by the runner.

The first runtime must display the real production sheet. The second is installed in place and must stay silent. This exercises actual native runtime configuration, not a mocked JS version. Both fixtures use the current native SDK; they do not establish OTA compatibility with a historical store binary or physical-device store installation.

The runner writes only dedicated simulator/emulator app storage, while the process is stopped, through the actual iOS AsyncStorage manifest and Android SQLite backend. Onboarding/What's New and competing asks are completed/declined fixtures. Positive display must create a new shown timestamp which is read back from native storage. No production test hook, runtime gate override or fake sheet is added.

## Matrix and evidence

- iOS: two available iPhone profiles, preferring compact SE/16e and a large Pro Max; exact device IDs/names are retained. Android: 320 and 440 dp widths at density 480.
- iOS fixtures are compiled once for each runtime, checksummed and shared by four independent profile × system-text jobs. Each consumer verifies the exact source head, Xcode toolchain, architecture and archive hashes before installing. Simulator runtimes must match the selected Xcode SDK; an installed newer simulator is not assumed compatible with an older XCTest toolchain.
- Hindi, English, Gujarati, Kannada × Standard/Large × standard/enlarged system text, on each profile.
- Visible controls, Later returning to Home, persisted cold restart, 71-hour suppression, 73-hour eligibility, and the shared daily limit.
- Update-now handoff: actual Safari/App Store hierarchy or Android activity intent evidence for the expected store host. A simulator/browser handoff is not a physical store installation.
- Real 1.5.4 native fixture must not show the sheet despite fresh eligibility storage.
- JUnit, screenshots, device logs, binary/configuration/toolchain identity and fixture binaries are retained as workflow artifacts. Derived build caches are excluded.

## Status

Initial run: [42204881206](https://github.com/persisharma/aadhyatma/actions/runs/42204881206), source `21f4e20d304d17e684666b00acea0f36e42cbe70`. Full CI on that head passed.

Android compiled its Release fixture. On the 320 dp profile, all 23 display, dismissal, native timestamp/cold-start, 71/73-hour cooldown, shared-slot, background/resume/Back and language/size flows passed. The store action opened Chrome, whose first-run welcome screen intercepted the URL; the external destination assertion correctly failed. The wider profile and native 1.5.4 cutoff were not reached. Initial compact screenshots were visually reviewed in all four languages and size combinations: actions remained reachable and visible Indic text was intact, but full-message verification still required actual scrolling.

The superseded iOS run successfully compiled the unsigned Release fixture with Xcode 16.4 and native runtime 1.5.3. On iPhone SE (3rd generation), iOS 18.5, its seven initial behavior flows passed (first display, Later/cold restart, 71/73-hour cooldown, shared daily slot, background/resume and lifecycle cold restart); the English first-display screen was visually reviewed. Its language matrix and wider/cutoff checks were not reached before cancellation. Per-case simulator execution/startup was slow enough to exceed the sequential job budget, so the complete matrix now runs in parallel from shared, verified fixtures. This partial run is not a full iOS PASS.

Harness corrections handle the isolated browser's welcome screens without an account, force real body scrolling (partially visible Text can satisfy accessibility visibility), assert removal of the fixed footer action, collect screenshots from Maestro 2.12's actual run directory, and check warm return from the store to Home. Each iOS consumer first checks XCTest readiness before exercising the immutable native fixtures.

Rerun pending. Inspect the exact workflow head, native build/driver result, each scenario and all screenshot text/controls before marking native accepted. A failed handoff, runtime check, screenshot or assertion remains a failure; bundle compilation and YAML parsing alone are insufficient.
