---
title: Shared Storybook Icon System
type: concept
sources: [mobile/src/components/CelestialChakra.tsx, mobile/assets/decorations/celestial-chakra/manifest.json, docs/evaluations/celestial-chakra-2026-10-06/README.md, mobile/src/components/MoreIcon.tsx, mobile/src/screens/MoreScreen.tsx, mobile/assets/icons/more-storybook/manifest.json, docs/evaluations/storybook-icons-2026-10-06/more-alignment/README.md, mobile/src/components/DeityIcon.tsx, mobile/src/components/deityArtwork.ts, mobile/src/components/storybookSources.ts, mobile/src/components/StoryIcon.tsx, mobile/src/components/AppIcon.tsx, mobile/assets/icons/storybook/manifest.json, mobile/src/navigation/tabBarIcons.tsx, design.md, docs/evaluations/storybook-icons-2026-10-06/README.md, design-qa.md, mobile/src/screens/HomeScreen.tsx, mobile/src/components/CategoryCard.tsx, mobile/src/utils/homeLayout.ts, mobile/src/components/ReaderHeader.tsx, mobile/src/components/BookmarkButton.tsx, mobile/src/components/ShareButton.tsx, mobile/src/components/HomeWordmark.tsx, mobile/src/components/TodayRecommendationsRow.tsx, docs/evaluations/storybook-icons-2026-10-06/size-audit/README.md]
last_verified_date: 2026-10-06
confidence: high
status: current
---

## Summary

The native app uses 39 bundled transparent Storybook assets for Home/deity subjects and 16 additional painted utility assets for More (55 total). Shared Phosphor glyphs remain for reader and navigation controls. This replaces the View-composition deity registry and font/emoji approximations on the changed surfaces.

## Details

- `storybookSources.ts` statically requires local PNGs; `StoryIcon` displays them as decorative images. No remote icon fetches or duplicate accessible labels.
- `deityArtwork.ts` covers all 21 existing keys with a total typed mapping. `deities.icon-contract.ts` still pins deity IDs to semantic attributes.
- `DeityIcon` retains a 36×36 layout box and transform scaling for 26/36/150dp consumers. Unknown keys retain caller text fallback.
- Home category/Discover cards, FOR TODAY, library/Search thumbnails, audio filter chips and More's profile/feature subjects reuse the Home art registry. Text thumbnails use the first tagged deity attribute (category art as fallback). Category frames remain 36×32 with 44dp compact artwork. Home uses 62.7dp art (about 53dp visible) in its original 72dp tiles: a 5% reduction from 66dp. All sixteen subjects stay centered regardless of NEW state. Home's NEW cue keeps its original saffron-tint pill with deep-saffron 11pt text / 13pt line height, inside the tile at top 2dp and right 6dp. Normal-text tiles keep 72dp height. Above fontScale 1.2, Home increases every tile uniformly to clear the filled badge row, allows two caption lines, and keeps 62.7dp artwork centered. Dense indexes keep their original dimensions.
- `MoreIcon` statically maps nineteen settings subjects to sixteen local painted assets plus the existing lotus, compass and offering bowl. All use a 30dp image canvas in the same non-shrinking 38dp tile. The profile's 52dp disc is centered in a 38dp column with a 32dp Om, aligning its icon center and label start with every row. Bell/alarm/saved reconstruct the selected board's settings artwork; thirteen other drawings extend the palette. Fixed 17dp chevron columns and bounded copy keep long values inside the row. Above fontScale 1.2, full labels wrap and values stack below them; the profile summary wraps too. Exact prompts, source/master/file hashes and centered visible bounds are in the More manifest.
- Search/ask doors, wishlist controls, share destination rows, reader audio buttons and japam playback reuse `AppIcon`. Phosphor icons use direct per-icon imports, preserving the startup budget. `AppIcon` uses theme tint and regular/fill/duotone weights; the parent control owns behavior and accessibility.
- The original filled Bhajan note stays. Bhakti/Panchang use separate broad trident and sun/moon silhouettes from the selected board, instead of a detailed deity trident/full sun approximation. The animated 12-petal routine completion mark stays; the nudge uses the selected two-leaf olive sprout.
- `manifest.json` records dimensions, normalized-file hashes, master hashes, exact selected-reference hash and crop provenance for23 corrected subjects.
- User review exposed shade/detail drift in the first generic recreations. Corrected assets use enlarged crops of exact Option1 as image_gen input, preserving matte burnt-ochre Om/diamond dot, smooth beads, Japa’s large lower-left pendant, Kundali house marks, layered folios and muted pigments. Do not accept a broad family resemblance as source fidelity.
- Utility ink is consistently `iconInk`; active navigation icons/saved accents use `iconAccent`. Active tab labels use `saffronDeep` for 6.60:1 contrast over `parchmentSoft`; labels are 11pt and explicitly allow system scaling up to 1.4x, with extra tab-bar height and full localized navigation titles. More's row illustrations preserve their painted pigments; its navigation chevrons use `iconInk`.

## Celestial decorations

The chakra family is separate from category/deity meanings. `CelestialChakra.tsx` statically requires two alpha PNGs in `assets/decorations/celestial-chakra/`: one detailed 1024px wheel reused by Home's Today card and calendar-mode Panchang, plus one simplified 512px seal used only in the guest Jyotish introduction. Catalog/Jyotish keep the previous geometric background; Create Kundali keeps its house-chart tool icon. All three decorations are static, non-interactive and hidden from accessibility, and do not represent calculated chart positions.

The Home ornament clips in its own absolute layer rather than clipping TodayStrip's shadow-bearing card. The shared asset manifest caps both drawings below 300KB and records final hashes/dimensions/centered bounds; per-asset provenance stores exact built-in Image Gen prompts and master hashes. Indexed-alpha packaging retains transparency and reduces the two PNGs to 274,392 bytes. `CelestialChakra.test.tsx` checks accessibility/touch isolation, and `celestial-chakra-smoke.yaml` covers the real native route and mode switches. Design specifications are in §33, §48 and §51c; source targets and installed evidence live in `docs/evaluations/celestial-chakra-2026-10-06/`.

## Dependencies

[[overview]] · [[daan-punya]] · design.md §5/17/42.

## Gotchas

- Keep full eight-ray Gayatri sun distinct from Surya's rising half-disc.
- Durga open lotus, Lakshmi coin lotus, Radha closed bud and Parvati five rounded petals must stay distinct.
- Navagraha is exactly nine plain discs with gold center; no planetary letters. Daan's bowl has exactly three seed-shaped offerings, without payment symbols.
- Cool illustration colors belong to attributes only; app chrome uses theme tokens.
- Never import the Phosphor runtime barrel. Its direct modules require the `react-native-svg` className type augmentation and Jest transform allowance.
- The single-akshara thumb DATA constraint remains even though library cards now display artwork.
- `.maestro/storybook-icons-smoke.yaml` checks accessible routing and reader bookmark controls, including the current Home kids-story shelf door. Visual QA separately checks actual artwork at native size.
- Artwork bounds, layout frames and touch targets are different measurements. A large image does not make a small enclosing Pressable accessible; React Native hitSlop is limited by its parent bounds. Reader bookmark/share retain 34dp visible circles inside real 48×48dp Pressables; ReaderHeader keeps its 44dp visible back circle inside the same minimum target. VersePage centers the verse pill against the larger action row. These numeric targets do not certify complete screen-reader or physical-device accessibility.

The sizing follow-up implements `homeLayout.ts` with subscribed `useWindowDimensions()` and safe-area width. Home content is capped at 800dp; normal text uses three phone / five tablet columns (tablet threshold 640dp), enlarged text uses two phone / three tablet columns. Daan spans the actual grid width. Search is an inline minimum-48dp row below the wordmark and uses the shared first-tap controller. Decorative Om/wordmark geometry stays fixed while the tagline scales; enlarged FOR TODAY cards grow and wrap their full titles. Today headlines/chips and inline Routine titles also reflow at enlarged text. Post-change native captures and limitations are recorded in `docs/evaluations/storybook-icons-2026-10-06/post-change/README.md`; the original size audit remains historical evidence of the issues.
