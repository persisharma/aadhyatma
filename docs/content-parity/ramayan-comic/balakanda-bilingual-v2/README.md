# Bālakāṇḍa — bilingual comic review edition

29 complete episode sequences, 140 illustrated panels, Hindi and English. This expands the user-accepted `lettering-pilot-v1/fitted.html` layout across the existing Bālakāṇḍa draft. It does not generate the other six kāṇḍas or publish a mobile story.

## Open

From the repository root:

```sh
node docs/content-parity/ramayan-comic/balakanda-bilingual-v2/build-book.mjs
python3 -m http.server 8743 --bind 127.0.0.1 --directory docs/content-parity/ramayan-comic
```

Visit <http://127.0.0.1:8743/balakanda-bilingual-v2/>. The server must serve the parent comic directory: this edition reuses artwork from `balakanda-v1/` and `lettering-pilot-v1/`. Do not copy this folder alone.

- `?lang=en#bk-08`: English Tataka episode; language buttons retain the episode.
- `?compare=1#bk-09`: Hindi/English side-by-side comparison, stacked on narrow screens.
- `?lang=hi&size=large#bk-26`: larger Hindi wedding text.
- `#all`: all 140 panels for the reproducible full-book layout audit.
- `#sources`: provenance and remaining approval gates.

## Contract

Narration reflows in a compact cream compartment **inside the panel border**, above the painted scene. It never overlays faces. Dialogue uses native text and a single continuous SVG balloon outline, including its tail. The approved Dasharatha close-up retains its side balloon; it reflows above the art when too tall. Standard is 18px, Large is 23px, with unrestricted vertical scrolling. No ellipsis, smaller fitted type or caption-driven crop.

Both languages use the same text-free artwork. Original source sheets are displayed through measured painted-panel frames; full originals remain accessible under each panel. New standalone illustrations retain their entire 4:3 bounds. Frame geometry is independent of caption length.

## Authoring and verification

- `english.json`: original English adaptation aligned with the existing Hindi narrative, not copied publication translations.
- `revisions.json`: approved pilot, source-backed continuity corrections, explicit Subahu outcome and remeasured Trishanku frames.
- `pacing-notes.json`: manually authored causal/art review for every panel. `pacing-review.json` adds exact bilingual text hashes, source references and previous/next IDs.
- `build-book.mjs`: validates all 29 episodes/140 panels, all 77 sarga references, Hindi/English dialogue parity, unique IDs, frame bounds, asset existence, actual PNG dimensions and SHA-256 hashes.
- `asset-manifest.json`: local authoring frames/hashes only. `art-prompts.json`: exact new generation/edit prompts and selected repair.
- `REVIEW.md` and `browser-validation.json`: completed browser review and its limits.

The original 137 panels remain in sequence; the approved Dasharatha close-up, post-Tataka night rest and hermitage-question bridge add three. Tataka’s former ambiguous final scene is replaced, not retained as a second outcome.

**Not a production release:** independent Sanskrit/Hindi/English editorial approval, Gujarati/Kannada full narratives, rights clearance, native Standard/Large sequence review, production art/frame registration and CDN/offline delivery remain pending. No mobile registry, production manifest or CDN upload changed.
