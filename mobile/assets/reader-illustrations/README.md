# Reader illustrations

Standalone, full-canvas 2:1 devotional banners, using the approved Krishna Janma storybook
rendering: fine warm outlines, expressive faces, muted pastel fills, warm paper texture and
retained scene detail. These provide visual context above reading text. Background textures and
faded reading surfaces stay in the separate `backgrounds` category.

Only visually approved, optimized WebP files belong here. Master PNGs and unapproved variants
stay in evaluation directories. Do not add static `require()` calls for these assets.
`approved.json` maps each accepted filename stem to the SHA-256 of its exact reviewed WebP.
Example entry after human visual approval: `"deity-krishna-bansuri": "<full SHA-256>"`.
All 43 detailed Style 3 paintings are approved and published. The two Hanuman scenes include
the requested gada corrections. Exact selected hashes are recorded in `approved.json` using
`krishna-storybook-detail-v2`; all 44 legacy reading slots resolve through the active manifest.
Current reading backgrounds are retained. The full gallery and publication evidence are in
the evaluation directory below.

R2 prefix: `reader-illustrations/<content-hash>.webp`.
Manifest: `mobile/src/data/readerIllustrationManifest.json`.
Legacy semantic mappings: `readerIllustrationAliases.json`. Publishing an approved replacement
activates it for reader banners only; the existing background source remains available for
background surfaces. Both categories use the same asynchronous, bounded lifetime cache.

From repository root:

```sh
node scripts/prepare-reader-illustrations.mjs            # local staged manifest only
node scripts/prepare-reader-illustrations.mjs --verify   # compare approved bytes/dimensions
node scripts/prepare-reader-illustrations.mjs --upload   # publish, then update app manifest
# Existing authorized Wrangler OAuth may be used with --upload --wrangler.
```

Style/scene briefs and references:
`docs/evaluations/reading-visuals-2026-10-11/style3-full-set/`.

Gita Saar's first prototype used `gita-saar-karma-garden` at karma 2.47; that
published object remains available but the current reader opens every theme
with a distinct, source-grounded story painting. The sixteen approved
`gita-saar-story-<theme>` WebPs are 960×480, published under immutable hashes,
and rendered with `contain` so complete subjects remain visible. Their story
sources, prompts, rejected scene, visual review and exact hashes are recorded
in `docs/evaluations/gita-saar-stories-2026-10-26/`. The active manifest now
contains 60 approved paintings; existing backgrounds remain unchanged.
