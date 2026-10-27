export const lightColors = {
  parchment: '#F3E7C9',
  parchmentSoft: '#F8EFD6',
  parchmentDeep: '#E9D9B1',
  parchmentHighlight: '#F6ECD0',
  parchmentGradientEnd: '#F1E3BF',

  // Primary reading color (verses + English meaning, both scripts). Deepened from
  // #2F1E10 — a warm brown that, against the parchment background and Cormorant
  // Garamond's thin strokes, read as too light for comfortable English reading.
  // #1A0E03 stays inside the warm manuscript palette while lifting contrast to
  // ~15.4:1 (well past WCAG AAA). See colors.contrast.test.ts.
  ink: '#1A0E03',
  inkSoft: '#5A3A1E',
  // Secondary / tertiary text: captions, metadata, and the demoted secondary-
  // language line on cards. Deepened from #8A6A47 — that tan only reached ~4.0:1
  // on the parchment background (below WCAG AA 4.5), so every subtitle read as
  // dull/half-visible. #6E5230 lifts it to ~5.9:1 while staying clearly lighter
  // than inkSoft (8.3:1), so it still reads as a caption, not a peer. See
  // colors.contrast.test.ts.
  inkMuted: '#6E5230',

  saffron: '#B8621B',
  saffronDeep: '#8A3E0B',
  gold: '#A67C34',
  // Utility ink and active navigation sampled from the selected Storybook
  // direction; illustration subjects retain their own painted pigments.
  iconInk: '#6F3F1D',
  iconAccent: '#AD571F',

  divider: 'rgba(138, 62, 11, 0.18)',
  saffronTint: 'rgba(184, 98, 27, 0.12)',
  goldTint: 'rgba(166, 124, 52, 0.14)',

  // Auspicious/avoid signalling for the Muhurat surface (PRD-14 / design.md §2).
  // Kept in the WARM manuscript palette — never green/red. Auspicious reuses the
  // gold tint; `avoid` is a muted terracotta. Both always carry a text label too
  // (design.md §12 — never colour alone).
  //
  // Scope of the warm-only rule: it governs THEME COLOUR AND UI CHROME, which is
  // everything in this file. The one sanctioned exception is the baked deity-glyph
  // illustration palette (`assets/icons/storybook/`, design.md §42),
  // which carries cool peacock/water hues — leafGreen, teal, deepBlue — because
  // they are painted attributes of the art, not signals. Those values must never
  // be pulled into chrome; chrome takes its colour from this file only.
  avoid: '#9E4A2E',
  avoidTint: 'rgba(158, 74, 46, 0.12)',
  // Chip/pill fills for the quality tags (auspicious/avoid) on the Muhurat glance
  // card. The row tints above (0.12–0.14) are too faint to read as a *pill* on the
  // cardActive gradient — a chip needs a fill solid enough to register as its own
  // surface. Deepened to ~0.20/0.22 so the tag reads clearly. See MuhuratGlanceCard
  // and colors.contrast.test.ts (signal text clears AA on the card surface).
  avoidChipBg: 'rgba(158, 74, 46, 0.20)',
  goldChipBg: 'rgba(166, 124, 52, 0.22)',
  // Text ON the avoid chip tint. `avoid` clears AA on the raw card surfaces but
  // NOT composited on `avoidChipBg` over the gradient's dark stop (~3.5:1) — a
  // terracotta-tinted background *lowers* the ratio for dark terracotta text.
  // This deeper cut clears 4.5:1 on the worst-case composite; pinned (with the
  // compositing math) in colors.contrast.test.ts.
  avoidDeep: '#7A3722',

  // Choghadiya strip on the Muhurat card (design.md §33). The two qualities
  // differ in LIGHTNESS, not hue alone — shubh a light gold, tyajya a deeper
  // terracotta — and every segment also prints its name (never colour alone).
  // `*Track` is the not-yet-elapsed remainder of the running segment.
  choghadiyaShubh: '#D2AB5E',
  choghadiyaShubhTrack: '#E8D09A',
  choghadiyaAvoid: '#A85D40',
  choghadiyaAvoidTrack: '#D2A08B',

  // The Panchang sky header (PanchangSky, design.md §33): top → horizon stops.
  // Between sunset and sunrise on a today view it is night — still the warm
  // manuscript palette, deep sepia, never indigo; otherwise a saffron day.
  skyNightTop: '#160A03',
  skyNightUpper: '#2A1508',
  skyNightLower: '#45250E',
  skyNightHorizon: '#5C3214',
  skyDayTop: '#F2C77F',
  skyDayUpper: '#F6D79F',
  skyDayLower: '#F9E6C0',
  skyDayHorizon: '#F7E3B8',
  // Cream type on the night sky. Every text token clears 4.5:1 on its lightest
  // stop, `skyNightHorizon` (muted ≈ 5:1); day type uses ink/inkMuted, which
  // clear it on `skyDayTop`.
  nightInk: '#FFF4DC',
  nightInkSoft: '#E9D8B6',
  nightInkMuted: '#C2AC88',
  nightGold: '#F2C46B',
  nightGoldTrack: 'rgba(242, 196, 107, 0.35)',
  nightAvoid: '#B8694B',
  nightAvoidTrack: 'rgba(184, 105, 75, 0.45)',
  // Glass controls riding the sky (mode switch, chips, round buttons).
  nightGlass: 'rgba(255, 240, 210, 0.10)',
  nightGlassBorder: 'rgba(255, 235, 200, 0.20)',
  nightGlassActive: 'rgba(255, 241, 216, 0.95)',
  dayGlass: 'rgba(255, 250, 238, 0.55)',
  dayGlassBorder: 'rgba(138, 62, 11, 0.16)',
  dayGlassActive: '#FFF9EE',
  // Sky furniture: stars, clouds, the sunset → sunrise arc (travelled / to go)
  // and the horizon hills.
  starLight: '#FFF3D6',
  cloud: 'rgba(255, 251, 240, 0.6)',
  skyArcNight: 'rgba(251, 235, 200, 0.6)',
  skyArcNightRest: 'rgba(251, 235, 200, 0.3)',
  skyArcDay: 'rgba(138, 62, 11, 0.5)',
  skyArcDayRest: 'rgba(138, 62, 11, 0.3)',
  skyHillsNight: 'rgba(15, 7, 2, 0.6)',
  skyHillsDay: 'rgba(184, 98, 27, 0.10)',
  // The sky mark (CelestialGlyph): moon disc + its phase shadow, sun disc, halos.
  moonLight: '#F6E6BC',
  moonShadow: 'rgba(30, 15, 5, 0.88)',
  moonHalo: 'rgba(255, 230, 180, 0.18)',
  sunCore: '#F0A23C',
  sunHalo: 'rgba(240, 162, 60, 0.22)',

  // "NEW" badge — saffron-tinted (primary/active accent → reads as fresh & live),
  // distinct from the muted gold "SOON" badge while staying in the warm palette.
  newBadgeBg: 'rgba(184, 98, 27, 0.16)',
  newBadgeText: '#8A3E0B',

  // The themed artwork is the primary reading surface; the parchment veil only
  // softens it enough to keep verse labels legible without washing it out.
  overlayTop: 'rgba(243, 231, 201, 0.85)',
  overlayUpper: 'rgba(243, 231, 201, 0.55)',
  overlayLower: 'rgba(243, 231, 201, 0.75)',
  overlayBottom: 'rgba(233, 217, 177, 0.95)',

  modalBackdrop: 'rgba(47, 30, 16, 0.55)',
  onPrimary: '#FFFFFF',

  // Media letterbox behind the 16:9 YouTube embed. A video stage is black by
  // convention (not a UI signal), so it sits outside the warm-only chrome rule.
  videoStage: '#000000',
  // YouTube's brand red for the small play-mark on the video CTA — an external
  // brand attribute (like the baked illustration palette), never a UI signal.
  youtube: '#FF0000',

  cardSurface: 'rgba(255, 250, 235, 0.72)',
  // Panchang day-panel tiles, approved board D0.
  panchangTileFrom: '#FFF8EA',
  panchangTileTo: '#F5E4BE',
  panchangTileBorder: 'rgba(166,124,52,0.30)',
  panchangAvoidFrom: '#FBEBDF',
  panchangAvoidTo: '#F0D6C4',
  panchangAvoidBorder: 'rgba(158,74,46,0.28)',
  cardActiveFrom: '#FFF5E0',
  cardActiveTo: '#F5DEAC',
  cardActiveBorder: 'rgba(184, 98, 27, 0.4)',
  // Approved Vrat landing-page treatment, scoped to the catalog surface.
  catalogAccent: '#7A211A',
  catalogSurface: '#FFF6E3',
  catalogBorder: 'rgba(166, 124, 52, 0.28)',
  cardThumbRest: '#F1E0B3',
  cardThumbActiveFrom: '#F8D291',
  cardThumbActiveTo: '#E0A255',

  dotRest: 'rgba(138, 62, 11, 0.25)',

  background: '#F3E7C9',
  surface: '#F8EFD6',
  text: '#1A0E03',
  textMuted: '#6E5230', // semantic alias of inkMuted — keep in sync
  primary: '#B8621B',
  border: 'rgba(138, 62, 11, 0.18)',
} as const;

export type ColorPalette = typeof lightColors;
