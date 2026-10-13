# Full bilingual review — 2026-10-12

## Speaker-pointer correction — 2026-10-13

The earlier geometry checks did not establish correct speaker attribution: every flowing balloon used a fixed left-side tail. The user identified Vashishtha's dialogue pointing toward Dasharatha in bk-06-03. All 31 dialogue panels have now been matched to their depicted speakers; `speaker-anchors.json` records each normalized horizontal position and a character-identification note. The renderer aligns each flowing tail with that position inside the visible painted frame. The approved Dasharatha side bubble remains, and its narrow/Large fallback uses the reviewed anchor.

All 140 panels passed browser layout checks in Hindi/English, Standard/Large, at 320/390/768/1440px: 2,240 panel states. Checks cover image loading, horizontal text/panel bounds, narration outside art, continuous closed outlines, flowing tail alignment and tail/art clearance. All 31 dialogue panels were visually inspected in both languages at Standard/390px and Large/320px (124 dialogue renders), including Sumantra at the left edge, Janaka at the right edge, the inverted Trishanku and the side-bubble fallback. `speaker-validation.json` records this review separately from the earlier report.

Fresh full bilingual captures of all 29 episodes and narrow/Large captures of all 21 episodes containing dialogue are under `.context/speaker-audit/`. The full DOM results and screenshot indexes are there too. Narrative text, panel sequence, source references, image bytes and painted frames are unchanged. Native/editorial/four-language release checks remain pending; these changes concern the local bilingual preview.

## Scope and evidence boundary

Agent-reviewed local authoring edition: 29 episodes / 140 panels, Hindi and English. All 29 complete episode sequences were visually inspected with actual text in side-by-side 390px columns, including the last panels and the four marriages. This is not independent editorial certification, a verse-by-verse translation, the whole seven-kāṇḍa epic, or native app validation.

The full Hindi and English narratives were read for aligned actors, motives, responses, consequences, names and time transitions. Each panel’s causal/art note, source reference, predecessor/successor and exact bilingual text hash is recorded in `pacing-review.json`. Gujarati and Kannada are absent, not silently treated as verified.

## Corrections

1. Retain the four-panel approved bk-05 pilot, with the existing greeting in its own close-up. Shared full-bounds artwork and compact flowing text protect the scene.
2. Rama’s question about the river roar now receives its Sarayu–Ganga answer before entry into Tataka’s region. [Bāla 24.8–11](https://www.valmikiramayan.net/utf8/baala/sarga24/balaroman24.htm).
3. Replace bk-08-04 with an explicit non-graphic falling Tataka scene at dusk. State her death in both languages. Add the night-rest panel and the next-morning wording before the weapon lesson. [Bāla 26.22–26, 33–36](https://www.valmikiramayan.net/utf8/baala/sarga26/balaroman26.htm).
4. Insert bk-09-02a: the trio resumes walking, sees the grove/hermitage, and Rama asks whose it is. Introduce Vamana as Vishwamitra’s answer about that place’s past; explicitly return to the present arrival afterward. [Bāla 28.16–22](https://sanskritdocuments.org/sites/valmikiramayan/baala/sarga28/balaroman28.htm), [Bāla 29.1–4](https://sanskritdocuments.org/sites/valmikiramayan/baala/sarga29/balaroman29.htm).
5. Keep Maricha’s survival distinct from Subahu’s death. English now says “killed him,” matching the existing Hindi outcome and fallen figure, rather than the potentially ambiguous “struck him down.”
6. Remeasure the Trishanku sheet’s actual gutters: the former middle-row frame leaked the next starry scene and removed part of the bottom row. Row boundaries are now 0–440, 443–877, 881–1330; column boundary 590/594 on the 1182px sheet. These are painted-scene bounds, not caption-dependent cuts. Source PNG is unchanged.

The added Hindi/English dialogue is an adapted question, not a claimed verbatim Sanskrit quotation. The Sanskrit Documents pages are a mirror of the same publication, not a second independent source. Existing source-fetch records are retrieval evidence, not a substitute for a complete independent publication comparison.

## Visual and language review

- Prologue remains marked as later time, then returns to Dasharatha; Rishyasringa’s invitation precedes travel to Ayodhya.
- Three mothers/four infants; four brothers and their bonds; youthful Rama and elder present-day Vishwamitra remain distinct.
- Tataka: background → restraint → attack → visible decisive fall → night rest → next-morning instruction. Hermitage: instruction → journey/question → ancient answer → present arrival.
- Journey stories retain their framing and return points. Sagara’s consequence and Bhagiratha’s multi-generation task remain connected. Jahnu’s image is symbolic rather than a literal depiction of drinking a river.
- Ahalya remains unseen during penance, not a stone. Shatananda is her son. Vishwamitra’s retrospective progresses from king through ascetic life to elder recognition.
- Shunahshepa’s peril, request, prayers and survival remain explicit. The anger/self-restraint arc closes before returning to Mithila.
- Shiva’s broken bow and the unbroken Vaishnava bow are distinct. Four couples are separately named: Rama/Sita, Lakshmana/Urmila, Bharata/Mandavi, Shatrughna/Shrutakirti.
- Parashurama’s alternatives and chosen loss precede his departure. Return to Ayodhya ends Bālakāṇḍa without appending exile or coronation.

Every cover reuses its episode’s reviewed first painted panel; no new cover art or text baked into artwork. Original wide panoramic panels remain wide instead of being cropped to imitate 4:3. Some carry a higher text-to-art ratio, especially at Large; the scene is preserved and the reader scrolls rather than shrinking type or hiding copy. Symbolic/composite scenes remain adaptations, not a claim that each narrated action has an individual literal illustration.

## Browser checks

`browser-validation.json` records all 140 panels × Hindi/English × 18/23px × 320/390px: 1,120 panel states. Checks cover all loaded images, text-line bounds inside panels, no line clamp, no horizontal page overflow, narration outside painted art, continuous closed balloon outlines and safe tail clearance. This is DOM/browser evidence, not a native-device test.

Visual captures of all 29 bilingual episodes are saved under `.context/ramayan-preview/full/bk-XX-paired.png` (gitignored). Additional narrow Large screenshots, corrected-frame close-ups and interaction checks are recorded there. Screenshots are real browser renders, not rasterized text mockups.

## Release gates still open

Independent source/editorial approval; full Gujarati/Kannada narratives and four-language parity; sensitivity and rights review; final acceptance of the whole edition; mobile integration; actual iOS/Android Standard and Large sequence; production asset-frame registration; WebP/CDN/offline checks. Authoring PNGs are intentionally not added to `mobile/src/components/kidsStoryArtFrames.json` because no native story references them.
