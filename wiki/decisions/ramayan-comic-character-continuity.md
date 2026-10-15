---
title: Ramayan comic character continuity
type: decision
sources: [docs/content-parity/ramayan-comic/README.md, docs/content-parity/ramayan-comic/character-bible.md, docs/content-parity/ramayan-comic/appearance-timeline.json, docs/content-parity/ramayan-comic/source-manifest.json, docs/content-parity/ramayan-comic/asset-review.json, docs/content-parity/ramayan-comic/balakanda-v1/README.md, docs/content-parity/ramayan-comic/balakanda-v1/book.json, docs/content-parity/ramayan-comic/balakanda-v1/asset-review.json, RULEBOOK.md]
last_verified_date: 2026-10-13
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
