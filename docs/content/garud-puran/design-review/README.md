# Garud Puran visual correction — 12 October 2026

The subsequent [final Style 3 artwork preview](style3-final/index.html) applies the saved template to all nine banners and compares them with the approved Hanuman–Sita reference. Its assets are separate from the earlier native captures below.

The supplied screen exposed a real mismatch: a 2:3 portrait illustration with a deliberately empty lower band was squeezed into a fixed 250-point box. Large side gaps, the internal blank band and the ornament margins pushed prose down. The page dots also overlaid the scroll viewport. These were not the latest app's reading-card design.

The initial worktree was at `bda136ef`, before the recent visual refresh. References were checked against current `origin/main`, not assumed from old local files. PR #253 introduced the canonical list-card grammar. The relevant recent artwork/reading contracts are PR #429 (story framing), #434 (no blank image bands) and #449 (opening-only landscape reading illustrations).

## Defined treatment

1. Opening page: quiet approved parchment background; existing controls, editorial marker and title; complete 2:1 painting, maximum 360×180 pt; compact full-width gold divider; readable prose immediately below.
2. Continuation page: same parchment and typography, no illustration or reserved empty art area. Page indicators sit outside the text viewport. Genuine long text remains scrollable.
3. Artwork: nine re-composed landscape scenes using approved `kj-08`, `kj-11` and the reader Vishnu painting as rendering/composition references. Preserve narrative details, complete figures and appropriate iconography; no blank caption band or portrait crop. Existing source-checked Hindi/English content is unchanged.

`references/current-katha.jpg` and `current-continuation.jpg` are explicitly historical reference screenshots from merged PR #449, not new native verification. New verification screenshots are saved separately. The reference sources remain unmodified; only the Garud Puran implementation is being aligned in this older checkout. No whole-branch merge or production asset publication is implied.

Green circles in the supplied screenshot appear to be a touch/gesture overlay; they are not painted into the source illustration or defined by this reader component.

## Verification

- Four focused Jest suites passed: 153 tests covering selected content, reader rendering, read-aloud and auto-advance. TypeScript and focused ESLint passed.
- All nine WebPs match their recorded byte counts and SHA-256 hashes: 960×480, 1,296,654 bytes combined. The approved paper texture adds 3,102 bytes. Exact prompts, reference paths and generation provenance are in `artwork-v2/generation.json`.
- Fresh iOS simulator checks cover Hindi and English opening pages, the art-free continuation, the selection index and the Babhruvahana story. The captures in this directory are native app screenshots, not HTML mockups.
- Opening captures were refreshed after the final shorter selection label was verified manually in the pinned worktree bundle. The supporting continuation/story captures precede that label-only adjustment. A final three-test reader rerun passed. Automated recapture attempts hit launch/resume selector issues; the earlier navigation flow passed, and the final opening was checked through native UI controls.
- The review gallery loaded all 15 images. The linked bilingual content preview contains all 12 selections.
- This is local integration and visual review. Revised Android visuals, physical-device behavior, larger accessibility text sizes and every one of the 28 pages were not re-certified in this pass. No R2 upload or release was performed.
