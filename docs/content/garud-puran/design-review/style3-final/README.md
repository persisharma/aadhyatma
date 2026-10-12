# Garud Puran — saved Style 3 template applied

All nine Garud Puran illustrations were restyled with the built-in image-generation tool on 12 October 2026. Each request used the saved `artifact-template-vedansh-style-3-reader-banner` Hanuman–Sita master as the first, authoritative style/format reference and the existing Garud illustration as the second, scene-preserving edit target.

Open `index.html` for the approved-reference comparison, all nine images and a 360×180 display-size comparison. `final-comparison.png` is the browser-captured overview. These are artwork previews, not native screenshots.

## Provenance

- `approved-style3-reference.png` is an unchanged copy of the saved template master. SHA-256: `631a4f2ea25e90e56c12a7ba1a10da1992a8941228b7704d7ccd6824a4971d42`.
- `template-style-guide.md` preserves the source style guide. Its relative original-repository links are historical context; the retained reference is alongside this document.
- `jobs.json` contains the exact nine initial prompts and input roles. `generation.json` maps these to original PNGs. `framing-correction.json` records the final Babhruvahana edit that moved the complete horse inside the canvas.
- `manifest.json` records the final selected originals, dimensions, bytes and SHA-256 of every WebP.

## Verification and scope

All nine 1774×887 masters were visually inspected for the requested scene, main figure counts, connected anatomy, rendering, framing and lack of image text. The five-preta scene retains one sage plus five spirits; the Pushkar scene retains Sita, Rama, three sages and three ancestor visions; the Vishnu scene retains four arms and one mace beside the seat. These remain interpretive illustrations.

All nine exports are 960×480 WebP, downsampled proportionally with `cwebp -q 84` and no crop/padding. Combined size: **1,433,814 bytes**. The approved reference remains unchanged. The browser loaded all 13 image elements without errors, all natural ratios are 2:1, each of nine selectors displayed its correct asset and the page had no horizontal overflow at the inspected viewport.

The user approved the full set on 12 October 2026 and requested integration and a PR. All nine files now match `mobile/assets/garud-puran/` byte for byte; the asset manifest records that approval. Production CDN manifests and R2 remain unchanged. See `../../INTEGRATION.md` for verification after merging main; earlier native evidence belongs to the preceding artwork set.
