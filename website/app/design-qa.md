# Design QA — Vedansh interactive website prototype

final result: passed

Verified 22 October 2026. No unresolved P0/P1/P2 findings remain in the bounded prototype scope.

## Latest iteration: compact copy and first-party insights

User feedback: reduce text and add click journeys/stats for future placement decisions.

- **Visual comparison:** `evidence/comparison-compact-desktop.png` puts the previous hybrid (left) and compact v3 (right) in one input, each at 1440 × 1024 image/CSS pixels, 1:1 capture. A 36px caption band is excluded. `evidence/comparison-compact-hero.png` pairs unscaled hero crops at a readable size. The retained Option 2 reference remains the visual foundation; shorter copy and expandable catalogue groups are explicitly requested deviations.
- **Desktop:** `evidence/compact-desktop.png`; warm shell, serif hierarchy, real art and primary installation action are retained. The hero has one short supporting statement. Repeated section descriptions are removed. All 42 offerings are placed inside eight expandable groups, with search expanding matching results.
- **Phone:** `evidence/compact-mobile-hi.png` and `evidence/compact-catalog-mobile.png`, 390 × 844, show the shorter Hindi hero and an expanded stories category. `evidence/compact-mala-320.png`, 320 × 740, confirms the shared counter stops at 11. No horizontal document overflow was observed at these widths.
- **Insights:** `evidence/stats-desktop.png`, 1440 × 1024, and `evidence/stats-mobile.png`, 390 × 844. Real local preview activity is shown, with no seeded results. Top ten placements are shown initially; all rows remain available. Mobile/Hindi filtering and empty-result states were exercised. Direct store-link clicks, source placement and the recorded Gita → reading gate → store path were verified.
- **Required surfaces:** display/UI/Devanagari fonts remain readable; tighter copy improves vertical rhythm without crowding actions; parchment/saffron tokens are unchanged; hero and screenshots remain sharp raster assets; copy retains preview boundaries and app-only handoff. Dashboard typography, spacing, tables and contrast were inspected at desktop and phone sizes.
- **Interaction checks this iteration:** expandable stories category, Ramayana comic overview and install handoff, Hindi Kundali search and clearing, three Gita samples followed by install prompt, actual outbound App Store webpage, and 11-chant mala limit on 320px. The previous 42-modal/eight-tab coverage below is retained as earlier evidence, not claimed as a fresh exhaustive pass after this revision.
- **Console:** final website and stats loads returned no errors or warnings.
- **Verification:** clean production build and **15 automated checks passed**. Checks cover both language documents/all 42 SEO destinations, bounded samples, local persistence/deduplication/restart, origin and payload checks, protected deployment stats, correct exposed-visit rates, journey ordering and graceful behavior with storage/UUID unavailable and browser privacy signals enabled.

### Issues addressed

1. **P2 — excessive visible copy:** previous desktop reference shows repeated hero paragraphs and descriptive catalogue rows. Removed repeated introductions and converted catalogue into native, keyboard-accessible disclosures. Joint post-change comparison and phone captures confirm the requested lower density.
2. **P2 — events had no reporting or persistence:** replaced browser-only notifications with a first-party collector, durable local storage and a separate dashboard. Real browser clicks appear in the report and persistence is covered across collector restart. Deployment adapters are prepared but not running remotely.
3. **P2 — measurement could interrupt browsing on unsupported APIs:** added anonymous-ID fallback and isolated analytics failures from hydration and install actions. Regression test covers unavailable browser storage/UUID APIs and privacy opt-outs.

No actionable P0/P1/P2 remains in this local prototype. Confirmed installs, physical-device native handoff, production database bindings and production traffic are outside the evidence. Static-only hosting does not collect analytics; integrate the documented backend before launch.

## Earlier hybrid verification (retained history)

## Visual truth and requested changes

- Primary selected reference: `evidence/selected-option-2.png` (1487 × 1058). The approved sanctuary shell, warm manuscript palette, display type, devotional artwork and navigation remain the foundation.
- Supplemental user-supplied reference: `/Users/prashant/Code/Aadhyatma/.context/prototypes/website-v2/index.html`, viewed through the HTTP URL the user supplied. Captures include `evidence/claude-desktop.png` and `evidence/claude-feature-explorer.png`.
- The user explicitly requested the best of both approaches, including the mala view, while prioritising app installations and limiting web functionality. Screenshot-led discovery, a functional mala, larger reading controls and install-first actions are intentional adaptations; this is not a pixel clone of either reference.

## Comparison evidence

- Final desktop implementation: `evidence/desktop-final.png`, 1440 × 1024 CSS px and image px. Effective capture ratio is 1:1.
- Full-view joint input: `evidence/comparison-desktop-final.png`. The concept is normalized proportionately to 1440 × 1024 and placed beside the same-size implementation. The extra 32-pixel caption band is excluded from design judgment.
- Focused joint input: `evidence/comparison-hero-final.png`. Typography, action hierarchy and spacing were inspected at a readable scale; source and implementation regions are paired in the same image.
- Mala: `evidence/mala-desktop-final.png` and `evidence/hybrid-mala-mobile.png`.
- Phone: `evidence/mobile-hi-final.png`, `evidence/mobile-explorer-hi-final.png`, `evidence/install-320-final.png`, `evidence/reader-320-large.png`, `evidence/mala-complete-320.png`.
- Rendered viewport checks: 1440 × 1024, 768 × 1024, 390 × 844 and 320 × 740. Document width equalled viewport width at every tested breakpoint. Responsive phone checks are browser checks, not physical-device proof.

## Required fidelity surfaces

- **Fonts and typography:** Cormorant Garamond display/reading type and readable DM Sans controls; Noto Serif Devanagari for Hindi and Sanskrit. Fonts loaded in the inspected browser and Devanagari rendered correctly. Hero hierarchy and warm serif character follow the reference. The Gita remains within the dialog at 28px Sanskrit size on a 320px viewport, with transliteration visible.
- **Spacing and layout:** fixed desktop navigation, spacious split hero and paired daily content follow Option 2. The hybrid adds a visual explorer and a standalone mala section. Phone navigation collapses, tabs scroll horizontally within their region, dialogs remain scrollable, and the fixed install bar has page-bottom clearance. No horizontal page overflow was observed.
- **Colors and tokens:** parchment `#F3E7C9`, raised parchment `#F8EFD6`, ink `#1A0E03`, saffron `#B8621B` and deep saffron `#8A3E0B`. Controls remain in the warm app palette. The reference's red/green timing colors and approximate live astronomy were not adopted.
- **Image quality and asset fidelity:** actual app icon, QR and screenshots are retained. A dedicated near-square Krishna–Arjuna raster replaces the first portrait crop, preserving the central crown, face and hands in the desktop hero. Its WebP is 404KB; the original is retained in evidence. No fabricated app screenshots are used. The functional mala bead visualization follows the user-supplied interaction pattern; it represents counter progress, not a substitute devotional illustration.
- **Copy and content:** installation is the principal action. Three Gita verses, the Chalisa opening and an 11-chant japa preview are explicitly limited. Current main-branch source was checked to include Gita Saar, Garud Puran, illustrated children's stories and the comic. No unsupported story counts, ratings, testimonials or live calculated results are displayed. Hindi and English copy are present in both generated HTML documents.

## Interaction and accessibility evidence

- All **42** offering entries opened their corresponding preview/overview and exposed an install action; see `evidence/offering-coverage.json`.
- All **eight** screenshot-led experience tabs selected correctly and retained an install action; see `evidence/scene-coverage.json`. Arrow-key navigation also changed the selected tab correctly.
- English/Hindi search, category filters, zero results and clearing search were exercised. Query state and the URL are kept consistent.
- Reader: 2.47 → 2.48 → 2.50, previous/next, Hindi/English meanings, transliteration and text-size controls. The next action after the third sample opens installation choices.
- Mala: shared count with compact counter, selectable mantras, reset and bead progress. It stops at 11; the following action opens the app prompt. Long mantras are shown outside the centre when necessary.
- Mobile: opening/closing the menu, navigating in Hindi, focus restoration, keyboard trapping, inert background content, and the install dialog were checked. The dialog uses native modal focus handling and Escape dismissal. The menu's inert attribute was observed in the rendered DOM.
- The phone's persistent install link uses the existing platform-aware `/get/` route. Store hrefs and QR destination were checked; no app was installed and physical-device store opening is not claimed.
- Fresh production loads in English and Hindi had **no console errors or warnings** after repairs.

## Repair history

1. **P2 — faint cropped hero art:** initial evidence `desktop-v1.png`. Replaced the portrait crop with a slot-sized raster and `object-fit: contain`; the final joint comparison confirms clearer subjects and integration.
2. **P2 — incomplete catalog from an old checkout:** initial 38-offering inventory missed recent app sections. Verified origin/main `6b0014cb` (22 October 2026), added four offerings and the stories category. Final HTML and browser checks cover 42.
3. **P2 — mobile menu reachability:** hid the closed off-canvas menu from focus, added a focus trap/restoration, and made background content inert while open. Hindi phone checks confirmed the final behavior.
4. **P2 — small-phone store labels:** initial `mobile-install.png` wrapped the store names. Simplified the narrow button layout and kept names on one line; `install-320-final.png` confirms both labels fit.
5. **P2 — cross-engine hydration warning:** V8 and WebKit serialized tiny trigonometric differences in bead coordinates. Normalized coordinates to three decimals, added a regression check, rebuilt, and verified a fresh browser load with an empty error/warning log.

## Build and discoverability

`npm run build` and `npm test` pass; **15 checks** now cover analytics as detailed above, as well as portable hosting output, readable English/Hindi HTML, metadata/data agreement, preview bounds, prototype indexing and stable mala coordinates. Both language pages include all offering descriptions and FAQ answers before JavaScript runs.

Metadata, canonical/hreflang, social cards, app banner, factual JSON-LD, sitemap and a supplementary llms.txt are included. Default builds remain noindex; the documented public-launch flag enables indexing in the build without deploying it. Rankings, AI citations and install improvements have not been measured.

## Follow-up polish and deployment limits

- P3: a later editorial pass can refine short labels and paper texture after user review.
- Test actual iPhone/Android store handoff and measure attributed installs after an approved deployment.
- Preserve the live site's legal/support/download routes and merge its sitemap during integration. The optional starter worker retains its generic SPA fallback; production SEO hosting should use the portable static output or adjust that fallback as part of the hosting work.
- No deployment, production website replacement, commit or push was performed.
