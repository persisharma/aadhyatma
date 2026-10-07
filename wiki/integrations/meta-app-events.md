---
title: Meta app-install measurement
type: integration
sources: [mobile/app.config.js, mobile/plugins/metaTrackingConfig.js, mobile/plugins/withMetaAppEvents.js, mobile/modules/meta-app-events/, mobile/src/utils/metaAppEvents.ts, mobile/src/utils/metaActivationController.ts, mobile/App.tsx, docs/meta-app-events.md, docs/meta-app-events-privacy-draft.md]
last_verified_date: 2026-10-07
confidence: high
status: current
---

## Summary

Vedansh has a build-gated local Expo module for Meta's native Core SDKs on Android
and iOS. It sends standard app activation/install measurement without exposing an
arbitrary event, user-data or feature-payload API. Code is implemented; Android
compilation, real-device event receipt and paid attribution remain unverified.

## Details

- `META_TRACKING_ENABLED` defaults off in unconfigured development. The production
  build profile requires an explicit `true` or `false`; enabled builds need the SDK
  client token. The token belongs in the ignored environment/EAS configuration, not
  `EXPO_PUBLIC_*`, public plugin options or Expo `extra`. Never use the app secret.
- App configuration/prebuild writes native identifiers, collection defaults and
  Meta SKAdNetwork IDs. Native directories remain generated/ignored. Both native
  Core SDKs are pinned to 18.0.0; Expo ATT is 6.0.8 for Expo SDK 54.
- Navigation readiness defers JS initialization until the app is usable. The shared
  controller serializes permission and foreground changes; web, Expo Go and old
  binaries without the module skip the integration.
- iOS requests ATT only when undetermined/askable and active. Native code reads
  actual ATT independently, allows advertiser-ID collection only when authorized,
  and uses `AppEvents.activateApp`. Denial/restriction does not block app usage.
- Android manually logs Meta's standard activation constant without custom
  parameters. A native guard handles cold starts and returns after 60 background
  seconds. SDK install reporting uses the exported SDK 18 install helper, avoiding
  the SDK Activity tracker's UI/metadata observers.
- Automatic purchase logging/inference is off. iOS explicitly disables AAM,
  Codeless Events, Suggested Events and their ML feature before initialization.
  Those version-pinned compatibility bindings require a source audit on SDK upgrades.
- Android explicitly blocks the Core SDK's custom-audience enrollment permission;
  advertising-ID/AdServices attribution permissions still require Play disclosures
  and final merged-manifest verification.
- Never add birth details, religious practice, scripture selections, reading
  progress, names, user IDs or other sensitive content to this bridge.

The authenticated Meta UI on 7 October 2026 verified app/data source
`1128589089734962`, owner Vedansh `4409123472748736`, authorized ad account
`999596959763990`, Android package and iOS bundle `com.prashantsharma.vedansh`, and
iPhone Store ID `6766086529`. These external settings can drift; reverify at release.

## Dependencies

[[overview]] — startup, Expo CNG and app-version OTA runtime policy.

`docs/meta-app-events.md` is the detailed configuration/release/device-test runbook.

## Gotchas

- A native SDK needs new store binaries and a new compatible app-version runtime;
  an OTA cannot install it. No store release, OTA or campaign publication was
  performed for this integration.
- Typecheck, 13 tracking Jest tests, four config tests, two startup-graph tests and
  both prebuild/autolinking checks passed. The iOS Debug simulator build passed and
  the app opened in an isolated simulator. This does not certify an App Store archive.
- Android compilation is blocked by the local Java 26/Gradle settings error and
  missing Android SDK; the generated project needs JDK 17, SDK 36/build tools
  36.0.0 and NDK 27.1.12297006.
- Simulator Meta requests fail with TLS error -1200 to `ep2.facebook.com`; the
  cause is unresolved. Host HTTPS works. TLS verification was preserved. Meta
  still reports never receiving events, and no successful install response was
  recorded locally. A physical-device test remains necessary.
- Test Events currently asks for Facebook-app login on the test phone. This is
  separate from adding Facebook Login to Vedansh, which this integration does not do.
- Privacy disclosures currently say no tracking/data collection and need revision
  before enabling a production release. A draft is prepared but not published.
- Test-event receipt proves transport only; store-install attribution, SKAdNetwork
  postbacks, retention and ROAS require separate verification.
