# Optional store update: native acceptance

Requested 6 November 2026 for PR #611. Automation is not a native PASS until the run and screenshots have been reviewed.

## Isolated fixtures

`native-store-update.yml` compiles unsigned iOS Simulator and local Android Emulator Release fixtures from the exact branch. `native-store-update-config.cjs` changes only that ephemeral checkout's app/native runtime version to 1.5.3, then 1.5.4. Expo updates stays enabled, with automatic fetching NEVER; no EAS command, signing credential, submission or OTA publication is used. Production version/configuration files are not committed by the runner.

The first runtime must display the real production sheet. The second is installed in place and must stay silent. This exercises actual native runtime configuration, not a mocked JS version. Both fixtures use the current native SDK; they do not establish OTA compatibility with a historical store binary or physical-device store installation.

The runner writes only dedicated simulator/emulator app storage, while the process is stopped, through the actual iOS AsyncStorage manifest and Android SQLite backend. Onboarding/What's New and competing asks are completed/declined fixtures. Positive display must create a new shown timestamp which is read back from native storage. No production test hook, runtime gate override or fake sheet is added.

## Matrix and evidence

- iOS: two available iPhone profiles, preferring compact SE/16e and a large Pro Max; exact device IDs/names are retained. Android: 320 and 440 dp widths at density 480.
- Hindi, English, Gujarati, Kannada × Standard/Large × standard/enlarged system text, on each profile.
- Visible controls, Later returning to Home, persisted cold restart, 71-hour suppression, 73-hour eligibility, and the shared daily limit.
- Update-now handoff: actual Safari/App Store hierarchy or Android activity intent evidence for the expected store host. A simulator/browser handoff is not a physical store installation.
- Real 1.5.4 native fixture must not show the sheet despite fresh eligibility storage.
- JUnit, screenshots, device logs, binary/configuration/toolchain identity and fixture binaries are retained as workflow artifacts. Derived build caches are excluded.

## Status

Execution pending. Inspect the exact workflow head, native build/driver result, each scenario and all screenshot text/controls before marking native accepted. A failed handoff, runtime check, screenshot or assertion remains a failure; bundle compilation and YAML parsing alone are insufficient.
