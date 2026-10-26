---
title: Ramayan comic character continuity
type: decision
sources: [docs/content-parity/ramayan-comic/README.md, docs/content-parity/ramayan-comic/character-bible.md, docs/content-parity/ramayan-comic/appearance-timeline.json, docs/content-parity/ramayan-comic/source-manifest.json, docs/content-parity/ramayan-comic/asset-review.json, docs/content-parity/ramayan-comic/balakanda-v1/README.md, docs/content-parity/ramayan-comic/balakanda-v1/book.json, docs/content-parity/ramayan-comic/balakanda-v1/asset-review.json, docs/content-parity/ramayan-comic/balakanda-illustrated-v3/book.json, docs/content-parity/ramayan-comic/balakanda-illustrated-v3/script.json, docs/content-parity/ramayan-comic/balakanda-illustrated-v3/continuity-audit-2026-10-19.md, docs/content-parity/ramayan-comic/ayodhyakanda-preview-v1/README.md, docs/content-parity/ramayan-comic/ayodhyakanda-preview-v1/REVIEW.md, docs/content-parity/ramayan-comic/ayodhyakanda-preview-v1/asset-review.json, RULEBOOK.md]
last_verified_date: 2026-10-25
confidence: high
status: needs-review
---

## Summary

The user selected an inked comic direction with richer colour and the supplied seven-kāṇḍa shelf, then accepted the refined character look and comic previews. The character reference book in `docs/content-parity/ramayan-comic/` supplies six visually reviewed model sheets covering 19 principal identities, plus an event-based appearance timeline. The current local Hindi/English Bālakāṇḍa review edition lives in `balakanda-bilingual-v2/` (29 episodes, 140 panels), expanding the accepted fitted pilot. The original Hindi draft remains in `balakanda-v1/`; the current branch now integrates the reviewed bilingual edition with native comic shelf/reader screens (deployment remains separate).

## Details

- Resolve identity, life stage, dress, disguise/form, condition and props independently. Do not age a character simply because the kāṇḍa changes. Flashbacks select earlier event states.
- Bāla's Vishwamitra journey uses a youthful Rama. The consulted passage bounds him under sixteen; exact later ages remain unspecified. Rama/Lakshmana's matted hair begins at Guha's banyan-latex event; royal grooming follows return/coronation near Yuddha's end.
- Hanuman's ascetic guise is a form transition. Uttara childhood accounts use the juvenile model. Sita's captivity is a condition/clothing change, preserving identity. Lava/Kusha need infant, child and later ruler states.
- Six complete landscape PNGs retain full bounds. These labelled authoring sheets are distinct from text-free production artwork; do not register them in the app art/frame or CDN manifests.
- The machine-readable source manifest distinguishes two-publication comparisons, narrower evidence, unavailable sources and artistic choices. Local Yuddha 131 corresponds to consulted web sarga 128; the local corpus is derived evidence, not a third independent publication.
- The exact built-in image_gen prompts, repair history and selected hashes are retained. Model sheets plus the nearest accepted panel guide generation; each output still needs manual review.
- Future production art is shared across authored hi/en/gu/kn text, with per-language balloon/caption layout. RULEBOOK §29–29.2 source, pacing, framing, CDN and complete native Standard/Large gates still apply.

- User-requested refinement: Rama uses a broader serene face; Lakshmana uses a narrow angular face, focused eyes and distinct swept forelock. The reference book includes a colour/greyscale comparison. Hanuman’s ordinary/enlarged adult models use a gold mukut and gada; childhood/disguise remain separate. Accessories are artistic model choices governed by the sourced scene. Revised sheets and exact edit prompts/hashes are recorded in the package.

## Dependencies

The user accepted the revised character look and requested comic-screen previews. `docs/content-parity/ramayan-comic/screens/README.md` records three static, visually reviewed screens: shelf, friendship pact and Rama's ring, with exact prompts/input hashes and repairs. Baked-in preview lettering is not production multilingual architecture; production needs text-free panel art and native translated text. Extracts and illustrative counters do not establish complete episode pacing or native integration.

[[kids-stories]]

## Gotchas

The reference book does not complete the epic cast or every form. Ravana full anatomy/disguise, Lava/Kusha later rulers and other episode cast remain pending. A portrait study is not permission to omit Ravana's heads/arms in a full-form scene. Optional props and model crowns are not mandatory in every panel. Local authoring and browser checks do not establish translation approval, rights clearance, CDN delivery or native app integration.

## Complete Bala Kanda authoring draft

`docs/content-parity/ramayan-comic/balakanda-v1/` contains 29 episodes, 137 text-free illustrated panels on 29 selected source sheets and 55 reading pages. The original Hindi adaptation covers all 77 sarga arcs, including journey legends, Shatananda's retrospective, four correct marriage pairs, the two distinct bows and homecoming. It is not verse-by-verse or an exhaustive genealogy list. Every adjacent transition has a causal review. The 154 chapter fetch records are fetch evidence, not proof of full independent editorial comparison.

The local HTML reader separates caption/dialogue text from art, provides shelf navigation, vertical scrolling, horizontal swipe, explicit page buttons and 18/23 px text. All 55 pages/137 panels were exercised in both sizes; the final 390 × 844 pass verified image loading, full scroll reach and no horizontal overflow. Native device checks remain pending.

Generated multi-panel sheets do not reliably have equal row heights. `asset-review.json` records measured ink gutter boundaries, selected hashes and every scene review; `build_book.py` copies those rectangles into `book.json`. Never infer a crop from caption length or reuse a uniform grid without inspecting the actual sheet. No image pixels were trimmed. Every panel links to the full original sheet.

Four supporting reference families supplement the original cast. Retain elder Vishwamitra in the present journey/farewell while his narrated past progresses from king to middle-aged ascetic to elder. All final sheets were inspected and repaired, including Rishyasringa invitation order, divine arms/attributes, six Kartikeya heads/foster mothers, Ahalya's unseen penance, four princes/couples, Shatrughna's tan hands and Parashurama's black beard. Exact built-in image_gen prompts, input hashes and revisions are retained.

English/Gujarati/Kannada full narratives, independent Sanskrit/Hindi editorial approval, rights, production art/frame registration, CDN/offline fallback and complete native Standard/Large evidence remain pending. This local draft does not modify the mobile registry or bundle its artwork.

## Subsequent review correction — 2026-10-12

The earlier claim of complete causal continuity is not sustained by the illustrations and narrative: the 1.28 → 1.29 sequence omits Rama's question motivating the hermitage flashback, and Tataka's decisive defeat is narrated but not depicted. Evidence and proposed corrections are in `docs/content-parity/ramayan-comic/lettering-pilot-v1/continuity-findings.md`. The earlier browser checks establish layout mechanics, not story completeness.

The user selected one complete episode (`bk-05`) for lettering review before expanding across 29 episodes. At that stage, the static Hindi and live bilingual experiments in `lettering-pilot-v1/` were not accepted: tall backgrounds lost scene focus and compact replacements did not establish text fit. Prefer concise comic captions with preserved causal beats and additional panels where necessary, not smaller type, obscured action, or oversized scenery. Production remains untouched.

Subsequent actual-text review (`lettering-pilot-v1/text-fit-review.md`) confirms that even shortened Hindi/English copy fails on the compact art at 390px / 18px: captions cover principal faces and the court balloon hides Dasharatha. No horizontal overflow is not a visual pass. This is a rejection proof, not an accepted replacement; compose the next storyboard around actual bilingual lettering before generating final art.

The subsequent correction is `lettering-pilot-v1/fitted.html`: narration reflows in a top compartment inside the same panel border, outside the painted art; a fourth close-up carries Dasharatha's existing question. Shared full-bounds artwork never shrinks/crops with text. All 16 browser combinations (hi/en, 18/23px, 320/360/390/430px) passed text containment and protected-art checks, with full-sequence visual review at 390px and narrow Large fallback at 320px. See `fitted-review.md`. The user subsequently accepted this layout and the continuous speech-balloon outline, and requested expansion across the whole Bālakāṇḍa draft. Editorial/native approval remains separate.

## Bilingual expansion — 2026-10-12

Speaker attribution correction (2026-10-13): `balakanda-bilingual-v2/speaker-anchors.json` now identifies the visible speaker in every one of the 31 dialogue panels. `build-book.mjs` requires complete anchor coverage; `reader.js` positions flowing tails using the painted frame rather than a shared left-side constant. Validate attribution visually as well as testing containment: the previous geometry checks missed tails pointing to listeners. `speaker-validation.json` records 2,240 passing layout states across all 140 panels and manual bilingual dialogue review at Standard/390px and Large/320px. The approved side balloon retains its shape and uses its speaker anchor in the flowing fallback. This is local preview evidence, not production/native approval.

`docs/content-parity/ramayan-comic/balakanda-bilingual-v2/README.md` is the current review entrypoint. All 29 episodes / 140 panels have native Hindi/English narration and dialogue, shared text-free art, 18/23px text, a collection, episode navigation, source view and bilingual comparison. Narration stays inside the ink-bordered panel above artwork. Most dialogue flows above art with a named speaker; only the approved Dasharatha close-up uses an art-background overlay with narrow/Large fallback. Each balloon body and tail is one closed SVG path.

The explicit Tataka fall/death and added night rest precede the next-morning weapon instruction. The added journey/whose-hermitage question bridges 1.28 to Vishwamitra's 1.29 Vamana account and the present-day arrival. The river-roar answer and explicit English Subahu outcome also close causal ambiguity. Six Trishanku frames were remeasured from the actual painted gutters after discovering adjacent-row leakage; captions do not govern frame geometry.

All 29 paired episode sequences were visually reviewed; every panel has a manually authored pacing/art note, source reference, neighbours and exact bilingual text hash in `pacing-review.json`. `browser-validation.json` records 1,120 panel states (140 × two languages × two sizes × two widths), all images loaded, no clipped text/line clamp/horizontal overflow, and protected art/tail bounds. Dense narrow Large examples and the approved close-up fallback were visually inspected. `art-review.json` and `art-prompts.json` retain new-asset selection and provenance; `asset-manifest.json` validates actual PNG dimensions, hashes and authoring frames.

These checks are agent/browser evidence, not independent editorial or native certification. Gujarati/Kannada full narratives, independent source/translation review, rights, whole-edition acceptance, mobile registration, native Standard/Large and CDN/offline delivery remain pending. The mobile frame registry is deliberately unchanged because no native story consumes these authoring assets. The other six kāṇḍas are not part of this expansion.

## Native reader integration — 2026-10-13

The user rejected the hosted website UI inside the app and explicitly selected the corrected 140-panel edition. `ComicChaptersScreen` now lists native episode cards; `ComicReaderScreen` uses shared reader chrome, language context, global reading-size tokens and swipe paging. The old catalog id is retained, but its HTML URL and WebView are removed. Source/full-art/review links, website footer and independent reader controls are not rendered in the app.

`mobile/scripts/sync-comic-book.mjs` preserves every reviewed bilingual caption, art frame and speaker anchor in the lazy native book. `ComicPanel` ports the ink-bordered narration and natural-height SVG speech geometry; the approved side balloon falls back to flow when measured copy no longer fits. `comicAssetManifest.json` resolves 35 byte-identical reviewed PNGs through immutable CDN keys and the existing persistent cache. PNGs are retained to preserve the approved pixels; no story images are bundled. The standalone preview remains an authoring/review surface.

Gujarati/Kannada narratives remain pending. Those app locales show an explicit English-fallback notice, without changing the user's global language. `native-integration-review.md` in the bilingual-v2 package records the integration evidence and native/editorial limits. This supersedes the earlier WebView implementation and the earlier statement that mobile registration was unchanged; it does not imply an OTA or store release.

## Dialogue on artwork — 2026-10-13

The user rejected the separate parchment speech gutter, then rejected fixed-top bubbles whose capped tails stopped above the cast. All 31 dialogue scenes now use fully painted portraits, with body edges anchored near the cast and explicit speaker endpoints in `mobile/src/data/comicSpeechLayouts.ts`. Text grows away from faces; tails reach their reviewed points. Trishanku's inverted scene places speech below his head. Narration remains above the artwork. The remaining 109 panels, both narratives and sourced transitions are unchanged.

The native reader uses 8-point gutters and compact shared controls while retaining vertical scrolling, complete artwork and global Standard/Large sizing. The standalone browser consumes generated copies of the native geometry functions (`sync-comic-speech-layouts.ts`). All selected portrait hashes/prompts and the 31 identity checks are in the bilingual package's `top-dialogue-art/` and `speech-overlay-review.md`. Earlier lower-edge fallback and fixed-top/30-point tail experiments are superseded. Native all-panel/device/editorial evidence must be stated separately; no OTA/store release is implied.

## Integrated illustrated edition continuity follow-up — 2026-10-19

The integrated 62-page edition was re-read in page and panel order after a missing answer was found in its Siddhashrama flashback. Page 17 now answers Rama's hermitage question, identifies Siddhashrama, frames the Vamana–Bali sequence as Vishwamitra's recollection, and returns to the present arrival. A full 62-page/199-panel continuity audit found no other high-confidence unanswered question or broken cause/response transition; the remaining episode changes are cued by page titles or narration. See `docs/content-parity/ramayan-comic/balakanda-illustrated-v3/continuity-audit-2026-10-19.md` and the four-language regression in `mobile/src/data/__tests__/comics.jest.test.ts`. This does not close human Gujarati/Kannada review, independent two-publication collation, human editorial approval, or full native Standard/Large review.


## Whole-book layout planning review — 2026-10-16

The approved four-language Parashurama sample established the user’s preferred inked comic direction and allowance for natural scrolling. It did not rebuild the book. The subsequent full review is now recorded in [balakanda-layout-plan/README.md](../../docs/content-parity/ramayan-comic/balakanda-layout-plan/README.md): all 140 current panels,29 episodes and77 sarga arcs were inventoried; complete hi/en narratives and every adjacent transition were read, and28 current-run browser-model sheets cover560 Standard/Large states. Hindi Standard in the 390×604 reference model leaves at least30% unused on 81 pages and at least50% on 7. These are browser-model measurements, not native-device results.

The review draft proposes 62 pages:8 with one row,19 with two and35 with three. Its199 frames include 59 additional shots separating existing actions and responses; all 140 original panel IDs remain mapped in source order.70 draft dialogue frames and9 named teller captions are planning paraphrases, not verified scripture quotations. [PAGE-PLAN.md](../../docs/content-parity/ramayan-comic/balakanda-layout-plan/PAGE-PLAN.md), [current-panel-inventory.json](../../docs/content-parity/ramayan-comic/balakanda-layout-plan/current-panel-inventory.json) and [panel-to-page.csv](../../docs/content-parity/ramayan-comic/balakanda-layout-plan/panel-to-page.csv) contain every row, source fact, transition and proposed destination. The interactive storyboard wall shows existing reference art; repeated references are not approved new shots or balloon placements.

Before full-book generation: review the page grouping, compare changed speech in two publications, finalise all four complete language scripts, then review every new art frame/hash and the full native Standard/Large sequence. The historical154 source fetch records point to a missing /tmp cache and do not establish current editorial collation. Derive coverage from panel sarga unions: bk-06 includes 1.22 and bk-16 includes 1.48 despite their narrower heading labels. Chapter jumps inside a shared page need a stable frame anchor. No production reader, book payload, image manifest, CDN or OTA change was made by this planning review.


## Complete illustrated multilingual preview — 2026-10-16

The user rejected the reference-image storyboard because it repeated paintings, and requested every screen to match the accepted Parashurama comic. The local prototype now contains62 selected page sheets/199 distinct framed shots:59 newly generated built-in ImageGen sheets plus three accepted Parashurama sheets used once each. All140 original panel IDs remain in order across77 sarga arcs. The62-page grouping is8 one-row/19 two-row/35 three-row;70 dialogue frames, concise captions and silent reactions retain full narrative causes and consequences.

`docs/content-parity/ramayan-comic/balakanda-layout-plan/illustrated-preview-review.md` records every page/transition and evidence boundaries. `illustrated-preview-script.json` contains196 live text blocks and62 titles in Hindi, English, Gujarati and Kannada. `illustrated-preview-assets.json` retains selected hashes, measured frames, visual findings, exact prompts/reference provenance and the absolute saved project/artwork paths. No preview art was registered in production.

Reader: http://127.0.0.1:8745/?book=full . Actual illustrated overview: http://127.0.0.1:8745/full-book/index.html . Include `index.html`: the directory-only URL falls through to the Vite app. `?book=sample` preserves the accepted four-page Parashurama preview. The default root now opens the full book.

Measure actual selected-language fonts and permit natural scroll; do not force paired panels to equal heights with blank paper/sky padding. Excessively tall narrow balloons can widen and flow above the complete painting while retaining the speaker pointer. Asset frames follow inspected ink boundaries and never caption length. Original generation dimensions may differ from requested dimensions; metadata records measured output.

Final agent/browser checks cover496 reader states (62×4 languages×2 sizes,393×852) and48 overview captures. All selected paintings loaded, text stayed contained, and no horizontal overflow occurred; all overview ranges were visually inspected, with focused1:1 Parashurama comparison. Maximum Large page height was2.71 reader viewports. The shortest page content still exceeded the613px reader viewport, eliminating the original short-page bottom band without stretching art. Preview build and28-file runtime-integrity checks passed; Pixel427×952 was a browser smoke check only.

All four full narrative translations are now authored preview drafts, superseding the earlier Gujarati/Kannada-authoring gap. Human editorial approval, complete independent two-publication collation, rights/release clearance and full native Standard/Large sequence inspection remain pending. Fresh English77-sarga fetches succeeded; Hindi raw requests returnedHTTP406. This is source-access evidence, not complete collation. Production mobile source, app asset/frame registries, CDN and OTA were untouched; no commit, upload or release was performed.


## Complete Ayodhyakanda preview — 2026-10-22

`docs/content-parity/ramayan-comic/ayodhyakanda-preview-v1/` contains the next complete local illustrated review edition: 81 pages, 269 distinct framed shots, 189 dialogue frames, 69 captions and 11 silent frames across all119 sargas. Four full hi/en/gu/kn adaptation drafts and explicit recollection/parallel-scene bridges include the complete ending through Atri/Anasuya and the onward forest path. `PACING-REVIEW.md` records each page and transition; `asset-review.json` selects all81 agent-reviewed paintings with actual dimensions, hashes, independently measured boundaries and speaker endpoints. Rejected candidates and exact generation/repair provenance remain available.

The review wall at http://127.0.0.1:8746/ provides the complete book, ranges, row filters, sequential enlargement, four languages, Standard/Large and full-story text. Natural scroll preserves complete art. All81 pages passed layout measurement in24 combinations (four languages, two sizes,320/390/430px); the final five-panel recollection repair passed24 additional focused states. Representative live lettering/scroll views and every selected source painting were visually inspected. See `REVIEW.md`, `browser-layout-checks.json` and `validation.json` for the evidence limits.

This is ready for whole-book user review, not accepted native delivery. User acceptance, human editorial/four-language approval, complete independent two-publication collation, rights/release clearance and native Standard/Large sequence checks remain pending. English publication fetches succeeded for117 chapters;25 and40 retain local/contents anchors after missing prose URLs. The preview does not activate Ayodhyakanda, register production image frames, upload CDN assets or release app changes. Integrate only after the requested whole-book preview review.

## Ayodhyakanda continuity and costume correction — 2026-10-25

The user found a real missing introduction on page 20 and relationship-inappropriate dialogue. The complete four-language follow-up is recorded in `ayodhyakanda-preview-v1/CONTINUITY-COSTUME-REVIEW.md`: 95 text fields on 52 pages now clarify identities, motives and responses, including Trijata, the messengers, Jabali and the sandal regency. Dialogue uses relationship-specific respectful forms. This corrects the earlier overly broad continuity-complete wording; layout validation alone did not detect these editorial gaps.

Ten selected art replacements fix present forest clothing or recollection chronology. Sita’s fine departure clothing is source-supported (2.38.3–6; 2.39.13–18); simple everyday forest ochre is art direction. Guha’s page-52 flashback matches page 30, while page 79 retains bridal dress only in the wedding recollection. Actual hashes/frames are updated, including the real page-34 divider instead of a false night-sky band. All revisions are built into the local preview and structural validation passes. Final live browser observation was denied by browser security policy, so previous browser geometry evidence does not verify this revision. Human editorial, source collation, native checks and integration remain pending.
