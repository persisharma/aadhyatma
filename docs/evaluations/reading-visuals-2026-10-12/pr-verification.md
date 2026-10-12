# Reader artwork PR verification — 12 October 2026

Readers now share the approved parchment treatment and complete compact Style 3 paintings.
Paginated readings show a banner on their first actual verse/section only; continuation cards
start with text and reserve no banner space. Illustrations and quiet reading backgrounds use
separate R2 prefixes while sharing a nonblocking persistent content-hash cache.

## Review entry points

- [Actual native before/after and opening-card examples](../reading-visuals-2026-10-11/reader-art-placement/review.md)
- [Durga continuation before](../reading-visuals-2026-10-11/reader-art-placement/durga-card-2-before.jpg)
  / [after](../reading-visuals-2026-10-11/reader-art-placement/durga-card-2-after.jpg)
- [Approved artwork sources and exact hashes](../../../mobile/assets/reader-illustrations/approved.json)
- [Native download-once, restart and offline evidence](../reading-visuals-2026-10-11/r2-loading-followup/review.md)
- [Current automated results](verification.json) and [all 88 public object hashes](r2-public-hashes.json)

The optimized approved source WebPs, provenance/approval metadata and scoped native evidence
are included in the PR. Large raw generation files, obsolete comparison bitmaps and duplicate
manual-upload ZIPs remain local review archives, outside the commit.

## Fresh verification

Reconciled with `origin/main` at `09ac8c68`. The final test run used `c42a34de`; the subsequent
main update changed only marketing files and wiki entries, with no change under `mobile/`.
Both append-only wiki histories are preserved. Existing current-main navigation, kids-story
picture sharing and ATT handling remain intact.

| Check | Result |
| --- | --- |
| `cd mobile && npm test` | Pass: TypeScript, 37 widget tests, 242 Jest suites / 2,325 tests, 590 engine, 173 data and 49 Ask tests (3,174 total) |
| Independent focused review | Four suites / 56 tests pass; no remaining Important/Critical findings |
| Touched-code ESLint | 79 files, zero errors; five existing test-file style warnings |
| Approved source/manifest verification | All 43 illustrations and 45 backgrounds match hashes and dimensions |
| Public R2 bytes | All 88 HTTPS responses match full source SHA-256 |
| Production iOS Hermes JS embedding | Pass: 2,407 modules / 98 assets |
| Maestro `reading-visuals-smoke.yaml` | Pass, exit 0 on iPhone 17 Pro / iOS 26.5 |

The Maestro route exercises current Home settings, English / Large reading size, Vrat → Katha
library search, Satyanarayana sections 1 and 2, prose scrolling, share preview and return to the
same reading page. Screenshots are [initial opening fallback](reading-katha-large.png),
[continuation prose after scrolling](reading-katha-scrolled.png) and
[share preview with the painted remote background](reading-katha-share-background.png).
The opening screenshot is intentionally immediate and shows the bundled manuscript fallback;
text and controls render before an uncached banner completes. The [same opening after process restart](reading-katha-opening-revisit.png) shows the full
approved Vishnu banner. All four cache files created during the fresh Maestro flow match
approved R2 bytes, including that banner: [native file hashes](native-maestro-cache.json).

This run embeds fresh production Hermes JS into an existing Release native shell. Only the
ignored isolated QA app copy disables OTA so installed source is deterministic. No native
compile, cloud build, release, OTA or production TLS/ATS configuration change was made.

## Review fixes

- Offscreen sharing now waits for native painting of both Story background layers, then captures.
  Download/decode failure accepts the painted local fallback; a ten-second upper bound prevents
  missing native callbacks from hanging sharing. Ordinary reading never uses this barrier.
- A regression test reproduced a repeated offline ten-second wait when consecutive share pages
  reused one source. Terminal failure now survives capture-barrier changes and immediately
  reuses its already-painted fallback; source changes still reset that state.
- Added the missing Rama background for current main's active `jai-shri-ram` entry, whose absent
  mapping otherwise tripped import-time coverage assertions. A regression pins this mapping.
- Excluded the three asset metadata manifests from scripture provenance traversal, consistent
  with existing audio/kids asset-manifest exclusions. Scripture provenance checks remain active.

## Evidence boundaries

The October 11 isolated simulator follow-up verifies four genuine native R2 downloads, one
successful transfer per missing hash, zero additional calls on revisit/restart and reuse with
the asset origin unavailable. The initial corporate TLS failure was repaired by provisioning
the exact Mac-trusted CA in that simulator; ordinary certificate validation remains enabled.
Those checks establish the shared transport/cache path. The fresh host hash check covers all
88 objects; it is separate from native download evidence.

No physical-device, Android runtime, full reader/language walkthrough, frame-time, CPU or memory
benchmark is claimed. The native transfer/JS-heartbeat observations in the prior report are
scoped observations, not a guarantee of unchanged performance. Hard termination can leave
orphan `.part` files; they are never valid cache hits. Successful files have no TTL, network
revalidation or automatic eviction; new hashes, deleted storage/uninstall or corrupt/interrupted
file recovery permit another download.

## PR CI follow-up and current-main reconciliation

The original GitHub run [38211395677](https://github.com/persisharma/aadhyatma/actions/runs/38211395677)
passed every step for `20c41a2e`, including observance verification, both production exports and
the CDN/asset gate. Main subsequently advanced to `f5e7fa65` (branding, the Jai Shri Ram
background fix and deity glyphs on Theerth map/cards). Reconciled those changes into the PR.
The text merge duplicated `jai-shri-ram`: TypeScript reproduced TS1117 before correction.
Removed the redundant entry and retained main's mapping beside the other naam-jap sources;
the existing semantic background regression remains active.

Fresh `npm test` passes: TypeScript, 37 widget tests, 242 Jest suites / 2,326 tests, 590 engine,
173 data and 49 Ask tests (3,175 total). Fresh production Hermes JS embedding passes with
2,407 modules / 98 assets; its full SHA-256 matches the installed simulator bundle. The updated
Maestro Katha route passes with exit 0, including Large text, paging, scrolling, share preview
and return to section 2. [Executed flow output](maestro-merge-ready.log). The original artwork,
both manifests and shared cache/paint loader are byte-for-byte unchanged by this reconciliation.
The final remote check result is available in PR #449's checks; no release or OTA was published.
