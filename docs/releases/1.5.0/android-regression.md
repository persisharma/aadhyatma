# Android submitted-build regression — 11 October 2026

Status: completed with unresolved native UI coverage. Testing the universal APK generated directly from the submitted 1.5.0 (12) AAB; test signing differs from Google Play signing. No source, production binary or store submission changes.

## Final results

All 87 standalone flows attempted: first run 39 passed and 48 stopped. Corrected retests bring unique passing coverage to **50/87** across 105 valid attempts. Of the remaining 37, four badge flows require absent developer controls and are not applicable as written; **33 full flows remain unresolved**. Zero-second driver failures and parse failures are excluded. Do not interpret assertion stops as 33 confirmed app defects or claim the release is fully verified. Detailed flow names, attempts, durations and first failure messages are in `results/native-results.json` and `results/native-results.csv`.

No Vedansh crashes observed in captured crash buffers. Fresh native R2 delivery remains unverified. No physical-phone, audible playback or Play signing/update-path certification.

## Coverage

87 standalone repository feature flows, adapted only in a copied test harness to remove Metro launch arguments and use the embedded release bundle. Four read-only Android16/API36 arm64 AVD instances, isolated test state, 1080×1920 at 420dpi. Source fixtures use fictional birth/profile inputs. Helpers are not standalone tests. Assertions outside the visible viewport can be harness limitations and require separate diagnosis.

## Verified source checks

Full `npm test` passed: TypeScript check and 3,109 tests (37 widget, 2,260 Jest reader/component, 590 engine, 173 data, 49 Ask). The 32 focused asset-cache, audio-player lifecycle, audio-session and manifest tests are a subset of these, not additional independent native coverage.

All 154 R2 manifest objects have corresponding local files with matching SHA256-prefix hashes (144 WebP illustrations and 10 MP3 tracks). Local image files decode successfully. This does not prove those objects exist in R2.

## Network limitation and correction to earlier smoke findings

The original emulator could resolve no hostnames. Restarted with the host DNS servers, resolving DNS. Android then rejected the corporate Netskope HTTPS-inspection certificate chain, including for the CDN and Google control URL. A separate diagnostic logged certificate subjects/issuers while delegating validation to Android's default trust manager; validation remained enabled. Thus blank story artwork and stalled audio observed in this environment are **not confirmed production defects**.

The same Navaratri image loads and decodes as 1122×1402 in Brave. Native fresh download, live HTTP behavior, cache population from R2, and replay of newly downloaded assets remain blocked by the emulator's trust environment. Corporate security settings and app TLS validation were not disabled. Earlier host HTTP403/1010 results do not establish production-wide CDN access failure.

## Evidence

`results/full-unit-suite.log`, `results/r2-unit-tests.log`, `network/local-manifest-integrity.json`, `network/android-native-cdn-after-dns.log`, and `network/android-presented-certificates.log`. Per-flow native results and all valid attempts are in `results/native-results.json` and `results/native-results.csv`; zero-second driver failures are excluded. Earlier small smoke checks and images are in `../android-submitted-build-smoke-2026-10-11/`.

## R2 and media results

`network/r2-results.json` records evidence boundaries. 144 illustrations decode and 10 audio files pass ffprobe; all 154 local objects match committed manifest hashes. In an isolated emulator with WiFi/data disabled, seeded hash-verified cache files render Navaratri illustrations, page to 2/3, and survive process restart. Cached audio plays, pauses, resumes, continues in background and plays again after restart, confirmed by Android media_session. This is fixture-based replay, not a live R2 download; -no-audio excludes audible listening validation. See `cache-fixture/README.md`, screenshots and media-session logs. No R2 objects or security settings changed.

Live first download, streaming, actual new-cache population and complete remote object availability remain unverified because this emulator rejects the network's Netskope certificate chain. Source failure/retry/deduplication tests use mocks. One real CDN artwork URL loads in Brave.

## Test infrastructure

Discard zero-second gRPC UNAVAILABLE runs: the app was not exercised. Independent per-device sessions are used after driver reinstall/reboot. Copied harness explicitly skips tour, selects English and begins setup; original repository flows/source remain unchanged. Release builds hide developer engine-call trails, and Android accessibility labels can include values. These are test expectation differences, not automatically app defects. Emulator Google Play Services entered a background crash loop; its isolated test data was reset, retaining Vedansh state and network/TLS settings. Crash counts must be attributed by process, not total log size.

## Prior production CDN evidence

The repository's `docs/content-parity/kids-stories-durga/cdn-evidence.json` records 144/144 artwork HTTPS GETs returning HTTP200, matching hashes and decoding as WebP on 2026-10-09T18:10:37Z, including all 87 newly uploaded images. Its manifest SHA256 is identical to the current manifest (`7cb326069b260c49f11ec4de50a4c172d640e38d4c271bf50ce73dd6faa723cf`). `network/historical-cdn-check-summary.json` records this comparison. This is prior production evidence, not a new live fetch from today's emulator; it does not cover the 10 audio objects.

## Platform-specific widget contract

The shipped catalog registers Android providers for verse and Panchang; Japam has an iOS kind only. Android shows its preview but has no “Add Vedansh japam widget” button. That is an expected platform difference, not an Android widget regression. The submitted Google Play copy files do not promise Japam widgets. The copied test was corrected accordingly; gallery previews and Android add-button visibility pass. Full deep-link retest is recorded in the final native results.

## Interpretation of UI coverage

A passed native flow means that flow completed its assertions, not physical-device certification. A stopped flow may reflect old labels, locale expectations, offscreen controls or a real issue; unresolved stops are retained in `results/native-results.csv`. Four badge flows depend on a developer reset control absent from release and are not applicable as written. The Gochar retest passes after fixing Android date-selector gestures in the copied harness. Language, Home navigation, Search return, Daily Bhakti, Daan Punya, Ghar Vastu setup/comparison and celestial navigation also pass corrected retests. Guna Milan and Namkaran full flows remain unresolved at UI assertions.

The long illustrated-story accessibility flows reported counter/content mismatches. Separate ordinary page and caption gestures match IDs/counters for all 12 Durga Hindi Large pages and all 10 Putana English Large pages with seeded artwork. This does not certify every story, language, text size or accessibility path.

## Crash evidence

`results/crash-final-summary.json` records no Vedansh process crashes in the captured buffers across five instances. Google Play Services persistent-process crashes occurred separately, including after its isolated test-data reset. Exit histories include intentional test force-stops. Captured buffers are bounded evidence, not a guarantee that no runtime failures can occur.
