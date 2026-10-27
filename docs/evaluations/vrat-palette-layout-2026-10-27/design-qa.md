# Vrat palette and card proportions QA

final result: passed

Scope: current illustrated Vrat landing/Upcoming/ledger, shared calendar surfaces and palette follow-up. This is iOS design verification, not cross-platform release acceptance.

## Comparison inputs and state

- Source visual truth: `../vrat-reference-rebuild-2026-10-26/references/landing.png` (852×1846) and `list.png` (853×1844), originally the user's two full mockups in Downloads. `references/prototype-upcoming.png` and `prototype-ledger.png` retain focused source regions.
- Rendered implementation: `native-first.png`, `native-middle.png`, `native-last.png`, `native-hindi-vrat-list.png`, `native-katha.png`, `native-english-my-vrat.png`, `native-english-empty-my-vrat.png`, English Standard and systemXXXL first/middle/last captures.
- Viewport: actual iOS26.5/iPhone17Pro,402×874pt at3×; native PNGs1206×2622. Full-view comparisons normalize both images to402px width with aspect preserved. Focused comparisons crop the original3× native pixels before downsampling, avoiding blurred upsampling. `layout-measurements.json` records reference→native content-width scaling (790px→374pt).
- State: same initial Karwa/Ganesh/Ahoi order and Hindi list. Prototype date26Oct/countdown3days differs from current27Oct/countdown2days. Quiet current date has no Today event. Prototype favorites/location differ from test state. Native safe areas, canonical ReaderHeader and global navigation remain app-owned.
- Combined full views: `comparison-full.png`, `comparison-list.png`, `comparison-native-before-after.png`. Focused side-by-side inputs: `comparison-upcoming.png`, `comparison-ledger.png`. All were opened and visually compared. Palette comparison: `palette-before-after.jpg`; all68 source paintings viewed on `palette-all-1.jpg` through `palette-all-3.jpg`.

## Iterations and resolved findings

1. [P2, fixed] Artwork identity/style was checked without catching saturation differences. Karwa puja/ritual, Ahoi, Bal Krishna, Jivitputrika and Dasha Mata were noticeably brighter/glossier than reused paintings. Built-in Image Gen color/rendering edits preserve subjects and composition with matte reds/greens/gold. Original inputs retained. Six before/after pairs and final all-art sheets show the correction; final native Karwa/Ahoi/Krishna rows and tiles show integration.
2. [P2, fixed] Upcoming's older full-width image/overlaid large star changed the source composition. Tiles now155pt, illustration110×72, visible star28pt beside the art inside an independent44pt target; rail gap6pt. Direct normalized comparison verifies those proportions.
3. [P2, fixed] Heavy gold/rounding and a clipped rectangular shadow differed from the paper prototype. Calendar tone now cream with14pt corners, shallow elevation and explicit rail shadow padding; default Kids Stories reading tone preserved. Focused comparison and all three rail positions show unclipped shadows.
4. [P1, fixed in the earlier consistency pass, rechecked] Fixed/zero-basis calendar copy clipped long titles and metadata. Intrinsic card height, flexible date/countdown rows and growing ledger retain all copy at Standard and systemXXXL. Janmashtami wraps naturally; dates/countdowns move to another line as needed. No forced one-line truncation was reintroduced.
5. [P2, capture issue, resolved] A separate checkout replaced preview port8084 mid-run, leaving blank image slots in an enlarged English capture. Those images were rejected and retaken from this checkout on dedicated8542. Final evidence contains resolved local paintings and parchment. One early Hindi list capture caught the push transition; it was replaced with a stable direct simulator capture.

## Required fidelity surfaces

- Fonts/typography: existing Noto Serif Devanagari titles/script metadata and Cormorant English captions retain the app's approved font language. Calendar titles now use maroon. Standard and enlarged glyphs, complete long titles, baseline spacing and metadata were read in native captures. Native font metrics add a little height beyond the raster mock; that is accepted to preserve readable Indic copy.
- Spacing/layout: measured155pt/110×72/6pt/14pt geometry, image/star alignment, shallow shadow clearance and roughly73pt Standard ledger checked directly. Cards/ledger grow under large text, while category doors reflow full width. Partial edge cards are the intentional horizontal-scroll affordance; each card becomes fully visible when scrolled.
- Colors/tokens: catalogSurface, catalogBorder, catalogAccent and native parchment are shared throughout calendar surfaces. Default reading cards keep their established theme. Six edited paintings join the muted family while distinct devotional colors remain. Saturation values are advisory, not a numerical acceptance rule.
- Image quality/fidelity: all68 paintings reviewed for subject, composition and consistent medium. Six shipped edits are241,854bytes total and preserve the named figures/ritual objects. Exact prompts/master/input/shipped hashes recorded. Native small paintings are sharp enough at their actual slots; no poster text, symbolic fallback or render-time wash appears.
- Copy/content: titles, bilingual row captions, real dates/countdowns and follows/reminders retained. No authored devotional narratives or calendar calculations changed. The tour's bilingual catalog release note now matches the inherited1.5.5 version contract.

## Interactions and remaining limits

Native follow→My Vrat, open reminders→save, unfollow→empty, return, Katha and Vrat list routes passed. All six Upcoming cards were reached in Hindi/English; enlarged English retains full content and persistent navigation. Test follow removed, Hindi/Standard and normal system text restored. TypeScript,3,781 full-suite tests,46 final focused tests and zero lint errors recorded in `validation.md`.

No actionable P0/P1/P2 issue remains in this scoped comparison. Minor source/native font metrics, the metadata separator treatment, canonical header/safe-area height and global selected-tab treatment remain accepted native-system differences. Android, physical-device/screen-reader and smallest-phone checks remain pending; no claim of cross-platform or pixel-identical release acceptance.
