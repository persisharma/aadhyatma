---
title: Stories for Kids
type: subsystem
sources: [mobile/src/screens/HomeScreen.tsx, mobile/src/components/KidsStoriesHomeCard.tsx, mobile/src/screens/KidsStoryLibraryScreen.tsx, mobile/src/screens/KidsStoryDeityScreen.tsx, mobile/src/screens/KidsStoryReaderScreen.tsx, mobile/src/data/kidsStories/index.ts, mobile/src/data/kidsStories/krishna-janma.json, mobile/src/components/KidsStoryArt.tsx, mobile/src/navigation/HomeStackNavigator.tsx, docs/content-parity/kids-stories-art-style.md]
last_verified_date: 2026-10-06
confidence: high
status: current
---

## Summary

Home has a Stories for Kids card with a deity-neutral picture-book icon. It opens the deity catalog (Krishna, Ganesha, Hanuman), then a deity's story shelf, then the illustrated paged reader. Only Krishna's birth story is published; the Kaliya Nag card is a disabled plan, and the other two shelves state that stories are forthcoming.

## Details

- `KidsStoriesHomeCard` sits between Categories and Discover. Its small bundled icon hints at all three deity shelves; it does not load story JSON on Home's static launch path.
- `KidsStoryLibraryScreen` lists `storyDeities` with the shared `DeityCard` (glyph, active gradient and bilingual title hierarchy) and derives published story counts from `storiesForDeity`. Editorially authored Gujarati/Kannada names override generic transliteration. Every shelf is navigable, including the empty ones.
- `KidsStoryDeityScreen` filters `kidsStories` by `deityId`. Published cover cards use the active library palette and bilingual title hierarchy and open `KidsStoryReader`; `plannedStories` entries display without a press action or reader route. Back follows the same Home stack: reader → shelf → deity catalog → Home.
- `krishna-janma.json` contains the four-language story, stable page ids, artwork keys and source notes. `KidsStoryArt` maps those keys to seventeen bundled WebP files: one cover and sixteen distinct scenes. Wedding, threat, imprisonment, Balarama, prayer and return use `kj-12`–`kj-17`. App and browser asset copies must match byte-for-byte; the data test guards distinct scenes and prototype parity. Promise-scene palms and Devi's eight connected arms/held objects have been corrected. The closing “Safe in Gokul” page uses its own `kj-11.webp`, showing Yashoda and baby Krishna, while the cover remains the prison birth scene.
- Browser prototypes live in `docs/kids-stories-home-prototype.html`, `docs/kids-stories-catalog-prototype.html` and `docs/kids-stories-prototype.html`. The reusable illustration recipe is `docs/content-parity/kids-stories-art-style.md`.

## Gotchas

- Planned titles are catalog teasers, not published stories. Do not add them to `kidsStories` until sourced text, all translations, artwork and review are ready.
- Keep story text as native text below text-free art. Share artwork across languages, preserve the page index when changing language, and inspect the final image against its actual page text.
- The library and reader routes are lazy on the Home stack. Re-run `mobile/scripts/gen-route-graph.mts` after changing navigation edges and keep the launch graph test green.
