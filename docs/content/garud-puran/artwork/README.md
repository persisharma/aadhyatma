# Garud Puran artwork

**Approved and bundled:** [All nine banners using the saved Style 3 template](../design-review/style3-final/index.html). The user approved this final set on 12 October 2026 and requested integration and a PR. The bundled WebPs exactly match the approved review hashes.

Nine interpretive illustrations, 960 × 480 WebP, quality 84, proportional reduction only, no crop or padding. Combined size: **1,433,814 bytes**. The app reuses its existing shared parchment; no duplicate paper asset is needed. Typography stays in the app; images contain no lettering.

## Shared design standard — user selection, 12 October 2026

The user selected the **latest approved reader artwork** so banner design stays consistent throughout the app. Use the saved personal **Vedansh Style 3 Reader Banner** template (`artifact-template-vedansh-style-3-reader-banner`) as the authoring standard. Its retained Hanuman–Sita master is the style/format reference; scene content remains specific to each Garud Puran reading. Preserve rich detail, fine warm outlines, layered painterly shading, muted colour and matte gold. Do not flatten or simplify these banners to imitate the older portrait Krishna pages.

Shared reader contract: exact 2:1 opaque scene, optimized 960×480 WebP, full-canvas contain at a maximum 360×180 pt, complete subjects, no caption band or in-image text, opening-page placement, quiet parchment and the shared leaf divider. Follow the saved template's subject safety margin for future generation. This applies to reader banners; actual kids-story pages retain their separate supported format.

The final generation jobs used the retained Hanuman–Sita master directly, with the preceding Garud images as scene references. Earlier portrait and landscape jobs remain historical provenance only.

| Asset | Readings | Scene and boundary |
|---|---|---|
| cover.webp | 1, 3, 4 | Garuda listening to Vishnu; a general dialogue illustration |
| daan.webp | 2 | Food and water offered to a traveller; a symbolic example, not a named incident |
| babhruvahana.webp | 5 | King and Sudeva beside a banyan and lake; does not assert an edition-specific kingdom |
| five-pretas.webp | 6 | Santaptaka and five departed male spirits; graphic violence omitted |
| viravahana.webp | 7 | King seeking Vasishtha’s guidance; ritual is explained in prose |
| sita-ancestors.webp | 8 | Rama serves sages, Sita withdraws, ancestors are suggested above; Pushkar episode, not Gaya |
| ancestors.webp | 9, 10 | Offerings and a riverbank; a reflective still life, not a procedural diagram |
| yama.webp | 11 | Dignified Dharmaraja and Chitragupta; no punishment imagery |
| vaitarani.webp | 12 | Symbolic river and cow; not a literal illustration of the text’s graphic river description |

`manifest.json` pins original generation IDs, encoded filenames, bytes and SHA-256 hashes. `../design-review/style3-final/jobs.json`, `generation.json` and `framing-correction.json` record the final prompts and source references. `generation-prompts.json` is historical and describes the superseded portrait set, not an authoring template. Original PNGs remain in the Codex generated-image directory; app assets live at `mobile/assets/garud-puran/`. Both native reader and preview show the scene only on the opening page; continuation pages reserve no art space. The native frame is at most 360 × 180 pt and displays the full scene. The shared `ReadingArtwork` / `ReadingBanner` components supply the same compact banner and divider as current-main prose readers. No remote downloads, generated audio or video are needed.
