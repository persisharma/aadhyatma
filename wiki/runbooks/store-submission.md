---
title: Store listing preparation
type: runbook
sources: [mobile/app.json, mobile/eas.json, mobile/app.config.js, mobile/src/notifications/pushTokenPure.ts, mobile/src/utils/assetCache.ts]
last_verified_date: 2026-10-12
confidence: high
status: current
---

## Summary
Prepare store copy and device-specific real UI captures separately from signing, upload and release. The current 1.5.0 draft kit is in `output/store-draft-1.5.0-2026-10-11/` (the 10 October kit is retained); its README, requirements, gallery and validation document capture provenance and release checks.

## Details
- Recheck [Apple screenshot specifications](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) and [Play preview asset guidance](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en) each release. On this date Apple calls out medium Dynamic Island and iPad 13-inch sections. The kit also provides larger and legacy iPhone exports. Play offers phone, 7-inch and 10-inch sections, eight images per section; tablet guidance prefers UI without additional marketing text.
- Preserve intact app pixels, platform navigation and key components. Put headlines outside the UI. Capture actual Hindi app screens for Hindi listings. The renderer must select matching `raw/*-hi/` sources and fail if missing; asset validation rejects locale/source mismatch. A few untranslated native labels remain as shipped.
- Use fictional, explicitly labelled birth profiles. Inspect each export; record dimensions, alpha channels, source hashes and runtime. Tablet-width emulation is not physical tablet certification.
- Validate field limits and retain paste-ready text. The prior release retained Sankalp and excluded Widgets from screenshots. Current live category/privacy claims may differ from `mobile/store.config.json`; inspect both.

## Dependencies
[[integrations/meta-app-events]], [[subsystems/kids-stories]], [[runbooks/e2e-verification]]

## Gotchas
- Production Meta measurement and conditional Expo push-token upload require reconciling old no-collection/no-tracking copy with actual SDK traffic, App Privacy, Data Safety and the published policy.
- Artwork and recorded audio require initial connectivity; cached replay is separate evidence. The Android emulator rejects the corporate Netskope inspection certificate chain, including a Google control URL. Host HTTP403/1010 does not establish a production CDN failure. Warm-cache captures and seeded-cache tests do not prove fresh delivery.
- Compatible debug/Expo Go captures do not verify the final signed binary, custom modules, physical sensors, background audio, tracking refusal or push behavior. Recheck permissions and age/child-audience settings in that binary.
- RULEBOOK §0.3 gates EAS build/submit/update and version bumps. Listing-material preparation does not itself authorize those operations.

## Verified submission state on 11 October 2026

- User explicitly authorized submission. Apple 1.5.0 (72) submitted at 13:03 IST, submission `f06ddc68-2670-4211-947b-1be85a866153`, status **Waiting for Review**; manual release selected. EN/HI iPhone medium and iPad 13-inch screenshots included; legacy overrides inherit updated assets.
- Play production 1.5.0 / versionCode 12 accepted, bundle validated and signed, SHA256 `5113cd7e497efe523c080162660db8864ceec03cf7d9c0c77e28bef40b4cc533`. All 14 changes sent at approximately 13:06 IST: release, EN/HI descriptions, feature graphics, phone/7-inch/10-inch screenshots and Data Safety. Console shows **Changes in review**, automated quick checks running and automatic forwarding after they pass. Managed publishing on. Optional deobfuscation-file warning only; unchanged device support.
- Apple tracking warning cleared after Device ID declared linked/tracking for advertising, marketing, analytics and functionality. Product Interaction linked/tracking; Crash Data functionality and Other Data analytics unlinked/nontracking, based on SDK manifest. Both policy locale URLs use vedansh.app.
- Google advertising ID Yes for analytics and marketing. Data Safety: identifiers, install/activation interactions and conservative IP-derived approximate location disclosure, collected/shared; required/non-ephemeral Android measurement. No account, HTTPS transit, no unverified remote-deletion promise. Android SDK 18 InstrumentManager returns early when AutoLogAppEvents is false; app disables that setting.
- Website source changed during this session; latest user-approved EN/HI policy files were committed/pushed alone in primary checkout website branch as `6c4b33b6`. Cloudflare deployment run 38121520254 succeeded and live 11 October date/identifier disclosure verified. Netlify run failed; production serving policy is available through Cloudflare.
- Bulk asset uploads can arrive in completion order. Hindi phone/tablets were reordered by selecting assets sequentially; Asset Library search requires Enter. Match exact observed asset URL to avoid duplicate names across locale/device.
- A transient Google error appeared after the final send action, but the fresh console state showed Changes in review. Check server-visible state before retrying to avoid duplicate actions.
- Android retains the same unverified Shubh Yoga behavior as iOS72 under explicit user direction to match iOS; no source certification. Exact signed-binary physical-device traffic and fresh CDN delivery remain separate unverified evidence layers. Console proofs and status JSON live under the kit's evidence folder.

## Submitted Android artifact smoke test — 11 October 2026

Generated universal APK directly from the submitted vc12 AAB using bundletool 1.18.3, with local test signing (not Google Play app signing). Clean Android 16/API36 arm64 emulator install, no injected cache/JS. Package metadata confirms 1.5.0 (12); embedded asset bytes match the AAB. Home, Hindi/English switching, Panchang date navigation, Vrat, Sankalp selector/detail, Gita reader, Japa increment and process-restart persistence passed. Crash buffer was empty. **Fresh Navaratri story artwork failed on pages 1 and 2**: placeholders remained, while text and paging worked. Corresponding CDN URLs returned host HTTP403/Cloudflare1010; physical-phone reachability and exact emulator HTTP failure remain unverified. Do not infer production-wide cause from host response alone. Record and resolve/rule out delivery before manual publication. Evidence: `output/android-submitted-build-smoke-2026-10-11/README.md` and screenshots. No app source or console submission changes.

## Android media and regression evidence on 11 October 2026

- Full source suite passes TypeScript and 3,109 tests. Manifest inventory has 154 matching local objects: 144 decodable WebP images and 10 valid MP3 files.
- Prior production evidence in `docs/content-parity/kids-stories-durga/cdn-evidence.json` records all 144 artwork GETs HTTP200, hashes and decode passing on 9 October. The current image manifest SHA256 is unchanged. This excludes audio and is historical, not a new emulator live check.
- On the release APK with networking disabled, hash-verified seeded cache replay passes artwork, process restart, audio play/pause/resume/background, and interrupted `.part` cleanup with a usable reader. Ordinary caption/page gestures match all 12 Durga Hindi Large and 10 Putana English Large page IDs/counters. No audible quality check on the no-audio emulator.
- Fresh native CDN image/audio delivery and actual new-cache population remain unverified because Android rejects the corporate Netskope inspection certificate. One CDN artwork decodes in Brave; direct audio navigation was blocked by the browser client. No security bypass or R2 changes.
- Android supports verse and Panchang widget providers; Japam has an iOS kind only. Corrected Android preview/add-button and deep-link tests pass. Original release badge tests depend on an absent developer reset control.
- Exact per-flow attempts, unresolved assertions and crash attribution are recorded in `output/android-full-regression-2026-10-11/README.md` and `results/native-results.json`. No app source or store submission changes during regression checks.

- Final native coverage: all 87 flows attempted, 50 unique passes after retests, four release-inapplicable developer-badge flows and 33 unresolved assertion stops. Source checks and fixture checks do not replace those remaining UI or fresh-network checks. Captured crash buffers contain no Vedansh process crashes; Google Play Services crashes are separate.

## Bilingual showcase materials

The 1.5.0 release record and compact test evidence are committed under `docs/releases/1.5.0/`. `marketing/reels/showcases/latest-1.5.0/` holds locale-matched screen sources, benefit-focused narration, preset neural TTS generation and a reproducible 1080×1920 renderer. Hindi and English local MP4s run about 39 seconds, with SRT narration files and media/hash/volume validation; they have not been posted. The captures show current UI in a compatible capture shell, distinct from exact-release native test evidence.

The user subsequently requested separate carousels reusing finished listing assets. `marketing/reels/showcases/listing-carousels/` contains the copy, renderer, source hashes and reviewed contact sheets for 10 features × Hindi/English × 3 slides (60 PNGs, 1080×1350). The user then requested Instagram marketing design rather than resized listing images. V3 uses a light cream three-step marketing journey: choose or enter details → begin → explore the result. The first card is an editorial diagram, the second uses a whole real phone screen, and the third highlights a feature-specific crop from a real capture with a light CTA. Kundali and Guna Milan explain the required birth details, chart generation and result. Locale-matched UI pixels, chart geometry and matching scores are unchanged; store metadata is unchanged. Latest local PNGs, captions, ZIPs and filtered review gallery are under `marketing/reels/out/instagram-journeys-v3/`; nothing was posted.
