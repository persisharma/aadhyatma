---
title: Shared Storybook Icon System
type: concept
sources: [mobile/src/components/DeityIcon.tsx, mobile/src/components/deityArtwork.ts, mobile/src/components/storybookSources.ts, mobile/src/components/StoryIcon.tsx, mobile/src/components/AppIcon.tsx, mobile/assets/icons/storybook/manifest.json, mobile/src/navigation/tabBarIcons.tsx, design.md, docs/evaluations/storybook-icons-2026-10-06/README.md, design-qa.md, mobile/src/screens/HomeScreen.tsx, mobile/src/components/CategoryCard.tsx, mobile/src/utils/homeLayout.ts, mobile/src/components/ReaderHeader.tsx, mobile/src/components/BookmarkButton.tsx, mobile/src/components/ShareButton.tsx, mobile/src/components/HomeWordmark.tsx, mobile/src/components/TodayRecommendationsRow.tsx, docs/evaluations/storybook-icons-2026-10-06/size-audit/README.md]
last_verified_date: 2026-10-06
confidence: high
status: current
---

## Summary

The native app uses 39 bundled transparent Storybook assets for categories and deity attributes, with a shared Phosphor family for utility controls. This replaces the View-composition deity registry and font/emoji approximations on the changed surfaces.

## Details

- `storybookSources.ts` statically requires local PNGs; `StoryIcon` displays them as decorative images. No remote icon fetches or duplicate accessible labels.
- `deityArtwork.ts` covers all 21 existing keys with a total typed mapping. `deities.icon-contract.ts` still pins deity IDs to semantic attributes.
- `DeityIcon` retains a 36×36 layout box and transform scaling for 26/36/150dp consumers. Unknown keys retain caller text fallback.
- Home category/Discover cards, FOR TODAY, library/Search thumbnails, audio filter chips and More reuse the same art registry. Text thumbnails use the first tagged deity attribute (category art as fallback). Category frames remain 36×32 with 44dp compact artwork. Home uses 62.7dp art (about 53dp visible) in its original 72dp tiles: a 5% reduction from 66dp. All sixteen subjects stay centered regardless of NEW state. Home's NEW cue keeps its original saffron-tint pill with deep-saffron 11pt text / 13pt line height, inside the tile at top 2dp and right 6dp. Normal-text tiles keep 72dp height. Above fontScale 1.2, Home increases every tile uniformly to clear the filled badge row, allows two caption lines, and keeps 62.7dp artwork centered. Dense indexes keep their original dimensions.
- Search/ask doors, wishlist controls, share destination rows, reader audio buttons and japam playback reuse `AppIcon`. Phosphor icons use direct per-icon imports, preserving the startup budget. `AppIcon` uses theme tint and regular/fill/duotone weights; the parent control owns behavior and accessibility.
- The original filled Bhajan note stays. Bhakti/Panchang use separate broad trident and sun/moon silhouettes from the selected board, instead of a detailed deity trident/full sun approximation. The animated 12-petal routine completion mark stays; the nudge uses the selected two-leaf olive sprout.
- `manifest.json` records dimensions, normalized-file hashes, master hashes, exact selected-reference hash and crop provenance for23 corrected subjects.
- User review exposed shade/detail drift in the first generic recreations. Corrected assets use enlarged crops of exact Option1 as image_gen input, preserving matte burnt-ochre Om/diamond dot, smooth beads, Japa’s large lower-left pendant, Kundali house marks, layered folios and muted pigments. Do not accept a broad family resemblance as source fidelity.
- Utility ink is consistently `iconInk`; active navigation icons/saved accents use `iconAccent`. Active tab labels use `saffronDeep` for 6.60:1 contrast over `parchmentSoft`; labels are 11pt and explicitly allow system scaling up to 1.4x, with extra tab-bar height and full localized navigation titles. More no longer changes utility tint row by row.

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
