# Sanatan native acceptance run

User explicitly requested native verification on 6 November 2026. PR #624 contains the actual RN implementation. Prior automated/browser evidence is separate from this run.

The local Linux workspace has no adb, emulator, Maestro, Xcode or KVM. The added `Native Sanatan acceptance` Actions workflow uses the repository's existing unsigned iOS Release simulator build script on macOS, and an Android API34 x86_64 emulator on Linux. It never invokes EAS, signing, store submission or OTA. The checked-out PR head is recorded in the artifacts.

Both platforms exercise saved/search/Back/cold-resume, Hindi/English/Gujarati/Kannada × Standard/Large at default and enlarged OS text, plus all13 collection paintings and reader/diagram contexts. Android uses a320dp viewport. iOS records the actual available simulator selected by the existing compact-device preference. Simulator coverage is not physical-device acceptance. The matrix captures Home, grouped rows, overview, first reading page and diagram; all-collection captures exercise the complete painted family.

The native driver results and screenshots must be inspected before claiming native visual acceptance. Each workflow artifact retains JUnit, logs, tested head and captured images; iOS additionally retains its compiled simulator app. A parsed YAML file is not an executed native result. Failures remain visible, and debug artifacts are uploaded even when a later step fails. No retries or fake passing screenshots are built into the runner.

Run status: pending execution and screenshot review. The PR remains draft. Record actual Actions run/platform results and findings here or in the PR when available.
