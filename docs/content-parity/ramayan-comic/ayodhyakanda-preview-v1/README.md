# Ayodhyakanda whole-book comic preview

The user requested the next complete kanda in the accepted Balakanda comic design, with a whole-book illustrated preview before integration. This package contains the complete local illustrated preview, updated after the user’s continuity and costume findings. The final live layout recheck remains pending. It does not enable Ayodhyakanda in the app.

## Complete story draft

- 81 pages, 269 distinct planned scenes, all 119 sargas mapped.
- 189 dialogue frames, 69 caption frames and 11 intentional silent frames. All 258 non-silent text blocks, additional transition captions and 81 titles are authored in Hindi, English, Gujarati and Kannada. These are original adaptation drafts, not scripture quotations or approved translations.
- [page-plan.json](page-plan.json) records every scene, row, source chapter, character/appearance contract and generation prompt. [script.json](script.json) is the sole lettering source. [PACING-REVIEW.md](PACING-REVIEW.md) records the complete reading order and every next-page handoff.
- [source-coverage.json](source-coverage.json) maps the checked-in 4,262-verse source corpus to the complete 119-sarga arc. The comic condenses repeated appeals, genealogies and extended ritual descriptions; it is not a verse-by-verse transcription.

## Continuity decisions

Manthara is introduced as Kaikeyi's attendant, Guha as Rama's friend and Nishada ruler, Jabali as a counsellor, and Anasuya as Atri's wife and an ascetic before their interventions. The king's confirmation of the boons, the instruction before Trijata's gift, the proposal to send a royal escort and Bharata's offer to substitute for Rama's exile each receive an explicit response panel.

The preparations/Manthara strands have an explicit earlier-day cue and a return to the ceremony morning. Dasharatha's old hunting mistake, Guha's recollection and Sita's marriage account each have entry and return framing. Parallel Ayodhya/Chitrakuta events are identified as such.

The brothers retain unmatted hair through departure and bind matted locks only with Guha's banyan latex (local 2.52.67–70). Bharata's vow to wear bark and matted hair already appears at local 2.88.26, before the reunion; he must not retain princely dress until Nandigrama. No automatic crowning or face reset occurs at the kanda boundary. The sandal handover follows the request, and one pair represents Rama's authority. The ending includes the ascetics leaving Chitrakuta, Atri and Anasuya, Sita's recollection, the gifts, night rest and the onward forest path.

## Artwork and preview

Every scene needs its own painting; selected Balakanda pages and model sheets are style/identity references only. The built-in `image_gen` tool is used for new images and repairs. Tool-controlled model, quality and size settings are not exposed in this workflow. Actual output dimensions, the exact prompt, reference paths, original saved path and selected/rejected versions are retained beside the assets. The new six-character supporting sheet is an authoring reference, never reader artwork.

`asset-review.json` selects the actual page images and their individually measured painted rectangles. A generated file is not automatically visually approved. No fixed crop percentage or assumed equal grid is valid. The review wall uses live text, preserves full artwork, permits natural scroll and does not force paired panels to equal heights. Its status counter shows the complete page, scene and illustrated-page counts.

Build and serve locally:

```sh
python3 scripts/build-preview.py
python3 scripts/validate-preview.py
python3 -m http.server 8746 --bind 127.0.0.1
```

Open `http://127.0.0.1:8746/`. Language/size switching preserves the selected page. The wall provides all pages, page ranges, row filters, enlargement, sequential reading and the full story text. `validate-preview.py --complete` must pass before calling this the finished whole-book illustrated preview.

## Evidence boundaries and next steps

The source manifest records 117 successful English publication fetches and two missing prose URLs (25 and 40); those chapters retain their local corpus and contents-page anchors. The Hindi publication's complete contents page was read, while complete independent passage collation is still pending. A successful fetch is not editorial verification. Source numbering and counts must be checked by passage rather than silently equating different publications.

The original four-language draft has received an authoring continuity pass; human editorial/language approval remains open. All 81 selected paintings have received an agent visual review. The earlier 2026-10-22 browser layout checks cover all 81 pages in four languages, two text sizes and three phone widths (320, 390, 430px); focused screenshots inspect lettering, recollection attribution and the ending. See REVIEW.md and browser-layout-checks.json. These checks do not replace user acceptance, human editorial review or a native walkthrough. Native walkthrough, production asset maps, CDN delivery and app activation belong to the later integration phase.

Workflow: finish the whole illustrated preview → user reviews the whole book → integrate the accepted edition using the existing native comic reader. No app integration, CDN upload or release is included in this preview package.

## 2026-10-25 follow-up

[CONTINUITY-COSTUME-REVIEW.md](CONTINUITY-COSTUME-REVIEW.md) records the complete 81-page follow-up, 95 text-field revisions across 52 pages and ten selected art replacements. All changes are now built into preview-book.json. The previous browser measurements predate these changes. A fresh live browser check was attempted but blocked by browser security policy; source/image validation passes, while current layout verification remains pending.

## Preview package checks — 2026-10-26

The preview builder, complete structural/language/image-hash/frame validator, JavaScript syntax check and whitespace check pass. These checks do not close the current live visual, human editorial/source or native review gaps above. The bundled preview fonts include their SIL Open Font License notices in `assets/fonts/`. Python 3 is sufficient to build and validate; the optional frame-proposal/contact-sheet helper additionally requires Pillow. Historical image candidates are retained for review and do not enter the mobile app bundle.
