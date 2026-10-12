# Reading artwork rollout and placement correction — 10 October 2026

**Current direction:** compare three scenes across three styles before choosing the wider
rollout. Daan, Hanuman–Sita and Vishvarupa now have new Krishna storybook drafts, generated
using unchanged kj-08/kj-11 references. [Current three-by-three comparison](all-image-fit.html)
shows the complete existing muted originals, detailed painting drafts and new storybook art
inside identical short 2:1 frames. All 11 images loaded in the browser; the fresh capture is
[three-scenes-three-styles.png](reader-illustrations/three-scenes-three-styles.png).

Style 3 is recommended for app cohesion and clearer short-banner figures. Its three 960×480
WebPs total 218,756 bytes (214 KiB), versus 326,850 bytes (319 KiB) for the detailed drafts
at the same dimensions and encoder settings: 33.1% smaller. This does not measure native
performance. Built-in generation is restored; the remaining 40 briefs are held for the user's
choice. [Prompts](reader-illustrations/prompts.json), [status](reader-illustrations/status.json).

Reader illustrations have their own descriptor/aliases/manifest, source folder and configured
R2 prefix; backgrounds and banners share CachedArtwork and the unchanged lifetime cache.
The new manifest remains empty pending visual choice, approval and publication. TypeScript,
focused lint and eight focused suites/205 tests pass. No new illustration is approved, adopted
or uploaded. Native/device and replacement publication checks remain open.

The remainder records earlier proposals and evidence, not current visual approval.


**Historical detailed-painting proposal:** the user rejected both tall portraits and the subsequent focal crops,
requesting new paintings made for a short rectangle. [New full-canvas draft comparisons](all-image-fit.html)
show three 2:1 replacements at 360×180px. Vishnu is held for an arm-count correction; 39 other
paintings await generation after a 401 `token_revoked` image-service error. The local preview
server is restored and comparison images load locally. See [draft status](new-banners/status.json),
[saved prompts](new-banners/prompts.json) and [new-art review](new-banners/review.md). No replacement
has been adopted in the app or uploaded to R2. Existing native/cache evidence remains separate.

**Historical crop proposal (rejected):** Shared `ReadingBanner` uses a compact 2:1 frame up to
360×180pt, including later sections and Theerth, with focal crops and three contained compositions.
Its 44-image load/geometry checks, 183 focused tests, TypeScript and lint passes verify that
intermediate implementation, not visual approval. The old gallery is archived as
`clipped-banners-rejected.html`. Fresh native banner verification remains pending.

The approved Option 2 paper, thematic painting and divider now cover the relevant reading
families. Following the user's image-placement feedback, opening plates use the existing
responsive frame (maximum 220pt / 28% window height), rather than the 80pt continuation frame.
Full figures remain visible with `contain`; portrait art stays centred. No new bitmap or
content hash was introduced by this correction. The supplied attachment had expired, so this
fix addresses the small boxed artwork observed in the current native captures.

[Corrected before and after](rollout-preview.html) · [Same Gita verse](size-comparison.html) ·
[Selected reference with actual native result](reference-comparison.html)

## Coverage

| Surface | Integrated treatment |
| --- | --- |
| 21 verse-reader screens through seven canonical page layouts | Neutral paper, complete semantic painting above the verse, shared divider; existing curated source/verse/kāṇḍa mapping and scroll/paging remain. |
| Vrat Katha, Pitru introduction/story and Daan Katha | Previously approved continuous prose folio, full opening and compact later sections. |
| Daily Verse | Paper and full semantic painting inside the shareable card. |
| Daan landing and journey | One Annapurna opening; journey Why uses the shared prose folio. Existing scripture cards, teaching and giving actions remain. |
| Pitru overview and education | Shared paper with the theme base colour beneath it; neutral manuscript art in the education opening. |
| Vidhi preparation and conduct | Declared-deity opening painting; neutral art for personal-tithi remembrance; painting only on conduct step 1, divider on later steps. |
| Theerth, browse, routine and share surfaces | Existing purpose-specific artwork and hierarchy use the common R2 loader. |
| Kids stories, charts, forms, ledgers, settings and audio | Their task-specific illustration/control systems remain. No kids narrative, art or frame/hash changes. |

The earlier inventory reviews the source structure of 113 screen files. Native walkthroughs
are representative and scoped; this is not evidence that all screens, languages and devices
were visually inspected end to end.

## Native correction evidence

Actual iOS 26.5 Expo Go captures from the isolated `Vedansh-Reading-Art-QA` simulator:

- Gita 1.42 English/Standard: [before](11-gita-standard.png), [after](12-gita-artwork-size-fixed.png),
  [equal-scale comparison](artwork-size-before-after.png). The same complete portrait changes
  from a tiny 80pt plate to the approved larger frame; verse text wraps identically.
- [Daily Verse](13-daily-artwork-size-fixed.png): full approved Vishnu/Narayana painting,
  source/bookmark/share controls and verse on paper.
- [Puja opening](14-vidhi-artwork-size-fixed.png): complete approved painting between the
  first-step heading and instruction; [later step](06-vidhi-conduct-next.png) has divider only.
- [Daan journey](15-daan-artwork-size-fixed.png): complete Annapurna plate above Why and
  retained shastra card. This legacy portrait retains its paper border and muted palette.
- [Pitru education](16-pitru-artwork-size-fixed.png): full neutral manuscript illustration;
  [overview](09-pitru-overview.png) verifies parchment replacing the uncovered white base.
- [Selected reference and native puja together](reference-native-comparison.png): the same
  direction across different content/controls; not an exact-state Katha comparison. The original
  exact Katha comparison is retained in the October 9 evaluation directory.

Native captures are 782×1732 window rasters; declarative HTML framing displays the device region
(688×1498 pixels at x47/y203) without editing any bitmap. The phone is 402×874pt. Window capture
scaling is approximately 1.71 pixels/point, not a raw 3x device screenshot. Board screenshots
are 847×937 and 847×911. The selected reference is 853×1844 pixels, fitted at the same column width.
The capture API returned JPEG bytes under the recorded `.png` filenames; browsers decode them.

Cached native artwork uses the previously recorded hash-identical QA fixtures. These captures
prove cache reads, image decoding and placement, not successful native CDN transport. The 00:59 local simulator requests failed TLS with -1200; certificate verification is unchanged. A 09:28 local host URLSession probe subsequently succeeded with the correct full hash (host-urlsession-r2-verification.json). A new app retry remains pending Mac unlock.

## R2, cache and performance contract

All 45 manifest objects passed fresh public HTTP 200 and complete SHA-256 verification with
curl's default TLS validation: [record](r2-verification.json). An earlier Python-client 403 probe
is retained separately and does not override the successful curl byte checks.

Completed, valid artwork persists in Documents by content hash and extension, without TTL,
HEAD/revalidation or automatic eviction. Restarts and CDN-host changes reuse the file. New
content hashes, deleted storage or uninstall permit another download; incomplete/corrupt
files retry. The identical 3,102-byte bundled paper requires no redundant download. Existing
neutral manuscript icons provide immediate limited offline illustration.

Artwork starts after focus/interactions and uses asynchronous native file/download APIs,
deduplication, concurrency two, an eight-second timeout, cancellation and atomic promotion.
Text and navigation never await it. This architecture limits loading work; it does not establish
zero main-thread work or measured frame/memory behaviour on physical devices.

Both final production Hermes exports succeed after the frame/base-colour correction.
[Asset membership](bundle-assets.json) verifies one of 45 reading assets bundled on each platform:
3,102-byte paper, with the other 44 excluded. This removes 7,447,130 bytes from the earlier
7,450,232-byte bundled-reading baseline. The larger frame adds no asset payload.

## Checks and remaining work

- Full Jest reader/UI suite before the final frame-only correction: **236 suites / 2,181 tests**.
- Final proportional rechecks: **six suites / 86 tests**, including Daily, Pitru, Daan, Vidhi
  and reader type scale. Existing React act/deprecation warnings remain.
- Final TypeScript, focused ESLint (18 files), both Hermes exports, all 45 source hashes and
  diff whitespace checks pass. The export record is from the final source state.
- Prior cache/paragraph regression suites and genuine fallback evidence are retained in the
  October 9 evaluation. The lifetime cache includes 21 failure/lifecycle tests.
- Pending: successful native R2 download outside the proxy, physical-device frame/memory and
  touch checks, Android runtime, remaining language/size/family combinations and the complete
  native screen walkthrough. Enlarged text still uses vertical reader scrolling; the newly
  expanded families have not all received a fresh Large-size walkthrough.

App changes remain local and unreleased; R2 objects are published. The active goal remains open
for the outstanding native/performance verification. Root `design-qa.md` records the scoped
visual pass and the earlier findings/fixes.

## Cache loading follow-up

[Fresh cache and native evidence](cache-follow-up.md): cached images now bypass unrelated
slow network jobs. A new regression failed before the fix; the final full Jest suite passes
236 suites / 2,183 tests, with final TypeScript, focused lint and both Hermes exports. Native
process restart preserves all 44 fixtures. The recorded 00:59 local native R2 retry failed TLS -1200;
fallback/navigation and restored cached decoding are recorded in captures 17–19.
