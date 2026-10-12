# Superseded detailed-painting drafts

The user requested the Krishna kids-story style and a separate Reader illustrations category.
All four drafts in this directory are superseded, including the three previously reviewable
ones. Current reference-based briefs/status live in ../reader-illustrations/. The remaining
content below is historical generation and inspection evidence.

# New compact reading artwork drafts — 10 October 2026

Three new paintings are ready for visual review, composed natively for a 2:1 canvas:
Daan/Annapurna, Hanuman–Sita and Gita/Vishvarupa. The prior focal crops were rejected by the
user. New art must show the complete meaningful subjects within a short banner, avoiding
portrait-height scrolling. Two Vishnu slots can share one painting: 43 unique paintings are
planned for 44 image slots.

## Current outputs and inspection

| Draft | Review file | Bytes | Inspection |
| --- | --- | ---: | --- |
| Daan / Annapurna | daan-annapurna.webp | 105,466 | Both principal figures, offering action, hands and feet visible. Generator added Nandi and a small Om mark on a background shrine; include these in editorial approval. |
| Hanuman and Sita | hanuman-sita.webp | 115,932 | Both principal figures, hands, feet and tail inside the frame. |
| Gita / Vishvarupa | gita-vishvarupa.webp | 105,452 | Principal cosmic figure and kneeling Arjuna visible; peripheral chariot scenery reaches the canvas edge. Symbolic depiction requires iconography approval. |
| Vishnu / Narayana | vishnu-narayana.webp | 90,916 | Held: extra fifth arm holding a lotus. Must correct and inspect before adoption. |

All originals are 1774×887 PNGs copied into `raw/`. The review WebPs are 960×480, encoded with
`cwebp -q 76 -m 6 -resize 960 480`. This preserves the entire image canvas with no crop. Full
prompts, tool source, raw/review paths, dimensions, byte counts and SHA-256 values live in
`records/*.json`. Generation used the built-in `image_gen` tool. These are generated illustration
drafts; no religious prose or kids-story content was authored or changed.

The browser comparison loads all six before/after image elements. Each after is 360×180px
from a 960×480px source, with natural responsive height and no crop, at the normal browser
viewport. `../new-banner-before-after.png` is the actual full-page browser capture. This is
artwork-layout evidence, not native screen, R2 transport or physical performance evidence.

## Blocker and resume

Further built-in generation and the Vishnu edit returned HTTP 401 `token_revoked`:
`Encountered invalidated oauth token for user, failing request`. Stop unchanged authentication
retries. Restore image-service access, then retry one job before resuming the queue. The imagegen
skill permits the bundled API/CLI fallback only when the user explicitly selects it and an
`OPENAI_API_KEY` is configured. Never print or ask the user to paste a key into chat.

`prompts.json` contains the full common and per-asset prompts plus the targeted Vishnu edit.
`jobs.json` lists the 39 remaining paintings and existing semantic asset stems. For future
generation use one image call per distinct asset, preserve the 2:1 composition, inspect every
output and stop new scheduling immediately if authentication fails again. Shrine scenes are
thematic illustrations, not verified photographs of site architecture.

## Adoption and performance boundary

No new artwork is in `mobile/assets`, no new R2 object has been uploaded and no app manifest,
cache or semantic mapping was changed by this drafting pass. The existing R2 cache continues
to serve valid content-hash files without TTL, HEAD or revalidation, with immediate bundled
fallback and deferred asynchronous downloads. After visual approval, optimize/publish approved
files to R2 before changing manifest hashes and mappings. Only changed content should fetch
again. Confirm the app shows complete new banners at Standard/Large sizes and record successful
native R2 reuse, offline fallback and device performance before final release sign-off.

## Preview recovery

The preview server had stopped. It was restarted detached on 127.0.0.1:8095, serving
`docs/evaluations`. The live review at `../all-image-fit.html` uses local files; it does not depend
on the CDN. If the host restarts, run `python3 -m http.server 8095 --bind 127.0.0.1 --directory
docs/evaluations` from the repository root. `build-preview.py` regenerates the page and status
records without touching app assets or R2.
