# Icon brief — Muhurat occasions and Vastu doors (2026-10-16)

Fifteen painted icons are needed to replace the last letter tiles in the app (गृ, वा, ना … on the Muhurat finder; दि / घ on the Vastu doors). Every other list already uses the Storybook miniatures; these subjects have no painting yet.

## What to attach to every generation

- **Style reference (required):** `docs/evaluations/storybook-icons-2026-10-06/selected-storybook-reference.png`, the approved "Option 1 Storybook miniatures" board that every current icon was made from. Match its style; do not copy a subject from it.
- **Optional neighbours for consistency:** `mobile/assets/icons/storybook/muhurat.png`, `sanskar.png`, `vrat.png`. The new icons sit in the same lists.

## Shared prompt (prefix every subject with this)

> Create ONE production icon asset on a truly transparent RGBA background. Reference role: the supplied image is the approved Storybook miniatures style board — match its style exactly, but paint the NEW subject described below; do not copy any subject from the board. Match the reference matte earthy burnt ochre, muted gold/brass, warm brown outlines, subtle hand-painted shading and delicate grain. Crisp simple shapes must read at 25 logical pixels. Center the visible bounding box exactly in a square canvas; generous equal transparent margins; the subject occupies about 78% of the canvas in its longest dimension. Flat front-facing miniature, no surrounding frame, no tile, no badge, no ground shadow, no scenery, no cast shadow, no checkerboard, no text, letters, numerals, currency signs or labels. Do not change the palette to shiny yellow, vivid orange or glossy 3D. Subject:

## Subjects

| # | File | Used for | Subject (append to the shared prompt) |
|---|---|---|---|
| 1 | `occasion-griha-pravesh.png` | गृह प्रवेश · Griha Pravesh | A front-facing carved wooden doorway with a mango-leaf toran across the lintel, and a brass kalash topped with mango leaves and a coconut standing on the threshold. Only the doorway, not a whole house; no people. |
| 2 | `occasion-bhumi-pujan.png` | भूमि पूजन · Bhumi Pujan | A small square plot of tilled brown earth with a brass kalash (mango leaves, coconut) at its centre, one fired clay brick beside it and a single marigold on the soil. No tools, no people, no building. |
| 3 | `occasion-vahan.png` | वाहन क्रय · Vehicle Purchase | A small modern family car seen from the front three-quarter, painted in the same matte miniature manner (burnt-ochre body, brass trim, warm brown outline), with a marigold garland over the bonnet and a small kumkum tilak mark on it. Simple rounded silhouette, no logo or number plate. |
| 4 | `occasion-vyapar.png` | व्यापार आरम्भ · Starting a Business | A closed red cloth-bound account ledger (bahi-khata) tied with a cord, with a small brass hand balance (two pans) resting beside it. Blank cover, no writing. |
| 5 | `occasion-sampatti.png` | सम्पत्ति क्रय · Property Purchase | One large antique brass key with an ornate bow, tied with a red-and-yellow sacred thread (mauli). Nothing else. |
| 6 | `occasion-swarna.png` | स्वर्ण क्रय · Gold Purchase | A short stack of three plain gold coins beside one plain gold bangle, matte muted gold, warm brown outlines. No currency marks, no sparkle effects. |
| 7 | `occasion-yatra.png` | यात्रा · Travel | A cloth travel bundle (potli) tied to the top of a wooden walking staff, with a small brass water lota hanging below it. |
| 8 | `occasion-namkaran.png` | नामकरण · Naming Ceremony | A small wooden cradle (palna) with a folded soft cloth inside and a marigold garland along its rail. No baby. |
| 9 | `occasion-vidyarambh.png` | विद्यारम्भ · Starting Education | A blank wooden writing slate (patti) with a chalk stick, and a small brass inkpot with a reed pen beside it. The slate stays blank — no letters. |
| 10 | `occasion-mundan.png` | मुंडन · Mundan | A small brass bowl holding one soft curl of dark hair, with a few blades of durva grass, on a folded turmeric-yellow cloth. No razor, no child. |
| 11 | `occasion-annaprashan.png` | अन्नप्राशन · Annaprashan | A small silver bowl of rice kheer with a silver spoon resting on its rim, set on a piece of banana leaf. |
| 12 | `occasion-karnavedha.png` | कर्णवेध · Karnavedha | A pair of tiny plain gold ear studs resting on one green betel leaf. |
| 13 | `occasion-upanayana.png` | उपनयन · Upanayana (Janeu) | A neatly coiled white sacred thread (yajnopavita) with its knot visible, resting on one green betel leaf. |
| 14 | `vastu-disha.png` | वास्तु दिशा door | A flat round brass direction dial with eight evenly spaced points and a slim needle; only the north point carries a small red tip. It must read as an instrument — not a wheel, chakra or sun. No letters. |
| 15 | `ghar.png` | मेरा घर · Measure the home | A small square village house front with a sloping tiled roof and one door, standing on a faint 3×3 square grid (the vastu mandala) drawn on the ground. Distinct from #1 (doorway) and #5 (key). |

## Acceptance checks (reject and regenerate if any fails)

1. Background is truly transparent: all four corners have alpha 0, and there is no checkerboard, tile or frame.
2. No text, letters, numerals or symbols other than those described.
3. Each icon can be told apart from its neighbours at 32 px: #1 doorway, #5 key and #15 house must not read as one another, and #14 must not read as the chakra or sun icons.
4. The palette matches the current icons placed side by side: matte burnt ochre, muted brass, warm brown outlines. No shiny yellow, vivid orange, glossy 3D or drop shadows.
5. Deliver for each file: the master PNG and the exact prompt used. The app team exports it to the house format (512 × 512 PNG, 256-colour alpha palette, longest visible side 432 px, equal margins, alpha below 8 cleared) and records it in `mobile/assets/icons/storybook/manifest.json`.

## Integration status

All fifteen subjects are bundled and integrated, alongside two naming browse paintings. See [retained masters and review](../evaluations/remaining-icons-2026-10-16/README.md). Muhurat/Vastu screen-level letter exceptions have been removed; only actual numeric date content is allowed. Native Standard/Large visual review remains pending.

## Wiring (completed)

- Add the files to `mobile/assets/icons/storybook/` and `storybookSources.ts`.
- `MuhuratFinderScreen`: replace `OCCASION_GLYPH` with an occasion → icon map rendering `StoryIcon`.
- `MuhuratResultsScreen` (`दि`, `घ`) and `VastuDishaScreen` (`घ`): render `vastu-disha` / `ghar`.
- Remove these three screens from `LETTER_TILE_EXCEPTIONS` in `mobile/src/components/__tests__/paintedThumbs.test.ts`.
