---
title: Reading artwork on R2
type: integration
sources: [mobile/assets/garud-puran/index.ts, scripts/verify-artwork-corrections.mjs, mobile/src/data/__tests__/artworkDelivery.jest.test.ts, mobile/src/screens/DailyBhaktiScreen.tsx, mobile/src/data/backgroundAsset.ts, mobile/src/data/backgroundAssetManifest.json, mobile/src/data/readerIllustrationAsset.ts, mobile/src/data/readerIllustrationManifest.json, mobile/src/data/readerIllustrationAliases.json, mobile/src/data/artworkAsset.ts, mobile/src/data/assetManifest.ts, mobile/src/data/backgrounds.ts, mobile/src/data/kathaBackgrounds.ts, mobile/src/utils/backgroundAssetCache.ts, mobile/src/components/CachedArtwork.tsx, mobile/src/components/BackgroundArtwork.tsx, mobile/src/components/BackgroundLayer.tsx, mobile/src/components/ReadingArtwork.tsx, mobile/src/components/ReadingBanner.tsx, mobile/src/components/readingBannerFrames.json, mobile/src/components/ProseReadingCard.tsx, mobile/src/components/ProseParagraph.tsx, scripts/prepare-reading-backgrounds.mjs, scripts/prepare-reader-illustrations.mjs, scripts/upload-r2-assets.mjs, docs/content-parity/reader-illustrations-art-style.md, docs/content-parity/reader-illustration-style3-prompt.md]
last_verified_date: 2026-10-21
confidence: high
status: current
---

## Summary

Fifty-four reading assets (43 original paintings, two approved Option 2 assets and the nine Garud
Puran paintings added 16 Oct) are published to R2 under content-hashed keys. The five reviewed
14 Oct corrections (four backgrounds plus the Karni Mata banner) were bundled overrides until
16 Oct; they now replace the source files in their own slots and ship from R2 under new hashes,
so stale downloads of the old art are never reused. `scripts/verify-artwork-corrections.mjs`
checks them; `artworkDelivery.jest.test.ts` fails if any reading artwork is `require()`d again. The app bundles only the 3,102-byte neutral paper from this set. Prose, navigation and controls
render immediately; artwork resolves independently after interactions.

Reader illustrations are now a separate local asset category with their own typed descriptors,
manifest and configured R2 prefix `reader-illustrations`. They provide standalone 2:1 context
above text; backgrounds remain reading surfaces. Both use the shared deferred loader/cache.
The user accepted the detailed Style 3 set on 11 October, requested gadas in the ocean-crossing
and Rama–Hanuman scenes, then authorized integration while retaining current backgrounds.
All 43 unique 960×480 paintings cover 44 aliases. Complete canvases use `contain` in compact
2:1 frames. The gallery, selected hashes, exact variants, approval and R2 verification are under
`docs/evaluations/reading-visuals-2026-10-11/style3-full-set/`.
All 43 illustrations are published and active, including the two checked gada corrections.
Public HTTPS responses match approved SHA-256 bytes for every object. Background
source/manifest and shared cache hashes remain unchanged. Files total 4.45 MiB (61–132 KiB).
Production iOS/Android exports contain none of the new banners; the paper fallback is 3,102 B.
Initial native QA showed working fallback/text/navigation during an R2 TLS -1200 failure.
The October 11 follow-up resolved missing corporate CA trust in an isolated simulator, with
default TLS validation intact. Real native downloads verify one successful transfer per missing
hash, zero on revisit/restart and cached offline reuse. Four downloaded files match approved
bytes and retain hash/mtime/inode across restart. Earlier controlled fixtures also verify all
43 cached paintings across restart. See `r2-loading-followup/review.md`; physical-device and
frame-time performance remain unverified.
Detail density is independent of rendering style; earlier simplified comparisons are historical.

The reusable approved rendering and banner-generation prompt is saved in
[`reader-illustration-style3-prompt.md`](../../docs/content-parity/reader-illustration-style3-prompt.md).
It includes an approved reference/hash, fill-in scene brief, complete 2:1 composition,
scene-specific Hanuman gada corrections and export/approval checks. A personal ImageGen
template, `$artifact-template-vedansh-style-3-reader-banner`, retains the original approved
PNG and the same guide for reuse outside this checkout. The style can be reused in other
formats; actual kids-story layout and source gates still follow their own contracts.

## Daily Bhakti offline artwork (PR #508)

`mobile/src/data/devotionalShareArt.ts` and `mobile/assets/devotional-share/manifest.json`
are a separate bounded offline set. Nine full deity masters and neutral prayer retain their
existing bytes. Eighteen new 960×480 subject headers cover all 330 previously neutral verses
among the 1,014 added candidates. Eleven reuse exact approved reader-painting bytes in this
local category; seven (Gayatri, Santoshi, Ahoi, Vaishno, Ekadashi, Tulsi, Shakambhari) were
newly generated. This does not activate or upload any new reader CDN asset.

`DevotionalHero` uses `contain` for these complete paintings. `devotionalPlateArt` selects only
Ganesha’s cleared reading body/footer, excluding its deity hero; `devotionalFrameSpec` keeps
the body coordinates in that plate. Screen and captured share use the same components.
`manifest.heroes` records source/generated hashes, exact prompt keys and the body plate.
Added artwork is 2,454,670 bytes; the complete local set is 20,733,526 bytes (19.77MiB),
under the 22MiB ceiling. General prayers and unknown sources retain neutral fallback.
Regression tests pin all 1,014 mappings and all four scripts; native/physical-device evidence
is recorded separately in `docs/evaluations/daily-bhakti-art-508/README.md`.

## Details

1. The four asset indexes (`backgrounds`, `chalisa`, `gita`, `shiva-strotam`) export
   `RemoteBackground` descriptors instead of static image handles. Original WebP files remain
   in the repository as publishing sources. Existing semantic verse/deity/shrine mappings remain.
2. `backgroundAsset.ts` resolves a descriptor through `backgroundAssetManifest.json` and the
   shared `assetBaseUrl()`: `https://cdn.vedansh.app/reading-backgrounds/<hash>.webp` by default.
   Missing/invalid environment overrides retain the production base, including OTA bundles.
   The Option 2 paper descriptor skips remote resolution: its identical artwork is already
   bundled as the fallback, so neutral surfaces need no duplicate disk lookup or R2 download.
3. `CachedArtwork` paints bundled paper (or the supplied existing manuscript icon in prose plates), waits for navigation focus and
   `InteractionManager`, then subscribes to the cache. It leaves the remote layer transparent
   until native `onLoad`. Decode errors evict damaged cached files; stale cache/native callbacks
   cannot replace a newer image. Decorative artwork is hidden from accessibility and touch.
   `BackgroundArtwork` is the background-only wrapper. Reader banners use the same loader
   directly with either legacy art or the distinct `reader-illustration` descriptor.
4. `backgroundAssetCache.ts` uses existing `expo-file-system/legacy` async APIs, including cache
   hits. Deduplicated disk lookups precede the network queue, so cached paintings do not wait
   behind unrelated slow downloads. Only misses enter the bounded queue and recheck disk before
   fetching. Lookup cancellation suppresses queued work and callbacks. Downloads deduplicate
   by content hash and extension, including across CDN URLs, with
   concurrency two and an eight-second network timeout.
   Files live under Documents `reading-backgrounds/`; unique `.part` files are promoted only
   after a successful, nonempty download. Releasing the last subscriber cancels queued/native work.
   Completed valid files have no expiry, network revalidation or automatic eviction. A fresh
   app process reads the same file asynchronously; changing the CDN host does not invalidate it.
   Changed artwork receives a new manifest hash and downloads once under its new filename.
   Explicitly deleted app artwork/storage or uninstall removes local files and permits a new fetch.
5. Readers share the `ReadingArtwork` painting/divider; verse readers keep their semantic
   background plate, while prose uses the approved Option 2 paper and adds the continuous `ProseReadingCard` folio and `kathaBackgrounds.ts`. Seven canonical
   verse layouts cover 21 reader screens, keeping their existing semantic verse/source mappings.
   Daan landing/journey, Pitru education and Vidhi preparation/first conduct step
   share this treatment. Vidhi chooses from declared deities; personal-tithi guides are neutral.
   Later conduct steps use the divider alone. `ReadingBanner` reserves a 2:1 rectangle, up to
   360pt wide and 180pt tall, centred on wider cards. Prose sections and Theerth share it.
   Following the October 11 reading-space correction, paged readers mount the illustration
   only on the first verse of each reading/chapter/theme; later cards retain the paper and
   divider without an image frame, placeholder or asset subscription. The 21 verse-reader
   screens pass their actual verse index (after chapter transition offsets), and
   KathaSectionPage gates both Vrat Katha and Pitru introduction artwork to section zero.
   Direct links to later verses/sections remain text-first. Single continuous prose and
   standalone detail/guide screens keep their one opening image. Daily Bhakti now uses its
   separate offline Design 2 frame, described below; it does not fetch a reader banner.
   **Gotcha — a banner never replaces the background.** The 10 Oct rollout had swapped the seven
   verse layouts, Daan Punya and the Daily Bhakti card from their semantic plate to the neutral
   paper; once banners were gated, later verses and the daily card showed no thematic art.
   Restored 14 Oct: verse pages use `BackgroundLayer source={bg}` (`getReaderBackground`) on
   every card. Daily Bhakti subsequently moved to its own offline frame; Daan
   Punya uses `getDaanBackground()`. Neutral paper is only the offline fallback and the surface
   for screens that never had a plate (prose folios, Pitru, Vidhi, Daan journey/Katha, Garud Puran).
   `readerArtworkPlacement.test.tsx` pins this per layout.
   Daily Bhakti’s separate offline frame now serves its screen and single-image share together.
   Approved dedicated illustrations replace the rejected focal crops for all mapped reading
   slots. The legacy crop registry remains only for unmapped art. Manifest dimensions determine geometry before fetching;
   no network dimension probe, layout callback or native decode changes the frame size.
   The Option 2 paper needs no gradient overlay. Text height is unrestricted;
   scripture, sources, read-aloud, share scopes and onward actions are unchanged.
6. `ProseParagraph` protects iOS RN 0.81 Fabric final-line drawing: it captures the natural
   height once and adds one point of minimum height, with source/font/window changes resetting
   measurement and old events ignored. It preserves the source and line spacing; Android has
   no extra measurement callback. It is used by prose paragraphs and Daan/Pitru subtitles,
   teaching and source text, plus verse meanings/commentary. Native Kannada captures demonstrate
   the resolved prose clipping.
7. `readerIllustrationAliases.json` maps 44 existing semantic slots to 43 illustration IDs
   (both Vishnu versions share one). `ReadingBanner` adopts an illustration only when its
   own published manifest contains that ID, always showing the whole canvas with `contain`.
   Background layers retain their original descriptor. Unknown/unpublished illustration
   requests return null; aliases preserve existing reader art until replacement approval.
   `prepare-reader-illustrations.mjs` requires exact full-SHA visual approvals and complete
   2:1 WebPs. It accepts the original `krishna-storybook-v1` and selected
   `krishna-storybook-detail-v2` approval styles. Default staging writes only an ignored candidate manifest; `--upload` publishes
   every object before updating the app manifest. Existing cached files remain in the same
   persistent hash store, with one shared two-download queue and no added bitmap in the bundle.

8. Offscreen share captures use `ArtworkCaptureContext` to wait for native painting of every
   background layer, including a Story frame and its inner card. Download/decode failure uses
   the painted bundled fallback. Already-painted success/failure carries across pages sharing
   the same source, avoiding a repeated offline wait. A ten-second upper bound protects against
   missing native callbacks. Ordinary readers never wait on this capture-only barrier. Required
   kids-story scene artwork retains its separate readiness/error contract.

Publish/verify from the repository root:

```sh
node scripts/prepare-reading-backgrounds.mjs --verify
node scripts/prepare-reading-backgrounds.mjs --upload
# Alternative to R2 API keys: an existing authorized Wrangler OAuth login.
node scripts/prepare-reading-backgrounds.mjs --upload --wrangler
# Separate approved illustration category:
node scripts/prepare-reader-illustrations.mjs --verify
node scripts/prepare-reader-illustrations.mjs  # stages only; leaves app manifest unchanged
# After visual approval: --upload, optionally --wrangler
```

Without `--upload`, the publisher performs a dry run. The preparation wrapper records width/height
using Expo's installed build-time image reader. `--verify` compares all source hashes and dimensions
with the committed manifest. Staging is rebuilt under ignored `scripts/.cache/reading-backgrounds`.
The existing uploader accepts R2 account/access-key/secret variables or the explicit Wrangler flag;
no credentials are committed. Publish objects before distributing a manifest that references them.

## Dependencies

- [[overview]], [[readers]], [[share]]
- Existing Expo FileSystem native module; no new native dependency or runtime change.
- `docs/evaluations/reading-visuals-2026-10-09/` — source inventory and scoped native/R2 evidence.
- `docs/evaluations/reading-visuals-2026-10-10/` — expanded coverage, image-size correction,
  fresh 45-object public hash verification and final platform bundle membership.

## Gotchas

- A download failure leaves the local illustration visible; revisit/refocus retries. The fallback
  is neutral and must not be labelled as a specific shrine or different deity.
- The download-once contract covers completed, valid artwork. Interrupted downloads retry;
  native decode failures evict damaged files for recovery. No successful file expires with time.
- The user selected Option 2 on October 9. Its paper and separate Vishnu/Narayana painting are
  adopted and published; other generated full-screen proposals remain evaluation images only.
- The user rejected both natural-height portraits (excess scrolling) and then the focal-crop
  proposal (clipped paintings) on October 10. The target remains compact 2:1 banners, but new
  artwork must be composed for that canvas and show complete meaningful subjects. The user
  then specified the Krishna kids-story rendering and a separate Reader illustrations category.
  All 43 detailed Style 3 paintings are accepted and integrated after the two requested gada
  corrections. Framing/anatomy repairs and exact selected hashes remain in the full-set review.
  Always publish future approved art before updating hashes/mappings. Existing background
  cache keys and storage are unchanged; new banner content uses its own hashes. Native captures 12–22 show an earlier layout;
  scoped current native framing also has genuine native R2 download/reuse verification;
  the full reader matrix and physical performance remain pending.
- Pitru overview/education roots need the theme parchment base beneath the shared texture;
  otherwise an uncovered root can render white. The Oct 10 native capture verifies the fix.
- Current native captures cover English Standard and Hindi Standard/Large Katha, compact
  section 2, and Hindi Large Daan/Pitru introduction/story with prose/teaching/source endpoints.
  Follow-up covers Gujarati Standard/Large opening and Large endpoint, Kannada Standard full
  endpoint and Large opening/prose, plus Daan Kannada Large teaching/source. The full Kannada
  Large endpoint and remaining language/family combinations still require native review.
  Native accessibility targeting establishes reachability; physical drag/swipe input remains
  inconclusive. The Pitru introduction's duplicate bottom safe-area inset has been removed.
- Explicit `width`/`height: '100%'` on native Images override the fallback's intrinsic dimensions,
  preventing a small plate from zooming into a corner of its 1024px painting.
- Hard process termination can leave `.part` files. They are never cache hits, and retries remove
  their matching temporary path before downloading; there is no general orphan/old-hash sweep.
- HTTP/hash publication proof, native cached-file decoding, native successful CDN download and
  physical-device performance are separate checks. The October QA simulator recorded
  `NSURLErrorDomain -1200`; the October 11 follow-up reproduces this outside Expo using the
  same URLSession diagnostic on Mac and iOS. Both receive the corporate inspection chain
  `cdn.vedansh.app → ca.gokwik.goskope.com → *.fra2.goskope.com`; Mac accepts it and iOS
  reports `NSOSStatusErrorDomain -67843`, root certificate not trusted. The default foreground
  session also fails, so a session-type change does not repair it. After the user selected
  simulator testing, a fresh isolated iOS 26.5 QA simulator was provisioned with the exact
  existing Mac-trusted corporate CA after full chain fingerprint comparison. Default TLS
  validation and real native app R2 downloads now succeed. No production TLS/ATS exception
  was added. A QA-only observer verified one successful transfer per missing content hash,
  zero calls on revisit/restart and cached reuse with the asset origin unavailable. Four
  native-downloaded files match approved source bytes/full hashes and retain mtime/inode
  across restart and QA-build restoration. Uncached misses show bundled fallback and cancel
  on leaving the page. Outage testing routes only QA misses to unreachable HTTPS loopback;
  it is not physical airplane mode. The observer/outage flag were removed and the original
  Release bundle restored. See
  `docs/evaluations/reading-visuals-2026-10-11/r2-loading-followup/review.md`.
  Physical-device/frame-time performance, Android/device gestures and a full visual walkthrough
  remain unverified; simulator checks are scoped to the shared pipeline and selected readers.

Oct 10 cache follow-up: 23 cache regressions and all 2,183 Jest tests pass. Native process
restart preserves 44 fixture files and painting decoding; the 00:59 local native R2 requests failed
TLS -1200 while fallback/navigation work, followed by restored cached decoding. These do not
prove native transport success or physical performance. See the October 10 `cache-follow-up.md`.

At 09:28 local on October 10, a fresh **macOS host** URLSession request with default certificate
validation returned HTTP 200 and the complete matching SHA-256 for the 94,904-byte Vishnu plate.
This historical host probe narrowed the failure to simulator/network setup. The later
October 11 native follow-up above establishes its trust-chain cause and successful in-app
transport. Diagnostic source and result: `docs/evaluations/reading-visuals-2026-10-10/host-urlsession-r2-{probe.swift,verification.json}`.
