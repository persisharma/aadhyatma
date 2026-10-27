# Panchang day panel — six painted icons (Codex brief)

Run this in Codex (built-in `image_gen`) from the repository root. It paints the six
icons the Panchang day panel still lacks so its tiles can carry the same Storybook
miniatures as Home, More and the Muhurat finder. The approved layout is board **D0**
on the Panchang Redesign canvas: today's tiles unchanged, new warm-gradient
surfaces, one painted icon per tile.

## What already exists (do not regenerate)

| Slot | Shipped icon |
|---|---|
| नक्षत्र tile | `mobile/assets/icons/storybook/nakshatra.png` |
| सूर्य (sun rashi) tile | `storybook/gayatri.png` |
| दिशा शूल tile | `storybook/vastu-disha.png` |
| सूर्योदय | `storybook/surya.png` |
| ब्रह्म मुहूर्त | `storybook/aarti.png` |
| शुभ योग heading | `more-storybook/star.png` |
| आज/कल व्रत card | `storybook/vrat.png` |
| तिथि tile | none: stays the live `CelestialGlyph` moon, which shows the day's real phase |

## Generate these six

Attach `docs/evaluations/storybook-icons-2026-10-06/selected-storybook-reference.png`
(the approved style board) to every generation. For `sunset` and `moonrise`, also
attach `mobile/assets/icons/storybook/surya.png`. Those two are **edits** of it, so the
horizon, line weight and framing match the सूर्योदय icon they sit beside.

Generate one subject per call. Inspect each at 30 logical px beside `surya.png`,
`nakshatra.png` and `vrat.png`, and regenerate any that drift in hue, outline weight
or scale. The three moon subjects (`chandra`, `karana`, `nitya-yoga`) must stay
distinguishable from each other at that size.

The full prompts are in `prompts.json`. Each is the shared prompt from
`docs/evaluations/remaining-icons-2026-10-16/generation-brief.md` followed by its
subject:

1. **`chandra`** — चन्द्रमा tile (the Moon's rashi and चन्द्र वास).
   An ivory crescent moon opening to the right, soft warm-sepia shading on its inner edge and two faint craters, with one small five-pointed muted-gold star in the crescent's opening.
2. **`karana`** — करण tile (half a tithi).
   A round lunar disc lit exactly in half: the left half warm ivory with faint craters, the right half deep warm sepia-brown, split by a straight vertical terminator, under a thin warm-brown outline.
3. **`nitya-yoga`** — नित्य योग tile (the Sun and Moon longitudes joined).
   A matte muted-gold sun disc with short painted rays, partly overlapped in front at its lower left by an ivory crescent moon: the two bodies joined, sun behind moon.
4. **`agni-vaas`** — अग्नि वास tile (where Agni resides, i.e. whether havan is favoured).
   A small square stepped copper havan kund seen slightly from above, three tongues of matte burnt-orange flame rising from it, and two short sticks of samidha wood crossing at its rim.
5. **`sunset`** — सूर्यास्त (an edit of `surya.png`).
   Keep the reference's horizon line, outline weight, canvas and framing identical. Make the sun SETTING: the disc sits lower, more than half below the same horizon line, in a deeper amber-rose pigment, with shorter and fewer rays, and two tiny distant birds in warm brown flying left above the horizon.
6. **`moonrise`** — चंद्रोदय (an edit of `surya.png`).
   Keep the reference's horizon line, outline weight, canvas and framing identical. Replace the sun with an ivory crescent moon rising over the same horizon, with a narrow band of deep warm-sepia dusk behind its lower half (no blue or indigo), and one small muted-gold star at the upper right.

## After generation

1. Save each chosen master as `docs/evaluations/panchang-day-icons-2026-10-27/masters/<name>.png`
   (e.g. `masters/sunset.png`).
2. Write `sources.json` in this folder in the same shape as
   `docs/evaluations/remaining-icons-2026-10-16/sources.json`: name, prompt,
   reference file(s) and their SHA-256, master SHA-256, and the generated-image path.
3. Copy `docs/evaluations/remaining-icons-2026-10-16/export.py` here and point it at this
   folder. Run it to write `mobile/assets/icons/storybook/<name>.png`. The export is the
   same as before: clear alpha < 8, fit the longest visible side to 432 px, centre on a
   512 px square, 256-colour alpha palette. Its manifest entries go in
   `mobile/assets/icons/storybook/manifest.json`.
4. Register the six names in `mobile/src/components/storybookSources.ts`.
5. In `mobile/src/components/__tests__/storybookAssets.test.ts`, give these six their own
   size budget (300 KB). Leave the existing 1.5 MB / 750 KB / 150 KB budgets unchanged.
6. Add a short `README.md` here: what was generated and why, the prompts, any
   regenerations, and a contact sheet (`review.png`) showing the six beside `surya.png`,
   `nakshatra.png` and `vrat.png` at 30 px and 72 px.

Do not change any screen code in this pass. Wiring the icons into the Panchang tiles is
a separate change.
