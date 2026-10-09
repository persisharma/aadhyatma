# Maa Durga validation — 2026-10-09

Initial layout/export validation used main commit `85a957316402f4b3f3c704e5382598d62d079ce0`. PR preparation subsequently refreshed main to `91abb204` and moved the three left-side share controls to the right. See the PR-preparation evidence below. No OTA or deployment was performed. The user has now uploaded the prepared package; all 144 production CDN objects pass HTTP/hash/decode verification, as recorded below. Regional editorial approval and physical-device checks are distinct from this report.

## Source, narrative and art

All fourteen complete authored readings were compared against published sources and read through the ending in Hindi, English, Gujarati and Kannada. The exact 87-page causal transition review is in `pacing-review.md`; source editions, duplicate hosts and devotional variants are in `source-manifest.json`. Independent Gujarati/Kannada editorial approval remains pending.

All 87 full packaged illustrations and fourteen reused covers were visually inspected against their exact page action, roles, symbols, connected limbs and painted boundary. Corrections include duplicate devas, misplaced Kali/Parvati roles, extra hands, floating weapons and mismatched child/foster-mother depictions. Final PNG generation prompts/hashes are in `art-generation.json`; final WebP hashes and framing reviews are in `art-review.json`. Every new frame matches `kidsStoryArtFrames.json`. Full scene content is preserved; retained-height crops remove only visually inspected empty lower parchment. Browser/native image bytes match.

## Earlier technical evidence after the first main pull

- Full `cd mobile && npm test`: **3,092 tests passed** (37 widgets, 2,246 Jest reader/UI tests across 234 suites, 590 engine, 170 data, 49 ask); typecheck passed. Log: `tmp/durga-native/final-full-test.log`. Final scope-pill layout was additionally checked with 13 focused share tests, and catalog geometry with six focused tests.
- Changed TypeScript lint: **0 errors, 0 warnings** across all thirteen changed production TypeScript files. `git diff --check` passes.
- The earlier worktree iOS Debug native build **succeeded** with 0 errors and 3 warnings. Its compatible story/share modules were reused with current Metro after pulling main; this is not a fresh native rebuild of all main changes, a store/Release build or Android evidence.
- Browser Playwright: **348 page/language visits** (87 × 4), four deity catalogs, fourteen Durga cards per locale, nine day/form links, all endings/source notes and page-index preservation on language change. All illustrations decode at 1122×1402; no page errors. Log/results: `tmp/durga-native/browser-check.{log,json}`.
- App manifest: **144 assets**, with all 57 legacy entries unchanged. There are 143 hash-pinned story frames; the remaining manifest entry is the bundled Home icon.
- R2 upload bundle: **87 exact object keys**, 29,605,018 uncompressed bytes, with full SHA-256 and byte mapping. `upload.md` describes upload and fresh-cache verification. Hashing/dry-run is not upload evidence.

## Historical native sequence before the main pull/reframe

An isolated iPhone 17 Pro / iOS 26.5 simulator (`Vedansh-Durga-Navaratri-QA`, `E5023980-FFA8-4A9E-BC94-6E47992D3D3F`) runs the current-worktree native dev binary and Metro on 8096. Shared simulator/Metro sessions were left alone. The final illustrations were copied into that simulator’s hashed local cache; no CDN publication is implied.

Capture drives the actual Home-stack reader route and page ID, applies the real persisted language/reading-size contexts, verifies header counter and image URI, scrolls the actual native scene ScrollView and takes native `simctl` screenshots at full art, caption and every ending. Review contact sheets retain those native pixels. This validates the rendered sequence and vertical overflow; it is **not** a passing Maestro gesture run.

The existing development `resetScreenPrefetchForTests` seam was called only in this simulator to stop unrelated background screen warmup after Metro exceeded its heap. Product source was not changed for this seam. Dev LogBox warnings appear in early captures and clear later; captions/source remain accessible. This run does not establish general cold-start or performance behavior.

| Language | Standard | Large | Visual review |
| --- | --- | --- | --- |
| Hindi | 87 captured | 87 captured | All pages, captions and endings reviewed |
| English | 87 captured | 87 captured | All pages, captions and endings reviewed |
| Gujarati | 87 captured | 87 captured | All pages, captions and endings reviewed |
| Kannada | 87 captured | 87 captured | All pages, captions and endings reviewed |

All eight sequences completed: **696 native page visits, 112 endings and 1,504 native screenshots**. Every caption/ending contact sheet was manually reviewed. Full Hindi Standard art was reviewed scene by scene; all other 609 full-art regions matched that baseline with a maximum mean pixel difference of 0.634/255 and no frame/content outliers above 2/255. Gujarati/Kannada images were registered by -4 physical pixels because the locale pill's font metrics shift the scene origin; the painted scale and content are preserved.

Raw native screenshots, capture proofs and contact sheets are in `tmp/durga-native/{hi,en,gu,kn}-{M,L}/`. [Native evidence](native-evidence.json) pins the exact 87 scenes, fourteen source records, manifest, frames, R2 bundle, capture proofs and aggregate screenshot hashes. Screenshot-manifest hashes are reproducible from the sorted filenames and full SHA-256 values described there.

A focused Maestro run on the same isolated simulator passed actual Hindi-to-English switching on Raktabeej page 3, preserved the page index, swiped forward to page 4 and back to page 3, and verified each counter. Log: `tmp/durga-native/gesture-smoke.log`. The earlier full-flow attempt encountered a native accessibility-tree HTTP 500; the focused pass does not establish the full 696-page gesture run.

A second focused Maestro run passed the actual library → Maa Durga shelf → Raktabeej reader → same shelf → library path, scrolling through the Navaratri introduction and extra stories to Shakambhari. Three shelf screenshots were visually reviewed. Log: `tmp/durga-native/catalog-smoke.log`. Both runs' command/log/screenshot hashes are pinned in `native-evidence.json`.

## Full native artwork review after the first main pull

The source-byte review and individual painted-boundary decisions are in [layout-review.json](layout-review.json). All 87 frames were re-inspected after trimming, including the fourteen covers. The shared shelves use width-derived cover height, one bottom padding and no duplicated bottom safe-area inset. The reader keeps its existing readable type and real vertical scrolling.

Post-change native proofs, frame/source hashes, all eight Standard/Large language sequences, pixel comparisons and measured remaining scroll are in [layout-native-evidence.json](layout-native-evidence.json). The earlier `native-evidence.json` is explicitly historical and does not attest the revised frames. Post-change coverage is **696 native page visits, 112 endings, 1,504 screenshots and 112 cover visits**. All eight cover contact sheets were manually inspected. Every revised art region matches its previously reviewed native scene (maximum mean difference 0.638/255), with zero caption/ending differences or comparison outliers. All 101 Hindi Standard caption/ending captures were manually reviewed again; other complete post-change caption regions were pixel-verified against the earlier manually reviewed sequences, with representative new sheets inspected.

All 73 non-ending pages in each sequence still require legitimate text overflow. No type was shrunk and no meaningful artwork was clipped to force a fit.

| Language | Standard scroll range | Large scroll range |
| --- | --- | --- |
| Hindi | 5–100 dp | 59–163 dp |
| English | 34–152 dp | 85–230 dp |
| Gujarati | 6–96 dp | 55–198 dp |
| Kannada | 45–196 dp | 109–286 dp |

Ending/source panels require additional scrolling; exact per-sequence maxima are in the evidence JSON. Source-only empty-space trims save a mean **31.9 dp** of art height at the tested 358 dp reader width.

Post-change focused Maestro checks passed actual page-3 language switching with index preservation and forward/back paging, the share-button → illustration preview → narration preview → cancel path, and library → Durga → Raktabeej → shelf → library with Shakambhari scrolling. Logs and screenshot hashes are pinned in the two current evidence JSONs. An initial catalog scroll overshot at 100% visibility; its retained failure log is distinguished from the passing rerun using partial visibility followed by centering. The complete 696-page end-to-end Maestro flow remains unrun after these changes.

Browser parity was rechecked after applying the same reviewed frames: all 348 page/language visits pass, plus measured geometry for all 87 scene frames and 56 cover/language instances; no aspect-ratio letterboxing.

## Native multi-card exports

All fourteen readings were exported through the installed ShareProvider/view-shot pipeline in all four languages: **752 actual 1080×1350 PNGs, 100 numbered parts, 348 complete illustration cards and 56 complete story/language combinations**. Captured native prose bindings reconstruct every original caption, dialogue, takeaway and source note in order. Native measured body/title bounds show zero text overflow; illustration frames remain inside the body. Source-image interior pixel comparisons pass for all 348 images (maximum mean difference 4.907/255, with a 6/255 resampling tolerance and rounded corners excluded). All exact source/frame hashes and export proofs are pinned in [sharing-native-evidence.json](sharing-native-evidence.json). Representative PNGs were visually inspected; this is not a claim of manual inspection of all 752 exports.

Scene cards use the actual measured title height so short titles do not reserve blank title lines. Native verification caught an existing UIKit density multiplier: a ten-card album was 111.3 MB at 3240×4050. The shared capture now divides iOS point options by screen density, preserving Android pixel options. The corrected ten-card album reaches the actual iOS sheet as **10 Images / Save 10 Images, 15.3 MB**. Maestro verified those labels and dismissal. The ten actual handoff PNGs match the checked exports: nine byte-for-byte and one with at most a single RGB-level rounding difference; geometry/text are identical. No recipient, Photos save or publication was selected. Physical-device and Instagram import checks remain pending.

[Earlier post-change screenshots](post-change-preview.jpg), taken before moving the share control right, show the complete native scene, the same page scrolled to its complete caption, and the matching exported illustration.

## Remaining release checks

1. Verify first download on a fresh native device cache, offline reuse and all covers. All exact production CDN objects are now verified; this does not establish native first-download/offline behavior.
2. Independent Gujarati/Kannada editorial review of the complete narratives and source notes.
3. Physical iOS and Android reader/gesture checks. The new `.maestro/kids-stories-durga-full-sequence.yaml` and four locale subflows cover all 87 pages, complete captions and source notes at Standard/Large; a passing end-to-end gesture run remains distinct from native screenshot evidence.
4. Product/editorial sign-off on the children’s adaptation and illustrations before release.


## PR preparation after latest main refresh

Main was refreshed to `91abb204` (PR #435). The existing nine-form shelf remains one card per roop; no duplicate collection was introduced. Kids Stories share moved to the right of its language pill. Vrat Katha share moved after the header counter, and Daan Katha share to the header right slot, preserving the separate read-aloud control. A static source audit inspected all 37 share-icon call sites; native revalidation focuses on these three changed surfaces.

- Latest complete `npm test`: **3,094 passed** (37 widgets, 2,248 Jest tests in 234 suites, 590 engine, 170 data, 49 ask); typecheck passed. Fifteen changed production TypeScript files lint cleanly. Full log hashes are in [PR-preparation evidence](pr-preparation-evidence.json).
- **24 native screen visits**: each changed screen in hi/en/gu/kn at Standard and Large. Each share target measures 48×48 dp at x=332 on the 402 dp viewport. All three eight-screen contact sheets were visually inspected. Read-aloud remains separate and the language pill stays centred; long Vrat titles retain the header's ellipsis while full section titles remain in the body. Non-kids gu/kn use their existing transliteration behavior.
- Actual Maestro picker → preview → cancel flows pass for all three screens; Kids Stories also checks narration preview. The first Vrat flow ran while the app was backgrounded by prior Maestro teardown; the retained failure and passing foreground rerun are separately recorded. No send/save/publication was selected.
- [Clean current screenshots](right-share-preview.jpg) show Kids Stories, Vrat Katha and Daan Katha. Contact sheets: [Kids Stories](KidsStoryReader-right-share-contact.jpg), [Vrat Katha](VratKathaReader-right-share-contact.jpg), [Daan Katha](DaanKatha-right-share-contact.jpg). The contact capture includes a debug LogBox warning bar, dismissed through the UI before the clean screenshots.
- All 87 upload-ready objects were compared byte-for-byte to native source/browser copies and their app manifest hashes. [The complete R2 inventory](r2-assets.csv) pins every object key and source hash. The ZIP hash remains unchanged.

The earlier full-art/layout evidence retains its original source hashes; only the kids reader share-placement source differs. No story text, illustration, frame or export renderer changed during PR preparation, and all sharing-pipeline source hashes still match its 752-export evidence. The full 696-page sequence was not repeated after this shell-only adjustment; current evidence does not establish CDN publication, a fresh native build, physical-device behavior or Instagram import.


## Live CDN and production bundle verification after upload

The user's upload was verified at `2026-10-09T18:10:37.240Z`. All **144 manifest objects**, including **87 new Durga illustrations**, return HTTP 200 through the production CDN. All new images match their full expected SHA-256, legacy images match the manifest hash prefix, and all responses fully decode as WebP. Every response has `image/webp` and immutable one-year public cache headers. [Per-object evidence](cdn-evidence.json) records actual URLs, bytes, hashes, dimensions and response headers; 44,964,738 bytes were checked.

Local production `expo export --platform ios --dump-assetmap` and the corresponding Android export both succeeded. Final exports after merging main `9573655d` contain zero of all 144 story images, including the Home library icon. Home now resolves its icon through the existing CDN/cache. [Bundle evidence](bundle-evidence.json) pins the export asset-map and log hashes. This verifies zero story illustration bytes in those exports, not an unchanged total app size or a completed native IPA/AAB build. Text/code/manifests remain bundled, source files enlarge the checkout/build inputs, and downloaded images use device cache storage.

The native first-download/offline and physical-device/editorial gates above remain pending. These requests independently verify the production CDN; they do not convert seeded native cache evidence into fresh-device validation.


## Regression gates and current-main reconciliation

Merged main `9573655d` and retained both append-only wiki log entries when resolving the conflict. Updated Durga settings/share Maestro flows to Home’s settings gear. No story narration, illustration or reviewed frame changed.

RULEBOOK §29.2 now requires production exports on both platforms and a full-manifest CDN GET/hash check. CI runs both production exports and the full CDN/export gate and retains JSON evidence. The automated data suite rejects story-art imports and tests the export verifier against a renamed image outside the story folders. The Home component test checks its fixed loading geometry, usable navigation and cached URI. [Full-manifest asset gate](asset-gate-evidence.json) records all 144 full source hash matches and zero bundled story images.

The fresh simulator Home-art fetch failed: “A TLS error caused the secure connection to fail.” Host certificate inspection shows the corporate Netskope issuer `ca.gokwik.goskope.com`; the host trusts this interception CA while the simulator download does not. No TLS relaxation or certificate installation was performed. The Home door remained usable during the failed fetch; native first-download/offline and physical-device validation remain pending. Earlier seeded-cache artwork evidence is still separate.

Current-main checks: **3,099 tests passed** (37 widget, 2,250 Jest in 235 suites, 590 engine, 173 data, 49 ask), typecheck passed and fifteen changed production files lint with zero errors/warnings. [Current-main evidence](current-main-checks.json) pins logs and delivery-check source hashes. Both production export maps have 130 asset groups and zero story images.
