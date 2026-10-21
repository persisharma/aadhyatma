# Puja Vidhi illustrated timeline

Selected direction: option 3. Current image/text audit: 21 October 2026.

## Current result

- All seven published guides and all 106 bilingual steps reviewed against the actual saved paintings.
- 52 steps received updated images or ordered image sequences; 35 new paintings saved.
- Deity-specific flower/leaf choices replace generic cross-deity reuse. Shared lamp and water scenes are flower-free.
- Full original instructions and all 12 transcribed mantras unchanged. Combined-action captions reuse exact authored clauses, including the metal/clay alternatives.
- All 63 selected images integrate through R2 under immutable content hashes and the existing persistent artwork cache. No step paintings are bundled. Local originals are publishing/review inputs.
- R2 upload and CDN verification remain pending for the user's later push. Unavailable artwork leaves neutral paper and usable complete text; no release was performed.

[View all 106 image/text pairs](full-review.html). [Complete step audit, references and upload handoff](semantic-audit.md). [Flower comparison](flower-review-preview.jpg).

`step-review.json` pins every bilingual instruction hash, ordered image hashes, observed subject and depiction limit. `asset-inventory.json` tracks all 69 saved generated paintings, including unselected historical assets. `audit-art-prompts.json` records the 35 new built-in imagegen outputs/prompts and edit references. The existing Panchang image is reused as one of the 63 R2 sources. All eight selected-image contact sheets were visually inspected.

## Checks

TypeScript, focused ESLint, 72 tests across five Jest suites, five reported pure content/visual checks, local R2 source/manifest verification and staging passed. Existing language-provider hydration act warnings remain in the Jest output. Semantic tests detect changed instructions, mappings or bytes and require review; they do not recognize flowers or certify ritual correctness.

The original native review covered Diwali Standard/Large, full mantra/IAST scrolling, remembrance, Gita hand-off/return, resume and completion. Ganesh snana/upachara was subsequently reviewed natively with paired captions. Those native art screenshots predate the full audit and R2 conversion. Current saved compositions and all 106 assignments have been reviewed; a complete new native/device/language walkthrough and post-upload CDN delivery have not been established.

## Delivery

```sh
node scripts/prepare-vidhi-artwork.mjs
node scripts/prepare-vidhi-artwork.mjs --verify
# Later, for the actual R2 push:
node scripts/prepare-vidhi-artwork.mjs --upload --wrangler
node scripts/prepare-vidhi-artwork.mjs --verify --cdn
```

The default command stages only the selected files under `scripts/.cache/vidhi-steps`. It makes no network calls. Upload uses the existing R2 publisher; the CDN check compares the full SHA-256 of every public object. The app manifest is already wired as the user requested; publish and verify the objects before deploying the app change.

Historical native evidence remains under `docs/evaluations/puja-visual-guide-2026-10-20/`. The original `contact-sheet.jpg` shows the early 33-image set; `audit-contact-sheets/01.jpg`–`08.jpg` show the current 63 selected images. No commit, git push, upload or deployment was performed in this audit.
