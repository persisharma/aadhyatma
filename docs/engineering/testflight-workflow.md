# Signed iOS builds and TestFlight uploads

GitHub Actions → **iOS TestFlight build and upload** → **Run workflow**, on `main`.

- **build-and-submit**: enter a previously unused integer iOS build number greater than the committed `mobile/app.json` number and every previous TestFlight upload for this version. The current committed baseline is 75; do not assume 76 is unused without checking TestFlight. The helper applies the requested number in the ephemeral checkout, adds an inherited `ci-testflight` EAS profile with auto-increment disabled at both levels, and preserves app version, Android numbering and existing production settings. EAS builds a signed device binary, then submits that exact build UUID.
- **submit-existing**: enter an explicit EAS build UUID. This avoids spending another cloud build after a submission-only failure. The helper requires one finished, store-distribution iOS build in Vedansh's EAS project; it never selects “latest”.

The workflow is manual-only for outward actions. PRs, pushes and merges run pure helper tests; they do not build or upload. Running it is the per-build approval required by RULEBOOK §0.3. A failed EAS build is not retried automatically. Canceling a GitHub job may leave an already queued EAS build/submission running; check the EAS dashboard before any retry.

## Access required

1. Repository Actions secret `EXPO_TOKEN` for the Expo account with access to project `c83547c2-423c-4902-9087-a9ec9879a1f9`.
2. Existing EAS-managed distribution certificate and provisioning profiles for both `com.prashantsharma.vedansh` and its widget extension. Headless signing requires these to have been configured previously.
3. An App Store Connect API key assigned to this app in EAS Submit. `submit.production.ios.ascAppId` is already configured as `6766086529`. If a key is missing, configure it once with `eas credentials --platform ios` → production → App Store Connect → set up API key for EAS Submit. Never paste private keys/tokens into chat or commit them.

This workflow uses stored remote credentials; their presence and permissions have not been verified by the GitHub connector. A non-interactive EAS error is a setup blocker, not permission to retry a charged build. Merge the intended app/crop changes before starting a main build. Do not infer that an existing simulator check proves signed-device behaviour or full widget language/size fit.

Upload completion is distinct from Apple processing/TestFlight availability. The workflow does not send the app for public App Store review, publish OTA updates, build Android or create tester invitations. Install the processed build through the TestFlight app.

Local validation: pure helper tests and workflow YAML parsing. A signed EAS build, submission and iPhone installation remain pending; no cloud build quota was spent creating this workflow. EAS CLI is pinned to the verified npm version 27.2.0.

References: https://docs.expo.dev/build/building-on-ci/ ; https://docs.expo.dev/submit/ios/ ; https://docs.expo.dev/build-reference/app-versions/
