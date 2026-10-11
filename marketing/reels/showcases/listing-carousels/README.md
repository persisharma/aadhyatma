# Separate feature carousels from listing assets

The user requested separate carousels for every feature, reusing the existing listing assets. This creates 10 feature sets in both Hindi and English: Panchang, Kundali, illustrated stories, Gita, Naam Japa, Vrat, Sankalp, Guna Milan, Bhajans and daily practice.

Each set contains three 1080×1350 cards: the existing listing visual, a simple use case, and an invitation to explore the feature. The complete listing art remains visible on every card without cropping, invented UI or replacing baked-in captions. Hindi uses Hindi listing assets, and English uses English assets. A caption file accompanies each set.

The source is the completed listing kit's `assets/ios/ipad-13/{hi,en}`: its 3:4 composition fits the carousel canvas while preserving UI and caption visibility. This is a promotional carousel built from iPad listing visuals, not a claim that it depicts a phone. Capture provenance remains as documented in the 1.5.0 release record. No fresh capture, AI image generation, religious text, video or voiceover is created by this workflow.

Run from the repository root, with the existing mobile font dependencies and Playwright/Chromium available:

```sh
node marketing/reels/showcases/listing-carousels/build.mjs
```

Set `NODE_PATH` if Playwright is installed outside the repo. The local 11 October listing kit must exist at the `source` path in `content.json`; override with `VEDANSH_LISTING_ASSETS` pointing to a directory containing `hi` and `en` folders. An optional first command argument chooses another output directory. Generated cards, captions, gallery and hashes are under the git-ignored `marketing/reels/out/listing-carousels/`. ZIP packaging is a delivery step outside this renderer.
