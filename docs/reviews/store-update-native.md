# Optional store update: native acceptance

Requested 6 November 2026 for PR #611. Automation is not a native PASS until the run and screenshots have been reviewed.

## Isolated fixtures

`native-store-update.yml` compiles unsigned iOS Simulator and local Android Emulator Release fixtures from the exact branch. `native-store-update-config.cjs` changes only that ephemeral checkout's app/native runtime version to 1.5.3, then 1.5.4. Expo updates stays enabled, with automatic fetching NEVER; no EAS command, signing credential, submission or OTA publication is used. Production version/configuration files are not committed by the runner.

The first runtime must display the real production sheet. The second is installed in place and must stay silent. This exercises actual native runtime configuration, not a mocked JS version. Both fixtures use the current native SDK; they do not establish OTA compatibility with a historical store binary or physical-device store installation.

The runner writes only dedicated simulator/emulator app storage, while the process is stopped, through the actual iOS AsyncStorage manifest and Android SQLite backend. Onboarding/What's New and competing asks are completed/declined fixtures. Positive display must create a new shown timestamp which is read back from native storage. No production test hook, runtime gate override or fake sheet is added.

## Matrix and evidence

- iOS: two available iPhone profiles, preferring compact SE/16e and a large Pro Max; exact device IDs/names are retained. Android: 320 and 440 dp widths at density 480.
- iOS fixtures are compiled once for each runtime, checksummed and shared by four independent profile × system-text jobs. Each consumer verifies the exact source head, Xcode toolchain, architecture and archive hashes before installing. Simulator runtimes must match the selected Xcode SDK; an installed newer simulator is not assumed compatible with an older XCTest toolchain.
- Driver-only fixes may reuse immutable fixture archives only when the full mobile Git tree fingerprint matches the compiled source, excluding Maestro flows and the explicitly listed UI driver/state-seeding files. Native build scripts, fixture configuration, dependencies, plugins, modules, assets and application code remain in the fingerprint. Source head and consumer head are recorded separately; toolchain, architecture and archive hashes must match. A cache miss or invalid archive falls back to a fresh compilation.
- Hindi, English, Gujarati, Kannada × Standard/Large × standard/enlarged system text, on each profile.
- Visible controls, Later returning to Home, persisted cold restart, 71-hour suppression, 73-hour eligibility, and the shared daily limit.
- Update-now handoff: actual Safari/App Store hierarchy or Android activity intent evidence for the expected store host. A simulator/browser handoff is not a physical store installation.
- Real 1.5.4 native fixture must not show the sheet despite fresh eligibility storage.
- JUnit, screenshots, device logs, binary/configuration/toolchain identity and fixture binaries are retained as workflow artifacts. Derived build caches are excluded.
- Each iOS batch uses one XCTest session for 18 scenarios and both native runtimes. A loopback-only host helper performs the same process-stopped native-storage setup and verified fixture installation between UI subflows; it is outside the app. The aggregate JUnit must pass, the exact ordered scenario-completion list must match, both native timestamp reads must pass, and all 28 expected screenshots must exist. Startup recovery is limited to an XCTest timeout before the first fixture seed, with at most three attempts; product assertions and partially executed batches are never retried.

## Reviewed results — 6 November 2026

Production implementation tested: `181de37554f7209f95857ae1b1239a7cc3d1b504`. Later driver-only consumers verify the same complete production-input fingerprint and immutable binary hashes. Latest driver head: `05cd646fe52bd7bf5db58df3163dd86d67775c04`; full CI passed in [42220009127](https://github.com/persisharma/aadhyatma/actions/runs/42220009127).

| Check | Result | Evidence |
| --- | --- | --- |
| Android actual Release fixtures | PASS | [42211025918](https://github.com/persisharma/aadhyatma/actions/runs/42211025918), artifact `13500975919`; 52/52 Maestro flows |
| Android visual matrix | PASS | 32/32 cells reviewed: 320/440 dp, hi/en/gu/kn, M/L, standard/enlarged system text; top and actual body end |
| Android optional behavior | PASS | Later, Back, background/resume, cold restart, 71-hour suppression, 73-hour eligibility, shared launch slot, four native SQLite shown-time reads |
| Android destination and cutoff | PASS | Actual Google Play Vedansh listing, expected package URL, warm return Home; installed native 1.5.4 stays silent on both profiles |
| iOS native compilation/configuration | PASS | Both Release fixtures compiled at the source head above, Xcode 16.4 / matching iOS 18.5; CFBundleShortVersionString and EXUpdatesRuntimeVersion verified separately for 1.5.3 and 1.5.4 |
| iOS behavior on native 1.5.3 | PASS | Seven initial behavior scenarios on compact and wide profiles: first display, Later/cold restart, 71/73-hour cooldown, shared daily slot, background/resume/dismiss and lifecycle cold restart; native AsyncStorage shown-time reads |
| iOS standard-system visual matrix | PASS | 16/16 cells reviewed across SE (3rd generation) and iPhone 16 Pro Max: hi/en/gu/kn × M/L, top/body-end, complete visible copy and reachable actions |
| iOS enlarged-system complete matrix | PENDING | Earlier compact attempt passed behavior but failed an impossible 100%-visible paragraph assertion. Latest flow uses real upper-body swipes, partial paragraph visibility and body-end screenshots. Do not count authored correction as native PASS |
| iOS App Store handoff | FAIL / unresolved destination | Update action leaves Vedansh and opens Safari, which displays “Safari cannot open the page because the address is invalid.” Expected destination assertion fails. Simulator evidence does not prove a successful physical App Store handoff |
| iOS warm return and native 1.5.4 UI cutoff | PENDING | These run after the failed destination assertion and have not been reached in a completed batch. Native 1.5.4 configuration alone is not UI verification |

Reviewed iOS standard evidence: [42215570223](https://github.com/persisharma/aadhyatma/actions/runs/42215570223), wide artifact `13504060308`; [42218751709](https://github.com/persisharma/aadhyatma/actions/runs/42218751709), compact artifact `13503243520`. Each completed seven behavior and eight language/size scenarios before the handoff failure. Raw Maestro screenshots, per-case/aggregate results, actual storage reads, native configuration and failure hierarchy are retained with these artifacts.

The configured Apple ID `6766086529` matches the public [Vedansh listing](https://apps.apple.com/in/app/vedansh-gita-astrology-vrat/id6766086529). That source check does not establish device handoff. Verify Update now → the correct listing → return to Home on a physical iPhone; investigate the Safari failure if it reproduces there.

Latest driver run: [42219998499](https://github.com/persisharma/aadhyatma/actions/runs/42219998499). It was still running when this checkpoint was recorded; no pending job is counted as passed. Prior infrastructure failures included CoreSimulator/XCTest launch failures and lost connections after harness reboots. Driver batching now keeps one XCTest session and the simulator booted; initial-startup-only recovery does not retry product assertions or partially executed batches.

PR remains draft. Full iOS native acceptance is incomplete. No store release, OTA publication or production version change was performed. Historical-store-runtime OTA compatibility and physical store installation remain separate rollout checks.
