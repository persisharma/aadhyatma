# Meta app-install measurement

## Implementation

`mobile/modules/meta-app-events` is a local Expo module linked on Android and iOS.
It uses only Meta's official native **Core** SDKs (18.0.0), not Login/Share SDKs.
`mobile/plugins/withMetaAppEvents.js` generates native configuration during Expo
prebuild. Native directories are ignored/generated; do not hand-edit them.

- Android: the native module initializes in the main process after navigation is
  ready and active. It logs only Meta's standard `EVENT_NAME_ACTIVATED_APP`, with
  no custom parameters. A native guard logs a cold-process activation and subsequent
  returns after at least 60 seconds in the background, avoiding quick-return duplicates.
  It deliberately does not register Meta's Activity/view observers. Install reporting
  uses the SDK 18 `FacebookSdk.publishInstallAsync` helper and its persisted install
  deduplication; this exported, testing-annotated compatibility binding is version-pinned.
- iOS: after navigation is ready, the JavaScript controller requests ATT only when
  undetermined/askable and the app is active. The native module independently reads
  ATT, enables advertiser-ID collection only when authorized, initializes once,
  and calls `AppEvents.shared.activateApp()` on foreground returns. On iOS 17+
  SDK 18 reads ATT directly; the older OS path also sets advertiser tracking enabled.
- SDK 18 needs explicit privacy guards: iOS disables AAM, Codeless Events, Suggested
  Events and their ML feature through the exported `_FeatureManager` compatibility
  API before initialization. The automatic-event flag alone does not prevent those
  server-enabled observers. Android avoids the lifecycle helper entirely because it
  starts those observers and its activation logger is suppressed when auto-log is off.
  Re-audit these SDK bindings and data paths before upgrading either pinned SDK.
- Both: automatic event inference/purchase logging and automatic initialization
  are disabled. No route observer, arbitrary event logger, user-ID/advanced-matching
  setter, birth details, scripture selection or practice-progress payload is exposed.
- Web, Expo Go and older binaries without the native module skip the JS integration.
  Permission/activation failures do not block the app opening.

Activation uses Meta's standard event, not a custom `first_open` event. Android's
session guard and iOS SDK session deduplication must still be checked on devices. This is not a
retention analytics backend or proof of paid attribution.

## Verified identifiers (7 October 2026)

| Identifier | Value | Evidence |
| --- | --- | --- |
| Meta app | `1128589089734962` | Published Vedansh app in Meta App settings |
| Authorized ad account | `999596959763990` | Meta App settings > Advanced |
| Owner | Vedansh, `4409123472748736` | Events Manager > Settings > Owner; app Roles says managed by Vedansh |
| Android package | `com.prashantsharma.vedansh` | Source and Meta Google Play configuration |
| Android activity | `com.prashantsharma.vedansh.MainActivity` | Meta and generated native source |
| iOS bundle | `com.prashantsharma.vedansh` | Source and Meta iOS configuration |
| iPhone Store ID | `6766086529` | EAS, visual Meta inspection, public Apple listing |

Apple listing: https://apps.apple.com/us/app/vedansh-gita-astrology-vrat/id6766086529

Some browser field reads were redacted; the initial false mismatch was resolved
by visually inspecting the actual iPhone Store ID. No Meta settings were changed.
Local Downloads contain older/candidate AABs, but they are not verified copies of
the currently distributed Google Play build. No production iOS IPA was inspected.

## Build configuration

Set in the local ignored `mobile/.env.local` or the appropriate EAS build environment:

```dotenv
META_APP_ID=1128589089734962
META_TRACKING_ENABLED=true
META_CLIENT_TOKEN=<SDK client token from Meta App settings / Advanced>
```

The real SDK client token was obtained for local testing and saved with file mode
0600 to `.env.local`. It is not committed, not an `EXPO_PUBLIC_*` variable, and is
not serialized into `extra`, public plugin options or the JS manifest. Native
resources necessarily contain the client token. **Never use the app secret.**

An enabled build rejects missing/invalid client configuration and an unexpected
Meta app ID. Unconfigured development builds default off. The EAS production
profile must explicitly choose `META_TRACKING_ENABLED=true` or `false`; enabled
builds require the client token. Use `false` to keep collection off until privacy
disclosures are ready or to prepare a release that deliberately disables collection.
Configure EAS variables separately for production and any preview/dev-sim profile
that should send activation. Use EAS visibility appropriate for a native SDK client
token and available during config resolution (sensitive rather than EXPO_PUBLIC).
No EAS environment variables were created remotely in this task.

```sh
cd mobile
npm ci
npx expo prebuild --no-install
cd ios && pod install
```

For Android install JDK 17 and the required Android SDK, then use `npx expo run:android`
or the generated Gradle project. For iOS use Xcode or `npx expo run:ios` after pods.
Use an actual native build, not Expo Go.

The generated Android project currently requires Android platform 36, build tools
36.0.0 and NDK 27.1.12297006 (React Native's version catalog). Configure the SDK
location through `ANDROID_HOME` or generated `android/local.properties`; do not
commit a machine-specific path. Gradle wrapper is 8.14.3.

The exact Core SDK AAR declares advertising-ID/AdServices attribution permissions.
Its unrelated `ACCESS_ADSERVICES_CUSTOM_AUDIENCE` permission is explicitly blocked
by the app config; existing blocked permissions are preserved. Inspect the final
merged manifest in the Android build and complete the corresponding Play disclosures.

## iOS privacy-preserving attribution

The generated plist contains Meta network IDs `v9wttpbfk9.skadnetwork` and
`n38lu8286q.skadnetwork`, sourced from the maintained Expo Meta integration plugin.
The native Core SDK handles its attribution registration. Presence of plist keys
does **not** prove SKAdNetwork postbacks, conversion schemas or campaign reporting.
Validate those with the future App Store campaign and current Meta configuration.
Denied/restricted ATT still permits app usage and the SDK's limited activation path;
never force IDFA collection or treat denial as authorization.

## Release requirements — no release performed

1. Finish Android/iOS native compilation and real-device tests below.
2. Update and review privacy disclosures before distributing an enabled build.
   The current Apple listing says **Data Not Collected** and its description says
   **no tracking**. The live website privacy policy does not describe Meta install
   measurement. Those claims cannot stay unchanged with an enabled SDK.
   `docs/meta-app-events-privacy-draft.md` supplies proposed language; nothing was
   published or changed in either store or the website.
3. Configure EAS build variables and confirm the registered app stays published
   and this ad account remains authorized. Do not reset the client token casually.
4. Choose a new store app version/runtime for the native SDK release. Runtime policy
   is `appVersion`: do not ship an OTA expecting this module in old store binaries.
   This task leaves app version/build counters unchanged pending release preparation.
5. Build Android and iOS store binaries with the new SDK. Upload/release through the
   normal reviewed Play/App Store flow only when explicitly authorized. An OTA cannot
   install this native dependency.
6. Verify real event receipt and paid acquisition attribution before scaling spend.

After those prerequisites, the production build commands are:

```sh
cd mobile
npx eas-cli build --platform android --profile production
npx eas-cli build --platform ios --profile production
```

These commands build; they do not authorize submission/publication. The existing
production profile auto-increments native build numbers from local version source.
Check the resulting package/bundle ID, SDK 18 linkage, privacy manifests, tracking
flag, SKAdNetwork IDs and new runtime before store submission. Store uploads,
review/submission, rollout, campaign publication and OTA publication are separate
actions and were not performed.

## Device and attribution verification

Open Meta Events Manager > Vedansh (`1128589089734962`) > Test Events, following its
current app-testing flow. Keep test screenshots/logs free of tokens and personal data.
The current Test Events UI requires the test phone to be logged into the Facebook
app; it does not require Facebook Login inside Vedansh. If that test identity flow
is unavailable, inspect ordinary dataset activity after a real-device activation
and allow for ingestion delay rather than treating an empty realtime panel as proof
of zero transport.

Android:
- Install the new native test build on a real Android phone. Cold-open, background,
  wait for a new SDK session and reopen. Confirm install/activation arrives in the
  intended data source, with no duplicate activation logger.
- Check normal navigation, reminders, audio, offline use and widget deep links.
- A sideloaded test cannot prove Play Install Referrer or paid install attribution.

iOS:
- Test clean install with ATT allowed and denied, restricted/not-askable state,
  app backgrounded during the prompt, and authorization revoked in Settings.
- Check that the app remains usable in every case and native advertiser-ID collection
  matches actual authorization. Simulator tests cannot establish real IDFA behavior.
- Confirm SDK activation receipt in the intended data source. ATT denial and aggregate
  attribution can change reporting; do not expect Android-like attribution.

Paid attribution requires a separately authorized monitored campaign and store
installation path. Compare Ads Manager installs with the measured cohort using the
selected attribution window. A test event proves transport, not paid attribution,
retention, ROAS or SKAdNetwork postback correctness.

## Local verification

- TypeScript: passed.
- Activation/compatibility Jest tests: 13 passed.
- Build-config Node tests: 4 passed.
- Static launch-graph checks: 2 passed; the existing byte budget was preserved.
- Expo prebuild: passed on both platforms; autolinking resolves the local module on both.
- Public Expo configuration: actual SDK client token absent (checked without printing it).
- Changed-file lint: passed; full project lint has a pre-existing display-name error in
  `KidsStoryReaderScreen.test.tsx`. Existing Expo dependency-version recommendations remain.
- Android build attempt: blocked at Gradle React settings plugin with installed Java
  `26.0.1`; JDK 17 and Android SDK/device tools are unavailable in this environment.
- iOS dependency installation: passed after recovering two missing unmodified
  podspecs through the official CocoaPods CDN redirect.
- iOS Debug simulator native build: passed. The installed app opens in isolated
  `Vedansh-Meta-Tracking-QA` (iOS 26.5); SDK privacy-guard entries were observed in its
  own preferences. This is not an App Store archive/signing or real-device result.
- SDK transport: simulator requests fail with `NSURLErrorDomain -1200` (TLS) to
  `ep2.facebook.com`. Host HTTPS to that domain succeeds; the simulator cause remains
  unresolved. No certificate validation or ATS protections were relaxed.
- Meta receipt: current dataset still says `Never received event`; realtime Test
  Events is empty. No successful install response was recorded in the test app.
- Real device: previously paired iPhone currently unavailable; no Android device detected.
- Paid attribution: unverified; campaign remains unpublished.

## Primary references

- Meta Android SDK: https://github.com/facebook/facebook-android-sdk
- Android activation implementation: https://github.com/facebook/facebook-android-sdk/blob/main/facebook-core/src/main/java/com/facebook/appevents/AppEventsLoggerImpl.kt
- Meta iOS activation: https://github.com/facebook/facebook-ios-sdk/blob/v18.0.0/FBSDKCoreKit/FBSDKCoreKit/AppEvents/FBSDKAppEvents.m
- Expo SDK 54 ATT: https://docs.expo.dev/versions/v54.0.0/sdk/tracking-transparency/
- Native Expo module API: https://docs.expo.dev/modules/module-api/
- Meta Expo plugin SKAdNetwork identifiers: https://github.com/thebergamo/react-native-fbsdk-next
- Apple ATT: https://developer.apple.com/documentation/apptrackingtransparency
- Apple SKAdNetwork: https://developer.apple.com/documentation/storekit/skadnetwork
