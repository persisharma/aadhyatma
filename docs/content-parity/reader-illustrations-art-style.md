# Reader illustration style and purpose

The user requested the Krishna kids-story artwork style on 10 October 2026 and a distinct
category for images that give reading cards a richer visual feel.

## Category boundaries

| Asset category | Purpose | Placement | R2 prefix |
| --- | --- | --- | --- |
| Reading backgrounds | Quiet texture/tinted art behind reading content | Background layer; preserve text contrast | `reading-backgrounds` |
| Reader illustrations | Thematic visual context with complete figures/actions | Separate short 2:1 banner above reading text | `reader-illustrations` |
| Kids-story illustrations | Specific story-page narrative scenes | Existing picture-story reader | `kids-stories` |

“Reader illustrations” is an asset/content category, not a new navigation tab. Use the existing
storybook rendering across the app, while keeping each category's purpose and manifest distinct.

## Style reference

Use the actual approved `mobile/assets/kids-stories/kj-08.webp` and `kj-11.webp` as STYLE ONLY
references. The detailed rules live in [kids-stories-art-style.md](kids-stories-art-style.md)
and [krishna-janma-art-prompts.md](krishna-janma-art-prompts.md). Match fine warm-grey/brown
outlines, graceful expressive faces, broad soft pastel fills, gentle shading, paper grain,
muted terracotta/saffron, sage, slate blue-grey and restrained matte gold. Preserve the app's
warm parchment UI. Avoid photographic gloss, hard black outlines, theatrical glow and
saturated colour. These are devotional illustrations for the whole app.

**Detail is independent of rendering style (11 October clarification).** Preserve characters,
actions, props, architecture, vegetation, garments, ornaments and layered scene information.
Do not remove narrative/background detail merely to make a scene storybook-like. For style
revisions, supply the detailed painting as the edit target/composition reference and the
Krishna images as style-only references. Review both composition fidelity and rendering.
Three scene-preserving revisions are in
`docs/evaluations/reading-visuals-2026-10-11/style3-detail/`; the user accepted these samples.

For future creation, use the saved [Style 3 image template and copyable prompt](reader-illustration-style3-prompt.md).
It preserves the approved detail, reference roles, complete 2:1 composition, Hanuman gada
corrections and export/review checks. The reference-backed personal Codex template is
`$artifact-template-vedansh-style-3-reader-banner`; its retained PNG is independent of the
temporary gallery.

Adopt the rendering and palette, not the references' story, people, setting or portrait format.
Do not copy the Yamuna or cottage into unrelated scenes. No existing kids-story image, caption,
frame/hash or narrative is changed by this category. Revisions to actual kids stories still
require RULEBOOK §29; this work only uses their existing files as style references.

## Banner contract

- Draw a new complete 2:1 horizontal scene. Maximum display size remains 360×180pt, with a
  fixed frame reserved before image loading. No portrait crop or stretching.
- Keep all meaningful figures, crowns, faces, arms/hands, feet, vahanas and key props inside
  the frame. Scale and arrange subjects horizontally; do not cut limbs to fit.
- Use only a narrow parchment edge fade. Do not copy the portrait references' large empty
  lower caption band into a short banner. Native reading text stays below the image.
- No new in-image text, pseudo-script, labels, borders, watermark or UI controls. An existing
  small shrine Om is retained in the Daan style-transfer review to follow the user's request
  to preserve scene details; publication still requires visual approval.
- Inspect connected anatomy, exact character/deity arm counts, held attributes and the
  complete intended action in every generated painting before adoption.
- Store full master PNGs and unapproved WebPs in evaluation folders. Only the exact approved
  optimized WebP enters `mobile/assets/reader-illustrations/`; record its full SHA-256 in
  `approved.json`. R2 uses content-hashed names; the app manifest changes after publication.

## Delivery and approval

`CachedArtwork` is the shared loader for separate typed background/reader assets.
`BackgroundArtwork` accepts background assets; `ReadingBanner` resolves approved replacements
from `readerIllustrationManifest.json` and always contains their entire canvas. Unpublished
replacements retain the current legacy painting; no speculative download is scheduled.

The same existing async lifetime cache supplies both categories. Keep one bounded queue,
navigation/interaction deferral, atomic files, immediate bundled neutral fallback and no
expiry/HEAD/revalidation of valid files. Keep the existing persistent directory so current
downloads are not invalidated merely by this source/category refactor.

43 selected paintings cover 44 legacy image slots; both Vishnu mappings share one illustration.
The user accepted the set, requested gadas in the ocean-crossing and Rama–Hanuman scenes,
then authorized integration. Both corrections were visually checked and all 43 optimized
paintings are published to R2 and active in the illustration manifest. Full-set records in
`docs/evaluations/reading-visuals-2026-10-11/style3-full-set/` retain exact variants, prompts,
references, approval and public SHA-256 verification. The 960×480 files total 4.45 MiB
(61–132 KiB each). Existing backgrounds and the lifetime cache remain unchanged. Scoped
native framing, fallback and controlled-cache relaunch checks pass. Successful native R2
delivery fails simulator certificate validation; full reader/device verification remains open.
