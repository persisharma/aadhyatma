# Vedansh Bālakāṇḍa comic — complete Hindi authoring draft

2026-10-11. The approved Option 2 inked comic direction, richer colours and cream/copper shelf are carried through **29 episodes, 137 illustrated panels and 55 reading pages**. The chapter arc covers all 77 sargas of Valmiki's Bala Kanda, from the poetic framing through Ayodhya's homecoming. This is a comic retelling, not a verse-by-verse edition or an exhaustive genealogy list.

Open [the reader](http://127.0.0.1:8743/balakanda-v1/index.html). Select an episode on the shelf, scroll vertically within a page, and swipe horizontally to turn pages. Desktop also provides previous/next controls and arrow keys. “बड़ा अक्षर Aa” enlarges the Hindi text. “स्रोत व रूपान्तरण” explains the adaptation.

To run again from the repository:

```sh
python3 -m http.server 8743 --bind 127.0.0.1 --directory docs/content-parity/ramayan-comic
```

## Content and provenance

- [story.tsv](story.tsv) is the editable, original Hindi narration/dialogue and per-panel art brief. Dialogues are source-based paraphrases, not verbatim scriptural quotations.
- [book.json](book.json) is the reader contract: stable episode/page/panel IDs, sarga anchors, separate text, selected image and measured panel rectangle. `build_book.py` regenerates it.
- [pacing-review.md](pacing-review.md) records every panel and every next transition. [transition-review.json](transition-review.json) explains the causal connection and frame changes.
- [source-fetch-manifest.json](source-fetch-manifest.json) records 154 fetched chapter pages across two publications, including exact URLs and response hashes. Fetching is not editorial comparison.
- [source-review.md](source-review.md) distinguishes the completed authoring pass from pending independent review.

## Artwork and character continuity

The built-in **image_gen** tool produced all artwork. [prompts-selected.json](prompts-selected.json) retains successful generation prompts, targeted edits, reference hashes and selected output hashes. Initial attempts and discarded revisions are retained separately for traceability. No CLI/API fallback was used.

All 29 selected episode sheets are in `assets/`; four additional character reference families are in `character-models/`. The parent character bible still governs Rama, Lakshmana, Sita and the other approved identities. Infant/child/adolescent Rama remain distinct from the explicitly later-time adult king in the prologue. Vishwamitra's retrospective changes age while his present journey/farewell remains elderly. Four wedding pairs and the two bow states are tracked explicitly.

[asset-review.json](asset-review.json) records all final hashes, dimensions, individual painted-panel boundaries and visual authoring notes. Panel heights are measured from each image's ink gutters; equal-height assumptions are not used in the reader. All painted scene content is retained. Captions and speech bubbles belong to the HTML layout, outside the text-free artwork. No lower caption band is reserved or trimmed inside art. The full source sheet remains available from every panel.

## Checks and release boundary

The complete web sequence was exercised at standard 18 px and large 23 px Hindi captions: all 55 pages/137 panels, loaded artwork, bottom reachability and no horizontal overflow. A 390 × 844 responsive shelf/reader check and swipe navigation are recorded with screenshots and [browser-checks.json](browser-checks.json). These are browser checks, not native-device evidence.

This package remains a local authoring draft. English, Gujarati and Kannada full narratives, aligned-meaning review, independent Sanskrit/Hindi editorial approval, rights review, production asset/frame manifest, CDN/offline fallback and the complete native Standard/Large sequence remain pending. No mobile story, bundled artwork, remote upload or public release is activated by these files. The production image registry must receive final reviewed assets and hashes only during that integration.
