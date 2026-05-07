# Deity Icons Design

## Goal

Replace the Deity list initials with recognizable symbolic deity icons while preserving the current Vedansh visual style.

## Approved Direction

Use the original "A" direction from the visual companion: compact symbolic attribute icons inside the existing circular saffron gradient medallions.

This means:

- Keep the current DeityCard layout, spacing, card background, gradient avatar, and chevron.
- Replace the two-character Hindi initials with centered symbolic glyphs.
- Use the same warm devotional palette already defined in the app theme.
- Keep icons legible at the current 44px avatar size.

## Icon Set

Use symbolic deity attributes:

- Rama: bow and arrow
- Krishna: bansuri plus a peacock-feather plume, not a full peacock, matching the original A emoji-like style
- Shiva: trishul
- Hanuman: gada
- Durga: lotus
- Ganesha: modak or another compact Ganesha-associated symbol if modak rendering is poor

## Implementation Shape

Extend deity metadata with an icon key or glyph data, then pass it through `DeityIndexScreen` into `DeityCard`.

`DeityCard` should render the icon inside the existing `LinearGradient` avatar. The component should keep the current accessibility label based on the deity name and item count.

Prefer a small project-native icon component or deterministic text glyph mapping over generated bitmap portraits. Do not switch to mini portraits or mantra emblems.

## Error Handling And Fallbacks

If a glyph is missing or renders poorly on the target platform, fall back to the deity initials for that deity rather than leaving a blank avatar.

## Testing

Run TypeScript checking after the code change. If available, inspect the Deity screen in the app or a local preview to confirm the icons are centered, readable, and do not alter card height.
