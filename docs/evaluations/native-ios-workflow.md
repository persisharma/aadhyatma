# Native iOS build and launch checks

`.github/workflows/native-ios.yml` adds a macOS job for widget/native changes and a manual Run workflow entry. It uses the repository's normal `npm ci`, clean Expo iOS prebuild, CocoaPods and a Release simulator build. No Expo token, Apple signing credential, version bump or store submission is involved.

The job compiles the host and embedded `VedanshWidgets.appex`, installs the host on an available iPhone simulator, launches it, verifies a running process after a bounded settling interval and captures screenshots. It also opens the existing Panchang widget URL cold and verse URL warm. Screenshots, build/launch logs, selected simulator details and the simulator app archive are retained as Actions artifacts for seven days. The simulator is shut down on completion/failure.

Local verification in this Linux session: shell syntax and workflow YAML parsing only. A passing workflow establishes native compilation and host launch, not Home Screen widget placement, visual correctness of the screenshots, all-language/size fit, signed-device App Group entitlements or exact refresh scheduling. Those checks remain separate and pending. The first workflow execution is needed to prove the generated project, simulator runtime and application launch.

Artwork review found a missing Hanuman subject and a Shiva face crop in the initial generated plates; their focal points were corrected and derivatives regenerated. The medium/large corrected derivatives were visually reviewed; installed Home Screen widget fit remains pending. This launch smoke does not validate Home Screen widget fit.

## First native execution — 2 November 2026

Run 41400434394, head 1010eb1: clean prebuild and CocoaPods passed; `native-build.log` ends with BUILD SUCCEEDED. The host plus embedded widget extension compiled, installation/initial launch passed, and `launch.png` shows the real onboarding sheet on the iPhone simulator. The smoke failed after the initial screenshot and before the cold Panchang screenshot; the exact failing command/crash cause is not established from the retained artifacts. The job-log connector returned a transport error.

The follow-up retains all smoke stdout/stderr, phase/exit/line information, simulator process/system logs, failure screenshot and available crash reports. The simulator archive is now saved immediately after installation, so a later route failure does not discard the working binary. Shell/YAML checks remain separate from the pending rerun. No product-crash fix is claimed without the failure evidence.
