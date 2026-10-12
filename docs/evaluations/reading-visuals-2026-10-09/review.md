# Approved Option 2 reading visuals — 9 October 2026

The user selected **Option 2** ("ok option 2"). Vrat Katha, Pitru introduction,
Pitru Katha and Daan Katha now use a continuous parchment folio: chapter heading,
complete thematic painting, a gold divider and unrestricted prose. The selected direction
is implemented locally; no app release, commit or PR was performed.

[Native before and after](approval-preview.html) · [Approved reference and native result together](design-comparison.html)

## Review coverage

[The inventory](screen-inventory.json) covers the source structure of all **113 screen files**,
including their shared reading/card components. It is a source review with representative native
visual checks, not a claim that every screen received a complete native walkthrough.

| Family | Assessment and correction |
| --- | --- |
| Verse readers: Gita/Saar, Chalisa, Aarti, Stuti, Suktam, Kavacham, Ashtakam, Sanskar, Ramayana, Sundarkand and stotrams | Already use shared reading typography, ornaments, semantic BackgroundLayer plates and scrolling page bodies. Preserve anatomy and migrate artwork delivery through the shared loader. |
| Vrat Katha and Pitru introduction | Plain long prose lacked the house artwork/card treatment. Add a continuous parchment folio with the whole opening painting and compact later art. Page markers now occupy a separate rail below the text viewport. |
| Daan Katha and Pitru Katha | Same plain-prose gap. Use the shared folio and thematic illustration, retaining teaching panels, canonical source lines and onward reader/actions. |
| Katha library | Add the neutral manuscript background while preserving searchable reading rows. |
| Theerth | Preserve deity/shrine-specific plates and dedicated illustration frames; migrate their direct Image to BackgroundArtwork. Use a neutral accessibility label that remains accurate during fallback. |
| Vidhi conduct, Daan/Pitru education hubs | Already have bordered reading/verse cards, phase markers, sourced hand-offs and topic-specific hierarchy. Retain those structures. |
| Chapter/category/deity/purpose lists, Daily Bhakti, routines and share surfaces | Existing art/card vocabulary is retained; shared BackgroundLayer delivers cached R2 artwork with the local fallback. Katha/Daan share cards now receive their thematic background too. |
| Kids stories | Existing complete illustrated story pipeline retained. No narrative, artwork or frame/hash changes. |
| Panchang/Jyotish, charts, forms, ledgers, audio, settings and utility screens | Preserve task-specific cards, diagrams and controls. Do not obscure operational information with story illustrations. |

## Approved changes

- Removed the provisional bordered/elevated paper card from prose. A 3,102-byte ivory paper
  texture provides a quiet reading centre and faint botanical corners across the whole screen.
- Created a separate 900 × 600 Vishnu/Narayana painting (94,904 bytes) for the approved direction.
  It replaces the existing semantic Vishnu source mapping, so matching readers share the improved
  artwork. Full-resolution generation sources and prompts are in `approved-assets/`.
- Opening illustrations reserve at most 220 points, capped for short/landscape screens. Later
  paged sections reserve 80 points. `contain` preserves the full artwork. Reserved dimensions
  prevent text jumping when the async image arrives.
- Before download, or on failure, prose illustrations show the app's existing neutral manuscript
  icon; the paper texture and text remain visible. This icon was already bundled, adding no new
  asset payload. No different deity or named temple is substituted offline.
- Paged sections share one screen-level paper image instead of rendering duplicate full-screen
  textures in each list cell.
- Removed the Pitru introduction's duplicate bottom safe-area inset above its visible tab bar.
  Pager dots remain outside the prose viewport. Individual paragraphs are accessible.
- Existing religious text, translations, sources, teaching panels, share/read-aloud and onward
  navigation remain. Older Daan/Pitru plates remain thematic illustrations, not depictions of
  the particular narrated event. Kids content/art/framing was not changed.
- Follow-up Kannada QA exposed iOS Fabric clipping at the final wrapped line, including Daan's
  teaching panel. `ProseParagraph` adds one point to the first measured natural text height on
  iOS, with one bounded extra layout pass; content/font/width changes reset measurement and stale
  events are ignored. Android keeps natural layout without an added measurement callback. This
  preserves source text and line spacing. It is applied to prose and Daan/Pitru subtitles,
  teaching and source lines. See [the matching upstream issue](https://github.com/react/react-native/issues/53450).

## R2 and the download-once contract

The manifest contains **45 assets**: the original 43 paintings plus the two approved new assets.
All were published and HTTP/hash verified; the original record is `r2-verification.json`, and
new full SHA-256 checks are `approved-assets/r2-verification.json`. URLs use the existing
`https://cdn.vedansh.app/reading-backgrounds/<content-hash>.<extension>` base.

Completed valid artwork lives in persistent Documents storage, identified by content hash and
extension. It has **no TTL, HEAD requests, network revalidation or automatic eviction**. Restarting
the app or changing CDN host reuses the same file. A changed hash downloads a new version.
Deleted artwork/app data or uninstall permits another download; incomplete or decode-damaged
files retry for recovery. The 3 KB bundled paper itself needs no redundant remote download.

All disk checks and native downloads use asynchronous Expo APIs. Work starts after navigation
focus and interactions, with deduplication, concurrency two, an eight-second timeout, last-viewer
cancellation and unique temporary files promoted only after a successful nonempty download.
Native decode failures preserve the fallback and evict damaged files; stale callbacks cannot
replace a newer painting. Text, navigation, controls and share capture never await artwork.
Hard process kills can leave ignored `.part` files; no general orphan/old-hash sweep is implemented.

Both final production Hermes export graphs include **one of the 45 reading assets: the
3,102-byte paper**, excluding the other 44. Previously this reading-art set bundled 7,450,232
bytes, so the new fallback removes **7,447,130 bytes** from that baseline. Existing icons/fonts
are separate. See `approved-assets/bundle-assets.json`.

## Native evidence

Computer-use captures are from the isolated `Vedansh-Reading-Art-QA` iOS 26.5 Expo Go simulator.
The board shows real English/Standard screens before and after, not a rendered mockup.

| Capture | Evidence |
| --- | --- |
| [13: English Large fallback](13-option2-katha-fallback-english-large.png) | Real native CDN failure leaves neutral manuscript art, paper and immediately usable text. |
| [14: English Standard opening](14-option2-katha-cached-english-standard.png) | Approved continuous layout and complete new painting decode from the persistent cache. |
| [15: Section 1 endpoint](15-option2-katha-section1-end.png) | Native accessibility targeting scrolls to the complete final paragraph above the pager. |
| [16: Section 2 compact art](16-option2-katha-section2-compact.png) | Native section navigation reaches 2/5 and preserves more space for prose. |
| [17: Hindi Standard](17-option2-katha-hindi-standard.png) / [18: Hindi Large](18-option2-katha-hindi-large.png) | Native Indic title/body and the complete illustration render in both sizes. |
| [19: Daan Hindi Large](19-option2-daan-hindi-large.png) / [20: teaching and source](20-option2-daan-teaching-source.png) | Shared paper/divider plus retained teaching, provenance and onward content. |
| [21: Pitru introduction](21-option2-pitru-introduction-hindi-large.png) / [22: endpoint](22-option2-pitru-introduction-end.png) | Hindi Large prose is reachable and dots sit immediately above the tab bar without a duplicate safe inset. |
| [23: Pitru story](23-option2-pitru-katha-hindi-large.png) / [24: teaching and source](24-option2-pitru-teaching-source.png) | Shared reading treatment and native access to source and Ramayana hand-off. |
| [25: Gujarati Standard](25-option2-katha-gujarati-standard.png) / [26: Large](26-option2-katha-gujarati-large.png) / [27: Large endpoint](27-option2-katha-gujarati-large-end.png) | Script-aware opening typography and the complete final paragraph at Large. |
| [32: Kannada Standard](32-option2-kannada-standard-final.png) / [33: complete endpoint](33-option2-kannada-standard-final-end.png) | Final paragraph renders fully after the iOS drawing-boundary guard. [31](31-option2-katha-kannada-standard-end.png) records the clipping before the fix. |
| [34: Kannada Large](34-option2-kannada-large-final.png) / [35: long prose](35-option2-kannada-large-final-prose.png) | Final opening and long-paragraph flow. The full Large endpoint exceeds this viewport and is not established by these captures. |
| [36: Daan Kannada Large](36-option2-daan-kannada-large-final.png) / [38: teaching and source fixed](38-option2-daan-kannada-teaching-fixed.png) | Complete thematic art and all teaching lines/source after the guard. [37](37-option2-daan-kannada-teaching-source.png) records the prior clipped teaching. |

Native direct CDN downloading is **still unverified**. The simulator proxy rejects TLS with
`NSURLErrorDomain -1200` (including the new painting request at 12:05:24). Certificate validation
was left enabled. After capturing the genuine fallback, the new painting was explicitly seeded
as a hash-identical fixture into this isolated Expo Go Documents cache. See
`approved-assets/native-cache-fixture.json`; the original 43 fixtures are recorded separately.
Cached screenshots prove native disk reads/decoding, not a successful native R2 download.

Native accessibility targeting reaches long-prose endpoints and later sections. Coordinate drag
and wheel input remained inconclusive, even with the exact simulator window active, so physical
touch gestures are not claimed. Simulator chrome/pointer and the baseline's development warning
are excluded only by declarative browser framing in the comparison; original captures are linked.

## Checks and limits

- Initial approved-direction reader/cache/image/share/read-aloud checks: **7 suites / 185 tests passed**.
- Final follow-up prose/cache/image/Vrat/Pitru/Daan checks: **6 suites / 74 tests passed**.
  Includes 21 cache tests: failed HTTP statuses, empty responses, network rejection, disk stat or
  promotion failure, and ignored orphan partial files. Four paragraph regressions cover source
  preservation, bounded measurement, metric/content changes, stale events and Android behavior.
- Final cache/image/share checks after fallback integration: **3 suites / 22 tests passed**;
  the supplied fallback also survives native decode failure (6 image tests rerun).
- TypeScript and focused lint passed with no warnings; all 45 source hashes and diff whitespace
  checks passed. Final iOS and Android production **Hermes** exports succeeded.
- Earlier full suite: 235 suites / 2,162 tests passed before adopting Option 2. Historical records
  and screenshots 01–12 remain in this folder; they are not the current design.
- The app's development launch trace includes existing JS stalls. Export success and asynchronous
  asset code do not establish physical-device frame timing, memory limits or zero work on every
  platform thread.
- Pending: direct native CDN success outside the proxy, physical touch gestures, the complete
  Kannada Large endpoint and remaining language/family combinations, Android runtime,
  physical-device frame/memory comparison and a complete native walkthrough of all screens.
  The source inventory covers all 113 screen files; native QA is scoped.

`design-qa.md` at the repository root records the combined reference/native visual review.
The new assets are published to R2; the app changes remain local and unreleased.
