Vedansh · Storybook icons

# Daan-Punya seva icon brief (10 painted miniatures)

Ten painted icons to replace the interim flat SVG line-art (`../prototype/CauseIcon.dc.html`) in
the दान-पुण्य guide. Every other list in the app already uses the Storybook miniatures, so these
must look like they came from the same set. Subjects are final (reconciled with Codex, 2026-11-20
— see `README.md`).

## Attach to every generation

**Style reference (required).** `../../storybook-icons-2026-10-06/selected-storybook-reference.png`
— the approved "Storybook miniatures" board every current icon was made from. Match its style; do
not copy a subject from it.

**Also place beside these shipped icons for palette/line-weight** (and to avoid collisions):
`mobile/assets/icons/storybook/daan.png` (a bowl of offerings — the new icons must NOT be another
bowl), `granth.png` and `sanskar.png` (books — the new icons must NOT be a book), `vrat.png`,
`muhurat.png`.

## Shared prompt (verbatim from the app's icon brief — do not alter)

```
Create ONE production icon asset on a truly transparent RGBA background. Reference role: the supplied image is the approved Storybook miniatures style board — match its style exactly, but paint the NEW subject described below; do not copy any subject from the board. Match the reference matte earthy burnt ochre, muted gold/brass, warm brown outlines, subtle hand-painted shading and delicate grain. Crisp simple shapes must read at 25 logical pixels. Center the visible bounding box exactly in a square canvas; generous equal transparent margins; the subject occupies about 78% of the canvas in its longest dimension. Flat front-facing miniature, no surrounding frame, no tile, no badge, no ground shadow, no scenery, no cast shadow, no checkerboard, no text, letters, numerals, currency signs or labels. Do not change the palette to shiny yellow, vivid orange or glossy 3D. Subject:
```

## Subjects

1. **anna** — food · `seva-anna.png`
   A standing sheaf of ripe wheat ears tied near the middle with a simple cord, ears fanning
   upward. Grain, not a bowl.
   > Full prompt: `<shared prompt>` A standing sheaf of ripe wheat ears tied near the middle with a simple cord, ears fanning upward. Grain, not a bowl.

2. **gau** — cow · `seva-gau.png`
   A calm standing zebu cow seen from the side, with a clear shoulder hump and short curved horns,
   and a single marigold garland on its neck. No background, no people.
   > Full prompt: `<shared prompt>` A calm standing zebu cow seen from the side, with a clear shoulder hump and short curved horns, and a single marigold garland on its neck. No background, no people.

3. **bal** — children · `seva-bal.png`
   A child's cloth shoulder satchel with a simple buckled flap and a short strap. One bag only;
   no slate, no books.
   > Full prompt: `<shared prompt>` A child's cloth shoulder satchel with a simple buckled flap and a short strap. One bag only; no slate, no books.

4. **vriddha** — elders · `seva-vriddha.png`
   A curved-handle wooden walking stick standing upright, with a pair of round spectacles hung
   over the handle. The cane is the main shape.
   > Full prompt: `<shared prompt>` A curved-handle wooden walking stick standing upright, with a pair of round spectacles hung over the handle. The cane is the main shape.

5. **vidya** — learning · `seva-vidya.png`
   A small brass inkpot with a reed pen resting diagonally across its mouth. No book, no paper,
   no letters.
   > Full prompt: `<shared prompt>` A small brass inkpot with a reed pen resting diagonally across its mouth. No book, no paper, no letters.

6. **arogya** — health · `seva-arogya.png`
   A brass mortar with its pestle standing inside, and two tulsi leaves beside it. No red drop,
   no cross symbol. Must not read as a plain bowl.
   > Full prompt: `<shared prompt>` A brass mortar with its pestle standing inside it, and two tulsi leaves beside it. No red drop, no cross symbol, no plain bowl shape.

7. **vastra** — clothing · `seva-vastra.png`
   One neatly folded white cotton cloth with a saffron border visible along the top fold. A single
   folded piece; not a stack, not a book.
   > Full prompt: `<shared prompt>` One neatly folded white cotton cloth with a saffron border visible along the top fold. A single folded piece; not a stack, not a book.

8. **jeev** — animals/birds · `seva-jeev.png`
   A small round twig nest with a single sparrow perched on its rim. No water bowl, no dish.
   > Full prompt: `<shared prompt>` A small round twig nest with a single sparrow perched on its rim. No water bowl, no dish.

9. **aapada** — disaster relief · `seva-aapada.png`
   A simple tarpaulin shelter stretched over two upright poles, forming a bold A-frame tent. A few
   strong shapes only; no hut walls, no grain sack, no people.
   > Full prompt: `<shared prompt>` A simple tarpaulin shelter stretched over two upright poles, forming a bold A-frame tent. A few strong shapes only; no hut walls, no grain sack, no people.

10. **seva** — service · `seva-seva.png`
    A short traditional hand-broom (jhāḍū) of bound straw, tied at the neck, standing with the
    bristles fanning at the bottom and the handle up.
    > Full prompt: `<shared prompt>` A short traditional hand-broom of bound straw, tied at the neck, standing with the bristles fanning at the bottom and the handle up.

## Acceptance checks (reject and regenerate if any fails)

- Background is truly transparent: all four corners alpha 0; no checkerboard, tile, disc or frame.
- No text, letters, numerals or symbols other than those described.
- **Distinct from shipped icons at 32 px:** none of the ten reads as `daan.png` (bowl of
  offerings), `granth.png` or `sanskar.png` (books). In particular `arogya` must not read as a
  plain bowl.
- **Distinct from each other at 32 px:** `anna` (wheat sheaf, ears up, grain) and `seva` (broom,
  straw bristles, handle up) must be unmistakable from one another. `bal` (satchel) ≠ `vastra`
  (folded cloth).
- Palette matches the current icons placed side by side: matte burnt ochre, muted brass, warm
  brown outlines. No shiny yellow, vivid orange, glossy 3D, or drop shadows.
- Deliver per file: the master PNG and the exact prompt used. The app team exports to the house
  format (512×512 PNG, 256-colour alpha palette, longest visible side 432 px, equal margins, alpha
  below 8 cleared) and records it in `mobile/assets/icons/storybook/manifest.json` (or the
  daan-specific icon map used by the implementation).

## What to send back

For each subject: the master PNG named exactly as listed (`seva-<id>.png`) and the exact prompt
used. The app team handles the 512×512 export and the manifest entry.
