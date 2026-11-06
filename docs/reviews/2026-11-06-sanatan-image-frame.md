# Sanatan oversized artwork: root cause and prevention

User report: 6 November 2026, an installed iOS Home screenshot shows the landscape
Sanatan Parichay painting rendered as a tall, heavily cropped image. Correction:
PR #624, branch `codex/fix-sanatan-native-image-frame`, started from main
`aba14c15a329bfb565ac62f6331a81a82987f5af`; final preservation also includes
`1b77c101594991b41b683fcf0cbba69d93acd61f` (Doha integration).

## Why it happened despite the rulebook

The rule already existed: checklist C3 requires explicitly framed native images;
U3/U4/U9 require installed-screen geometry and language/size verification. The
implementation did not comply. It placed `width: '100%'` and `aspectRatio: 1.5`
on Image, rather than reusing the View-owned geometry already in Jyotish.

React Native 0.81.5 Image.ios.js and Image.android.js merge
`[{width: source.width, height: source.height}, styles.base, props.style]`.
The source height (640) therefore survived. Yoga receives both a width and a
height, so aspectRatio does not replace the height. The oversized box then
`cover`-crops a correct 960×640 painting into a tall slice.

Earlier tests checked content, IDs, navigation, persistence and source-image
dimensions. They did not check the native Image defaults or rendered bounds.
The original implementation report explicitly left device QA pending; it did
not establish visual acceptance. This was incomplete implementation/verification,
not a missing policy or a new artwork problem. Passing automated checks should
not have been treated as sufficient product acceptance.

## Correction and related surfaces

- `FramedPainting` follows the existing Jyotish pattern: a View owns 3:2 layout;
  its absolute Image explicitly fills 100% width **and** height. Thumbnails retain
  their 81×54 frame. Home still imports only its single painting, preserving lazy
  registry loading and existing callbacks, copy and entry placement.
- `Painting` uses the same frame for all thirteen collections in the hub,
  overview, reader/diagrams and Search. No replacement artwork or source changes.
- The production audit also found `CatalogBackground` using absoluteFill alone.
  Its Image now explicitly fills both dimensions of its existing background View.
  This corrects the same geometry class; no Vrat text/font behaviour is changed.
- Jyotish's frame and fixed numeric Kundali/Kids Home/Catalog category artwork
  were inspected; their existing geometry is retained. Reader banner frames
  already own layout. No unrelated redesign or content/storage migration.

## Enforced prevention — RULEBOOK §11.17

`nativeImageGeometryPolicy.test.ts` scans 338 production component/screen TSX
files with the TypeScript AST. It rejects the known unsafe inline, StyleSheet
and conditional Image aspectRatio/absoluteFill forms. Alternatives are checked
separately so a correctly sized small branch cannot hide an unsafe large branch.
The suite is included automatically in the existing reader/component Jest gate.
It detected the sibling CatalogBackground issue, which was corrected rather than
allowlisted. There are no policy exemptions. Dynamic styles still need explicit
component geometry tests and installed-device review.

`sanatanArtworkFrame.test.tsx` covers all thirteen paintings in large/thumbnail
slots and four Home scripts. It merges the actual native source-dimension defaults
into each Image style and verifies those dimensions are constrained by its frame.
The initial old-code run failed all 30 frame-contract cases; fixed tests pass.
The old small images already had valid 81×54 numeric geometry; their failures
were the new shared-frame contract, not evidence that thumbnails were oversized.

## Executed evidence

| Check | Result / limit |
|---|---|
| TypeScript | PASS on the refreshed main application source plus correction. |
| Focused suites | PASS: 6 suites/64 tests (geometry policy, 30 frame cases, Sanatan journey/store, shared reader artwork and Kundali art). |
| Native Yoga | PASS: 24 cases, six widths including a fractional width × four pixel densities. Old source-height retention reproduced; corrected frame/image bounds stay 3:2 within native rounding. |
| Production AST audit | PASS: 338 production TSX files, zero known-pattern violations after the two fixes. |
| Startup import budget | PASS: existing launch-graph tests; no full Sanatan registry added to Home. |
| Instruction bootstrap | PASS: `node scripts/verify-agent-instructions.mjs`. |
| Full `npm test` | Environment blocked at tsx's IPC socket EPERM; not claimed passed. Reader/component shards are run separately; final results are recorded in the PR. |
| Maestro | Home screenshot added to each existing four-language Standard/Large flow; YAML parsed, not executed. |
| Installed iOS/Android | PENDING: no simulator/device/adb/Maestro executable in this environment. |

Native Yoga command from `mobile/`: `node scripts/verify-framed-painting.mjs`.
This compiles the Yoga source shipped with the installed React Native package,
reproduces the former style inputs, and checks the fixed constraints. It requires
a C++20 compiler. This is native **layout-engine** evidence, not a screenshot or
an executed iOS/Android app journey.

## Remaining acceptance and delivery

U1/U2/U7/U8/U12: source, scope, unchanged artwork, sibling fix and remote
preservation established. U3/U4/U5/U9/U10/U11 remain pending for native appearance,
actual entry/destination journeys, final-head CI and device acceptance. U6/C7
storage is unchanged and existing Sanatan store/journey tests pass. C1/C2/C3/C9
still require visual review. C4/C5/C6/C8/C10 have no behaviour changes in this fix;
no new share/calendar/reminder/playback/release work is claimed.

Before visual acceptance, open Home and every Sanatan painting context on iOS and
Android. Record image/frame bounds and screenshots at all four scripts,
Standard/Large, compact and enlarged system text. Confirm the full composition,
3:2 landscape ratio, unchanged 81×54 thumbnails, reachable copy/actions, and Back
and scrolling behaviour. Run the updated Sanatan Maestro flows against the exact
branch bundle. Tests, source hashes and Yoga output do not replace these checks.

The corrective PR remains draft while required device checks are pending. No
merge, native build, OTA or release is performed by this task. Tested/preserved
head and CI status are recorded in the PR. Do not clean the sole local copy of
unfinished evidence; code, tests, rulebook and handover are remotely preserved.

## Additional scope raised during the correction

The user also reports that native listings/presentation do not match the approved
Site and that shipped reading material is prototype copy. These are real open
issues, not resolved by image geometry, rules or automated test counts. The
approved Site was recovered at e4a01fe0fac7b9637fa71e536d76612fa0c39c1c for a
proper native visual audit. Complete source-backed content and native design
fidelity need their own changes and evidence before overall acceptance.

The three reader/component shards pass: 116 suites/1,161 tests, 116 suites/1,306
tests and 115 suites/894 tests (347 suites/3,361 tests total) on the pre-Doha
application snapshot plus the correction. Final-head CI remains pending after
including the independently merged Doha work. No installed-device pass is claimed.

Automatic approval review blocked replacement of large design/history payloads.
They remain unchanged; the focused companion is docs/design/sanatan-native-geometry.md.
RULEBOOK update succeeded using the verified existing branch file SHA after
confirming its upstream text is preserved except the explicitly requested rule.

## Subsequent design and copy correction

User review established a separate fidelity/content failure beyond image geometry. The correction now reuses ListingCardFrame, ListingSectionHeader, TextField, ReaderHeader and the actual prose-reader shell. Collection thumbnails sit inside their complete tappable card; discovery cards use the approved paired layout with a stacked compact/system-text fallback. Home is a compact horizontal text/art row. All thirteen retain the approved 3:2 scene family.

The 39 prototype pages are replaced with original source-linked introductory reading, subject-specific page titles and separate prose paragraphs. Known copy-writing and art-production notes are removed, including diagram captions. See `docs/content-parity/sanatan-parichay/reading-readiness.md` for precise coverage and editorial status. This does not turn 201 indexed research seeds into 201 finished articles.

The reproducible browser harness in `mobile/visual/sanatan` mounts the real native components. Platform adapters make it useful for layout review only; no native screenshots, playback or share handoff are claimed. Revised content and native visual acceptance remain pending. Rulebook §11.18 now explicitly separates prototype approval, complete authored content and production design acceptance.

## Final correction checkpoint and evidence

Implemented/tested source and verified remote head: `7ff8ea3490e5b8555a1199d7e9dcb1885899a2dd`. Base includes main `e3628c2c85a62e396cba8d91ec9ddc4d2611e7b5`; native shared typography, Doha and infinity changes are preserved. Subsequent documentation-only commits do not change this tested application tree.

| Check | Status | Evidence |
| --- | --- | --- |
| TypeScript | PASS | `./node_modules/.bin/tsc --noEmit`, exit 0 |
| Reader/component gate | PASS | Jest shards 1/3:117 suites/1,207 tests; 2/3:117/1,299; 3/3:116/946. Total 350 suites/3,452 tests. Third shard repeated with JSON output after the first run produced an incomplete log; only the complete repeat is counted. |
| Widgets/engine/data/Ask gates | PASS | 46/630/223/49 tests respectively, zero failures. Used `node --import tsx --test` with the package scripts' exact file lists because the tsx CLI's IPC pipe is denied in this runtime. Literal `npm test` is not claimed to pass. |
| Known native image hazards | PASS | Production component/screen AST guard and the 30 image/component cases pass in the full gate. Native Yoga 24 cases pass again. |
| Instruction bootstrap | PASS | `node scripts/verify-agent-instructions.mjs` |
| Browser layout | PASS, supplemental only | Actual RN components: compact Hindi Home; English revised reader; hub hi/en/gu/kn × M/L at 320px and simulated fontScale 1.5. All eight hub DOM containers had 320px scroll width; sampled 274×182.656px artwork retained 3:2. Fonts loaded. Platform/device glyph and text-scaling acceptance remains separate. |
| Remote preservation | PASS | PR #624 head and content, CollectionCard, reader and Rulebook blob SHAs read back and matched. All 20 UI/content/harness files retained; dependencies/build output omitted. |
| CI | PENDING | Source-head CI run 42165064071 in progress at handover; agent policy run 42165064044 passed. |
| Native acceptance | PENDING | No iOS/Android runtime available here. Four scripts × both sizes, compact/OS scaling, actual routes/store/audio/share and screenshot matrix remain required. |
| Independent editorial acceptance | PENDING | 13 source-linked introductory lessons are candidates. The 201-topic research index is not a finished corpus. |
| Release | N/A | No merge, store build, OTA or deployment requested/performed. |

The durable PR is the handover: https://github.com/persisharma/aadhyatma/pull/624. It remains draft until required native and editorial checks are satisfied. No cleanup of the sole source/evidence copy was performed.
