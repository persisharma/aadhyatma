# Vedansh Style 3 — reusable image template

Saved on 12 October 2026 from the detailed Style 3 artwork approved on 11 October.
Use this prompt and an actual approved image together; a style name alone is insufficient.

## Approved reference

The primary example is [the approved Hanuman–Sita banner](../../mobile/assets/reader-illustrations/hanuman-sita.webp):
Hanuman meeting Sita, with complete figures, detailed foliage, cloth, jewellery and architecture.
Its approved SHA-256 is
`0acd6590e27d86c1b4e4e3642e536851789344ed2465c43e922d82f5d59da813`.
The original 1774×887 PNG is saved locally in
`docs/evaluations/reading-visuals-2026-10-11/style3-detail/raw/hanuman-sita.png`, SHA-256
`631a4f2ea25e90e56c12a7ba1a10da1992a8941228b7704d7ccd6824a4971d42`.
The personal Codex template retains this PNG unchanged as `assets/reference.png` and
`assets/preview.png`, so it can be reused independently of the original gallery. That
personal template and the local original PNG are outside this repository's tracked files;
a fresh clone can use the approved WebP linked above as its style reference.

The original Krishna rendering references are `mobile/assets/kids-stories/kj-08.webp`
and `mobile/assets/kids-stories/kj-11.webp`. Use their painting technique and palette;
their characters, setting, portrait format and legacy empty margins are not instructions.

## Reusable design style

Detailed Indian devotional storybook painting, matching the approved Krishna kids-story
rendering and the detailed Style 3 reference. Fine warm-brown/grey outlines; graceful,
expressive faces; muted but readable pastel colours; soft layered painterly shading;
restrained matte gold; subtle warm paper grain. Use warm ivory, dusty saffron/terracotta,
sage and slate blue-grey with the scene's appropriate colours. Retain rich narrative and
environmental detail: meaningful props, cloth folds, jewellery, architecture, vegetation
and layered backgrounds. Keep tonal separation, depth and clear silhouettes at small size.
The result should feel warm, dignified and hand-painted, with the app's cream/copper theme.

Detail must not be reduced to achieve this printing/rendering style. Avoid flat minimal
icons, chibi proportions, photorealism, 3D gloss, heavy sepia, harsh black outlines,
neon colours or theatrical glow. Match the reference's rendering, not its specific scene.

## Scene input template

Fill this brief from the requested scene and verified content before generation. An edit
must also identify the exact target image, required changes and details to preserve.

```text
Asset purpose: opening reader banner / another explicitly specified format
Scene and source: [event; approved story/page or other source]
Characters and counts: [names, ages/appearance, exact figure count]
Action and emotion: [who does what; relationships; expression]
Setting and time: [location, architecture, vegetation, lighting]
Iconography: [specified arms/hands, attributes, vahanas and held objects]
Pose and grip: [anatomical left/right; connected hands; prop positions]
Required details: [crowns, feet, tails, instruments, shrine arches, etc.]
Exclude: [adjacent-scene props/characters that must not appear]
Reference roles: [style only / character identity / subject reference / edit target]
```

Do not guess deity arm counts, attributes or narrative details to fill the frame. Resolve
them from the requested, approved scene. A style reference is not evidence for a new event.

## Copyable reader-banner prompt

Attach the approved Style 3 image (the shipped WebP or retained master PNG) as the style and
format reference. Attach a separate subject
or character reference when needed, and explicitly label its role. Replace the bracketed
scene fields; keep the rendering and composition requirements.

```text
Use case: illustration-story.
Create ONE NEW richly detailed devotional reader illustration for the Vedansh app.
Opaque EXACT 2:1 horizontal landscape canvas, e.g. 1774×887 or 1920×960.

Reference roles: The attached approved Style 3 banner supplies the rendering, detail
density, palette and compact horizontal format. Depict ONLY the requested scene below;
do not copy its characters, garden, buildings or other scene-specific objects. Any
additional image is [subject reference / character identity / edit target], as labelled.
Its square or portrait dimensions are not the banner format.

Rendering: Elegant fine warm-brown/grey outlines, graceful expressive faces, muted yet
legible pastel colours, soft layered painterly shading, detailed cloth and ornaments,
matte gold and subtle warm paper grain. Match the approved Krishna storybook Style 3.
Retain rich narrative and environmental detail: architecture, vegetation, meaningful
props, jewellery, fabrics and layered backgrounds. Do not simplify or remove detail
merely for the storybook rendering. Preserve tonal separation, clarity and depth without
photographic gloss, flat minimalism, a heavy sepia wash or theatrical glow. Keep the
warm ivory, terracotta/saffron, sage and slate blue-grey family of the app's theme.

Composition: Draw a complete NEW landscape arrangement appropriate to this scene.
Recompose sideways instead of cropping, stretching, letterboxing or shrinking a portrait
canvas. Every meaningful subject, crown, face, connected arm/hand/leg, foot, vahana and
key prop must fit fully inside a comfortable 6 percent inner safety margin. Keep animals'
complete bodies, hooves/paws/tails, long instruments/weapons, relevant wheels and full
shrine arches visible when specified. Background painting extends edge to edge; only a
very narrow natural paper fade is allowed. No large blank caption band or lower fifth.
Use dignified devotional proportions, clear silhouettes and a readable action at 360×180.

Constraints: Use the specified counts of figures, arms, hands and objects. Coherent
connected anatomy and plausible anatomical left/right grips; no duplicate or disconnected
hands, limbs or attributes. No new in-image text, letters, pseudo-script, captions, labels,
UI controls, frame, border or watermark. Use this scene's own setting. No modern items,
arbitrary extra main characters, gore or violent injuries.

Scene: [event, source, characters/counts, action, setting, time and emotion]
Iconography and pose: [verified arm counts, attributes, anatomical left/right and grips]
Must remain completely visible: [scene-specific subjects, body parts and props]
Do not include: [scene-specific exclusions]
```

For a precise correction, use the approved image as the edit target and replace the
"ONE NEW" instruction with the exact requested change. Preserve its identity, scene
detail, rendering and 2:1 canvas; inspect the full result again.

## Approved Hanuman pose corrections

- **Crossing the sea:** one gada rests naturally on Hanuman's anatomical **right shoulder**,
  held securely in his **right hand** with a bent elbow. The hand grips the connected shaft
  near his shoulder/collarbone; the mace head extends behind his upper back. His left arm
  reaches forward in the flying action. Exactly two connected arms/hands; preserve both
  feet, complete tail, crown and entire gada inside the banner. Do not revert to a mace
  held in an outstretched backward arm or add a mountain/second mace.
- **Bowing to Rama:** retain the approved gada visibly within the scene while preserving
  Hanuman's bowing/devotional gesture and the approved character arrangement. Follow the
  selected `ram-hanuman-gada-v2` reference for its placement.

These are scene-specific corrections. Do not add a gada or another attribute to every
Hanuman scene merely because the example above contains it.

## Fit, export and reuse checks

1. Inspect the master and the compact 360×180 preview. Verify the whole action, exact
   figure/arm counts, connected hands, left/right grips, faces, crowns, feet, tails, vahanas
   and meaningful props. Compare rendering and detail density with the approved example.
2. Verify the source is truly 2:1, with no cropped subjects, distortion, blank padding or
   caption zone. If it does not fit, recompose/regenerate; do not use cover/focal cropping
   to repair it. Export the complete canvas by proportional downsampling only.
3. Reader delivery uses an optimized **960×480 WebP**. The approved set is about 61–132 KiB
   per banner; use that as a comparison, then inspect the encoded file for lost details.
   Keep its original PNG, exact generation prompt, reference roles and approval record.
4. Reader illustrations remain separate from reading backgrounds. Use one opening banner
   per reading/chapter where applicable; later verse cards begin with text. Daily Bhakti's
   quick verse card remains text-first. Existing reading surfaces are a separate asset type.
5. Present new artwork for visual approval before app activation or R2 publication. After
   approval, publish the optimized file under its content hash before updating its manifest.
   Reuse the existing asynchronous loader, persistent cache and bundled fallback; no new
   startup fetch, blocking image wait, expiry or revalidation of valid cached files.

The reusable **rendering style** can be applied to other image formats, but **2:1 is the
reader-banner contract**, not a universal ratio. Actual kids-story pages follow their own
supported frame (currently 4:5), RULEBOOK §29/§29.1, the authoring checklist and the
`kids-stories-art-style.md` / `story-image-layout-prompt.md` contracts. They also require
scene-specific frame/hash registration and full native narrative/artwork review.

## Provenance

The original detailed Style 3 prompt and four-reference roles are retained in
`docs/evaluations/reading-visuals-2026-10-11/style3-full-set/jobs.json`.
This reusable prompt preserves those requirements while allowing the packaged approved
landscape PNG to supply both style and banner-format reference. The full-set
`approval-decision.json` records the accepted images and requested gada corrections;
`jobs/hanuman-sea-shoulder-gada-v3.json` and `jobs/ram-hanuman-gada-v2.json` retain the
exact correction prompts. `mobile/assets/reader-illustrations/approved.json` pins the
shipped WebP hashes. Existing approval covers those images, not future generated scenes.
