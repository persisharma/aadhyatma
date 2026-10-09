# Reusable request: story images without wasted space

Use for a new illustrated story section or a layout regression. Replace `[SECTION NAME / SCREEN]`. Contract: [RULEBOOK §29.1](../../RULEBOOK.md), [design.md §76](../../design.md), [current image-generation template](kids-stories-art-style.md), and [authoring checklist](kids-story-pacing/authoring-checklist.md).

```text
Fix the illustrated cards in [SECTION NAME / SCREEN] using the existing app design and RULEBOOK §29.1 / design.md §76. Refer to KidsStoryArt.tsx, KidsStoryReaderScreen.tsx and kidsStoryArtFrames.json as the shared precedent.

Inspect every scene and cover, the source image at full size, and the actual native layout. Separate blank pixels inside the asset from aspect-ratio letterboxing, fixed-height wrappers, excessive padding and duplicate safe-area insets. Remove unnecessary empty space; preserve all important faces, hands, feet, clothing, objects, water and supporting characters.

Use aspect-preserving rendering. Trim only a visually reviewed empty band, based on each image's painted boundary. Record that image's frame and SHA-256; use full height when no trimming is needed. Never copy another story's crop percentage or crop/shrink important content because a caption is longer. The current KidsStoryArt assumes 4:5; another source ratio requires an explicit, verified renderer adaptation.

Aim for the complete image plus a short Standard caption to fit one viewport where practical. Remove padding-only scroll and duplicate bottom safe-area space when the tab bar already handles it. Keep text readable; allow vertical scrolling for genuinely longer captions, Large text and ending sources. Preserve horizontal paging and the current page during language changes.

For new/replacement artwork, use the current kids-stories-art-style.md template. Do not request a blank lower fifth, caption zone, black/white/parchment band or oversized margins. Compose the complete scene compactly with modest breathing room and a narrow natural edge fade. Regenerate/recompose when necessary; never sacrifice required scene details to force a crop.

Verify every native page at Standard and Large in all supported story languages. Check shortest/longest captions, lower-edge figures, source endings, vertical/horizontal gestures and locale switching. Show post-change native screenshots and report which cards legitimately still need scroll. Run relevant asset/reader checks and record incomplete editorial/device validation explicitly.
```

Generation-specific visual language and scene instructions remain in the shared art-style document.
