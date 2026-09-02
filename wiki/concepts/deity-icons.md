---
title: Deity Icon Glyph System
type: concept
sources:
  [
    mobile/src/components/DeityIcon.tsx,
    mobile/src/components/deityGlyphs/,
    mobile/src/data/deities.ts,
    mobile/src/data/deities.icon-contract.ts,
  ]
last_verified_date: 2026-07-24
confidence: high
status: current
---

## Summary

Every deity avatar (21 keys) renders as a hand-built React Native `View`-composition glyph — no SVG, no emoji — from `mobile/src/components/deityGlyphs/`, one file per `DeityIconKey`. `DeityIcon.tsx` is a thin router: it looks the key up in a compile-time-**total** `Record<DeityIconKey, ComponentType>` registry, renders the glyph inside a uniform 36×36 dp centered canvas (testID `deity-glyph-<key>`), and transform-scales for other sizes.

## Details

- **Design authority:** design.md §42 (deity icon system), §5 (no emoji/photos), §30 (View-composition, no-SVG convention). Spec history: `docs/superpowers/specs/2026-05-08-deity-icons-design.md` (+ 2026-07 addendum retiring the interim emoji path).
- **Registry totality is the safety net:** adding a deity to `deities.ts` without a glyph file + registry entry fails typecheck. `deities.icon-contract.ts` separately pins each deity id → icon key.
- **Canvas/scaling contract:** glyphs draw at a 36 dp base; `size` prop scales via `transform: [{scale}]` (`Scaled` wrapper, identity at 36). The layout box stays 36×36 at every size — consumers (DeityCard 36-in-44 medallion, TrackCard 36, MiniPlayer 26, NowPlayingScreen 150) center it in fixed frames.
- **Baked palette** (`deityGlyphs/palette.ts`): ink `#733207` strokes (borderWidth ~1.3–2), gold `#D49A35` fills, goldSoft/cream, peacock leafGreen/teal/deepBlue/featherYellow (teal family reused for Ganga's waves), flame. Deliberately NOT theme tokens — sanctioned illustration colors per design.md §42.
- **Fallback:** undefined `iconKey` → first two Devanagari characters of the deity name, never a blank avatar.

## Dependencies

[[overview]] — module map; DeityCard/DeityIndexScreen usage.

## Gotchas

- Emoji are banned here (design.md §5, unqualified since 2026-07). Do not add a new deity by dropping an emoji into `DeityIcon` — draw a glyph file and register it; the total Record enforces this at typecheck.
- Two suns by design: `surya` (Gayatri's eight-ray star) vs `suryadev` (Surya Dev's rising half-disc over a horizon). Keep their silhouettes distinct.
- Four flower glyphs must stay visually distinct: durga (open lotus), lakshmi (coins into lotus cup), radha (closed bud on stem), parvati (round five-petal blossom).
- Keep base-size details ≥ ~1.6 dp strokes / ≥ 2.5 dp dots — MiniPlayer renders at 26 dp (×0.72), where finer detail vanishes; Android renders borderWidth < 1.3 unreliably.
- Component tests assert glyphs render **zero `Text` nodes** across all 21 keys (`DeityIcon.test.tsx` totality loop) plus part-level testIDs for a representative subset.
