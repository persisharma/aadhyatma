# Vedansh 1.5.0 release record

This change records the already-authorized Android versionCode 12, English/Hindi store copy, submission preparation, and testing evidence. It does not submit another build or alter feature behavior. The screenshots and narration source for the bilingual feature showcase live in `marketing/reels/showcases/latest-1.5.0/`.

## Submission snapshot

On 11 October 2026, Apple 1.5.0 (72) was observed Waiting for Review with manual release; Google production 1.5.0 (12) was observed Changes in review with managed publishing. These are time-specific observations, not continuously refreshed status. The user authorized the submissions and requested the existing vedansh.app policy be used. See `wiki/runbooks/store-submission.md` for declaration and console details.

`listing/apple` and `listing/google-play` retain the submitted EN/HI field text. Customer copy removes offline/cache implementation language while retaining relevant devotional and Jyotish terms. Large upload assets, AAB/APK binaries, console screenshots and raw logs remain in the local output package and are not committed.

## Validation and remaining gaps

- Full source suite: TypeScript check plus 3,109 tests passed. This version-only PR adds no feature implementation.
- Android release APK derived directly from the submitted AAB: all 87 standalone flows attempted. First run 39 passed/48 stopped. Corrected retests yield 50 unique passes across 105 valid attempts; four developer-only badge flows are inapplicable to release, and 33 full flows remain unresolved at assertions. The original app source and repository Maestro flows were not changed. See `evidence/native-results.json` and CSV; assertion stops are not automatically product defects.
- No Vedansh process crashes in the captured buffers; Google Play Services crashes were separate. Local test signing differs from Play signing; physical-device and Play-upgrade-path verification remain open.
- All 154 local media objects match manifests: 144 WebP images decode and 10 MP3 files pass format probes. Seeded native cache replay, restart, audio controls/background and interrupted-file cleanup pass. These do not prove fresh downloads.
- Historical 9 October production CDN evidence covers all 144 images with HTTP200, matching hashes and decode; its image manifest is unchanged. Current native fresh artwork/audio delivery and new-cache population remain unverified because the emulator rejects corporate Netskope inspection certificates. No security bypass or R2 object changes. See `evidence/r2-results.json`.

Full local diagnostic paths appear in `android-regression.md`; files under the original output tree are not portable with this PR. The compact JSON/CSV evidence alongside this page is committed and portable. No release-readiness or all-tests-green claim is made.

## Separate feature carousels

The user requested separate feature carousels using finished listing assets. `marketing/reels/showcases/listing-carousels/` provides 10 features in both languages, three 1080×1350 cards per set, redesigned as Instagram marketing posts: feature-specific hook, phone-screen walkthrough, distinct dark CTA, captions and hashtags. Real listing-kit screen pixels remain intact, and store metadata is unchanged. Generated gallery, 60 PNGs, captions, individual ZIPs and combined ZIP stay local under `marketing/reels/out/listing-carousels/`. No publication or additional capture.
