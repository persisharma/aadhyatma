# Platform-specific OTA releases

Run **OTA Push** in GitHub Actions with an explicit platform (`ios`, `android`,
or `all`), runtime version, channel and message. The workflow defaults to `ios`.
It tests the publishing wrapper before using the repository's `EXPO_TOKEN` secret.
Pull requests and main pushes touching the workflow/wrapper run tests only.

`PLATFORM=ios CHANNEL=preview ./push.sh "Release message"` publishes only iOS.
Direct script callers retain the legacy `all` default when PLATFORM is unset;
an empty or invalid explicit platform is rejected before EAS is invoked.
Run `node --test scripts/tests/ota-push.test.mjs` for isolated command tests;
the fake publisher captures arguments without network access or credentials.

For the requested iOS 1.5.3 TestFlight update, select `ios` and runtime `1.5.3`,
then verify the EAS channel embedded in the actual installed TestFlight build.
TestFlight is a distribution mechanism, not a distinct OTA channel. An iOS OTA
also reaches App Store builds with the same channel and runtime. Select an
isolated channel already embedded in the build when tester-only delivery is needed.

Compare native dependencies/configuration with the target binary before publishing.
The temporary app version override selects a runtime; it does not establish native
compatibility. Follow RULEBOOK §0.3. This workflow change does not publish a release.
