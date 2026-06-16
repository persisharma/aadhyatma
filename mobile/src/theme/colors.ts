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

  divider: 'rgba(138, 62, 11, 0.18)',
  saffronTint: 'rgba(184, 98, 27, 0.12)',
  goldTint: 'rgba(166, 124, 52, 0.14)',

  // "NEW" badge — saffron-tinted (primary/active accent → reads as fresh & live),
  // distinct from the muted gold "SOON" badge while staying in the warm palette.
  newBadgeBg: 'rgba(184, 98, 27, 0.16)',
  newBadgeText: '#8A3E0B',

  overlayTop: 'rgba(243, 231, 201, 0.85)',
  overlayUpper: 'rgba(243, 231, 201, 0.55)',
  overlayLower: 'rgba(243, 231, 201, 0.75)',
  overlayBottom: 'rgba(233, 217, 177, 0.95)',

  modalBackdrop: 'rgba(47, 30, 16, 0.55)',
  onPrimary: '#FFFFFF',

  cardSurface: 'rgba(255, 250, 235, 0.72)',
  cardActiveFrom: '#FFF5E0',
  cardActiveTo: '#F5DEAC',
  cardActiveBorder: 'rgba(184, 98, 27, 0.4)',
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
