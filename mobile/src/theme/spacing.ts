export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  screenGutter: 28,
  // Reader/chapter surfaces sit on a narrower gutter than the 28 catalog gutter:
  // a reading column wants more line length, and every reader/chapter top bar and
  // body had independently converged on 22. Blessed as a token so the ~30 reader
  // screens share one value instead of re-typing it (design.md §5).
  readingGutter: 22,
  cardGap: 12,
} as const;

// Corner radii — a single 4-step scale (10 · 14 · 18 · 22) plus the pill.
// `xl` is both the DeityCard card radius and half of the 44pt circular control
// (back buttons), which is where the vast majority of real usage sits. Values
// below `sm` are geometric (a 6px dot at radius 3 is a circle, not a card
// corner) and are intentionally not tokenised.
export const radii = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 22,
  pill: 999,
} as const;

export type SpacingScale = typeof spacing;
export type RadiiScale = typeof radii;
